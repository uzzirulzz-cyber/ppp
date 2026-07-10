'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCog,
  ArrowLeftRight,
  WalletCards,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Settings,
  BellRing,
  FileText,
  Ticket,
  LogOut,
  LayoutDashboard,
  Menu,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import './admin-light-theme.css';

const adminNav = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
  { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
  { icon: <UserCog size={20} />, label: 'Agents', path: '/admin/agents' },
  { icon: <ArrowLeftRight size={20} />, label: 'Trades', path: '/admin/trades' },
  { icon: <WalletCards size={20} />, label: 'Wallets', path: '/admin/wallets' },
  { icon: <ArrowDownLeft size={20} />, label: 'Deposits', path: '/admin/deposits' },
  { icon: <ArrowUpRight size={20} />, label: 'Withdrawals', path: '/admin/withdrawals' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
  { icon: <DollarSign size={20} />, label: 'Commissions', path: '/admin/commissions' },
  { icon: <AlertTriangle size={20} />, label: 'Risk', path: '/admin/risk' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  { icon: <BellRing size={20} />, label: 'Notifications', path: '/admin/notifications' },
  { icon: <FileText size={20} />, label: 'Audit', path: '/admin/audit' },
  { icon: <Ticket size={20} />, label: 'Invitations', path: '/admin/invitations' },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/agents': 'Agent Management',
  '/admin/trades': 'Trade Management',
  '/admin/wallets': 'Wallet Management',
  '/admin/deposits': 'Deposit Management',
  '/admin/withdrawals': 'Withdrawal Management',
  '/admin/analytics': 'Analytics',
  '/admin/commissions': 'Commissions',
  '/admin/risk': 'Risk Management',
  '/admin/settings': 'Platform Settings',
  '/admin/notifications': 'Admin Notifications',
  '/admin/audit': 'Audit Log',
  '/admin/invitations': 'Invitation Codes',
};

/* ─── Sidebar colors ─── */
const SB = {
  bg: '#1E3A8A',
  border: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  muted: '#CBD5E1',
  activeBg: '#3B82F6',
  activeText: '#FFFFFF',
  hoverBg: '#334155',
  hoverText: '#FFFFFF',
  red: '#F87171',
};

/* ─── Header / content colors ─── */
const HD = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1E293B',
  secondary: '#64748B',
  hover: '#F1F5F9',
};

const CONTENT_BG = '#F8FAFC';
const ACCENT = '#3B82F6';
const ACCENT_HOVER = '#2563EB';

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brock_token');
      localStorage.removeItem('brock_user');
      localStorage.removeItem('nextrade_token');
      localStorage.removeItem('nextrade_user');
      window.location.href = '/';
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        className="relative z-10 h-full flex flex-col"
        style={{ background: SB.bg, minWidth: open ? 260 : 70, width: open ? 260 : 70, transition: 'min-width 0.3s ease-in-out, width 0.3s ease-in-out' }}
        animate={{ width: open ? 260 : 70, minWidth: open ? 260 : 70 }}
        transition={{ duration: 0.3, ease: 'easeInOut' as const }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b"
          style={{ borderColor: SB.border }}
        >
          <Image
            src="/logo-admin.png"
            alt="NexTrade Pro"
            width={36}
            height={36}
            style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: SB.text }}>
                  NexTrade Pro
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3" style={{ overflowX: 'hidden' }}>
          <AnimatePresence>
            {open && (
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
                  color: SB.muted,
                }}
              >
                Admin Panel
              </motion.div>
            )}
          </AnimatePresence>

          {adminNav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  onClose();
                }}
                title={!open ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: open ? 'flex-start' : 'center',
                  gap: 12,
                  padding: open ? '10px 16px' : '10px 0',
                  margin: open ? '2px 8px' : '2px 0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isActive ? SB.activeBg : 'transparent',
                  color: isActive ? SB.activeText : SB.muted,
                  borderLeft: isActive ? `3px solid ${ACCENT}` : '3px solid transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = SB.hoverBg;
                    e.currentTarget.style.color = SB.hoverText;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = SB.muted;
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 14 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t" style={{ borderColor: SB.border }}>
          {/* Frontend link */}
          <div
            onClick={() => router.push('/')}
            title={!open ? 'Frontend' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'flex-start' : 'center',
              gap: 12,
              padding: open ? '10px 16px' : '10px 0',
              margin: open ? '2px 8px' : '2px 0',
              borderRadius: 8,
              cursor: 'pointer',
              color: SB.muted,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = SB.hoverBg;
              e.currentTarget.style.color = SB.hoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = SB.muted;
            }}
          >
            <Home size={20} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 14 }}
                >
                  Frontend
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <div
            onClick={handleLogout}
            title={!open ? 'Logout' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'flex-start' : 'center',
              gap: 12,
              padding: open ? '10px 16px' : '10px 0',
              margin: open ? '0 8px 8px' : '0 0 8px',
              borderRadius: 8,
              cursor: 'pointer',
              color: SB.red,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 14 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function AdminHeader({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    try {
      const u = localStorage.getItem('brock_user') || localStorage.getItem('nextrade_user');
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  const title = pageTitles[pathname] || 'Admin';

  return (
    <header
      className="flex items-center justify-between px-6"
      style={{
        flexShrink: 0,
        background: HD.bg,
        borderBottom: `1px solid ${HD.border}`,
        height: 60,
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: HD.secondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = HD.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: HD.text }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{
            color: HD.secondary,
            fontSize: 13,
            border: `1px solid ${HD.border}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = HD.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Home size={14} />
          <span className="hidden sm:inline">Frontend</span>
        </button>

        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
          {/* Blue circle avatar */}
          <div
            className="flex items-center justify-center rounded-full font-semibold"
            style={{
              width: 32,
              height: 32,
              background: ACCENT,
              fontSize: 13,
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: HD.text }}>
              {user?.name || 'Admin'}
            </div>
            {/* Light blue role badge */}
            <span
              style={{
                display: 'inline-block',
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
                background: '#EFF6FF',
                color: ACCENT,
                fontWeight: 500,
              }}
            >
              {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('brock_token') || localStorage.getItem('nextrade_token');
      const userStr = localStorage.getItem('brock_user') || localStorage.getItem('nextrade_user');
      if (!token || !userStr) {
        router.replace('/');
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'SUB_AGENT') {
        router.replace('/');
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace('/');
    } finally {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CONTENT_BG }}>
        <div
          className="animate-spin"
          style={{
            width: 32,
            height: 32,
            border: '3px solid #E2E8F0',
            borderTopColor: ACCENT,
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: CONTENT_BG }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: CONTENT_BG }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={usePathname()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ minHeight: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}