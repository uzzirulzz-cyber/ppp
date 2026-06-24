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
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';

const pageTitles: Record<string, string> = {
  [Pages.LOGIN]: 'Sign In',
  [Pages.REGISTER]: 'Create Account',
  [Pages.DASHBOARD]: 'Dashboard',
  [Pages.TRADING]: 'Trading',
  [Pages.SPOT]: 'Spot Trading',
  [Pages.FUTURES]: 'Futures Trading',
  [Pages.WALLET]: 'Wallet',
  [Pages.DEPOSIT]: 'Deposit',
  [Pages.WITHDRAW]: 'Withdraw',
  [Pages.EARN]: 'Earn',
  [Pages.TRANSACTIONS]: 'Transactions',
  [Pages.PROFILE]: 'Profile',
  [Pages.SECURITY]: 'Security',
  [Pages.NOTIFICATIONS]: 'Notifications',
  [Pages.REFERRAL]: 'Referral',
  [Pages.LOCK_SCREEN]: 'Lock Screen',
  [Pages.ADMIN_USERS]: 'User Management',
  [Pages.ADMIN_AGENTS]: 'Agent Management',
  [Pages.ADMIN_TRADES]: 'Trade Management',
  [Pages.ADMIN_WALLETS]: 'Wallet Management',
  [Pages.ADMIN_ANALYTICS]: 'Analytics',
  [Pages.ADMIN_COMMISSIONS]: 'Commissions',
  [Pages.ADMIN_RISK]: 'Risk Management',
  [Pages.ADMIN_SETTINGS]: 'Platform Settings',
  [Pages.ADMIN_NOTIFICATIONS]: 'Admin Notifications',
  [Pages.ADMIN_AUDIT]: 'Audit Log',
  [Pages.ADMIN_INVITATIONS]: 'Invitation Codes',
};

export default function Header() {
  const { currentPage, user, unreadCount, toggleSidebar, navigate, logout } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[currentPage] || 'NexTrade Pro';

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
      ? 'badge-purple'
      : user?.role === 'SUB_AGENT'
      ? 'badge-amber'
      : 'badge-blue';

  return (
    <header
      className="flex items-center justify-between px-6 h-16 border-b"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        flexShrink: 0,
      }}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      {/* Right: search, notifications, user */}
      <div className="flex items-center gap-3">
        {/* Search (decorative) */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            minWidth: 200,
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none"
            style={{
              color: 'var(--text-primary)',
              fontSize: 13,
              width: '100%',
            }}
            readOnly
          />
          <kbd
            className="hidden lg:inline-block px-1.5 py-0.5 rounded text-xs"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              fontSize: 10,
            }}
          >
            ⌘K
          </kbd>
        </div>

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
          className="p-2 rounded-lg transition-colors cursor-pointer"
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
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="flex items-center justify-center rounded-full text-white font-semibold"
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
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
              className="absolute right-0 top-full mt-1 py-1 rounded-lg z-50 animate-fade-in"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                minWidth: 180,
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              }}
            >
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
                onClick={() => { navigate(Pages.SECURITY); setDropdownOpen(false); }}
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