/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate, getAccessibleUserIds } from '@/lib/rbac';

// GET /api/admin/finance — Financial ledger using Transaction model (RBAC)
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const where: any = {};
    if (type) where.type = type.toUpperCase();

    if (payload!.role === 'SUB_AGENT') {
      const allowedIds = await getAccessibleUserIds(payload!);
      where.userId = { in: allowedIds };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Batch fetch user info
    const userIds = [...new Set(transactions.map(t => t.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    // Wallet equity summary
    const walletFilter: any = {};
    if (payload!.role === 'SUB_AGENT') {
      walletFilter.userId = { in: userIds.length > 0 ? userIds : ['__none__'] };
    }
    const equityAgg = await prisma.wallet.aggregate({
      _sum: { totalEquity: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      ledger: transactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        userName: userMap.get(tx.userId)?.name || 'Unknown',
        userEmail: userMap.get(tx.userId)?.email || '',
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        currency: tx.currency,
        status: tx.status,
        description: tx.description,
        tradeId: tx.tradeId,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
      summary: {
        totalEquity: equityAgg._sum.totalEquity || 0,
        totalWallets: equityAgg._count.id || 0,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch finance data';
    console.error('Admin finance error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/admin/finance — Manual balance adjustment (delegates to wallets endpoint)
export async function POST(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN']);
    if (response) return response;
    const body = await request.json();
    const { userId, currency, amount, reason, walletType } = body;

    if (!userId || !currency || amount === undefined) {
      return NextResponse.json({ success: false, message: 'userId, currency, and amount are required' }, { status: 400 });
    }
    if (typeof amount !== 'number') {
      return NextResponse.json({ success: false, message: 'amount must be a number' }, { status: 400 });
    }

    const upperCurrency = currency.toUpperCase();
    const wFilter: any = { userId };
    if (walletType) wFilter.type = walletType;

    let wallet = await prisma.wallet.findFirst({ where: wFilter, include: { balances: true } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, type: walletType || 'SPOT', status: 'ACTIVE', totalEquity: 0 },
        include: { balances: true },
      });
    }

    if (wallet.status === 'FROZEN') {
      return NextResponse.json({ success: false, message: 'Wallet is frozen' }, { status: 400 });
    }

    let balance = wallet.balances.find(b => b.currency === upperCurrency);
    if (!balance) {
      balance = await prisma.walletBalance.create({
        data: { walletId: wallet.id, currency: upperCurrency, amount: 0, frozen: 0 },
      });
    }

    const previousAmount = balance.amount;
    const newAmount = balance.amount + amount;

    if (newAmount < 0) {
      return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
    }

    await prisma.walletBalance.update({ where: { id: balance.id }, data: { amount: newAmount } });

    const allBalances = await prisma.walletBalance.findMany({ where: { walletId: wallet.id } });
    const totalEquity = allBalances.reduce((s, b) => s + b.amount + b.frozen, 0);
    await prisma.wallet.update({ where: { id: wallet.id }, data: { totalEquity } });

    const tx = await prisma.transaction.create({
      data: {
        userId,
        type: amount > 0 ? 'DEPOSIT' : 'WITHDRAW',
        status: 'COMPLETED',
        currency: upperCurrency,
        amount: Math.abs(amount),
        fee: 0,
        description: reason || `Admin balance adjustment: ${amount > 0 ? '+' : ''}${amount} ${upperCurrency}`,
        metadata: { adminAction: true, adminId: payload!.userId, walletId: wallet.id, previousAmount, newAmount },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${amount > 0 ? 'Credit' : 'Debit'} of ${Math.abs(amount)} ${upperCurrency} applied`,
      transaction: tx,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to adjust balance';
    console.error('Finance adjustment error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}