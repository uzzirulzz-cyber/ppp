'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UsersRound, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Agent {
  id: string;
  name: string;
  email: string;
  commissionRate?: number;
  usersCount?: number;
  riskLimit?: number;
  status: string;
  config?: {
    allowedSymbols?: string[];
    maxLeverage?: number;
    maxPositionSize?: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'badge-green',
    SUSPENDED: 'badge-red',
    LOCKED: 'badge-amber',
  };
  return map[status] || 'badge-amber';
}

export default function AgentManagementPage() {
  const token = useStore((s) => s.token);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    usersUnderAgents: 0,
    totalRevenue: 0,
  });

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/agents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(data.agents || data.data || []);
      setStats({
        total: data.stats?.total || data.total || 0,
        active: data.stats?.active || 0,
        usersUnderAgents: data.stats?.usersUnderAgents || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const statCards = [
    { label: 'Total Agents', value: stats.total, icon: Users, color: '#3b82f6' },
    { label: 'Active Agents', value: stats.active, icon: UserCheck, color: '#22c55e' },
    { label: 'Users Under Agents', value: stats.usersUnderAgents, icon: UsersRound, color: '#f59e0b' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#8b5cf6' },
  ];

  if (loading && agents.length === 0) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Agent Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage agents, their configurations and performance.</p>
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
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Commission Rate</th>
                <th>Users Count</th>
                <th>Risk Limit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((a) => (
                  <React.Fragment key={a.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                      <td>
                        {expandedId === a.id ? (
                          <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </td>
                      <td>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.email}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{a.commissionRate != null ? `${a.commissionRate}%` : '—'}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{a.usersCount || 0}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{a.riskLimit ? `$${Number(a.riskLimit).toLocaleString()}` : '—'}</td>
                      <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                      <td>
                        <button className="btn-secondary py-1 px-3 text-xs">Edit</button>
                      </td>
                    </tr>
                    {expandedId === a.id && a.config && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, borderBottom: 'none' }}>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ background: 'var(--bg-primary)', borderRadius: 8 }}>
                            <div>
                              <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Allowed Symbols</span>
                              <div className="flex flex-wrap gap-1">
                                {(a.config.allowedSymbols || ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']).map((s) => (
                                  <span key={s} className="badge badge-blue text-xs">{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Max Leverage</span>
                              <span style={{ color: 'var(--text-primary)' }}>{a.config.maxLeverage || 10}x</span>
                            </div>
                            <div>
                              <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Max Position Size</span>
                              <span style={{ color: 'var(--text-primary)' }}>{a.config.maxPositionSize ? `$${Number(a.config.maxPositionSize).toLocaleString()}` : '—'}</span>
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
      </motion.div>
    </motion.div>
  );
}