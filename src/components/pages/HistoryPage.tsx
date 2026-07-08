'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  status: string;
  currency: string;
  amount: number;
  fee: number;
  fromWallet: string | null;
  toWallet: string | null;
  tradeId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

type HistoryFilter = 'all' | 'DEPOSIT' | 'WITHDRAW' | 'TRADE';

const filterTabs: { key: HistoryFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <History size={14} /> },
  { key: 'DEPOSIT', label: 'Deposits', icon: <ArrowDownLeft size={14} /> },
  { key: 'WITHDRAW', label: 'Withdrawals', icon: <ArrowUpRight size={14} /> },
  { key: 'TRADE', label: 'Trades', icon: <ArrowLeftRight size={14} /> },
];

function getStatusBadge(status: string): string {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'SUCCESS':
      return 'badge-green';
    case 'PENDING':
    case 'PROCESSING':
      return 'badge-amber';
    case 'FAILED':
    case 'REJECTED':
      return 'badge-red';
    default:
      return 'badge-blue';
  }
}

function formatStatus(status: string): string {
  return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown';
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'DEPOSIT':
      return <ArrowDownLeft size={16} style={{ color: 'var(--accent-green)' }} />;
    case 'WITHDRAW':
      return <ArrowUpRight size={16} style={{ color: 'var(--accent-red)' }} />;
    case 'TRADE':
      return <ArrowLeftRight size={16} style={{ color: 'var(--accent-cyan)' }} />;
    default:
      return <FileText size={16} style={{ color: 'var(--text-muted)' }} />;
  }
}

function truncateId(id: string): string {
  if (!id) return '—';
  return id.length > 18 ? `${id.slice(0, 10)}...${id.slice(-6)}` : id;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const { token } = useStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(
    async (pageNum: number, filter: HistoryFilter, isRefresh = false) => {
      if (!token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(PAGE_SIZE),
        });
        if (filter !== 'all') params.set('type', filter);

        const res = await fetch(`/api/wallet/transactions?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();

        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchTransactions(1, activeFilter);
  }, [activeFilter, fetchTransactions]);

  const handleRefresh = () => {
    fetchTransactions(page, activeFilter, true);
  };

  const handleFilterChange = (filter: HistoryFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchTransactions(newPage, activeFilter);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, activeFilter);
    }
  };

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
            Transaction History
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            View all your deposits, withdrawals, and trades
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
          <button className="ml-auto text-xs btn-secondary" onClick={handleRefresh}>
            Retry
          </button>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 flex-wrap items-center"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeFilter === tab.key ? 'rgba(245, 180, 0, 0.12)' : 'var(--bg-secondary)',
              border: `1px solid ${activeFilter === tab.key ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: activeFilter === tab.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {totalPages > 1 && (
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} className="inline mr-1" />
            Page {page} of {totalPages} · {transactions.length} result{transactions.length !== 1 ? 's' : ''}
          </span>
        )}
      </motion.div>

      {/* Transaction Table */}
      <motion.div className="glass-card overflow-hidden" variants={itemVariants}>
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <History size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
              No transactions found
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeFilter === 'all'
                ? 'Your transaction history will appear here once you make a deposit, withdrawal, or trade.'
                : `No ${activeFilter.toLowerCase()} transactions found.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>TX ID</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {transactions.map((tx) => (
                      <motion.tr
                        key={tx._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td
                          className="font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {tx.currency}
                        </td>
                        <td>
                          <span
                            className={`font-semibold ${
                              tx.type === 'DEPOSIT' ? 'text-green' : tx.type === 'WITHDRAW' ? 'text-red' : ''
                            }`}
                            style={!tx.type || tx.type === 'TRADE' ? { color: 'var(--text-primary)' } : undefined}
                          >
                            {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAW' ? '-' : ''}
                            {tx.amount?.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {tx.fee ? tx.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : '—'}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(tx.status)}`}>
                            {formatStatus(tx.status)}
                          </span>
                        </td>
                        <td
                          style={{
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            fontSize: 12,
                          }}
                        >
                          {truncateId(tx._id)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid var(--border-color)' }}
              >
                <button
                  className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  style={{ opacity: page <= 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <motion.button
                    className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLoadMore}
                  >
                    Next
                    <ChevronRight size={14} />
                  </motion.button>
                ) : (
                  <button
                    className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3"
                    disabled
                    style={{ opacity: 0.4 }}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}