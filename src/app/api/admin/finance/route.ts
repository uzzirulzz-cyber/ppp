import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/finance — Financial ledger with RBAC
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (payload!.role === 'SUB_AGENT') {
      const myCustomers = await prisma.user.findMany({
        where: { agentId: payload!.userId },
        select: { id: true },
      });
      where.userId = { in: myCustomers.map(c => c.id) };
    }

    const [ledger, total] = await Promise.all([
      prisma.financialLedger.findMany({
        where,
        include: {
          user: {
            select: { id: true, uid: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.financialLedger.count({ where }),
    ]);

    // Summary stats
    const summary = await prisma.user.aggregate({
      where: payload!.role === 'SUB_AGENT' ? { id: payload!.userId } : {},
      _sum: { balance: true, frozenBalance: true, bonusBalance: true, totalProfit: true },
    });

    return NextResponse.json({
      success: true,
      ledger: ledger.map(l => ({
        id: l.id,
        userId: l.user.uid,
        username: l.user.username,
        type: l.type,
        amount: l.amount,
        balance: l.balance,
        description: l.description,
        referenceId: l.referenceId,
        createdBy: l.createdBy,
        createdAt: l.createdAt,
      })),
      summary: {
        totalBalance: summary._sum.balance || 0,
        totalFrozen: summary._sum.frozenBalance || 0,
        totalBonus: summary._sum.bonusBalance || 0,
        totalProfit: summary._sum.totalProfit || 0,
      },
      pagination: { page, limit, total },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch finance data';
    console.error('Admin finance error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/admin/finance — Manual balance adjustment
export async function POST(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const body = await request.json();
    const { targetUserId, type, amount, description } = body;

    if (!targetUserId || !type || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Missing or invalid fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Sub-agents can only adjust their own customers
    if (payload!.role === 'SUB_AGENT' && user.subAgentId !== payload!.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized to adjust this user' }, { status: 403 });
    }

    let updateData: Record<string, unknown> = {};
    if (type === 'credit') {
      updateData = { balance: { increment: amount } };
    } else if (type === 'debit') {
      if (user.balance < amount) {
        return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
      }
      updateData = { balance: { decrement: amount } };
    } else if (type === 'freeze') {
      if (user.balance < amount) {
        return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
      }
      updateData = { balance: { decrement: amount }, frozenBalance: { increment: amount } };
    } else if (type === 'unfreeze') {
      if (user.frozenBalance < amount) {
        return NextResponse.json({ success: false, message: 'Insufficient frozen balance' }, { status: 400 });
      }
      updateData = { balance: { increment: amount }, frozenBalance: { decrement: amount } };
    } else {
      return NextResponse.json({ success: false, message: 'Invalid adjustment type' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: targetUserId }, data: updateData });

    await prisma.financialLedger.create({
      data: {
        userId: targetUserId,
        type: `manual_${type}`,
        amount,
        balance: user.balance,
        description: description || `Manual ${type} by admin`,
        createdBy: payload!.userId,
      },
    });

    return NextResponse.json({ success: true, message: `${type} adjustment completed` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to adjust balance';
    console.error('Finance adjustment error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}