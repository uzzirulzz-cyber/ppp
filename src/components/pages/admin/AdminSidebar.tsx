'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCog,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  HelpCircle,
  Coins,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore, type Page } from '@/lib/store';

interface NavItem {
  label: string;
  page: Page;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', page: 'admin-dashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'admin-users', icon: Users },
  { label: 'Agents', page: 'admin-agents', icon: UserCog },
  { label: 'Trading', page: 'admin-trading', icon: TrendingUp },
  { label: 'Deposits', page: 'admin-deposits', icon: ArrowDownCircle },
  { label: 'Withdrawals', page: 'admin-withdrawals', icon: ArrowUpCircle },
  { label: 'Finance', page: 'admin-finance', icon: DollarSign },
  { label: 'Support', page: 'admin-support', icon: HelpCircle },
  { label: 'Coins', page: 'admin-coins', icon: Coins },
  { label: 'Notifications', page: 'admin-notifications', icon: Bell },
  { label: 'Settings', page: 'admin-settings', icon: Settings },
];

export default function AdminSidebar() {
  const { currentPage, navigate, logout, isSuperAdmin, user, sidebarOpen, setSidebarOpen } =
    useAppStore();
  const superAdmin = isSuperAdmin();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0d1117] lg:relative lg:z-auto lg:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <span className="text-sm font-bold text-blue-400">◆</span>
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              NextradePro.Top <span className="text-blue-400">Admin</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.page}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate(item.page);
                  setSidebarOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/5 p-4 space-y-3">
          {/* Role Badge */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
              {(user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || 'Admin'}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  superAdmin
                    ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20'
                    : 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20'
                }`}
              >
                {superAdmin ? 'Super Admin' : 'Sub Agent'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}