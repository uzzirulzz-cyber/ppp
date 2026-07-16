'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  Lock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  ArrowLeftRight,
  Copy,
  Check,
} from 'lucide-react';
import { useAppStore, type TradeData } from '@/lib/store';
import { MOCK_COINS, MOCK_USER } from '@/lib/mock-data';
import PriceChart from './PriceChart';
import PopularCoins from './PopularCoins';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* Generate mock recent trades for the demo */
function generateMockTrades(): TradeData[] {
  const statuses: Array<TradeData['status']> = ['won', 'won', 'lost', 'running', 'pending'];
  const directions: Array<'up' | 'down'> = ['up', 'down'];
  const coins = MOCK_COINS.slice(0, 5);
  const now = Date.now();

  return coins.map((coin, i) => ({
    id: `mock-trade-${i + 1}`,
    coinSymbol: coin.symbol,
    coinName: coin.name,
    pair: coin.pair,
    direction: directions[i % 2],
    amount: [50, 100, 200, 150, 75][i],
    entryPrice: coin.price,
    exitPrice: statuses[i] === 'won' || statuses[i] === 'lost' ? coin.price * (directions[i % 2] === 'up' ? 1.012 : 0.988) : null,
    duration: [30, 60, 120, 60, 30][i],
    status: statuses[i],
    profit: statuses[i] === 'won' ? [9.5, 18.0, -200, 0, 0][i] : statuses[i] === 'lost' ? [-100, 0, -200, 0, 0][i] : 0,
    payout: statuses[i] === 'won' ? [109.5, 218.0, 0, 0, 0][i] : 0,
    startedAt: new Date(now - (i + 1) * 3600000),
    closedAt: statuses[i] === 'won' || statuses[i] === 'lost' ? new Date(now - (i + 1) * 3600000 + [30, 60, 120, 0, 0][i] * 1000) : null,
  }));
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'gold' | 'red' | 'purple';
  index: number;
}

function StatCard({ icon, label, value, accent, index }: StatCardProps) {
  const accentMap = {
    blue: { bg: 'from-blue-500/20 to-blue-600/10', iconBg: 'gradient-blue', glow: 'neon-glow-blue' },
    green: { bg: 'from-emerald-500/20 to-emerald-600/10', iconBg: 'gradient-green', glow: 'neon-glow-green' },
    gold: { bg: 'from-amber-500/20 to-amber-600/10', iconBg: 'gradient-gold', glow: '' },
    red: { bg: 'from-red-500/20 to-red-600/10', iconBg: 'gradient-red', glow: '' },
    purple: { bg: 'from-purple-500/20 to-purple-600/10', iconBg: 'gradient-purple', glow: '' },
  };

  const c = accentMap[accent];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -2 }}
      className="glass-card rounded-xl p-4 group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0 shadow-lg`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
          <p className="text-lg font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  gradient: string;
  hoverShadow: string;
  onClick: () => void;
}

function ActionButton({ icon, label, gradient, hoverShadow, onClick }: ActionButtonProps) {
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.04, boxShadow: hoverShadow }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2.5 w-full py-4 rounded-xl ${gradient} text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  DashboardPage                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const recentTrades = useAppStore((s) => s.recentTrades);
  const setCoins = useAppStore((s) => s.setCoins);
  const login = useAppStore((s) => s.login);
  const addTrade = useAppStore((s) => s.addTrade);

  const [copied, setCopied] = useState(false);

  /* Ensure the store has coins & user for demo purposes */
  useEffect(() => {
    if (useAppStore.getState().coins.length === 0) {
      setCoins(MOCK_COINS);
    }
    if (!useAppStore.getState().user) {
      login(MOCK_USER);
    }
  }, [setCoins, login]);

  /* Seed some demo trades if none exist */
  useEffect(() => {
    if (recentTrades.length === 0) {
      generateMockTrades().forEach((t) => addTrade(t));
    }
    // Only run on mount
  }, []);

  const displayTrades = useMemo(() => {
    return useAppStore.getState().recentTrades.slice(0, 5);
  }, [recentTrades]);

  const handleCopyUid = useCallback(() => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [user?.uid]);

  if (!user) return null;

  const totalBalance = user.balance + user.frozenBalance + user.bonusBalance;

  const statCards: StatCardProps[] = [
    { icon: <Wallet className="w-5 h-5 text-white" />, label: 'Total Balance', value: currencyFmt.format(totalBalance), accent: 'blue', index: 0 },
    { icon: <CreditCard className="w-5 h-5 text-white" />, label: 'Available Balance', value: currencyFmt.format(user.balance), accent: 'green', index: 1 },
    { icon: <Lock className="w-5 h-5 text-white" />, label: 'Frozen Balance', value: currencyFmt.format(user.frozenBalance), accent: 'gold', index: 2 },
    { icon: <TrendingUp className="w-5 h-5 text-white" />, label: 'Total Profit', value: currencyFmt.format(user.totalProfit), accent: 'green', index: 3 },
    { icon: <ArrowUpRight className="w-5 h-5 text-white" />, label: "Today's Profit", value: currencyFmt.format(user.todayProfit), accent: 'green', index: 4 },
    { icon: <ArrowDownRight className="w-5 h-5 text-white" />, label: "Today's Loss", value: currencyFmt.format(user.todayLoss), accent: 'red', index: 5 },
    { icon: <Activity className="w-5 h-5 text-white" />, label: 'Active Trades', value: String(user.activeTrades), accent: 'blue', index: 6 },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, label: 'Completed Trades', value: String(user.completedTrades), accent: 'purple', index: 7 },
  ];

  const statusBadge = (status: TradeData['status']) => {
    const map: Record<TradeData['status'], { text: string; cls: string }> = {
      won: { text: 'Won', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      lost: { text: 'Lost', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
      running: { text: 'Running', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      pending: { text: 'Pending', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    };
    const s = map[status];
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${s.cls}`}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* -------- Stat Cards -------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </motion.div>

      {/* -------- Action Buttons -------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <ActionButton
          icon={<PlusCircle className="w-5 h-5" />}
          label="Recharge"
          gradient="gradient-green"
          hoverShadow="0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)"
          onClick={() => navigate('deposit')}
        />
        <ActionButton
          icon={<MinusCircle className="w-5 h-5" />}
          label="Withdraw"
          gradient="gradient-red"
          hoverShadow="0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)"
          onClick={() => navigate('withdraw')}
        />
        <ActionButton
          icon={<TrendingUp className="w-5 h-5" />}
          label="Trade"
          gradient="gradient-blue"
          hoverShadow="0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)"
          onClick={() => navigate('trade')}
        />
        <ActionButton
          icon={<ArrowLeftRight className="w-5 h-5" />}
          label="Transaction History"
          gradient="gradient-purple"
          hoverShadow="0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)"
          onClick={() => navigate('transaction-history')}
        />
      </motion.div>

      {/* -------- UID Card -------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Your UID</p>
            <p className="text-sm font-mono font-bold text-white tracking-wider">{user.uid}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyUid}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.div>

      {/* -------- Market Chart -------- */}
      <PriceChart />

      {/* -------- Recent Trades -------- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="glass-card rounded-xl p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Recent Trades</h2>
              <p className="text-xs text-muted-foreground">Your latest trading activity</p>
            </div>
          </div>
          <button
            onClick={() => navigate('trading-history')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
          >
            View All →
          </button>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block overflow-x-auto crypto-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Coin</th>
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Direction</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pr-4">Amount</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pr-4">Profit</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayTrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                    No recent trades yet
                  </td>
                </tr>
              ) : (
                displayTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{trade.coinSymbol}</span>
                        <span className="text-xs text-muted-foreground">{trade.pair}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                          trade.direction === 'up'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-red-400 bg-red-500/10'
                        }`}
                      >
                        {trade.direction === 'up' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-medium text-white">
                      {currencyFmt.format(trade.amount)}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        trade.profit > 0 ? 'text-emerald-400' : trade.profit < 0 ? 'text-red-400' : 'text-muted-foreground'
                      }`}
                    >
                      {trade.profit > 0 ? '+' : ''}
                      {currencyFmt.format(trade.profit)}
                    </td>
                    <td className="py-3 text-right">{statusBadge(trade.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden space-y-3 max-h-96 overflow-y-auto crypto-scrollbar">
          {displayTrades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No recent trades yet</p>
          ) : (
            displayTrades.map((trade) => (
              <div key={trade.id} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{trade.coinSymbol}</span>
                    <span className="text-[10px] text-muted-foreground">{trade.pair}</span>
                  </div>
                  {statusBadge(trade.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                      trade.direction === 'up'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}
                  >
                    {trade.direction === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {trade.direction.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{currencyFmt.format(trade.amount)}</p>
                    <p
                      className={`text-xs font-semibold ${
                        trade.profit > 0 ? 'text-emerald-400' : trade.profit < 0 ? 'text-red-400' : 'text-muted-foreground'
                      }`}
                    >
                      {trade.profit > 0 ? '+' : ''}{currencyFmt.format(trade.profit)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.section>

      {/* -------- Popular Coins -------- */}
      <PopularCoins />
    </div>
  );
}