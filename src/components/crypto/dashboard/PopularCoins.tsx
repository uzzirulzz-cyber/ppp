'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useAppStore, type CoinData } from '@/lib/store';
import CoinCard from './CoinCard';

export default function PopularCoins() {
  const coins = useAppStore((s) => s.coins);
  const selectCoin = useAppStore((s) => s.selectCoin);
  const setSelectedTradeDirection = useAppStore((s) => s.setSelectedTradeDirection);
  const navigate = useAppStore((s) => s.navigate);

  const handleTrade = (coin: CoinData, direction: 'up' | 'down') => {
    selectCoin(coin);
    setSelectedTradeDirection(direction);
    navigate('trade');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
          <Flame className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Popular Coins</h2>
          <p className="text-xs text-muted-foreground">Trade the most popular crypto assets</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            {coins.length} Assets
          </span>
        </div>
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coins.map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * index }}
          >
            <CoinCard coin={coin} onTrade={handleTrade} />
          </motion.div>
        ))}
      </div>

      {coins.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No coins available</p>
        </div>
      )}
    </motion.section>
  );
}