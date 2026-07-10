import prisma from './db';

export const SETTINGS_KEYS = {
  COMMISSIONS: 'commission_settings',
  RISK: 'risk_settings',
  SYSTEM: 'system_settings',
} as const;

const DEFAULTS = {
  [SETTINGS_KEYS.COMMISSIONS]: {
    spotMakerFee: 0.001, spotTakerFee: 0.0015, futuresMakerFee: 0.0002, futuresTakerFee: 0.0005,
    agentCommissionRate: 0.15, referralLevel1Rate: 0.05, referralLevel2Rate: 0.02, referralLevel3Rate: 0.01,
    minCommissionUsd: 0.01, maxCommissionUsd: 1000, withdrawalFeeRate: 0.001, depositFeeRate: 0,
  },
  [SETTINGS_KEYS.RISK]: {
    maxLeverage: 125, defaultLeverage: 10, initialMarginRate: 0.01, maintenanceMarginRate: 0.005,
    maxPositionSizeUsd: 1000000, maxOpenPositionsPerUser: 50, maxOpenPositionsPerSymbol: 10,
    liquidationThreshold: 0.5, autoLiquidation: true, liquidationFeeRate: 0.015,
    enableStopLoss: true, enableTakeProfit: true, requireStopLoss: false,
    maxDailyLossPerUser: 50000, maxDailyLossPlatform: 5000000, priceDeviationAlertThreshold: 0.1,
    restrictedSymbols: [], maintenanceMode: false, newUserCooldownHours: 24,
    kycRequiredForTrading: false, kycRequiredForWithdrawal: true, maxDailyProfitPerUser: 500000,
    maxTradePnlPercent: 1000, apiRateLimitPerMinute: 60, orderRateLimitPerMinute: 30,
  },
  [SETTINGS_KEYS.SYSTEM]: {
    platformName: 'NexTrade Pro', platformDescription: 'Professional Crypto Trading Platform',
    platformUrl: 'https://nextrade.pro', supportEmail: 'support@nextrade.pro',
    supportTelegram: '@nextrade_support', registrationEnabled: true, invitationOnly: true,
    emailVerificationRequired: false, defaultUserRole: 'USER', tradingEnabled: true,
    spotTradingEnabled: true, futuresTradingEnabled: true, earnEnabled: true,
    supportedPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT'],
    defaultCurrency: 'USDT', depositsEnabled: true, withdrawalsEnabled: true,
    minDepositUsd: 10, maxWithdrawalPerDay: 50000, minWithdrawalUsd: 5,
    twoFactorRequired: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5,
    lockoutDurationMinutes: 30, ipWhitelist: [], primaryColor: '#10b981',
    logoUrl: '', faviconUrl: '', maintenanceMode: false,
    maintenanceMessage: 'NexTrade Pro is undergoing scheduled maintenance. We will be back shortly.',
    scheduledMaintenanceStart: null, scheduledMaintenanceEnd: null,
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    apiDocsEnabled: true, maxApiKeysPerUser: 5, termsOfServiceUrl: '/terms',
    privacyPolicyUrl: '/privacy',
  },
} as const;

export async function getSetting<T>(key: string): Promise<T> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  if (!setting) {
    const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];
    if (defaultValue) {
      await prisma.systemSetting.create({ data: { key, value: defaultValue as any } });
      return defaultValue as unknown as T;
    }
    throw new Error(`Unknown setting key: ${key}`);
  }
  return setting.value as unknown as T;
}

export async function updateSetting(key: string, updates: Record<string, any>): Promise<any> {
  const current = await getSetting(key);
  const merged = { ...current, ...updates };
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value: merged as any },
    create: { key, value: merged as any },
  });
}