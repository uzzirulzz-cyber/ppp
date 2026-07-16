'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Globe,
  Hash,
  Shield,
  ShieldCheck,
  Calendar,
  Edit3,
  Save,
  X,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const roleBadgeMap: Record<string, { label: string; className: string }> = {
  user: { label: 'Trader', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  sub_agent: { label: 'Agent', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  super_admin: { label: 'Admin', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [twoFactor, setTwoFactor] = useState(user?.twoFactor || false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleSaveProfile = () => {
    // In production, this would call an API
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditUsername(user?.username || '');
    setEditPhone(user?.phone || '');
    setIsEditing(false);
  };

  const infoItems = [
    { icon: User, label: 'Username', value: user?.username || '—' },
    { icon: Mail, label: 'Email', value: user?.email || '—' },
    { icon: Hash, label: 'UID', value: user?.uid || '—' },
    { icon: Phone, label: 'Phone', value: user?.phone || 'Not set' },
    { icon: Globe, label: 'Country', value: user?.country || 'Not set' },
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your account settings and security.</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-blue-500/20 relative" />
          <CardContent className="p-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-white/10 border-4 border-[#0a0e17] flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <div
                      style={{ backgroundImage: `url(${user.avatar})` }}
                      className="w-full h-full bg-cover bg-center"
                      role="img"
                      aria-label={user.username}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </button>
              </div>

              {/* Name & Role */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-white text-xl font-bold truncate">
                    {user?.username || 'User'}
                  </h2>
                  {user?.role && (
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 ${roleBadgeMap[user.role]?.className || 'bg-white/5 text-gray-400 border-white/10'}`}
                    >
                      {roleBadgeMap[user.role]?.label || user.role}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
              </div>

              {/* Edit Button */}
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-all"
                  >
                    <Save size={16} />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition-all"
                  >
                    <X size={16} />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="p-2 rounded-lg bg-white/5">
                      <Icon size={16} className="text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className="text-white text-sm font-medium truncate">
                        {item.label === 'Username' && isEditing ? (
                          <Input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="h-7 text-sm bg-white/5 border-white/10 text-white focus-visible:border-blue-500/50 mt-0.5"
                          />
                        ) : item.label === 'Phone' && isEditing ? (
                          <Input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="h-7 text-sm bg-white/5 border-white/10 text-white focus-visible:border-blue-500/50 mt-0.5"
                          />
                        ) : (
                          item.value
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Security Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-400" />
                <CardTitle className="text-white text-base font-semibold">
                  Security
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500 text-xs">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Password</p>
                    <p className="text-gray-500 text-xs">Change your account password</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPasswordDialog(true)}
                  className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all"
                >
                  Change
                </motion.button>
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${twoFactor ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                    <Smartphone size={18} className={twoFactor ? 'text-emerald-400' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
                    <p className={`text-xs ${twoFactor ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {twoFactor ? 'Enabled — Extra security active' : 'Disabled — Enable for better security'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    twoFactor ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{ x: twoFactor ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              {/* Security Tips */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-blue-400" />
                  <p className="text-blue-400 text-xs font-semibold">Security Recommendations</p>
                </div>
                <ul className="space-y-1.5">
                  {[
                    'Enable 2FA for maximum account protection',
                    'Use a strong, unique password',
                    'Never share your credentials with anyone',
                  ].map((tip) => (
                    <li key={tip} className="text-gray-400 text-xs flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                <CardTitle className="text-white text-base font-semibold">
                  Account
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500 text-xs">
                Your account information and status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${user?.emailVerified ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    <Mail size={18} className={user?.emailVerified ? 'text-emerald-400' : 'text-amber-400'} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Email Verification</p>
                    <p className={`text-xs ${user?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {user?.emailVerified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>
                {user?.emailVerified ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-0.5">
                    <CheckCircle2 size={12} className="mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} />
                    Verify
                  </motion.button>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Member Since</p>
                    <p className="text-gray-500 text-xs">Your account creation date</p>
                  </div>
                </div>
                <span className="text-gray-300 text-sm font-medium">January 1, 2024</span>
              </div>

              {/* Account Level */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10">
                    <Hash size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Account UID</p>
                    <p className="text-gray-500 text-xs">Your unique identifier</p>
                  </div>
                </div>
                <span className="text-gray-300 text-sm font-mono">{user?.uid || '—'}</span>
              </div>

              {/* Referral Code */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10">
                    <User size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Referral Code</p>
                    <p className="text-gray-500 text-xs">Share to earn rewards</p>
                  </div>
                </div>
                <span className="text-white text-sm font-mono font-bold tracking-wider">
                  {user?.referralCode || '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Change Password Dialog */}
      {showPasswordDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPasswordDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Change Password</h3>
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-xs mb-1.5">Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="bg-white/5 border-white/10 text-white h-11 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1.5">New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="bg-white/5 border-white/10 text-white h-11 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1.5">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-white/5 border-white/10 text-white h-11 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 mt-2"
                onClick={() => setShowPasswordDialog(false)}
              >
                Update Password
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}