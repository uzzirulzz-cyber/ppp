/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';

// GET /api/admin/users — paginated user list with search & role filter
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'SUB_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    // SUB_AGENT can only see their own referred users + themselves
    if (payload.role === 'SUB_AGENT') {
      where.OR = [
        { agentId: payload.userId },
        { id: payload.userId },
      ];
      if (search) {
        const searchLower = `%${search}%`;
        where.OR = [
          { agentId: payload.userId, name: { contains: search, mode: 'insensitive' } },
          { agentId: payload.userId, email: { contains: search, mode: 'insensitive' } },
          { agentId: payload.userId, phone: { contains: search, mode: 'insensitive' } },
          { id: payload.userId, name: { contains: search, mode: 'insensitive' } },
          { id: payload.userId, email: { contains: search, mode: 'insensitive' } },
        ];
      }
    } else if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, firstName: true, lastName: true, email: true, role: true, status: true, avatar: true, phone: true, agentId: true, lastLogin: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const userIds = users.map(u => u.id);
    const wallets = await prisma.wallet.findMany({
      where: { userId: { in: userIds } },
    });
    const walletMap = new Map<string, { totalEquity: number; walletCount: number }>();
    for (const w of wallets) {
      const existing = walletMap.get(w.userId) || { totalEquity: 0, walletCount: 0 };
      walletMap.set(w.userId, {
        totalEquity: existing.totalEquity + (w.totalEquity || 0),
        walletCount: existing.walletCount + 1,
      });
    }

    const enriched = users.map(u => ({
      ...u,
      _id: u.id,
      walletSummary: walletMap.get(u.id) || { totalEquity: 0, walletCount: 0 },
    }));

    return NextResponse.json({
      users: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/users — update user status or role
export async function PUT(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status, role, phone, name } = body;
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (name) updateData.name = name;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, firstName: true, lastName: true, email: true, role: true, status: true, avatar: true, phone: true, agentId: true, lastLogin: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ message: 'User updated successfully', user: { ...user, _id: user.id } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users — delete a user
export async function DELETE(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete a SUPER_ADMIN' }, { status: 400 });
    }

    // Cascade deletes wallets, transactions, trades, notifications automatically via schema
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: 'User and associated data deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Record to delete not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}