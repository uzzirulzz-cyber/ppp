import prisma from './db';
import { hashPassword } from './auth';

const SUB_AGENTS = [
  { name: 'SubAgent 1', email: 'subagent1@trade.com', code: 'PB-AG001' },
  { name: 'SubAgent 2', email: 'subagent2@trade.com', code: 'PB-AG002' },
  { name: 'SubAgent 3', email: 'subagent3@trade.com', code: 'PB-AG003' },
  { name: 'SubAgent 4', email: 'subagent4@trade.com', code: 'PB-AG004' },
  { name: 'SubAgent 5', email: 'subagent5@trade.com', code: 'PB-AG005' },
];

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
        mustChangePassword: false,
      },
    });
    results.push(`Created Super Admin: ${admin.email}`);

    // Admin wallet
    await prisma.wallet.create({
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
  }

  // ── 5 Sub-Agents ───────────────────────────────────────────
  const agentPw = await hashPassword('default');
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

  for (const agentDef of SUB_AGENTS) {
    const existing = await prisma.user.findUnique({ where: { email: agentDef.email } });
    if (existing) {
      results.push(`Sub-Agent already exists (${agentDef.email})`);
      continue;
    }

    const agent = await prisma.user.create({
      data: {
        name: agentDef.name,
        email: agentDef.email,
        password: agentPw,
        role: 'SUB_AGENT',
        status: 'ACTIVE',
        agentId: admin!.id,
        mustChangePassword: true,
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

    // Invitation code (one per sub-agent, permanently linked)
    await prisma.invitationCode.upsert({
      where: { code: agentDef.code },
      update: {},
      create: {
        code: agentDef.code,
        role: 'SUB_AGENT',
        createdBy: admin!.id,
        status: 'USED',
        usedBy: agent.id,
        usedAt: new Date(),
      },
    });

    results.push(`Created ${agentDef.name}: ${agentDef.email} (${agentDef.code})`);
  }

  // ── User Invitation Codes (10 per sub-agent = 50 total) ────
  for (const agentDef of SUB_AGENTS) {
    for (let i = 1; i <= 10; i++) {
      const code = `${agentDef.code}-U${String(i).padStart(3, '0')}`;
      const exists = await prisma.invitationCode.findUnique({ where: { code } });
      if (!exists) {
        const agent = await prisma.user.findUnique({ where: { email: agentDef.email } });
        await prisma.invitationCode.create({
          data: {
            code,
            role: 'USER',
            createdBy: agent!.id,
            status: 'UNUSED',
          },
        });
      }
    }
  }

  return {
    message: results.length ? `Seeded: ${results.join('; ')}` : 'Database already up to date',
    details: results,
  };
}