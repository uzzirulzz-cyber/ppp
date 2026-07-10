/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/rbac';

// GET /api/admin/notifications — list all notifications with optional filters
export async function GET(request: NextRequest) {
  try {
    const { response } = authenticate(request, ['SUPER_ADMIN', 'SUB_AGENT']);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const read = searchParams.get('read') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (read !== '') where.read = read === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    const userIds = [...new Set(notifications.map(n => n.userId))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    const enriched = notifications.map(n => ({
      ...n,
      _id: n.id,
      user: userMap.get(n.userId) || null,
    }));

    const [totalNotifs, unreadNotifs, urgentNotifs] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { priority: 'URGENT', read: false } }),
    ]);

    return NextResponse.json({
      notifications: enriched,
      stats: { total: totalNotifs, unread: unreadNotifs, urgentUnread: urgentNotifs },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/notifications — send a broadcast (or targeted) notification
export async function POST(request: NextRequest) {
  try {
    const { payload, response } = authenticate(request, ['SUPER_ADMIN']);
    if (response) return response;

    const body = await request.json();
    const { title, message, type, priority, actionUrl, targetUserIds, targetRole } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
    }

    const notifType = type || 'SYSTEM';
    const notifPriority = priority || 'MEDIUM';

    let recipientIds: string[] = [];
    if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      recipientIds = targetUserIds;
    } else if (targetRole) {
      const targetUsers = await prisma.user.findMany({
        where: { role: targetRole, status: 'ACTIVE' },
        select: { id: true },
      });
      recipientIds = targetUsers.map(u => u.id);
    } else {
      const allUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      recipientIds = allUsers.map(u => u.id);
    }

    if (recipientIds.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 404 });
    }

    // Create notifications in batch
    const metadata = {
      sentBy: payload.userId,
      sentByRole: payload.role,
      broadcast: !targetUserIds,
      targetRole: targetRole || undefined,
    };

    await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        type: notifType,
        priority: notifPriority,
        title,
        message,
        read: false,
        actionUrl: actionUrl || null,
        metadata,
      })),
    });

    return NextResponse.json({
      message: `Notification sent to ${recipientIds.length} user(s)`,
      count: recipientIds.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}