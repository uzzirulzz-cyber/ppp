/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import Trade from '@/models/Trade';
import User from '@/models/User';

// GET /api/admin/trades — all trades with filters, optionally analytics mode
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
    const mode = searchParams.get('mode') || 'list';

    // ── Analytics mode ──
    if (mode === 'analytics') {
      const totalTrades = await Trade.countDocuments();
      const openTrades = await Trade.countDocuments({ status: 'OPEN' });
      const closedTrades = await Trade.countDocuments({ status: 'CLOSED' });
      const liquidatedTrades = await Trade.countDocuments({ status: 'LIQUIDATED' });

      const pnlAgg = await Trade.aggregate([
        { $match: { status: 'CLOSED' } },
        {
          $group: {
            _id: null,
            totalPnl: { $sum: '$pnl' },
            totalVolume: { $sum: { $multiply: ['$entryPrice', '$quantity'] } },
            avgPnl: { $avg: '$pnl' },
            winCount: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } },
            lossCount: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] } },
          },
        },
      ]);

      const bySymbol = await Trade.aggregate([
        { $group: { _id: '$symbol', count: { $sum: 1 }, volume: { $sum: { $multiply: ['$entryPrice', '$quantity'] } } } },
        { $sort: { volume: -1 } },
        { $limit: 20 },
      ]);

      const bySide = await Trade.aggregate([
        { $group: { _id: '$side', count: { $sum: 1 }, pnl: { $sum: '$pnl' } } },
      ]);

      const byType = await Trade.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const recentDaily = await Trade.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            pnl: { $sum: '$pnl' },
            volume: { $sum: { $multiply: ['$entryPrice', '$quantity'] } },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]);

      const topTraders = await Trade.aggregate([
        { $match: { status: 'CLOSED' } },
        { $group: { _id: '$userId', tradeCount: { $sum: 1 }, totalPnl: { $sum: '$pnl' } } },
        { $sort: { totalPnl: -1 } },
        { $limit: 10 },
      ]);
      const topTraderIds = topTraders.map((t) => t._id.toString());
      const traderUsers = topTraderIds.length > 0
        ? await User.find({ _id: { $in: topTraderIds } }).select('name email').lean()
        : [];
      const traderMap = new Map(traderUsers.map((u) => [u._id.toString(), u]));
      const enrichedTopTraders = topTraders.map((t) => ({
        ...t,
        user: traderMap.get(t._id.toString()) || null,
      }));

      const agg = pnlAgg[0] || { totalPnl: 0, totalVolume: 0, avgPnl: 0, winCount: 0, lossCount: 0 };
      const winRate = agg.winCount + agg.lossCount > 0
        ? ((agg.winCount / (agg.winCount + agg.lossCount)) * 100).toFixed(2)
        : '0.00';

      const analytics = {
        summary: {
          totalTrades,
          openTrades,
          closedTrades,
          liquidatedTrades,
          totalPnl: agg.totalPnl,
          totalVolume: agg.totalVolume,
          avgPnl: agg.avgPnl,
          winRate: parseFloat(winRate),
          winningTrades: agg.winCount,
          losingTrades: agg.lossCount,
        },
        bySymbol,
        bySide,
        byType,
        recentDaily,
        topTraders: enrichedTopTraders,
      };

      if (totalTrades === 0) {
        return NextResponse.json({
          analytics: {
            summary: { totalTrades: 0, openTrades: 0, closedTrades: 0, liquidatedTrades: 0, totalPnl: 0, totalVolume: 0, avgPnl: 0, winRate: 0, winningTrades: 0, losingTrades: 0 },
            bySymbol: [],
            bySide: [],
            byType: [],
            recentDaily: [],
            topTraders: [],
          },
          _note: 'No trades in database. Returned empty analytics.',
        });
      }

      return NextResponse.json({ analytics });
    }

    // ── List mode ──
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const symbol = searchParams.get('symbol') || '';
    const status = searchParams.get('status') || '';
    const side = searchParams.get('side') || '';
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const agentId = searchParams.get('agentId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const filter: Record<string, any> = {};
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (status) filter.status = status;
    if (side) filter.side = side;
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (agentId) filter.agentId = agentId;

    const sort: Record<string, 1 | -1> = {};
    if (['createdAt', 'pnl', 'margin', 'quantity', 'entryPrice'].includes(sortBy)) {
      sort[sortBy] = sortOrder as 1 | -1;
    } else {
      sort.createdAt = -1;
    }

    const [trades, total] = await Promise.all([
      Trade.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Trade.countDocuments(filter),
    ]);

    const userIds = [...new Set(trades.map((t) => t.userId))];
    const users = userIds.length > 0
      ? await User.find({ _id: { $in: userIds } }).select('name email').lean()
      : [];
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const enriched = trades.map((t) => ({
      ...t,
      _id: t._id.toString(),
      user: userMap.get(t.userId) || null,
    }));

    return NextResponse.json({
      trades: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}