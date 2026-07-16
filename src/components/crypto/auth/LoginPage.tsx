'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const { login, navigate, setCoins } = useAppStore();

  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) value = value[value.length - 1];
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      // Fallback: try seeding and retry
      try {
        await fetch('/api/seed', { method: 'POST' });
        const retryRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const retryData = await retryRes.json();
        if (retryData.success) {
          login(retryData.user, retryData.token);
        } else {
          setError(retryData.message || 'Invalid credentials');
        }
      } catch {
        setError('Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { user, token } = useAppStore.getState();
    if (user && token) {
      login(user, token);
    }
    setLoading(false);
  };

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
            className="mb-8 text-center"
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
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 'credentials' ? 'Sign in to your trading account' : 'Enter your 2FA code'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-lg border-border/50 bg-white/[0.03] pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(v === true)}
                      className="border-border/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <button
                    onClick={() => navigate('forgot-password')}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Referral Code Toggle */}
                <button
                  type="button"
                  onClick={() => setShowReferral(!showReferral)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showReferral ? '− Hide' : '+ Add referral code'}
                </button>

                <AnimatePresence>
                  {showReferral && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Enter referral code (optional)"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="h-11 rounded-lg border-border/50 bg-white/[0.03] px-4 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="relative w-full h-11 rounded-lg gradient-blue text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-blue"
                >
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-0 right-0 text-red-400 text-xs text-center whitespace-nowrap"
                    >
                      {error}
                    </motion.p>
                  )}
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => navigate('register')}
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Register
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 2FA icon */}
                <div className="flex justify-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <ShieldCheck className="size-7 text-blue-400" />
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-13 w-11 rounded-lg border border-border/50 bg-white/[0.03] text-center text-lg font-semibold text-foreground outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handle2faSubmit}
                  disabled={loading || otp.join('').length !== 6}
                  className="relative w-full h-11 rounded-lg gradient-blue text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-blue"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Login'
                  )}
                </motion.button>

                {/* Back to credentials */}
                <button
                  onClick={() => {
                    setStep('credentials');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to sign in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom text */}
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