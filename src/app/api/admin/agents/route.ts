/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

// GET /api/admin/agents — list all agents with their configs and stats
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.role || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'SUB_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const agents = await prisma.user.findMany({
      where: { role: 'SUB_AGENT' },
      select: { id: true, name: true, firstName: true, lastName: true, email: true, role: true, status: true, avatar: true, phone: true, agentId: true, lastLogin: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const agentIds = agents.map(a => a.id);

    const configs = await prisma.agentConfig.findMany({ where: { agentId: { in: agentIds } } });
    const configMap = new Map<string, any>();
    for (const c of configs) configMap.set(c.agentId, c);

    // User counts per agent
    const userCounts = await prisma.user.groupBy({
      by: ['agentId'],
      where: { agentId: { in: agentIds }, role: 'USER' },
      _count: { id: true },
    });
    const userCountMap = new Map<string, number>();
    for (const uc of userCounts) userCountMap.set(uc.agentId!, uc._count.id);

    // Referral stats per agent
    const referralStats = await prisma.referral.groupBy({
      by: ['referrerId'],
      where: { referrerId: { in: agentIds } },
      _count: { id: true },
      _sum: { totalCommission: true },
    });
    const referralMap = new Map<string, any>();
    for (const rs of referralStats) referralMap.set(rs.referrerId, { totalCommission: rs._sum.totalCommission || 0, referrals: rs._count.id });

    // Agent wallet equity
    const agentUserWallets = await prisma.wallet.findMany({ where: { userId: { in: agentIds } } });
    const agentWalletMap = new Map<string, number>();
    for (const w of agentUserWallets) {
      agentWalletMap.set(w.userId, (agentWalletMap.get(w.userId) || 0) + (w.totalEquity || 0));
    }

    const enriched = agents.map(a => ({
      ...a,
      _id: a.id,
      config: configMap.get(a.id) || null,
      userCount: userCountMap.get(a.id) || 0,
      referralStats: referralMap.get(a.id) || { totalCommission: 0, referrals: 0 },
      totalEquity: agentWalletMap.get(a.id) || 0,
    }));

    return NextResponse.json({ agents: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/agents — update an agent's config
export async function PUT(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const body = await request.json();
    const { agentId, commissionRate, referralRate, maxUsers, maxLeverage, allowedSymbols, riskLimit, status, role } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || agent.role !== 'SUB_AGENT') {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const userUpdate: Record<string, any> = {};
    if (status) userUpdate.status = status;
    if (role) userUpdate.role = role;
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: agentId }, data: userUpdate });
    }

    const configUpdate: Record<string, any> = {};
    if (commissionRate !== undefined) configUpdate.commissionRate = commissionRate;
    if (referralRate !== undefined) configUpdate.referralRate = referralRate;
    if (maxUsers !== undefined) configUpdate.maxUsers = maxUsers;
    if (maxLeverage !== undefined) configUpdate.maxLeverage = maxLeverage;
    if (allowedSymbols !== undefined) configUpdate.allowedSymbols = allowedSymbols;
    if (riskLimit !== undefined) configUpdate.riskLimit = riskLimit;

    let config;
    if (Object.keys(configUpdate).length > 0) {
      config = await prisma.agentConfig.upsert({
        where: { agentId },
        update: configUpdate,
        create: { agentId, ...configUpdate },
      });
    } else {
      config = await prisma.agentConfig.findUnique({ where: { agentId } });
    }

    return NextResponse.json({ message: 'Agent updated successfully', config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}