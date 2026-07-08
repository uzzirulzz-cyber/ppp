import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try { const r = await seedDatabase(); return NextResponse.json(r); }
  catch (e: unknown) { const m = e instanceof Error ? e.message : 'Seed failed'; return NextResponse.json({ success: false, message: m }, { status: 500 }); }
}
export async function GET() {
  try {
    const [userCount, codeCount] = await Promise.all([
      prisma.user.count(),
      prisma.invitationCode.count(),
    ]);
    return NextResponse.json({ users: userCount, codes: codeCount });
  } catch { return NextResponse.json({ users: 0, codes: 0 }); }
}