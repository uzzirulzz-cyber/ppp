'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ArrowDownCircle,
} from 'lucide-react';

interface Deposit {
  id: string;
  user: string;
  uid: string;
  amount: number;
  method: string;
  txHash: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const deposits: Deposit[] = [
  { id: 'D001', user: 'alex_trader', uid: 'USR-001247', amount: 5000.0, method: 'USDT (TRC20)', txHash: '0x7a3b...f8e2', date: '2025-01-15 14:32', status: 'pending' },
  { id: 'D002', user: 'sarah_crypto', uid: 'USR-001246', amount: 12000.0, method: 'USDT (TRC20)', txHash: '0x9c1d...a3b7', date: '2025-01-15 13:18', status: 'pending' },
  { id: 'D003', user: 'emma_w', uid: 'USR-001243', amount: 2500.0, method: 'USDT (ERC20)', txHash: '0x2e8f...d4c1', date: '2025-01-15 11:45', status: 'pending' },
  { id: 'D004', user: 'tom_h', uid: 'USR-001240', amount: 800.0, method: 'BTC', txHash: 'bc1q...5kxm', date: '2025-01-15 10:22', status: 'pending' },
  { id: 'D005', user: 'anna_p', uid: 'USR-001239', amount: 7500.0, method: 'USDT (TRC20)', txHash: '0x4d6a...e9f3', date: '2025-01-15 09:15', status: 'approved' },
  { id: 'D006', user: 'rachel_s', uid: 'USR-001237', amount: 3200.0, method: 'ETH', txHash: '0x1b5c...7a2e', date: '2025-01-14 22:40', status: 'approved' },
  { id: 'D007', user: 'james_l', uid: 'USR-001236', amount: 150.0, method: 'USDT (TRC20)', txHash: '0x8f3e...c5b1', date: '2025-01-14 20:15', status: 'approved' },
  { id: 'D008', user: 'chris_b', uid: 'USR-001238', amount: 20000.0, method: 'USDT (TRC20)', txHash: '0x6a2d...f1c8', date: '2025-01-14 18:30', status: 'approved' },
  { id: 'D009', user: 'john_doe', uid: 'USR-001244', amount: 500.0, method: 'BTC', txHash: 'bc1q...9nwp', date: '2025-01-14 15:20', status: 'rejected' },
  { id: 'D010', user: 'david_k', uid: 'USR-001242', amount: 15000.0, method: 'USDT (ERC20)', txHash: '0x3c7e...b2d9', date: '2025-01-14 12:10', status: 'rejected' },
];

type Tab = 'pending' | 'approved' | 'rejected';

const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Pending', count: deposits.filter((d) => d.status === 'pending').length, icon: Clock },
  { key: 'approved', label: 'Approved', count: deposits.filter((d) => d.status === 'approved').length, icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', count: deposits.filter((d) => d.status === 'rejected').length, icon: XCircle },
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

export default function DepositManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');

  const filteredDeposits = useMemo(() => {
    return deposits
      .filter((d) => d.status === activeTab)
      .filter(
        (d) =>
          search === '' ||
          d.user.toLowerCase().includes(search.toLowerCase()) ||
          d.txHash.toLowerCase().includes(search.toLowerCase()) ||
          d.uid.toLowerCase().includes(search.toLowerCase())
      );
  }, [activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit Management</h1>
        <p className="text-sm text-gray-400 mt-1">Review and process user deposit requests</p>
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
                    layoutId="depositTab"
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
            placeholder="Search user or TX hash..."
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
                  TX Hash
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
                {filteredDeposits.map((deposit, index) => (
                  <motion.tr
                    key={deposit.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-white text-sm">{deposit.user}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{deposit.uid}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono font-semibold text-white">
                        ${deposit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 text-xs hidden sm:table-cell">
                      {deposit.method}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono text-gray-400">{deposit.txHash}</code>
                        <button className="text-gray-500 hover:text-blue-400 transition-colors">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      {deposit.date}
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(deposit.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {deposit.status === 'pending' && (
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
                      {deposit.status !== 'pending' && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredDeposits.length === 0 && (
          <div className="py-12 text-center">
            <ArrowDownCircle className="mx-auto h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No {activeTab} deposits found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}