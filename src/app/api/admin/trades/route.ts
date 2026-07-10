/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate, getAccessibleUserIds, blockSubAgentAnalytics } from '@/lib/rbac';

// GET /api/admin/trades
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'list';

    // ── Analytics mode — SUPER_ADMIN only ──
    if (mode === 'analytics') {
      const blocked = blockSubAgentAnalytics(payload!);
      if (blocked) return blocked;

      const [totalTrades, openTrades, closedTrades, liquidatedTrades] = await Promise.all([
        prisma.trade.count(),
        prisma.trade.count({ where: { status: 'OPEN' } }),
        prisma.trade.count({ where: { status: 'CLOSED' } }),
        prisma.trade.count({ where: { status: 'LIQUIDATED' } }),
      ]);

      const pnlAgg = await prisma.trade.aggregate({
        where: { status: 'CLOSED' }, _sum: { pnl: true }, _avg: { pnl: true }, _count: true,
      });

      const winCount = await prisma.trade.count({ where: { status: 'CLOSED', pnl: { gt: 0 } } });
      const lossCount = await prisma.trade.count({ where: { status: 'CLOSED', pnl: { lt: 0 } } });
      const winRate = winCount + lossCount > 0
        ? parseFloat(((winCount / (winCount + lossCount)) * 100).toFixed(2)) : 0;

      const bySymbol = await prisma.trade.groupBy({
        by: ['symbol'], _count: { id: true }, _sum: { margin: true },
        orderBy: { _sum: { margin: 'desc' } }, take: 20,
      });
      const bySide = await prisma.trade.groupBy({ by: ['side'], _count: { id: true }, _sum: { pnl: true } });
      const byType = await prisma.trade.groupBy({ by: ['type'], _count: { id: true } });

      const trades = await prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
      const dailyMap = new Map<string, { count: number; pnl: number; volume: number }>();
      for (const t of trades) {
        const day = t.createdAt.toISOString().split('T')[0];
        const existing = dailyMap.get(day) || { count: 0, pnl: 0, volume: 0 };
        existing.count++; existing.pnl += t.pnl || 0; existing.volume += t.entryPrice * t.quantity;
        dailyMap.set(day, existing);
      }
      const recentDaily = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ _id: date, ...data }))
        .sort((a, b) => b._id.localeCompare(a._id)).slice(0, 30);

      const topTradersAgg = await prisma.trade.groupBy({
        by: ['userId'], where: { status: 'CLOSED' },
        _count: { id: true }, _sum: { pnl: true },
        orderBy: { _sum: { pnl: 'desc' } }, take: 10,
      });
      const traderUsers = await prisma.user.findMany({
        where: { id: { in: topTradersAgg.map(t => t.userId) } },
        select: { id: true, name: true, email: true },
      });
      const traderMap = new Map(traderUsers.map(u => [u.id, u]));

      if (totalTrades === 0) {
        return NextResponse.json({
          analytics: {
            summary: { totalTrades: 0, openTrades: 0, closedTrades: 0, liquidatedTrades: 0, totalPnl: 0, totalVolume: 0, avgPnl: 0, winRate: 0, winningTrades: 0, losingTrades: 0 },
            bySymbol: [], bySide: [], byType: [], recentDaily: [], topTraders: [],
          },
        });
      }

      return NextResponse.json({
        analytics: {
          summary: { totalTrades, openTrades, closedTrades, liquidatedTrades, totalPnl: pnlAgg._sum.pnl || 0, totalVolume: (pnlAgg._sum.pnl || 0) * 100, avgPnl: pnlAgg._avg.pnl || 0, winRate, winningTrades: winCount, losingTrades: lossCount },
          bySymbol: bySymbol.map(s => ({ _id: s.symbol, count: s._count.id, volume: s._sum.margin || 0 })),
          bySide: bySide.map(s => ({ _id: s.side, count: s._count.id, pnl: s._sum.pnl || 0 })),
          byType: byType.map(t => ({ _id: t.type, count: t._count.id })),
          recentDaily,
          topTraders: topTradersAgg.map(t => ({ _id: t.userId, tradeCount: t._count.id, totalPnl: t._sum.pnl || 0, user: traderMap.get(t.userId) || null })),
        },
      });
    }

    // ── List mode — Sub-Agent sees only their customers' trades ──
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const symbol = searchParams.get('symbol') || '';
    const status = searchParams.get('status') || '';
    const side = searchParams.get('side') || '';
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: any = {};
    if (symbol) where.symbol = symbol.toUpperCase();
    if (status) where.status = status;
    if (side) where.side = side;
    if (type) where.type = type;

    // Sub-Agent: only their customers' trades
    if (payload!.role === 'SUB_AGENT') {
      const allowedIds = await getAccessibleUserIds(payload!);
      where.userId = { in: allowedIds };
    } else if (userId) {
      where.userId = userId;
    }

    const validSortFields = ['createdAt', 'pnl', 'margin', 'quantity', 'entryPrice'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: any = { [orderByField]: sortOrder };

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.trade.count({ where }),
    ]);

    const userIds = [...new Set(trades.map(t => t.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    const enriched = trades.map(t => ({ ...t, _id: t.id, user: userMap.get(t.userId) || null, userName: userMap.get(t.userId)?.name || 'Unknown' }));

    // Stats
    const allTradeFilter = payload!.role === 'SUB_AGENT' ? { userId: { in: await getAccessibleUserIds(payload!) } } : {};
    const [totalTradeCount, openCount, todayVolumeResult, totalPnlResult] = await Promise.all([
      prisma.trade.count({ where: allTradeFilter }),
      prisma.trade.count({ where: { ...allTradeFilter, status: 'OPEN' } }),
      prisma.trade.aggregate({ where: { ...allTradeFilter, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }, _sum: { margin: true } }),
      prisma.trade.aggregate({ where: { ...allTradeFilter, status: 'CLOSED' }, _sum: { pnl: true } }),
    ]);

    return NextResponse.json({
      trades: enriched,
      total,
      stats: {
        totalTrades: totalTradeCount,
        openPositions: openCount,
        todayVolume: todayVolumeResult._sum.margin || 0,
        totalPnl: totalPnlResult._sum.pnl || 0,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}