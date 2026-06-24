'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Ticket, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
}

export default function RegisterPage() {
  const { navigate } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email format';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!code.trim()) errs.code = 'Invitation code is required';
    else if (code.trim().length < 4) errs.code = 'Invalid invitation code format';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          invitationCode: code.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Redirect to login on success
      navigate(Pages.LOGIN);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function fieldError(field: keyof FormErrors) {
    return errors[field] ? (
      <span style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 4, display: 'block' }}>
        {errors[field]}
      </span>
    ) : null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '-10%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          bottom: '-8%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="glass-card w-full relative z-10"
        style={{ maxWidth: 420, padding: '36px 32px' }}
      >
        {/* Back link */}
        <button
          className="flex items-center gap-1 mb-4 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--text-muted)', fontSize: 13 }}
          onClick={() => navigate(Pages.LOGIN)}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>

        {/* Brand */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center rounded-xl mb-3"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            }}
          >
            <span style={{ fontSize: 24 }}>⚡</span>
          </div>
          <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Join NexTrade Pro and start trading
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Name */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Full Name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: 40 }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            {fieldError('name')}
          </div>

          {/* Email */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: 40 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {fieldError('email')}
          </div>

          {/* Password */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldError('password')}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="••••••••"
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
            {fieldError('confirmPassword')}
          </div>

          {/* Invitation Code */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Invitation Code
            </label>
            <div className="relative">
              <Ticket
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: 40, textTransform: 'uppercase' }}
                placeholder="XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
              />
            </div>
            {fieldError('code')}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 rounded-lg text-center"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--accent-red)',
                fontSize: 13,
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ padding: '12px 20px', fontSize: 15, marginTop: 4 }}
            disabled={loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p
          className="text-center mt-5"
          style={{ fontSize: 13, color: 'var(--text-muted)' }}
        >
          Already have an account?{' '}
          <button
            className="bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: 13 }}
            onClick={() => navigate(Pages.LOGIN)}
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}