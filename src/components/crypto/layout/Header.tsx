'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  trade: 'Trade',
  'trade-confirm': 'Confirm Trade',
  wallet: 'Wallet',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  'transaction-history': 'Transaction History',
  'deposit-history': 'Deposit History',
  'withdraw-history': 'Withdrawal History',
  'trading-history': 'Trading History',
  'profit-history': 'Profit History',
  referral: 'Referral Program',
  profile: 'Profile',
  security: 'Security',
  notifications: 'Notifications',
  'admin-dashboard': 'Admin Dashboard',
  'admin-users': 'User Management',
  'admin-finance': 'Finance Overview',
  'admin-deposits': 'Deposit Management',
  'admin-withdrawals': 'Withdrawal Management',
  'admin-trading': 'Trading Management',
  'admin-coins': 'Coin Management',
  'admin-notifications': 'Notification Settings',
  'admin-support': 'Support Tickets',
  'admin-roles': 'Role Management',
  'admin-reports': 'Reports',
};

export default function Header() {
  const { currentPage, navigate, setSidebarOpen, coins, notifications, user } =
    useAppStore();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Ticker coins - top 4 by volume
  const tickerCoins = useMemo(
    () =>
      [...coins]
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 4),
    [coins]
  );

  const tickerRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[currentPage] || 'NexTrade Pro';

  return (
    <header className="fixed top-0 right-0 z-20 h-16 glass-strong border-b border-border/50">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Page title */}
        <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">
          {pageTitle}
        </h2>

        {/* Ticker strip - hidden on very small screens */}
        <div className="hidden md:flex flex-1 items-center overflow-hidden mx-4">
          <div className="relative flex-1 overflow-hidden rounded-lg bg-white/[0.03] border border-border/30 h-9">
            <div ref={tickerRef} className="flex items-center h-full animate-ticker whitespace-nowrap">
              {/* Duplicate for seamless loop */}
              {[...tickerCoins, ...tickerCoins].map((coin, i) => (
                <button
                  key={`${coin.symbol}-${i}`}
                  onClick={() => navigate('trade')}
                  className="flex items-center gap-2 px-4 h-full hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-bold text-foreground">
                    {coin.logo} {coin.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.price > 1 ? 2 : 4 })}
                  </span>
                  {coin.change24h >= 0 ? (
                    <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
                      <TrendingUp className="size-3" />
                      +{coin.change24h.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[11px] font-medium text-red-400">
                      <TrendingDown className="size-3" />
                      {coin.change24h.toFixed(2)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notification bell */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('notifications')}
            className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <Bell className="size-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* User avatar */}
          <button
            onClick={() => navigate('profile')}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
          >
            <Avatar className="size-7 border border-blue-500/30">
              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-[11px] font-semibold text-blue-400">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {user?.username || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}