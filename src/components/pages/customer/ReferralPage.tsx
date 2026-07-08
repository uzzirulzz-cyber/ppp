'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Users,
  UserCheck,
  DollarSign,
  Share2,
  Gift,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockReferredUsers = [
  { id: '1', username: 'alex_trader', joinDate: '2024-01-10', status: 'active', earned: 45.00 },
  { id: '2', username: 'crypto_sam', joinDate: '2024-01-08', status: 'active', earned: 30.00 },
  { id: '3', username: 'blockchain_bob', joinDate: '2024-01-05', status: 'active', earned: 62.50 },
  { id: '4', username: 'defi_dana', joinDate: '2024-01-03', status: 'inactive', earned: 15.00 },
  { id: '5', username: 'hodl_henry', joinDate: '2023-12-28', status: 'active', earned: 88.00 },
  { id: '6', username: 'moon_mike', joinDate: '2023-12-20', status: 'active', earned: 120.00 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ReferralPage() {
  const { user } = useAppStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user?.referralCode || 'NEX8K2P';
  const referralLink = `https://nextrade.pro/ref/${referralCode}`;

  const totalReferrals = mockReferredUsers.length;
  const activeReferrals = mockReferredUsers.filter((u) => u.status === 'active').length;
  const totalEarned = mockReferredUsers.reduce((sum, u) => sum + u.earned, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join NexTrade Pro',
          text: `Join NexTrade Pro and start trading crypto! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const statCards = [
    {
      label: 'Total Referrals',
      value: totalReferrals,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Active Referrals',
      value: activeReferrals,
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Total Earned',
      value: `$${totalEarned.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Referral Program</h1>
        <p className="text-gray-400 mt-1 text-sm">Invite friends and earn rewards for every referral.</p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift size={20} className="text-blue-400" />
                  <h2 className="text-white font-bold text-lg">Your Referral Code</h2>
                </div>
                <p className="text-gray-400 text-sm max-w-md">
                  Share your unique referral code with friends. You&apos;ll earn 5% commission on every trade they make.
                </p>

                {/* Referral Code Display */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 font-mono text-white text-2xl font-bold tracking-widest">
                    {referralCode}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyCode}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      copiedCode
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {copiedCode ? <Check size={20} /> : <Copy size={20} />}
                  </motion.button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="flex-1 max-w-md space-y-3">
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block">
                  Referral Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-gray-300 text-sm truncate">
                    {referralLink}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyLink}
                    className={`p-2.5 rounded-lg border transition-all duration-200 shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
                >
                  <Share2 size={16} />
                  Share Link
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                    <Icon size={22} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Referred Users List */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Referred Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0d1117] z-10">
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      User
                    </th>
                    <th className="text-center text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Join Date
                    </th>
                    <th className="text-center text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider px-4 py-3">
                      Earned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockReferredUsers.map((refUser) => (
                    <tr
                      key={refUser.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                            {refUser.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{refUser.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
                          <Calendar size={12} />
                          {refUser.joinDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 ${
                            refUser.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}
                        >
                          {refUser.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                        ${refUser.earned.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}