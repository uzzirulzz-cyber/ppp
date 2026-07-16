'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Lock,
  Gift,
  Copy,
  Check,
  QrCode,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const WALLET_ADDRESS = 'TJxR4f8mQbFNfPcisZrhfB8LpXvE3kD2yH';

const mockTransactions = [
  { id: '1', type: 'trade', description: 'BTC/USDT Trade - Won', amount: 85.50, status: 'completed', date: '2024-01-15 14:32' },
  { id: '2', type: 'deposit', description: 'USDT Deposit', amount: 500.00, status: 'completed', date: '2024-01-15 10:00' },
  { id: '3', type: 'trade', description: 'ETH/USDT Trade - Lost', amount: -50.00, status: 'completed', date: '2024-01-15 13:15' },
  { id: '4', type: 'withdraw', description: 'USDT Withdrawal', amount: -200.00, status: 'pending', date: '2024-01-15 09:20' },
  { id: '5', type: 'deposit', description: 'USDT Deposit', amount: 1000.00, status: 'completed', date: '2024-01-14 16:45' },
  { id: '6', type: 'trade', description: 'SOL/USDT Trade - Won', amount: 68.00, status: 'completed', date: '2024-01-14 11:20' },
  { id: '7', type: 'bonus', description: 'Referral Bonus', amount: 25.00, status: 'completed', date: '2024-01-14 08:00' },
  { id: '8', type: 'trade', description: 'BTC/USDT Trade - Won', amount: 170.00, status: 'completed', date: '2024-01-13 12:48' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Withdrawals', value: 'withdraw' },
  { label: 'Trades', value: 'trade' },
];

const typeIcons: Record<string, React.ElementType> = {
  deposit: ArrowDownToLine,
  withdraw: ArrowUpFromLine,
  trade: Wallet,
  bonus: Gift,
};

const typeColors: Record<string, string> = {
  deposit: 'text-emerald-400 bg-emerald-500/10',
  withdraw: 'text-amber-400 bg-amber-500/10',
  trade: 'text-blue-400 bg-blue-500/10',
  bonus: 'text-purple-400 bg-purple-500/10',
};

export default function WalletPage() {
  const { user } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('usdt_trc20');

  const filteredTransactions = activeFilter === 'all'
    ? mockTransactions
    : mockTransactions.filter((t) => t.type === activeFilter);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balanceCards = [
    {
      label: 'Available Balance',
      value: user?.balance || 0,
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Frozen Balance',
      value: user?.frozenBalance || 0,
      icon: Lock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Bonus Balance',
      value: user?.bonusBalance || 0,
      icon: Gift,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your funds, deposits, and withdrawals.</p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${card.bg} border ${card.border}`}>
                    <Icon size={22} className={card.color} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      {card.label}
                    </p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      ${card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Deposit & Withdraw */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deposit Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <ArrowDownToLine size={18} className="text-emerald-400" />
                Deposit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* QR Code Placeholder */}
              <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2">
                  <QrCode size={64} className="text-gray-300" />
                  <span className="text-gray-400 text-xs">Scan QR Code</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                  Wallet Address (USDT TRC20)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-gray-300 text-sm font-mono truncate">
                    {WALLET_ADDRESS}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className={`p-2.5 rounded-lg border transition-all duration-200 ${
                      copied
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-xs mt-1.5"
                  >
                    Address copied to clipboard!
                  </motion.p>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-xs leading-relaxed">
                  <strong>Note:</strong> Only send USDT (TRC20) to this address. Deposits may take 1-3 network confirmations. Minimum deposit: 10 USDT.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdraw Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <ArrowUpFromLine size={18} className="text-amber-400" />
                Withdraw
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                  Amount (USDT)
                </label>
                <Input
                  type="number"
                  placeholder="Enter withdrawal amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-11 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
                <p className="text-gray-500 text-xs mt-1.5">
                  Available: <span className="text-gray-300">${user?.balance?.toFixed(2) || '0.00'}</span>
                  <span className="ml-2">Min: $50.00</span>
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setWithdrawAmount(String(((user?.balance || 0) * pct) / 100))}
                    className="py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Withdraw Method */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                  Withdrawal Method
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setWithdrawMethod('usdt_trc20')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      withdrawMethod === 'usdt_trc20'
                        ? 'bg-blue-500/10 border-blue-500/30 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <ExternalLink size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium">USDT TRC20</p>
                      <p className="text-xs text-gray-500">Network fee: 1 USDT</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setWithdrawMethod('bank_transfer')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      withdrawMethod === 'bank_transfer'
                        ? 'bg-blue-500/10 border-blue-500/30 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <ExternalLink size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Processing: 1-3 business days</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Withdraw Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50}
              >
                Submit Withdrawal
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-white text-base font-semibold">
                Transaction History
              </CardTitle>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActiveFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      activeFilter === opt.value
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0d1117] z-10">
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Type
                    </th>
                    <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Description
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Amount
                    </th>
                    <th className="text-center text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => {
                    const Icon = typeIcons[tx.type] || Wallet;
                    const colorClass = typeColors[tx.type] || 'text-gray-400 bg-gray-500/10';
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className={`inline-flex p-1.5 rounded-lg ${colorClass}`}>
                            <Icon size={14} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{tx.description}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? (
                            <span className="flex items-center justify-end gap-1">
                              <ArrowUpRight size={14} />
                              +${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="flex items-center justify-end gap-1">
                              <ArrowDownRight size={14} />
                              -${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {tx.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{tx.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <Wallet size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-500 text-sm">No transactions found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}