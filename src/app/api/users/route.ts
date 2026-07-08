import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/users?search=&status= — List users with RBAC filtering
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const subAgentId = searchParams.get('subAgentId') || '';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build where clause with RBAC
    const where: Record<string, unknown> = {};

    // Sub-agents can only see their own customers
    if (payload!.role === 'SUB_AGENT') {
      where.agentId = payload!.userId;
    }

    // Filter by specific sub-agent (super_admin viewing a sub-agent's customers)
    if (subAgentId && payload!.role === 'SUPER_ADMIN') {
      where.agentId = subAgentId;
    }

    // Search by username, email, or UID
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { uid: { contains: search } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        uid: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        frozenBalance: true,
        bonusBalance: true,
        totalProfit: true,
        subAgentId: true,
        invitationCode: true,
        mustChangePass: true,
        createdAt: true,
        _count: {
          select: {
            trades: true,
            deposits: true,
            withdrawals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get sub-agent info for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        let subAgentName = null;
        if (user.subAgentId) {
          const agent = await prisma.user.findUnique({
            where: { id: user.subAgentId },
            select: { username: true, email: true },
          });
          subAgentName = agent?.username || null;
        }
        return {
          ...user,
          subAgentName,
          tradeCount: user._count.trades,
        };
      })
    );

    return NextResponse.json({ success: true, users: enrichedUsers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    console.error('Users fetch error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT /api/users — Update user status, balance, etc.
export async function PUT(request: NextRequest) {
  try {
    const { response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'suspend':
        result = await prisma.user.update({ where: { id: userId }, data: { status: 'suspended' } });
        break;
      case 'activate':
        result = await prisma.user.update({ where: { id: userId }, data: { status: 'active' } });
        break;
      case 'ban':
        result = await prisma.user.update({ where: { id: userId }, data: { status: 'banned' } });
        break;
      case 'add_balance':
        if (!data?.amount) return NextResponse.json({ success: false, message: 'Amount required' }, { status: 400 });
        const userToAdd = await prisma.user.findUnique({ where: { id: userId } });
        if (!userToAdd) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        result = await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: data.amount } },
        });
        break;
      case 'subtract_balance':
        if (!data?.amount) return NextResponse.json({ success: false, message: 'Amount required' }, { status: 400 });
        result = await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: data.amount } },
        });
        break;
      case 'reset_password': {
        const newPwd = data?.password || 'default';
        const { hashPassword } = await import('@/lib/auth');
        result = await prisma.user.update({
          where: { id: userId },
          data: { password: await hashPassword(newPwd), mustChangePassword: true },
        });
        break;
      }
      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    console.error('User update error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}