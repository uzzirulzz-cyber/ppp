'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserPlus, UserX, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  agentId?: string;
  lastLogin?: string;
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

function roleBadge(role: string) {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'badge-purple',
    SUB_AGENT: 'badge-blue',
    USER: 'badge-green',
  };
  return map[role] || 'badge-green';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'badge-green',
    SUSPENDED: 'badge-red',
    LOCKED: 'badge-amber',
  };
  return map[status] || 'badge-amber';
}

export default function UserManagementPage() {
  const token = useStore((s) => s.token);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, newToday: 0, suspended: 0 });

  // Status change
  const [changingId, setChangingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        role: roleFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || data.data || []);
      setTotal(data.total || 0);
      setStats({
        total: data.stats?.total || data.total || 0,
        active: data.stats?.active || 0,
        newToday: data.stats?.newToday || 0,
        suspended: data.stats?.suspended || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  async function handleStatusChange(userId: string) {
    if (!newStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setChangingId(null);
      setNewStatus('');
      fetchUsers();
    } catch {
      alert('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch {
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: Users, color: '#3b82f6' },
    { label: 'Active Users', value: stats.active, icon: UserCheck, color: '#22c55e' },
    { label: 'New Today', value: stats.newToday, icon: UserPlus, color: '#f59e0b' },
    { label: 'Suspended', value: stats.suspended, icon: UserX, color: '#ef4444' },
  ];

  if (loading && users.length === 0) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage platform users, roles, and status.</p>
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
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div className="glass-card p-4" variants={itemVariants}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field"
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="SUB_AGENT">SUB_AGENT</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field"
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="LOCKED">LOCKED</option>
          </select>
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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                    <td><span className={`badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.agentId || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {changingId === u.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="input-field py-1 px-2 text-xs"
                              style={{ width: 'auto', minWidth: 100 }}
                            >
                              <option value="">Select...</option>
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="SUSPENDED">SUSPENDED</option>
                              <option value="LOCKED">LOCKED</option>
                            </select>
                            <button
                              className="btn-primary py-1 px-2 text-xs"
                              disabled={!newStatus || actionLoading}
                              onClick={() => handleStatusChange(u.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-secondary py-1 px-2 text-xs"
                              onClick={() => { setChangingId(null); setNewStatus(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <select
                              className="input-field py-1 px-2 text-xs"
                              style={{ width: 'auto', minWidth: 100 }}
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  setChangingId(u.id);
                                  setNewStatus(e.target.value);
                                }
                              }}
                            >
                              <option value="">Edit Status</option>
                              <option value="ACTIVE">Activate</option>
                              <option value="SUSPENDED">Suspend</option>
                              <option value="LOCKED">Lock</option>
                            </select>
                            <button
                              className="btn-danger py-1 px-2 text-xs"
                              onClick={() => handleDelete(u.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
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
            <button
              className="btn-secondary py-1 px-3 text-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn-secondary py-1 px-3 text-sm"
              disabled={page >= totalPages}
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