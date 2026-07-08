/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import Wallet from '@/models/Wallet';
import Trade from '@/models/Trade';
import Transaction from '@/models/Transaction';

const VALID_SIDES = ['BUY', 'SELL'];
const VALID_TYPES = ['MARKET', 'LIMIT'];
const VALID_STATUSES = ['OPEN', 'CLOSED', 'CANCELLED', 'LIQUIDATED'];

interface BalanceEntry {
  currency: string;
  amount: number;
  frozen: number;
}

// POST /api/trades — place a new trade
export async function POST(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request);
    if (response) return response;

    const body = await request.json();
    const {
      symbol,
      side,
      type: orderType,
      quantity,
      leverage,
      price,
      stopLoss,
      takeProfit,
    } = body;

    // ── Validation ──
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
    }
    const upperSymbol = symbol.toUpperCase();

    if (!side || !VALID_SIDES.includes(side.toUpperCase())) {
      return NextResponse.json({ error: `side is required and must be one of: ${VALID_SIDES.join(', ')}` }, { status: 400 });
    }
    const tradeSide = side.toUpperCase() as 'BUY' | 'SELL';

    const tradeType = (orderType || 'MARKET').toUpperCase();
    if (!VALID_TYPES.includes(tradeType)) {
      return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
    }

    if (tradeType === 'LIMIT' && (!price || typeof price !== 'number' || price <= 0)) {
      return NextResponse.json({ error: 'price is required for LIMIT orders and must be greater than 0' }, { status: 400 });
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'quantity is required and must be greater than 0' }, { status: 400 });
    }

    const tradeLeverage = Math.max(1, Math.min(125, parseInt(leverage) || 1));

    // For LIMIT orders, use the specified price as entry price
    const entryPrice = tradeType === 'LIMIT' ? price! : price && price > 0 ? price : 1; // MARKET price placeholder
    const margin = (quantity * entryPrice) / tradeLeverage;

    // ── Find SPOT wallet ──
    const wallet = await Wallet.findOne({ userId: payload.userId, type: 'SPOT' });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found. Please create a wallet first.' }, { status: 400 });
    }
    if (wallet.status === 'FROZEN') {
      return NextResponse.json({ error: 'Wallet is frozen. Cannot place trades.' }, { status: 400 });
    }

    // ── Check & deduct margin ──
    if (tradeSide === 'BUY') {
      // BUY orders: deduct margin in USDT (or quote currency)
      const quoteCurrency = 'USDT';
      const balanceEntry = wallet.balances.find(
        (b: BalanceEntry) => b.currency === quoteCurrency
      ) as BalanceEntry | undefined;

      if (!balanceEntry || balanceEntry.amount < margin) {
        const available = balanceEntry ? balanceEntry.amount : 0;
        return NextResponse.json(
          { error: `Insufficient ${quoteCurrency} balance for margin. Required: ${margin.toFixed(2)}, Available: ${available.toFixed(2)}` },
          { status: 400 }
        );
      }

      balanceEntry.amount -= margin;
      balanceEntry.frozen += margin;
    } else {
      // SELL orders: check if user has enough of the base currency
      const baseCurrency = upperSymbol;
      const balanceEntry = wallet.balances.find(
        (b: BalanceEntry) => b.currency === baseCurrency
      ) as BalanceEntry | undefined;

      if (!balanceEntry || balanceEntry.amount < quantity) {
        const available = balanceEntry ? balanceEntry.amount : 0;
        return NextResponse.json(
          { error: `Insufficient ${baseCurrency} balance. Required: ${quantity}, Available: ${available}` },
          { status: 400 }
        );
      }

      balanceEntry.amount -= quantity;
      balanceEntry.frozen += quantity;
    }

    wallet.totalEquity = wallet.balances.reduce(
      (sum: number, b: BalanceEntry) => sum + b.amount + b.frozen,
      0
    );
    await wallet.save();

    // ── Create Trade record ──
    const trade = await Trade.create({
      userId: payload.userId,
      symbol: upperSymbol,
      side: tradeSide,
      type: tradeType,
      status: 'OPEN',
      entryPrice,
      quantity,
      leverage: tradeLeverage,
      margin,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: stopLoss && stopLoss > 0 ? stopLoss : undefined,
      takeProfit: takeProfit && takeProfit > 0 ? takeProfit : undefined,
      agentId: payload.agentId || undefined,
    });

    // ── Create Transaction record ──
    const marginCurrency = tradeSide === 'BUY' ? 'USDT' : upperSymbol;
    await Transaction.create({
      userId: payload.userId,
      type: 'TRADE',
      status: 'COMPLETED',
      currency: marginCurrency,
      amount: tradeSide === 'BUY' ? margin : quantity,
      fee: 0,
      tradeId: trade._id.toString(),
      description: `${tradeSide} ${quantity} ${upperSymbol} (${tradeType}, ${tradeLeverage}x) @ ${entryPrice}`,
      metadata: {
        symbol: upperSymbol,
        side: tradeSide,
        orderType: tradeType,
        leverage: tradeLeverage,
        entryPrice,
        quantity,
        margin,
      },
    });

    return NextResponse.json({
      message: 'Trade placed successfully',
      trade: {
        _id: trade._id.toString(),
        userId: trade.userId,
        symbol: trade.symbol,
        side: trade.side,
        type: trade.type,
        status: trade.status,
        entryPrice: trade.entryPrice,
        quantity: trade.quantity,
        leverage: trade.leverage,
        margin: trade.margin,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        stopLoss: trade.stopLoss || null,
        takeProfit: trade.takeProfit || null,
        createdAt: trade.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/trades — user's trade history
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const statusFilter = searchParams.get('status') || '';
    const symbolFilter = searchParams.get('symbol') || '';

    const filter: Record<string, any> = { userId: payload.userId };
    if (statusFilter && VALID_STATUSES.includes(statusFilter.toUpperCase())) {
      filter.status = statusFilter.toUpperCase();
    }
    if (symbolFilter) {
      filter.symbol = symbolFilter.toUpperCase();
    }

    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Trade.countDocuments(filter),
    ]);

    const enriched = trades.map((t) => ({
      _id: t._id.toString(),
      userId: t.userId,
      symbol: t.symbol,
      side: t.side,
      type: t.type,
      status: t.status,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice || null,
      quantity: t.quantity,
      leverage: t.leverage,
      margin: t.margin,
      pnl: t.pnl,
      pnlPercent: t.pnlPercent,
      stopLoss: t.stopLoss || null,
      takeProfit: t.takeProfit || null,
      closedAt: t.closedAt || null,
      agentId: t.agentId || null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({
      trades: enriched,
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