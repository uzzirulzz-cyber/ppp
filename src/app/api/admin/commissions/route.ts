import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

const DEFAULT_COMMISSION_SETTINGS = {
  spotMakerFee: 0.001,
  spotTakerFee: 0.0015,
  futuresMakerFee: 0.0002,
  futuresTakerFee: 0.0005,
  agentCommissionRate: 0.15,
  referralLevel1Rate: 0.05,
  referralLevel2Rate: 0.02,
  referralLevel3Rate: 0.01,
  minCommissionUsd: 0.01,
  maxCommissionUsd: 1000,
  withdrawalFeeRate: 0.001,
  depositFeeRate: 0,
};

let commissionSettings = { ...DEFAULT_COMMISSION_SETTINGS };

// GET /api/admin/commissions — retrieve commission settings
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
      settings: commissionSettings,
      message: 'Commission settings retrieved successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/commissions — update commission settings
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
    const allowedFields = Object.keys(DEFAULT_COMMISSION_SETTINGS);
    const updates: Record<string, number> = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && typeof value === 'number' && value >= 0) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed fields: ' + allowedFields.join(', ') },
        { status: 400 },
      );
    }

    if (updates.referralLevel1Rate !== undefined && updates.referralLevel1Rate > 0.2) {
      return NextResponse.json({ error: 'Level 1 referral rate cannot exceed 20%' }, { status: 400 });
    }
    if (updates.agentCommissionRate !== undefined && updates.agentCommissionRate > 0.5) {
      return NextResponse.json({ error: 'Agent commission rate cannot exceed 50%' }, { status: 400 });
    }
    if (updates.spotMakerFee !== undefined && updates.spotMakerFee > 0.01) {
      return NextResponse.json({ error: 'Spot maker fee cannot exceed 1%' }, { status: 400 });
    }
    if (updates.futuresTakerFee !== undefined && updates.futuresTakerFee > 0.01) {
      return NextResponse.json({ error: 'Futures taker fee cannot exceed 1%' }, { status: 400 });
    }

    commissionSettings = { ...commissionSettings, ...updates };

    return NextResponse.json({
      message: 'Commission settings updated successfully',
      settings: commissionSettings,
      updatedFields: Object.keys(updates),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}