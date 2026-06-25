import prisma from './db';
import { hashPassword } from './auth';

export async function seedDatabase() {
  const results: string[] = [];

  // ── Super Admin ──────────────────────────────────────────────
  const adminPw = await hashPassword('123playbeat');
  let admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'crdbixx@gmail.com',
        password: adminPw,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    results.push(`Created Super Admin: ${admin.email}`);

    // Admin wallet
    const adminWallet = await prisma.wallet.create({
      data: {
        userId: admin.id,
        type: 'SPOT',
        totalEquity: 1000000 + 10 * 67000 + 100 * 3500,
        balances: {
          create: [
            { currency: 'USDT', amount: 1000000, frozen: 0 },
            { currency: 'BTC', amount: 10, frozen: 0 },
            { currency: 'ETH', amount: 100, frozen: 0 },
          ],
        },
      },
    });
    void adminWallet;
  }

  // ── 20 Sub-Agents ───────────────────────────────────────────
  const agentPw = await hashPassword('default');
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

  for (let i = 1; i <= 20; i++) {
    const email = `subagent${i}@trade${i <= 1 ? '.com' : i + '.com'}`;
    const code = `PB-AG${String(i).padStart(3, '0')}`;
    const name = `SubAgent ${i}`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      results.push(`Sub-Agent ${i} already exists (${email})`);
      continue;
    }

    const agent = await prisma.user.create({
      data: {
        name,
        email,
        password: agentPw,
        role: 'SUB_AGENT',
        status: 'ACTIVE',
        agentId: admin!.id,
      },
    });

    // Wallet for agent
    await prisma.wallet.create({
      data: {
        userId: agent.id,
        type: 'SPOT',
        totalEquity: 10000 + 0.5 * 67000,
        balances: {
          create: [
            { currency: 'USDT', amount: 10000, frozen: 0 },
            { currency: 'BTC', amount: 0.5, frozen: 0 },
          ],
        },
      },
    });

    // Agent config
    await prisma.agentConfig.upsert({
      where: { agentId: agent.id },
      update: {},
      create: {
        agentId: agent.id,
        commissionRate: 0.15,
        referralRate: 0.05,
        maxUsers: 100,
        maxLeverage: 100,
        allowedSymbols: symbols,
        riskLimit: 100000,
      },
    });

    // Invitation code
    await prisma.invitationCode.upsert({
      where: { code },
      update: {},
      create: {
        code,
        role: 'SUB_AGENT',
        createdBy: admin!.id,
        status: 'USED',
        usedBy: agent.id,
        usedAt: new Date(),
      },
    });

    results.push(`Created Sub-Agent ${i}: ${email} (${code})`);
  }

  // ── User Invitation Codes (if not exist) ─────────────────────
  for (let i = 1; i <= 50; i++) {
    const code = `PB-US${String(i).padStart(4, '0')}`;
    const exists = await prisma.invitationCode.findUnique({ where: { code } });
    if (!exists) {
      await prisma.invitationCode.create({
        data: {
          code,
          role: 'USER',
          createdBy: admin!.id,
          status: 'UNUSED',
        },
      });
    }
  }

  return {
    message: results.length ? `Seeded: ${results.join('; ')}` : 'Database already up to date',
    details: results,
  };
}