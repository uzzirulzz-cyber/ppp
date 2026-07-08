'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Users,
  User,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { useAppStore, type Page } from '@/lib/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  icon: React.ElementType;
  label: string;
  page: Page;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: TrendingUp, label: 'Trade', page: 'trade' },
  { icon: Wallet, label: 'Wallet', page: 'wallet' },
  { icon: ArrowDownCircle, label: 'Deposit', page: 'deposit' },
  { icon: ArrowUpCircle, label: 'Withdraw', page: 'withdraw' },
  { icon: History, label: 'Transactions', page: 'transaction-history' },
  { icon: Users, label: 'Referral', page: 'referral' },
  { icon: User, label: 'Profile', page: 'profile' },
  { icon: Bell, label: 'Notifications', page: 'notifications' },
];

const roleBadgeMap: Record<string, { label: string; className: string }> = {
  user: { label: 'Trader', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  sub_agent: { label: 'Agent', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  super_admin: { label: 'Admin', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export default function Sidebar() {
  const { currentPage, navigate, user, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  const handleNavClick = (page: Page) => {
    navigate(page);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-blue-500 text-2xl font-bold">◆</span>
          <span className="text-white text-lg font-bold tracking-tight">NexTrade Pro</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.page}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavClick(item.page)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} />
                <span>{item.label}</span>
                {item.page === 'notifications' && user && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.username || 'User'}
            </p>
            {user?.role && (
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 mt-0.5 ${roleBadgeMap[user.role]?.className || 'bg-white/5 text-gray-400 border-white/10'}`}
              >
                {roleBadgeMap[user.role]?.label || user.role}
              </Badge>
            )}
          </div>
        </div>

        <Separator className="bg-white/10 mb-3" />

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}