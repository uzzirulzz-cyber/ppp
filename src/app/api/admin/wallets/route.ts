/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

interface BalanceEntry {
  currency: string;
  amount: number;
  frozen: number;
}

// GET /api/admin/wallets — list all wallets with user info
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [wallets, total] = await Promise.all([
      Wallet.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Wallet.countDocuments(filter),
    ]);

    const userIds = [...new Set(wallets.map((w) => w.userId.toString()))];
    const users = userIds.length > 0
      ? await User.find({ _id: { $in: userIds } }).select('name email role status').lean()
      : [];
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const enriched = wallets.map((w) => ({
      ...w,
      _id: w._id.toString(),
      user: userMap.get(w.userId.toString()) || null,
    }));

    const totalEquityAgg = await Wallet.aggregate([
      { $group: { _id: null, totalEquity: { $sum: '$totalEquity' } } },
    ]);
    const totalEquity = totalEquityAgg[0]?.totalEquity || 0;

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
    await connectDB();
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

    const wFilter: Record<string, any> = { userId };
    if (walletType) wFilter.type = walletType;
    let wallet = await Wallet.findOne(wFilter);

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        type: walletType || 'SPOT',
        status: 'ACTIVE',
        balances: [],
        totalEquity: 0,
      });
    }

    if (wallet.status === 'FROZEN') {
      return NextResponse.json({ error: 'Wallet is frozen' }, { status: 400 });
    }

    const upperCurrency = currency.toUpperCase();
    let balanceEntry = wallet.balances.find((b: BalanceEntry) => b.currency === upperCurrency);
    if (!balanceEntry) {
      wallet.balances.push({ currency: upperCurrency, amount: 0, frozen: 0 });
      balanceEntry = wallet.balances[wallet.balances.length - 1];
    }

    const previousAmount = balanceEntry.amount;
    balanceEntry.amount += amount;

    if (balanceEntry.amount < 0) {
      return NextResponse.json({ error: 'Insufficient balance for this adjustment' }, { status: 400 });
    }

    wallet.totalEquity = wallet.balances.reduce(
      (sum: number, b: BalanceEntry) => sum + b.amount + b.frozen,
      0
    );
    await wallet.save();

    const tx = await Transaction.create({
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
        walletId: wallet._id.toString(),
        previousAmount,
        newAmount: balanceEntry.amount,
      },
    });

    return NextResponse.json({
      message: 'Balance adjusted successfully',
      wallet,
      transaction: tx,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}