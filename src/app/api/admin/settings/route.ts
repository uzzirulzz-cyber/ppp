import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';
import { getSetting, updateSetting, SETTINGS_KEYS } from '@/lib/settings';

const SYSTEM_FIELDS = [
  'platformName', 'platformDescription', 'platformUrl', 'supportEmail',
  'supportTelegram', 'registrationEnabled', 'invitationOnly',
  'emailVerificationRequired', 'defaultUserRole', 'tradingEnabled',
  'spotTradingEnabled', 'futuresTradingEnabled', 'earnEnabled',
  'supportedPairs', 'defaultCurrency', 'depositsEnabled', 'withdrawalsEnabled',
  'minDepositUsd', 'maxWithdrawalPerDay', 'minWithdrawalUsd',
  'twoFactorRequired', 'sessionTimeoutMinutes', 'maxLoginAttempts',
  'lockoutDurationMinutes', 'ipWhitelist', 'primaryColor',
  'logoUrl', 'faviconUrl', 'maintenanceMode',
  'maintenanceMessage', 'scheduledMaintenanceStart', 'scheduledMaintenanceEnd',
  'emailNotifications', 'pushNotifications', 'smsNotifications',
  'apiDocsEnabled', 'maxApiKeysPerUser', 'termsOfServiceUrl',
  'privacyPolicyUrl',
];

// GET /api/admin/settings — retrieve system settings
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const [totalUsers, activeUsers, settings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      getSetting(SETTINGS_KEYS.SYSTEM),
    ]);

    return NextResponse.json({
      settings,
      platformStats: { totalUsers, activeUsers },
      message: 'System settings retrieved successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/settings — update system settings
export async function PUT(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN']);
    if (response) return response;

    const body = await request.json();
    const skipFields = new Set(['_id', 'createdAt', 'updatedAt']);
    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (skipFields.has(key)) continue;
      if (SYSTEM_FIELDS.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    if (updates.supportedPairs !== undefined && !Array.isArray(updates.supportedPairs)) {
      return NextResponse.json({ error: 'supportedPairs must be an array' }, { status: 400 });
    }
    if (updates.ipWhitelist !== undefined && !Array.isArray(updates.ipWhitelist)) {
      return NextResponse.json({ error: 'ipWhitelist must be an array' }, { status: 400 });
    }

    const currentSettings = await getSetting(SETTINGS_KEYS.SYSTEM);
    const warnings: string[] = [];
    if (updates.maintenanceMode === true && !currentSettings.maintenanceMode) {
      warnings.push('Maintenance mode has been ENABLED. All users will see the maintenance page.');
    }
    if (updates.tradingEnabled === false && currentSettings.tradingEnabled) {
      warnings.push('Trading has been DISABLED. All open orders will remain but new orders will be rejected.');
    }
    if (updates.withdrawalsEnabled === false && currentSettings.withdrawalsEnabled) {
      warnings.push('Withdrawals have been DISABLED. Pending withdrawals will need manual review.');
    }

    const settings = await updateSetting(SETTINGS_KEYS.SYSTEM, updates);

    return NextResponse.json({
      message: 'System settings updated successfully',
      settings: settings.value,
      updatedFields: Object.keys(updates),
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}