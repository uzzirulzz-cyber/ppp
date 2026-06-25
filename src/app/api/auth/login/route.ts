import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    // Auto-seed on first login
    await seedDatabase();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }
    if (user.status === 'LOCKED') {
      return NextResponse.json({ error: 'Account locked' }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      agentId: user.agentId || undefined,
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      token,
      user: {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        status: safeUser.status,
        avatar: safeUser.avatar,
        phone: safeUser.phone,
        agentId: safeUser.agentId,
        lastLogin: safeUser.lastLogin,
        createdAt: safeUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}