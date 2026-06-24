import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

interface AuditLogEntry {
  _id: string;
  action: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, string | number | boolean>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    _id: 'audit_001',
    action: 'USER_STATUS_CHANGE',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetId: 'user_001',
    targetType: 'User',
    details: { from: 'ACTIVE', to: 'SUSPENDED', reason: 'Suspicious activity detected' },
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'audit_002',
    action: 'WALLET_ADJUSTMENT',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetId: 'wallet_001',
    targetType: 'Wallet',
    details: { currency: 'USDT', amount: 500, reason: 'Promotional bonus' },
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'audit_003',
    action: 'COMMISSION_SETTINGS_UPDATE',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetType: 'Settings',
    details: { spotMakerFee: 0.001, spotTakerFee: 0.0015, updatedFields: 'spotMakerFee,spotTakerFee' },
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'audit_004',
    action: 'RISK_SETTINGS_UPDATE',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetType: 'Settings',
    details: { maxLeverage: 125, autoLiquidation: 1, updatedFields: 'maxLeverage,autoLiquidation' },
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'audit_005',
    action: 'BROADCAST_NOTIFICATION',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetType: 'Notification',
    details: { title: 'System Maintenance', recipientCount: 150, type: 'SYSTEM' },
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'audit_006',
    action: 'USER_CREATED',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetId: 'user_new_001',
    targetType: 'User',
    details: { name: 'New Trader', email: 'new@nextrade.pro', role: 'USER' },
    ip: '10.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: 'audit_007',
    action: 'AGENT_CONFIG_UPDATE',
    userId: 'admin_001',
    userEmail: 'admin@nextrade.pro',
    userName: 'System Admin',
    targetId: 'agent_001',
    targetType: 'AgentConfig',
    details: { commissionRate: 0.15, maxLeverage: 100, maxUsers: 200 },
    ip: '192.168.1.3',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

// GET /api/admin/audit — retrieve audit logs
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
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';
    const targetType = searchParams.get('targetType') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let filtered = [...auditLogs];

    if (action) {
      filtered = filtered.filter((log) => log.action === action);
    }
    if (userId) {
      filtered = filtered.filter((log) => log.userId === userId);
    }
    if (targetType) {
      filtered = filtered.filter((log) => log.targetType === targetType);
    }
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((log) => new Date(log.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((log) => new Date(log.createdAt) <= end);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    const actionCounts: Record<string, number> = {};
    for (const log of auditLogs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    }

    return NextResponse.json({
      logs: paginated,
      availableActions: Object.keys(actionCounts),
      actionCounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}