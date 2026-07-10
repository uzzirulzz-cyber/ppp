'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Ticket, Loader2, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

const COUNTRY_CODES = [
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', country: 'US' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', country: 'UK' },
  { code: '+92', flag: '\u{1F1F5}\u{1F1F0}', country: 'PK' },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', country: 'IN' },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', country: 'CN' },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', country: 'JP' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', country: 'DE' },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', country: 'FR' },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', country: 'AE' },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', country: 'SA' },
  { code: '+234', flag: '\u{1F1F3}\u{1F1EC}', country: 'NG' },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', country: 'BR' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', country: 'AU' },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', country: 'KR' },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', country: 'IT' },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', country: 'ES' },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', country: 'RU' },
  { code: '+27', flag: '\u{1F1FF}\u{1F1E6}', country: 'ZA' },
  { code: '+20', flag: '\u{1F1EA}\u{1F1EC}', country: 'EG' },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', country: 'MX' },
  { code: '+63', flag: '\u{1F1F5}\u{1F1ED}', country: 'PH' },
  { code: '+62', flag: '\u{1F1EE}\u{1F1E9}', country: 'ID' },
  { code: '+60', flag: '\u{1F1F2}\u{1F1FE}', country: 'MY' },
  { code: '+90', flag: '\u{1F1F9}\u{1F1F7}', country: 'TR' },
  { code: '+880', flag: '\u{1F1E7}\u{1F1E9}', country: 'BD' },
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
}

export default function RegisterPage() {
  const { navigate } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Pre-fill invitation code from localStorage (set by /reg page)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('invitationCode');
      if (saved) {
        setCode(saved);
        localStorage.removeItem('invitationCode');
      }
    }
  }, []);

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!firstName.trim()) errs.firstName = 'First name is required';
    else if (firstName.trim().length < 2) errs.firstName = 'At least 2 characters';

    if (!lastName.trim()) errs.lastName = 'Last name is required';
    else if (lastName.trim().length < 2) errs.lastName = 'At least 2 characters';

    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email format';

    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{5,15}$/.test(phone.replace(/[\s\-()]/g, ''))) errs.phone = 'Enter a valid phone number';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min. 6 characters';

    if (!confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!code.trim()) errs.code = 'Invitation code is required';
    else if (code.trim().length < 4) errs.code = 'Invalid code format';

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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: `${countryCode} ${phone.trim()}`.trim(),
          password,
          invitationCode: code.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Auto-login after registration
      const { setAuth } = useStore.getState();
      setAuth(data.user, data.token);
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
          background: 'radial-gradient(circle, rgba(245,180,0,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          bottom: '-8%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="glass-card w-full relative z-10"
        style={{ maxWidth: 460, padding: '36px 32px' }}
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
              background: 'var(--gradient)',
            }}
          >
            <Image src="/logo.png" alt="NextradePro.Top" width={28} height={28} style={{ borderRadius: 6 }} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Join NextradePro.Top and start trading
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                First Name
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
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              {fieldError('firstName')}
            </div>
            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Last Name
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
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
              {fieldError('lastName')}
            </div>
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

          {/* Phone with Country Code */}
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded-lg border text-sm outline-none transition-all duration-200"
                style={{
                  paddingLeft: 8,
                  paddingRight: 6,
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  background: 'var(--bg-input)',
                  borderColor: errors.phone ? 'var(--accent-red)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                  width: 110,
                  flexShrink: 0,
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0E1525', color: '#FFFFFF' }}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="tel"
                  className="input-field"
                  style={{
                    paddingLeft: 40,
                    borderColor: errors.phone ? 'var(--accent-red)' : undefined,
                  }}
                  placeholder="(XXX) XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
            {fieldError('phone')}
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
                placeholder="Min. 6 characters"
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
                placeholder="Re-enter password"
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
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.2)',
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
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13 }}
            onClick={() => navigate(Pages.LOGIN)}
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}