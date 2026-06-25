'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle, XCircle, Clock, Plus, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface InvitationCode {
  id: string;
  code: string;
  role: string;
  status: string;
  createdBy?: string;
  usedBy?: string;
  createdAt?: string;
  usedAt?: string;
}

function roleBadge(role: string) {
  return role === 'SUB_AGENT' ? 'badge-purple' : 'badge-blue';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    UNUSED: 'badge-green',
    USED: 'badge-amber',
    DISABLED: 'badge-red',
    EXPIRED: 'badge-red',
  };
  return map[status] || 'badge-amber';
}

export default function InvitationCodePage() {
  const token = useStore((s) => s.token);
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate form
  const [genRole, setGenRole] = useState('USER');
  const [genQuantity, setGenQuantity] = useState('10');
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  // Toggle
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0, expired: 0 });

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/invitations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch invitation codes');
      const data = await res.json();
      setCodes(data.codes || data.data || []);
      setStats({
        total: data.stats?.total || data.total || 0,
        used: data.stats?.used || 0,
        unused: data.stats?.unused || 0,
        expired: data.stats?.expired || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation codes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(genQuantity);
    if (!qty || qty < 1 || qty > 100) {
      setGenMsg('Quantity must be between 1 and 100');
      return;
    }
    setGenerating(true);
    setGenMsg('');
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: genRole, quantity: qty }),
      });
      if (!res.ok) throw new Error('Failed to generate codes');
      setGenMsg('Codes generated successfully!');
      fetchCodes();
    } catch (err: any) {
      setGenMsg(err.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(codeId: string, currentStatus: string) {
    setTogglingId(codeId);
    try {
      const newStatus = currentStatus === 'DISABLED' ? 'UNUSED' : 'DISABLED';
      const res = await fetch('/api/admin/invitations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ codeId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update code');
      fetchCodes();
    } catch {
      alert('Failed to update code status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  const statCards = [
    { label: 'Total Codes', value: stats.total.toLocaleString(), icon: Ticket, color: '#0F5EFF' },
    { label: 'Used', value: stats.used.toLocaleString(), icon: CheckCircle, color: '#f59e0b' },
    { label: 'Unused', value: stats.unused.toLocaleString(), icon: Clock, color: '#22c55e' },
    { label: 'Expired', value: stats.expired.toLocaleString(), icon: XCircle, color: '#FF4757' },
  ];

  if (loading && codes.length === 0) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Invitation Codes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Generate and manage invitation codes for registration.</p>
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

      {/* Generate Form */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Plus size={18} style={{ color: 'var(--accent-green)' }} />
          Generate New Codes
        </h2>
        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
            <select value={genRole} onChange={(e) => setGenRole(e.target.value)} className="input-field" style={{ width: 'auto', minWidth: 150 }}>
              <option value="USER">USER</option>
              <option value="SUB_AGENT">SUB_AGENT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
            <input
              type="number"
              min="1"
              max="100"
              value={genQuantity}
              onChange={(e) => setGenQuantity(e.target.value)}
              className="input-field"
              style={{ width: 120 }}
            />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={generating}>
            {generating ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <Plus size={16} />
            )}
            Generate
          </button>
          {genMsg && (
            <span className="text-sm" style={{ color: genMsg.includes('success') ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {genMsg}
            </span>
          )}
        </form>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: 'var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </motion.div>
      )}

      {/* Codes Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Used By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No invitation codes found
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        className="font-mono font-semibold text-sm px-2 py-1 rounded"
                        style={{
                          color: 'var(--text-primary)',
                          background: 'var(--bg-primary)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td><span className={`badge ${roleBadge(c.role)}`}>{c.role}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.createdBy || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.usedBy || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-secondary py-1 px-2 text-xs"
                          onClick={() => handleCopy(c.code)}
                          title="Copy code"
                        >
                          <Copy size={14} />
                        </button>
                        {c.status !== 'EXPIRED' && (
                          <button
                            className="btn-secondary py-1 px-2 text-xs"
                            onClick={() => handleToggle(c.id, c.status)}
                            disabled={togglingId === c.id}
                            title={c.status === 'DISABLED' ? 'Enable' : 'Disable'}
                          >
                            {c.status === 'DISABLED' ? (
                              <ToggleRight size={16} style={{ color: 'var(--accent-green)' }} />
                            ) : (
                              <ToggleLeft size={16} style={{ color: 'var(--accent-red)' }} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}