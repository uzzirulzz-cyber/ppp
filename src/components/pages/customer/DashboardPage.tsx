'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Wallet,
  Users,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chartData = [
  { time: '00:00', price: 67420 },
  { time: '02:00', price: 67580 },
  { time: '04:00', price: 67310 },
  { time: '06:00', price: 67890 },
  { time: '08:00', price: 68120 },
  { time: '10:00', price: 67950 },
  { time: '12:00', price: 68430 },
  { time: '14:00', price: 68760 },
  { time: '16:00', price: 68510 },
  { time: '18:00', price: 69120 },
  { time: '20:00', price: 68890 },
  { time: '22:00', price: 69450 },
];

const mockTrades = [
  { id: '1', pair: 'BTC/USDT', type: 'Up', amount: 100, profit: 85.5, time: '14:32', status: 'won' },
  { id: '2', pair: 'ETH/USDT', type: 'Down', amount: 50, profit: -50, time: '13:15', status: 'lost' },
  { id: '3', pair: 'BTC/USDT', type: 'Up', amount: 200, profit: 170, time: '12:48', status: 'won' },
  { id: '4', pair: 'SOL/USDT', type: 'Up', amount: 80, profit: 68, time: '11:20', status: 'won' },
  { id: '5', pair: 'ETH/USDT', type: 'Down', amount: 150, profit: -150, time: '10:05', status: 'lost' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const statCards = [
  {
    title: 'Total Balance',
    key: 'balance' as const,
    icon: DollarSign,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    prefix: '$',
  },
  {
    title: "Today's Profit",
    key: 'todayProfit' as const,
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    prefix: '$',
  },
  {
    title: 'Active Trades',
    key: 'activeTrades' as const,
    icon: Activity,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    prefix: '',
  },
  {
    title: 'Total Profit',
    key: 'totalProfit' as const,
    icon: BarChart3,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    prefix: '$',
  },
];

const quickActions = [
  { label: 'Start Trading', icon: Zap, page: 'trade' as const, color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Deposit Funds', icon: Wallet, page: 'deposit' as const, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Invite Friends', icon: Users, page: 'referral' as const, color: 'bg-purple-500 hover:bg-purple-600' },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, navigate } = useAppStore();

  const formatValue = (key: string, prefix: string) => {
    const val = user?.[key as keyof typeof user];
    if (typeof val !== 'number') return `${prefix}0.00`;
    if (key === 'activeTrades') return String(val);
    return `${prefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome back, <span className="text-blue-400">{user?.username || 'Trader'}</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Here&apos;s your trading overview for today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                    <Icon size={22} className={stat.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className={`text-xl font-bold text-white mt-0.5 truncate`}>
                      {formatValue(stat.key, stat.prefix)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Price Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base font-semibold">
                  BTC/USDT Price
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">+2.84%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      domain={['dataMin - 100', 'dataMax + 100']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      dx={-4}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.page)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl ${action.color} text-white font-medium text-sm transition-all duration-200 shadow-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight size={16} />
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Trades Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-semibold">
                Recent Trades
              </CardTitle>
              <button
                onClick={() => navigate('transaction-history')}
                className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Pair
                    </th>
                    <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Type
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Amount
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Profit/Loss
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTrades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium">{trade.pair}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                            trade.type === 'Up'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {trade.type === 'Up' ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        ${trade.amount.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{trade.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}