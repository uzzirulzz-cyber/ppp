import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import Transaction from '@/models/Transaction';
import Trade from '@/models/Trade';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

// GET /api/admin/analytics — revenue & platform analytics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') || '30')));

    const dateField = '$createdAt';
    const dateFormats: Record<string, string> = { daily: '%Y-%m-%d', weekly: '%Y-%U', monthly: '%Y-%m' };
    const dateFormat = dateFormats[period] || dateFormats.daily;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalUsers, activeUsers, totalDeposits, totalWithdrawals, commissionTxCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      Transaction.countDocuments({ type: 'DEPOSIT', status: 'COMPLETED', createdAt: { $gte: since } }),
      Transaction.countDocuments({ type: 'WITHDRAW', status: 'COMPLETED', createdAt: { $gte: since } }),
      Transaction.countDocuments({ type: 'COMMISSION', createdAt: { $gte: since } }),
    ]);

    const depositAgg = await Transaction.aggregate([
      { $match: { type: 'DEPOSIT', status: 'COMPLETED', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: dateField } }, totalAmount: { $sum: '$amount' }, totalFee: { $sum: '$fee' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const withdrawalAgg = await Transaction.aggregate([
      { $match: { type: 'WITHDRAW', status: 'COMPLETED', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: dateField } }, totalAmount: { $sum: '$amount' }, totalFee: { $sum: '$fee' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const commissionAgg = await Transaction.aggregate([
      { $match: { type: 'COMMISSION', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: dateField } }, totalCommission: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const referralBonusAgg = await Transaction.aggregate([
      { $match: { type: 'REFERRAL_BONUS', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: dateField } }, totalBonus: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const tradePnlAgg = await Trade.aggregate([
      { $match: { status: 'CLOSED', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: dateField } },
          totalPnl: { $sum: '$pnl' },
          totalVolume: { $sum: { $multiply: ['$entryPrice', '$quantity'] } },
          totalFees: { $sum: { $multiply: ['$margin', 0.001] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Collect all unique dates
    const allDates = new Set<string>();
    [...depositAgg, ...withdrawalAgg, ...commissionAgg, ...referralBonusAgg, ...tradePnlAgg]
      .forEach((item) => allDates.add(item._id));

    const dateKeys = Array.from(allDates).sort();

    const depositMap = new Map(depositAgg.map((d) => [d._id, d]));
    const withdrawalMap = new Map(withdrawalAgg.map((d) => [d._id, d]));
    const commissionMap = new Map(commissionAgg.map((d) => [d._id, d]));
    const referralMap = new Map(referralBonusAgg.map((d) => [d._id, d]));
    const tradeMap = new Map(tradePnlAgg.map((d) => [d._id, d]));

    const timeline = dateKeys.map((date) => {
      const dep = depositMap.get(date) || { totalAmount: 0, totalFee: 0, count: 0 };
      const wit = withdrawalMap.get(date) || { totalAmount: 0, totalFee: 0, count: 0 };
      const com = commissionMap.get(date) || { totalCommission: 0, count: 0 };
      const ref = referralMap.get(date) || { totalBonus: 0, count: 0 };
      const trd = tradeMap.get(date) || { totalPnl: 0, totalVolume: 0, totalFees: 0, count: 0 };

      return {
        date,
        deposits: dep.totalAmount,
        depositFees: dep.totalFee,
        depositCount: dep.count,
        withdrawals: wit.totalAmount,
        withdrawalFees: wit.totalFee,
        withdrawalCount: wit.count,
        commissions: com.totalCommission,
        commissionCount: com.count,
        referralBonuses: ref.totalBonus,
        referralBonusCount: ref.count,
        tradePnl: trd.totalPnl,
        tradeVolume: trd.totalVolume,
        tradeCount: trd.count,
        netRevenue: dep.totalAmount - wit.totalAmount + com.totalCommission - ref.totalBonus,
        netFees: dep.totalFee + wit.totalFee + trd.totalFees,
      };
    });

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

    const equityAgg = await Wallet.aggregate([
      { $group: { _id: null, totalEquity: { $sum: '$totalEquity' }, walletCount: { $sum: 1 } } },
    ]);

    const analytics = {
      period,
      days,
      overview: {
        totalUsers,
        activeUsers,
        totalDeposits,
        totalWithdrawals,
        commissionTxCount,
        platformEquity: equityAgg[0]?.totalEquity || 0,
        totalWallets: equityAgg[0]?.walletCount || 0,
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