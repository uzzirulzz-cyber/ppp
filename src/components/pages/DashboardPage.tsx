'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Bitcoin,
  TrendingUp,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Zap,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

// --- Mock Data ---

function generatePortfolioData() {
  const data = [];
  let value = 118000;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.45) * 5000;
    value = Math.max(100000, Math.min(150000, value));
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

const assetAllocation = [
  { name: 'BTC', value: 45, color: '#f59e0b' },
  { name: 'ETH', value: 25, color: '#6366f1' },
  { name: 'USDT', value: 20, color: '#22c55e' },
  { name: 'SOL', value: 10, color: '#8b5cf6' },
];

const recentTrades = [
  { pair: 'BTCUSDT', side: 'BUY', entry: '67,245.30', qty: '0.1500', pnl: '+$1,234.50', pnlPositive: true, time: '14:32:15' },
  { pair: 'ETHUSDT', side: 'SELL', entry: '3,456.78', qty: '2.5000', pnl: '-$567.20', pnlPositive: false, time: '13:18:42' },
  { pair: 'BNBUSDT', side: 'BUY', entry: '589.45', qty: '10.0000', pnl: '+$234.80', pnlPositive: true, time: '11:45:03' },
  { pair: 'SOLUSDT', side: 'SELL', entry: '178.92', qty: '50.0000', pnl: '-$123.40', pnlPositive: false, time: '10:22:18' },
  { pair: 'XRPUSDT', side: 'BUY', entry: '0.6234', qty: '10000', pnl: '+$89.60', pnlPositive: true, time: '09:05:55' },
];

const marketOverview = [
  { pair: 'BTC/USDT', price: '67,245.30', change: '+2.35%', positive: true },
  { pair: 'ETH/USDT', price: '3,456.78', change: '+1.82%', positive: true },
  { pair: 'BNB/USDT', price: '589.45', change: '-0.94%', positive: false },
  { pair: 'SOL/USDT', price: '178.92', change: '+4.21%', positive: true },
  { pair: 'XRP/USDT', price: '0.6234', change: '-1.37%', positive: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// --- Custom Tooltip for Area Chart ---
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(8, 27, 58, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// --- Component ---
export default function DashboardPage() {
  const { navigate } = useStore();
  const portfolioData = useMemo(() => generatePortfolioData(), []);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  const quickActions = [
    { label: 'Deposit', icon: ArrowUpRight, color: '#22c55e', page: Pages.DEPOSIT },
    { label: 'Withdraw', icon: ArrowDownRight, color: '#FF4757', page: Pages.WITHDRAW },
    { label: 'Trade', icon: Zap, color: '#0F5EFF', page: Pages.TRADING },
    { label: 'Invite', icon: Users, color: '#f59e0b', page: Pages.REFERRAL },
  ];

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      style={{ paddingBottom: 40 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back! Here&apos;s your trading overview.
        </p>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Balance
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              <Bitcoin size={20} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            $1,234,567.89
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ≈ 18.35 BTC
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Today&apos;s PnL
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(34, 197, 94, 0.15)',
              }}
            >
              <TrendingUp size={20} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-green">+$12,345.67</div>
          <div className="text-xs mt-1 text-green">+2.5%</div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Active Trades
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(59, 130, 246, 0.15)',
              }}
            >
              <Activity size={20} style={{ color: '#0F5EFF' }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            24
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            8 pending, 16 open
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Win Rate
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(139, 92, 246, 0.15)',
              }}
            >
              <Target size={20} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            68.5%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Last 30 days
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Chart (2/3) */}
        <motion.div className="glass-card p-4 lg:col-span-2" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Portfolio Value
            </h2>
            <span className="badge badge-green">30D</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F5EFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F5EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#7A8599', fontSize: 11 }}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#7A8599', fontSize: 11 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0F5EFF"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Allocation Donut (1/3) */}
        <motion.div className="glass-card p-4" variants={itemVariants}>
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Asset Allocation
          </h2>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-2">
            {assetAllocation.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: asset.color,
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {asset.name}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {asset.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Trades Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Trades
          </h2>
          <button
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate(Pages.TRANSACTIONS)}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Side</th>
                <th>Entry Price</th>
                <th>Quantity</th>
                <th>PnL</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, i) => (
                <tr key={i}>
                  <td>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {trade.pair}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${trade.side === 'BUY' ? 'badge-green' : 'badge-red'}`}>
                      {trade.side}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>${trade.entry}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{trade.qty}</td>
                  <td>
                    <span className={trade.pnlPositive ? 'text-green' : 'text-red'} style={{ fontWeight: 600 }}>
                      {trade.pnl}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{trade.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bottom Row: Quick Actions + Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div className="glass-card p-4" variants={itemVariants}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = activeQuickAction === action.label;
              return (
                <motion.button
                  key={action.label}
                  className="btn-secondary flex flex-col items-center gap-2 py-4"
                  style={{
                    background: isActive ? `${action.color}15` : undefined,
                    borderColor: isActive ? action.color : undefined,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveQuickAction(action.label);
                    navigate(action.page);
                  }}
                >
                  <Icon size={22} style={{ color: action.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Market Overview */}
        <motion.div className="glass-card p-4" variants={itemVariants}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Market Overview
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {marketOverview.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--bg-primary)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.pair.replace('/USDT', '').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.pair}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    ${item.price}
                  </div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: item.positive ? 'var(--accent-green)' : 'var(--accent-red)' }}
                  >
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}