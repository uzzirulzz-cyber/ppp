'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Snowflake,
  Gift,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'profit' | 'bonus' | 'referral';
  label: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'trade', label: 'BTC/USDT Trade Profit', amount: 245.80, date: '2025-06-23 15:30', status: 'completed' },
  { id: '2', type: 'deposit', label: 'USDT Deposit', amount: 5000.00, date: '2025-06-23 14:15', status: 'completed' },
  { id: '3', type: 'withdrawal', label: 'Bank Transfer Withdrawal', amount: -1200.00, date: '2025-06-23 12:00', status: 'pending' },
  { id: '4', type: 'profit', label: 'ETH/USDT Trade Profit', amount: 89.50, date: '2025-06-23 10:45', status: 'completed' },
  { id: '5', type: 'trade', label: 'SOL/USDT Trade Loss', amount: -150.00, date: '2025-06-22 22:30', status: 'completed' },
  { id: '6', type: 'bonus', label: 'Welcome Bonus', amount: 10.00, date: '2025-06-22 18:00', status: 'completed' },
  { id: '7', type: 'referral', label: 'Referral Commission', amount: 45.00, date: '2025-06-22 14:20', status: 'completed' },
  { id: '8', type: 'deposit', label: 'Credit Card Deposit', amount: 2500.00, date: '2025-06-22 09:00', status: 'processing' },
  { id: '9', type: 'withdrawal', label: 'USDT Withdrawal', amount: -800.00, date: '2025-06-21 16:45', status: 'completed' },
  { id: '10', type: 'trade', label: 'BNB/USDT Trade Profit', amount: 120.30, date: '2025-06-21 11:30', status: 'completed' },
  { id: '11', type: 'deposit', label: 'Bank Transfer Deposit', amount: 10000.00, date: '2025-06-20 13:00', status: 'failed' },
  { id: '12', type: 'profit', label: 'Daily Trading Profit', amount: 320.00, date: '2025-06-20 08:15', status: 'completed' },
];

const TYPE_CONFIG: Record<string, { color: string; letter: string }> = {
  deposit: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', letter: 'D' },
  withdrawal: { color: 'bg-red-500/20 text-red-400 border-red-500/30', letter: 'W' },
  trade: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', letter: 'T' },
  profit: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', letter: 'P' },
  bonus: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', letter: 'B' },
  referral: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', letter: 'R' },
};

const STATUS_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className: string }> = {
  completed: { variant: 'default', label: 'Completed', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' },
  pending: { variant: 'secondary', label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' },
  failed: { variant: 'destructive', label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' },
  processing: { variant: 'outline', label: 'Processing', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' },
};

const PER_PAGE = 5;

function filterByTab(tab: string): Transaction[] {
  switch (tab) {
    case 'deposits': return MOCK_TRANSACTIONS.filter((t) => t.type === 'deposit');
    case 'withdrawals': return MOCK_TRANSACTIONS.filter((t) => t.type === 'withdrawal');
    case 'trading': return MOCK_TRANSACTIONS.filter((t) => t.type === 'trade');
    case 'profit': return MOCK_TRANSACTIONS.filter((t) => t.type === 'profit');
    default: return MOCK_TRANSACTIONS;
  }
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const config = TYPE_CONFIG[tx.type];
  const status = STATUS_CONFIG[tx.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all duration-300 group"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-bold shrink-0 ${config.color}`}>
        {config.letter}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.label}</p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{tx.date}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} USDT
        </span>
        <Badge variant={status.variant} className={`text-[10px] px-2 py-0 h-5 ${status.className}`}>
          {status.label}
        </Badge>
      </div>
    </motion.div>
  );
}

function TransactionList({ tab, page, setPage }: { tab: string; page: number; setPage: (p: (prev: number) => number) => void }) {
  const allFiltered = filterByTab(tab);
  const filtered = allFiltered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(allFiltered.length / PER_PAGE);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filtered.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </AnimatePresence>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No transactions found</p>
        </div>
      )}
      {allFiltered.length > PER_PAGE && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, allFiltered.length)} of {allFiltered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-blue-500/20 text-muted-foreground hover:text-white hover:bg-blue-500/10"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {pages}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-blue-500/20 text-muted-foreground hover:text-white hover:bg-blue-500/10"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletCenter() {
  const { user, navigate } = useAppStore();
  const [page, setPage] = useState(1);

  const totalBalance = user ? user.balance + user.frozenBalance + user.bonusBalance : 0;
  const referralEarnings = 45.00;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Wallet Center</h1>
          <p className="text-xs text-muted-foreground">Manage your assets and transactions</p>
        </div>
      </div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card neon-glow-blue rounded-2xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold text-white text-glow-blue">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm text-muted-foreground">USDT</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">+${user?.todayProfit?.toFixed(2) || '0.00'} today</span>
        </div>
      </motion.div>

      {/* Sub-balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-muted-foreground">Frozen</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${user?.frozenBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">Bonus</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${user?.bonusBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Referral</span>
          </div>
          <p className="text-lg font-bold text-white">${referralEarnings.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-3 gap-3"
      >
        <Button
          onClick={() => navigate('deposit')}
          className="gradient-green neon-glow-green h-12 text-white font-semibold hover:opacity-90 transition-all duration-300 rounded-xl"
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" />
          Deposit
        </Button>
        <Button
          onClick={() => navigate('withdraw')}
          className="gradient-red neon-glow-red h-12 text-white font-semibold hover:opacity-90 transition-all duration-300 rounded-xl"
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
        <Button
          className="gradient-blue neon-glow-blue h-12 text-white font-semibold hover:opacity-90 transition-all duration-300 rounded-xl"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Transfer
        </Button>
      </motion.div>

      {/* Transaction Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-4 md:p-6"
      >
        <Tabs defaultValue="all" onValueChange={() => setPage(1)}>
          <TabsList className="bg-crypto-navy/50 border border-blue-500/10 w-full overflow-x-auto crypto-scrollbar">
            <TabsTrigger value="all" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">All</TabsTrigger>
            <TabsTrigger value="deposits" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Withdrawals</TabsTrigger>
            <TabsTrigger value="trading" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Trading</TabsTrigger>
            <TabsTrigger value="profit" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Profit</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-0">
            <TabsContent value="all"><TransactionList tab="all" page={page} setPage={setPage} /></TabsContent>
            <TabsContent value="deposits"><TransactionList tab="deposits" page={page} setPage={setPage} /></TabsContent>
            <TabsContent value="withdrawals"><TransactionList tab="withdrawals" page={page} setPage={setPage} /></TabsContent>
            <TabsContent value="trading"><TransactionList tab="trading" page={page} setPage={setPage} /></TabsContent>
            <TabsContent value="profit"><TransactionList tab="profit" page={page} setPage={setPage} /></TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}