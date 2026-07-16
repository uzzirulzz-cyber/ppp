'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Pencil,
  Copy,
  Check,
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Globe,
  Users,
  Share2,
  BadgeCheck,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';

const LOGIN_HISTORY = [
  { id: '1', device: 'Chrome on Windows', icon: <Monitor className="w-4 h-4" />, ip: '192.168.1.***', date: '2025-06-23 15:30', current: true },
  { id: '2', device: 'Safari on iPhone', icon: <Smartphone className="w-4 h-4" />, ip: '10.0.0.***', date: '2025-06-22 09:15', current: false },
  { id: '3', device: 'Firefox on MacOS', icon: <Monitor className="w-4 h-4" />, ip: '172.16.0.***', date: '2025-06-21 18:45', current: false },
  { id: '4', device: 'Chrome on Android', icon: <Smartphone className="w-4 h-4" />, ip: '85.214.***.**', date: '2025-06-20 12:00', current: false },
  { id: '5', device: 'Edge on Windows', icon: <Monitor className="w-4 h-4" />, ip: '78.42.***.**', date: '2025-06-19 08:30', current: false },
];

const VERIFY_STEPS = [
  { label: 'Basic Info', done: true },
  { label: 'Identity', done: true },
  { label: 'Address', done: true },
  { label: 'Selfie', done: false },
];

export default function ProfilePage() {
  const { user, goBack } = useAppStore();
  const [twoFactor, setTwoFactor] = useState(user?.twoFactor || false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const isVerified = VERIFY_STEPS.every((s) => s.done);
  const completedSteps = VERIFY_STEPS.filter((s) => s.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-10 w-10 hover:bg-blue-500/10 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your account settings and security</p>
        </div>
      </div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full gradient-blue flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg shadow-blue-500/20">
            {initial}
          </div>
          <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">{user?.username || 'User'}</h2>
          <p className="text-xs text-muted-foreground">{user?.email || 'user@email.com'}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 h-8 text-xs"
        >
          <Camera className="w-3.5 h-3.5 mr-1.5" />
          Change Avatar
        </Button>
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {[
          { label: 'Username', value: user?.username || 'CryptoTrader', icon: <Pencil className="w-3.5 h-3.5" />, action: () => {} },
          { label: 'Email', value: user?.email || 'trader@crypto.com', icon: null, badge: user?.emailVerified ? 'Verified' : null },
          { label: 'Phone', value: user?.phone || '+1 234 567 8900', icon: <Pencil className="w-3.5 h-3.5" />, action: () => {} },
          { label: 'Country', value: user?.country || 'United States', icon: null },
          { label: 'UID', value: user?.uid || 'UID-847291', icon: <Copy className="w-3.5 h-3.5" />, action: () => handleCopy(user?.uid || 'UID-847291') },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.04 }}
            className="glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{item.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{item.value}</span>
                {item.badge && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] h-4 px-1.5">
                    <BadgeCheck className="w-2.5 h-2.5 mr-0.5" />
                    {item.badge}
                  </Badge>
                )}
              </div>
            </div>
            {item.icon && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 shrink-0 ${
                  item.label === 'UID'
                    ? 'hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400'
                    : 'hover:bg-blue-500/10 text-muted-foreground hover:text-white'
                }`}
                onClick={item.action}
              >
                {item.label === 'UID' && copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  item.icon
                )}
              </Button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Account Verification */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-xl p-4 md:p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Identity Verification</h3>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] h-5 ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            {isVerified ? 'Verified' : `${completedSteps}/${VERIFY_STEPS.length} Completed`}
          </Badge>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 mb-4">
          {VERIFY_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    step.done
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-crypto-navy/50 border-blue-500/20 text-muted-foreground'
                  }`}
                >
                  {step.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 text-center hidden sm:block">{step.label}</span>
              </div>
              {i < VERIFY_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded ${
                    step.done ? 'bg-emerald-500/40' : 'bg-blue-500/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {!isVerified && (
          <Button
            className="w-full gradient-blue neon-glow-blue h-10 text-white font-medium rounded-xl hover:opacity-90 text-sm"
          >
            <Shield className="w-4 h-4 mr-2" />
            Continue Verification
          </Button>
        )}
        {isVerified && (
          <p className="text-xs text-emerald-400/80 text-center">
            Your identity has been fully verified. You have access to all features.
          </p>
        )}
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {/* Change Password */}
        <div className="glass-card rounded-xl p-4 md:p-5">
          <button
            onClick={() => toggleSection('password')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Change Password</h3>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${activeSection === 'password' ? 'rotate-90' : ''}`} />
          </button>

          {activeSection === 'password' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showOldPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw(!showOldPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full gradient-blue text-white hover:opacity-90 h-10 text-sm font-medium rounded-xl">
                Update Password
              </Button>
            </motion.div>
          )}
        </div>

        {/* 2FA Toggle */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Two-Factor Authentication</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Add extra security to your account</p>
            </div>
          </div>
          <Switch
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        {/* Login History */}
        <div className="glass-card rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Login History</h3>
            </div>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto crypto-scrollbar pr-1">
            {LOGIN_HISTORY.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-crypto-navy/30 hover:bg-crypto-navy/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  {entry.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">{entry.device}</span>
                    {entry.current && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] h-4 px-1">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{entry.ip}</span>
                    <span className="text-[11px] text-muted-foreground/40">•</span>
                    <span className="text-[11px] text-muted-foreground">{entry.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Referral Program */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-4 md:p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Referral Program</h3>
        </div>

        {/* Referral Code */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Your Referral Code</Label>
          <div className="flex items-center gap-2 bg-crypto-navy/50 rounded-lg border border-blue-500/10 p-3">
            <code className="text-sm text-blue-300 font-mono font-semibold flex-1">{user?.referralCode || 'CRYPTO847'}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400"
              onClick={() => handleCopy(user?.referralCode || 'CRYPTO847')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Referral Link</Label>
          <div className="flex items-center gap-2 bg-crypto-navy/50 rounded-lg border border-blue-500/10 p-3">
            <code className="text-xs text-muted-foreground font-mono flex-1 truncate">
              https://nextrade.pro/ref/{user?.referralCode || 'CRYPTO847'}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400"
              onClick={() => handleCopy(`https://nextrade.pro/ref/${user?.referralCode || 'CRYPTO847'}`)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-crypto-navy/30 rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Referrals</p>
          </div>
          <div className="bg-crypto-navy/30 rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-emerald-400">$285.00</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Earnings</p>
          </div>
        </div>

        <Button className="w-full gradient-gold text-black font-semibold h-10 rounded-xl hover:opacity-90 text-sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share Referral Link
        </Button>
      </motion.div>
    </motion.div>
  );
}