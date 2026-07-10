'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Users, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  Activity, Clock, DollarSign, BarChart3, ShieldCheck, AlertTriangle,
  UserCheck, UserX, Eye,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatUSD(num: number | undefined | null) {
  if (num == null) return '$0.00';
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(num: number | undefined | null) {
  if (num == null) return '0';
  return num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : String(num);
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Chart Tooltip                                                      */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#1E293B', fontSize: 13, fontWeight: 600 }}>
            {p.name}: ${Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  platformEquity: number;
  revenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  openTrades: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  dailyStats: Array<{ date: string; deposits: number; withdrawals: number }>;
  monthlyStats: Array<{ month: string; deposits: number; withdrawals: number }>;
  topPairs: Array<{ symbol: string; count: number; volume: number; pnl: number }>;
  recentLogins: Array<{ id: string; email: string; success: boolean; ip?: string; userAgent?: string; createdAt: string; user: { name: string; email: string; role: string } | null }>;
  pendingTransactions: Array<{ id: string; userId: string; type: string; amount: number; currency: string; status: string; createdAt: string; user: { id: string; name: string; email: string } | null }>;
}

const defaultStats: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  platformEquity: 0,
  revenue: 0,
  totalDeposits: 0,
  totalWithdrawals: 0,
  openTrades: 0,
  pendingDeposits: 0,
  pendingWithdrawals: 0,
  dailyStats: [],
  monthlyStats: [],
  topPairs: [],
  recentLogins: [],
  pendingTransactions: [],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboardPage() {
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load dashboard');
        const json = await res.json();
        if (json.stats) setStats({ ...defaultStats, ...json.stats });
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchDashboard();
  }, [token]);

  /* ---------------- loading state ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-2 rounded-full mb-3"
            style={{ borderColor: '#3B82F6', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }}
          />
          <p style={{ color: '#64748B' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /* ---------------- error state ---------------- */
  if (error) {
    return (
      <div className="glass-card p-6" style={{ borderColor: '#EF4444' }}>
        <p style={{ color: '#EF4444' }}>{error}</p>
      </div>
    );
  }

  /* ---------------- stat card definitions ---------------- */
  const row1 = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3B82F6', raw: true },
    { label: 'Active Traders', value: stats.activeUsers, icon: Activity, color: '#10B981', raw: true },
    { label: 'Platform Equity', value: `$${stats.platformEquity?.toLocaleString()}`, icon: Wallet, color: '#3B82F6', raw: false },
    { label: 'Total Revenue', value: `$${stats.revenue?.toLocaleString()}`, icon: DollarSign, color: '#10B981', raw: false },
  ];

  const row2 = [
    { label: 'Total Deposits', value: `$${stats.totalDeposits?.toLocaleString()}`, icon: ArrowUpRight, color: '#10B981', raw: false },
    { label: 'Total Withdrawals', value: `$${stats.totalWithdrawals?.toLocaleString()}`, icon: ArrowDownRight, color: '#EF4444', raw: false },
    { label: 'Open Positions', value: stats.openTrades, icon: BarChart3, color: '#3B82F6', raw: true },
    {
      label: 'Pending Actions',
      value: (stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0),
      icon: AlertTriangle,
      color: '#EF4444',
      raw: true,
      sub: 'deposits/withdrawals awaiting review',
    },
  ];

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ paddingBottom: 40 }}
    >
      {/* ---------- Header ---------- */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={26} style={{ color: '#3B82F6' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Super Admin Dashboard</h1>
        </div>
        <p className="text-sm" style={{ color: '#64748B' }}>
          Platform overview and key metrics at a glance.
        </p>
      </motion.div>

      {/* ---------- Sub-Agent Banner ---------- */}
      {user?.role === 'SUB_AGENT' && (
        <motion.div
          variants={itemVariants}
          className="glass-card px-4 py-3 flex items-center gap-3"
          style={{ borderLeft: '3px solid #3B82F6' }}
        >
          <Eye size={18} style={{ color: '#3B82F6' }} />
          <p className="text-sm" style={{ color: '#64748B' }}>
            Sub-Agent View — showing data for your assigned customers only
          </p>
        </motion.div>
      )}

      {/* ---------- Stat Cards Row 1 ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {row1.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} variants={itemVariants} className="stat-card p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>
                  {c.raw ? (c.value as number)?.toLocaleString() : c.value}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl"
                style={{ background: '#EFF6FF' }}
              >
                <Icon size={22} style={{ color: c.color }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ---------- Stat Cards Row 2 ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {row2.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} variants={itemVariants} className="stat-card p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>
                  {c.raw ? (c.value as number)?.toLocaleString() : c.value}
                </p>
                {c.sub && (
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>{c.sub}</p>
                )}
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl"
                style={{ background: '#EFF6FF' }}
              >
                <Icon size={22} style={{ color: c.color }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ---------- Pending Transactions Quick Panel ---------- */}
      {stats.pendingTransactions?.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-5"
          style={{ borderLeft: '3px solid #3B82F6' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: '#3B82F6' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>
              Pending Transactions
            </h3>
            <span className="badge badge-amber ml-2">{stats.pendingTransactions.length}</span>
          </div>
          <div className="space-y-3">
            {stats.pendingTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: '#F8FAFC' }}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={16} style={{ color: '#64748B' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1E293B' }}>{tx.user?.name || 'Unknown'}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{tx.user?.email || ''} · {formatUSD(tx.amount)} {tx.currency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${tx.type === 'DEPOSIT' ? 'badge-green' : 'badge-red'}`}>
                    {tx.type}
                  </span>
                  <button
                    className="btn-secondary text-xs px-3 py-1 rounded-lg"
                    style={{ cursor: 'pointer' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---------- Charts Row ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deposits vs Withdrawals — Last 7 Days */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} style={{ color: '#10B981' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>
              Deposits vs Withdrawals — Last 7 Days
            </h3>
          </div>
          <p className="text-xs mb-4" style={{ color: '#64748B' }}>Daily net flow comparison</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.dailyStats}>
              <defs>
                <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWdr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#10B981" fill="url(#gradDep)" strokeWidth={2} />
              <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#EF4444" fill="url(#gradWdr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Overview */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} style={{ color: '#3B82F6' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>
              Monthly Overview
            </h3>
          </div>
          <p className="text-xs mb-4" style={{ color: '#64748B' }}>Aggregated monthly deposits and withdrawals</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="deposits" name="Deposits" fill="#10B981" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="withdrawals" name="Withdrawals" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ---------- Bottom Row ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Trading Pairs */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} style={{ color: '#3B82F6' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>Top Trading Pairs</h3>
          </div>
          {stats.topPairs?.length > 0 ? (
            <div className="space-y-2">
              {stats.topPairs.map((pair, idx) => (
                <div
                  key={pair.symbol}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                  style={{ background: idx % 2 === 0 ? '#F8FAFC' : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-center" style={{ color: '#64748B' }}>{idx + 1}</span>
                    <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>{pair.symbol}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#64748B' }}>Trades</p>
                      <p className="text-sm font-medium" style={{ color: '#64748B' }}>{pair.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#64748B' }}>Volume</p>
                      <p className="text-sm font-medium" style={{ color: '#64748B' }}>{formatUSD(pair.volume)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#64748B' }}>PnL</p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: pair.pnl >= 0 ? '#10B981' : '#EF4444' }}
                      >
                        {pair.pnl >= 0 ? '+' : ''}{formatUSD(pair.pnl)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#64748B' }}>No trading data yet</p>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: '#3B82F6' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>Recent Activity</h3>
          </div>
          {stats.recentLogins?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentLogins.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                  style={{ background: idx % 2 === 0 ? '#F8FAFC' : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    {entry.success ? (
                      <UserCheck size={16} style={{ color: '#10B981' }} />
                    ) : (
                      <UserX size={16} style={{ color: '#EF4444' }} />
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1E293B' }}>{entry.user?.name || entry.email}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>{entry.user?.email || entry.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${entry.success ? 'badge-green' : 'badge-red'}`}>
                      {entry.success ? 'Success' : 'Failed'}
                    </span>
                    <span className="text-xs whitespace-nowrap" style={{ color: '#64748B' }}>
                      {timeAgo(entry.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#64748B' }}>No recent activity</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}