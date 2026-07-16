'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import type { TradeData } from '@/lib/store';

// ─── Mock Candlestick Data Generator ────────────────────────────────────────────

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bodyBottom: number;
  bodyTop: number;
  isUp: boolean;
  ma: number;
  maShort: number;
}

function generateCandlestickData(basePrice: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice * (1 - 0.015 + Math.random() * 0.005);

  const times = [
    '09:00', '09:05', '09:10', '09:15', '09:20',
    '09:25', '09:30', '09:35', '09:40', '09:45',
    '09:50', '09:55', '10:00', '10:05', '10:10',
    '10:15', '10:20', '10:25', '10:30', '10:35',
    '10:40', '10:45', '10:50', '10:55', '11:00',
    '11:05', '11:10', '11:15', '11:20', '11:25',
  ];

  for (let i = 0; i < 30; i++) {
    const volatility = basePrice * 0.003 * (0.5 + Math.random());
    const direction = Math.random() > 0.48 ? 1 : -1;
    const open = price;
    const close = open + direction * volatility * (0.3 + Math.random() * 0.7);
    const wickUp = Math.random() * volatility * 0.8;
    const wickDown = Math.random() * volatility * 0.8;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const volume = Math.round((500 + Math.random() * 2000) * 100) / 100;

    price = close + (Math.random() - 0.5) * basePrice * 0.001;

    candles.push({
      time: times[i % times.length],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      bodyBottom: parseFloat(Math.min(open, close).toFixed(2)),
      bodyTop: parseFloat(Math.max(open, close).toFixed(2)),
      isUp: close >= open,
      ma: 0,
      maShort: 0,
    });
  }

  // Calculate moving averages
  for (let i = 6; i < candles.length; i++) {
    const sum7 = candles.slice(i - 6, i + 1).reduce((s, c) => s + c.close, 0);
    candles[i].ma = parseFloat((sum7 / 7).toFixed(2));
  }
  for (let i = 2; i < candles.length; i++) {
    const sum3 = candles.slice(i - 2, i + 1).reduce((s, c) => s + c.close, 0);
    candles[i].maShort = parseFloat((sum3 / 3).toFixed(2));
  }

  return candles;
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CandleData }>;
  label?: string;
}

function CandlestickTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload as CandleData;
  if (!data) return null;

  return (
    <div className="glass-strong rounded-lg p-3 min-w-[160px]">
      <p className="text-xs text-muted-foreground mb-2 font-medium">{data.time}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">Open</span>
        <span className="text-right font-mono text-foreground">{data.open.toFixed(2)}</span>
        <span className="text-muted-foreground">High</span>
        <span className="text-right font-mono text-emerald-400">{data.high.toFixed(2)}</span>
        <span className="text-muted-foreground">Low</span>
        <span className="text-right font-mono text-red-400">{data.low.toFixed(2)}</span>
        <span className="text-muted-foreground">Close</span>
        <span className={`text-right font-mono ${data.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {data.close.toFixed(2)}
        </span>
        <span className="text-muted-foreground">Vol</span>
        <span className="text-right font-mono text-blue-400">{data.volume.toFixed(0)}</span>
      </div>
    </div>
  );
}

// ─── Custom Candlestick Bar ─────────────────────────────────────────────────────

function CandlestickBody(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload || width === 0) return null;
  const isUp = payload.isUp;
  const barWidth = Math.max(width * 0.5, 4);
  const offsetX = (width - barWidth) / 2;

  return (
    <g>
      {/* Wick line */}
      <line
        x1={x + width / 2}
        y1={props.y + props.background?.[0]?.y || 0}
        x2={x + width / 2}
        y2={y + height}
        stroke={isUp ? '#10b981' : '#ef4444'}
        strokeWidth={1}
        opacity={0.7}
      />
      {/* Body */}
      <rect
        x={x + offsetX}
        y={y}
        width={barWidth}
        height={Math.max(height, 1)}
        fill={isUp ? '#10b981' : '#ef4444'}
        rx={1}
        opacity={0.9}
      />
    </g>
  );
}

// ─── Duration Options ───────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '2min', value: 120 },
  { label: '5min', value: 300 },
  { label: '15min', value: 900 },
  { label: '30min', value: 1800 },
];

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000, 5000];

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TradingPage() {
  const {
    selectedCoin,
    selectedTradeDirection,
    setSelectedTradeDirection,
    addTrade,
    setCurrentTrade,
    navigate,
    user,
  } = useAppStore();

  const [amount, setAmount] = useState<string>('100');
  const [duration, setDuration] = useState<number>(60);
  const [livePrice, setLivePrice] = useState<number>(selectedCoin?.price ?? 0);

  // Generate realistic candlestick data
  const candleData = useMemo(() => {
    return generateCandlestickData(selectedCoin?.price ?? 100);
  }, [selectedCoin?.price]);

  // Simulate live price tick
  React.useEffect(() => {
    if (!selectedCoin) return;
    const interval = setInterval(() => {
      const tick = (Math.random() - 0.48) * selectedCoin.price * 0.0003;
      setLivePrice((prev) => parseFloat((prev + tick).toFixed(2)));
    }, 800);
    return () => clearInterval(interval);
  }, [selectedCoin]);

  // Derived values
  const payoutRate = 0.85;
  const tradeAmount = parseFloat(amount) || 0;
  const estimatedReturn = tradeAmount * payoutRate;

  const priceChangeColor = (selectedCoin?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
  const priceChangeSign = (selectedCoin?.change24h ?? 0) >= 0 ? '+' : '';

  // Price decimals based on coin price
  const decimals = livePrice > 1000 ? 2 : livePrice > 1 ? 4 : 6;

  const bidPrice = parseFloat((livePrice * (1 - 0.0002)).toFixed(decimals));
  const askPrice = parseFloat((livePrice * (1 + 0.0002)).toFixed(decimals));
  const spread = parseFloat((askPrice - bidPrice).toFixed(decimals));

  // Chart domain
  const allPrices = candleData.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.1;

  const handleConfirmTrade = useCallback(() => {
    if (!selectedCoin || !selectedTradeDirection || tradeAmount <= 0 || !user) return;

    const trade: TradeData = {
      id: `TRD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      pair: selectedCoin.pair,
      direction: selectedTradeDirection,
      amount: tradeAmount,
      entryPrice: livePrice,
      exitPrice: null,
      duration,
      status: 'running',
      profit: 0,
      payout: 0,
      startedAt: new Date(),
      closedAt: null,
    };

    addTrade(trade);
    setCurrentTrade(trade);
    navigate('trade-confirm');
  }, [selectedCoin, selectedTradeDirection, tradeAmount, livePrice, duration, addTrade, setCurrentTrade, navigate, user]);

  if (!selectedCoin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No coin selected</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-4 h-full"
    >
      {/* ─── Left Panel: Chart ─────────────────────────────────────── */}
      <div className="w-full lg:w-[70%] flex flex-col gap-4">
        {/* Coin Header */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                {selectedCoin.logo}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground truncate">
                    {selectedCoin.name}
                  </h2>
                  <span className="text-sm text-muted-foreground font-mono">
                    {selectedCoin.pair}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    ${livePrice.toFixed(decimals)}
                  </span>
                  <span className={`text-sm font-semibold font-mono ${priceChangeColor}`}>
                    {priceChangeSign}{selectedCoin.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="text-right">
                <div className="text-muted-foreground">24h High</div>
                <div className="text-emerald-400 font-mono font-medium">
                  ${selectedCoin.high24h.toLocaleString()}
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-right">
                <div className="text-muted-foreground">24h Low</div>
                <div className="text-red-400 font-mono font-medium">
                  ${selectedCoin.low24h.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className="glass-card rounded-xl p-4 flex-1 min-h-[350px] lg:min-h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={candleData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="maGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59, 130, 246, 0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(59, 130, 246, 0.1)' }}
                tickLine={false}
                interval={4}
              />

              <YAxis
                yAxisId="price"
                domain={[minPrice - pricePadding, maxPrice + pricePadding]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(decimals > 2 ? 2 : 0)}
                width={70}
                orientation="right"
              />

              <YAxis
                yAxisId="volume"
                hide
                domain={[0, 'auto']}
              />

              {/* Candle wicks rendered via error bars on a hidden bar */}
              <Bar
                yAxisId="price"
                dataKey="low"
                fill="transparent"
                isAnimationActive={false}
                barSize={2}
              >
                {candleData.map((entry, index) => (
                  <Cell key={index} fill="transparent" />
                ))}
              </Bar>

              {/* Candle bodies */}
              <Bar
                yAxisId="price"
                dataKey="bodyBottom"
                stackId="candle"
                isAnimationActive={false}
                barSize={12}
                shape={(props: any) => <CandlestickBody {...props} />}
              />

              {/* Moving Average (7-period) */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={true}
                animationDuration={1200}
                strokeDasharray="6 3"
                connectNulls
              />

              {/* Short MA (3-period) */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="maShort"
                stroke="#f59e0b"
                strokeWidth={1}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls
              />

              {/* Volume bars */}
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="url(#volumeGradient)"
                isAnimationActive={true}
                animationDuration={800}
                barSize={12}
                opacity={0.5}
              />

              {/* Current price reference line */}
              <ReferenceLine
                yAxisId="price"
                y={livePrice}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                strokeWidth={1}
                strokeOpacity={0.6}
              />

              <Tooltip
                content={<CandlestickTooltip />}
                cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 1 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Price Ticker Strip */}
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">BID</span>
                <p className="font-mono font-semibold text-emerald-400">
                  ${bidPrice.toFixed(decimals)}
                </p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground text-xs">SPREAD</span>
                <p className="font-mono font-medium text-blue-400">
                  {spread.toFixed(decimals)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">ASK</span>
                <p className="font-mono font-semibold text-red-400">
                  ${askPrice.toFixed(decimals)}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Trading Controls ─────────────────────────── */}
      <div className="w-full lg:w-[30%] flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {!selectedTradeDirection ? (
            /* Direction Selection */
            <motion.div
              key="direction-select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-xl p-6 flex flex-col gap-4"
            >
              <h3 className="text-base font-semibold text-center text-foreground">
                Choose Direction
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                Predict if {selectedCoin.symbol} price will go UP or DOWN
              </p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTradeDirection('up')}
                  className="relative group rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer
                    border-2 border-emerald-500/20 bg-emerald-500/5
                    hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center
                    group-hover:neon-glow-green transition-all">
                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="text-lg font-bold text-emerald-400">BUY UP</span>
                  <span className="text-[10px] text-muted-foreground">Price goes higher</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTradeDirection('down')}
                  className="relative group rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer
                    border-2 border-red-500/20 bg-red-500/5
                    hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center
                    group-hover:neon-glow-red transition-all">
                    <TrendingDown className="w-7 h-7 text-red-400" />
                  </div>
                  <span className="text-lg font-bold text-red-400">BUY DOWN</span>
                  <span className="text-[10px] text-muted-foreground">Price goes lower</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Trading Form */
            <motion.div
              key="trade-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-xl p-5 flex flex-col gap-4"
            >
              {/* Direction Indicator */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm
                    ${selectedTradeDirection === 'up'
                      ? 'bg-emerald-500/15 text-emerald-400 neon-glow-green border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 neon-glow-red border border-red-500/30'
                    }`}
                >
                  {selectedTradeDirection === 'up' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {selectedTradeDirection === 'up' ? 'BUY UP' : 'BUY DOWN'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setSelectedTradeDirection(null)}
                >
                  Change
                </Button>
              </div>

              <Separator />

              {/* Amount Input */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Trade Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 h-11 bg-background/50 border-primary/20 text-foreground font-mono text-lg
                      focus:border-primary/50 focus:ring-primary/20"
                    placeholder="0.00"
                    min="1"
                    max={user?.balance ?? 10000}
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((qa) => (
                  <motion.button
                    key={qa}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAmount(qa.toString())}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all
                      ${parseFloat(amount) === qa
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                    ${qa.toLocaleString()}
                  </motion.button>
                ))}
              </div>

              {/* Duration Selection */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <motion.button
                      key={d.value}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setDuration(d.value)}
                      className={`rounded-lg py-2 text-xs font-semibold transition-all
                        ${duration === d.value
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
                        }`}
                    >
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payout Info */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payout Rate</span>
                <span className="text-sm font-bold text-primary">
                  {(payoutRate * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Return</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  +${estimatedReturn.toFixed(2)}
                </span>
              </div>

              <Separator />

              {/* Trade Summary */}
              <div className="bg-background/40 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Trade Summary
                </h4>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pair</span>
                  <span className="font-mono text-foreground">{selectedCoin.pair}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Direction</span>
                  <span className={`font-semibold ${selectedTradeDirection === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedTradeDirection === 'up' ? '↑ UP' : '↓ DOWN'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entry Price</span>
                  <span className="font-mono text-foreground">${livePrice.toFixed(decimals)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono text-foreground">${tradeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{DURATIONS.find((d) => d.value === duration)?.label}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. Payout</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${(tradeAmount + estimatedReturn).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Balance Indicator */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-mono text-foreground">
                  ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                </span>
              </div>

              {/* Confirm Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleConfirmTrade}
                  disabled={tradeAmount <= 0 || (user?.balance ?? 0) < tradeAmount}
                  className="w-full h-12 text-base font-bold rounded-xl gradient-blue neon-glow-blue
                    hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5 mr-1" />
                  Confirm Trade
                </Button>
              </motion.div>

              {tradeAmount > (user?.balance ?? 0) && (
                <p className="text-xs text-red-400 text-center">
                  Insufficient balance
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}