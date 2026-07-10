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
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ─── Types ─── */
interface WithdrawalUser {
  name: string;
  email: string;
}

interface Withdrawal {
  _id: string;
  id: string;
  userId: string;
  currency: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  accountNumber: string;
  accountName: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  createdAt: string;
  user: WithdrawalUser;
}

interface Summary {
  pendingCount: number;
  approvedToday: number;
  pendingAmount: number;
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
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'Processing', 'Completed'] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-amber',
    APPROVED: 'badge-green',
    REJECTED: 'badge-red',
    PROCESSING: 'badge-blue',
    COMPLETED: 'badge-green',
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

function truncateAccount(num: string, maxLen = 18) {
  if (num.length <= maxLen) return num;
  return `${num.slice(0, maxLen - 3)}...`;
}

function formatCurrency(amount: number, currency: string) {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/* ─── Component ─── */
export default function WithdrawalManagementPage() {
  const token = useStore((s) => s.token);

  // Data state
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [summary, setSummary] = useState<Summary>({ pendingCount: 0, approvedToday: 0, pendingAmount: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Reject inline action
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  /* ─── Fetch withdrawals ─── */
  const fetchWithdrawals = useCallback(async () => {
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
      const res = await fetch(`/api/admin/withdrawals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setSummary(data.summary || { pendingCount: 0, approvedToday: 0, pendingAmount: 0 });
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch pattern
    void fetchWithdrawals();
  }, [fetchWithdrawals]);

  /* ─── Approve ─── */
  async function handleApprove(withdrawalId: string) {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve', txId: withdrawalId }),
      });
      if (!res.ok) throw new Error('Failed to approve withdrawal');
      fetchWithdrawals();
    } catch {
      alert('Failed to approve withdrawal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  /* ─── Reject ─── */
  async function handleRejectConfirm(withdrawalId: string) {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject', txId: withdrawalId, note: rejectReason.trim() }),
      });
      if (!res.ok) throw new Error('Failed to reject withdrawal');
      setRejectingId(null);
      setRejectReason('');
      fetchWithdrawals();
    } catch {
      alert('Failed to reject withdrawal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  /* ─── Filter change ─── */
  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setPage(1);
  }

  /* ─── Stat cards ─── */
  const statCards = [
    {
      label: 'Pending Requests',
      value: summary.pendingCount,
      icon: Clock,
      color: '#f5b400',
      bgColor: 'rgba(245, 180, 0, 0.08)',
      borderColor: 'rgba(245, 180, 0, 0.2)',
    },
    {
      label: 'Pending Amount',
      value: formatCurrency(summary.pendingAmount, 'PKR'),
      icon: DollarSign,
      color: '#0F5EFF',
      bgColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    {
      label: 'Approved Today',
      value: summary.approvedToday,
      icon: CheckCircle,
      color: '#00E676',
      bgColor: 'rgba(74, 222, 128, 0.08)',
      borderColor: 'rgba(74, 222, 128, 0.2)',
    },
  ];

  /* ─── Loading state ─── */
  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"
            style={{ animation: 'spin 0.6s linear infinite' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading withdrawal requests...</p>
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
          Withdrawal Management
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review and manage user withdrawal requests.
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
        </div>
      </motion.div>

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
                <th>Method</th>
                <th>Account</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <React.Fragment key={w.id}>
                    <tr>
                      {/* User */}
                      <td>
                        <div>
                          <div
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {w.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {w.user?.email || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <div>
                          <div
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {formatCurrency(w.netAmount, w.currency)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Fee: {formatCurrency(w.fee, w.currency)}
                          </div>
                        </div>
                      </td>

                      {/* Method */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {w.method}
                        </span>
                      </td>

                      {/* Account */}
                      <td>
                        <div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                            title={w.accountNumber}
                          >
                            {truncateAccount(w.accountNumber)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {w.accountName}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${statusBadge(w.status)}`}>
                          {w.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(w.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        {w.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="btn-primary py-1.5 px-3 text-xs"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                              disabled={actionLoading}
                              onClick={() => handleApprove(w.id)}
                            >
                              <CheckCircle size={14} className="inline -mt-0.5 mr-1" />
                              Approve
                            </button>
                            {rejectingId === w.id ? null : (
                              <button
                                disabled={actionLoading}
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
                                onClick={() => setRejectingId(w.id)}
                              >
                                <XCircle size={14} className="inline -mt-0.5 mr-1" />
                                Reject
                              </button>
                            )}
                          </div>
                        ) : w.status === 'REJECTED' && w.rejectReason ? (
                          <span
                            className="text-xs flex items-center gap-1"
                            style={{ color: '#ff3d57', maxWidth: 200, wordBreak: 'break-word' }}
                            title={w.rejectReason}
                          >
                            <AlertTriangle size={12} className="flex-shrink-0" />
                            <span className="truncate">{w.rejectReason}</span>
                          </span>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Inline reject row */}
                    {rejectingId === w.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: '8px 14px' }}>
                          <div
                            className="flex flex-wrap items-end gap-3 p-3 rounded-lg"
                            style={{
                              background: 'rgba(239, 68, 68, 0.06)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                            }}
                          >
                            <div className="flex-1 min-w-[200px]">
                              <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: '#ff3d57' }}
                              >
                                <AlertTriangle size={12} className="inline -mt-0.5 mr-1" />
                                Rejection Reason (required)
                              </label>
                              <input
                                type="text"
                                placeholder="Enter reason for rejecting this withdrawal..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="input-field"
                                style={{ fontSize: 13, padding: '8px 12px' }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRejectConfirm(w.id);
                                  if (e.key === 'Escape') {
                                    setRejectingId(null);
                                    setRejectReason('');
                                  }
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="btn-primary py-1.5 px-4 text-xs"
                                style={{
                                  padding: '7px 16px',
                                  fontSize: 12,
                                  background: 'rgba(239, 68, 68, 0.8)',
                                }}
                                disabled={actionLoading || !rejectReason.trim()}
                                onClick={() => handleRejectConfirm(w.id)}
                              >
                                <XCircle size={13} className="inline -mt-0.5 mr-1" />
                                Confirm Reject
                              </button>
                              <button
                                className="btn-secondary py-1.5 px-4 text-xs"
                                style={{ padding: '7px 16px', fontSize: 12 }}
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectReason('');
                                }}
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                            </div>
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