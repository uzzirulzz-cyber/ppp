/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import WithdrawalRequest from '@/models/WithdrawalRequest';

const VALID_METHODS = ['JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'VISA', 'MASTERCARD'];

interface BalanceEntry {
  currency: string;
  amount: number;
  frozen: number;
}

// POST /api/wallet/withdraw — user-initiated withdrawal
export async function POST(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request);
    if (response) return response;

    const body = await request.json();
    const { currency, amount, method, accountNumber, accountName } = body;

    // ── Validation ──
    if (!currency || typeof currency !== 'string' || currency.trim().length === 0) {
      return NextResponse.json({ error: 'currency is required' }, { status: 400 });
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount is required and must be greater than 0' }, { status: 400 });
    }
    if (!method || !VALID_METHODS.includes(method)) {
      return NextResponse.json({ error: `method is required and must be one of: ${VALID_METHODS.join(', ')}` }, { status: 400 });
    }
    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim().length === 0) {
      return NextResponse.json({ error: 'accountNumber is required' }, { status: 400 });
    }
    if (!accountName || typeof accountName !== 'string' || accountName.trim().length === 0) {
      return NextResponse.json({ error: 'accountName is required' }, { status: 400 });
    }

    const upperCurrency = currency.toUpperCase();

    // ── Calculate fee ──
    let fee: number;
    if (upperCurrency === 'PKR') {
      fee = Math.max(50, amount * 0.02);
    } else {
      fee = Math.max(1, amount * 0.01);
    }
    const netAmount = amount - fee;

    if (netAmount <= 0) {
      return NextResponse.json({ error: 'Amount too small after fee deduction' }, { status: 400 });
    }

    // ── Find SPOT wallet ──
    const wallet = await Wallet.findOne({ userId: payload.userId, type: 'SPOT' });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found. Please create a wallet first.' }, { status: 400 });
    }
    if (wallet.status === 'FROZEN') {
      return NextResponse.json({ error: 'Wallet is frozen. Cannot process withdrawal.' }, { status: 400 });
    }

    // ── Check sufficient balance ──
    const balanceEntry = wallet.balances.find(
      (b: BalanceEntry) => b.currency === upperCurrency
    ) as BalanceEntry | undefined;

    if (!balanceEntry || balanceEntry.amount < amount) {
      const available = balanceEntry ? balanceEntry.amount : 0;
      return NextResponse.json(
        { error: `Insufficient ${upperCurrency} balance. Available: ${available}` },
        { status: 400 }
      );
    }

    // ── Freeze the amount ──
    balanceEntry.amount -= amount;
    balanceEntry.frozen += amount;

    wallet.totalEquity = wallet.balances.reduce(
      (sum: number, b: BalanceEntry) => sum + b.amount + b.frozen,
      0
    );
    await wallet.save();

    // ── Create WithdrawalRequest ──
    const withdrawal = await WithdrawalRequest.create({
      userId: payload.userId,
      currency: upperCurrency,
      amount,
      fee,
      netAmount,
      method,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      status: 'PENDING',
    });

    // ── Create PENDING Transaction record ──
    const tx = await Transaction.create({
      userId: payload.userId,
      type: 'WITHDRAW',
      status: 'PENDING',
      currency: upperCurrency,
      amount,
      fee,
      description: `Withdrawal request: ${amount} ${upperCurrency} via ${method}`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        method,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      },
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        _id: withdrawal._id.toString(),
        userId: withdrawal.userId,
        currency: withdrawal.currency,
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        netAmount: withdrawal.netAmount,
        method: withdrawal.method,
        accountNumber: withdrawal.accountNumber,
        accountName: withdrawal.accountName,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
      transaction: {
        _id: tx._id.toString(),
        type: tx.type,
        status: tx.status,
        currency: tx.currency,
        amount: tx.amount,
        fee: tx.fee,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}