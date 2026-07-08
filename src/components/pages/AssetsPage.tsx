'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Wallet,
  Snowflake,
  DollarSign,
  Coins,
  CircleDollarSign,
  Bitcoin,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

interface BalanceEntry {
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
  balances: BalanceEntry[];
  createdAt: string;
}

const CURRENCY_META: Record<string, { icon: string; color: string; label: string }> = {
  USDT: { icon: '₮', color: '#22c55e', label: 'Tether USD' },
  BTC: { icon: '₿', color: '#f59e0b', label: 'Bitcoin' },
  ETH: { icon: 'Ξ', color: '#6366f1', label: 'Ethereum' },
  BNB: { icon: 'B', color: '#f5b400', label: 'BNB' },
  SOL: { icon: 'S', color: '#8b5cf6', label: 'Solana' },
  PKR: { icon: '₨', color: '#00e5ff', label: 'Pakistani Rupee' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function AssetsPage() {
  const { token, navigate } = useStore();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wallet data');
      const data = await res.json();
      setWallets(data.wallets || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    fetchWallets();
  };

  // Aggregate all balances across wallets
  const aggregated = wallets.reduce<Record<string, BalanceEntry>>((acc, w) => {
    (w.balances || []).forEach((b) => {
      if (!acc[b.currency]) {
        acc[b.currency] = { currency: b.currency, amount: 0, frozen: 0 };
      }
      acc[b.currency].amount += b.amount || 0;
      acc[b.currency].frozen += b.frozen || 0;
    });
    return acc;
  }, {});

  const balanceList = Object.values(aggregated).filter((b) => b.amount > 0 || b.frozen > 0);
  const totalEquity = wallets.reduce((s, w) => s + (w.totalEquity || 0), 0);
  const totalAvailable = balanceList.reduce((s, b) => s + (b.amount - b.frozen), 0);
  const totalFrozen = balanceList.reduce((s, b) => s + b.frozen, 0);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
        <div
          className="animate-spin rounded-full"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-gold)',
          }}
        />
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Assets
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Overview of your trading account balances
          </p>
        </div>
        <motion.button
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ opacity: refreshing ? 0.6 : 1 }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </motion.div>

      {error && (
        <motion.div
          className="glass-card p-4 flex items-center gap-3"
          style={{ borderColor: 'rgba(255, 61, 87, 0.3)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} />
          <span className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</span>
          <button
            className="ml-auto text-xs btn-secondary"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Assets (USDT)
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, background: 'rgba(245, 180, 0, 0.15)' }}
            >
              <DollarSign size={18} style={{ color: 'var(--accent-gold)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: 28 }}>
            ${fmt(totalEquity)}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Available
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, background: 'rgba(0, 210, 106, 0.15)' }}
            >
              <CircleDollarSign size={18} style={{ color: 'var(--accent-green)' }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-green">
            ${fmt(totalAvailable)}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Frozen
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, background: 'rgba(0, 229, 255, 0.15)' }}
            >
              <Snowflake size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
            ${fmt(totalFrozen)}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <motion.button
          className="btn-primary flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(Pages.DEPOSIT)}
        >
          <Wallet size={16} />
          Deposit
        </motion.button>
        <motion.button
          className="btn-secondary flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(Pages.WITHDRAW)}
        >
          <Coins size={16} />
          Withdraw
        </motion.button>
        <motion.button
          className="btn-secondary flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(Pages.TRADING)}
        >
          <Bitcoin size={16} />
          Trade
        </motion.button>
      </motion.div>

      {/* Balance Table */}
      <motion.div className="glass-card overflow-hidden" variants={itemVariants}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Currency Balances
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {balanceList.length} asset{balanceList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {balanceList.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No balances found. Deposit funds to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Available</th>
                  <th>Frozen</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {balanceList.map((entry) => {
                  const meta = CURRENCY_META[entry.currency] || {
                    icon: entry.currency[0],
                    color: 'var(--accent-gold)',
                    label: entry.currency,
                  };
                  return (
                    <tr key={entry.currency}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center rounded-full font-bold text-xs"
                            style={{
                              width: 36,
                              height: 36,
                              background: `${meta.color}20`,
                              color: meta.color,
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </div>
                          <div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {entry.currency}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {meta.label}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="font-medium"
                        style={{ color: 'var(--accent-green)' }}
                      >
                        {fmt(entry.amount - entry.frozen)}
                      </td>
                      <td style={{ color: 'var(--accent-cyan)' }}>
                        {fmt(entry.frozen)}
                      </td>
                      <td
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {fmt(entry.amount)}
                      </td>
                      <td>
                        <ChevronRight
                          size={16}
                          style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}