'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import type { CoinData } from '@/lib/store';

interface CoinCardProps {
  coin: CoinData;
  onTrade: (coin: CoinData, direction: 'up' | 'down') => void;
}

function formatPrice(price: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price >= 1000 ? 2 : price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 1000 ? 2 : price >= 1 ? 2 : 4,
  });
  return formatter.format(price);
}

export default function CoinCard({ coin, onTrade }: CoinCardProps) {
  const isPositive = coin.change24h >= 0;

  const sparklineData = coin.sparkline.map((value, index) => ({
    index,
    value,
  }));

  const gradientId = `sparkline-${coin.symbol}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card rounded-xl p-4 transition-all duration-300 hover:border-[rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.1)]"
    >
      {/* Header: Logo + Name + Pair */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
            isPositive
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-400 border border-red-500/30'
          }`}
        >
          {coin.logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm truncate">{coin.name}</h3>
            <span className="text-xs text-muted-foreground font-medium shrink-0">{coin.pair}</span>
          </div>
        </div>
      </div>

      {/* Price + Change */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xl font-bold text-white">{formatPrice(coin.price)}</span>
          </div>
        </div>
        <div
          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
            isPositive
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-red-400 bg-red-500/10'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(coin.change24h).toFixed(2)}%
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="h-14 mb-3 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onTrade(coin, 'up')}
          className="gradient-green text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          BUY UP
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onTrade(coin, 'down')}
          className="gradient-red text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          BUY DOWN
        </motion.button>
      </div>
    </motion.div>
  );
}