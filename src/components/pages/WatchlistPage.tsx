'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  Eye,
  Trash2,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';
import {
  COINS,
  formatPrice,
  formatChange,
  getBaseSymbol,
  generateSparkline,
  type CoinData,
} from '@/lib/coins';

const WATCHLIST_KEY = 'brock_watchlist';
const DEFAULT_WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

function loadWatchlist(): string[] {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(DEFAULT_WATCHLIST));
      return DEFAULT_WATCHLIST;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

function saveWatchlist(list: string[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function WatchlistPage() {
  const { navigate, setSelectedCoin } = useStore();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setMounted(true);
  }, []);

  const watchlistCoins = watchlist
    .map((sym) => COINS.find((c) => c.symbol === sym))
    .filter((c): c is CoinData => !!c);

  const removeFromWatchlist = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== symbol);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setWatchlist([]);
    saveWatchlist([]);
  }, []);

  const handleRowClick = (coin: CoinData) => {
    setSelectedCoin(coin.symbol);
    navigate(Pages.TRADING);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
        <div
          className="animate-spin rounded-full"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-gold)',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      style={{ paddingBottom: 40 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Watchlist
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Track your favorite coins in one place
          </p>
        </div>
        {watchlistCoins.length > 0 && (
          <motion.button
            className="btn-secondary flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={clearAll}
          >
            <Trash2 size={14} />
            Clear All
          </motion.button>
        )}
      </motion.div>

      {/* Summary Cards */}
      {watchlistCoins.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Total Coins
            </div>
            <div className="stat-value text-2xl">{watchlistCoins.length}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Gainers
            </div>
            <div className="text-2xl font-bold text-green">
              {watchlistCoins.filter((c) => c.change24h > 0).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Losers
            </div>
            <div className="text-2xl font-bold text-red">
              {watchlistCoins.filter((c) => c.change24h < 0).length}
            </div>
          </div>
        </motion.div>
      )}

      {/* Coin List */}
      <AnimatePresence mode="wait">
        {watchlistCoins.length > 0 ? (
          <motion.div
            className="glass-card overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Table Header */}
            <div
              className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 100px 40px',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <span>Coin</span>
              <span>Price</span>
              <span>24h Change</span>
              <span>Chart</span>
              <span></span>
            </div>

            {/* Coin Rows */}
            {watchlistCoins.map((coin) => {
              const isPositive = coin.change24h >= 0;
              const sparkline = generateSparkline(coin.symbol, isPositive);
              return (
                <motion.div
                  key={coin.symbol}
                  className="grid gap-4 px-4 py-3 items-center cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 100px 40px',
                    borderBottom: '1px solid rgba(42, 48, 66, 0.4)',
                  }}
                  variants={itemVariants}
                  whileHover={{ background: 'var(--bg-hover)' }}
                  onClick={() => handleRowClick(coin)}
                >
                  {/* Coin Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full font-bold text-xs"
                      style={{
                        width: 36,
                        height: 36,
                        background: `${coin.color}20`,
                        color: coin.color,
                        flexShrink: 0,
                      }}
                    >
                      {coin.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {coin.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {getBaseSymbol(coin.symbol)}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${formatPrice(coin.price)}
                  </div>

                  {/* 24h Change */}
                  <div
                    className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
                  >
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {formatChange(coin.change24h)}
                  </div>

                  {/* Mini Sparkline */}
                  <div style={{ height: 28, width: 100 }}>
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <path
                        d={sparkline}
                        fill="none"
                        stroke={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={(e) => removeFromWatchlist(coin.symbol, e)}
                    className="flex items-center justify-center rounded-lg p-1.5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--accent-red)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255, 61, 87, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <StarOff size={16} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            className="glass-card p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="mx-auto mb-4 flex items-center justify-center rounded-full"
              style={{
                width: 64,
                height: 64,
                background: 'rgba(245, 180, 0, 0.1)',
              }}
            >
              <Eye size={32} style={{ color: 'var(--accent-gold)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Your watchlist is empty
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Start adding coins from the Markets page to track their performance here.
            </p>
            <motion.button
              className="btn-gold flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(Pages.MARKETS)}
            >
              <Star size={16} />
              Browse Markets
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}