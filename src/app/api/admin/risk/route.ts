/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

const DEFAULT_RISK_SETTINGS = {
  maxLeverage: 125,
  defaultLeverage: 10,
  initialMarginRate: 0.01,
  maintenanceMarginRate: 0.005,
  maxPositionSizeUsd: 1000000,
  maxOpenPositionsPerUser: 50,
  maxOpenPositionsPerSymbol: 10,
  liquidationThreshold: 0.5,
  autoLiquidation: true,
  liquidationFeeRate: 0.015,
  enableStopLoss: true,
  enableTakeProfit: true,
  requireStopLoss: false,
  maxDailyLossPerUser: 50000,
  maxDailyLossPlatform: 5000000,
  priceDeviationAlertThreshold: 0.1,
  restrictedSymbols: [] as string[],
  maintenanceMode: false,
  newUserCooldownHours: 24,
  kycRequiredForTrading: false,
  kycRequiredForWithdrawal: true,
  maxDailyProfitPerUser: 500000,
  maxTradePnlPercent: 1000,
  apiRateLimitPerMinute: 60,
  orderRateLimitPerMinute: 30,
};

let riskSettings = { ...DEFAULT_RISK_SETTINGS };

// GET /api/admin/risk — retrieve risk management settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    return NextResponse.json({
      settings: riskSettings,
      message: 'Risk management settings retrieved successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/risk — update risk management settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const body = await request.json();
    const skipFields = new Set(['_id', 'createdAt', 'updatedAt']);
    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (skipFields.has(key)) continue;
      if (key in DEFAULT_RISK_SETTINGS) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    if (updates.maxLeverage !== undefined) {
      if (updates.maxLeverage < 1 || updates.maxLeverage > 200) {
        return NextResponse.json({ error: 'Max leverage must be between 1 and 200' }, { status: 400 });
      }
    }
    if (updates.defaultLeverage !== undefined) {
      if (updates.defaultLeverage < 1 || updates.defaultLeverage > 125) {
        return NextResponse.json({ error: 'Default leverage must be between 1 and 125' }, { status: 400 });
      }
    }
    if (updates.liquidationThreshold !== undefined) {
      if (updates.liquidationThreshold < 0.1 || updates.liquidationThreshold > 1) {
        return NextResponse.json({ error: 'Liquidation threshold must be between 0.1 and 1' }, { status: 400 });
      }
    }
    if (updates.restrictedSymbols !== undefined && !Array.isArray(updates.restrictedSymbols)) {
      return NextResponse.json({ error: 'restrictedSymbols must be an array' }, { status: 400 });
    }

    riskSettings = { ...riskSettings, ...updates };

    const changedFields = Object.keys(updates);

    return NextResponse.json({
      message: 'Risk management settings updated successfully',
      settings: riskSettings,
      updatedFields: changedFields,
      auditInfo: { changedBy: payload.userId, changedAt: new Date().toISOString() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}