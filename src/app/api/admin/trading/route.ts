import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/trading — List trades with RBAC
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (payload!.role === 'SUB_AGENT') {
      const myCustomers = await prisma.user.findMany({
        where: { agentId: payload!.userId },
        select: { id: true },
      });
      where.userId = { in: myCustomers.map(c => c.id) };
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        include: {
          user: {
            select: { id: true, uid: true, username: true, email: true },
          },
          coin: {
            select: { symbol: true, name: true, pair: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      trades: trades.map(t => ({
        id: t.id,
        userId: t.user.uid,
        username: t.user.username,
        coinSymbol: t.coin.symbol,
        coinName: t.coin.name,
        pair: t.coin.pair,
        direction: t.direction,
        amount: t.amount,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        duration: t.duration,
        status: t.status,
        profit: t.profit,
        payout: t.payout,
        startedAt: t.startedAt,
        closedAt: t.closedAt,
        createdAt: t.createdAt,
      })),
      pagination: { page, limit, total },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trades';
    console.error('Admin trading error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}