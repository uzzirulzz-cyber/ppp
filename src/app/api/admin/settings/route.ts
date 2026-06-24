/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import User from '@/models/User';

const DEFAULT_SYSTEM_SETTINGS = {
  platformName: 'NexTrade Pro',
  platformDescription: 'Professional Crypto Trading Platform',
  platformUrl: 'https://nextrade.pro',
  supportEmail: 'support@nextrade.pro',
  supportTelegram: '@nextrade_support',
  registrationEnabled: true,
  invitationOnly: true,
  emailVerificationRequired: false,
  defaultUserRole: 'USER',
  tradingEnabled: true,
  spotTradingEnabled: true,
  futuresTradingEnabled: true,
  earnEnabled: true,
  supportedPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT'],
  defaultCurrency: 'USDT',
  depositsEnabled: true,
  withdrawalsEnabled: true,
  minDepositUsd: 10,
  maxWithdrawalPerDay: 50000,
  minWithdrawalUsd: 5,
  twoFactorRequired: false,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 30,
  ipWhitelist: [] as string[],
  primaryColor: '#10b981',
  logoUrl: '',
  faviconUrl: '',
  maintenanceMode: false,
  maintenanceMessage: 'NexTrade Pro is undergoing scheduled maintenance. We will be back shortly.',
  scheduledMaintenanceStart: null as string | null,
  scheduledMaintenanceEnd: null as string | null,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  apiDocsEnabled: true,
  maxApiKeysPerUser: 5,
  termsOfServiceUrl: '/terms',
  privacyPolicyUrl: '/privacy',
};

let systemSettings = { ...DEFAULT_SYSTEM_SETTINGS };

// GET /api/admin/settings — retrieve system settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const [totalUsers, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
    ]);

    return NextResponse.json({
      settings: systemSettings,
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
      if (key in DEFAULT_SYSTEM_SETTINGS) {
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

    const warnings: string[] = [];
    if (updates.maintenanceMode === true && !systemSettings.maintenanceMode) {
      warnings.push('Maintenance mode has been ENABLED. All users will see the maintenance page.');
    }
    if (updates.tradingEnabled === false && systemSettings.tradingEnabled) {
      warnings.push('Trading has been DISABLED. All open orders will remain but new orders will be rejected.');
    }
    if (updates.withdrawalsEnabled === false && systemSettings.withdrawalsEnabled) {
      warnings.push('Withdrawals have been DISABLED. Pending withdrawals will need manual review.');
    }

    systemSettings = { ...systemSettings, ...updates };

    return NextResponse.json({
      message: 'System settings updated successfully',
      settings: systemSettings,
      updatedFields: Object.keys(updates),
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}