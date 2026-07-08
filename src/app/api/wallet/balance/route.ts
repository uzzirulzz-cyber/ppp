/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import Wallet from '@/models/Wallet';

// GET /api/wallet/balance — get user's SPOT wallet balance
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request);
    if (response) return response;

    let wallet = await Wallet.findOne({ userId: payload.userId, type: 'SPOT' }).lean();

    // Create wallet with default PKR and USDT balances if not found
    if (!wallet) {
      const newWallet = await Wallet.create({
        userId: payload.userId,
        type: 'SPOT',
        status: 'ACTIVE',
        balances: [
          { currency: 'PKR', amount: 0, frozen: 0 },
          { currency: 'USDT', amount: 0, frozen: 0 },
        ],
        totalEquity: 0,
      });

      wallet = newWallet.toObject();
    }

    return NextResponse.json({
      _id: wallet._id.toString(),
      userId: wallet.userId,
      type: wallet.type,
      status: wallet.status,
      balances: wallet.balances,
      totalEquity: wallet.totalEquity,
      createdAt: wallet.createdAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}