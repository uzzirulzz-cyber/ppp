'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ArrowUpCircle,
} from 'lucide-react';

interface Withdrawal {
  id: string;
  user: string;
  uid: string;
  amount: number;
  method: string;
  wallet: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const withdrawals: Withdrawal[] = [
  { id: 'W001', user: 'alex_trader', uid: 'USR-001247', amount: 3500.0, method: 'USDT (TRC20)', wallet: 'TJxR4...8mKq', date: '2025-01-15 16:10', status: 'pending' },
  { id: 'W002', user: 'sarah_crypto', uid: 'USR-001246', amount: 8000.0, method: 'USDT (ERC20)', wallet: '0x7b2c...e9f4', date: '2025-01-15 15:42', status: 'pending' },
  { id: 'W003', user: 'rachel_s', uid: 'USR-001237', amount: 1200.0, method: 'BTC', wallet: 'bc1q...7nxp', date: '2025-01-15 14:20', status: 'pending' },
  { id: 'W004', user: 'anna_p', uid: 'USR-001239', amount: 4200.0, method: 'Bank Transfer', wallet: '**** **** 4521', date: '2025-01-15 12:55', status: 'pending' },
  { id: 'W005', user: 'mike_r', uid: 'USR-001245', amount: 15000.0, method: 'USDT (TRC20)', wallet: 'TKpLm...3rNw', date: '2025-01-14 20:30', status: 'approved' },
  { id: 'W006', user: 'emma_w', uid: 'USR-001243', amount: 950.0, method: 'ETH', wallet: '0x4a8e...c1d7', date: '2025-01-14 18:15', status: 'approved' },
  { id: 'W007', user: 'lisa_m', uid: 'USR-001241', amount: 22000.0, method: 'Bank Transfer', wallet: '**** **** 8837', date: '2025-01-14 15:40', status: 'approved' },
  { id: 'W008', user: 'tom_h', uid: 'USR-001240', amount: 500.0, method: 'USDT (TRC20)', wallet: 'TRfWm...6kJp', date: '2025-01-14 13:20', status: 'rejected' },
  { id: 'W009', user: 'james_l', uid: 'USR-001236', amount: 300.0, method: 'BTC', wallet: 'bc1q...2kqr', date: '2025-01-13 22:10', status: 'rejected' },
  { id: 'W010', user: 'chris_b', uid: 'USR-001238', amount: 6800.0, method: 'USDT (ERC20)', wallet: '0x9d1f...a3b5', date: '2025-01-13 19:45', status: 'approved' },
];

type Tab = 'pending' | 'approved' | 'rejected';

const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Pending', count: withdrawals.filter((w) => w.status === 'pending').length, icon: Clock },
  { key: 'approved', label: 'Approved', count: withdrawals.filter((w) => w.status === 'approved').length, icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', count: withdrawals.filter((w) => w.status === 'rejected').length, icon: XCircle },
];

const statusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-400">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export default function WithdrawalManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');

  const filteredWithdrawals = useMemo(() => {
    return withdrawals
      .filter((w) => w.status === activeTab)
      .filter(
        (w) =>
          search === '' ||
          w.user.toLowerCase().includes(search.toLowerCase()) ||
          w.wallet.toLowerCase().includes(search.toLowerCase()) ||
          w.uid.toLowerCase().includes(search.toLowerCase())
      );
  }, [activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
        <p className="text-sm text-gray-400 mt-1">Review and process user withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400/70">
                Pending Amount
              </p>
              <p className="text-xl font-bold text-white mt-1">
                ${withdrawals.filter((w) => w.status === 'pending').reduce((a, w) => a + w.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/15">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {withdrawals.filter((w) => w.status === 'pending').length} requests awaiting review
          </p>
        </div>
        <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-green-400/70">
                Approved Today
              </p>
              <p className="text-xl font-bold text-white mt-1">
                ${withdrawals.filter((w) => w.status === 'approved').reduce((a, w) => a + w.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {withdrawals.filter((w) => w.status === 'approved').length} withdrawals processed
          </p>
        </div>
        <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400/70">
                Rejected
              </p>
              <p className="text-xl font-bold text-white mt-1">
                ${withdrawals.filter((w) => w.status === 'rejected').reduce((a, w) => a + w.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {withdrawals.filter((w) => w.status === 'rejected').length} withdrawals returned
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="withdrawalTab"
                    className="absolute inset-0 rounded-lg bg-blue-500/15 ring-1 ring-blue-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === tab.key ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or wallet..."
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  User
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                  Method
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">
                  Wallet / Bank
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredWithdrawals.map((withdrawal, index) => (
                  <motion.tr
                    key={withdrawal.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-white text-sm">{withdrawal.user}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{withdrawal.uid}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono font-semibold text-white">
                        ${withdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 text-xs hidden sm:table-cell">
                      {withdrawal.method}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono text-gray-400">{withdrawal.wallet}</code>
                        <button className="text-gray-500 hover:text-blue-400 transition-colors">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      {withdrawal.date}
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(withdrawal.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {withdrawal.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-500/15 px-3 py-1.5 text-[11px] font-semibold text-green-400 ring-1 ring-green-500/20 hover:bg-green-500/25 transition-colors"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-[11px] font-semibold text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/25 transition-colors"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </motion.button>
                        </div>
                      )}
                      {withdrawal.status !== 'pending' && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredWithdrawals.length === 0 && (
          <div className="py-12 text-center">
            <ArrowUpCircle className="mx-auto h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No {activeTab} withdrawals found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}