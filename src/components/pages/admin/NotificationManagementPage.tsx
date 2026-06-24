'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MailOpen, MailX } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface Notification {
  id: string;
  title: string;
  type: string;
  priority: string;
  target?: string;
  sentAt?: string;
  readCount?: number;
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    HIGH: 'badge-red',
    MEDIUM: 'badge-amber',
    LOW: 'badge-green',
  };
  return map[priority] || 'badge-amber';
}

export default function NotificationManagementPage() {
  const token = useStore((s) => s.token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [targetType, setTargetType] = useState('ALL');
  const [targetUser, setTargetUser] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState('');

  const [stats, setStats] = useState({ totalSent: 0, readRate: 0, unreadCount: 0 });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data.notifications || data.data || []);
      setStats({
        totalSent: data.stats?.totalSent || data.total || 0,
        readRate: data.stats?.readRate || 0,
        unreadCount: data.stats?.unreadCount || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setSendMsg('');
    try {
      const body: any = { title, message, type, priority, targetType };
      if (targetType === 'SPECIFIC_USER' && targetUser.trim()) {
        body.targetUser = targetUser.trim();
      }
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to send notification');
      setSendMsg('Notification sent successfully');
      setTitle('');
      setMessage('');
      setType('GENERAL');
      setPriority('MEDIUM');
      setTargetType('ALL');
      setTargetUser('');
      fetchNotifications();
    } catch (err: any) {
      setSendMsg(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  const statCards = [
    { label: 'Total Sent', value: stats.totalSent.toLocaleString(), icon: Send, color: '#3b82f6' },
    { label: 'Read Rate', value: `${stats.readRate}%`, icon: MailOpen, color: '#22c55e' },
    { label: 'Unread Count', value: stats.unreadCount.toLocaleString(), icon: MailX, color: '#ef4444' },
  ];

  if (loading && notifications.length === 0) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notification Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Send and manage platform notifications.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Send Notification Form */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Mail size={18} style={{ color: 'var(--accent-blue)' }} />
          Send Notification
        </h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                  <option value="GENERAL">General</option>
                  <option value="SYSTEM">System</option>
                  <option value="TRADE">Trade</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write the notification message..." className="input-field" rows={3} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target</label>
              <select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="input-field">
                <option value="ALL">All Users</option>
                <option value="BY_ROLE">By Role</option>
                <option value="SPECIFIC_USER">Specific User</option>
              </select>
            </div>
            {(targetType === 'BY_ROLE' || targetType === 'SPECIFIC_USER') && (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {targetType === 'BY_ROLE' ? 'Role' : 'User ID / Email'}
                </label>
                {targetType === 'BY_ROLE' ? (
                  <select className="input-field">
                    <option value="USER">USER</option>
                    <option value="SUB_AGENT">SUB_AGENT</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                ) : (
                  <input type="text" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="Enter user ID or email" className="input-field" />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={sending}>
              {sending ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <Send size={16} />
              )}
              Send Notification
            </button>
            {sendMsg && (
              <span className="text-sm" style={{ color: sendMsg.includes('success') ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {sendMsg}
              </span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: 'var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </motion.div>
      )}

      {/* Notifications Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Target</th>
                <th>Sent At</th>
                <th>Read Count</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No notifications sent yet
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{n.title}</td>
                    <td><span className="badge badge-blue">{n.type}</span></td>
                    <td><span className={`badge ${priorityBadge(n.priority)}`}>{n.priority}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{n.target || 'All Users'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{n.sentAt ? new Date(n.sentAt).toLocaleString() : '—'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{n.readCount ?? '—'}</td>
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