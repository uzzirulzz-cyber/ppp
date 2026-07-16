'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function AdminLockScreen() {
  const { user, login } = useAppStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const roleName = user?.role === 'super_admin' ? 'Super Admin' : 'Sub-Agent';
  const roleBadgeColor = user?.role === 'super_admin'
    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30';

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Please enter your password');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user, data.token, 'admin-dashboard');
      } else {
        setError(data.message || 'Invalid password');
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/admin-lock-bg.jpg')" }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : { opacity: 1, y: 0, scale: 1 }}
          transition={shaking ? { duration: 0.4 } : { duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center neon-glow-blue"
            >
              <Lock className="w-10 h-10 text-blue-400" />
            </motion.div>
          </div>

          {/* Card */}
          <div className="glass-strong rounded-2xl p-8 border border-blue-500/20">
            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Admin Panel Locked</h2>
              <p className="text-slate-400 text-sm mb-4">Enter your password to unlock the admin panel</p>

              <div className="inline-flex items-center gap-3 glass-card rounded-xl px-4 py-2.5">
                <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-sm font-bold text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{user?.email || ''}</p>
                </div>
              </div>

              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${roleBadgeColor}`}>
                  <KeyRound className="w-3 h-3" />
                  {roleName}
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 h-12 bg-white/5 border-blue-500/20 text-white placeholder:text-slate-500 focus:border-blue-500/50 rounded-xl"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={handleUnlock}
                disabled={loading || !password.trim()}
                className="w-full h-12 gradient-blue text-white font-semibold rounded-xl hover:opacity-90 transition-all neon-glow-blue"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                Unlock Admin Panel
              </Button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[11px] text-slate-500 text-center">
                This panel is restricted to authorized administrators only.
                All access attempts are logged and monitored.
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                const { logout } = useAppStore.getState();
                logout();
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}