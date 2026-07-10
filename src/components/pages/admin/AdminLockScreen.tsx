'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AdminLockScreen() {
  const { user, navigate } = useAppStore();
  const [pin, setPin] = useState(['', '', '', '']);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [particles] = useState(() =>
    Array.from({ length: 20 }).map(() => ({
      width: Math.random() * 300 + 50,
      height: Math.random() * 300 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xDelta: Math.random() * 100 - 50,
      yDelta: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 10,
    }))
  );

  const handlePinChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newPin = [...pin];
      newPin[index] = value.slice(-1);
      setPin(newPin);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [pin]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [pin]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newPin = [...pin];
    pasted.split('').forEach((char, i) => {
      newPin[i] = char;
    });
    setPin(newPin);
    const nextEmpty = newPin.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 3 : nextEmpty]?.focus();
  }, [pin]);

  const handleUnlock = () => {
    const pinValue = pin.join('');
    if (pinValue.length < 4) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    navigate('admin-dashboard');
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isPinComplete = pin.every((d) => d !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/5"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
            }}
            animate={{
              x: [0, p.xDelta],
              y: [0, p.yDelta],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                NextradePro.Top
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              Admin Access Required
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-blue-400 font-medium">{user?.username || 'Admin'}</span>
            </p>
          </motion.div>

          {/* PIN Input */}
          <motion.div
            animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-400 text-center mb-4">Enter your 4-digit PIN to continue</p>
            <div className="flex justify-center gap-4">
              {pin.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                >
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-14 w-14 rounded-xl border-2 bg-white/5 text-center text-2xl font-bold text-white outline-none transition-all duration-200 placeholder:text-gray-600 focus:border-blue-500 focus:bg-blue-500/5 focus:ring-2 focus:ring-blue-500/20"
                    style={{
                      borderColor: digit ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Unlock Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUnlock}
            disabled={!isPinComplete}
            className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-500"
          >
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock
            </span>
          </motion.button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Secured with 256-bit encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}