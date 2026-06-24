'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, Pages } from '@/store/useStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoginPage from '@/components/pages/LoginPage';
import RegisterPage from '@/components/pages/RegisterPage';
import DashboardPage from '@/components/pages/DashboardPage';
import TradingPage from '@/components/pages/TradingPage';
import WalletPage from '@/components/pages/WalletPage';
import ProfilePage from '@/components/pages/ProfilePage';
import NotificationsPage from '@/components/pages/NotificationsPage';
import LockScreenPage from '@/components/pages/LockScreenPage';
import ReferralPage from '@/components/pages/ReferralPage';
import UserManagementPage from '@/components/pages/admin/UserManagementPage';
import AgentManagementPage from '@/components/pages/admin/AgentManagementPage';
import TradeMonitoringPage from '@/components/pages/admin/TradeMonitoringPage';
import WalletManagementPage from '@/components/pages/admin/WalletManagementPage';
import RevenueAnalyticsPage from '@/components/pages/admin/RevenueAnalyticsPage';
import CommissionSettingsPage from '@/components/pages/admin/CommissionSettingsPage';
import RiskManagementPage from '@/components/pages/admin/RiskManagementPage';
import SystemSettingsPage from '@/components/pages/admin/SystemSettingsPage';
import NotificationManagementPage from '@/components/pages/admin/NotificationManagementPage';
import AuditLogsPage from '@/components/pages/admin/AuditLogsPage';
import InvitationCodePage from '@/components/pages/admin/InvitationCodePage';

function PageRouter() {
  const { currentPage } = useStore();

  switch (currentPage) {
    case Pages.DASHBOARD: return <DashboardPage />;
    case Pages.TRADING: return <TradingPage />;
    case Pages.SPOT: return <TradingPage />;
    case Pages.FUTURES: return <TradingPage />;
    case Pages.WALLET: return <WalletPage />;
    case Pages.DEPOSIT: return <WalletPage />;
    case Pages.WITHDRAW: return <WalletPage />;
    case Pages.EARN: return <WalletPage />;
    case Pages.TRANSACTIONS: return <WalletPage />;
    case Pages.PROFILE: return <ProfilePage />;
    case Pages.SECURITY: return <ProfilePage />;
    case Pages.NOTIFICATIONS: return <NotificationsPage />;
    case Pages.REFERRAL: return <ReferralPage />;
    case Pages.LOCK_SCREEN: return <LockScreenPage />;
    case Pages.ADMIN_USERS: return <UserManagementPage />;
    case Pages.ADMIN_AGENTS: return <AgentManagementPage />;
    case Pages.ADMIN_TRADES: return <TradeMonitoringPage />;
    case Pages.ADMIN_WALLETS: return <WalletManagementPage />;
    case Pages.ADMIN_ANALYTICS: return <RevenueAnalyticsPage />;
    case Pages.ADMIN_COMMISSIONS: return <CommissionSettingsPage />;
    case Pages.ADMIN_RISK: return <RiskManagementPage />;
    case Pages.ADMIN_SETTINGS: return <SystemSettingsPage />;
    case Pages.ADMIN_NOTIFICATIONS: return <NotificationManagementPage />;
    case Pages.ADMIN_AUDIT: return <AuditLogsPage />;
    case Pages.ADMIN_INVITATIONS: return <InvitationCodePage />;
    default: return <DashboardPage />;
  }
}

export default function Home() {
  const { isAuthenticated, currentPage } = useStore();

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {currentPage === Pages.REGISTER ? (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ height: '100vh' }}>
            <RegisterPage />
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ height: '100vh' }}>
            <LoginPage />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ minHeight: '100%' }}
            >
              <PageRouter />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}