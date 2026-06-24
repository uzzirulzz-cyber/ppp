'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Bitcoin,
  CircleDollarSign,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

type WalletTab = 'spot' | 'futures' | 'earn';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRADE';
  currency: string;
  amount: string;
  isIn: boolean;
  status: 'Completed' | 'Pending' | 'Failed' | 'Processing';
  date: string;
  txId: string;
}

const tabs: { key: WalletTab; label: string }[] = [
  { key: 'spot', label: 'Spot' },
  { key: 'futures', label: 'Futures' },
  { key: 'earn', label: 'Earn' },
];

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'DEPOSIT',
    currency: 'USDT',
    amount: '5,000.00',
    isIn: true,
    status: 'Completed',
    date: '2025-01-15 14:32',
    txId: '0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
  },
  {
    id: '2',
    type: 'TRADE',
    currency: 'BTC',
    amount: '0.1500',
    isIn: false,
    status: 'Completed',
    date: '2025-01-15 11:18',
    txId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  },
  {
    id: '3',
    type: 'WITHDRAW',
    currency: 'ETH',
    amount: '2.5000',
    isIn: false,
    status: 'Processing',
    date: '2025-01-14 22:05',
    txId: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d',
  },
  {
    id: '4',
    type: 'DEPOSIT',
    currency: 'USDT',
    amount: '10,000.00',
    isIn: true,
    status: 'Completed',
    date: '2025-01-14 09:45',
    txId: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
  },
  {
    id: '5',
    type: 'TRADE',
    currency: 'SOL',
    amount: '50.0000',
    isIn: true,
    status: 'Completed',
    date: '2025-01-13 16:22',
    txId: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  },
  {
    id: '6',
    type: 'WITHDRAW',
    currency: 'USDT',
    amount: '2,500.00',
    isIn: false,
    status: 'Completed',
    date: '2025-01-13 08:10',
    txId: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
  },
  {
    id: '7',
    type: 'DEPOSIT',
    currency: 'BTC',
    amount: '0.5000',
    isIn: true,
    status: 'Pending',
    date: '2025-01-12 20:55',
    txId: '0xb6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
  },
  {
    id: '8',
    type: 'TRADE',
    currency: 'ETH',
    amount: '5.0000',
    isIn: false,
    status: 'Failed',
    date: '2025-01-12 13:40',
    txId: '0xd8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return 'badge-green';
    case 'Pending':
    case 'Processing':
      return 'badge-amber';
    case 'Failed':
      return 'badge-red';
    default:
      return 'badge-blue';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'DEPOSIT':
      return <ArrowDownLeft size={16} style={{ color: 'var(--accent-green)' }} />;
    case 'WITHDRAW':
      return <ArrowUpRight size={16} style={{ color: 'var(--accent-red)' }} />;
    case 'TRADE':
      return <Wallet size={16} style={{ color: 'var(--accent-blue)' }} />;
    default:
      return null;
  }
}

function truncateTxId(txId: string) {
  return `${txId.slice(0, 10)}...${txId.slice(-8)}`;
}

const tabContentVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function WalletPage() {
  const { navigate } = useStore();
  const [activeTab, setActiveTab] = useState<WalletTab>('spot');

  const totalBalance = 125680.45;

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      style={{ paddingBottom: 40 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Wallet
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage your assets and transactions
          </p>
        </div>
        <div className="glass-card px-5 py-3">
          <span
            className="text-xs font-medium block"
            style={{ color: 'var(--text-muted)' }}
          >
            Total Balance
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          width: 'fit-content',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-5 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              color:
                activeTab === tab.key
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
              background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="wallet-tab-indicator"
                className="absolute inset-0 rounded-md"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Balance Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* USDT */}
            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,
                    background: 'rgba(34, 197, 94, 0.15)',
                  }}
                >
                  <CircleDollarSign size={22} style={{ color: '#22c55e' }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  USDT
                </span>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                45,230.50
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                ≈ $45,230.50
              </div>
            </motion.div>

            {/* BTC */}
            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,
                    background: 'rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <Bitcoin size={22} style={{ color: '#f59e0b' }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  BTC
                </span>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                1.2845
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                ≈ $86,400.12
              </div>
            </motion.div>

            {/* ETH */}
            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,
                    background: 'rgba(99, 102, 241, 0.15)',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    <path d="M12 6L6 12l6 6 6-6-6-6z" />
                  </svg>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ETH
                </span>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                3.7420
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                ≈ $12,940.18
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(Pages.DEPOSIT)}
            >
              <ArrowDownLeft size={16} />
              Deposit
            </motion.button>
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(Pages.WITHDRAW)}
            >
              <ArrowUpRight size={16} />
              Withdraw
            </motion.button>
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeftRight size={16} />
              Transfer
            </motion.button>
          </div>

          {/* Transaction History Table */}
          <div className="glass-card">
            <div className="flex items-center justify-between p-4 pb-0">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Transaction History
              </h2>
              <button
                className="text-sm font-medium hover:underline"
                style={{
                  color: 'var(--accent-blue)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(Pages.TRANSACTIONS)}
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>TX ID</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {tx.currency}
                      </td>
                      <td>
                        <span
                          className={`font-semibold ${
                            tx.isIn ? 'text-green' : 'text-red'
                          }`}
                        >
                          {tx.isIn ? '+' : '-'}{tx.amount}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                      <td
                        style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          fontSize: 13,
                        }}
                      >
                        {truncateTxId(tx.txId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}