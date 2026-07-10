'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Settings, UserPlus, BarChart3, DollarSign, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface SystemSettings {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireInvitationCode: boolean;
  enableSpotTrading: boolean;
  enableFutures: boolean;
  enableMargin: boolean;
  minDeposit: number;
  maxWithdrawal: number;
  dailyWithdrawalLimit: number;
}

const defaultSettings: SystemSettings = {
  platformName: 'NextradePro.Top',
  supportEmail: 'support@brock.exchange',
  maintenanceMode: false,
  allowRegistration: true,
  requireInvitationCode: false,
  enableSpotTrading: true,
  enableFutures: true,
  enableMargin: true,
  minDeposit: 10,
  maxWithdrawal: 100000,
  dailyWithdrawalLimit: 500000,
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? 'var(--accent-green)' : 'var(--border-color)' }}
        onClick={onChange}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ left: checked ? 22 : 2, transition: 'left 0.2s' }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
}

export default function SystemSettingsPage() {
  const token = useStore((s) => s.token);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setMessage('Settings saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reset failed');
      }
      const data = await res.json();
      setMessage(`Reset complete! Deleted: ${data.deleted?.trades || 0} trades, ${data.deleted?.transactions || 0} transactions, ${data.deleted?.users || 0} users, ${data.deleted?.notifications || 0} notifications, ${data.deleted?.referrals || 0} referrals. Wallets zeroed.`);
      setShowResetConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  }

  function toggleBool<K extends keyof SystemSettings>(key: K) {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
  }

  if (loading) {
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>System Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure platform, registration, trading, and limits.</p>
      </motion.div>

      {error && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: 'var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </motion.div>
      )}
      {message && (
        <motion.div className="glass-card p-4" variants={itemVariants} style={{ borderColor: 'var(--accent-green)' }}>
          <p style={{ color: 'var(--accent-green)' }}>{message}</p>
        </motion.div>
      )}

      {/* Platform */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Settings size={18} style={{ color: 'var(--accent-cyan)' }} />
          Platform
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Platform Name</label>
            <input type="text" value={settings.platformName} onChange={(e) => setSettings((p) => ({ ...p, platformName: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Support Email</label>
            <input type="email" value={settings.supportEmail} onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))} className="input-field" />
          </div>
        </div>
        <div className="mt-4">
          <Toggle checked={settings.maintenanceMode} onChange={() => toggleBool('maintenanceMode')} label="Maintenance Mode" />
        </div>
      </motion.div>

      {/* Registration */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <UserPlus size={18} style={{ color: 'var(--accent-green)' }} />
          Registration
        </h2>
        <div className="space-y-3">
          <Toggle checked={settings.allowRegistration} onChange={() => toggleBool('allowRegistration')} label="Allow Registration" />
          <Toggle checked={settings.requireInvitationCode} onChange={() => toggleBool('requireInvitationCode')} label="Require Invitation Code" />
        </div>
      </motion.div>

      {/* Trading */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-purple)' }} />
          Trading
        </h2>
        <div className="space-y-3">
          <Toggle checked={settings.enableSpotTrading} onChange={() => toggleBool('enableSpotTrading')} label="Enable Spot Trading" />
          <Toggle checked={settings.enableFutures} onChange={() => toggleBool('enableFutures')} label="Enable Futures Trading" />
          <Toggle checked={settings.enableMargin} onChange={() => toggleBool('enableMargin')} label="Enable Margin Trading" />
        </div>
      </motion.div>

      {/* Limits */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <DollarSign size={18} style={{ color: 'var(--accent-amber)' }} />
          Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Min Deposit (USDT)</label>
            <input type="number" step="1" value={settings.minDeposit} onChange={(e) => setSettings((p) => ({ ...p, minDeposit: parseFloat(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Withdrawal (USDT)</label>
            <input type="number" step="1" value={settings.maxWithdrawal} onChange={(e) => setSettings((p) => ({ ...p, maxWithdrawal: parseFloat(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Daily Withdrawal Limit (USDT)</label>
            <input type="number" step="1" value={settings.dailyWithdrawalLimit} onChange={(e) => setSettings((p) => ({ ...p, dailyWithdrawalLimit: parseFloat(e.target.value) || 0 }))} className="input-field" />
          </div>
        </div>
      </motion.div>

      {/* Danger Zone — Reset Panel */}
      <motion.div
        className="glass-card p-6"
        variants={itemVariants}
        style={{ borderColor: 'rgba(255, 61, 87, 0.2)' }}
      >
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--accent-red)' }}>
          <Trash2 size={18} />
          Danger Zone
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Permanently delete all trades, transactions, regular users, notifications, referrals, and zero all wallets. Admins, sub-agents, and invitation codes are preserved.
        </p>

        {!showResetConfirm ? (
          <button
            className="btn-danger flex items-center gap-2"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={16} />
            Reset All Dummy Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="flex-1 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(255, 61, 87, 0.08)',
                border: '1px solid rgba(255, 61, 87, 0.2)',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>
                Are you sure? This cannot be undone.
              </p>
            </div>
            <button
              className="btn-danger flex items-center gap-2"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? (
                <><Loader2 size={16} className="animate-spin" /> Resetting...</>
              ) : (
                <><Trash2 size={16} /> Confirm Reset</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowResetConfirm(false)}
              disabled={resetting}
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>

      {/* Save */}
      <motion.div variants={itemVariants}>
        <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}