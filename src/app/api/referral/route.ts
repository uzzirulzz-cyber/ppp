import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

// GET /api/referral — fetch referral stats and history for the current user
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = payload.userId;

    // Fetch user to get their invitation code (the one they registered with)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, invitationCode: true, agentId: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Build the user's display referral code
    let referralCode = user.invitationCode || '';

    // If the user is a sub-agent or admin, fetch their invitation codes
    const invitationCodes = await prisma.invitationCode.findMany({
      where: { createdBy: userId },
      select: { code: true, status: true, usedBy: true, usedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // For sub-agents with invitation codes, use the first one as the primary referral code
    if (invitationCodes.length > 0 && (!referralCode || user.role === 'SUB_AGENT')) {
      referralCode = invitationCodes[0].code;
    }

    // Fetch referrals where this user is the referrer
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch referred users in a separate query (no Prisma relation)
    const referredIds = referrals.map((r) => r.referredId).filter(Boolean);
    const referredUsers = referredIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: referredIds } },
          select: { id: true, name: true, email: true, status: true, createdAt: true },
        })
      : [];

    const userMap = new Map(referredUsers.map((u) => [u.id, u]));

    // Build referral history
    const referralHistory = referrals.map((r) => {
      const referred = userMap.get(r.referredId);
      return {
        id: r.id,
        referredUser: referred
          ? {
              id: referred.id,
              name: referred.name,
              email: referred.email,
              status: referred.status,
              createdAt: referred.createdAt,
            }
          : { id: r.referredId, name: 'Unknown', email: '', status: 'UNKNOWN', createdAt: r.createdAt },
        referralCode: r.referralCode,
        level: r.level,
        totalCommission: r.totalCommission,
        isActive: r.isActive,
        createdAt: r.createdAt,
      };
    });

    // Calculate stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r) => {
      const u = userMap.get(r.referredId);
      return r.isActive && u?.status === 'ACTIVE';
    }).length;
    const totalCommissionEarned = referrals.reduce((sum, r) => sum + r.totalCommission, 0);

    // Determine tier based on total referrals
    let tier = 'Bronze';
    let commissionRate = 0.05;
    if (totalReferrals >= 50) {
      tier = 'Gold';
      commissionRate = 0.12;
    } else if (totalReferrals >= 11) {
      tier = 'Silver';
      commissionRate = 0.08;
    }

    return NextResponse.json({
      referralCode,
      referralLink: referralCode ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://nextrade.pro'}/ref/${referralCode}` : '',
      stats: {
        totalReferrals,
        activeReferrals,
        totalCommissionEarned,
        tier,
        commissionRate,
      },
      referralHistory,
      invitationCodes: user.role === 'SUPER_ADMIN' || user.role === 'SUB_AGENT' ? invitationCodes : [],
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
  }
}