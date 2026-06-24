'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  UserCheck,
  Copy,
  Check,
  Crown,
  Medal,
  Award,
  Link2,
  Gift,
} from 'lucide-react';

const referralCode = 'NEX-USER-ABC123';
const referralLink = 'https://nextrade.pro/ref/NEX-USER-ABC123';

const tiers = [
  {
    name: 'Bronze',
    range: '1–10 referrals',
    commission: '5%',
    color: '#cd7f32',
    bgColor: 'rgba(205, 127, 50, 0.1)',
    borderColor: 'rgba(205, 127, 50, 0.3)',
    icon: Medal,
    min: 1,
    max: 10,
  },
  {
    name: 'Silver',
    range: '11–50 referrals',
    commission: '8%',
    color: '#c0c0c0',
    bgColor: 'rgba(192, 192, 192, 0.1)',
    borderColor: 'rgba(192, 192, 192, 0.3)',
    icon: Award,
    min: 11,
    max: 50,
    current: true,
  },
  {
    name: 'Gold',
    range: '50+ referrals',
    commission: '12%',
    color: '#ffd700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    icon: Crown,
    min: 51,
    max: Infinity,
  },
];

const referralHistory = [
  { user: 'alex_trader_99', date: '2025-01-15', active: true, commission: '$45.20' },
  { user: 'sarah_crypto', date: '2025-01-14', active: true, commission: '$32.80' },
  { user: 'mike_waves', date: '2025-01-12', active: true, commission: '$18.50' },
  { user: 'emma_defi', date: '2025-01-10', active: false, commission: '$0.00' },
  { user: 'james_hodl', date: '2025-01-08', active: true, commission: '$67.30' },
  { user: 'luna_moon', date: '2025-01-06', active: true, commission: '$22.10' },
  { user: 'chad_trader', date: '2025-01-04', active: false, commission: '$0.00' },
  { user: 'noah_bits', date: '2025-01-02', active: true, commission: '$48.66' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ReferralPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentTierIndex = 1; // Silver

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
        <h1 className="text-2xl font-bold gradient-text">Referral Program</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Invite friends and earn commission on their trades
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Total Referrals
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(59, 130, 246, 0.15)',
              }}
            >
              <Users size={20} style={{ color: 'var(--accent-blue)' }} />
            </div>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            24
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            All time
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Total Commission Earned
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(34, 197, 94, 0.15)',
              }}
            >
              <DollarSign size={20} style={{ color: 'var(--accent-green)' }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-green">$1,234.56</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Lifetime earnings
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Active Referrals
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(139, 92, 246, 0.15)',
              }}
            >
              <UserCheck size={20} style={{ color: 'var(--accent-purple)' }} />
            </div>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            18
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Currently trading
          </div>
        </motion.div>
      </div>

      {/* Referral Code & Link */}
      <motion.div
        className="glass-card p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Code */}
          <div>
            <label
              className="text-sm font-medium flex items-center gap-2 mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Gift size={16} style={{ color: 'var(--accent-purple)' }} />
              Your Referral Code
            </label>
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-lg"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span
                className="text-lg font-bold tracking-wider"
                style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}
              >
                {referralCode}
              </span>
              <motion.button
                className="btn-secondary flex items-center gap-2 shrink-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyCode}
              >
                {copiedCode ? (
                  <>
                    <Check size={14} style={{ color: 'var(--accent-green)' }} />
                    <span className="text-green">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label
              className="text-sm font-medium flex items-center gap-2 mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Link2 size={16} style={{ color: 'var(--accent-cyan)' }} />
              Your Referral Link
            </label>
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-lg"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span
                className="text-sm truncate"
                style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}
              >
                {referralLink}
              </span>
              <motion.button
                className="btn-secondary flex items-center gap-2 shrink-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
              >
                {copiedLink ? (
                  <>
                    <Check size={14} style={{ color: 'var(--accent-green)' }} />
                    <span className="text-green">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referral Tiers */}
      <motion.div variants={itemVariants}>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Referral Tiers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            const isCurrent = i === currentTierIndex;
            return (
              <motion.div
                key={tier.name}
                className="stat-card relative overflow-hidden"
                style={{
                  borderColor: isCurrent ? tier.color : undefined,
                  boxShadow: isCurrent
                    ? `0 0 20px ${tier.color}30, 0 0 40px ${tier.color}15`
                    : undefined,
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {isCurrent && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold"
                    style={{
                      background: `${tier.color}25`,
                      color: tier.color,
                    }}
                  >
                    Current
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 42,
                      height: 42,
                      background: tier.bgColor,
                    }}
                  >
                    <Icon size={22} style={{ color: tier.color }} />
                  </div>
                  <div>
                    <p
                      className="text-base font-bold"
                      style={{ color: tier.color }}
                    >
                      {tier.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {tier.range}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {tier.commission}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    commission
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral History Table */}
      <motion.div className="glass-card" variants={itemVariants}>
        <div className="p-4 pb-0">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Referral History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referred User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {referralHistory.map((ref, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 28,
                          height: 28,
                          background: 'var(--bg-primary)',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {ref.user.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {ref.user}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{ref.date}</td>
                  <td>
                    <span
                      className={`badge ${ref.active ? 'badge-green' : 'badge-red'}`}
                    >
                      {ref.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color:
                          ref.commission === '$0.00'
                            ? 'var(--text-muted)'
                            : 'var(--accent-green)',
                      }}
                    >
                      {ref.commission}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}