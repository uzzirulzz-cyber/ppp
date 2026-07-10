/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/audit — Real audit logs from LoginLog + admin transaction metadata
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const action = searchParams.get('action') || '';

    // Fetch login logs
    const loginWhere: any = {};
    if (action === 'LOGIN') loginWhere.success = true;
    if (action === 'LOGIN_FAILED') loginWhere.success = false;

    const loginLogs = await prisma.loginLog.findMany({
      where: loginWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });
    const loginTotal = await prisma.loginLog.count({ where: loginWhere });

    // Fetch admin transactions (balance adjustments) as audit entries
    const adminTxWhere: any = {
      metadata: { path: ['adminAction'], equals: true },
    };
    const adminTxLogs = await prisma.transaction.findMany({
      where: adminTxWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    // Combine and format audit entries
    const loginEntries = loginLogs.map(l => ({
      _id: l.id,
      action: l.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      userId: l.userId,
      userEmail: l.user?.email || l.email,
      userName: l.user?.name || '',
      targetType: 'Auth',
      details: {
        success: l.success,
        ip: l.ip || 'unknown',
        userAgent: (l.userAgent || '').substring(0, 80),
      },
      ip: l.ip,
      createdAt: l.createdAt.toISOString(),
    }));

    const txEntries = adminTxLogs.map(tx => ({
      _id: tx.id,
      action: 'WALLET_ADJUSTMENT',
      userId: tx.userId,
      userEmail: tx.user?.email || '',
      userName: tx.user?.name || '',
      targetType: 'Wallet',
      targetId: (tx.metadata as any)?.walletId || '',
      details: {
        currency: tx.currency,
        amount: tx.amount,
        previousAmount: (tx.metadata as any)?.previousAmount,
        newAmount: (tx.metadata as any)?.newAmount,
        adminId: (tx.metadata as any)?.adminId || '',
      },
      createdAt: tx.createdAt.toISOString(),
    }));

    // Merge and sort by time
    const allLogs = [...loginEntries, ...txEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // If a specific action filter is set and it's not LOGIN/LOGIN_FAILED, filter tx entries
    const filtered = action && action !== 'LOGIN' && action !== 'LOGIN_FAILED'
      ? allLogs.filter(l => l.action === action)
      : allLogs;

    const total = action === 'LOGIN' || action === 'LOGIN_FAILED' ? loginTotal : filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Action counts
    const actionCounts: Record<string, number> = {};
    for (const log of allLogs) {
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