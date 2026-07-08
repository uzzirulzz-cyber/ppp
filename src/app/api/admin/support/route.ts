import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/support — List support tickets with RBAC
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

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
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
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tickets: tickets.map(t => ({
        id: t.id,
        userId: t.user.uid,
        username: t.user.username,
        subject: t.subject,
        message: t.message,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedTo,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      pagination: { page, limit, total },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
    console.error('Admin support error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT /api/admin/support — Update ticket status/assignment
export async function PUT(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;
    const body = await request.json();
    const { ticketId, status, priority, assignedTo } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, message: 'Ticket ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket';
    console.error('Support update error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}