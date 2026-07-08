'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  Ticket,
  Shield,
  Zap,
  TrendingUp,
  Smartphone,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/* ───────────────────────── ticker data ───────────────────────── */
const TICKER_ITEMS = [
  { name: 'JazzCash', status: 'Online' },
  { name: 'Easypaisa', status: 'Online' },
  { name: 'Bank Transfer', status: 'Online' },
  { name: 'Visa', status: 'Online' },
  { name: 'Mastercard', status: 'Online' },
  { name: 'Secure Pay', status: 'Online' },
];

/* ───────────────────────── floating orbs ─────────────────────── */
function FloatingOrbs() {
  const orbs = [
    { size: 420, color: 'rgba(229,57,53,0.04)', top: '5%', left: '-8%', dur: 18 },
    { size: 320, color: 'rgba(255,215,0,0.03)', top: '55%', right: '-6%', dur: 22 },
    { size: 260, color: 'rgba(255,215,0,0.02)', bottom: '8%', left: '20%', dur: 25 },
    { size: 180, color: 'rgba(229,57,53,0.04)', top: '30%', right: '15%', dur: 20 },
  ] as const;

  return (
    <>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            background: o.color,
            filter: 'blur(80px)',
            ...('top' in o ? { top: (o as any).top } : { bottom: (o as any).bottom }),
            ...('left' in o ? { left: (o as any).left } : { right: (o as any).right }),
          }}
          animate={{ y: [0, 20, -15, 0], x: [0, 12, -8, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

/* ───────────────────────── ticker tape ───────────────────────── */
function TickerTape() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="w-full overflow-hidden border-b border-[rgba(192,199,209,0.08)] bg-[rgba(10,15,26,0.5)]">
      <motion.div
        className="flex gap-8 whitespace-nowrap py-2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-2 text-xs">
            <span className="text-[#7A8599]">{item.name}</span>
            <span className="flex items-center gap-1 text-[#00E676]">
              <CheckCircle className="h-3 w-3" />
              {item.status}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ───────────────────────── left panel ────────────────────────── */
function LeftPanel() {
  const features = [
    { icon: Shield, label: 'Bank-Grade Security', color: '#00E676' },
    { icon: Zap, label: 'Instant Transfers', color: '#FFD700' },
    { icon: TrendingUp, label: 'Real-Time Analytics', color: '#FFD700' },
  ];

  const stats = [
    { value: '150K+', label: 'Active Users' },
    { value: '$2.4B', label: 'Transactions' },
    { value: '99.99%', label: 'Uptime' },
  ];

  return (
    <div className="relative hidden h-full w-[45%] flex-col justify-between overflow-hidden lg:flex">
      {/* bg image + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,9,15,0.95), rgba(7,9,15,0.75), rgba(7,9,15,0.95))',
        }}
      />

      {/* content */}
      <div className="relative z-10 flex flex-col justify-between p-10">
        {/* top: logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Brock Exchange" width={36} height={36} />
          <span className="text-lg font-semibold tracking-tight text-white">
            Brock <span style={{ color: 'var(--accent-gold)' }}>Exchange</span>
          </span>
        </div>

        {/* middle */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Digital Trading
            </h1>
            <h1
              className="mt-1 text-4xl font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, #E53935, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Made Premium
            </h1>
          </div>

          {/* feature badges */}
          <div className="flex flex-wrap gap-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-full border border-[rgba(192,199,209,0.12)] bg-[rgba(15,21,37,0.6)] px-4 py-2"
              >
                <f.icon className="h-4 w-4" style={{ color: f.color }} />
                <span className="text-[13px] text-[#C0C7D1]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom stats */}
        <div className="flex gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-2xl font-bold text-white">{s.value}</span>
              <span className="mt-0.5 text-xs text-[#7A8599]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── form input ────────────────────────── */
function FormInput({
  icon: Icon,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  rightElement,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] text-[#C0C7D1]">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8599]" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border bg-[rgba(10,15,26,0.7)] py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#7A8599] outline-none transition-all duration-200 focus:border-[#E53935] focus:shadow-[0_0_0_3px_rgba(229,57,53,0.12)]"
          style={{
            borderColor: error ? '#FF4757' : 'rgba(192,199,209,0.12)',
          }}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#FF4757]">{error}</p>}
    </div>
  );
}

/* ───────────────────────── social buttons ────────────────────── */
function SocialButtons() {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(192,199,209,0.12)] bg-[rgba(10,15,26,0.7)] py-2.5 text-sm text-[#C0C7D1] transition-colors hover:border-[rgba(192,199,209,0.25)] hover:text-white"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(192,199,209,0.12)] bg-[rgba(10,15,26,0.7)] py-2.5 text-sm text-[#C0C7D1] transition-colors hover:border-[rgba(192,199,209,0.25)] hover:text-white"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.11 4.45-3.74 4.25z" />
        </svg>
        Apple
      </button>
    </div>
  );
}

/* ───────────────────────── main sign-in content ──────────────── */
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [mode, setMode] = useState<'signin' | 'register'>(
    tabParam === 'register' ? 'register' : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // signin fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // register fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+1');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regInviteCode, setRegInviteCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('invitationCode') || '';
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function clearErrors() {
    setError('');
    setFieldErrors({});
  }

  function validateSignIn(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateRegister(): boolean {
    const errs: Record<string, string> = {};
    if (!regFirstName.trim()) errs.firstName = 'First name is required';
    if (!regLastName.trim()) errs.lastName = 'Last name is required';
    if (!regEmail.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) errs.email = 'Invalid email address';
    if (!regPhone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{5,15}$/.test(regPhone.replace(/\s/g, ''))) errs.phone = 'Enter a valid phone number';
    if (!regPassword) errs.password = 'Password is required';
    else if (regPassword.length < 6) errs.password = 'Password must be at least 6 characters';
    if (regPassword !== regConfirm) errs.confirm = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();
    if (!validateSignIn()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('brock_token', data.token);
      localStorage.setItem('brock_user', JSON.stringify(data.user));
      router.push('/');
    } catch (_err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          email: regEmail.trim(),
          phone: `${regCountryCode} ${regPhone.trim()}`.trim(),
          password: regPassword,
          invitationCode: regInviteCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      localStorage.setItem('brock_token', data.token);
      localStorage.setItem('brock_user', JSON.stringify(data.user));
      router.push('/');
    } catch (_err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const switchMode = (m: 'signin' | 'register') => {
    setMode(m);
    clearErrors();
  };

  return (
    <div className="relative flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FloatingOrbs />

      {/* ─── left panel (desktop) ─── */}
      <LeftPanel />

      {/* ─── right panel (form) ─── */}
      <div className="relative z-10 flex w-full flex-col lg:w-[55%]">
        {/* ticker tape */}
        <TickerTape />

        {/* mobile logo + back */}
        <div className="flex items-center gap-2.5 px-6 pt-6 lg:hidden">
          <Image src="/logo.png" alt="Brock Exchange" width={32} height={32} />
          <span className="text-base font-semibold tracking-tight text-white">
            Brock <span style={{ color: 'var(--accent-gold)' }}>Exchange</span>
          </span>
        </div>

        {/* form container */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-[420px]"
          >
            {/* back link (desktop) */}
            <button
              onClick={() => router.push('/')}
              className="mb-6 hidden items-center gap-1.5 text-sm text-[#7A8599] transition-colors hover:text-[#FFD700] lg:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>

            {/* card */}
            <div
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                background: 'rgba(15, 21, 37, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(192, 199, 209, 0.15)',
              }}
            >
              {/* mobile heading */}
              <div className="mb-6 text-center lg:hidden">
                <h1 className="text-2xl font-bold text-white">Welcome</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to Brock Exchange</p>
              </div>

              {/* tab switcher */}
              <div className="mb-6 flex rounded-lg border border-[rgba(192,199,209,0.12)] bg-[rgba(10,15,26,0.7)] p-1">
                {(['signin', 'register'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchMode(tab)}
                    className="relative flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200"
                    style={{
                      color: mode === tab ? '#FFFFFF' : '#7A8599',
                      background: mode === tab ? 'rgba(229,57,53,0.1)' : 'transparent',
                      borderBottom:
                        mode === tab ? '2px solid #E53935' : '2px solid transparent',
                      borderBottomLeftRadius: mode === tab ? 0 : undefined,
                      borderBottomRightRadius: mode === tab ? 0 : undefined,
                    }}
                  >
                    {tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* global error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 rounded-lg border border-[rgba(255,71,87,0.3)] bg-[rgba(255,71,87,0.08)] px-4 py-2.5 text-sm text-[#FF4757]"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ═══════════ SIGN IN FORM ═══════════ */}
                {mode === 'signin' && (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSignIn}
                    className="flex flex-col gap-4"
                  >
                    <FormInput
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={setEmail}
                      error={fieldErrors.email}
                    />

                    <FormInput
                      icon={Lock}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={setPassword}
                      error={fieldErrors.password}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#7A8599] transition-colors hover:text-[#C0C7D1]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-xs text-[#FFD700] transition-colors hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-shadow duration-300 disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #E53935, #FFD700)',
                        boxShadow: '0 0 20px rgba(229,57,53,0.2)',
                      }}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Sign In'
                      )}
                    </motion.button>

                    <div className="relative flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-[rgba(192,199,209,0.12)]" />
                      <span className="text-xs text-[#7A8599]">or continue with</span>
                      <div className="h-px flex-1 bg-[rgba(192,199,209,0.12)]" />
                    </div>

                    <SocialButtons />

                    <p className="mt-2 text-center text-xs text-[#7A8599]">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-[#FFD700] transition-colors hover:underline"
                      >
                        Create Account
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* ═══════════ REGISTER FORM ═══════════ */}
                {mode === 'register' && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleRegister}
                    className="flex flex-col gap-4"
                  >
                    {/* First + Last Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput
                        icon={User}
                        label="First Name"
                        type="text"
                        placeholder="John"
                        value={regFirstName}
                        onChange={setRegFirstName}
                        error={fieldErrors.firstName}
                      />
                      <FormInput
                        icon={User}
                        label="Last Name"
                        type="text"
                        placeholder="Doe"
                        value={regLastName}
                        onChange={setRegLastName}
                        error={fieldErrors.lastName}
                      />
                    </div>

                    <FormInput
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={setRegEmail}
                      error={fieldErrors.email}
                    />

                    {/* Phone with country code */}
                    <div>
                      <label className="text-[13px] text-[#C0C7D1] mb-1.5 block">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={regCountryCode}
                          onChange={(e) => setRegCountryCode(e.target.value)}
                          className="rounded-lg border bg-[rgba(10,15,26,0.7)] py-2.5 px-2 text-sm text-white outline-none transition-all duration-200 focus:border-[#E53935]"
                          style={{ borderColor: fieldErrors.phone ? '#FF4757' : 'rgba(192,199,209,0.12)', width: 90, flexShrink: 0 }}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+82">🇰🇷 +82</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+7">🇷🇺 +7</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+63">🇵🇭 +63</option>
                        </select>
                        <div className="relative flex-1">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8599]" />
                          <input
                            type="tel"
                            placeholder="(XXX) XXX-XXXX"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full rounded-lg border bg-[rgba(10,15,26,0.7)] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#7A8599] outline-none transition-all duration-200 focus:border-[#E53935] focus:shadow-[0_0_0_3px_rgba(229,57,53,0.12)]"
                            style={{ borderColor: fieldErrors.phone ? '#FF4757' : 'rgba(192,199,209,0.12)' }}
                          />
                        </div>
                      </div>
                      {fieldErrors.phone && <p className="text-xs text-[#FF4757] mt-1">{fieldErrors.phone}</p>}
                    </div>

                    <FormInput
                      icon={Lock}
                      label="Password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={setRegPassword}
                      error={fieldErrors.password}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="text-[#7A8599] transition-colors hover:text-[#C0C7D1]"
                        >
                          {showRegPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />

                    <FormInput
                      icon={Lock}
                      label="Confirm Password"
                      type={showRegConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={regConfirm}
                      onChange={setRegConfirm}
                      error={fieldErrors.confirm}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowRegConfirm(!showRegConfirm)}
                          className="text-[#7A8599] transition-colors hover:text-[#C0C7D1]"
                        >
                          {showRegConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />

                    <FormInput
                      icon={Ticket}
                      label="Invitation Code"
                      type="text"
                      placeholder="Optional — enter code if you have one"
                      value={regInviteCode}
                      onChange={setRegInviteCode}
                    />

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative mt-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-shadow duration-300 disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #E53935, #FFD700)',
                        boxShadow: '0 0 20px rgba(229,57,53,0.2)',
                      }}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>

                    <div className="relative flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-[rgba(192,199,209,0.12)]" />
                      <span className="text-xs text-[#7A8599]">or continue with</span>
                      <div className="h-px flex-1 bg-[rgba(192,199,209,0.12)]" />
                    </div>

                    <SocialButtons />

                    <p className="mt-2 text-center text-xs text-[#7A8599]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="text-[#FFD700] transition-colors hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* mobile bottom trust badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 lg:hidden">
              <div className="flex items-center gap-1.5 text-xs text-[#7A8599]">
                <Smartphone className="h-3.5 w-3.5 text-[#FFD700]" />
                Mobile Ready
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7A8599]">
                <Shield className="h-3.5 w-3.5 text-[#00E676]" />
                Secured
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7A8599]">
                <Zap className="h-3.5 w-3.5 text-[#FFD700]" />
                Fast
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── page export ───────────────────────── */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0F1A]">
          <Loader2 className="h-8 w-8 animate-spin text-[#E53935]" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}