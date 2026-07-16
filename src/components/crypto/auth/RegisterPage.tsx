'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dial: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dial: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dial: '+82' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dial: '+65' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dial: '+61' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dial: '+1' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dial: '+55' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dial: '+234' },
];

export default function RegisterPage() {
  const { navigate } = useAppStore();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    invitationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.invitationCode ||
      !agreedTerms
    ) {
      setError('All fields including invitation code are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Ensure DB is seeded
      await fetch('/api/seed', { method: 'POST' });

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          invitationCode: form.invitationCode,
          phone: selectedCountry.dial + form.phone,
          country: selectedCountry.code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass-card rounded-2xl p-8 text-center neon-glow-green">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <CheckCircle2 className="size-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Registration Successful!
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your account has been created. Please sign in to continue.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('login')}
              className="w-full h-11 rounded-lg gradient-blue text-white font-semibold text-sm neon-glow-blue transition-all"
            >
              Go to Login
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputCls =
    'h-11 rounded-lg border-border/50 bg-white/[0.03] px-4 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20';
  const iconInputCls =
    'h-11 rounded-lg border-border/50 bg-white/[0.03] pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 neon-glow-blue">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 text-center"
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl gradient-blue text-xl font-bold text-white shadow-lg">
                ◆
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Nex<span className="text-glow-blue text-blue-400">Trade</span>{' '}
                <span className="text-muted-foreground font-normal text-base">Pro</span>
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Create your trading account</p>
          </motion.div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  className={iconInputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={iconInputCls}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Phone Number
              </label>
              <div className="flex gap-2">
                {/* Country selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex h-11 w-24 items-center gap-1 rounded-lg border border-border/50 bg-white/[0.03] px-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-xs text-muted-foreground">{selectedCountry.dial}</span>
                    <ChevronDown className="ml-auto size-3 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {showCountryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg glass-strong border border-border/50 crypto-scrollbar"
                      >
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowCountryDropdown(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                              c.code === selectedCountry.code
                                ? 'text-blue-400 bg-blue-500/5'
                                : 'text-foreground'
                            }`}
                          >
                            <span>{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.dial}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={iconInputCls}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="h-11 rounded-lg border-border/50 bg-white/[0.03] pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="h-11 rounded-lg border-border/50 bg-white/[0.03] pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Invitation Code (Required) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Ticket className="size-3.5 text-blue-400" />
                Invitation Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                <Input
                  type="text"
                  placeholder="e.g. PB-AG001"
                  value={form.invitationCode}
                  onChange={(e) => updateField('invitationCode', e.target.value.toUpperCase())}
                  className={`${inputCls} pl-10 uppercase`}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You must have a valid invitation code from an agent to register.
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <Checkbox
                checked={agreedTerms}
                onCheckedChange={(v) => setAgreedTerms(v === true)}
                className="mt-0.5 border-border/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                  Terms &amp; Conditions
                </span>{' '}
                and{' '}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                  Privacy Policy
                </span>
              </span>
            </label>

            {/* Register Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={
                loading ||
                !form.username ||
                !form.email ||
                !form.password ||
                !form.confirmPassword ||
                !agreedTerms ||
                form.password !== form.confirmPassword
              }
              className="relative w-full h-11 rounded-lg gradient-blue text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-blue"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 text-center text-xs text-muted-foreground/50"
        >
          © 2025 NexTrade Pro. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}