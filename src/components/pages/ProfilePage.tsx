'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Smartphone,
  Clock,
  Monitor,
  AlertTriangle,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const loginHistory = [
  { ip: '192.168.1.105', device: 'Chrome · macOS', time: '2025-01-15 14:32' },
  { ip: '10.0.0.42', device: 'Safari · iPhone 15', time: '2025-01-14 09:15' },
  { ip: '172.16.0.88', device: 'Firefox · Windows 11', time: '2025-01-13 18:45' },
  { ip: '192.168.1.105', device: 'Chrome · macOS', time: '2025-01-12 11:20' },
  { ip: '203.0.113.50', device: 'Edge · Windows 10', time: '2025-01-11 07:05' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ProfilePage() {
  const { user } = useStore();

  const [name, setName] = useState(user?.name || 'John Doe');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 123-4567');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'January 2024';

  const handleSaveProfile = () => {
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }, 800);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 2000);
    }, 800);
  };

  const handleDeleteAccount = () => {
    alert(
      'Are you sure you want to delete your account? This action is irreversible and all your data will be permanently removed.'
    );
  };

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      style={{ paddingBottom: 40 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Profile Header */}
      <motion.div
        className="glass-card p-6"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              fontSize: 28,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {initials}
          </div>
          {/* Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {name}
              </h1>
              <span className="badge badge-blue">
                {user?.role || 'Trader'}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {user?.email || 'john.doe@example.com'}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Member since {memberSince}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Form */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <h2
          className="text-base font-semibold mb-5"
          style={{ color: 'var(--text-primary)' }}
        >
          Edit Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <User size={14} className="inline mr-1" style={{ verticalAlign: -2 }} />
              Name
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          {/* Email (disabled) */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Mail size={14} className="inline mr-1" style={{ verticalAlign: -2 }} />
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={user?.email || 'john.doe@example.com'}
              disabled
              style={{
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            />
          </div>
          {/* Phone */}
          <div className="sm:col-span-2 sm:max-w-xs">
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Phone size={14} className="inline mr-1" style={{ verticalAlign: -2 }} />
              Phone
            </label>
            <input
              type="tel"
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <motion.button
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveProfile}
            disabled={savingProfile}
            style={{ opacity: savingProfile ? 0.7 : 1 }}
          >
            <Save size={14} />
            {savingProfile ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
          </motion.button>
          {profileSaved && (
            <span className="text-sm text-green" style={{ fontWeight: 500 }}>
              Profile updated successfully
            </span>
          )}
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div className="glass-card p-6" variants={itemVariants}>
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Security
          </h2>
        </div>

        {/* Change Password */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Change Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <motion.button
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              style={{ opacity: savingPassword ? 0.7 : 1 }}
            >
              <Lock size={14} />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </motion.button>
            {passwordSaved && (
              <span className="text-sm text-green" style={{ fontWeight: 500 }}>
                Password updated successfully
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--border-color)',
            margin: '24px 0',
          }}
        />

        {/* Two-Factor Auth */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Smartphone size={18} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Two-Factor Authentication
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactor(!twoFactor)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: twoFactor ? 'var(--accent-green)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Toggle two-factor authentication"
          >
            {twoFactor ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--border-color)',
            margin: '24px 0',
          }}
        />

        {/* Login History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: 'var(--accent-purple)' }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Recent Login History
            </h3>
          </div>
          <div className="space-y-3">
            {loginHistory.map((entry, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-lg"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="flex items-center gap-3">
                  <Monitor
                    size={16}
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {entry.device}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      IP: {entry.ip}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="glass-card p-6"
        variants={itemVariants}
        style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--accent-red)' }}
          >
            Danger Zone
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <motion.button
          className="btn-danger flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDeleteAccount}
        >
          <AlertTriangle size={14} />
          Delete Account
        </motion.button>
      </motion.div>
    </motion.div>
  );
}