import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate, getAccessibleUserIds } from '@/lib/rbac';

// GET /api/admin/dashboard — Real dashboard stats with RBAC
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const isSA = payload!.role === 'SUPER_ADMIN';

    // ── User counts with RBAC ──
    const userFilter: Record<string, unknown> = { role: 'USER' };
    let customerIds: string[] | null = null;
    if (!isSA) {
      customerIds = await getAccessibleUserIds(payload!);
      // For user counts, sub-agent sees users where agentId = their ID
      Object.assign(userFilter, { agentId: payload!.userId });
    }

    // ── Transaction filter for sub-agents ──
    const txFilter: Record<string, unknown> = {};
    if (!isSA && customerIds) {
      txFilter.userId = { in: customerIds };
    }

    // ── Fetch all stats in parallel ──
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newTodayUsers,
      pendingDeposits,
      pendingWithdrawals,
      totalDepositsResult,
      totalWithdrawalsResult,
      totalTrades,
      openTrades,
      closedTrades,
      totalPnlResult,
      totalWallets,
      totalEquityResult,
      agents,
      recentLogins,
    ] = await Promise.all([
      // Users
      prisma.user.count({ where: userFilter }),
      prisma.user.count({ where: { ...userFilter, status: 'ACTIVE' } }),
      prisma.user.count({ where: { ...userFilter, status: 'SUSPENDED' } }),
      prisma.user.count({
        where: {
          ...userFilter,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      // Pending deposits/withdrawals (from Transaction model)
      prisma.transaction.count({ where: { ...txFilter, type: 'DEPOSIT', status: 'PENDING' } }),
      prisma.transaction.count({ where: { ...txFilter, type: 'WITHDRAW', status: 'PENDING' } }),
      prisma.transaction.aggregate({
        where: { ...txFilter, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...txFilter, type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Trades
      prisma.trade.count({ where: txFilter }),
      prisma.trade.count({ where: { ...txFilter, status: 'OPEN' } }),
      prisma.trade.count({ where: { ...txFilter, status: 'CLOSED' } }),
      prisma.trade.aggregate({
        where: { ...txFilter, status: 'CLOSED' },
        _sum: { pnl: true },
      }),
      // Wallets
      prisma.wallet.count(),
      prisma.wallet.aggregate({ _sum: { totalEquity: true } }),
      // Agents (SA only)
      isSA ? prisma.user.count({ where: { role: 'SUB_AGENT', status: 'ACTIVE' } }) : Promise.resolve(0),
      // Recent login logs
      prisma.loginLog.findMany({
        where: isSA ? {} : { userId: { in: customerIds || [] } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
    ]);

    const totalDeposits = totalDepositsResult._sum.amount || 0;
    const totalWithdrawals = totalWithdrawalsResult._sum.amount || 0;
    const totalPnl = totalPnlResult._sum.pnl || 0;
    const platformEquity = totalEquityResult._sum.totalEquity || 0;
    const revenue = totalDeposits * 0.02; // 2% fee on deposits

    // ── Daily stats for last 7 days ──
    const dailyStats = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      const [dayDeposits, dayWithdrawals, dayUsers, dayTrades, dayPnl] = await Promise.all([
        prisma.transaction.aggregate({
          where: { ...txFilter, type: 'DEPOSIT', status: 'COMPLETED', createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...txFilter, type: 'WITHDRAW', status: 'COMPLETED', createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: { ...userFilter, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        prisma.trade.count({
          where: { ...txFilter, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        prisma.trade.aggregate({
          where: { ...txFilter, status: 'CLOSED', closedAt: { gte: dayStart, lt: dayEnd } },
          _sum: { pnl: true },
        }),
      ]);

      dailyStats.push({
        date: dayName,
        deposits: dayDeposits._sum.amount || 0,
        withdrawals: dayWithdrawals._sum.amount || 0,
        users: dayUsers,
        trades: dayTrades,
        pnl: dayPnl._sum.pnl || 0,
        revenue: (dayDeposits._sum.amount || 0) * 0.02,
      });
    }

    // ── Monthly stats for last 6 months ──
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const [mDeposits, mWithdrawals, mUsers, mTrades] = await Promise.all([
        prisma.transaction.aggregate({
          where: { ...txFilter, type: 'DEPOSIT', status: 'COMPLETED', createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...txFilter, type: 'WITHDRAW', status: 'COMPLETED', createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: { ...userFilter, createdAt: { gte: monthStart, lt: monthEnd } },
        }),
        prisma.trade.count({
          where: { ...txFilter, createdAt: { gte: monthStart, lt: monthEnd } },
        }),
      ]);

      monthlyStats.push({
        month: monthName,
        deposits: mDeposits._sum.amount || 0,
        withdrawals: mWithdrawals._sum.amount || 0,
        users: mUsers,
        trades: mTrades,
        revenue: (mDeposits._sum.amount || 0) * 0.02,
      });
    }

    // ── Top pairs (from trades) ──
    const topPairs = await prisma.trade.groupBy({
      by: ['symbol'],
      where: txFilter,
      _count: { id: true },
      _sum: { margin: true, pnl: true },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
    });

    // ── Recent pending transactions (for action items) ──
    const pendingTx = await prisma.transaction.findMany({
      where: { ...txFilter, status: 'PENDING', type: { in: ['DEPOSIT', 'WITHDRAW'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        newTodayUsers,
        pendingDeposits,
        pendingWithdrawals,
        totalDeposits,
        totalWithdrawals,
        totalTrades,
        openTrades,
        closedTrades,
        totalPnl,
        totalWallets,
        platformEquity,
        revenue,
        agents,
        dailyStats,
        monthlyStats,
        topPairs: topPairs.map(p => ({
          symbol: p.symbol,
          count: p._count.id,
          volume: p._sum.margin || 0,
          pnl: p._sum.pnl || 0,
        })),
        recentLogins: recentLogins.map(l => ({
          id: l.id,
          email: l.email,
          success: l.success,
          ip: l.ip,
          userAgent: l.userAgent,
          createdAt: l.createdAt,
          user: l.user,
        })),
        pendingTransactions: pendingTx.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          createdAt: tx.createdAt,
          user: tx.user,
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}