'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
};

export default function AdminDeposits() {
  const { authFetch } = useAppStore();
  const [tab, setTab] = useState('all');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | null; id: string | null }>({ open: false, action: null, id: null });
  const [proofDialog, setProofDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchDeposits = async (status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      if (status && status !== 'all') {
        params.set('status', status);
      }
      const res = await authFetch(`/api/admin/deposits?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDeposits(json.deposits);
      }
    } catch (err) {
      console.error('Failed to fetch deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '999',
      });
      const res = await authFetch(`/api/admin/deposits?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        const c: Record<string, number> = {};
        for (const d of json.deposits) {
          c[d.status] = (c[d.status] || 0) + 1;
        }
        setCounts(c);
      }
    } catch (err) {
      console.error('Failed to fetch deposit counts:', err);
    }
  };

  useEffect(() => {
    fetchDeposits(tab);
    fetchCounts();
  }, [tab]);

  const filtered = deposits; // API already filters by status via tab

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setConfirmDialog({ open: true, action, id });
  };

  const confirmAction = async () => {
    if (!confirmDialog.action || !confirmDialog.id) return;
    try {
      const res = await authFetch('/api/admin/deposits', {
        method: 'PUT',
        body: JSON.stringify({
          depositId: confirmDialog.id,
          action: confirmDialog.action,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDeposits(tab);
        await fetchCounts();
      }
    } catch (err) {
      console.error('Failed to update deposit:', err);
    }
    setConfirmDialog({ open: false, action: null, id: null });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        Deposit Management
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
                        {counts[t] || 0}
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
                          <TableCell colSpan={7} className="text-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-400" />
                          </TableCell>
                        </TableRow>
                      ) : filtered.map((deposit, i) => (
                        <TableRow
                          key={deposit.id}
                          className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                        >
                          <TableCell className="text-xs text-slate-400 font-mono">{deposit.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-slate-200 font-medium">{deposit.username}</p>
                              <p className="text-xs text-slate-500">{deposit.userId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-emerald-400 font-semibold">
                            ${deposit.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 hidden sm:table-cell">{deposit.method}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[deposit.status]} border text-xs capitalize px-2 py-0.5`}>
                              {deposit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 hidden md:table-cell">{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {deposit.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 px-2 gradient-green text-white hover:opacity-90 text-xs"
                                  onClick={() => handleAction(deposit.id, 'approve')}
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                  onClick={() => handleAction(deposit.id, 'reject')}
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                                  onClick={() => setProofDialog({ open: true, id: deposit.id })}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-blue-500/30 text-slate-400 hover:bg-blue-500/10 text-xs"
                                onClick={() => setProofDialog({ open: true, id: deposit.id })}
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
                  <div className="text-center py-12 text-slate-500 text-sm">No deposits found for this filter.</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, action: null, id: null })}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className={`text-slate-200 ${confirmDialog.action === 'approve' ? '' : 'text-red-400'}`}>
              {confirmDialog.action === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Are you sure you want to {confirmDialog.action} deposit {confirmDialog.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9"
              onClick={() => setConfirmDialog({ open: false, action: null, id: null })}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 h-9 ${confirmDialog.action === 'approve' ? 'gradient-green' : 'gradient-red'} text-white hover:opacity-90`}
              onClick={confirmAction}
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Dialog */}
      <Dialog open={proofDialog.open} onOpenChange={(open) => setProofDialog({ open, id: null })}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Deposit Proof</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-full h-48 rounded-lg bg-white/[0.03] border border-blue-500/10 flex items-center justify-center mb-4">
              <div className="text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Deposit proof image</p>
                <p className="text-xs text-slate-600">Transaction screenshot / receipt</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">ID: {proofDialog.id}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}