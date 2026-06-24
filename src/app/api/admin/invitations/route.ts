/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractBearerToken } from '@/lib/auth';
import InvitationCode from '@/models/InvitationCode';
import User from '@/models/User';

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/admin/invitations — list all invitation codes
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
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      filter.code = { $regex: search.toUpperCase(), $options: 'i' };
    }

    const [codes, total] = await Promise.all([
      InvitationCode.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      InvitationCode.countDocuments(filter),
    ]);

    const creatorIds = [...new Set(codes.map((c) => c.createdBy.toString()).filter(Boolean))];
    const usedByIds = [...new Set(codes.map((c) => c.usedBy?.toString()).filter(Boolean) as string[])];

    const [creators, usedUsers] = await Promise.all([
      creatorIds.length > 0 ? User.find({ _id: { $in: creatorIds } }).select('name email').lean() : [],
      usedByIds.length > 0 ? User.find({ _id: { $in: usedByIds } }).select('name email').lean() : [],
    ]);

    const creatorMap = new Map(creators.map((u) => [u._id.toString(), u]));
    const usedByMap = new Map(usedUsers.map((u) => [u._id.toString(), u]));

    const enriched = codes.map((c) => ({
      ...c,
      _id: c._id.toString(),
      createdByUser: creatorMap.get(c.createdBy.toString()) || null,
      usedByUser: c.usedBy ? usedByMap.get(c.usedBy.toString()) || null : null,
      isExpired: c.expiresAt && new Date(c.expiresAt) < new Date(),
    }));

    const [totalCodes, unusedCodes, usedCodes, disabledCodes, expiredCodes] = await Promise.all([
      InvitationCode.countDocuments(),
      InvitationCode.countDocuments({ status: 'UNUSED' }),
      InvitationCode.countDocuments({ status: 'USED' }),
      InvitationCode.countDocuments({ status: 'DISABLED' }),
      InvitationCode.countDocuments({ expiresAt: { $lt: new Date() }, status: 'UNUSED' }),
    ]);

    return NextResponse.json({
      codes: enriched,
      stats: { total: totalCodes, unused: unusedCodes, used: usedCodes, disabled: disabledCodes, expired: expiredCodes },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/invitations — create new invitation code(s)
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
    const { role, count, expiresInHours } = body;

    const codeRole = role || 'USER';
    if (!['SUB_AGENT', 'USER'].includes(codeRole)) {
      return NextResponse.json({ error: 'Role must be SUB_AGENT or USER' }, { status: 400 });
    }

    const codeCount = Math.min(50, Math.max(1, count || 1));

    let expiresAt: Date | undefined;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    }

    const codes: { code: string; role: string; createdBy: string; status: string; expiresAt?: Date }[] = [];
    const existingCodes = new Set(
      (await InvitationCode.find({}).select('code').lean()).map((c: any) => c.code)
    );

    for (let i = 0; i < codeCount; i++) {
      let newCode = generateCode();
      let attempts = 0;
      while (existingCodes.has(newCode) && attempts < 100) {
        newCode = generateCode();
        attempts++;
      }
      existingCodes.add(newCode);
      codes.push({
        code: newCode,
        role: codeRole,
        createdBy: payload.userId,
        status: 'UNUSED',
        ...(expiresAt ? { expiresAt } : {}),
      });
    }

    const created = await InvitationCode.insertMany(codes);

    return NextResponse.json({
      message: `${created.length} invitation code(s) created successfully`,
      codes: created.map((c: any) => ({
        code: c.code,
        role: c.role,
        status: c.status,
        expiresAt: c.expiresAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/invitations — toggle invitation code status (enable/disable/reset)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN only' }, { status: 403 });
    }

    const body = await request.json();
    const { codeId, code, action } = body;

    if (!codeId && !code) {
      return NextResponse.json({ error: 'codeId or code is required' }, { status: 400 });
    }

    const filter: Record<string, any> = {};
    if (codeId) filter._id = codeId;
    if (code) filter.code = code.toUpperCase();

    const invitation = await InvitationCode.findOne(filter);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation code not found' }, { status: 404 });
    }

    let newStatus: string;
    if (action === 'disable' || action === 'DISABLED') {
      newStatus = 'DISABLED';
    } else if (action === 'enable' || action === 'UNUSED') {
      if (invitation.status === 'USED') {
        return NextResponse.json({ error: 'Cannot re-enable a used code' }, { status: 400 });
      }
      newStatus = 'UNUSED';
    } else if (action === 'reset') {
      invitation.status = 'UNUSED' as any;
      invitation.usedBy = undefined;
      invitation.usedAt = undefined;
      await invitation.save();
      return NextResponse.json({ message: 'Invitation code reset successfully', code: invitation });
    } else {
      newStatus = invitation.status === 'DISABLED' ? 'UNUSED' : 'DISABLED';
      if (invitation.status === 'USED') {
        return NextResponse.json({ error: 'Cannot toggle a used code' }, { status: 400 });
      }
    }

    if (newStatus) {
      invitation.status = newStatus as any;
      await invitation.save();
    }

    return NextResponse.json({
      message: `Invitation code ${invitation.code} updated to ${invitation.status}`,
      code: invitation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}