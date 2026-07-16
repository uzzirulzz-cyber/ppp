'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';

export default function ForgotPasswordPage() {
  const { navigate } = useAppStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-cyan-500/6 blur-[80px]" />
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
          </motion.div>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Forgot Password?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-lg border-border/50 bg-white/[0.03] pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !email}
                    className="relative w-full h-11 rounded-lg gradient-blue text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-blue"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>
                </form>

                {/* Back to login */}
                <button
                  onClick={() => navigate('login')}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back to Login
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
                  className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="size-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Reset Link Sent!
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="text-foreground font-medium">{email}</span>.
                  Please check your inbox and follow the instructions.
                </p>

                <button
                  onClick={() => navigate('login')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-white/[0.03] h-11 text-sm text-foreground hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}