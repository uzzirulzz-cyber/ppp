'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  CircleDollarSign,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

// ── Types ──────────────────────────────────────────────────────────────────

interface WalletBalance {
  currency: string;
  amount: number;
  frozen: number;
}

interface WalletData {
  id: string;
  userId: string;
  type: string;
  status: string;
  totalEquity: number;
  balances: WalletBalance[];
}

interface TradeRecord {
  _id: string;
  symbol: string;
  side: string;
  type: string;
  status: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  createdAt: string;
}

interface TransactionRecord {
  _id: string;
  type: string;
  status: string;
  currency: string;
  amount: number;
  fee: number;
  description: string;
  createdAt: string;
}

// ── Mock Market Data ───────────────────────────────────────────────────────

const marketCoins = [
  { pair: 'BTC/USDT', price: 67342.18, change: 2.35 },
  { pair: 'ETH/USDT', price: 3521.47, change: 1.82 },
  { pair: 'BNB/USDT', price: 589.12, change: -0.94 },
  { pair: 'SOL/USDT', price: 178.93, change: 4.21 },
  { pair: 'XRP/USDT', price: 0.6234, change: -1.37 },
  { pair: 'DOGE/USDT', price: 0.1523, change: 3.58 },
  { pair: 'ADA/USDT', price: 0.4812, change: -2.14 },
  { pair: 'AVAX/USDT', price: 37.65, change: 1.09 },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPrice = (n: number) => {
  if (n >= 1000) return '$' + fmt(n);
  if (n >= 1) return '$' + fmt(n);
  return '$' + n.toFixed(4);
};

function generatePortfolioData(baseValue: number) {
  const data = [];
  let value = baseValue || 50000;
  if (value === 0) value = 50000;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.45) * (value * 0.02);
    value = Math.max(value * 0.85, Math.min(value * 1.15, value));
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

// ── Chart Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(10, 15, 26, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ── Skeleton Loader ────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 20, rounded = 6 }: { width?: string; height?: number; rounded?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: rounded,
        background: 'linear-gradient(90deg, rgba(42,48,66,0.4) 25%, rgba(42,48,66,0.8) 50%, rgba(42,48,66,0.4) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={90} height={14} />
        <Skeleton width={40} height={40} rounded={10} />
      </div>
      <Skeleton width={140} height={28} />
      <Skeleton width={80} height={12} />
    </div>
  );
}

// ── Variants ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ── Component ──────────────────────────────────────────────────────────────

interface DashboardData {
  me: { id: string; name: string; role: string; status: string } | null;
  totalEquity: number;
  availableUSDT: number;
  totalPnl: number;
  activeTrades: number;
  totalTrades: number;
  trades: TradeRecord[];
  transactions: TransactionRecord[];
  portfolioData: Array<{ date: string; value: number }>;
}

const initialData: DashboardData = {
  me: null,
  totalEquity: 0,
  availableUSDT: 0,
  totalPnl: 0,
  activeTrades: 0,
  totalTrades: 0,
  trades: [],
  transactions: [],
  portfolioData: [],
};

export default function DashboardPage() {
  const { token, user: storeUser, currentPage, navigate } = useStore();

  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (currentToken: string) => {
    const headers = { Authorization: `Bearer ${currentToken}` };

    try {
      setError(null);
      setLoading(true);

      const [meRes, walletRes, tradesRes, txRes] = await Promise.all([
        fetch('/api/auth/me', { headers }).then((r) => r.json()),
        fetch('/api/wallet', { headers }).then((r) => r.json()),
        fetch('/api/trades?limit=10', { headers }).then((r) => r.json()),
        fetch('/api/wallet/transactions?limit=10', { headers }).then((r) => r.json()),
      ]);

      // Build new state
      const next: DashboardData = { ...initialData, portfolioData: generatePortfolioData(0) };

      // User info
      if (meRes.user) {
        next.me = meRes.user;
      }

      // Wallet data
      if (walletRes.wallets) {
        const equity = walletRes.totalEquity || 0;
        next.totalEquity = equity;

        let avail = 0;
        for (const w of walletRes.wallets as WalletData[]) {
          for (const b of w.balances) {
            if (b.currency === 'USDT') {
              avail += b.amount - b.frozen;
            }
          }
        }
        next.availableUSDT = avail;
        next.portfolioData = generatePortfolioData(equity);
      }

      // Trades
      if (tradesRes.trades) {
        const tList = tradesRes.trades as TradeRecord[];
        next.trades = tList;
        next.totalTrades = tradesRes.pagination?.total ?? tList.length;
        next.activeTrades = tList.filter((t) => t.status === 'OPEN').length;
        next.totalPnl = tList
          .filter((t) => t.status === 'CLOSED' || t.status === 'LIQUIDATED')
          .reduce((sum, t) => sum + (t.pnl || 0), 0);
      } else {
        try {
          const allTrades = await fetch('/api/trades?limit=100', { headers }).then((r) => r.json());
          if (allTrades.trades) {
            const fullList = allTrades.trades as TradeRecord[];
            next.trades = fullList.slice(0, 10);
            next.totalTrades = allTrades.pagination?.total ?? 0;
            next.activeTrades = fullList.filter((t) => t.status === 'OPEN').length;
            next.totalPnl = fullList
              .filter((t) => t.status === 'CLOSED' || t.status === 'LIQUIDATED')
              .reduce((sum, t) => sum + (t.pnl || 0), 0);
          }
        } catch {
          // silently ignore
        }
      }

      // Transactions
      if (txRes.transactions) {
        next.transactions = txRes.transactions as TransactionRecord[];
      }

      setData(next);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Data fetching on mount / page change — setState is deferred via async
      fetchAll(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage]);

  // ── Render helpers ──

  const { me, totalEquity, availableUSDT, totalPnl, activeTrades, totalTrades, trades, transactions, portfolioData } = data;

  const displayName = me?.name || storeUser?.name || 'Trader';
  const shortUid = (me?.id || storeUser?.id || '').slice(0, 8) + '...';
  const userRole = me?.role || storeUser?.role || 'USER';
  const userStatus = me?.status || storeUser?.status || 'ACTIVE';

  const pnlPositive = totalPnl >= 0;

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const statusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'CLOSED':
        return <span className="badge badge-green">{status}</span>;
      case 'PENDING':
      case 'OPEN':
        return <span className="badge badge-amber">{status}</span>;
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        return <span className="badge badge-red">{status}</span>;
      case 'LIQUIDATED':
        return <span className="badge badge-red">{status}</span>;
      default:
        return <span className="badge badge-amber">{status}</span>;
    }
  };

  // ── Render ──

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
        <p style={{ color: 'var(--accent-red)', fontSize: 16, marginBottom: 16 }}>{error}</p>
        <button
          onClick={() => token && fetchAll(token)}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

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
          Welcome back, <span className="gradient-text font-semibold">{displayName}</span>
        </p>
        {/* User Info Bar */}
        <div
          className="flex items-center gap-3 mt-2 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            display: 'inline-flex',
          }}
        >
          <span>UID: {shortUid}</span>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span>Role: {userRole}</span>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span>Status: {userStatus}</span>
        </div>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Assets */}
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Total Assets
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 40, height: 40, background: 'rgba(245, 180, 0, 0.15)' }}
                >
                  <Wallet size={20} style={{ color: 'var(--accent-gold)' }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
                ${fmt(totalEquity)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Total equity
              </div>
            </motion.div>

            {/* Available Balance */}
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Available Balance
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 40, height: 40, background: 'rgba(0, 229, 255, 0.15)' }}
                >
                  <CircleDollarSign size={20} style={{ color: 'var(--accent-cyan)' }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
                ${fmt(availableUSDT)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                USDT available
              </div>
            </motion.div>

            {/* Total P&L */}
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Total P&L
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 40,
                    height: 40,
                    background: pnlPositive
                      ? 'rgba(0, 210, 106, 0.15)'
                      : 'rgba(255, 61, 87, 0.15)',
                  }}
                >
                  <TrendingUp
                    size={20}
                    style={{ color: pnlPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
                  />
                </div>
              </div>
              <div
                className="stat-value"
                style={{ color: pnlPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
              >
                {pnlPositive ? '+' : ''}${fmt(totalPnl)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                From closed trades
              </div>
            </motion.div>

            {/* Active Trades */}
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Active Trades
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 40, height: 40, background: 'rgba(245, 180, 0, 0.15)' }}
                >
                  <Activity size={20} style={{ color: '#f5b400' }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
                {activeTrades}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Currently open
              </div>
            </motion.div>

            {/* Total Trades */}
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Total Trades
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 40, height: 40, background: 'rgba(139, 92, 246, 0.15)' }}
                >
                  <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
                {totalTrades}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                All time
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Charts Row: Portfolio + Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Chart */}
        <motion.div className="glass-card p-4 lg:col-span-2" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Portfolio Value
              </h2>
              {totalEquity === 0 && !loading && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Sample data — deposit funds to see your real portfolio
                </p>
              )}
            </div>
            <span className="badge badge-green">30D</span>
          </div>
          {loading ? (
            <div style={{ width: '100%', height: 280 }}>
              <Skeleton width="100%" height={280} rounded={8} />
            </div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5b400" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f5b400" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    domain={['dataMin - 5000', 'dataMax + 5000']}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f5b400"
                    strokeWidth={2}
                    fill="url(#goldGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Market Overview */}
        <motion.div className="glass-card p-4" variants={itemVariants}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Market Overview
          </h2>
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
            {marketCoins.map((coin) => (
              <div
                key={coin.pair}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => navigate(Pages.TRADING)}
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
                    {coin.pair.replace('/USDT', '').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {coin.pair}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {fmtPrice(coin.price)}
                  </div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: coin.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
                  >
                    {coin.change >= 0 ? '+' : ''}
                    {coin.change.toFixed(2)}%
                  </div>
                </div>
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
            style={{ color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate(Pages.HISTORY)}
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              No trades yet. Start trading now!
            </p>
            <button className="btn-primary flex items-center gap-2" onClick={() => navigate(Pages.TRADING)}>
              Start Trading
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Side</th>
                  <th>Entry Price</th>
                  <th>Quantity</th>
                  <th>P&L</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const tradePnl = trade.pnl || 0;
                  const isProfit = tradePnl >= 0;
                  return (
                    <tr key={trade._id}>
                      <td>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {trade.symbol}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${trade.side === 'BUY' ? 'badge-green' : 'badge-red'}`}>
                          {trade.side}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>
                        ${fmt(trade.entryPrice)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {trade.quantity}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              trade.status === 'OPEN'
                                ? 'var(--text-muted)'
                                : isProfit
                                  ? 'var(--accent-green)'
                                  : 'var(--accent-red)',
                          }}
                        >
                          {trade.status === 'OPEN' ? '—' : `${isProfit ? '+' : ''}$${fmt(tradePnl)}`}
                        </span>
                      </td>
                      <td>{statusBadge(trade.status)}</td>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatTime(trade.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Recent Transactions Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </h2>
          <button
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate(Pages.TRANSACTIONS)}
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No transactions yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatTime(tx.createdAt)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            tx.type === 'DEPOSIT'
                              ? 'rgba(0, 210, 106, 0.15)'
                              : tx.type === 'WITHDRAW'
                                ? 'rgba(255, 61, 87, 0.15)'
                                : 'rgba(0, 229, 255, 0.15)',
                          color:
                            tx.type === 'DEPOSIT'
                              ? 'var(--accent-green)'
                              : tx.type === 'WITHDRAW'
                                ? 'var(--accent-red)'
                                : 'var(--accent-cyan)',
                        }}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-primary)' }}>{tx.currency}</td>
                    <td style={{ color: 'var(--text-primary)' }}>
                      {tx.type === 'WITHDRAW' ? '-' : '+'}{fmt(tx.amount)}
                    </td>
                    <td>{statusBadge(tx.status)}</td>
                    <td
                      style={{ color: 'var(--text-secondary)', maxWidth: 200 }}
                      className="truncate"
                    >
                      {tx.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
        <button className="btn-gold flex items-center gap-2" onClick={() => navigate(Pages.DEPOSIT)}>
          Deposit Funds
          <ArrowRight size={16} />
        </button>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate(Pages.TRADING)}>
          Start Trading
          <ArrowRight size={16} />
        </button>
        <button className="btn-secondary flex items-center gap-2" onClick={() => navigate(Pages.HISTORY)}>
          View History
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}