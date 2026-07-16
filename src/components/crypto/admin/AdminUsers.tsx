'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Pencil, Ban, Snowflake, ShieldCheck, KeyRound, MoreHorizontal, Loader2, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

interface ApiUser {
  id: string;
  uid: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  balance: number;
  frozenBalance: number;
  bonusBalance: number;
  totalProfit: number;
  subAgentId: string | null;
  invitationCode: string | null;
  mustChangePass: boolean;
  subAgentName: string | null;
  tradeCount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  banned: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

export default function AdminUsers() {
  const { isSuperAdmin, authFetch } = useAppStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: debouncedSearch });
        const res = await authFetch(`/api/users?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUsers(data.users);
          }
        }
      } catch (e) {
        console.error('Users fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [authFetch, debouncedSearch]);

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId);
    try {
      const res = await authFetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            if (action === 'suspend') return { ...u, status: 'suspended' };
            if (action === 'activate') return { ...u, status: 'active' };
            if (action === 'ban') return { ...u, status: 'banned' };
          }
          return u;
        }));
      }
    } catch (e) {
      console.error('Action error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        {isSuperAdmin() ? 'User Management' : 'My Customers'}
      </motion.h1>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by username, email, or UID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              {isSuperAdmin() ? 'All Users' : 'My Customers'} ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No users found</p>
                {isSuperAdmin() && <p className="text-xs mt-1">Share invitation codes (PB-AG001 to PB-AG005) to onboard customers</p>}
              </div>
            ) : (
              <div className="overflow-x-auto crypto-scrollbar max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-500/10 hover:bg-transparent">
                      <TableHead className="text-xs text-slate-400 font-medium">UID</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium">Username</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium">Balance</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium">Status</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Role</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Trades</TableHead>
                      <TableHead className="text-xs text-slate-400 font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody variants={container} initial="hidden" animate="show">
                    {users.map((u) => (
                      <TableRow
                        key={u.id}
                        variants={item}
                        className="border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors"
                      >
                        <TableCell className="text-xs text-slate-400 font-mono">{u.uid}</TableCell>
                        <TableCell className="text-sm text-slate-200 font-medium">{u.username}</TableCell>
                        <TableCell className="text-xs text-slate-400 hidden md:table-cell">{u.email}</TableCell>
                        <TableCell className="text-sm text-emerald-400 font-semibold">
                          ${u.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[u.status] || statusColors.pending} border text-xs capitalize px-2 py-0.5`}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 hidden lg:table-cell capitalize">
                          {u.role === 'sub_agent' ? 'Agent' : u.role === 'super_admin' ? 'Super Admin' : 'User'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-300 hidden lg:table-cell">{u.tradeCount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10" disabled={actionLoading === u.id}>
                                {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <MoreHorizontal className="w-4 h-4 text-slate-400" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-strong border-blue-500/20 min-w-[180px]" align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedUser(u)}
                                className="text-slate-300 focus:bg-blue-500/10 focus:text-blue-400 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              {u.status === 'active' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleAction(u.id, 'suspend')}
                                    className="text-slate-300 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer"
                                  >
                                    <Snowflake className="w-4 h-4 mr-2" /> Suspend
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleAction(u.id, 'ban')}
                                    className="text-slate-300 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                  >
                                    <Ban className="w-4 h-4 mr-2" /> Ban
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(u.status === 'suspended' || u.status === 'banned') && (
                                <DropdownMenuItem
                                  onClick={() => handleAction(u.id, 'activate')}
                                  className="text-slate-300 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" /> Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator className="bg-blue-500/10" />
                              <DropdownMenuItem
                                onClick={() => handleAction(u.id, 'reset_password')}
                                className="text-slate-300 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer"
                              >
                                <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-200">User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-blue flex items-center justify-center text-xl font-bold text-white">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-200">{selectedUser.username}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                  <Badge className={`${statusColors[selectedUser.status]} border text-xs capitalize px-2 py-0.5 mt-1`}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              <Separator className="bg-blue-500/10" />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'UID', value: selectedUser.uid },
                  { label: 'Role', value: selectedUser.role === 'sub_agent' ? 'Sub-Agent' : selectedUser.role === 'super_admin' ? 'Super Admin' : 'Customer' },
                  { label: 'Balance', value: `$${selectedUser.balance.toLocaleString()}` },
                  { label: 'Frozen', value: `$${selectedUser.frozenBalance.toLocaleString()}` },
                  { label: 'Bonus', value: `$${selectedUser.bonusBalance.toLocaleString()}` },
                  { label: 'Total Profit', value: `$${selectedUser.totalProfit.toLocaleString()}` },
                  { label: 'Total Trades', value: selectedUser.tradeCount.toString() },
                  { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString() },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-slate-500 mb-1">{field.label}</p>
                    <p className="text-sm text-slate-200 font-medium capitalize">{field.value}</p>
                  </div>
                ))}
                {selectedUser.subAgentName && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Referred By Agent</p>
                    <p className="text-sm text-blue-400 font-medium">{selectedUser.subAgentName}</p>
                  </div>
                )}
              </div>
              <Separator className="bg-blue-500/10" />
              <div className="flex gap-2">
                {selectedUser.status === 'active' ? (
                  <Button onClick={() => handleAction(selectedUser.id, 'suspend')} className="flex-1 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-9 text-sm">
                    Suspend User
                  </Button>
                ) : (
                  <Button onClick={() => handleAction(selectedUser.id, 'activate')} className="flex-1 gradient-blue text-white hover:opacity-90 h-9 text-sm">
                    Activate User
                  </Button>
                )}
                <Button
                  onClick={() => handleAction(selectedUser.id, 'reset_password')}
                  variant="outline"
                  className="flex-1 border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9 text-sm"
                >
                  Reset Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}