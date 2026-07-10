'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, Pages } from '@/store/useStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import RegisterPage from '@/components/pages/RegisterPage';
import DashboardPage from '@/components/pages/DashboardPage';
import MarketsPage from '@/components/pages/MarketsPage';
import WatchlistPage from '@/components/pages/WatchlistPage';
import TradingPage from '@/components/pages/TradingPage';
import WalletPage from '@/components/pages/WalletPage';
import AssetsPage from '@/components/pages/AssetsPage';
import HistoryPage from '@/components/pages/HistoryPage';
import ProfilePage from '@/components/pages/ProfilePage';
import NotificationsPage from '@/components/pages/NotificationsPage';
import LockScreenPage from '@/components/pages/LockScreenPage';
import ReferralPage from '@/components/pages/ReferralPage';
import SettingsPage from '@/components/pages/SettingsPage';
import ChangePasswordPage from '@/components/pages/auth/ChangePasswordPage';
import UserManagementPage from '@/components/pages/admin/UserManagementPage';
import AgentManagementPage from '@/components/pages/admin/AgentManagementPage';
import TradeMonitoringPage from '@/components/pages/admin/TradeMonitoringPage';
import WalletManagementPage from '@/components/pages/admin/WalletManagementPage';
import DepositManagementPage from '@/components/pages/admin/DepositManagementPage';
import WithdrawalManagementPage from '@/components/pages/admin/WithdrawalManagementPage';
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
    // Unauthenticated
    case Pages.HOME: return <HomePage />;
    case Pages.LOGIN: return <LoginPage />;
    case Pages.REGISTER: return <RegisterPage />;
    // Authenticated user
    case Pages.DASHBOARD: return <DashboardPage />;
    case Pages.MARKETS: return <MarketsPage />;
    case Pages.WATCHLIST: return <WatchlistPage />;
    case Pages.TRADING: return <TradingPage />;
    case Pages.SPOT: return <TradingPage />;
    case Pages.FUTURES: return <TradingPage />;
    case Pages.WALLET: return <WalletPage />;
    case Pages.ASSETS: return <AssetsPage />;
    case Pages.DEPOSIT: return <WalletPage />;
    case Pages.WITHDRAW: return <WalletPage />;
    case Pages.EARN: return <WalletPage />;
    case Pages.TRANSACTIONS: return <WalletPage />;
    case Pages.HISTORY: return <HistoryPage />;
    case Pages.PROFILE: return <ProfilePage />;
    case Pages.SECURITY: return <ProfilePage />;
    case Pages.NOTIFICATIONS: return <NotificationsPage />;
    case Pages.SETTINGS: return <SettingsPage />;
    case Pages.REFERRAL: return <ReferralPage />;
    case Pages.LOCK_SCREEN: return <LockScreenPage />;
    case Pages.CHANGE_PASSWORD: return <ChangePasswordPage />;
    // Admin
    case Pages.ADMIN_DASHBOARD: return <RevenueAnalyticsPage />;
    case Pages.ADMIN_USERS: return <UserManagementPage />;
    case Pages.ADMIN_AGENTS: return <AgentManagementPage />;
    case Pages.ADMIN_TRADES: return <TradeMonitoringPage />;
    case Pages.ADMIN_WALLETS: return <WalletManagementPage />;
    case Pages.ADMIN_DEPOSITS: return <DepositManagementPage />;
    case Pages.ADMIN_WITHDRAWALS: return <WithdrawalManagementPage />;
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
  const { isAuthenticated, currentPage, user } = useStore();

  // Re-hydrate auth from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('brock_token') || localStorage.getItem('nextrade_token');
      const userStr = localStorage.getItem('brock_user') || localStorage.getItem('nextrade_user');
      if (token && userStr) {
        const u = JSON.parse(userStr);
        const store = useStore.getState();
        if (!store.isAuthenticated) {
          const isAdmin = u.role === 'SUPER_ADMIN' || u.role === 'SUB_AGENT';
          useStore.setState({
            user: u,
            token,
            isAuthenticated: true,
            currentPage: isAdmin ? Pages.ADMIN_DASHBOARD : Pages.DASHBOARD,
            pageHistory: [isAdmin ? Pages.ADMIN_DASHBOARD : Pages.DASHBOARD],
          });
        }
      }
    } catch {}
  }, []);

  // Must change password redirect
  useEffect(() => {
    if (isAuthenticated && user?.mustChangePassword && currentPage !== Pages.CHANGE_PASSWORD && currentPage !== Pages.LOCK_SCREEN) {
      useStore.getState().navigate(Pages.CHANGE_PASSWORD);
    }
  }, [isAuthenticated, user?.mustChangePassword, currentPage]);

  /* Unauthenticated */
  if (!isAuthenticated) {
    if (currentPage === Pages.REGISTER) return <RegisterPage />;
    if (currentPage === Pages.LOGIN) return <LoginPage />;
    return <HomePage />;
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