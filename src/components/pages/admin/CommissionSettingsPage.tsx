'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface CommissionSettings {
  spotMakerFee: number;
  spotTakerFee: number;
  futuresMakerFee: number;
  futuresTakerFee: number;
  defaultAgentCommission: number;
  referralCommission: number;
  btcWithdrawalFee: number;
  ethWithdrawalFee: number;
  usdtWithdrawalFee: number;
}

const defaultSettings: CommissionSettings = {
  spotMakerFee: 0.1,
  spotTakerFee: 0.15,
  futuresMakerFee: 0.02,
  futuresTakerFee: 0.04,
  defaultAgentCommission: 20,
  referralCommission: 10,
  btcWithdrawalFee: 0.0005,
  ethWithdrawalFee: 0.005,
  usdtWithdrawalFee: 1,
};

export default function CommissionSettingsPage() {
  const token = useStore((s) => s.token);
  const [settings, setSettings] = useState<CommissionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/commissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (err: any) {
      setError(err.message || 'Failed to load commission settings');
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
      const res = await fetch('/api/admin/commissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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

  function update<K extends keyof CommissionSettings>(key: K, value: string) {
    setSettings((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
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

  const sections = [
    {
      title: 'Trading Fees',
      fields: [
        { label: 'Spot Maker Fee (%)', key: 'spotMakerFee' as const, step: '0.01' },
        { label: 'Spot Taker Fee (%)', key: 'spotTakerFee' as const, step: '0.01' },
        { label: 'Futures Maker Fee (%)', key: 'futuresMakerFee' as const, step: '0.01' },
        { label: 'Futures Taker Fee (%)', key: 'futuresTakerFee' as const, step: '0.01' },
      ],
    },
    {
      title: 'Agent Commission',
      fields: [
        { label: 'Default Agent Commission (%)', key: 'defaultAgentCommission' as const, step: '1' },
        { label: 'Referral Commission (%)', key: 'referralCommission' as const, step: '1' },
      ],
    },
    {
      title: 'Withdrawal Fees',
      fields: [
        { label: 'BTC Withdrawal Fee', key: 'btcWithdrawalFee' as const, step: '0.0001' },
        { label: 'ETH Withdrawal Fee', key: 'ethWithdrawalFee' as const, step: '0.001' },
        { label: 'USDT Withdrawal Fee', key: 'usdtWithdrawalFee' as const, step: '0.1' },
      ],
    },
  ];

  return (
    <motion.div className="space-y-6 animate-fade-in" variants={containerVariants} initial="hidden" animate="show" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Commission Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure trading fees, agent commissions, and withdrawal fees.</p>
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

      {sections.map((section) => (
        <motion.div key={section.title} className="glass-card p-6" variants={itemVariants}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input
                  type="number"
                  step={f.step}
                  value={settings[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

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
              Save Changes
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}