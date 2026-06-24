'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Trade {
  id: string;
  user?: string;
  userName?: string;
  symbol: string;
  side: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  leverage?: number;
  pnl?: number;
  status: string;
  createdAt?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function sideBadge(side: string) {
  return side === 'BUY' ? 'badge-green' : 'badge-red';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: 'badge-blue',
    CLOSED: 'badge-green',
    LIQUIDATED: 'badge-red',
    PENDING: 'badge-amber',
    CANCELLED: 'badge-amber',
  };
  return map[status] || 'badge-amber';
}

export default function TradeMonitoringPage() {
  const token = useStore((s) => s.token);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [symbol, setSymbol] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sideFilter, setSideFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [stats, setStats] = useState({
    totalTrades: 0,
    openPositions: 0,
    todayVolume: 0,
    totalPnl: 0,
  });

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        symbol,
        status: statusFilter,
        side: sideFilter,
      });
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const res = await fetch(`/api/admin/trades?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch trades');
      const data = await res.json();
      setTrades(data.trades || data.data || []);
      setTotal(data.total || 0);
      setStats({
        totalTrades: data.stats?.totalTrades || data.total || 0,
        openPositions: data.stats?.openPositions || 0,
        todayVolume: data.stats?.todayVolume || 0,
        totalPnl: data.stats?.totalPnl || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [token, page, symbol, statusFilter, sideFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  const statCards = [
    { label: 'Total Trades', value: stats.totalTrades.toLocaleString(), icon: BarChart3, color: '#3b82f6' },
    { label: 'Open Positions', value: stats.openPositions.toLocaleString(), icon: Activity, color: '#22c55e' },
    { label: "Today's Volume", value: `$${stats.todayVolume.toLocaleString()}`, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Total PnL', value: `$${stats.totalPnl.toLocaleString()}`, icon: DollarSign, color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444' },
  ];

  if (loading && trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3" style={{ animation: 'spin 0.6s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 animate-fade-in" variants={containerVariants} initial="hidden" animate="show" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Trade Monitoring</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Monitor all platform trades in real time.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: `${s.color}15` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div className="glass-card p-4" variants={itemVariants}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Symbol (e.g. BTCUSDT)" value={symbol} onChange={(e) => { setSymbol(e.target.value); setPage(1); }} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field" style={{ width: 'auto', minWidth: 130 }}>
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="LIQUIDATED">LIQUIDATED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <select value={sideFilter} onChange={(e) => { setSideFilter(e.target.value); setPage(1); }} className="input-field" style={{ width: 'auto', minWidth: 120 }}>
            <option value="">All Sides</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input-field" style={{ width: 'auto' }} />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="input-field" style={{ width: 'auto' }} />
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: 'var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Qty</th>
                <th>Leverage</th>
                <th>PnL</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No trades found
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{t.userName || t.user || '—'}</td>
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.symbol}</td>
                    <td><span className={`badge ${sideBadge(t.side)}`}>{t.side}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.entryPrice != null ? `$${Number(t.entryPrice).toLocaleString()}` : '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.exitPrice != null ? `$${Number(t.exitPrice).toLocaleString()}` : '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.quantity || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.leverage ? `${t.leverage}x` : '—'}</td>
                    <td>
                      <span style={{ color: (t.pnl || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                        {t.pnl != null ? `$${Number(t.pnl).toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {total > 0 ? startIdx : 0}-{endIdx} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3 text-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
            <button className="btn-secondary py-1 px-3 text-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}