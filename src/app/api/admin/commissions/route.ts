import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/rbac';
import { getSetting, updateSetting, SETTINGS_KEYS } from '@/lib/settings';

const ALLOWED_FIELDS = [
  'spotMakerFee', 'spotTakerFee', 'futuresMakerFee', 'futuresTakerFee',
  'agentCommissionRate', 'referralLevel1Rate', 'referralLevel2Rate', 'referralLevel3Rate',
  'minCommissionUsd', 'maxCommissionUsd', 'withdrawalFeeRate', 'depositFeeRate',
];

// GET /api/admin/commissions — retrieve commission settings
export async function GET(request: NextRequest) {
  try {
    const { response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const settings = await getSetting(SETTINGS_KEYS.COMMISSIONS);

    return NextResponse.json({
      settings,
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
    const { response } = authenticate(request, ['SUPER_ADMIN']);
    if (response) return response;

    const body = await request.json();
    const updates: Record<string, number> = {};

    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.includes(key) && typeof value === 'number' && value >= 0) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed fields: ' + ALLOWED_FIELDS.join(', ') },
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

    const settings = await updateSetting(SETTINGS_KEYS.COMMISSIONS, updates);

    return NextResponse.json({
      message: 'Commission settings updated successfully',
      settings: settings.value,
      updatedFields: Object.keys(updates),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}