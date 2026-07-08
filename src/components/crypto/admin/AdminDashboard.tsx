'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Wifi, Activity, ArrowDownCircle, ArrowUpCircle,
  Clock, AlertCircle, BarChart3, DollarSign, TrendingUp, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { MOCK_ADMIN_STATS } from '@/lib/mock-data';

const fallbackStats = MOCK_ADMIN_STATS;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 border border-blue-500/20 shadow-xl">
        <p className="text-sm text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? `$${(entry.value / 1000).toFixed(1)}K` : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const recentActivity = [
  { id: 1, user: 'alice_crypto', action: 'Deposited $5,000 USDT', time: '2 min ago', type: 'deposit' as const },
  { id: 2, user: 'evan_hold', action: 'Withdrawal request $15,000', time: '5 min ago', type: 'withdrawal' as const },
  { id: 3, user: 'bob_trader', action: 'Completed BTC/USDT trade +$245', time: '8 min ago', type: 'trade' as const },
  { id: 4, user: 'helen_vip', action: 'Opened VIP support ticket', time: '12 min ago', type: 'support' as const },
  { id: 5, user: 'diana_trade', action: 'Registered new account', time: '15 min ago', type: 'user' as const },
];

const activityTypeColor: Record<string, string> = {
  deposit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  withdrawal: 'bg-red-500/20 text-red-400 border-red-500/30',
  trade: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  support: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  user: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function AdminDashboard() {
  const { isSuperAdmin, authFetch } = useAppStore();
  const [stats, setStats] = useState(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await authFetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [authFetch]);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, gradient: 'gradient-blue', glow: 'neon-glow-blue', textColor: 'text-blue-400' },
    { label: 'Online Users', value: stats.onlineUsers.toLocaleString(), icon: Wifi, gradient: 'gradient-green', glow: 'neon-glow-green', textColor: 'text-emerald-400' },
    { label: 'Active Traders', value: stats.activeTraders.toLocaleString(), icon: Activity, gradient: 'gradient-blue', glow: 'neon-glow-blue', textColor: 'text-blue-400' },
    { label: "Today's Deposits", value: `$${stats.todayDeposits.toLocaleString()}`, icon: ArrowDownCircle, gradient: 'gradient-green', glow: 'neon-glow-green', textColor: 'text-emerald-400' },
    { label: "Today's Withdrawals", value: `$${stats.todayWithdrawals.toLocaleString()}`, icon: ArrowUpCircle, gradient: 'gradient-red', glow: 'neon-glow-red', textColor: 'text-red-400' },
    { label: 'Pending Deposits', value: stats.pendingDeposits.toString(), icon: Clock, gradient: 'gradient-gold', glow: '', textColor: 'text-amber-400' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals.toString(), icon: AlertCircle, gradient: 'gradient-gold', glow: '', textColor: 'text-amber-400' },
    { label: 'Total Volume', value: `$${(stats.totalTradingVolume / 1_000_000).toFixed(1)}M`, icon: BarChart3, gradient: 'gradient-blue', glow: 'neon-glow-blue', textColor: 'text-blue-400' },
    { label: 'Revenue', value: `$${(stats.revenue / 1_000).toFixed(0)}K`, icon: DollarSign, gradient: 'gradient-green', glow: 'neon-glow-green', textColor: 'text-emerald-400' },
    { label: 'Platform Profit', value: `$${(stats.platformProfit / 1_000).toFixed(0)}K`, icon: TrendingUp, gradient: 'gradient-purple', glow: '', textColor: 'text-purple-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-glow-blue"
        >
          {isSuperAdmin() ? 'Admin Dashboard' : 'Agent Dashboard'}
        </motion.h1>
        <Badge className="glass border-blue-500/30 text-blue-400 px-4 py-1.5 text-sm">
          Live
          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </Badge>
      </div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="glass-card rounded-xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.gradient} ${stat.glow}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className={`text-xl md:text-2xl font-bold ${stat.textColor} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Deposits vs Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyStats} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={2} fill="url(#userGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Trading Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="trades" name="Trades" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyStats}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-400">
                      {activity.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        <span className="text-blue-400">{activity.user}</span>{' '}
                        <span className="text-slate-400">{activity.action}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${activityTypeColor[activity.type]} border text-xs px-2 py-0.5`}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-slate-500 hidden sm:inline">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}