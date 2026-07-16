/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RotateCcw,
  Home,
  Trophy,
  XCircle,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle2,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

// ─── Confetti Particle ──────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  angle: number;
  distance: number;
}

function ConfettiBurst() {
  const [particles] = useState<Particle[]>(() => {
    const p: Particle[] = [];
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#3b82f6', '#fbbf24', '#f59e0b', '#a78bfa'];
    for (let i = 0; i < 40; i++) {
      p.push({
        id: i,
        x: 50,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        delay: Math.random() * 0.5,
        angle: (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5,
        distance: 80 + Math.random() * 120,
      });
    }
    return p;
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance - 40,
            opacity: 0,
            scale: 0,
            rotate: p.angle * 180,
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Circular Countdown Timer ────────────────────────────────────────────────────

function CountdownTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const radius = 70;
  const stroke = 5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (1 - timeLeft / totalTime) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          stroke="rgba(59, 130, 246, 0.1)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <motion.circle
          stroke="#3b82f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold font-mono text-foreground"
        >
          {timeLeft}s
        </motion.span>
        <span className="text-[10px] text-muted-foreground mt-0.5">remaining</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TradeConfirmation() {
  const {
    currentTrade,
    selectedCoin,
    updateTrade,
    navigate,
    setSelectedTradeDirection,
    user,
  } = useAppStore();

  const [phase, setPhase] = useState<'running' | 'result'>('running');
  const [timeLeft, setTimeLeft] = useState(5);
  const [simulatedPrice, setSimulatedPrice] = useState(0);
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const hasResolved = useRef(false);

  const trade = currentTrade;
  const coin = selectedCoin;

  // Initialize simulated price
  const [tradeId, setTradeId] = useState<string | null>(null);
  useEffect(() => {
    if (trade && tradeId !== trade.id) {
      setTradeId(trade.id);
      setSimulatedPrice(trade.entryPrice);
      setPhase('running');
      setTimeLeft(5);
      setResult(null);
      hasResolved.current = false;
    }
  }, [trade, tradeId]);

  // Simulate live price changes during trade
  useEffect(() => {
    if (phase !== 'running' || !trade) return;
    const interval = setInterval(() => {
      const tick = (Math.random() - 0.48) * trade.entryPrice * 0.0005;
      setSimulatedPrice((prev) => parseFloat((prev + tick).toFixed(2)));
    }, 400);
    return () => clearInterval(interval);
  }, [phase, trade]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'running' || timeLeft <= 0 || !trade || hasResolved.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timeLeft, trade]);

  // Resolve trade when countdown ends
  const resolveTrade = useCallback(() => {
    if (!trade || hasResolved.current) return;

    hasResolved.current = true;
    const isWon = Math.random() < 0.6;
    const exitPrice = isWon
      ? trade.direction === 'up'
        ? parseFloat((trade.entryPrice * (1 + 0.001 + Math.random() * 0.003)).toFixed(2))
        : parseFloat((trade.entryPrice * (1 - 0.001 - Math.random() * 0.003)).toFixed(2))
      : trade.direction === 'up'
        ? parseFloat((trade.entryPrice * (1 - 0.001 - Math.random() * 0.003)).toFixed(2))
        : parseFloat((trade.entryPrice * (1 + 0.001 + Math.random() * 0.003)).toFixed(2));

    const profit = isWon ? parseFloat((trade.amount * 0.85).toFixed(2)) : -trade.amount;
    const payout = isWon ? trade.amount + profit : 0;

    updateTrade(trade.id, {
      status: isWon ? 'won' : 'lost',
      exitPrice,
      profit,
      payout,
      closedAt: new Date(),
    });

    setSimulatedPrice(exitPrice);
    setResult(isWon ? 'won' : 'lost');
  }, [trade, updateTrade]);

  useEffect(() => {
    if (timeLeft !== 0 || !trade || hasResolved.current || phase !== 'running') return;
    resolveTrade();
  }, [timeLeft, trade, phase, resolveTrade]);

  // Transition to result phase after resolution
  useEffect(() => {
    if (result === null) return;
    const timer = setTimeout(() => {
      setPhase('result');
    }, 200);
    return () => clearTimeout(timer);
  }, [result]);

  const handleTradeAgain = useCallback(() => {
    setSelectedTradeDirection(null);
    navigate('trade');
  }, [navigate, setSelectedTradeDirection]);

  const handleReturnToDashboard = useCallback(() => {
    setSelectedTradeDirection(null);
    navigate('dashboard');
  }, [navigate, setSelectedTradeDirection]);

  if (!trade || !coin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No active trade found</p>
          <Button variant="ghost" onClick={() => navigate('dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const decimals = trade.entryPrice > 1000 ? 2 : trade.entryPrice > 1 ? 4 : 6;
  const isUp = trade.direction === 'up';
  const priceDiff = simulatedPrice - trade.entryPrice;
  const isProfitable = isUp ? priceDiff > 0 : priceDiff < 0;
  const elapsedTime = 5 - timeLeft;
  const progressPercent = (elapsedTime / 5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-lg mx-auto"
    >
      <div className="relative">
        <AnimatePresence>
          {phase === 'result' && result === 'won' && <ConfettiBurst />}
        </AnimatePresence>

        <motion.div
          className={`glass-card rounded-2xl overflow-hidden ${
            phase === 'running' ? 'animate-glow-pulse' : ''
          }`}
          animate={
            phase === 'running'
              ? { borderColor: ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.2)'] }
              : result === 'won'
                ? { borderColor: 'rgba(16,185,129,0.5)' }
                : { borderColor: 'rgba(239,68,68,0.5)' }
          }
          transition={phase === 'running' ? { duration: 2, repeat: Infinity } : { duration: 0.5 }}
          style={{ borderWidth: '1px' }}
        >
          {/* ─── Running Phase Header ──────────────────────────── */}
          {phase === 'running' && (
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold text-primary">Trade in Progress</span>
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                Running
              </Badge>
            </div>
          )}

          {/* ─── Result Phase Header ──────────────────────────── */}
          {phase === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-6 py-4 border-b ${
                result === 'won'
                  ? 'bg-emerald-500/5 border-emerald-500/10'
                  : 'bg-red-500/5 border-red-500/10'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {result === 'won' ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Trophy className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-extrabold text-emerald-400 text-glow-green"
                    >
                      TRADE WON
                    </motion.span>
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    >
                      <PartyPopper className="w-8 h-8 text-amber-400" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <XCircle className="w-8 h-8 text-red-400" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-extrabold text-red-400 text-glow-red"
                    >
                      TRADE LOST
                    </motion.span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Body ─────────────────────────────────────────── */}
          <div className="p-6 space-y-5">
            {/* Trade ID */}
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Trade ID</span>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{trade.id}</p>
            </div>

            {/* Coin & Direction */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                {coin.logo}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{trade.pair}</h3>
                <div
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold mt-0.5 ${
                    isUp ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isUp ? 'BUY UP' : 'BUY DOWN'}
                </div>
              </div>
            </div>

            {/* Countdown Timer (running) */}
            <AnimatePresence>
              {phase === 'running' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="flex justify-center"
                >
                  <CountdownTimer timeLeft={timeLeft} totalTime={5} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            {phase === 'running' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Elapsed</span>
                  <span>{elapsedTime.toFixed(1)}s / 5.0s</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </motion.div>
            )}

            {/* Price Display */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-background/40 rounded-lg p-3 text-center"
              >
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                  Entry Price
                </span>
                <span className="text-base font-mono font-semibold text-foreground">
                  ${trade.entryPrice.toFixed(decimals)}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-background/40 rounded-lg p-3 text-center"
              >
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                  {phase === 'running' ? 'Live Price' : 'Exit Price'}
                </span>
                <motion.span
                  key={simulatedPrice}
                  className={`text-base font-mono font-semibold ${
                    phase === 'running'
                      ? isProfitable ? 'text-emerald-400' : 'text-red-400'
                      : result === 'won'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                  }`}
                  animate={{ opacity: [0.7, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  ${simulatedPrice.toFixed(decimals)}
                </motion.span>
              </motion.div>
            </div>

            <Separator />

            {/* Trade Details */}
            <div className="space-y-2.5">
              {[
                { label: 'Amount', value: `$${trade.amount.toFixed(2)}`, icon: DollarSign },
                { label: 'Duration', value: `${trade.duration}s`, icon: Clock },
                { label: 'Payout Rate', value: '85%', icon: Sparkles },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <span className="text-sm font-medium font-mono text-foreground">{item.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Result Summary */}
            <AnimatePresence>
              {phase === 'result' && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`rounded-xl p-4 text-center ${
                    result === 'won'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result === 'won' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        result === 'won' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {result === 'won' ? 'Profit' : 'Loss'}
                    </span>
                  </div>
                  <p
                    className={`text-3xl font-extrabold font-mono ${
                      result === 'won' ? 'text-emerald-400 text-glow-green' : 'text-red-400 text-glow-red'
                    }`}
                  >
                    {result === 'won' ? '+' : '-'}$
                    {result === 'won'
                      ? (trade.amount * 0.85).toFixed(2)
                      : trade.amount.toFixed(2)}
                  </p>
                  {result === 'won' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Payout: <span className="text-emerald-400 font-mono font-medium">${(trade.amount * 1.85).toFixed(2)}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Updated Balance */}
            {phase === 'result' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <span className="text-xs text-muted-foreground">Updated Balance</span>
                <p className="text-lg font-bold font-mono text-foreground">
                  ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <AnimatePresence>
              {phase === 'result' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-border/50 hover:bg-secondary"
                    onClick={handleReturnToDashboard}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      className="w-full h-11 rounded-xl gradient-blue neon-glow-blue font-semibold"
                      onClick={handleTradeAgain}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Trade Again
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back button during running */}
            {phase === 'running' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground text-xs"
                onClick={handleReturnToDashboard}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Leave Trade (trade will continue)
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}