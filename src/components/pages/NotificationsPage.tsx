'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  Wallet,
  Shield,
  Settings,
  DollarSign,
  Users,
  Bell,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

type NotificationType = 'trade' | 'wallet' | 'security' | 'system' | 'commission' | 'referral';
type FilterTab = 'all' | 'unread' | NotificationType;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'trade', label: 'Trade' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'security', label: 'Security' },
  { key: 'system', label: 'System' },
];

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'trade',
    title: 'Trade Executed',
    message: 'Your buy order for 0.15 BTC at $67,245.30 has been filled successfully.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'security',
    title: 'New Login Detected',
    message: 'A new login was detected from Chrome on macOS (IP: 192.168.1.105).',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'wallet',
    title: 'Deposit Confirmed',
    message: 'Your deposit of 5,000 USDT has been confirmed and credited to your account.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'commission',
    title: 'Commission Earned',
    message: 'You earned $12.50 commission from your referral Alex M. trading activity.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Jan 20, 2025 from 02:00–04:00 UTC. Trading may be affected.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '6',
    type: 'trade',
    title: 'Stop Loss Triggered',
    message: 'Your stop-loss order for ETH/USDT was triggered at $3,412.50. Loss: -$234.50.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '7',
    type: 'wallet',
    title: 'Withdrawal Processing',
    message: 'Your withdrawal request for 2.5 ETH is being processed. Expected completion: 30 min.',
    time: '2 days ago',
    read: false,
  },
  {
    id: '8',
    type: 'referral',
    title: 'New Referral Signed Up',
    message: 'Sarah K. signed up using your referral code. You\'ll earn commission once they start trading.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '9',
    type: 'security',
    title: 'Password Changed',
    message: 'Your account password was successfully changed. If this wasn\'t you, contact support.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '10',
    type: 'system',
    title: 'New Feature: Futures Trading',
    message: 'Futures trading is now live! Start trading with up to 100x leverage on major pairs.',
    time: '4 days ago',
    read: true,
  },
];

function getIcon(type: NotificationType) {
  switch (type) {
    case 'trade':
      return <BarChart2 size={18} style={{ color: 'var(--accent-blue)' }} />;
    case 'wallet':
      return <Wallet size={18} style={{ color: 'var(--accent-green)' }} />;
    case 'security':
      return <Shield size={18} style={{ color: 'var(--accent-amber)' }} />;
    case 'system':
      return <Settings size={18} style={{ color: 'var(--text-muted)' }} />;
    case 'commission':
      return <DollarSign size={18} style={{ color: 'var(--accent-purple)' }} />;
    case 'referral':
      return <Users size={18} style={{ color: '#06b6d4' }} />;
    default:
      return <Bell size={18} style={{ color: 'var(--text-muted)' }} />;
  }
}

function getIconBg(type: NotificationType): string {
  switch (type) {
    case 'trade':
      return 'rgba(59, 130, 246, 0.15)';
    case 'wallet':
      return 'rgba(34, 197, 94, 0.15)';
    case 'security':
      return 'rgba(245, 158, 11, 0.15)';
    case 'system':
      return 'rgba(100, 116, 139, 0.15)';
    case 'commission':
      return 'rgba(139, 92, 246, 0.15)';
    case 'referral':
      return 'rgba(6, 182, 212, 0.15)';
    default:
      return 'rgba(100, 116, 139, 0.15)';
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

export default function NotificationsPage() {
  const { setNotifications, setUnreadCount } = useStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [notifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setLocalNotifications(updated);
    setNotifications(updated);
    setUnreadCount(0);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setLocalNotifications(updated);
    const newUnread = updated.filter((n) => !n.read).length;
    setNotifications(updated);
    setUnreadCount(newUnread);
  };

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
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="badge badge-blue">{unreadCount} unread</span>
          )}
        </div>
        <motion.button
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
        >
          <CheckCheck size={14} />
          Mark All Read
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="notif-tab-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          className="glass-card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Inbox
            size={48}
            style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }}
          />
          <p
            className="text-base font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            No notifications
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {activeFilter === 'all'
              ? "You're all caught up!"
              : `No ${activeFilter} notifications found.`}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                className="glass-card p-4 flex items-start gap-4 cursor-pointer"
                style={{
                  cursor: 'pointer',
                  opacity: notif.read ? 0.65 : 1,
                  transition: 'opacity 0.2s',
                }}
                variants={listItemVariants}
                exit="exit"
                layout
                whileHover={{
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                }}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              >
                {/* Unread dot */}
                <div className="flex items-center pt-1 shrink-0" style={{ width: 8 }}>
                  {!notif.read && (
                    <motion.div
                      layoutId={`dot-${notif.id}`}
                      className="rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        background: 'var(--accent-blue)',
                        boxShadow: '0 0 6px rgba(59,130,246,0.6)',
                      }}
                    />
                  )}
                </div>

                {/* Icon */}
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: getIconBg(notif.type),
                    marginTop: 2,
                  }}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {notif.title}
                    </p>
                    <span
                      className="text-xs shrink-0 whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {notif.time}
                    </span>
                  </div>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}
                  >
                    {notif.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}