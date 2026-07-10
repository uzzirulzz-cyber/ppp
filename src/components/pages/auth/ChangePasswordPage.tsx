'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useStore, Pages } from '@/store/useStore';

export default function ChangePasswordPage() {
  const { user, token, navigate, setAuth, logout } = useStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to change password.');
        setLoading(false);
        return;
      }

      // Update user in store to mark mustChangePassword as false
      if (data.user) {
        const updatedUser = { ...user!, ...data.user, mustChangePassword: false };
        if (token) {
          setAuth(updatedUser, token);
        }
      } else {
        // Fallback: just navigate away
        const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_AGENT';
        navigate(isAdmin ? Pages.ADMIN_DASHBOARD : Pages.DASHBOARD);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(245,180,0,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          bottom: '-10%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="glass-card w-full relative z-10"
        style={{ maxWidth: 420, padding: '40px 36px' }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="NextradePro.Top"
            width={48}
            height={48}
            style={{ borderRadius: 10, margin: '0 auto 12px' }}
          />
          <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 800 }}>
            NextradePro.Top
          </h1>
        </div>

        {/* Shield Icon + Message */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center rounded-full mb-3"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(245, 180, 0, 0.1)',
              border: '1px solid rgba(245, 180, 0, 0.2)',
            }}
          >
            <ShieldCheck size={24} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Welcome,{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {user?.name || 'User'}
            </span>
          </p>
          <p style={{ color: 'var(--accent-gold)', fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            For your security, please change your default password before continuing.
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-2 rounded-lg text-center mb-4"
            style={{
              background: 'rgba(255, 61, 87, 0.1)',
              border: '1px solid rgba(255, 61, 87, 0.2)',
              color: 'var(--accent-red)',
              fontSize: 13,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Current Password */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Current Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                className="trade-input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showNew ? 'text' : 'password'}
                className="trade-input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="trade-input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ padding: '12px 20px', fontSize: 15, marginTop: 4 }}
            disabled={loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        {/* Skip for non-required */}
        <p className="text-center mt-4" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          This step is required for your account security.
        </p>
      </motion.div>
    </div>
  );
}