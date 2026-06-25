import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const wallets = await prisma.wallet.findMany({
      where: { userId: payload.userId },
      include: { balances: true },
    });

    const walletsPlain = wallets.map(w => ({
      id: w.id,
      userId: w.userId,
      type: w.type,
      status: w.status,
      totalEquity: w.totalEquity,
      balances: w.balances.map(b => ({
        currency: b.currency,
        amount: b.amount,
        frozen: b.frozen,
      })),
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    const totalEquity = wallets.reduce((sum, w) => sum + (w.totalEquity || 0), 0);

    return NextResponse.json({
      wallets: walletsPlain,
      totalEquity,
      formatted: `$${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}