'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Snowflake, CheckCircle, Plus, Minus, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface WalletData {
  id: string;
  userId?: string;
  userName?: string;
  type: string;
  usdtBalance?: number;
  btcBalance?: number;
  totalEquity?: number;
  status: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function typeBadge(type: string) {
  return type === 'SPOT' ? 'badge-green' : 'badge-blue';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'badge-green',
    FROZEN: 'badge-red',
    LOCKED: 'badge-amber',
  };
  return map[status] || 'badge-amber';
}

export default function WalletManagementPage() {
  const token = useStore((s) => s.token);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Adjust balance
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'sub'>('add');
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState({
    totalWallets: 0,
    totalEquity: 0,
    frozenAssets: 0,
    activeWallets: 0,
  });

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wallets');
      const data = await res.json();
      setWallets(data.wallets || data.data || []);
      setStats({
        totalWallets: data.stats?.totalWallets || data.total || 0,
        totalEquity: data.stats?.totalEquity || 0,
        frozenAssets: data.stats?.frozenAssets || 0,
        activeWallets: data.stats?.activeWallets || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  async function handleAdjustSubmit() {
    if (!adjustId || !adjustAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletId: adjustId,
          amount: adjustAction === 'add' ? Number(adjustAmount) : -Number(adjustAmount),
        }),
      });
      if (!res.ok) throw new Error('Failed to adjust balance');
      setAdjustId(null);
      setAdjustAmount('');
      fetchWallets();
    } catch {
      alert('Failed to adjust balance');
    } finally {
      setActionLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Wallets', value: stats.totalWallets.toLocaleString(), icon: Wallet, color: '#3b82f6' },
    { label: 'Total Equity', value: `$${stats.totalEquity.toLocaleString()}`, icon: DollarSign, color: '#22c55e' },
    { label: 'Frozen Assets', value: `$${stats.frozenAssets.toLocaleString()}`, icon: Snowflake, color: '#f59e0b' },
    { label: 'Active Wallets', value: stats.activeWallets.toLocaleString(), icon: CheckCircle, color: '#8b5cf6' },
  ];

  if (loading && wallets.length === 0) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Wallet Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>View and manage user wallets and balances.</p>
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
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            </motion.div>
          );
        })}
      </div>

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
                <th>Type</th>
                <th>USDT Balance</th>
                <th>BTC Balance</th>
                <th>Total Equity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No wallets found
                  </td>
                </tr>
              ) : (
                wallets.map((w) => (
                  <React.Fragment key={w.id}>
                    <tr>
                      <td style={{ color: 'var(--text-primary)' }}>{w.userName || w.userId || '—'}</td>
                      <td><span className={`badge ${typeBadge(w.type)}`}>{w.type}</span></td>
                      <td style={{ color: 'var(--text-primary)' }}>${(w.usdtBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{(w.btcBalance || 0).toFixed(8)}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${(w.totalEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td><span className={`badge ${statusBadge(w.status)}`}>{w.status}</span></td>
                      <td>
                        <button
                          className="btn-secondary py-1 px-3 text-xs"
                          onClick={() => { setAdjustId(w.id); setAdjustAmount(''); setAdjustAction('add'); }}
                        >
                          Adjust Balance
                        </button>
                      </td>
                    </tr>
                    {adjustId === w.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: 'none' }}>
                          <div className="p-4 flex flex-wrap items-center gap-3" style={{ background: 'var(--bg-primary)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Adjust:</span>
                            <button
                              className={`py-1 px-3 text-xs rounded-lg font-medium ${adjustAction === 'add' ? 'text-green' : ''}`}
                              style={{
                                background: adjustAction === 'add' ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)',
                                border: `1px solid ${adjustAction === 'add' ? 'rgba(34,197,94,0.3)' : 'var(--border-color)'}`,
                                cursor: 'pointer',
                                color: adjustAction === 'add' ? 'var(--accent-green)' : 'var(--text-secondary)',
                              }}
                              onClick={() => setAdjustAction('add')}
                            >
                              <Plus size={14} /> Add
                            </button>
                            <button
                              className={`py-1 px-3 text-xs rounded-lg font-medium ${adjustAction === 'sub' ? 'text-red' : ''}`}
                              style={{
                                background: adjustAction === 'sub' ? 'rgba(239,68,68,0.15)' : 'var(--bg-card)',
                                border: `1px solid ${adjustAction === 'sub' ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                                cursor: 'pointer',
                                color: adjustAction === 'sub' ? 'var(--accent-red)' : 'var(--text-secondary)',
                              }}
                              onClick={() => setAdjustAction('sub')}
                            >
                              <Minus size={14} /> Subtract
                            </button>
                            <input
                              type="number"
                              placeholder="Amount (USDT)"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              className="input-field"
                              style={{ width: 160 }}
                            />
                            <button className="btn-primary py-1 px-4 text-xs" disabled={!adjustAmount || actionLoading} onClick={handleAdjustSubmit}>
                              Apply
                            </button>
                            <button className="btn-secondary py-1 px-3 text-xs" onClick={() => setAdjustId(null)}>
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}