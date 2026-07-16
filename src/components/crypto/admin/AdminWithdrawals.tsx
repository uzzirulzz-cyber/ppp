'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Pause, Ban, Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  held: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

interface ApiWithdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  status: string;
  walletAddress: string | null;
  bankDetails: unknown;
  note: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export default function AdminWithdrawals() {
  const authFetch = useAppStore((s) => s.authFetch);
  const [tab, setTab] = useState('all');
  const [withdrawals, setWithdrawals] = useState<ApiWithdrawal[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; id: string | null; label: string }>({ open: false, action: '', id: null, label: '' });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchWithdrawals = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      if (status && status !== 'all') params.set('status', status);
      const res = await authFetch(`/api/admin/withdrawals?${params}`);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals);
        // Compute per-status counts from the full (unfiltered) fetch
        if (status === 'all' || !status) {
          const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
          for (const w of data.withdrawals as ApiWithdrawal[]) {
            if (c[w.status] !== undefined) c[w.status]++;
          }
          setCounts(c);
        }
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch counts on mount (unfiltered)
  useEffect(() => {
    fetchWithdrawals('all');
  }, [fetchWithdrawals]);

  // Re-fetch when tab/filter changes
  useEffect(() => {
    fetchWithdrawals(tab);
  }, [tab, fetchWithdrawals]);

  const filtered = withdrawals as Array<ApiWithdrawal & { status: WithdrawalStatus }>;

  const handleAction = (id: string, action: string, label: string) => {
    setConfirmDialog({ open: true, action, id, label });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        Withdrawal Management
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-white/[0.03] border border-blue-500/10 rounded-lg h-10">
                {['all', 'pending', 'approved', 'rejected'].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="data-[state=active]:gradient-blue data-[state=active]:text-white text-slate-400 rounded-md text-xs capitalize h-8 px-4 transition-all"
                  >
                    {t} {t !== 'all' && (
                      <Badge className="ml-1.5 bg-white/10 text-white text-[10px] px-1.5 py-0 h-4 border-0">
                        {counts[t] ?? 0}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={tab} className="mt-4">
                <div className="overflow-x-auto crypto-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-500/10 hover:bg-transparent">
                        <TableHead className="text-xs text-slate-400 font-medium">ID</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium">User</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium">Amount</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium hidden sm:table-cell">Method</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium">Status</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-xs text-slate-400 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-40">
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filtered.map((withdrawal, i) => (
                        <TableRow
                          key={withdrawal.id}
                          className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                        >
                          <TableCell className="text-xs text-slate-400 font-mono">{withdrawal.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-slate-200 font-medium">{withdrawal.username}</p>
                              <p className="text-xs text-slate-500">{withdrawal.userId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-red-400 font-semibold">
                            ${withdrawal.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 hidden sm:table-cell">{withdrawal.method}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[withdrawal.status]} border text-xs capitalize px-2 py-0.5`}>
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 hidden md:table-cell">{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {withdrawal.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 px-2 gradient-green text-white hover:opacity-90 text-xs"
                                  onClick={() => handleAction(withdrawal.id, 'approve', 'Approve')}
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                  onClick={() => handleAction(withdrawal.id, 'reject', 'Reject')}
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
                                  onClick={() => handleAction(withdrawal.id, 'hold', 'Hold')}
                                >
                                  <Pause className="w-3 h-3 mr-1" /> Hold
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-slate-500/30 text-slate-400 hover:bg-slate-500/10 text-xs"
                                  onClick={() => handleAction(withdrawal.id, 'cancel', 'Cancel')}
                                >
                                  <Ban className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-blue-500/30 text-slate-400 hover:bg-blue-500/10 text-xs"
                                onClick={() => setDetailDialog({ open: true, id: withdrawal.id })}
                              >
                                <Eye className="w-3 h-3 mr-1" /> View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm">No withdrawals found for this filter.</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, action: '', id: null, label: '' })}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-200">
              {confirmDialog.label} Withdrawal
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Are you sure you want to {confirmDialog.label.toLowerCase()} withdrawal {confirmDialog.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9"
              onClick={() => setConfirmDialog({ open: false, action: '', id: null, label: '' })}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 h-9 text-white hover:opacity-90 ${
                confirmDialog.label === 'Approve' ? 'gradient-green' :
                confirmDialog.label === 'Reject' ? 'gradient-red' :
                confirmDialog.label === 'Hold' ? 'gradient-gold text-black' : 'bg-slate-600'
              }`}
              onClick={async () => {
                if (!confirmDialog.id) return;
                setActionLoading(true);
                try {
                  const res = await authFetch('/api/admin/withdrawals', {
                    method: 'PUT',
                    body: JSON.stringify({
                      withdrawalId: confirmDialog.id,
                      action: confirmDialog.action === 'approve' ? 'approve' : confirmDialog.action === 'reject' ? 'reject' : confirmDialog.action,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    fetchWithdrawals(tab);
                  }
                } catch (err) {
                  console.error('Action failed', err);
                } finally {
                  setActionLoading(false);
                  setConfirmDialog({ open: false, action: '', id: null, label: '' });
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {confirmDialog.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, id: null })}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Withdrawal Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-center py-6">
              <div className="w-full h-32 rounded-lg bg-white/[0.03] border border-blue-500/10 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Withdrawal receipt details</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">ID: {detailDialog.id}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}