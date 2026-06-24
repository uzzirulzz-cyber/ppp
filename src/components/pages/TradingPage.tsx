'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Minus,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Mock Data ───

function generatePriceData() {
  const data = [];
  let price = 65500;
  const now = new Date();
  for (let i = 168; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = date.getHours();
    price += (Math.random() - 0.47) * 300;
    price = Math.max(64000, Math.min(68000, price));
    const vol = Math.round((Math.random() * 500 + 100) * 100) / 100;
    data.push({
      time: `${hour}:00`,
      date: `${date.getMonth() + 1}/${date.getDate()} ${hour}:00`,
      price: Math.round(price * 100) / 100,
      volume: vol,
    });
  }
  return data;
}

const askOrders = [
  { price: 67285.50, amount: 1.2345 },
  { price: 67260.00, amount: 0.8762 },
  { price: 67245.30, amount: 2.1000 },
  { price: 67210.80, amount: 0.5430 },
  { price: 67190.20, amount: 1.6780 },
];

const bidOrders = [
  { price: 67150.00, amount: 1.4500 },
  { price: 67120.50, amount: 0.9870 },
  { price: 67095.00, amount: 1.8200 },
  { price: 67060.30, amount: 2.3400 },
  { price: 67030.00, amount: 0.6540 },
];

const recentTradesBook = [
  { time: '14:32:15', price: 67245.30, amount: 0.1500, isBuy: true },
  { time: '14:32:10', price: 67240.00, amount: 0.0800, isBuy: false },
  { time: '14:31:58', price: 67250.50, amount: 0.3200, isBuy: true },
  { time: '14:31:45', price: 67235.00, amount: 0.1200, isBuy: false },
  { time: '14:31:30', price: 67245.00, amount: 0.4500, isBuy: true },
  { time: '14:31:15', price: 67230.00, amount: 0.0900, isBuy: false },
  { time: '14:31:02', price: 67238.50, amount: 0.2100, isBuy: true },
  { time: '14:30:48', price: 67225.00, amount: 0.5600, isBuy: true },
  { time: '14:30:30', price: 67220.00, amount: 0.1300, isBuy: false },
  { time: '14:30:15', price: 67228.00, amount: 0.7000, isBuy: true },
];

const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

const orderTabs = ['Limit', 'Market', 'Stop'] as const;
type OrderTab = (typeof orderTabs)[number];

const bookTabs = ['Order Book', 'Recent Trades'] as const;
type BookTab = (typeof bookTabs)[number];

const maxAmount = Math.max(
  ...askOrders.map((o) => o.amount),
  ...bidOrders.map((o) => o.amount),
);

// ─── Custom Tooltip ───
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (active && payload && payload.length) {
    const priceItem = payload.find((p) => p.dataKey === 'price');
    if (!priceItem) return null;
    return (
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          ${priceItem.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Component ───
export default function TradingPage() {
  const priceData = useMemo(() => generatePriceData(), []);
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [activeBookTab, setActiveBookTab] = useState<BookTab>('Order Book');
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('Limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [limitPrice, setLimitPrice] = useState('67245.30');
  const [amount, setAmount] = useState('');
  const [sliderPercent, setSliderPercent] = useState(0);

  const isBuy = orderSide === 'buy';
  const sideColor = isBuy ? '#22c55e' : '#ef4444';
  const sideBg = isBuy ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';

  const total = amount ? (parseFloat(amount) * parseFloat(limitPrice || '0')).toFixed(2) : '0.00';

  const adjustPrice = (delta: number) => {
    const current = parseFloat(limitPrice) || 0;
    setLimitPrice((current + delta).toFixed(2));
  };

  const handleSliderChange = (pct: number) => {
    setSliderPercent(pct);
    const balance = 50000;
    const price = parseFloat(limitPrice) || 0;
    if (price > 0) {
      const qty = ((balance * pct) / 100 / price).toFixed(6);
      setAmount(qty);
    }
  };

  const spread = (askOrders[0].price - bidOrders[0].price).toFixed(2);
  const midPrice = ((askOrders[0].price + bidOrders[0].price) / 2).toFixed(2);

  return (
    <div className="flex flex-col lg:flex-row gap-3 animate-fade-in" style={{ height: '100%' }}>
      {/* ─── Left Panel: Order Book ─── */}
      <div
        className="glass-card flex flex-col lg:w-[30%] min-w-0"
        style={{ flexShrink: 0 }}
      >
        {/* Book Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          {bookTabs.map((tab) => (
            <button
              key={tab}
              className="flex-1 text-sm font-medium py-3 text-center transition-colors"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeBookTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeBookTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              }}
              onClick={() => setActiveBookTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AnimatePresence mode="wait">
            {activeBookTab === 'Order Book' ? (
              <motion.div
                key="orderbook"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                {/* Column Headers */}
                <div className="flex justify-between text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Price (USDT)</span>
                  <span>Amount (BTC)</span>
                </div>

                {/* Asks (red, high to low) */}
                <div className="space-y-0.5 mb-2">
                  {askOrders.map((order, i) => {
                    const depthPct = (order.amount / maxAmount) * 100;
                    return (
                      <div
                        key={`ask-${i}`}
                        className="flex justify-between items-center relative px-2 py-1.5 rounded text-sm"
                        style={{ color: '#ef4444' }}
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 rounded"
                          style={{
                            width: `${depthPct}%`,
                            background: 'rgba(239, 68, 68, 0.1)',
                          }}
                        />
                        <span className="relative font-mono font-medium">{order.price.toFixed(2)}</span>
                        <span className="relative font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {order.amount.toFixed(4)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Spread */}
                <div
                  className="flex flex-col items-center py-2.5 rounded-lg mb-2"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-lg font-bold" style={{ color: isBuy ? '#22c55e' : '#ef4444' }}>
                    {midPrice}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Spread: {spread}
                  </span>
                </div>

                {/* Bids (green, high to low) */}
                <div className="space-y-0.5">
                  {bidOrders.map((order, i) => {
                    const depthPct = (order.amount / maxAmount) * 100;
                    return (
                      <div
                        key={`bid-${i}`}
                        className="flex justify-between items-center relative px-2 py-1.5 rounded text-sm"
                        style={{ color: '#22c55e' }}
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 rounded"
                          style={{
                            width: `${depthPct}%`,
                            background: 'rgba(34, 197, 94, 0.1)',
                          }}
                        />
                        <span className="relative font-mono font-medium">{order.price.toFixed(2)}</span>
                        <span className="relative font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {order.amount.toFixed(4)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recent-trades"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                {/* Column Headers */}
                <div className="flex justify-between text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Time</span>
                  <span>Price (USDT)</span>
                  <span>Amount</span>
                </div>

                <div className="space-y-0.5">
                  {recentTradesBook.map((trade, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-2 py-1.5 rounded text-sm"
                    >
                      <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {trade.time}
                      </span>
                      <span
                        className="font-mono font-medium"
                        style={{ color: trade.isBuy ? '#22c55e' : '#ef4444' }}
                      >
                        {trade.price.toFixed(2)}
                      </span>
                      <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {trade.amount.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Center Panel: Chart ─── */}
      <div className="glass-card flex flex-col lg:w-[40%] min-w-0" style={{ flexShrink: 0 }}>
        {/* Symbol Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                BTC/USDT
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  $67,245.30
                </span>
                <span
                  className="flex items-center gap-0.5 text-sm font-semibold"
                  style={{ color: '#22c55e' }}
                >
                  <ArrowUpRight size={14} />
                  +2.35%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex gap-1 px-4 pb-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: activeTimeframe === tf ? 'var(--accent-blue)' : 'transparent',
                color: activeTimeframe === tf ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Price Chart */}
        <div className="flex-1 px-2" style={{ minHeight: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 48, 65, 0.4)" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={23}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                domain={['dataMin - 200', 'dataMax + 200']}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#priceGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Bars */}
        <div className="px-2 pb-3" style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#fff',
                }}
                itemStyle={{ color: '#94a3b8' }}
                labelStyle={{ color: '#64748b' }}
                formatter={(value: any) => [`${value} BTC`, 'Volume']}
                labelFormatter={(label: any) => String(label)}
              />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.4} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Right Panel: Place Order ─── */}
      <div className="glass-card flex flex-col lg:w-[30%] min-w-0" style={{ flexShrink: 0 }}>
        {/* Order Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          {orderTabs.map((tab) => (
            <button
              key={tab}
              className="flex-1 text-sm font-medium py-3 text-center transition-colors"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeOrderTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeOrderTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              }}
              onClick={() => setActiveOrderTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeOrderTab === 'Limit' && (
              <motion.div
                key="limit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Buy / Sell Toggle */}
                <div
                  className="flex rounded-lg p-1"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: isBuy ? 'rgba(34,197,94,0.2)' : 'transparent',
                      color: isBuy ? '#22c55e' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('buy')}
                  >
                    <ArrowUpRight size={14} />
                    Buy
                  </button>
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: !isBuy ? 'rgba(239,68,68,0.2)' : 'transparent',
                      color: !isBuy ? '#ef4444' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('sell')}
                  >
                    <ArrowDownRight size={14} />
                    Sell
                  </button>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Price (USDT)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center justify-center rounded-md transition-colors"
                      style={{
                        width: 36,
                        height: 40,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={() => adjustPrice(-0.1)}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="text"
                      className="input-field text-center font-mono"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                    <button
                      className="flex items-center justify-center rounded-md transition-colors"
                      style={{
                        width: 36,
                        height: 40,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={() => adjustPrice(0.1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Amount (BTC)
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSliderPercent(0);
                    }}
                  />
                </div>

                {/* Percentage Slider */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    {([25, 50, 75, 100] as const).map((pct) => (
                      <button
                        key={pct}
                        className="text-xs font-medium px-3 py-1 rounded transition-colors"
                        style={{
                          background: sliderPercent === pct ? sideBg : 'var(--bg-primary)',
                          color: sliderPercent === pct ? sideColor : 'var(--text-muted)',
                          border: `1px solid ${sliderPercent === pct ? sideColor : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleSliderChange(pct)}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPercent}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: 4,
                      borderRadius: 2,
                      background: `linear-gradient(to right, ${sideColor} ${sliderPercent}%, var(--border-color) ${sliderPercent}%)`,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Total Display */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Total
                  </span>
                  <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {total} USDT
                  </span>
                </div>

                {/* Available Balance */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Available Balance
                  </span>
                  <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>
                    50,000.00 USDT
                  </span>
                </div>

                {/* Submit Button */}
                <motion.button
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: isBuy
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 4px 20px ${isBuy ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isBuy ? (
                    <>
                      <ArrowUpRight size={16} />
                      Buy BTC
                    </>
                  ) : (
                    <>
                      <ArrowDownRight size={16} />
                      Sell BTC
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {activeOrderTab === 'Market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Buy / Sell Toggle */}
                <div
                  className="flex rounded-lg p-1"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: isBuy ? 'rgba(34,197,94,0.2)' : 'transparent',
                      color: isBuy ? '#22c55e' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('buy')}
                  >
                    <ArrowUpRight size={14} />
                    Buy
                  </button>
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: !isBuy ? 'rgba(239,68,68,0.2)' : 'transparent',
                      color: !isBuy ? '#ef4444' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('sell')}
                  >
                    <ArrowDownRight size={14} />
                    Sell
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Amount (BTC)
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Percentage Slider */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    {([25, 50, 75, 100] as const).map((pct) => (
                      <button
                        key={pct}
                        className="text-xs font-medium px-3 py-1 rounded transition-colors"
                        style={{
                          background: sliderPercent === pct ? sideBg : 'var(--bg-primary)',
                          color: sliderPercent === pct ? sideColor : 'var(--text-muted)',
                          border: `1px solid ${sliderPercent === pct ? sideColor : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleSliderChange(pct)}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPercent}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: 4,
                      borderRadius: 2,
                      background: `linear-gradient(to right, ${sideColor} ${sliderPercent}%, var(--border-color) ${sliderPercent}%)`,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Total */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</span>
                  <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {total} USDT
                  </span>
                </div>

                {/* Balance */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Balance</span>
                  <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>50,000.00 USDT</span>
                </div>

                {/* Market Price Note */}
                <div className="text-center py-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Market price: <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>$67,245.30</span>
                  </span>
                </div>

                <motion.button
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: isBuy
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 4px 20px ${isBuy ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isBuy ? (
                    <><ArrowUpRight size={16} /> Buy BTC</>
                  ) : (
                    <><ArrowDownRight size={16} /> Sell BTC</>
                  )}
                </motion.button>
              </motion.div>
            )}

            {activeOrderTab === 'Stop' && (
              <motion.div
                key="stop"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Buy / Sell Toggle */}
                <div className="flex rounded-lg p-1" style={{ background: 'var(--bg-primary)' }}>
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: isBuy ? 'rgba(34,197,94,0.2)' : 'transparent',
                      color: isBuy ? '#22c55e' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('buy')}
                  >
                    <ArrowUpRight size={14} />
                    Buy
                  </button>
                  <button
                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: !isBuy ? 'rgba(239,68,68,0.2)' : 'transparent',
                      color: !isBuy ? '#ef4444' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOrderSide('sell')}
                  >
                    <ArrowDownRight size={14} />
                    Sell
                  </button>
                </div>

                {/* Stop Price */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Stop Price (USDT)
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="0.00"
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Amount (BTC)
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Percentage Slider */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    {([25, 50, 75, 100] as const).map((pct) => (
                      <button
                        key={pct}
                        className="text-xs font-medium px-3 py-1 rounded transition-colors"
                        style={{
                          background: sliderPercent === pct ? sideBg : 'var(--bg-primary)',
                          color: sliderPercent === pct ? sideColor : 'var(--text-muted)',
                          border: `1px solid ${sliderPercent === pct ? sideColor : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleSliderChange(pct)}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPercent}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: 4,
                      borderRadius: 2,
                      background: `linear-gradient(to right, ${sideColor} ${sliderPercent}%, var(--border-color) ${sliderPercent}%)`,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Total */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</span>
                  <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {total} USDT
                  </span>
                </div>

                {/* Balance */}
                <div
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Balance</span>
                  <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>50,000.00 USDT</span>
                </div>

                <motion.button
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: isBuy
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 4px 20px ${isBuy ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isBuy ? (
                    <><ArrowUpRight size={16} /> Stop Buy BTC</>
                  ) : (
                    <><ArrowDownRight size={16} /> Stop Sell BTC</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}