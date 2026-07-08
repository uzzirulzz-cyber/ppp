import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/deposits — List deposits with RBAC
export async function GET(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (payload!.role === 'SUB_AGENT') {
      const myCustomers = await prisma.user.findMany({
        where: { agentId: payload!.userId },
        select: { id: true },
      });
      where.userId = { in: myCustomers.map(c => c.id) };
    }

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
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
      prisma.deposit.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      deposits: deposits.map(d => ({
        id: d.id,
        userId: d.user.uid,
        username: d.user.username,
        amount: d.amount,
        method: d.method,
        status: d.status,
        txHash: d.txHash,
        note: d.note,
        reviewedBy: d.reviewedBy,
        reviewedAt: d.reviewedAt,
        createdAt: d.createdAt,
      })),
      pagination: { page, limit, total },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deposits';
    console.error('Admin deposits error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT /api/admin/deposits — Approve/reject deposit
export async function PUT(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const body = await request.json();
    const { depositId, action } = body;

    if (!depositId || !action) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) {
      return NextResponse.json({ success: false, message: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Deposit already processed' }, { status: 400 });
    }

    // Sub-agents can only manage their own customers
    if (payload!.role === 'SUB_AGENT') {
      const customer = await prisma.user.findFirst({
        where: { id: deposit.userId, subAgentId: payload.userId },
      });
      if (!customer) {
        return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
      }
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updated = await prisma.deposit.update({
      where: { id: depositId },
      data: { status: newStatus, reviewedBy: payload!.userId, reviewedAt: new Date() },
    });

    // If approved, credit user balance
    if (action === 'approve') {
      const updatedUser = await prisma.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      });
      await prisma.financialLedger.create({
        data: {
          userId: deposit.userId,
          type: 'deposit',
          amount: deposit.amount,
          balance: updatedUser.balance,
          description: `Deposit approved via ${deposit.method}`,
          referenceId: deposit.id,
          createdBy: payload.userId,
        },
      });
    }

    return NextResponse.json({ success: true, deposit: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update deposit';
    console.error('Deposit update error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}