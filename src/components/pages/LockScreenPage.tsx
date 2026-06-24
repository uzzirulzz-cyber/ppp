'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

export default function LockScreenPage() {
  const { user, navigate } = useStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = useStore.getState().token;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: password, newPassword: password }),
      });
      if (!res.ok) {
        setError('Invalid password. Please try again.');
        return;
      }
      navigate(Pages.DASHBOARD);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="glass-card p-8 w-full max-w-sm mx-4 text-center"
      >
        {/* Clock */}
        <div className="mb-6">
          <div
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatTime(time)}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatDate(time)}
          </div>
        </div>

        {/* Avatar */}
        <div
          className="flex items-center justify-center mx-auto mb-4 rounded-full"
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>

        {/* Name */}
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {user?.name || 'User'}
        </h2>

        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          This screen is locked
        </p>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password to unlock"
              className="input-field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red text-left" style={{ color: 'var(--accent-red)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <span
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                style={{ animation: 'spin 0.6s linear infinite' }}
              />
            ) : (
              <>
                <Lock size={16} />
                Unlock
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}