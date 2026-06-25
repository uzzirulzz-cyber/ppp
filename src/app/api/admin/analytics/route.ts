import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

function formatDateForGroup(date: Date, period: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  if (period === 'monthly') return `${y}-${m}`;
  if (period === 'weekly') {
    const jan1 = new Date(y, 0, 1);
    const weekNum = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${y}-${String(weekNum).padStart(2, '0')}`;
  }
  return `${y}-${m}-${d}`;
}

// GET /api/admin/analytics — revenue & platform analytics
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.role || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'SUB_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') || '30')));

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalUsers, activeUsers, totalDeposits, totalWithdrawals, commissionTxCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { type: 'DEPOSIT', status: 'COMPLETED', createdAt: { gte: since } } }),
      prisma.transaction.count({ where: { type: 'WITHDRAW', status: 'COMPLETED', createdAt: { gte: since } } }),
      prisma.transaction.count({ where: { type: 'COMMISSION', createdAt: { gte: since } } }),
    ]);

    // Fetch all transactions within the period for timeline aggregation
    const txs = await prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
    });

    // Fetch trades for PnL timeline
    const trades = await prisma.trade.findMany({
      where: { status: 'CLOSED', createdAt: { gte: since } },
    });

    // Build timeline by grouping in memory
    const timelineMap = new Map<string, {
      deposits: number; depositFees: number; depositCount: number;
      withdrawals: number; withdrawalFees: number; withdrawalCount: number;
      commissions: number; commissionCount: number;
      referralBonuses: number; referralBonusCount: number;
      tradePnl: number; tradeVolume: number; tradeCount: number;
    }>();

    for (const tx of txs) {
      const date = formatDateForGroup(tx.createdAt, period);
      const entry = timelineMap.get(date) || {
        deposits: 0, depositFees: 0, depositCount: 0,
        withdrawals: 0, withdrawalFees: 0, withdrawalCount: 0,
        commissions: 0, commissionCount: 0,
        referralBonuses: 0, referralBonusCount: 0,
        tradePnl: 0, tradeVolume: 0, tradeCount: 0,
      };

      if (tx.type === 'DEPOSIT' && tx.status === 'COMPLETED') {
        entry.deposits += tx.amount;
        entry.depositFees += tx.fee;
        entry.depositCount++;
      } else if (tx.type === 'WITHDRAW' && tx.status === 'COMPLETED') {
        entry.withdrawals += tx.amount;
        entry.withdrawalFees += tx.fee;
        entry.withdrawalCount++;
      } else if (tx.type === 'COMMISSION') {
        entry.commissions += tx.amount;
        entry.commissionCount++;
      } else if (tx.type === 'REFERRAL_BONUS') {
        entry.referralBonuses += tx.amount;
        entry.referralBonusCount++;
      }
      timelineMap.set(date, entry);
    }

    for (const t of trades) {
      const date = formatDateForGroup(t.createdAt, period);
      const entry = timelineMap.get(date) || {
        deposits: 0, depositFees: 0, depositCount: 0,
        withdrawals: 0, withdrawalFees: 0, withdrawalCount: 0,
        commissions: 0, commissionCount: 0,
        referralBonuses: 0, referralBonusCount: 0,
        tradePnl: 0, tradeVolume: 0, tradeCount: 0,
      };
      entry.tradePnl += t.pnl || 0;
      entry.tradeVolume += t.entryPrice * t.quantity;
      entry.tradeCount++;
      timelineMap.set(date, entry);
    }

    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        netRevenue: data.deposits - data.withdrawals + data.commissions - data.referralBonuses,
        netFees: data.depositFees + data.withdrawalFees,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totals = timeline.reduce(
      (acc, item) => {
        acc.totalDeposits += item.deposits;
        acc.totalWithdrawals += item.withdrawals;
        acc.totalCommissions += item.commissions;
        acc.totalReferralBonuses += item.referralBonuses;
        acc.totalTradePnl += item.tradePnl;
        acc.totalTradeVolume += item.tradeVolume;
        acc.totalFees += item.netFees;
        acc.netRevenue += item.netRevenue;
        return acc;
      },
      { totalDeposits: 0, totalWithdrawals: 0, totalCommissions: 0, totalReferralBonuses: 0, totalTradePnl: 0, totalTradeVolume: 0, totalFees: 0, netRevenue: 0 },
    );

    const equityAgg = await prisma.wallet.aggregate({
      _sum: { totalEquity: true },
      _count: { id: true },
    });

    const analytics = {
      period,
      days,
      overview: {
        totalUsers,
        activeUsers,
        totalDeposits,
        totalWithdrawals,
        commissionTxCount,
        platformEquity: equityAgg._sum.totalEquity || 0,
        totalWallets: equityAgg._count.id || 0,
      },
      totals,
      timeline,
    };

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}