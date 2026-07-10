'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowDownCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ─── Types ─── */
interface DepositUser {
  name: string;
  email: string;
}

interface Deposit {
  _id: string;
  id: string;
  userId: string;
  currency: string;
  amount: number;
  fee: number;
  status: string;
  method: string | null;
  txHash: string | null;
  note: string | null;
  description: string | null;
  createdAt: string;
  user: DepositUser;
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
const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Failed'] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-amber',
    COMPLETED: 'badge-green',
    FAILED: 'badge-red',
  };
  return map[status] || 'badge-amber';
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

function truncateHash(hash: string | null, maxLen = 18) {
  if (!hash) return '—';
  if (hash.length <= maxLen) return hash;
  return `${hash.slice(0, maxLen - 3)}...`;
}

function formatCurrency(amount: number, currency: string) {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/* ─── Component ─── */
export default function DepositManagementPage() {
  const token = useStore((s) => s.token);

  // Data state
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

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
        params.set('status', statusFilter.toUpperCase());
      }
      const res = await fetch(`/api/admin/deposits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch deposits');
      const data = await res.json();
      setDeposits(data.deposits || []);
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDeposits();
  }, [fetchDeposits]);

  /* ─── Approve ─── */
  async function handleApprove(txId: string) {
    if (!confirm('Are you sure you want to approve this deposit? This will credit the user\'s balance.')) return;
    setActioningId(txId);
    setActionLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/deposits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txId, action: 'approve' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to approve deposit');
      }
      setSuccessMsg('Deposit approved and balance credited successfully.');
      fetchDeposits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve deposit');
    } finally {
      setActioningId(null);
      setActionLoading(false);
    }
  }

  /* ─── Reject ─── */
  async function handleReject(txId: string) {
    if (!confirm('Are you sure you want to reject this deposit?')) return;
    setActioningId(txId);
    setActionLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/deposits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txId, action: 'reject' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to reject deposit');
      }
      setSuccessMsg('Deposit rejected successfully.');
      fetchDeposits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject deposit');
    } finally {
      setActioningId(null);
      setActionLoading(false);
    }
  }

  /* ─── Filter change ─── */
  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setPage(1);
  }

  /* ─── Client-side search filter ─── */
  const filteredDeposits = deposits.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.user?.name || '').toLowerCase().includes(q) ||
      (d.user?.email || '').toLowerCase().includes(q) ||
      (d.txHash || '').toLowerCase().includes(q) ||
      (d.userId || '').toLowerCase().includes(q)
    );
  });

  /* ─── Stat cards ─── */
  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const pendingAmount = deposits.filter((d) => d.status === 'PENDING').reduce((a, d) => a + d.amount, 0);

  const statCards = [
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: Clock,
      color: '#f5b400',
      bgColor: 'rgba(245, 180, 0, 0.08)',
      borderColor: 'rgba(245, 180, 0, 0.2)',
    },
    {
      label: 'Pending Amount',
      value: formatCurrency(pendingAmount, 'USDT'),
      icon: DollarSign,
      color: '#0F5EFF',
      bgColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    {
      label: 'Total Records',
      value: pagination.total,
      icon: ArrowDownCircle,
      color: '#00E676',
      bgColor: 'rgba(74, 222, 128, 0.08)',
      borderColor: 'rgba(74, 222, 128, 0.2)',
    },
  ];

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>

      {/* Filter Bar */}
      <motion.div className="glass-card p-4" variants={itemVariants}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
            <Search size={14} className="inline -mt-0.5 mr-1" />
            Status:
          </span>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => handleFilterChange(opt)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: 'none',
                  background: isActive ? '#0F5EFF' : 'var(--bg-hover)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover-subtle)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {opt}
              </button>
            );
          })}

          {/* Search input */}
          <div className="ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, email, or tx hash..."
                className="input-field"
                style={{ fontSize: 13, padding: '7px 12px 7px 32px', width: 260 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success message */}
      {successMsg && (
        <motion.div
          className="glass-card p-4"
          variants={itemVariants}
          style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} style={{ color: '#00E676' }} />
            <p style={{ color: '#00E676' }}>{successMsg}</p>
            <button
              onClick={() => setSuccessMsg('')}
              style={{ marginLeft: 'auto', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}

      {/* Error */}
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
                <th>Amount</th>
                <th>Currency</th>
                <th>Method</th>
                <th>TX Hash</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No deposit requests found
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((d) => (
                  <tr key={d.id || d._id}>
                    {/* User */}
                    <td>
                      <div>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {d.user?.name || 'Unknown'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {d.user?.email || '—'}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {d.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Currency */}
                    <td>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {d.currency || '—'}
                      </span>
                    </td>

                    {/* Method */}
                    <td>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {d.method || '—'}
                      </span>
                    </td>

                    {/* TX Hash */}
                    <td>
                      <code
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                        title={d.txHash || ''}
                      >
                        {truncateHash(d.txHash)}
                      </code>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${statusBadge(d.status)}`}>
                        {d.status}
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
                            className="btn-primary py-1.5 px-3 text-xs"
                            style={{ padding: '6px 14px', fontSize: 12 }}
                            disabled={actionLoading || actioningId === (d.id || d._id)}
                            onClick={() => handleApprove(d.id || d._id)}
                          >
                            <CheckCircle size={14} className="inline -mt-0.5 mr-1" />
                            Approve
                          </button>
                          <button
                            disabled={actionLoading || actioningId === (d.id || d._id)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: 'Inter, sans-serif',
                              cursor: 'pointer',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ff3d57',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: 'var(--radius-md)',
                              transition: 'all 0.15s',
                            }}
                            onClick={() => handleReject(d.id || d._id)}
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
                ))
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
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary py-1 px-3 text-sm"
              style={{ padding: '6px 12px' }}
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm px-2" style={{ color: 'var(--text-secondary)' }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              className="btn-secondary py-1 px-3 text-sm"
              style={{ padding: '6px 12px' }}
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