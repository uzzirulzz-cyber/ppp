'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Minus, CreditCard, Gift, FileDown, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

const typeConfig: Record<string, { label: string; color: string }> = {
  deposit: { label: 'Deposit Credit', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  withdrawal: { label: 'Withdrawal Debit', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  bonus: { label: 'Bonus Credit', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  credit: { label: 'Balance Credit', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  debit: { label: 'Balance Debit', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  freeze: { label: 'Balance Freeze', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  unfreeze: { label: 'Balance Unfreeze', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export default function AdminFinance() {
  const { authFetch } = useAppStore();
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalBalance: 0, totalFrozen: 0, totalBonus: 0, totalProfit: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/finance');
      const data = await res.json();
      if (data.success) {
        setLedger(data.ledger);
        setSummary(data.summary);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleAdjust = async (type: 'credit' | 'debit' | 'freeze' | 'unfreeze', desc?: string) => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) return;
    setAdjusting(true);
    try {
      const res = await authFetch('/api/admin/finance', {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: selectedUser,
          type,
          amount: parseFloat(amount),
          description: desc || `${type} adjustment`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAmount('');
        fetchFinance();
      }
    } catch (err) {
      console.error('Failed to adjust balance:', err);
    } finally {
      setAdjusting(false);
    }
  };

  const formatAmount = (type: string, amt: number) => {
    const isPositive = ['deposit', 'bonus', 'credit', 'unfreeze'].includes(type);
    return `${isPositive ? '+' : '-'}$${Math.abs(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        Financial Management
      </motion.h1>

      {/* User Search / Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <Label className="text-sm text-slate-400 mb-2 block">Select User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search user by username, email, or UID..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
              />
            </div>
            {searchUser && (
              <div className="mt-2 max-h-32 overflow-y-auto crypto-scrollbar space-y-1">
                {searchUser && (
                  <button
                    onClick={() => { setSelectedUser(searchUser); setSearchUser(''); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedUser === searchUser
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'hover:bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <span className="font-medium">{searchUser}</span>
                  </button>
                )}
              </div>
            )}
            {selectedUser && (
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border text-sm px-3 py-1">
                  {selectedUser}
                </Badge>
                <button onClick={() => setSelectedUser('')} className="text-xs text-slate-500 hover:text-slate-300">
                  Clear
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Balance Adjustment Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Balance Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fiat Balance */}
              <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-blue-500/10">
                <Label className="text-sm text-slate-300 font-medium">Fiat Balance</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-9 text-xs gradient-green text-white hover:opacity-90"
                    disabled={adjusting || !selectedUser || !amount}
                    onClick={() => handleAdjust('credit', 'Fiat balance credit')}
                  >
                    {adjusting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Add
                  </Button>
                  <Button
                    className="flex-1 h-9 text-xs gradient-red text-white hover:opacity-90"
                    disabled={adjusting || !selectedUser || !amount}
                    onClick={() => handleAdjust('debit', 'Fiat balance debit')}
                  >
                    {adjusting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Minus className="w-3 h-3 mr-1" />} Subtract
                  </Button>
                </div>
              </div>

              {/* USDT Balance */}
              <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-blue-500/10">
                <Label className="text-sm text-slate-300 font-medium">USDT Balance</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-9 text-xs gradient-green text-white hover:opacity-90"
                    disabled={adjusting || !selectedUser || !amount}
                    onClick={() => handleAdjust('credit', 'USDT balance credit')}
                  >
                    {adjusting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CreditCard className="w-3 h-3 mr-1" />} Credit
                  </Button>
                  <Button
                    className="flex-1 h-9 text-xs gradient-red text-white hover:opacity-90"
                    disabled={adjusting || !selectedUser || !amount}
                    onClick={() => handleAdjust('debit', 'USDT balance debit')}
                  >
                    {adjusting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Minus className="w-3 h-3 mr-1" />} Debit
                  </Button>
                </div>
              </div>

              {/* Bonus */}
              <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-blue-500/10 md:col-span-2">
                <Label className="text-sm text-slate-300 font-medium">Credit Bonuses</Label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Bonus amount..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
                  />
                  <Button
                    className="h-10 px-6 gradient-purple text-white hover:opacity-90"
                    disabled={adjusting || !selectedUser || !amount}
                    onClick={() => handleAdjust('credit', 'Bonus credit')}
                  >
                    {adjusting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />} Credit Bonus
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300">Financial Ledger</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-blue-500/20 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400">
                <FileDown className="w-3 h-3 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs border-blue-500/20 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400">
                <FileDown className="w-3 h-3 mr-1" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs border-blue-500/20 text-slate-400 hover:bg-purple-500/10 hover:text-purple-400">
                <FileDown className="w-3 h-3 mr-1" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto crypto-scrollbar max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium">Date</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">User</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Type</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Amount</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Balance After</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden xl:table-cell">Description</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden xl:table-cell">By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Loading ledger data...</p>
                      </TableCell>
                    </TableRow>
                  ) : ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-sm text-slate-500">
                        No ledger entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.map((row, i) => {
                      const config = typeConfig[row.type] || { label: row.type, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
                      const amtStr = formatAmount(row.type, row.amount);
                      return (
                        <TableRow
                          key={row.id}
                          className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                        >
                          <TableCell className="text-xs text-slate-400 whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-slate-200 font-medium">{row.username}</p>
                              <p className="text-xs text-slate-500">{row.userId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={`${config.color} border text-xs px-2 py-0.5`}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-sm font-semibold ${amtStr.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {amtStr}
                          </TableCell>
                          <TableCell className="text-sm text-slate-300 hidden lg:table-cell">${row.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-xs text-slate-400 hidden xl:table-cell">{row.description}</TableCell>
                          <TableCell className="text-xs text-slate-500 hidden xl:table-cell">{row.createdBy}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}