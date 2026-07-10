'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

// ── Types ──────────────────────────────────────────────────────────────────

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionEarned: number;
  tier: string;
  commissionRate: number;
}

interface ReferralRecord {
  id: string;
  referredUser: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  };
  referralCode: string;
  level: number;
  totalCommission: number;
  isActive: boolean;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 20, rounded = 6 }: { width?: string | number; height?: number; rounded?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: rounded,
        background: 'linear-gradient(90deg, rgba(42,48,66,0.4) 25%, rgba(42,48,66,0.8) 50%, rgba(42,48,66,0.4) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={90} height={14} />
        <Skeleton width={40} height={40} rounded={10} />
      </div>
      <Skeleton width={140} height={28} />
      <Skeleton width={80} height={12} />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td><Skeleton width={120} height={14} /></td>
      <td><Skeleton width={140} height={14} /></td>
      <td><Skeleton width={80} height={14} /></td>
      <td><Skeleton width={60} height={14} /></td>
      <td><Skeleton width={70} height={20} rounded={10} /></td>
      <td><Skeleton width={90} height={14} /></td>
    </tr>
  );
}

// ── Variants ───────────────────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────

export default function ReferralPage() {
  const { token, user: storeUser } = useStore();

  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchReferralData = useCallback(async (currentToken: string) => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch('/api/referral', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch referral data');

      const data = await res.json();
      setReferralCode(data.referralCode || '');
      setReferralLink(data.referralLink || '');
      setStats(data.stats || null);
      setReferrals(data.referralHistory || []);
    } catch (err) {
      setError('Failed to load referral data.');
      console.error('Referral fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchReferralData(token);
    }
  }, [token, fetchReferralData]);

  const totalInvited = stats?.totalReferrals || 0;
  const activeTraders = stats?.activeReferrals || 0;
  const totalCommission = stats?.totalCommissionEarned || 0;
  const currentTier = stats?.tier || 'Bronze';

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

  // ── Render ──

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
        <p style={{ color: 'var(--accent-red)', fontSize: 16, marginBottom: 16 }}>{error}</p>
        <button
          onClick={() => token && fetchReferralData(token)}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

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

      {/* Agent Profile Card */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(245, 180, 0, 0.15)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--accent-gold)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {loading ? <Skeleton width={150} height={22} /> : (storeUser?.name || 'User')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {loading ? <Skeleton width={200} height={14} /> : (storeUser?.email || '')}
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-4 text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-1.5">
            <span style={{ color: 'var(--text-muted)' }}>Role:</span>
            <span className="badge badge-amber">{storeUser?.role || 'USER'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <span className="badge badge-green">{storeUser?.status || 'ACTIVE'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ color: 'var(--text-muted)' }}>Joined:</span>
            {loading ? <Skeleton width={100} height={14} /> : formatDate(storeUser?.createdAt)}
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Total Invited
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
                {totalInvited}
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
                  Active Traders
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
                {activeTraders}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Currently trading
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Total Commission
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
              <div className="text-2xl font-bold text-green">
                ${fmt(totalCommission)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Lifetime earnings
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Referral Code & Link */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
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
                {loading ? <Skeleton width={160} height={22} /> : (referralCode || '—')}
              </span>
              <motion.button
                className="btn-secondary flex items-center gap-2 shrink-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyCode}
                disabled={!referralCode}
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
                {loading ? <Skeleton width={300} height={14} /> : (referralLink || 'No referral link available')}
              </span>
              <motion.button
                className="btn-secondary flex items-center gap-2 shrink-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                disabled={!referralLink || referralLink.includes('undefined')}
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

      {/* Invited Users Table */}
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
                <th>Name</th>
                <th>Email</th>
                <th>Commission</th>
                <th>Level</th>
                <th>Status</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        No referrals yet. Share your referral code to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id}>
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
                          {(r.referredUser?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {r.referredUser?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {r.referredUser?.email || '—'}
                    </td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      ${fmt(r.totalCommission)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      L{r.level}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.isActive && r.referredUser?.status === 'ACTIVE' ? 'badge-green' : 'badge-red'
                        }`}
                      >
                        {r.isActive && r.referredUser?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}