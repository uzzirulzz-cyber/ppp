/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate, getAccessibleUserIds } from '@/lib/rbac';

// GET /api/admin/trading — List trades with user info (RBAC)
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const symbol = searchParams.get('symbol') || '';

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (symbol) where.symbol = symbol.toUpperCase();

    if (payload!.role === 'SUB_AGENT') {
      const allowedIds = await getAccessibleUserIds(payload!);
      where.userId = { in: allowedIds };
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);

    // Batch fetch user info
    const userIds = [...new Set(trades.map(t => t.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    return NextResponse.json({
      success: true,
      trades: trades.map(t => ({
        id: t.id,
        userId: t.userId,
        userName: userMap.get(t.userId)?.name || 'Unknown',
        userEmail: userMap.get(t.userId)?.email || '',
        symbol: t.symbol,
        side: t.side,
        type: t.type,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.quantity,
        leverage: t.leverage,
        margin: t.margin,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
        status: t.status,
        stopLoss: t.stopLoss,
        takeProfit: t.takeProfit,
        createdAt: t.createdAt,
        closedAt: t.closedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trades';
    console.error('Admin trading error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}