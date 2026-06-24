'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CandlestickChart,
  Wallet,
  User,
  Shield,
  Bell,
  Gift,
  LogOut,
  Users,
  UserCog,
  ArrowLeftRight,
  WalletCards,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Settings,
  BellRing,
  FileText,
  Ticket,
} from 'lucide-react';
import { useStore, Pages, type PageType } from '@/store/useStore';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: PageType;
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const mainItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', page: Pages.DASHBOARD },
  { icon: <CandlestickChart size={20} />, label: 'Trading', page: Pages.TRADING },
  { icon: <Wallet size={20} />, label: 'Wallet', page: Pages.WALLET },
];

const accountItems: NavItem[] = [
  { icon: <User size={20} />, label: 'Profile', page: Pages.PROFILE },
  { icon: <Shield size={20} />, label: 'Security', page: Pages.SECURITY },
  { icon: <Bell size={20} />, label: 'Notifications', page: Pages.NOTIFICATIONS },
  { icon: <Gift size={20} />, label: 'Referral', page: Pages.REFERRAL },
];

const adminItems: NavItem[] = [
  { icon: <Users size={20} />, label: 'Users', page: Pages.ADMIN_USERS },
  { icon: <UserCog size={20} />, label: 'Agents', page: Pages.ADMIN_AGENTS },
  { icon: <ArrowLeftRight size={20} />, label: 'Trades', page: Pages.ADMIN_TRADES },
  { icon: <WalletCards size={20} />, label: 'Wallets', page: Pages.ADMIN_WALLETS },
  { icon: <BarChart3 size={20} />, label: 'Analytics', page: Pages.ADMIN_ANALYTICS },
  { icon: <DollarSign size={20} />, label: 'Commissions', page: Pages.ADMIN_COMMISSIONS },
  { icon: <AlertTriangle size={20} />, label: 'Risk', page: Pages.ADMIN_RISK },
  { icon: <Settings size={20} />, label: 'Settings', page: Pages.ADMIN_SETTINGS },
  { icon: <BellRing size={20} />, label: 'Notifications', page: Pages.ADMIN_NOTIFICATIONS },
  { icon: <FileText size={20} />, label: 'Audit', page: Pages.ADMIN_AUDIT },
  { icon: <Ticket size={20} />, label: 'Invitations', page: Pages.ADMIN_INVITATIONS },
];

const sections: NavSection[] = [
  { title: 'Main', items: mainItems },
  { title: 'Account', items: accountItems },
  { title: 'Admin', items: adminItems, adminOnly: true },
];

export default function Sidebar() {
  const { currentPage, sidebarOpen, user, navigate, logout } = useStore();

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_AGENT';

  return (
    <motion.aside
      className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
      animate={{ width: sidebarOpen ? 260 : 70 }}
      transition={{ duration: 0.3, ease: 'easeInOut' as const }}
      style={{ flexShrink: 0 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18 }}>⚡</span>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span className="gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>
                NexTrade Pro
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-3"
        style={{ overflowX: 'hidden' }}
      >
        {sections.map((section) => {
          if (section.adminOnly && !isAdmin) return null;

          return (
            <div key={section.title} className="mb-2">
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-2"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {section.title}
                  </motion.div>
                )}
              </AnimatePresence>
              {!sidebarOpen && section.title === 'Main' && (
                <div
                  className="mx-auto my-2"
                  style={{
                    width: 24,
                    height: 1,
                    background: 'var(--border-color)',
                  }}
                />
              )}
              {section.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <div
                    key={item.page}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.page)}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      padding: sidebarOpen ? '10px 16px' : '10px 0',
                      margin: sidebarOpen ? '2px 8px' : '2px 0',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="border-t px-2 py-3"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div
          className="sidebar-item"
          onClick={logout}
          style={{
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            color: 'var(--accent-red)',
            padding: sidebarOpen ? '10px 16px' : '10px 0',
            margin: sidebarOpen ? '0 8px' : 0,
          }}
        >
          <LogOut size={20} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}