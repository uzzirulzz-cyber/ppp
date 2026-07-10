'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Lock,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

const pageTitles: Record<string, string> = {
  [Pages.HOME]: 'NextradePro.Top',
  [Pages.LOGIN]: 'Sign In',
  [Pages.REGISTER]: 'Create Account',
  [Pages.DASHBOARD]: 'Dashboard',
  [Pages.MARKETS]: 'Markets',
  [Pages.WATCHLIST]: 'Watchlist',
  [Pages.TRADING]: 'Trading',
  [Pages.SPOT]: 'Spot Trading',
  [Pages.FUTURES]: 'Futures Trading',
  [Pages.WALLET]: 'Wallet',
  [Pages.ASSETS]: 'Assets',
  [Pages.DEPOSIT]: 'Deposit',
  [Pages.WITHDRAW]: 'Withdraw',
  [Pages.EARN]: 'Earn',
  [Pages.TRANSACTIONS]: 'Transactions',
  [Pages.HISTORY]: 'History',
  [Pages.PROFILE]: 'Profile',
  [Pages.SECURITY]: 'Security',
  [Pages.NOTIFICATIONS]: 'Notifications',
  [Pages.SETTINGS]: 'Settings',
  [Pages.REFERRAL]: 'Referral',
  [Pages.LOCK_SCREEN]: 'Lock Screen',
  [Pages.CHANGE_PASSWORD]: 'Change Password',
  [Pages.ADMIN_DASHBOARD]: 'Admin Dashboard',
  [Pages.ADMIN_USERS]: 'User Management',
  [Pages.ADMIN_AGENTS]: 'Agent Management',
  [Pages.ADMIN_TRADES]: 'Trade Management',
  [Pages.ADMIN_WALLETS]: 'Wallet Management',
  [Pages.ADMIN_DEPOSITS]: 'Deposits',
  [Pages.ADMIN_WITHDRAWALS]: 'Withdrawals',
  [Pages.ADMIN_ANALYTICS]: 'Analytics',
  [Pages.ADMIN_COMMISSIONS]: 'Commissions',
  [Pages.ADMIN_RISK]: 'Risk Management',
  [Pages.ADMIN_SETTINGS]: 'Platform Settings',
  [Pages.ADMIN_NOTIFICATIONS]: 'Admin Notifications',
  [Pages.ADMIN_AUDIT]: 'Audit Log',
  [Pages.ADMIN_INVITATIONS]: 'Invitation Codes',
};

export default function Header() {
  const { currentPage, user, unreadCount, toggleSidebar, navigate, logout, token } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[currentPage] || 'NextradePro.Top';

  // Fetch wallet balance
  useEffect(() => {
    if (!token) return;
    async function fetchWallet() {
      try {
        const res = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.totalEquity || 0);
        }
      } catch {
        // silently fail
      }
    }
    fetchWallet();
  }, [token, currentPage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadgeClass =
    user?.role === 'SUPER_ADMIN'
      ? 'badge-yellow'
      : user?.role === 'SUB_AGENT'
      ? 'badge-amber'
      : 'badge-blue';

  return (
    <header className="navbar flex items-center justify-between px-4 md:px-6" style={{ flexShrink: 0 }}>
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={20} />
        </button>
        <h1 className="hidden sm:block" style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>
          {title}
        </h1>
      </div>

      {/* Center: Wallet + Actions (desktop) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Wallet Balance Card */}
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
          style={{
            background: 'rgba(23, 28, 40, 0.8)',
            border: '1px solid var(--border-color)',
          }}
          onClick={() => navigate(Pages.WALLET)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245, 180, 0, 0.3)';
            e.currentTarget.style.boxShadow = 'var(--glow-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, rgba(245,180,0,0.2), rgba(0,229,255,0.1))',
            }}
          >
            <Wallet size={18} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Assets
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              {walletBalance !== null
                ? `$${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00'}
            </div>
          </div>
        </div>

        {/* Add Funds Button */}
        <button
          onClick={() => navigate(Pages.DEPOSIT)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
          style={{
            background: 'var(--gradient)',
            color: '#FFFFFF',
            boxShadow: 'var(--glow-gold)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--glow-gold)';
          }}
        >
          <ArrowDownLeft size={16} />
          <span>Add Funds</span>
        </button>

        {/* Withdraw Button */}
        <button
          onClick={() => navigate(Pages.WITHDRAW)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '2px solid var(--accent-cyan)',
            borderRadius: '40px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-cyan)';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowUpRight size={16} />
          <span>Withdraw</span>
        </button>
      </div>

      {/* Right: notifications, lock, user */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => navigate(Pages.NOTIFICATIONS)}
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white"
              style={{
                background: 'var(--accent-red)',
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                padding: '0 4px',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Lock screen */}
        <button
          onClick={() => navigate(Pages.LOCK_SCREEN)}
          className="hidden sm:block p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Lock Screen"
        >
          <Lock size={20} />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="flex items-center justify-center rounded-full text-white font-semibold"
              style={{
                width: 34,
                height: 34,
                background: 'var(--gradient)',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: '#FFFFFF' }}>
                {user?.name || 'User'}
              </div>
              <span className={`badge ${roleBadgeClass}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                {user?.role || 'USER'}
              </span>
            </div>
            <ChevronDown
              size={14}
              style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 py-1 rounded-xl z-50 animate-fade-in"
              style={{
                background: 'rgba(16, 20, 29, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                minWidth: 200,
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Wallet quick link (mobile) */}
              <button
                className="md:hidden flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { navigate(Pages.WALLET); setDropdownOpen(false); }}
                style={{ color: 'var(--text-secondary)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Wallet size={16} />
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                    {walletBalance !== null
                      ? `$${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : '$0.00'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Assets</div>
                </div>
              </button>

              <div className="md:hidden" style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { navigate(Pages.DEPOSIT); setDropdownOpen(false); }}
                style={{ color: 'var(--accent-green)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ArrowDownLeft size={16} />
                Add Funds
              </button>

              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { navigate(Pages.WITHDRAW); setDropdownOpen(false); }}
                style={{ color: 'var(--accent-gold)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ArrowUpRight size={16} />
                Withdraw
              </button>

              <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { navigate(Pages.PROFILE); setDropdownOpen(false); }}
                style={{ color: 'var(--text-secondary)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={16} />
                Profile
              </button>
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { navigate(Pages.SETTINGS); setDropdownOpen(false); }}
                style={{ color: 'var(--text-secondary)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings size={16} />
                Settings
              </button>
              <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer"
                onClick={() => { logout(); setDropdownOpen(false); }}
                style={{ color: 'var(--accent-red)', fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}