/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import { getSetting, updateSetting, SETTINGS_KEYS } from '@/lib/settings';

const RISK_FIELDS = [
  'maxLeverage', 'defaultLeverage', 'initialMarginRate', 'maintenanceMarginRate',
  'maxPositionSizeUsd', 'maxOpenPositionsPerUser', 'maxOpenPositionsPerSymbol',
  'liquidationThreshold', 'autoLiquidation', 'liquidationFeeRate',
  'enableStopLoss', 'enableTakeProfit', 'requireStopLoss',
  'maxDailyLossPerUser', 'maxDailyLossPlatform', 'priceDeviationAlertThreshold',
  'restrictedSymbols', 'maintenanceMode', 'newUserCooldownHours',
  'kycRequiredForTrading', 'kycRequiredForWithdrawal', 'maxDailyProfitPerUser',
  'maxTradePnlPercent', 'apiRateLimitPerMinute', 'orderRateLimitPerMinute',
];

// GET /api/admin/risk — retrieve risk management settings
export async function GET(request: NextRequest) {
  try {
    const { response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const settings = await getSetting(SETTINGS_KEYS.RISK);

    return NextResponse.json({
      settings,
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
    const { payload, response } = authenticate(request, ['SUPER_ADMIN']);
    if (response) return response;

    const body = await request.json();
    const skipFields = new Set(['_id', 'createdAt', 'updatedAt']);
    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (skipFields.has(key)) continue;
      if (RISK_FIELDS.includes(key)) {
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

    const settings = await updateSetting(SETTINGS_KEYS.RISK, updates);
    const changedFields = Object.keys(updates);

    return NextResponse.json({
      message: 'Risk management settings updated successfully',
      settings: settings.value,
      updatedFields: changedFields,
      auditInfo: { changedBy: payload.userId, changedAt: new Date().toISOString() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}