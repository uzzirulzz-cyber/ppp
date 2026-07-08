import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/dashboard — Dashboard stats with RBAC
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);

    // Build RBAC filter for user counts
    const userFilter: Record<string, unknown> = { role: 'USER' };
    if (payload!.role === 'SUB_AGENT') {
      userFilter.agentId = payload!.userId;
    }

    // Build trade/deposit/withdrawal filter for sub-agents
    const tradeFilter: Record<string, unknown> = {};
    if (payload!.role === 'SUB_AGENT') {
      const myCustomers = await prisma.user.findMany({
        where: { agentId: payload!.userId },
        select: { id: true },
      });
      const customerIds = myCustomers.map(c => c.id);
      tradeFilter.userId = { in: customerIds };
    }

    const [
      totalUsers,
      activeTraders,
      pendingDeposits,
      pendingWithdrawals,
      totalDepositResult,
      totalWithdrawalResult,
      allTrades,
      wonTrades,
      lostTrades,
    ] = await Promise.all([
      prisma.user.count({ where: userFilter }),
      prisma.user.count({
        where: {
          ...userFilter,
          trades: { some: { status: { in: ['running', 'pending'] } } },
        },
      }),
      prisma.deposit.count({
        where: { ...tradeFilter, status: 'pending' },
      }),
      prisma.withdrawal.count({
        where: { ...tradeFilter, status: 'pending' },
      }),
      prisma.deposit.aggregate({
        where: { ...tradeFilter, status: 'approved' },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { ...tradeFilter, status: 'approved' },
        _sum: { amount: true },
      }),
      prisma.trade.count({ where: tradeFilter }),
      prisma.trade.aggregate({
        where: { ...tradeFilter, status: 'won' },
        _sum: { profit: true },
      }),
      prisma.trade.aggregate({
        where: { ...tradeFilter, status: 'lost' },
        _sum: { amount: true },
      }),
    ]);

    const totalDepositAmount = totalDepositResult._sum.amount || 0;
    const totalWithdrawalAmount = totalWithdrawalResult._sum.amount || 0;
    const platformProfit = (wonTrades._sum.profit || 0) - (lostTrades._sum.amount || 0);
    const revenue = totalDepositAmount * 0.02;

    // Daily stats for last 7 days
    const dailyStats = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      const [dayDeposits, dayWithdrawals, dayUsers, dayTrades] = await Promise.all([
        prisma.deposit.aggregate({
          where: { ...tradeFilter, createdAt: { gte: dayStart, lt: dayEnd }, status: 'approved' },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { ...tradeFilter, createdAt: { gte: dayStart, lt: dayEnd }, status: 'approved' },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: { ...userFilter, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        prisma.trade.count({
          where: { ...tradeFilter, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);

      dailyStats.push({
        date: dayName,
        deposits: dayDeposits._sum.amount || 0,
        withdrawals: dayWithdrawals._sum.amount || 0,
        users: dayUsers,
        trades: dayTrades,
        revenue: (dayDeposits._sum.amount || 0) * 0.02,
      });
    }

    // Monthly stats
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const [mDeposits, mWithdrawals, mUsers] = await Promise.all([
        prisma.deposit.aggregate({
          where: { ...tradeFilter, createdAt: { gte: monthStart, lt: monthEnd }, status: 'approved' },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { ...tradeFilter, createdAt: { gte: monthStart, lt: monthEnd }, status: 'approved' },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: { ...userFilter, createdAt: { gte: monthStart, lt: monthEnd } },
        }),
      ]);

      monthlyStats.push({
        month: monthName,
        deposits: mDeposits._sum.amount || 0,
        withdrawals: mWithdrawals._sum.amount || 0,
        users: mUsers,
        revenue: (mDeposits._sum.amount || 0) * 0.02,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        onlineUsers: Math.floor(totalUsers * 0.1),
        activeTraders,
        todayDeposits: dailyStats[dailyStats.length - 1]?.deposits || 0,
        todayWithdrawals: dailyStats[dailyStats.length - 1]?.withdrawals || 0,
        pendingDeposits,
        pendingWithdrawals,
        totalTradingVolume: 0,
        revenue,
        platformProfit: Math.max(0, platformProfit),
        dailyStats,
        monthlyStats,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}