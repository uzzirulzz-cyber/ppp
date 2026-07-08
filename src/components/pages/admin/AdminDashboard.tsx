'use client';

import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  DollarSign,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';

const revenueData = [
  { day: 'Mon', revenue: 4200, deposits: 12000, withdrawals: 8500 },
  { day: 'Tue', revenue: 5800, deposits: 15400, withdrawals: 9200 },
  { day: 'Wed', revenue: 3900, deposits: 11200, withdrawals: 7800 },
  { day: 'Thu', revenue: 7100, deposits: 18900, withdrawals: 11400 },
  { day: 'Fri', revenue: 6200, deposits: 16800, withdrawals: 10100 },
  { day: 'Sat', revenue: 8500, deposits: 22100, withdrawals: 13500 },
  { day: 'Sun', revenue: 5400, deposits: 14600, withdrawals: 9800 },
];

const statCards = [
  {
    label: 'Total Users',
    value: '12,847',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Active Traders',
    value: '3,421',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    iconBg: 'bg-green-500/15',
    iconColor: 'text-green-400',
  },
  {
    label: 'Total Deposits',
    value: '$1.24M',
    change: '+23.1%',
    changeType: 'positive' as const,
    icon: ArrowDownCircle,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    label: 'Total Withdrawals',
    value: '$843K',
    change: '+15.7%',
    changeType: 'positive' as const,
    icon: ArrowUpCircle,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
  {
    label: 'Pending Deposits',
    value: '47',
    change: '3 urgent',
    changeType: 'neutral' as const,
    icon: Clock,
    iconBg: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
  },
  {
    label: 'System Revenue',
    value: '$41.1K',
    change: '+18.4%',
    changeType: 'positive' as const,
    icon: DollarSign,
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
  },
];

const recentActivity = [
  {
    id: 1,
    icon: UserPlus,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    message: 'New user registered',
    detail: 'alex_trader joined via invitation code',
    time: '2 min ago',
  },
  {
    id: 2,
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/15',
    message: 'Deposit approved',
    detail: '$5,000.00 USDT deposit from john_crypto',
    time: '8 min ago',
  },
  {
    id: 3,
    icon: ArrowUpCircle,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    message: 'Withdrawal requested',
    detail: '$2,350.00 USDT withdrawal by sarah_trade',
    time: '15 min ago',
  },
  {
    id: 4,
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/15',
    message: 'Suspicious activity flagged',
    detail: 'Multiple login attempts for user mike_r',
    time: '32 min ago',
  },
  {
    id: 5,
    icon: ShieldCheck,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    message: 'Sub-agent performance review',
    detail: 'Agent PB-AG002 reached 500 referrals milestone',
    time: '1 hr ago',
  },
];

const quickActions = [
  { label: 'Manage Users', page: 'admin-users' as const, icon: Users, color: 'text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5' },
  { label: 'Review Deposits', page: 'admin-deposits' as const, icon: ArrowDownCircle, color: 'text-green-400 hover:border-green-500/30 hover:bg-green-500/5' },
  { label: 'View Reports', page: 'admin-finance' as const, icon: BarChart3, color: 'text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117] px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { navigate } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of platform performance and activity</p>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={item}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/15"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={`text-xs font-semibold ${
                    card.changeType === 'positive'
                      ? 'text-green-400'
                      : card.changeType === 'negative'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-xs text-gray-500">vs last week</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">Revenue & Transaction Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 7 days performance</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-gray-400">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-gray-400">Deposits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="text-gray-400">Withdrawals</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="witGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="deposits"
                name="Deposits"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#depGrad)"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                name="Withdrawals"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#witGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Section: Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <span className="text-xs text-gray-500">Live updates</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
                    {activity.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-base font-semibold text-white mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.page)}
                  className={`flex w-full items-center gap-3 rounded-xl border border-white/5 p-4 text-left transition-all ${action.color}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Manage & review</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </motion.button>
              );
            })}
          </div>

          {/* Mini Stats */}
          <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Today&apos;s Summary
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">New registrations</span>
                <span className="text-sm font-semibold text-white">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Deposits processed</span>
                <span className="text-sm font-semibold text-green-400">$18.2K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Active trades</span>
                <span className="text-sm font-semibold text-blue-400">1,204</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Support tickets</span>
                <span className="text-sm font-semibold text-yellow-400">12</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}