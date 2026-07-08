'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, FileDown, TrendingUp, BarChart3, DollarSign, Percent, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/lib/store';

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function AdminTrading() {
  const { authFetch } = useAppStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [trades, setTrades] = useState<{
    id: string; user: string; uid: string; coin: string; direction: string;
    amount: number; entry: number; exit: number | null; duration: string;
    status: string; profit: number; startedAt?: string; closedAt?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTrades, setTotalTrades] = useState(0);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      const res = await authFetch(`/api/admin/trading?${params}`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.trades.map((t: Record<string, unknown>) => ({
          id: t.id,
          user: t.username,
          uid: t.userId,
          coin: t.pair,
          direction: t.direction,
          amount: t.amount,
          entry: t.entryPrice,
          exit: t.exitPrice ?? null,
          duration: formatDuration(t.duration as number),
          status: t.status,
          profit: t.profit,
          startedAt: t.startedAt,
          closedAt: t.closedAt,
        }));
        setTrades(mapped);
        setTotalTrades(json.pagination?.total ?? mapped.length);
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const filtered = trades.filter(
    (t) =>
      (tab === 'all' || t.status === tab) &&
      (t.coin.toLowerCase().includes(search.toLowerCase()) ||
        t.uid.toLowerCase().includes(search.toLowerCase()) ||
        t.user.toLowerCase().includes(search.toLowerCase())),
  );

  const openCount = trades.filter((t) => t.status === 'open').length;
  const wonCount = trades.filter((t) => t.status === 'won').length;
  const lostCount = trades.filter((t) => t.status === 'lost').length;
  const settledTotal = wonCount + lostCount;
  const winRate = settledTotal > 0 ? ((wonCount / settledTotal) * 100).toFixed(1) : '0.0';
  const platformRevenue = trades
    .filter((t) => t.profit < 0)
    .reduce((sum, t) => sum + Math.abs(t.profit), 0);

  const summaryStats = [
    { label: 'Total Trades', value: totalTrades.toLocaleString(), icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Open Trades', value: openCount.toLocaleString(), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Platform Revenue', value: `$${platformRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-glow-blue"
        >
          Trading Management
        </motion.h1>
        <Button variant="outline" size="sm" className="h-9 text-xs border-blue-500/20 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400">
          <FileDown className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="glass-card rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-200">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by coin, UID, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
              />
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-white/[0.03] border border-blue-500/10 rounded-lg h-9">
                {['all', 'open', 'closed', 'won', 'lost'].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="data-[state=active]:gradient-blue data-[state=active]:text-white text-slate-400 rounded-md text-xs capitalize h-7 px-3 transition-all"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : (
            <div className="overflow-x-auto crypto-scrollbar max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium">Trade ID</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">User</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Coin</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden sm:table-cell">Dir</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Amount</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Entry</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Exit</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Duration</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Status</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((trade, i) => (
                    <TableRow
                      key={trade.id}
                      className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                    >
                      <TableCell className="text-xs text-slate-400 font-mono">{trade.id}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-200 font-medium">{trade.user}</p>
                        <p className="text-xs text-slate-500">{trade.uid}</p>
                      </TableCell>
                      <TableCell className="text-sm text-blue-400 font-medium">{trade.coin}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`text-xs font-medium ${trade.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.direction === 'up' ? '▲' : '▼'} {trade.direction.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-200">${trade.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-slate-300 hidden md:table-cell font-mono">
                        {trade.entry >= 100 ? trade.entry.toLocaleString(undefined, { maximumFractionDigits: 2 }) : trade.entry}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 hidden lg:table-cell font-mono">
                        {trade.exit ? (trade.exit >= 100 ? trade.exit.toLocaleString(undefined, { maximumFractionDigits: 2 }) : trade.exit) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 hidden lg:table-cell">{trade.duration}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[trade.status]} border text-xs capitalize px-2 py-0.5`}>
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-sm font-semibold text-right ${trade.profit > 0 ? 'text-emerald-400' : trade.profit < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {trade.profit > 0 ? '+' : ''}${Math.abs(trade.profit).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">No trades found.</div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}