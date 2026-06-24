/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import Notification from '@/models/Notification';
import User from '@/models/User';

// GET /api/admin/notifications — list all notifications with optional filters
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
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const read = searchParams.get('read') || '';

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (read !== '') filter.read = read === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    const userIds = [...new Set(notifications.map((n) => n.userId.toString()))];
    const users = userIds.length > 0
      ? await User.find({ _id: { $in: userIds } }).select('name email').lean()
      : [];
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const enriched = notifications.map((n) => ({
      ...n,
      _id: n._id.toString(),
      user: userMap.get(n.userId.toString()) || null,
    }));

    const [totalNotifs, unreadNotifs, urgentNotifs] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
      Notification.countDocuments({ priority: 'URGENT', read: false }),
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
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

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
      const targetUsers = await User.find({ role: targetRole, status: 'ACTIVE' }).select('_id').lean();
      recipientIds = targetUsers.map((u) => u._id.toString());
    } else {
      const allUsers = await User.find({ status: 'ACTIVE' }).select('_id').lean();
      recipientIds = allUsers.map((u) => u._id.toString());
    }

    if (recipientIds.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 404 });
    }

    const notifications = recipientIds.map((userId) => ({
      userId,
      type: notifType,
      priority: notifPriority,
      title,
      message,
      read: false,
      actionUrl: actionUrl || undefined,
      metadata: {
        sentBy: payload.userId,
        sentByRole: payload.role,
        broadcast: !targetUserIds,
        targetRole: targetRole || undefined,
      },
    }));

    const result = await Notification.insertMany(notifications);

    return NextResponse.json({
      message: `Notification sent to ${recipientIds.length} user(s)`,
      count: result.length,
      notificationIds: result.map((n: any) => n._id.toString()),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}