'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Plus, X, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface RiskSettings {
  spotMaxLeverage: number;
  futuresMaxLeverage: number;
  initialMarginPct: number;
  maintenanceMarginPct: number;
  maxPositionSize: number;
  maxOpenPositions: number;
  liquidationThresholdPct: number;
  autoDeleveraging: boolean;
  restrictedSymbols: string[];
}

const defaultSettings: RiskSettings = {
  spotMaxLeverage: 10,
  futuresMaxLeverage: 125,
  initialMarginPct: 1,
  maintenanceMarginPct: 0.5,
  maxPositionSize: 1000000,
  maxOpenPositions: 50,
  liquidationThresholdPct: 50,
  autoDeleveraging: false,
  restrictedSymbols: [],
};

export default function RiskManagementPage() {
  const token = useStore((s) => s.token);
  const [settings, setSettings] = useState<RiskSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/risk', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (err: any) {
      setError(err.message || 'Failed to load risk settings');
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
      const res = await fetch('/api/admin/risk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setMessage('Risk settings saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function addSymbol() {
    const s = newSymbol.trim().toUpperCase();
    if (s && !settings.restrictedSymbols.includes(s)) {
      setSettings((prev) => ({ ...prev, restrictedSymbols: [...prev.restrictedSymbols, s] }));
      setNewSymbol('');
    }
  }

  function removeSymbol(s: string) {
    setSettings((prev) => ({ ...prev, restrictedSymbols: prev.restrictedSymbols.filter((x) => x !== s) }));
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Risk Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure leverage limits, margin requirements, and position limits.</p>
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

      {/* Leverage Limits */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Leverage Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Leverage — Spot</label>
            <input
              type="number"
              value={settings.spotMaxLeverage}
              onChange={(e) => setSettings((p) => ({ ...p, spotMaxLeverage: parseInt(e.target.value) || 1 }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Leverage — Futures</label>
            <input
              type="number"
              value={settings.futuresMaxLeverage}
              onChange={(e) => setSettings((p) => ({ ...p, futuresMaxLeverage: parseInt(e.target.value) || 1 }))}
              className="input-field"
            />
          </div>
        </div>
      </motion.div>

      {/* Margin Requirements */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Margin Requirements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Initial Margin (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.initialMarginPct}
              onChange={(e) => setSettings((p) => ({ ...p, initialMarginPct: parseFloat(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Maintenance Margin (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.maintenanceMarginPct}
              onChange={(e) => setSettings((p) => ({ ...p, maintenanceMarginPct: parseFloat(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
        </div>
      </motion.div>

      {/* Position Limits */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Position Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Position Size (USDT)</label>
            <input
              type="number"
              value={settings.maxPositionSize}
              onChange={(e) => setSettings((p) => ({ ...p, maxPositionSize: parseFloat(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Open Positions</label>
            <input
              type="number"
              value={settings.maxOpenPositions}
              onChange={(e) => setSettings((p) => ({ ...p, maxOpenPositions: parseInt(e.target.value) || 1 }))}
              className="input-field"
            />
          </div>
        </div>
      </motion.div>

      {/* Liquidation */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
          Liquidation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Liquidation Threshold (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.liquidationThresholdPct}
              onChange={(e) => setSettings((p) => ({ ...p, liquidationThresholdPct: parseFloat(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: settings.autoDeleveraging ? 'var(--accent-green)' : 'var(--border-color)' }}
                onClick={() => setSettings((p) => ({ ...p, autoDeleveraging: !p.autoDeleveraging }))}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ left: settings.autoDeleveraging ? 22 : 2, transition: 'left 0.2s' }}
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Auto-Deleveraging</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Restricted Symbols */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Restricted Symbols</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="e.g. SHIBUSDT"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSymbol(); } }}
            className="input-field"
            style={{ maxWidth: 200 }}
          />
          <button className="btn-secondary flex items-center gap-1" onClick={addSymbol}>
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.restrictedSymbols.length === 0 ? (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No restricted symbols</span>
          ) : (
            settings.restrictedSymbols.map((s) => (
              <span key={s} className="badge badge-red flex items-center gap-1">
                {s}
                <button onClick={() => removeSymbol(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'inline-flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
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