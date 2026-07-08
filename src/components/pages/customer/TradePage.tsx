'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore, type CoinData } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const coinsData: CoinData[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', pair: 'BTC/USDT', logo: '₿', price: 69450.00, change24h: 2.84, high24h: 69800, low24h: 67300, volume24h: 28500000000, marketCap: 1360000000000, sparkline: [67300, 67500, 67100, 67800, 68200, 67900, 68500, 68800, 68400, 69100, 68900, 69450] },
  { id: '2', symbol: 'ETH', name: 'Ethereum', pair: 'ETH/USDT', logo: 'Ξ', price: 3820.50, change24h: 1.62, high24h: 3860, low24h: 3740, volume24h: 15200000000, marketCap: 459000000000, sparkline: [3740, 3770, 3750, 3790, 3810, 3780, 3830, 3850, 3810, 3840, 3800, 3820] },
  { id: '3', symbol: 'BNB', name: 'BNB', pair: 'BNB/USDT', logo: 'B', price: 598.30, change24h: -0.45, high24h: 608, low24h: 592, volume24h: 1800000000, marketCap: 92000000000, sparkline: [600, 605, 598, 592, 596, 602, 608, 604, 598, 595, 592, 598] },
  { id: '4', symbol: 'SOL', name: 'Solana', pair: 'SOL/USDT', logo: 'S', price: 172.80, change24h: 5.12, high24h: 175, low24h: 163, volume24h: 3200000000, marketCap: 78000000000, sparkline: [163, 166, 165, 169, 170, 168, 172, 174, 171, 173, 170, 172] },
  { id: '5', symbol: 'XRP', name: 'XRP', pair: 'XRP/USDT', logo: 'X', price: 0.5280, change24h: -1.23, high24h: 0.545, low24h: 0.522, volume24h: 1400000000, marketCap: 29000000000, sparkline: [0.540, 0.542, 0.535, 0.530, 0.528, 0.532, 0.538, 0.545, 0.540, 0.535, 0.530, 0.528] },
  { id: '6', symbol: 'ADA', name: 'Cardano', pair: 'ADA/USDT', logo: 'A', price: 0.4520, change24h: 3.21, high24h: 0.460, low24h: 0.435, volume24h: 520000000, marketCap: 16000000000, sparkline: [0.435, 0.440, 0.438, 0.443, 0.448, 0.445, 0.452, 0.458, 0.455, 0.450, 0.448, 0.452] },
  { id: '7', symbol: 'DOGE', name: 'Dogecoin', pair: 'DOGE/USDT', logo: 'D', price: 0.1620, change24h: -2.15, high24h: 0.170, low24h: 0.158, volume24h: 1200000000, marketCap: 23000000000, sparkline: [0.168, 0.170, 0.165, 0.160, 0.162, 0.166, 0.164, 0.158, 0.160, 0.163, 0.165, 0.162] },
  { id: '8', symbol: 'DOT', name: 'Polkadot', pair: 'DOT/USDT', logo: 'P', price: 7.25, change24h: 1.05, high24h: 7.40, low24h: 7.10, volume24h: 380000000, marketCap: 10000000000, sparkline: [7.10, 7.15, 7.12, 7.18, 7.22, 7.20, 7.28, 7.35, 7.30, 7.25, 7.22, 7.25] },
  { id: '9', symbol: 'AVAX', name: 'Avalanche', pair: 'AVAX/USDT', logo: 'V', price: 38.90, change24h: 4.35, high24h: 39.50, low24h: 36.80, volume24h: 680000000, marketCap: 15000000000, sparkline: [36.80, 37.20, 37.00, 37.80, 38.20, 38.00, 38.60, 39.10, 38.80, 38.50, 38.70, 38.90] },
  { id: '10', symbol: 'MATIC', name: 'Polygon', pair: 'MATIC/USDT', logo: 'M', price: 0.7240, change24h: -0.82, high24h: 0.740, low24h: 0.715, volume24h: 420000000, marketCap: 7100000000, sparkline: [0.738, 0.740, 0.735, 0.730, 0.728, 0.732, 0.725, 0.720, 0.718, 0.722, 0.720, 0.724] },
  { id: '11', symbol: 'LINK', name: 'Chainlink', pair: 'LINK/USDT', logo: 'L', price: 14.82, change24h: 2.90, high24h: 15.10, low24h: 14.30, volume24h: 560000000, marketCap: 8700000000, sparkline: [14.30, 14.45, 14.38, 14.60, 14.72, 14.65, 14.85, 14.95, 14.88, 14.80, 14.75, 14.82] },
  { id: '12', symbol: 'UNI', name: 'Uniswap', pair: 'UNI/USDT', logo: 'U', price: 7.58, change24h: -1.45, high24h: 7.80, low24h: 7.40, volume24h: 290000000, marketCap: 5700000000, sparkline: [7.78, 7.80, 7.72, 7.65, 7.60, 7.68, 7.55, 7.50, 7.48, 7.52, 7.55, 7.58] },
];

const durations = ['30s', '60s', '2m', '5m'];

const payoutMultipliers: Record<string, number> = {
  '30s': 1.85,
  '60s': 1.90,
  '2m': 1.85,
  '5m': 1.80,
};

const mockActiveTrades = [
  { id: 'a1', pair: 'BTC/USDT', type: 'Up' as const, amount: 100, entryPrice: 69400, duration: '60s', timeLeft: 42, payout: 190 },
  { id: 'a2', pair: 'ETH/USDT', type: 'Down' as const, amount: 50, entryPrice: 3825, duration: '2m', timeLeft: 85, payout: 92.5 },
];

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = positive ? '#10b981' : '#ef4444';
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function TradePage() {
  const { selectCoin, addTrade, user } = useAppStore();
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60s');
  const [isPlacing, setIsPlacing] = useState(false);

  const handleCoinClick = (coin: CoinData) => {
    setSelectedCoin(coin);
    selectCoin(coin);
  };

  const potentialPayout = tradeAmount
    ? (parseFloat(tradeAmount) * (payoutMultipliers[selectedDuration] || 1.85)).toFixed(2)
    : '0.00';

  const handlePlaceTrade = (direction: 'Up' | 'Down') => {
    if (!selectedCoin || !tradeAmount || parseFloat(tradeAmount) <= 0) return;
    setIsPlacing(true);
    setTimeout(() => {
      addTrade({
        id: `t-${Date.now()}`,
        pair: `${selectedCoin.symbol}/USDT`,
        type: direction,
        amount: parseFloat(tradeAmount),
        entryPrice: selectedCoin.price,
        duration: selectedDuration,
        coin: selectedCoin.symbol,
        status: 'active',
        timestamp: new Date().toISOString(),
      });
      setIsPlacing(false);
      setTradeAmount('');
    }, 600);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Trade</h1>
        <p className="text-gray-400 mt-1 text-sm">Select a coin and predict the price movement.</p>
      </motion.div>

      {/* Coin Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {coinsData.map((coin) => {
            const isPositive = coin.change24h >= 0;
            const isSelected = selectedCoin?.id === coin.id;
            return (
              <motion.button
                key={coin.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCoinClick(coin)}
                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{coin.symbol}</p>
                    <p className="text-gray-500 text-[10px]">{coin.name}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                    {coin.logo}
                  </div>
                </div>
                <p className="text-white font-bold text-sm mb-1">
                  ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                  <MiniSparkline data={coin.sparkline} positive={isPositive} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Trade Panel */}
      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
                      {selectedCoin.logo}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedCoin.symbol}/USDT</h3>
                      <p className="text-gray-400 text-sm">
                        ${selectedCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCoin(null)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                    Trade Amount (USDT)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-lg h-12 pr-16 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setTradeAmount(String(((user?.balance || 0) * pct) / 100))}
                          className="text-[9px] text-gray-500 hover:text-blue-400 font-medium leading-none"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5">
                    Available: <span className="text-gray-300">${user?.balance?.toFixed(2) || '0.00'}</span>
                  </p>
                </div>

                {/* Duration Buttons */}
                <div className="mb-5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedDuration === dur
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                      >
                        <Clock size={14} className="inline mr-1 -mt-0.5" />
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potential Payout */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Potential Payout</span>
                    <span className="text-emerald-400 font-bold text-xl">${potentialPayout}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Payout ratio: {((payoutMultipliers[selectedDuration] - 1) * 100).toFixed(0)}%
                  </p>
                </div>

                {/* Up / Down Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlaceTrade('Up')}
                    disabled={isPlacing || !tradeAmount || parseFloat(tradeAmount) <= 0}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                  >
                    {isPlacing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <TrendingUp size={20} />
                    )}
                    Up (Buy)
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlaceTrade('Down')}
                    disabled={isPlacing || !tradeAmount || parseFloat(tradeAmount) <= 0}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
                  >
                    {isPlacing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <TrendingDown size={20} />
                    )}
                    Down (Sell)
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Trades */}
      {mockActiveTrades.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Active Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Pair</th>
                      <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Amount</th>
                      <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Entry</th>
                      <th className="text-center text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Duration</th>
                      <th className="text-center text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Time Left</th>
                      <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockActiveTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white font-medium">{trade.pair}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${trade.type === 'Up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trade.type === 'Up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">${trade.amount}</td>
                        <td className="px-4 py-3 text-right text-gray-300">${trade.entryPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{trade.duration}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-amber-400 font-mono font-medium">{trade.timeLeft}s</span>
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">${trade.payout.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}