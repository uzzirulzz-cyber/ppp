'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Search, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface Withdrawal {
  _id: string;
  userId: string;
  user: { name: string; email: string; phone?: string } | null;
  currency: string;
  amount: number;
  fee: number;
  status: string;
  description: string;
  createdAt: string;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-amber',
    COMPLETED: 'badge-green',
    FAILED: 'badge-red',
    CANCELLED: 'badge-silver',
  };
  return map[status] || 'badge-amber';
}

function statusIcon(status: string) {
  switch (status) {
    case 'COMPLETED': return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
    case 'FAILED': case 'CANCELLED': return <XCircle size={16} style={{ color: '#FF4757' }} />;
    default: return <Clock size={16} style={{ color: '#f59e0b' }} />;
  }
}

export default function WithdrawalManagementPage() {
  const token = useStore((s) => s.token);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/withdrawals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Stats
  const stats = {
    total: total,
    pending: withdrawals.filter((w) => w.status === 'PENDING').length,
    completed: withdrawals.filter((w) => w.status === 'COMPLETED').length,
    totalAmount: withdrawals.reduce((s, w) => s + w.amount, 0),
  };

  async function handleAction(txId: string, action: string) {
    setActionLoading(txId);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txId, action }),
      });
      if (!res.ok) throw new Error('Action failed');
      fetchWithdrawals();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3" style={{ animation: 'spin 0.6s linear infinite' }} />
          <p style={{ color: '#7A8599' }}>Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 animate-fade-in" variants={containerVariants} initial="hidden" animate="show" style={{ paddingBottom: 40 }}>
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Withdrawal Management</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8599' }}>Review and manage user withdrawal requests</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: Wallet, color: '#E53935' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#22c55e' },
          { label: 'Total Amount', value: `$${stats.totalAmount.toLocaleString()}`, icon: ArrowUpRight, color: '#FFD700' },
        ].map((s) => (
          <motion.div key={s.label} className="stat-card" variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: '#C0C7D1' }}>{s.label}</span>
              <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: '#FF4757' }}>
          <p style={{ color: '#FF4757' }}>{error}</p>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div className="flex flex-wrap items-center gap-3" variants={itemVariants}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(10,15,26,0.7)', border: '1px solid rgba(192,199,209,0.12)', minWidth: 220 }}>
          <Search size={16} style={{ color: '#7A8599' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none"
            style={{ color: '#FFFFFF', fontSize: 13, width: '100%' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
          style={{ background: 'rgba(10,15,26,0.7)', border: '1px solid rgba(192,199,209,0.12)', color: '#C0C7D1' }}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </motion.div>

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
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.filter((w) => {
                if (!search) return true;
                const q = search.toLowerCase();
                return w.user?.name?.toLowerCase().includes(q) || w.user?.email?.toLowerCase().includes(q);
              }).map((w) => (
                <tr key={w._id}>
                  <td>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{w.user?.name || 'Unknown'}</div>
                      <div className="text-xs" style={{ color: '#7A8599' }}>{w.user?.email || w.userId}</div>
                    </div>
                  </td>
                  <td style={{ color: '#C0C7D1' }}>{w.currency}</td>
                  <td className="font-semibold" style={{ color: '#FFFFFF' }}>{w.amount.toLocaleString()}</td>
                  <td style={{ color: '#7A8599' }}>{w.fee || 0}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {statusIcon(w.status)}
                      <span className={`badge ${statusBadge(w.status)}`}>{w.status}</span>
                    </div>
                  </td>
                  <td style={{ color: '#7A8599', fontSize: 13 }}>
                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(w._id, 'approve')}
                          disabled={actionLoading === w._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(w._id, 'reject')}
                          disabled={actionLoading === w._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                          style={{ background: 'rgba(255,71,87,0.15)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#7A8599', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: '#7A8599' }}>
                    <ArrowUpRight size={32} style={{ color: '#E53935', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'rgba(192,199,209,0.1)' }}>
            <span className="text-sm" style={{ color: '#7A8599' }}>
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg cursor-pointer disabled:opacity-30"
                style={{ background: 'rgba(229,57,53,0.08)', color: '#C0C7D1' }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="px-3 py-1 rounded-lg text-sm font-medium cursor-pointer"
                    style={{
                      background: p === page ? 'rgba(229,57,53,0.15)' : 'transparent',
                      color: p === page ? '#FFD700' : '#7A8599',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg cursor-pointer disabled:opacity-30"
                style={{ background: 'rgba(229,57,53,0.08)', color: '#C0C7D1' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}