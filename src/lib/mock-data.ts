import type { CoinData } from './store';

function generateSparkline(basePrice: number, volatility: number): number[] {
  const points: number[] = [];
  let price = basePrice * (1 - volatility * 0.5);
  for (let i = 0; i < 20; i++) {
    price += (Math.random() - 0.48) * basePrice * volatility * 0.1;
    price = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, price));
    points.push(price);
  }
  points.push(basePrice);
  return points;
}

export const MOCK_COINS: CoinData[] = [
  {
    id: '1', symbol: 'BTC', name: 'Bitcoin', pair: 'BTC/USDT', logo: '₿',
    price: 104250.80, change24h: 2.34, high24h: 105890.00, low24h: 102150.30,
    volume24h: 28_500_000_000, marketCap: 2_050_000_000_000,
    sparkline: generateSparkline(104250, 0.03),
  },
  {
    id: '2', symbol: 'ETH', name: 'Ethereum', pair: 'ETH/USDT', logo: 'Ξ',
    price: 3520.45, change24h: -1.12, high24h: 3590.00, low24h: 3470.20,
    volume24h: 15_200_000_000, marketCap: 423_000_000_000,
    sparkline: generateSparkline(3520, 0.04),
  },
  {
    id: '3', symbol: 'BNB', name: 'BNB', pair: 'BNB/USDT', logo: '◆',
    price: 685.30, change24h: 0.87, high24h: 692.50, low24h: 678.10,
    volume24h: 2_100_000_000, marketCap: 96_000_000_000,
    sparkline: generateSparkline(685, 0.03),
  },
  {
    id: '4', symbol: 'SOL', name: 'Solana', pair: 'SOL/USDT', logo: '◎',
    price: 178.65, change24h: 5.21, high24h: 182.30, low24h: 170.45,
    volume24h: 4_800_000_000, marketCap: 82_000_000_000,
    sparkline: generateSparkline(178, 0.06),
  },
  {
    id: '5', symbol: 'XRP', name: 'Ripple', pair: 'XRP/USDT', logo: '✕',
    price: 2.34, change24h: -0.45, high24h: 2.41, low24h: 2.28,
    volume24h: 3_200_000_000, marketCap: 134_000_000_000,
    sparkline: generateSparkline(2.34, 0.04),
  },
  {
    id: '6', symbol: 'ADA', name: 'Cardano', pair: 'ADA/USDT', logo: '₳',
    price: 0.78, change24h: 3.15, high24h: 0.81, low24h: 0.75,
    volume24h: 890_000_000, marketCap: 27_000_000_000,
    sparkline: generateSparkline(0.78, 0.05),
  },
  {
    id: '7', symbol: 'DOGE', name: 'Dogecoin', pair: 'DOGE/USDT', logo: 'Ð',
    price: 0.182, change24h: -2.08, high24h: 0.189, low24h: 0.178,
    volume24h: 1_500_000_000, marketCap: 26_000_000_000,
    sparkline: generateSparkline(0.182, 0.05),
  },
  {
    id: '8', symbol: 'DOT', name: 'Polkadot', pair: 'DOT/USDT', logo: '●',
    price: 7.85, change24h: 1.56, high24h: 8.02, low24h: 7.68,
    volume24h: 620_000_000, marketCap: 10_500_000_000,
    sparkline: generateSparkline(7.85, 0.04),
  },
  {
    id: '9', symbol: 'AVAX', name: 'Avalanche', pair: 'AVAX/USDT', logo: '▲',
    price: 38.92, change24h: 4.32, high24h: 40.15, low24h: 37.20,
    volume24h: 780_000_000, marketCap: 15_000_000_000,
    sparkline: generateSparkline(38.92, 0.05),
  },
  {
    id: '10', symbol: 'LINK', name: 'Chainlink', pair: 'LINK/USDT', logo: '⬡',
    price: 18.45, change24h: -0.78, high24h: 18.90, low24h: 18.10,
    volume24h: 920_000_000, marketCap: 11_200_000_000,
    sparkline: generateSparkline(18.45, 0.04),
  },
  {
    id: '11', symbol: 'MATIC', name: 'Polygon', pair: 'MATIC/USDT', logo: '⬟',
    price: 0.92, change24h: 2.67, high24h: 0.95, low24h: 0.89,
    volume24h: 450_000_000, marketCap: 9_100_000_000,
    sparkline: generateSparkline(0.92, 0.04),
  },
  {
    id: '12', symbol: 'UNI', name: 'Uniswap', pair: 'UNI/USDT', logo: '🦄',
    price: 12.35, change24h: 1.89, high24h: 12.60, low24h: 12.05,
    volume24h: 340_000_000, marketCap: 7_400_000_000,
    sparkline: generateSparkline(12.35, 0.04),
  },
];

export const MOCK_USER = {
  id: 'usr_abc123',
  uid: 'UID-847291',
  username: 'CryptoTrader',
  email: 'trader@crypto.com',
  phone: '+1 234 567 8900',
  country: 'United States',
  avatar: null,
  role: 'user',
  balance: 12580.50,
  frozenBalance: 1200.00,
  bonusBalance: 150.00,
  totalProfit: 4250.80,
  todayProfit: 320.00,
  todayLoss: 85.00,
  activeTrades: 3,
  completedTrades: 127,
  referralCode: 'CRYPTO847',
  twoFactor: false,
  emailVerified: true,
};

export const MOCK_ADMIN_STATS = {
  totalUsers: 12847,
  onlineUsers: 1234,
  activeTraders: 3456,
  todayDeposits: 285000,
  todayWithdrawals: 145000,
  pendingDeposits: 23,
  pendingWithdrawals: 12,
  totalTradingVolume: 15_800_000,
  revenue: 452000,
  platformProfit: 128000,
  dailyStats: [
    { date: 'Mon', deposits: 320000, withdrawals: 180000, users: 45, trades: 1250, revenue: 52000 },
    { date: 'Tue', deposits: 280000, withdrawals: 150000, users: 38, trades: 1100, revenue: 45000 },
    { date: 'Wed', deposits: 410000, withdrawals: 220000, users: 62, trades: 1580, revenue: 68000 },
    { date: 'Thu', deposits: 350000, withdrawals: 190000, users: 51, trades: 1320, revenue: 58000 },
    { date: 'Fri', deposits: 520000, withdrawals: 310000, users: 78, trades: 2100, revenue: 89000 },
    { date: 'Sat', deposits: 290000, withdrawals: 160000, users: 42, trades: 980, revenue: 42000 },
    { date: 'Sun', deposits: 285000, withdrawals: 145000, users: 40, trades: 950, revenue: 41000 },
  ],
  monthlyStats: [
    { month: 'Jan', deposits: 8_500_000, withdrawals: 5_200_000, users: 1200, revenue: 1_200_000 },
    { month: 'Feb', deposits: 9_200_000, withdrawals: 5_800_000, users: 1450, revenue: 1_350_000 },
    { month: 'Mar', deposits: 10_800_000, withdrawals: 6_500_000, users: 1680, revenue: 1_580_000 },
    { month: 'Apr', deposits: 11_500_000, withdrawals: 7_200_000, users: 1890, revenue: 1_720_000 },
    { month: 'May', deposits: 12_200_000, withdrawals: 7_800_000, users: 2100, revenue: 1_890_000 },
    { month: 'Jun', deposits: 13_800_000, withdrawals: 8_500_000, users: 2350, revenue: 2_150_000 },
  ],
};

export const ADMIN_USERS = [
  { id: '1', uid: 'UID-100001', username: 'alice_crypto', email: 'alice@email.com', balance: 45200, status: 'active', trades: 234, joined: '2025-01-15' },
  { id: '2', uid: 'UID-100002', username: 'bob_trader', email: 'bob@email.com', balance: 12350, status: 'active', trades: 89, joined: '2025-02-20' },
  { id: '3', uid: 'UID-100003', username: 'charlie_invest', email: 'charlie@email.com', balance: 89000, status: 'suspended', trades: 567, joined: '2024-11-05' },
  { id: '4', uid: 'UID-100004', username: 'diana_trade', email: 'diana@email.com', balance: 5600, status: 'active', trades: 45, joined: '2025-04-10' },
  { id: '5', uid: 'UID-100005', username: 'evan_hold', email: 'evan@email.com', balance: 234000, status: 'active', trades: 890, joined: '2024-08-22' },
  { id: '6', uid: 'UID-100006', username: 'fiona_new', email: 'fiona@email.com', balance: 1500, status: 'pending', trades: 0, joined: '2025-06-20' },
  { id: '7', uid: 'UID-100007', username: 'george_ban', email: 'george@email.com', balance: 0, status: 'banned', trades: 12, joined: '2025-03-15' },
  { id: '8', uid: 'UID-100008', username: 'helen_vip', email: 'helen@email.com', balance: 456000, status: 'active', trades: 1234, joined: '2024-06-10' },
];

export const ADMIN_DEPOSITS = [
  { id: 'D001', userId: 'UID-100001', username: 'alice_crypto', amount: 5000, method: 'USDT', status: 'approved', date: '2025-06-23 14:30' },
  { id: 'D002', userId: 'UID-100003', username: 'charlie_invest', amount: 10000, method: 'Bank Transfer', status: 'pending', date: '2025-06-23 13:15' },
  { id: 'D003', userId: 'UID-100005', username: 'evan_hold', amount: 25000, method: 'USDT', status: 'approved', date: '2025-06-23 12:00' },
  { id: 'D004', userId: 'UID-100008', username: 'helen_vip', amount: 50000, method: 'Credit Card', status: 'pending', date: '2025-06-23 11:45' },
  { id: 'D005', userId: 'UID-100002', username: 'bob_trader', amount: 2000, method: 'Bank Transfer', status: 'rejected', date: '2025-06-23 10:30' },
  { id: 'D006', userId: 'UID-100004', username: 'diana_trade', amount: 1500, method: 'USDT', status: 'pending', date: '2025-06-23 09:20' },
];

export const ADMIN_WITHDRAWALS = [
  { id: 'W001', userId: 'UID-100005', username: 'evan_hold', amount: 15000, method: 'USDT', status: 'pending', date: '2025-06-23 15:00' },
  { id: 'W002', userId: 'UID-100008', username: 'helen_vip', amount: 30000, method: 'Bank Transfer', status: 'approved', date: '2025-06-23 14:00' },
  { id: 'W003', userId: 'UID-100001', username: 'alice_crypto', amount: 8000, method: 'USDT', status: 'pending', date: '2025-06-23 13:00' },
  { id: 'W004', userId: 'UID-100002', username: 'bob_trader', amount: 3000, method: 'Credit Card', status: 'approved', date: '2025-06-23 12:00' },
  { id: 'W005', userId: 'UID-100003', username: 'charlie_invest', amount: 20000, method: 'Bank Transfer', status: 'rejected', date: '2025-06-23 11:00' },
];

export const ADMIN_TICKETS = [
  { id: 'T001', userId: 'UID-100001', username: 'alice_crypto', subject: 'Deposit not credited', status: 'open', priority: 'high', date: '2025-06-23 15:30' },
  { id: 'T002', userId: 'UID-100002', username: 'bob_trader', subject: 'Withdrawal delay', status: 'in-progress', priority: 'medium', date: '2025-06-23 14:00' },
  { id: 'T003', userId: 'UID-100004', username: 'diana_trade', subject: 'Account verification issue', status: 'resolved', priority: 'low', date: '2025-06-23 12:00' },
  { id: 'T004', userId: 'UID-100008', username: 'helen_vip', subject: 'VIP upgrade request', status: 'open', priority: 'medium', date: '2025-06-23 10:00' },
];