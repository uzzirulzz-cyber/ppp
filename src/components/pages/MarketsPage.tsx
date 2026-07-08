'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Flame,
  Sparkles,
  BarChart3,
  ArrowUpDown,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';
import {
  COINS,
  POPULAR_SYMBOLS,
  formatPrice,
  formatChange,
  formatVolume,
  getBaseSymbol,
  generateSparkline,
  type CoinData,
} from '@/lib/coins';

type FilterTab = 'all' | 'popular' | 'gainers' | 'losers' | 'new';

const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <BarChart3 size={14} /> },
  { key: 'popular', label: 'Popular', icon: <Flame size={14} /> },
  { key: 'gainers', label: 'Gainers', icon: <TrendingUp size={14} /> },
  { key: 'losers', label: 'Losers', icon: <TrendingDown size={14} /> },
  { key: 'new', label: 'New', icon: <Sparkles size={14} /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function MarketsPage() {
  const { navigate, setSelectedCoin } = useStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredCoins = useMemo(() => {
    let list = [...COINS];

    // Apply search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'popular':
        list = list.filter((c) => POPULAR_SYMBOLS.includes(c.symbol));
        break;
      case 'gainers':
        list = list.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
        break;
      case 'losers':
        list = list.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
        break;
      case 'new':
        list = list.slice(-6);
        break;
      default:
        break;
    }

    return list;
  }, [search, activeTab]);

  const handleCoinClick = (coin: CoinData) => {
    setSelectedCoin(coin.symbol);
    navigate(Pages.TRADING);
  };

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      style={{ paddingBottom: 40 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Markets
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Explore and trade the top cryptocurrency pairs
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search coins by name or symbol..."
          className="input-field pl-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 flex-wrap"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? 'rgba(245, 180, 0, 0.12)' : 'var(--bg-secondary)',
              border: `1px solid ${activeTab === tab.key ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: activeTab === tab.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <ArrowUpDown size={12} />
          {filteredCoins.length} coins
        </div>
      </motion.div>

      {/* Coin Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + search}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
        >
          {filteredCoins.map((coin) => {
            const isPositive = coin.change24h >= 0;
            const sparkline = generateSparkline(coin.symbol, isPositive);
            return (
              <motion.div
                key={coin.symbol}
                variants={itemVariants}
                className="glass-card card-shine p-4 cursor-pointer"
                style={{ transform: 'none' }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCoinClick(coin)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full font-bold text-sm"
                      style={{
                        width: 40,
                        height: 40,
                        background: `${coin.color}20`,
                        color: coin.color,
                        flexShrink: 0,
                      }}
                    >
                      {coin.icon}
                    </div>
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {coin.name}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {getBaseSymbol(coin.symbol)}
                      </div>
                    </div>
                  </div>
                  <Star
                    size={16}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Price + Change */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      ${formatPrice(coin.price)}
                    </div>
                  </div>
                  <span
                    className={`badge ${isPositive ? 'badge-green' : 'badge-red'} text-xs font-semibold`}
                  >
                    {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {formatChange(coin.change24h)}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="mb-3" style={{ height: 40 }}>
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <path
                      d={sparkline}
                      fill="none"
                      stroke={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Volume */}
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>Vol 24h</span>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {formatVolume(coin.volume24h)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredCoins.length === 0 && (
        <motion.div
          className="glass-card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Search size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            No coins found
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search or filter
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}