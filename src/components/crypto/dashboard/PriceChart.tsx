'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAppStore } from '@/lib/store';

function generateMockChartData() {
  const data = [];
  const basePrice = 101000;
  let price = basePrice;
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * 1500;
    price = Math.max(95000, Math.min(108000, price + change));
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      price: Math.round(price * 100) / 100,
      volume: Math.round((Math.random() * 15 + 20) * 1e9),
    });
  }
  return data;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { price: number; volume: number } }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const volumeFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="glass-strong rounded-lg px-3 py-2 border border-blue-500/20 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-white">
        {priceFormatter.format(payload[0].value)}
      </p>
      <p className="text-xs text-muted-foreground">
        Vol: {volumeFormatter.format(payload[0].payload.volume)}
      </p>
    </div>
  );
}

export default function PriceChart() {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const coins = useAppStore((s) => s.coins);
  const btcCoin = coins.find((c) => c.symbol === 'BTC');
  const basePrice = btcCoin?.price ?? 104250;

  const chartData = generateMockChartData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Market Overview</h2>
            <p className="text-xs text-muted-foreground">BTC/USDT · Last 30 Days</p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 glass rounded-lg p-0.5">
          <button
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              chartType === 'area'
                ? 'gradient-blue text-white shadow-md'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              chartType === 'line'
                ? 'gradient-blue text-white shadow-md'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3 h-3" />
            Line
          </button>
        </div>
      </div>

      {/* Current Price Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold text-white">
          ${basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
          +2.34%
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(59, 130, 246, 0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 1000', 'dataMax + 1000']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={chartType === 'line' ? 2.5 : 2}
              fill={chartType === 'area' ? 'url(#marketGradient)' : 'none'}
              dot={false}
              activeDot={{
                r: 4,
                fill: '#3b82f6',
                stroke: '#0a0e1a',
                strokeWidth: 2,
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}