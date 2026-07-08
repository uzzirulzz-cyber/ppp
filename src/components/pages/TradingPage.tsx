'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore, Pages } from '@/store/useStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ─── Constants ───

const COINS = [
  { symbol: 'BTCUSDT', name: 'BTC/USDT', basePrice: 67245.3, decimals: 2 },
  { symbol: 'ETHUSDT', name: 'ETH/USDT', basePrice: 3856.42, decimals: 2 },
  { symbol: 'BNBUSDT', name: 'BNB/USDT', basePrice: 612.85, decimals: 2 },
  { symbol: 'SOLUSDT', name: 'SOL/USDT', basePrice: 178.36, decimals: 2 },
  { symbol: 'XRPUSDT', name: 'XRP/USDT', basePrice: 2.4215, decimals: 4 },
  { symbol: 'ADAUSDT', name: 'ADA/USDT', basePrice: 0.9847, decimals: 4 },
  { symbol: 'DOGEUSDT', name: 'DOGE/USDT', basePrice: 0.3821, decimals: 4 },
  { symbol: 'DOTUSDT', name: 'DOT/USDT', basePrice: 8.463, decimals: 3 },
];

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const ORDER_TYPES = ['Market', 'Limit', 'Stop'] as const;
const DURATIONS = ['30s', '1m', '5m', '15m', '30m', '1H'];

// ─── Helpers ───

function getCoinInfo(symbol: string) {
  return COINS.find((c) => c.symbol === symbol) || COINS[0];
}

function generatePriceData(coin: (typeof COINS)[number], timeframe: string) {
  const data: { time: string; price: number; volume: number }[] = [];
  let price = coin.basePrice;
  const now = Date.now();
  let intervalMs = 60_000;
  let count = 120;
  let formatTime: (d: Date) => string;

  switch (timeframe) {
    case '1m':
      intervalMs = 10_000;
      count = 120;
      formatTime = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      break;
    case '5m':
      intervalMs = 30_000;
      count = 100;
      formatTime = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
      break;
    case '15m':
      intervalMs = 60_000;
      count = 90;
      formatTime = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
      break;
    case '1H':
      intervalMs = 300_000;
      count = 72;
      formatTime = (d) => `${d.getHours()}:00`;
      break;
    case '4H':
      intervalMs = 900_000;
      count = 48;
      formatTime = (d) => `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      break;
    case '1D':
      intervalMs = 3_600_000;
      count = 60;
      formatTime = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
      break;
    case '1W':
    default:
      intervalMs = 21_600_000;
      count = 50;
      formatTime = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
      break;
  }

  const volatility = coin.basePrice * 0.001;

  for (let i = count; i >= 0; i--) {
    const date = new Date(now - i * intervalMs);
    price += (Math.random() - 0.48) * volatility;
    price = Math.max(coin.basePrice * 0.95, Math.min(coin.basePrice * 1.05, price));
    data.push({
      time: formatTime(date),
      price: parseFloat(price.toFixed(coin.decimals)),
      volume: parseFloat((Math.random() * 500 + 100).toFixed(2)),
    });
  }

  return data;
}

function generateOrderBook(currentPrice: number, decimals: number) {
  const asks = [];
  const bids = [];
  const step = currentPrice * 0.0003;

  for (let i = 0; i < 8; i++) {
    asks.push({
      price: parseFloat((currentPrice + step * (i + 1)).toFixed(decimals)),
      amount: parseFloat((Math.random() * 3 + 0.1).toFixed(4)),
    });
    bids.push({
      price: parseFloat((currentPrice - step * (i + 1)).toFixed(decimals)),
      amount: parseFloat((Math.random() * 3 + 0.1).toFixed(4)),
    });
  }

  asks.sort((a, b) => b.price - a.price);
  bids.sort((a, b) => b.price - a.price);

  return { asks, bids };
}

function generateRecentTrades(currentPrice: number, decimals: number) {
  const trades = [];
  const now = new Date();
  for (let i = 0; i < 15; i++) {
    const isBuy = Math.random() > 0.5;
    trades.push({
      time: new Date(now.getTime() - i * (Math.random() * 30000 + 5000)).toLocaleTimeString(),
      price: parseFloat((currentPrice + (Math.random() - 0.5) * currentPrice * 0.001).toFixed(decimals)),
      amount: parseFloat((Math.random() * 2 + 0.01).toFixed(4)),
      isBuy,
    });
  }
  return trades;
}

function formatPrice(price: number, decimals: number) {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatUSD(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Custom Tooltip ───

function ChartTooltip({
  active,
  payload,
  label,
  decimals,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  decimals: number;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: '#171c28',
        border: '1px solid #2a3042',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      <div style={{ color: '#6b7a8d', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#ffffff', fontWeight: 600 }}>
        ${formatPrice(payload[0].value, decimals)}
      </div>
    </div>
  );
}

// ─── Main Component ───

export default function TradingPage() {
  const { token, navigate, selectedCoin, setSelectedCoin } = useStore();

  // Local state
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('1H');
  const [orderType, setOrderType] = useState<(typeof ORDER_TYPES)[number]>('Market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [duration, setDuration] = useState('5m');
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [submitting, setSubmitting] = useState(false);
  const [submitSide, setSubmitSide] = useState<'BUY' | 'SELL' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data state
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(COINS[0].basePrice);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [priceSeed, setPriceSeed] = useState(0);

  // Computed coin info
  const activeCoin = getCoinInfo(selectedCoin || 'BTCUSDT');

  // Reset price and form when coin changes (via event handler, not effect)
  const prevCoinRef = React.useRef(selectedCoin);
  React.useEffect(() => {
    if (prevCoinRef.current !== selectedCoin) {
      prevCoinRef.current = selectedCoin;
      const coin = getCoinInfo(selectedCoin || 'BTCUSDT');
      // Use timeout to avoid synchronous setState in effect
      const handle = setTimeout(() => {
        setCurrentPrice(coin.basePrice);
        setPriceChange24h(parseFloat(((Math.random() - 0.4) * 5).toFixed(2)));
        setPriceSeed(Math.random());
        setAmount('');
        setLimitPrice('');
        setStopPrice('');
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [selectedCoin]);

  // Generate chart data (re-generate on coin/timeframe/seed change)
  const chartData = useMemo(
    () => generatePriceData(activeCoin, timeframe),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCoin, timeframe, priceSeed]
  );

  // Generate order book
  const orderBook = useMemo(
    () => generateOrderBook(currentPrice, activeCoin.decimals),
    [currentPrice, activeCoin.decimals]
  );

  // Generate recent trades
  const recentTrades = useMemo(
    () => generateRecentTrades(currentPrice, activeCoin.decimals),
    [currentPrice, activeCoin.decimals]
  );

  // Simulate live price tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const tick = prev * (1 + (Math.random() - 0.5) * 0.0003);
        return parseFloat(tick.toFixed(activeCoin.decimals));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [activeCoin.decimals]);

  // Fetch wallet balance
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) return;
      const handle = setTimeout(async () => {
        if (cancelled) return;
        setWalletLoading(true);
        try {
          const res = await fetch('/api/wallet/balance', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok && !cancelled) {
            const data = await res.json();
            const usdt = data.balances?.find(
              (b: { currency: string; amount: number }) => b.currency === 'USDT'
            );
            setWalletBalance(usdt?.amount || 0);
          }
        } catch {
          // Silent fail
        } finally {
          if (!cancelled) setWalletLoading(false);
        }
      }, 0);
      return () => clearTimeout(handle);
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  // Expose fetchWallet for manual refresh
  const fetchWallet = useCallback(async () => {
    if (!token) return;
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const usdt = data.balances?.find(
          (b: { currency: string; amount: number }) => b.currency === 'USDT'
        );
        setWalletBalance(usdt?.amount || 0);
      }
    } catch {
      // Silent fail
    } finally {
      setWalletLoading(false);
    }
  }, [token]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Derived values
  const amountNum = parseFloat(amount) || 0;
  const priceNum = currentPrice;
  const notionalValue = amountNum * priceNum;
  const actualMargin = notionalValue / leverage;
  const maxTradeSize = walletBalance > 0 ? walletBalance : 0;

  // Estimated P&L calculation
  const estimatedPnl = useMemo(() => {
    if (amountNum <= 0 || priceNum <= 0) return 0;
    const durationMultiplier: Record<string, number> = {
      '30s': 0.002,
      '1m': 0.005,
      '5m': 0.015,
      '15m': 0.03,
      '30m': 0.05,
      '1H': 0.08,
    };
    const movement = durationMultiplier[duration] || 0.015;
    const estProfit = notionalValue * movement * leverage * 0.5;
    return estProfit;
  }, [amountNum, priceNum, leverage, duration, notionalValue]);

  // Handle trade submission
  const handleSubmitTrade = async (side: 'BUY' | 'SELL') => {
    if (!token) {
      setToast({ type: 'error', message: 'Please login to place trades' });
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (!tradeAmount || tradeAmount <= 0) {
      setToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    if (orderType === 'Limit') {
      const lp = parseFloat(limitPrice);
      if (!lp || lp <= 0) {
        setToast({ type: 'error', message: 'Please enter a valid limit price' });
        return;
      }
    }

    if (orderType === 'Stop') {
      const sp = parseFloat(stopPrice);
      if (!sp || sp <= 0) {
        setToast({ type: 'error', message: 'Please enter a valid stop price' });
        return;
      }
    }

    setSubmitting(true);
    setSubmitSide(side);

    try {
      const body: Record<string, unknown> = {
        symbol: activeCoin.symbol,
        side,
        type: orderType === 'Stop' ? 'MARKET' : orderType.toUpperCase(),
        quantity: tradeAmount,
        leverage,
        price: currentPrice,
      };

      if (orderType === 'Limit') {
        body.type = 'LIMIT';
        body.price = parseFloat(limitPrice);
      }

      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({
          type: 'success',
          message: `${side === 'BUY' ? 'BUY UP' : 'SELL DOWN'} ${activeCoin.name} placed successfully!`,
        });
        await fetchWallet();
        setTimeout(() => {
          navigate(Pages.DASHBOARD);
        }, 1500);
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Trade failed. Please try again.',
        });
      }
    } catch {
      setToast({
        type: 'error',
        message: 'Network error. Please check your connection.',
      });
    } finally {
      setSubmitting(false);
      setSubmitSide(null);
    }
  };

  // Quick amount buttons
  const quickAmounts = [25, 50, 75, 100];
  const handleQuickAmount = (pct: number) => {
    if (maxTradeSize <= 0) return;
    const usdtAmount = (maxTradeSize * pct) / 100;
    const qty = usdtAmount / priceNum;
    setAmount(qty.toFixed(activeCoin.decimals > 2 ? 4 : 2));
  };

  const priceDecimals = activeCoin.decimals;
  const isPositive = priceChange24h >= 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '16px 20px', background: 'var(--bg-primary)' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: 12,
            background: toast.type === 'success' ? '#0d3320' : '#3d0f0f',
            border: `1px solid ${toast.type === 'success' ? '#00d26a' : '#ff3d57'}`,
            color: toast.type === 'success' ? '#00d26a' : '#ff3d57',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: `0 8px 32px ${toast.type === 'success' ? 'rgba(0,210,106,0.15)' : 'rgba(255,61,87,0.15)'}`,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Coin Selector Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Coin Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              background: 'var(--bg-card)',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 160,
            }}
          >
            {activeCoin.name}
            <ChevronDown size={16} style={{ color: '#6b7a8d', marginLeft: 'auto' }} />
          </button>
          {coinDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                background: '#171c28',
                border: '1px solid #2a3042',
                borderRadius: 12,
                padding: 6,
                zIndex: 100,
                minWidth: 200,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              }}
            >
              {COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => {
                    setSelectedCoin(coin.symbol);
                    setCoinDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: 8,
                    background: selectedCoin === coin.symbol ? 'rgba(0,229,255,0.1)' : 'transparent',
                    color: selectedCoin === coin.symbol ? '#00e5ff' : '#b9c2d0',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCoin !== coin.symbol)
                      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCoin !== coin.symbol)
                      (e.target as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{coin.name}</span>
                  <span style={{ color: '#6b7a8d', fontSize: 12 }}>
                    ${formatPrice(coin.basePrice, coin.decimals)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Price Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>
            ${formatPrice(currentPrice, priceDecimals)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isPositive ? '#00d26a' : '#ff3d57',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isPositive ? '+' : ''}
            {priceChange24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {coinDropdownOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setCoinDropdownOpen(false)}
        />
      )}

      {/* Main 2-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 16,
          minHeight: 'calc(100vh - 160px)',
        }}
        className="trading-grid"
      >
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Chart Section */}
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '16px 20px',
              flex: '0 0 auto',
            }}
          >
            {/* Timeframe Selector */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: timeframe === tf ? 'rgba(0,229,255,0.12)' : 'transparent',
                    color: timeframe === tf ? '#00e5ff' : '#6b7a8d',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5b400" stopOpacity={0.3} />
                      <stop offset="50%" stopColor="#00e5ff" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(42,48,66,0.5)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#6b7a8d', fontSize: 11 }}
                    axisLine={{ stroke: '#2a3042' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#6b7a8d', fontSize: 11 }}
                    axisLine={{ stroke: '#2a3042' }}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                    width={80}
                  />
                  <Tooltip content={<ChartTooltip decimals={priceDecimals} />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#f5b400"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Book / Recent Trades Tabs */}
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: 16,
              flex: '1 1 auto',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                marginBottom: 16,
                borderBottom: '1px solid #2a3042',
              }}
            >
              {(['orderbook', 'trades'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #00e5ff' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === tab ? '#00e5ff' : '#6b7a8d',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'orderbook' ? 'Order Book' : 'Recent Trades'}
                </button>
              ))}
            </div>

            {activeTab === 'orderbook' ? (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '6px 12px',
                    fontSize: 12,
                    color: '#6b7a8d',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  <span>Price (USDT)</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                </div>

                {/* Asks (sell orders - red) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {orderBook.asks.map((ask, i) => (
                    <div
                      key={`ask-${i}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        padding: '4px 12px',
                        fontSize: 13,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: `${Math.min(ask.amount / 4 * 100, 100)}%`,
                          background: 'rgba(255,61,87,0.08)',
                        }}
                      />
                      <span style={{ color: '#ff3d57', position: 'relative', zIndex: 1 }}>
                        {formatPrice(ask.price, priceDecimals)}
                      </span>
                      <span style={{ color: '#b9c2d0', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                        {ask.amount.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spread */}
                <div
                  style={{
                    padding: '8px 12px',
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: isPositive ? '#00d26a' : '#ff3d57',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderTop: '1px solid #2a3042',
                    borderBottom: '1px solid #2a3042',
                    margin: '4px 0',
                  }}
                >
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ${formatPrice(currentPrice, priceDecimals)}
                </div>

                {/* Bids (buy orders - green) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {orderBook.bids.map((bid, i) => (
                    <div
                      key={`bid-${i}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        padding: '4px 12px',
                        fontSize: 13,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: `${Math.min(bid.amount / 4 * 100, 100)}%`,
                          background: 'rgba(0,210,106,0.08)',
                        }}
                      />
                      <span style={{ color: '#00d26a', position: 'relative', zIndex: 1 }}>
                        {formatPrice(bid.price, priceDecimals)}
                      </span>
                      <span style={{ color: '#b9c2d0', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                        {bid.amount.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {/* Recent Trades Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 60px',
                    padding: '6px 12px',
                    fontSize: 12,
                    color: '#6b7a8d',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  <span>Time</span>
                  <span>Price</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                  <span style={{ textAlign: 'right' }}>Side</span>
                </div>

                <div className="data-table" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {recentTrades.map((trade, i) => (
                    <div
                      key={`trade-${i}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 60px',
                        padding: '5px 12px',
                        fontSize: 13,
                        borderBottom: '1px solid rgba(42,48,66,0.3)',
                      }}
                    >
                      <span style={{ color: '#6b7a8d' }}>{trade.time}</span>
                      <span style={{ color: trade.isBuy ? '#00d26a' : '#ff3d57' }}>
                        {formatPrice(trade.price, priceDecimals)}
                      </span>
                      <span style={{ color: '#b9c2d0', textAlign: 'right' }}>
                        {trade.amount.toFixed(4)}
                      </span>
                      <span style={{ textAlign: 'right' }}>
                        <span
                          className={trade.isBuy ? 'badge-green' : 'badge-red'}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {trade.isBuy ? 'BUY' : 'SELL'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Trading Panel */}
        <div className="trade-box" style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 'fit-content' }}>
          {/* Wallet Balance */}
          <div style={{ padding: '16px 20px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#6b7a8d', marginBottom: 4 }}>Available Balance</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                  {walletLoading ? (
                    <Loader2 size={18} style={{ display: 'inline', color: '#6b7a8d' }} className="spin" />
                  ) : (
                    <>${formatUSD(walletBalance)}</>
                  )}
                </div>
              </div>
              <button
                onClick={fetchWallet}
                style={{
                  background: 'rgba(0,229,255,0.08)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  color: '#00e5ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Refresh balance"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Price + 24h Change */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                ${formatPrice(currentPrice, priceDecimals)}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: isPositive ? 'rgba(0,210,106,0.12)' : 'rgba(255,61,87,0.12)',
                  color: isPositive ? '#00d26a' : '#ff3d57',
                }}
              >
                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>

            {/* Order Type Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                marginBottom: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: 3,
              }}
            >
              {ORDER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: 8,
                    background: orderType === type ? 'rgba(0,229,255,0.12)' : 'transparent',
                    color: orderType === type ? '#00e5ff' : '#6b7a8d',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#6b7a8d', display: 'block', marginBottom: 6 }}>
                Amount ({activeCoin.symbol.replace('USDT', '')})
              </label>
              <div className="trade-input" style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  className="trade-input"
                  style={{
                    width: '100%',
                    background: '#1b2232',
                    border: '1px solid #2d364b',
                    borderRadius: 12,
                    padding: '12px 80px 12px 16px',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00e5ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2d364b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 12,
                    color: '#6b7a8d',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>≈ ${notionalValue > 0 ? formatUSD(notionalValue) : '0.00'}</div>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {quickAmounts.map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleQuickAmount(pct)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    border: '1px solid #2d364b',
                    borderRadius: 8,
                    background: 'transparent',
                    color: '#b9c2d0',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#00e5ff';
                    (e.currentTarget as HTMLElement).style.color = '#00e5ff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2d364b';
                    (e.currentTarget as HTMLElement).style.color = '#b9c2d0';
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Limit Price Input (shown for Limit orders) */}
            {orderType === 'Limit' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#6b7a8d', display: 'block', marginBottom: 6 }}>
                  Limit Price (USDT)
                </label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={formatPrice(currentPrice, priceDecimals)}
                  step="any"
                  className="trade-input"
                  style={{
                    width: '100%',
                    background: '#1b2232',
                    border: '1px solid #2d364b',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00e5ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2d364b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {/* Stop Price Input (shown for Stop orders) */}
            {orderType === 'Stop' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#6b7a8d', display: 'block', marginBottom: 6 }}>
                  Stop Price (USDT)
                </label>
                <input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder={formatPrice(currentPrice, priceDecimals)}
                  step="any"
                  className="trade-input"
                  style={{
                    width: '100%',
                    background: '#1b2232',
                    border: '1px solid #2d364b',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00e5ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2d364b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {/* Leverage Slider */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#6b7a8d' }}>Leverage</label>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: leverage > 20 ? '#ff3d57' : leverage > 10 ? '#f5b400' : '#00e5ff',
                  }}
                >
                  {leverage}x
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  appearance: 'none',
                  background: `linear-gradient(to right, #00e5ff 0%, #f5b400 ${leverage}%, #2d364b ${leverage}%, #2d364b 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  fontSize: 11,
                  color: '#6b7a8d',
                }}
              >
                <span>1x</span>
                <span>25x</span>
                <span>50x</span>
                <span>75x</span>
                <span>100x</span>
              </div>
            </div>

            {/* Duration Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#6b7a8d', display: 'block', marginBottom: 8 }}>
                Duration
              </label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: duration === d ? '#00e5ff' : '#2d364b',
                      background: duration === d ? 'rgba(0,229,255,0.08)' : 'transparent',
                      color: duration === d ? '#00e5ff' : '#6b7a8d',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated P&L */}
            {amountNum > 0 && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(0,229,255,0.04)',
                  border: '1px solid rgba(0,229,255,0.1)',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, color: '#6b7a8d', marginBottom: 4 }}>Estimated P&L</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00e5ff' }}>
                  +${formatUSD(estimatedPnl)}
                </div>
                <div style={{ fontSize: 11, color: '#6b7a8d', marginTop: 2 }}>
                  Margin: ${formatUSD(actualMargin)} · Notional: ${formatUSD(notionalValue)}
                </div>
              </div>
            )}

            {/* BUY UP Button */}
            <button
              className="buy-up"
              onClick={() => handleSubmitTrade('BUY')}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: 14,
                border: 'none',
                background: submitting && submitSide === 'BUY'
                  ? 'rgba(0,210,106,0.5)'
                  : 'linear-gradient(135deg, #00d26a 0%, #00a854 100%)',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s',
                opacity: submitting && submitSide !== 'BUY' ? 0.5 : 1,
                letterSpacing: 0.5,
              }}
            >
              {submitting && submitSide === 'BUY' ? (
                <Loader2 size={20} className="spin" />
              ) : (
                <ArrowUpRight size={20} />
              )}
              {submitting && submitSide === 'BUY' ? 'Placing Order...' : 'BUY UP / CALL'}
            </button>

            {/* SELL DOWN Button */}
            <button
              className="buy-down"
              onClick={() => handleSubmitTrade('SELL')}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: 14,
                border: 'none',
                background: submitting && submitSide === 'SELL'
                  ? 'rgba(255,61,87,0.5)'
                  : 'linear-gradient(135deg, #ff3d57 0%, #d42e44 100%)',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s',
                opacity: submitting && submitSide !== 'SELL' ? 0.5 : 1,
                letterSpacing: 0.5,
              }}
            >
              {submitting && submitSide === 'SELL' ? (
                <Loader2 size={20} className="spin" />
              ) : (
                <ArrowDownRight size={20} />
              )}
              {submitting && submitSide === 'SELL' ? 'Placing Order...' : 'SELL DOWN / PUT'}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx global>{`
        .trading-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 900px) {
          .trading-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .trade-input::-webkit-inner-spin-button,
        .trade-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .trade-input[type='number'] {
          -moz-appearance: textfield;
        }

        .trade-input:focus {
          border-color: #00e5ff !important;
          box-shadow: 0 0 0 3px rgba(0,229,255,0.1) !important;
          outline: none;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid #00e5ff;
        }

        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid #00e5ff;
        }

        .data-table::-webkit-scrollbar {
          width: 4px;
        }
        .data-table::-webkit-scrollbar-track {
          background: transparent;
        }
        .data-table::-webkit-scrollbar-thumb {
          background: #2a3042;
          border-radius: 4px;
        }

        .badge-green {
          background: rgba(0,210,106,0.12);
          color: #00d26a;
        }
        .badge-red {
          background: rgba(255,61,87,0.12);
          color: #ff3d57;
        }

        .glass-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .trade-box {
          background: var(--bg-secondary, #10141d);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}