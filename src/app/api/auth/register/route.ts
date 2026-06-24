import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import InvitationCode from '@/models/InvitationCode';
import Wallet from '@/models/Wallet';
import Referral from '@/models/Referral';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, invitationCode } = await req.json();
    if (!name || !email || !password || !invitationCode) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Validate invitation code
    const code = await InvitationCode.findOne({
      code: invitationCode.toUpperCase(),
      status: 'UNUSED',
    });
    if (!code) {
      return NextResponse.json({ error: 'Invalid or used invitation code' }, { status: 400 });
    }

    // Check if email exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Determine role from invitation code
    const role = code.role;
    const hashedPw = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPw,
      role,
      status: 'ACTIVE',
    });

    // Mark code as used
    code.status = 'USED';
    code.usedBy = user._id.toString();
    code.usedAt = new Date();
    await code.save();

    // Create wallet
    await Wallet.create({
      userId: user._id.toString(),
      type: 'SPOT',
      balances: [
        { currency: 'USDT', amount: 0, frozen: 0 },
        { currency: 'BTC', amount: 0, frozen: 0 },
      ],
      totalEquity: 0,
    });

    // Create referral record if referred
    if (code.createdBy) {
      await Referral.create({
        referrerId: code.createdBy,
        referredId: user._id.toString(),
        referralCode: code.code,
        level: 1,
        totalCommission: 0,
      });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}