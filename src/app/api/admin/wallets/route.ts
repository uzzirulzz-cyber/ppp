/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

// GET /api/admin/wallets — list all wallets with user info
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.role || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'SUB_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        include: { balances: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wallet.count({ where }),
    ]);

    const userIds = [...new Set(wallets.map(w => w.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true, status: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    const enriched = wallets.map(w => ({
      id: w.id,
      userId: w.userId,
      type: w.type,
      status: w.status,
      totalEquity: w.totalEquity,
      balances: w.balances,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      _id: w.id,
      user: userMap.get(w.userId) || null,
    }));

    const totalEquityResult = await prisma.wallet.aggregate({
      _sum: { totalEquity: true },
    });
    const totalEquity = totalEquityResult._sum.totalEquity || 0;

    return NextResponse.json({
      wallets: enriched,
      summary: { totalEquity, walletCount: total },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/wallets — adjust a wallet balance (admin action)
export async function POST(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, walletType, currency, amount, reason } = body;

    if (!userId || !currency || amount === undefined) {
      return NextResponse.json({ error: 'userId, currency, and amount are required' }, { status: 400 });
    }
    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount must be a number' }, { status: 400 });
    }

    const upperCurrency = currency.toUpperCase();
    const wFilter: any = { userId };
    if (walletType) wFilter.type = walletType;

    let wallet = await prisma.wallet.findFirst({ where: wFilter, include: { balances: true } });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          type: walletType || 'SPOT',
          status: 'ACTIVE',
          totalEquity: 0,
        },
        include: { balances: true },
      });
    }

    if (wallet.status === 'FROZEN') {
      return NextResponse.json({ error: 'Wallet is frozen' }, { status: 400 });
    }

    // Find or create balance entry
    let balance = wallet.balances.find(b => b.currency === upperCurrency);
    if (!balance) {
      balance = await prisma.walletBalance.create({
        data: {
          walletId: wallet.id,
          currency: upperCurrency,
          amount: 0,
          frozen: 0,
        },
      });
    }

    const previousAmount = balance.amount;
    const newAmount = balance.amount + amount;

    if (newAmount < 0) {
      return NextResponse.json({ error: 'Insufficient balance for this adjustment' }, { status: 400 });
    }

    await prisma.walletBalance.update({
      where: { id: balance.id },
      data: { amount: newAmount },
    });

    // Recalculate total equity
    const allBalances = await prisma.walletBalance.findMany({ where: { walletId: wallet.id } });
    const totalEquity = allBalances.reduce((s, b) => s + b.amount + b.frozen, 0);
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { totalEquity },
    });

    const tx = await prisma.transaction.create({
      data: {
        userId,
        type: amount > 0 ? 'DEPOSIT' : 'WITHDRAW',
        status: 'COMPLETED',
        currency: upperCurrency,
        amount: Math.abs(amount),
        fee: 0,
        description: reason || `Admin balance adjustment: ${amount > 0 ? '+' : ''}${amount} ${upperCurrency}`,
        metadata: {
          adminAction: true,
          adminId: payload.userId,
          walletId: wallet.id,
          previousAmount,
          newAmount,
        },
      },
    });

    return NextResponse.json({
      message: 'Balance adjusted successfully',
      wallet: { ...wallet, balances: allBalances, totalEquity },
      transaction: tx,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}