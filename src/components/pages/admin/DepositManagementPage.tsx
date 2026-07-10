'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ─── Types ─── */
interface DepositUser {
  name: string;
  email: string;
  phone?: string;
}

interface Deposit {
  id: string;
  userId: string;
  user: DepositUser | null;
  currency: string;
  amount: number;
  fee: number;
  status: string;
  method: string | null;
  txHash: string | null;
  note: string | null;
  description: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ─── Status helpers ─── */
function statusBadge(status: string) {
  return { PENDING: 'badge-amber', COMPLETED: 'badge-green', FAILED: 'badge-red', CANCELLED: 'badge-silver' }[status] || 'badge-amber';
}

function statusIcon(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
    case 'FAILED':
    case 'CANCELLED':
      return <XCircle size={16} style={{ color: '#FF3D57' }} />;
    default:
      return <Clock size={16} style={{ color: '#f59e0b' }} />;
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/* ─── Component ─── */
export default function DepositManagementPage() {
  const token = useStore((s) => s.token);

  // Data state
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ─── Fetch deposits ─── */
  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter !== 'All') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }
      const res = await fetch(`/api/admin/deposits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch deposits');
      const data = await res.json();
      setDeposits(data.deposits || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDeposits();
  }, [fetchDeposits]);

  /* ─── Approve / Reject handler ─── */
  async function handleAction(txId: string, action: 'approve' | 'reject') {
    setActionLoading(txId);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txId, action, note: '' }),
      });
      if (!res.ok) throw new Error('Action failed');
      fetchDeposits();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  /* ─── Filter change ─── */
  function handleFilterChange(val: string) {
    setStatusFilter(val);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  /* ─── Computed stats ─── */
  const totalDeposits = pagination.total;
  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const approvedCount = deposits.filter((d) => d.status === 'COMPLETED').length;
  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);

  /* ─── Stat cards ─── */
  const statCards = [
    {
      label: 'Total Deposits',
      value: totalDeposits,
      icon: Wallet,
      color: '#E53935',
      bgColor: 'rgba(229, 57, 53, 0.08)',
      borderColor: 'rgba(229, 57, 53, 0.2)',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: CheckCircle,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.08)',
      borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    {
      label: 'Total Amount',
      value: formatAmount(totalAmount),
      icon: ArrowDownLeft,
      color: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
      borderColor: 'rgba(255, 215, 0, 0.2)',
    },
  ];

  /* ─── Pagination helpers ─── */
  const startItem = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
  }

  const pageNumbers = getPageNumbers(pagination.page, pagination.totalPages);

  /* ─── Loading state ─── */
  if (loading && deposits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"
            style={{ animation: 'spin 0.6s linear infinite' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Deposit Management
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review and process user deposit requests.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={itemVariants}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              className="stat-card"
              variants={itemVariants}
              style={{ borderColor: s.borderColor }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {s.label}
                </span>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 40,
                    height: 40,
                    background: s.bgColor,
                  }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div className="glass-card p-4" variants={itemVariants}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field"
              style={{ fontSize: 13, padding: '8px 12px 8px 34px', width: '100%' }}
            />
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="input-field"
            style={{
              fontSize: 13,
              padding: '8px 12px',
              minWidth: 160,
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div
          className="glass-card p-4"
          variants={itemVariants}
          style={{ borderColor: 'var(--accent-red)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: 'var(--accent-red)' }} />
            <p style={{ color: 'var(--accent-red)' }}>{error}</p>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <ArrowDownLeft size={48} style={{ opacity: 0.4, color: 'var(--text-muted)' }} />
                      <p style={{ color: 'var(--text-muted)' }}>No deposit requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                deposits.map((d) => {
                  const methodDisplay = d.method || d.description || '—';
                  return (
                    <tr key={d.id}>
                      {/* User */}
                      <td>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {d.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {d.user?.email || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Currency */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {d.currency || '—'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {d.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Fee */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {d.fee > 0 ? d.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${statusBadge(d.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {statusIcon(d.status)}
                          {d.status}
                        </span>
                      </td>

                      {/* Method */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {methodDisplay}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(d.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        {d.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, 'approve')}
                            >
                              <CheckCircle size={14} className="inline -mt-0.5 mr-1" />
                              Approve
                            </button>
                            <button
                              className="btn-danger"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, 'reject')}
                            >
                              <XCircle size={14} className="inline -mt-0.5 mr-1" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {startItem}–{endItem} of {pagination.total}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              className="btn-secondary"
              style={{ padding: '6px 10px' }}
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="text-sm px-1.5" style={{ color: 'var(--text-muted)' }}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  style={{
                    padding: '5px 10px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: pagination.page === p ? 'default' : 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    transition: 'all 0.15s',
                    background: pagination.page === p ? '#0F5EFF' : 'transparent',
                    color: pagination.page === p ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn-secondary"
              style={{ padding: '6px 10px' }}
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}