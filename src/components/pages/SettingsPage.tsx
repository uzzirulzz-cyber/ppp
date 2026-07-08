'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  Globe,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react';
import { useStore, Pages, type UserInfo } from '@/store/useStore';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Australia/Sydney',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'es', label: 'Español' },
  { value: 'ar', label: 'العربية' },
  { value: 'ur', label: 'اردو' },
  { value: 'ja', label: '日本語' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'PKR', label: 'PKR (₨)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface SettingsForm {
  displayName: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  notifications: boolean;
  twoFactor: boolean;
}

export default function SettingsPage() {
  const { token, navigate } = useStore();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const [form, setForm] = useState<SettingsForm>({
    displayName: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    notifications: true,
    twoFactor: false,
  });

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      const u = data.user;
      setUser(u);
      setForm((prev) => ({
        ...prev,
        displayName: u.name || '',
        phone: u.phone || '',
      }));
    } catch {
      // Silent fail - user will see cached data
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateField = (field: keyof SettingsForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          action: 'update_profile',
          data: {
            name: form.displayName,
            phone: form.phone,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      // Refresh user data
      fetchUser();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
        <div
          className="animate-spin rounded-full"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-gold)',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 animate-fade-in max-w-3xl"
      style={{ paddingBottom: 40 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your account preferences and security
        </p>
      </motion.div>

      {/* Success / Error Message */}
      {message && (
        <motion.div
          className="glass-card p-4 flex items-center gap-3"
          style={{
            borderColor:
              message.type === 'success'
                ? 'rgba(0, 210, 106, 0.3)'
                : 'rgba(255, 61, 87, 0.3)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
          )}
          <span
            className="text-sm"
            style={{
              color:
                message.type === 'success'
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)',
            }}
          >
            {message.text}
          </span>
        </motion.div>
      )}

      {/* 1. Account Settings */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(245, 180, 0, 0.15)',
            }}
          >
            <User size={20} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Account Settings
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Update your personal information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Display Name */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Display Name
            </label>
            <input
              type="text"
              className="input-field"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
              <span
                className="ml-1.5 inline-flex items-center gap-1"
                style={{ color: 'var(--text-muted)', fontWeight: 400 }}
              >
                <Info size={10} /> Read-only
              </span>
            </label>
            <input
              type="email"
              className="input-field"
              value={user?.email || ''}
              readOnly
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Timezone */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Globe size={12} className="inline mr-1" />
              Timezone
            </label>
            <select
              className="input-field"
              value={form.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              style={{ cursor: 'pointer', appearance: 'auto' }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} style={{ background: 'var(--bg-card)' }}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* 2. Preferences */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(0, 229, 255, 0.15)',
            }}
          >
            <Globe size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Preferences
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Customize your experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Language
            </label>
            <select
              className="input-field"
              value={form.language}
              onChange={(e) => updateField('language', e.target.value)}
              style={{ cursor: 'pointer', appearance: 'auto' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} style={{ background: 'var(--bg-card)' }}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Display */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Currency Display
            </label>
            <select
              className="input-field"
              value={form.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              style={{ cursor: 'pointer', appearance: 'auto' }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value} style={{ background: 'var(--bg-card)' }}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div
          className="flex items-center justify-between mt-5 p-3 rounded-xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Receive email and push notifications
              </div>
            </div>
          </div>
          <button
            onClick={() => updateField('notifications', !form.notifications)}
            className="relative rounded-full transition-colors"
            style={{
              width: 48,
              height: 26,
              background: form.notifications ? 'var(--accent-green)' : 'var(--border-color)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <motion.div
              className="absolute top-0.5 rounded-full"
              style={{
                width: 20,
                height: 20,
                background: '#fff',
                left: form.notifications ? 25 : 3,
              }}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* 3. Security */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(0, 210, 106, 0.15)',
            }}
          >
            <Shield size={20} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Security
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Protect your account
            </p>
          </div>
        </div>

        {/* Change Password */}
        <motion.button
          className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 mb-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(Pages.CHANGE_PASSWORD)}
        >
          <KeyRound size={16} />
          Change Password
        </motion.button>

        {/* 2FA Toggle */}
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <Shield size={18} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Two-Factor Authentication
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Add an extra layer of security to your account
              </div>
            </div>
          </div>
          <button
            onClick={() => updateField('twoFactor', !form.twoFactor)}
            className="relative rounded-full transition-colors"
            style={{
              width: 48,
              height: 26,
              background: form.twoFactor ? 'var(--accent-green)' : 'var(--border-color)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <motion.div
              className="absolute top-0.5 rounded-full"
              style={{
                width: 20,
                height: 20,
                background: '#fff',
                left: form.twoFactor ? 25 : 3,
              }}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* 4. Danger Zone */}
      <motion.div
        className="glass-card p-6"
        variants={itemVariants}
        style={{ borderColor: 'rgba(255, 61, 87, 0.2)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(255, 61, 87, 0.15)',
            }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--accent-red)' }}
            >
              Danger Zone
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255, 61, 87, 0.05)', border: '1px solid rgba(255, 61, 87, 0.15)' }}
        >
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Delete Account
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <motion.button
              className="btn-danger flex items-center gap-2 text-sm"
              style={{ opacity: 0.45, cursor: 'not-allowed' }}
              whileTap={false}
              disabled
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Trash2 size={14} />
              Delete Account
            </motion.button>
            {showTooltip && (
              <motion.div
                className="absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow)',
                  zIndex: 50,
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Contact support to delete your account
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <motion.button
          className="btn-gold flex items-center gap-2 px-8"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}