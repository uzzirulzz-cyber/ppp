'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  User,
  Bell,
  Shield,
  Users,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Coins,
  HeadphonesIcon,
  Lock,
  FileText,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore, type Page } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  icon: React.ElementType;
  label: string;
  page: Page;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: TrendingUp, label: 'Trade', page: 'trade' },
  { icon: Wallet, label: 'Wallet', page: 'wallet' },
  { icon: ArrowLeftRight, label: 'Transactions', page: 'transaction-history' },
  { icon: User, label: 'Profile', page: 'profile' },
  { icon: Bell, label: 'Notifications', page: 'notifications' },
];

const adminNavItems: NavItem[] = [
  { icon: Shield, label: 'Dashboard', page: 'admin-dashboard' },
  { icon: Users, label: 'Users', page: 'admin-users' },
  { icon: DollarSign, label: 'Finance', page: 'admin-finance' },
  { icon: ArrowDownCircle, label: 'Deposits', page: 'admin-deposits' },
  { icon: ArrowUpCircle, label: 'Withdrawals', page: 'admin-withdrawals' },
  { icon: BarChart3, label: 'Trading', page: 'admin-trading' },
  { icon: Coins, label: 'Coins', page: 'admin-coins' },
  { icon: HeadphonesIcon, label: 'Support', page: 'admin-support' },
  { icon: Lock, label: 'Roles', page: 'admin-roles' },
  { icon: FileText, label: 'Reports', page: 'admin-reports' },
];

// Sub-agents see limited nav
const subAgentNavItems: NavItem[] = [
  { icon: Shield, label: 'Dashboard', page: 'admin-dashboard' },
  { icon: Users, label: 'My Customers', page: 'admin-users' },
  { icon: ArrowDownCircle, label: 'Deposits', page: 'admin-deposits' },
  { icon: ArrowUpCircle, label: 'Withdrawals', page: 'admin-withdrawals' },
  { icon: BarChart3, label: 'Trading', page: 'admin-trading' },
];

export default function Sidebar() {
  const { currentPage, navigate, isAdmin, sidebarOpen, setSidebarOpen, user, logout, isSubAgent, isSuperAdmin } =
    useAppStore();

  const unreadCount = useAppStore((s) =>
    s.notifications.filter((n) => !n.isRead).length
  );

  const renderNavItem = (item: NavItem) => {
    const isActive = currentPage === item.page;
    const Icon = item.icon;

    return (
      <button
        key={item.page}
        onClick={() => navigate(item.page)}
        className={`
          group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
          ${
            isActive
              ? 'bg-blue-500/10 text-blue-400 neon-glow-blue'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-lg border border-blue-500/30 bg-blue-500/10"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
          />
        )}
        <Icon
          className={`relative z-10 size-5 transition-colors ${
            isActive ? 'text-blue-400' : 'text-muted-foreground group-hover:text-foreground'
          }`}
        />
        <span className="relative z-10 truncate">{item.label}</span>
        {item.page === 'notifications' && unreadCount > 0 && (
          <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[10px] font-bold text-blue-400">
            {unreadCount}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4">
        <span className="flex size-8 items-center justify-center rounded-lg gradient-blue text-lg font-bold text-white shadow-lg">
          ◆
        </span>
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Nex<span className="text-glow-blue text-blue-400">Trade</span>{' '}
            <span className="text-muted-foreground font-normal text-xs">Pro</span>
          </h1>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors lg:hidden"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <Separator className="bg-border/50" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto crypto-scrollbar px-3 py-3 space-y-1">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menu
        </p>
        {mainNavItems.map(renderNavItem)}

        {isAdmin && (
          <>
            <Separator className="my-3 bg-border/50" />
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {isSuperAdmin() ? 'Admin Panel' : 'Agent Panel'}
            </p>
            {(isSuperAdmin() ? adminNavItems : subAgentNavItems).map(renderNavItem)}
          </>
        )}
      </nav>

      <Separator className="bg-border/50" />

      {/* User Section */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-2.5">
          <Avatar className="size-9 border border-blue-500/30">
            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-sm font-semibold text-blue-400">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.username || 'User'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email || 'user@email.com'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-screen w-[260px] flex-col glass-strong border-r border-border/50">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
              className="fixed top-0 left-0 z-50 h-screen w-[260px] flex-col glass-strong border-r border-border/50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}