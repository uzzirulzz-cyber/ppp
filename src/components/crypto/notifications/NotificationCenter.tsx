'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  TrendingUp,
  ArrowDownCircle,
  Shield,
  Gift,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  trade: {
    icon: <TrendingUp className="w-4.5 h-4.5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  deposit: {
    icon: <ArrowDownCircle className="w-4.5 h-4.5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  security: {
    icon: <Shield className="w-4.5 h-4.5" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  promo: {
    icon: <Gift className="w-4.5 h-4.5" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  general: {
    icon: <Bell className="w-4.5 h-4.5" />,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
  },
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationCenter() {
  const { notifications, markNotificationRead, goBack } = useAppStore();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) markNotificationRead(n.id);
    });
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-muted-foreground"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-500/5 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 opacity-30" />
      </div>
      <p className="text-sm font-medium mb-1">No notifications</p>
      <p className="text-xs opacity-60">
        {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications yet`}
      </p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 space-y-5 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 hover:bg-blue-500/10 text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full gradient-blue text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 px-2.5"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-crypto-navy/50 border border-blue-500/10 w-full overflow-x-auto crypto-scrollbar">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            All
          </TabsTrigger>
          <TabsTrigger value="trade" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Trades
          </TabsTrigger>
          <TabsTrigger value="deposit" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Deposits
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Security
          </TabsTrigger>
          <TabsTrigger value="promo" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Promotions
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="all" className="mt-0">
            <NotificationList notifications={filteredNotifications} onRead={markNotificationRead} />
          </TabsContent>
          <TabsContent value="trade" className="mt-0">
            <NotificationList notifications={filteredNotifications} onRead={markNotificationRead} />
          </TabsContent>
          <TabsContent value="deposit" className="mt-0">
            <NotificationList notifications={filteredNotifications} onRead={markNotificationRead} />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <NotificationList notifications={filteredNotifications} onRead={markNotificationRead} />
          </TabsContent>
          <TabsContent value="promo" className="mt-0">
            <NotificationList notifications={filteredNotifications} onRead={markNotificationRead} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}

function NotificationList({
  notifications,
  onRead,
}: {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  onRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/5 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 opacity-30" />
        </div>
        <p className="text-sm font-medium mb-1">No notifications</p>
        <p className="text-xs opacity-60">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto crypto-scrollbar pr-1">
      <AnimatePresence initial={false}>
        {notifications.map((n) => {
          const config = TYPE_ICONS[n.type] || TYPE_ICONS.general;
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => !n.isRead && onRead(n.id)}
              className={`relative rounded-xl p-4 transition-all duration-300 cursor-pointer group ${
                n.isRead
                  ? 'glass-card hover:border-blue-500/20'
                  : 'glass-strong border-l-2 border-l-blue-500 bg-blue-500/[0.03] hover:bg-blue-500/[0.06]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${n.isRead ? 'text-white/70' : 'text-white'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${n.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                    {n.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1.5">{getTimeAgo(n.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}