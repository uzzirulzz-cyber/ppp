/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import Transaction from '@/models/Transaction';

const VALID_TX_TYPES = ['DEPOSIT', 'WITHDRAW', 'TRADE', 'COMMISSION', 'REFERRAL_BONUS', 'TRANSFER'];

// GET /api/wallet/transactions — user's transaction history
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const typeFilter = searchParams.get('type') || '';

    const filter: Record<string, any> = { userId: payload.userId };
    if (typeFilter && VALID_TX_TYPES.includes(typeFilter.toUpperCase())) {
      filter.type = typeFilter.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const enriched = transactions.map((tx) => ({
      _id: tx._id.toString(),
      userId: tx.userId,
      type: tx.type,
      status: tx.status,
      currency: tx.currency,
      amount: tx.amount,
      fee: tx.fee,
      fromWallet: tx.fromWallet || null,
      toWallet: tx.toWallet || null,
      tradeId: tx.tradeId || null,
      description: tx.description || '',
      metadata: tx.metadata || null,
      createdAt: tx.createdAt,
    }));

    return NextResponse.json({
      transactions: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}