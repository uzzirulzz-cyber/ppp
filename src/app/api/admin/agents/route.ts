/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import User from '@/models/User';
import AgentConfig from '@/models/AgentConfig';
import Wallet from '@/models/Wallet';
import Referral from '@/models/Referral';

// GET /api/admin/agents — list all agents with their configs and stats
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const agents = await User.find({ role: 'SUB_AGENT' }).select('-password').sort({ createdAt: -1 }).lean();
    const agentIds = agents.map((a) => a._id.toString());

    const configs = await AgentConfig.find({ agentId: { $in: agentIds } }).lean();
    const configMap = new Map<string, any>();
    for (const c of configs) configMap.set(c.agentId.toString(), c);

    const userCounts = await User.aggregate([
      { $match: { agentId: { $in: agentIds }, role: 'USER' } },
      { $group: { _id: '$agentId', count: { $sum: 1 } } },
    ]);
    const userCountMap = new Map<string, number>();
    for (const uc of userCounts) userCountMap.set(uc._id.toString(), uc.count);

    const referralStats = await Referral.aggregate([
      { $match: { referrerId: { $in: agentIds } } },
      { $group: { _id: '$referrerId', totalCommission: { $sum: '$totalCommission' }, referrals: { $sum: 1 } } },
    ]);
    const referralMap = new Map<string, any>();
    for (const rs of referralStats) referralMap.set(rs._id.toString(), rs);

    const agentUserWallets = await Wallet.find({ userId: { $in: agentIds } }).lean();
    const agentWalletMap = new Map<string, number>();
    for (const w of agentUserWallets) {
      const uid = w.userId.toString();
      agentWalletMap.set(uid, (agentWalletMap.get(uid) || 0) + (w.totalEquity || 0));
    }

    const enriched = agents.map((a) => {
      const id = a._id.toString();
      return {
        ...a,
        _id: id,
        config: configMap.get(id) || null,
        userCount: userCountMap.get(id) || 0,
        referralStats: referralMap.get(id) || { totalCommission: 0, referrals: 0 },
        totalEquity: agentWalletMap.get(id) || 0,
      };
    });

    return NextResponse.json({ agents: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/agents — update an agent's config
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
    const { agentId, commissionRate, referralRate, maxUsers, maxLeverage, allowedSymbols, riskLimit, status, role } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'SUB_AGENT') {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const userUpdate: Record<string, any> = {};
    if (status) userUpdate.status = status;
    if (role) userUpdate.role = role;
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(agentId, userUpdate);
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
      config = await AgentConfig.findOneAndUpdate(
        { agentId },
        { $set: configUpdate },
        { new: true, upsert: true }
      ).lean();
    } else {
      config = await AgentConfig.findOne({ agentId }).lean();
    }

    return NextResponse.json({ message: 'Agent updated successfully', config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}