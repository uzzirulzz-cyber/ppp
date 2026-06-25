/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';


// GET /api/admin/trades — all trades with filters, optionally analytics mode
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.role || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'SUB_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'list';

    // ── Analytics mode ──
    if (mode === 'analytics') {
      const [totalTrades, openTrades, closedTrades, liquidatedTrades] = await Promise.all([
        prisma.trade.count(),
        prisma.trade.count({ where: { status: 'OPEN' } }),
        prisma.trade.count({ where: { status: 'CLOSED' } }),
        prisma.trade.count({ where: { status: 'LIQUIDATED' } }),
      ]);

      const pnlAgg = await prisma.trade.aggregate({
        where: { status: 'CLOSED' },
        _sum: { pnl: true },
        _avg: { pnl: true },
        _count: true,
      });

      const totalPnl = pnlAgg._sum.pnl || 0;
      const avgPnl = pnlAgg._avg.pnl || 0;
      const closedCount = pnlAgg._count || 0;

      const winCount = await prisma.trade.count({ where: { status: 'CLOSED', pnl: { gt: 0 } } });
      const lossCount = await prisma.trade.count({ where: { status: 'CLOSED', pnl: { lt: 0 } } });
      const winRate = winCount + lossCount > 0
        ? parseFloat(((winCount / (winCount + lossCount)) * 100).toFixed(2))
        : 0;

      // Total volume
      const volumeAgg = await prisma.trade.aggregate({
        _sum: { margin: true },
      });
      const totalVolume = (volumeAgg._sum.margin || 0) * 100; // approximate

      // By symbol
      const bySymbol = await prisma.trade.groupBy({
        by: ['symbol'],
        _count: { id: true },
        _sum: { margin: true },
        orderBy: { _sum: { margin: 'desc' } },
        take: 20,
      });

      // By side
      const bySide = await prisma.trade.groupBy({
        by: ['side'],
        _count: { id: true },
        _sum: { pnl: true },
      });

      // By type
      const byType = await prisma.trade.groupBy({
        by: ['type'],
        _count: { id: true },
      });

      // Recent daily
      const trades = await prisma.trade.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });
      const dailyMap = new Map<string, { count: number; pnl: number; volume: number }>();
      for (const t of trades) {
        const day = t.createdAt.toISOString().split('T')[0];
        const existing = dailyMap.get(day) || { count: 0, pnl: 0, volume: 0 };
        existing.count++;
        existing.pnl += t.pnl || 0;
        existing.volume += t.entryPrice * t.quantity;
        dailyMap.set(day, existing);
      }
      const recentDaily = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ _id: date, ...data }))
        .sort((a, b) => b._id.localeCompare(a._id))
        .slice(0, 30);

      // Top traders
      const topTradersAgg = await prisma.trade.groupBy({
        by: ['userId'],
        where: { status: 'CLOSED' },
        _count: { id: true },
        _sum: { pnl: true },
        orderBy: { _sum: { pnl: 'desc' } },
        take: 10,
      });
      const topTraderIds = topTradersAgg.map(t => t.userId);
      const traderUsers = topTraderIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: topTraderIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
      const traderMap = new Map(traderUsers.map(u => [u.id, u]));
      const enrichedTopTraders = topTradersAgg.map(t => ({
        _id: t.userId,
        tradeCount: t._count.id,
        totalPnl: t._sum.pnl || 0,
        user: traderMap.get(t.userId) || null,
      }));

      if (totalTrades === 0) {
        return NextResponse.json({
          analytics: {
            summary: { totalTrades: 0, openTrades: 0, closedTrades: 0, liquidatedTrades: 0, totalPnl: 0, totalVolume: 0, avgPnl: 0, winRate: 0, winningTrades: 0, losingTrades: 0 },
            bySymbol: [], bySide: [], byType: [], recentDaily: [], topTraders: [],
          },
          _note: 'No trades in database. Returned empty analytics.',
        });
      }

      return NextResponse.json({
        analytics: {
          summary: {
            totalTrades, openTrades, closedTrades, liquidatedTrades,
            totalPnl, totalVolume, avgPnl, winRate,
            winningTrades: winCount, losingTrades: lossCount,
          },
          bySymbol: bySymbol.map(s => ({ _id: s.symbol, count: s._count.id, volume: s._sum.margin || 0 })),
          bySide: bySide.map(s => ({ _id: s.side, count: s._count.id, pnl: s._sum.pnl || 0 })),
          byType: byType.map(t => ({ _id: t.type, count: t._count.id })),
          recentDaily,
          topTraders: enrichedTopTraders,
        },
      });
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
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: any = {};
    if (symbol) where.symbol = symbol.toUpperCase();
    if (status) where.status = status;
    if (side) where.side = side;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (agentId) where.agentId = agentId;

    const validSortFields = ['createdAt', 'pnl', 'margin', 'quantity', 'entryPrice'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: any = { [orderByField]: sortOrder };

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);

    const userIds = [...new Set(trades.map(t => t.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    const enriched = trades.map(t => ({
      ...t,
      _id: t.id,
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