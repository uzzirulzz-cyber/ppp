import User from '../models/User';
import InvitationCode from '../models/InvitationCode';
import AgentConfig from '../models/AgentConfig';
import Wallet from '../models/Wallet';
import { hashPassword } from './auth';

export async function seedDatabase() {
  const adminExists = await User.findOne({ role: 'SUPER_ADMIN' });
  if (adminExists) return { message: 'Database already seeded' };

  const hashedPw = await hashPassword('123playbeat');

  // Create Super Admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'crdbixx@gmail.com',
    password: hashedPw,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });

  // Create 5 Sub-Agents
  const agentIds: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const agent = await User.create({
      name: `Sub-Agent ${String(i).padStart(3, '0')}`,
      email: `agent${i}@nextrade.pro`,
      password: hashedPw,
      role: 'SUB_AGENT',
      status: 'ACTIVE',
      agentId: admin._id.toString(),
    });
    agentIds.push(agent._id.toString());

    // Wallet for agent
    await Wallet.create({
      userId: agent._id.toString(),
      type: 'SPOT',
      balances: [
        { currency: 'USDT', amount: 10000, frozen: 0 },
        { currency: 'BTC', amount: 0.5, frozen: 0 },
      ],
      totalEquity: 10000 + 0.5 * 67000,
    });

    // Agent config
    await AgentConfig.create({
      agentId: agent._id.toString(),
      commissionRate: 0.15,
      referralRate: 0.05,
      maxUsers: 100,
      maxLeverage: 100,
      allowedSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
      riskLimit: 100000,
    });
  }

  // Create 5 invitation codes for agents
  for (let i = 1; i <= 5; i++) {
    await InvitationCode.create({
      code: `PB-AG${String(i).padStart(3, '0')}`,
      role: 'SUB_AGENT',
      createdBy: admin._id.toString(),
      status: 'USED',
      usedBy: agentIds[i - 1],
      usedAt: new Date(),
    });
  }

  // Create user invitation codes
  for (let i = 1; i <= 20; i++) {
    await InvitationCode.create({
      code: `PB-US${String(i).padStart(4, '0')}`,
      role: 'USER',
      createdBy: admin._id.toString(),
      status: 'UNUSED',
    });
  }

  // Admin wallet
  await Wallet.create({
    userId: admin._id.toString(),
    type: 'SPOT',
    balances: [
      { currency: 'USDT', amount: 1000000, frozen: 0 },
      { currency: 'BTC', amount: 10, frozen: 0 },
      { currency: 'ETH', amount: 100, frozen: 0 },
    ],
    totalEquity: 1000000 + 10 * 67000 + 100 * 3500,
  });

  return { message: 'Database seeded successfully', adminId: admin._id, agentCount: 5 };
}