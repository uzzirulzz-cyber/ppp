'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileDown, TrendingUp, DollarSign, ArrowDownCircle, ArrowUpCircle, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MOCK_ADMIN_STATS } from '@/lib/mock-data';

type ReportType = 'revenue' | 'deposits' | 'withdrawals' | 'trading-volume' | 'users' | 'profit';
type DateRange = '7d' | '30d' | '90d' | 'custom';

const reportTypes: { id: ReportType; label: string; icon: typeof TrendingUp; color: string }[] = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-emerald-400' },
  { id: 'deposits', label: 'Deposits', icon: ArrowDownCircle, color: 'text-blue-400' },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle, color: 'text-red-400' },
  { id: 'trading-volume', label: 'Trading Volume', icon: BarChart3, color: 'text-blue-400' },
  { id: 'users', label: 'Users', icon: Users, color: 'text-purple-400' },
  { id: 'profit', label: 'Profit', icon: TrendingUp, color: 'text-emerald-400' },
];

const dateRanges: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'custom', label: 'Custom' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 border border-blue-500/20 shadow-xl">
        <p className="text-sm text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
              ? entry.value > 1_000_000
                ? `$${(entry.value / 1_000_000).toFixed(2)}M`
                : `$${(entry.value / 1000).toFixed(1)}K`
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminReports() {
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const chartData = useMemo(() => {
    if (dateRange === '7d' || dateRange === '30d') {
      return MOCK_ADMIN_STATS.dailyStats;
    }
    return MOCK_ADMIN_STATS.monthlyStats.map((m) => ({
      date: m.month,
      deposits: m.deposits,
      withdrawals: m.withdrawals,
      users: m.users,
      trades: Math.round(m.users * 12),
      revenue: m.revenue,
    }));
  }, [dateRange]);

  const chartKey = useMemo(() => {
    switch (reportType) {
      case 'revenue': return 'revenue';
      case 'deposits': return 'deposits';
      case 'withdrawals': return 'withdrawals';
      case 'trading-volume': return 'trades';
      case 'users': return 'users';
      case 'profit': return 'revenue';
      default: return 'revenue';
    }
  }, [reportType]);

  const summaryData = useMemo(() => {
    const data = chartData;
    const sum = (key: string) => data.reduce((acc, d) => acc + (d as Record<string, number>)[key], 0);
    const avg = (key: string) => data.length ? sum(key) / data.length : 0;

    switch (reportType) {
      case 'revenue':
        return [
          { label: 'Total Revenue', value: `$${(sum('revenue') / 1000).toFixed(0)}K`, change: '+12.5%' },
          { label: 'Avg Daily', value: `$${(avg('revenue') / 1000).toFixed(1)}K`, change: '+8.3%' },
          { label: 'Peak Day', value: `$${(Math.max(...data.map(d => d.revenue)) / 1000).toFixed(0)}K`, change: '' },
          { label: 'Growth', value: '+12.5%', change: '' },
        ];
      case 'deposits':
        return [
          { label: 'Total Deposits', value: `$${(sum('deposits') / 1_000_000).toFixed(2)}M`, change: '+15.2%' },
          { label: 'Avg Deposit', value: `$${(avg('deposits') / 1000).toFixed(1)}K`, change: '+5.7%' },
          { label: 'Transactions', value: data.length * 42, change: '+18.0%' },
          { label: 'Pending', value: MOCK_ADMIN_STATS.pendingDeposits.toString(), change: '' },
        ];
      case 'withdrawals':
        return [
          { label: 'Total Withdrawals', value: `$${(sum('withdrawals') / 1_000_000).toFixed(2)}M`, change: '+8.1%' },
          { label: 'Avg Withdrawal', value: `$${(avg('withdrawals') / 1000).toFixed(1)}K`, change: '+3.2%' },
          { label: 'Transactions', value: data.length * 28, change: '+10.5%' },
          { label: 'Pending', value: MOCK_ADMIN_STATS.pendingWithdrawals.toString(), change: '' },
        ];
      case 'trading-volume':
        return [
          { label: 'Total Volume', value: `$${(sum('trades') / 1_000_000).toFixed(1)}M`, change: '+22.4%' },
          { label: 'Avg Daily', value: `$${(avg('trades') / 1000).toFixed(1)}K`, change: '+15.0%' },
          { label: 'Total Trades', value: sum('trades').toLocaleString(), change: '+18.7%' },
          { label: 'Win Rate', value: '62.4%', change: '+2.1%' },
        ];
      case 'users':
        return [
          { label: 'New Users', value: sum('users').toLocaleString(), change: '+25.0%' },
          { label: 'Avg Daily', value: avg('users').toFixed(0), change: '+18.3%' },
          { label: 'Total Users', value: MOCK_ADMIN_STATS.totalUsers.toLocaleString(), change: '+5.2%' },
          { label: 'Active', value: MOCK_ADMIN_STATS.activeTraders.toLocaleString(), change: '+12.8%' },
        ];
      case 'profit':
        return [
          { label: 'Platform Profit', value: `$${(MOCK_ADMIN_STATS.platformProfit / 1000).toFixed(0)}K`, change: '+18.6%' },
          { label: 'Profit Margin', value: '28.3%', change: '+3.1%' },
          { label: 'Revenue', value: `$${(MOCK_ADMIN_STATS.revenue / 1000).toFixed(0)}K`, change: '+12.5%' },
          { label: 'ROI', value: '156%', change: '+22.0%' },
        ];
    }
  }, [reportType, chartData]);

  const chartColor = useMemo(() => {
    switch (reportType) {
      case 'revenue': case 'profit': return '#10b981';
      case 'deposits': return '#3b82f6';
      case 'withdrawals': return '#ef4444';
      case 'trading-volume': return '#8b5cf6';
      case 'users': return '#a855f7';
      default: return '#3b82f6';
    }
  }, [reportType]);

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      margin: { top: 5, right: 10, left: 10, bottom: 5 },
    };

    const axisProps = {
      XAxis: <XAxis dataKey={dateRange === '90d' ? 'month' : 'date'} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />,
      YAxis: <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v > 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v > 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString()} />,
      Grid: <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />,
      TooltipContent: <Tooltip content={<CustomTooltip />} />,
    };

    if (reportType === 'revenue' || reportType === 'profit') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={`reportGrad-${reportType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            {axisProps.Grid}
            {axisProps.XAxis}
            {axisProps.YAxis}
            {axisProps.TooltipContent}
            <Area type="monotone" dataKey={chartKey} name={reportType === 'profit' ? 'Profit' : 'Revenue'} stroke={chartColor} strokeWidth={2} fill={`url(#reportGrad-${reportType})`} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (reportType === 'deposits' || reportType === 'withdrawals') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...chartProps}>
            {axisProps.Grid}
            {axisProps.XAxis}
            {axisProps.YAxis}
            {axisProps.TooltipContent}
            <Bar dataKey={chartKey} name={reportType === 'deposits' ? 'Deposits' : 'Withdrawals'} fill={chartColor} radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...chartProps}>
          {axisProps.Grid}
          {axisProps.XAxis}
          {axisProps.YAxis}
          {axisProps.TooltipContent}
          <Line type="monotone" dataKey={chartKey} name={reportType === 'trading-volume' ? 'Volume' : 'Users'} stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor, r: 3 }} activeDot={{ r: 5, fill: chartColor }} />
        </LineChart>
    </ResponsiveContainer>
  );
  };

  const tableData = useMemo(() => {
    return chartData.map((d, i) => ({
      period: dateRange === '90d' ? (d as Record<string, unknown>).month : (d as Record<string, unknown>).date,
      value: (d as Record<string, number>)[chartKey],
      change: ((Math.random() - 0.35) * 20).toFixed(1),
    }));
  }, [chartData, dateRange, chartKey]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        Reports & Analytics
      </motion.h1>

      {/* Report Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <TabsList className="bg-white/[0.03] border border-blue-500/10 rounded-lg h-10 flex-wrap">
                {reportTypes.map((rt) => (
                  <TabsTrigger
                    key={rt.id}
                    value={rt.id}
                    className="data-[state=active]:gradient-blue data-[state=active]:text-white text-slate-400 rounded-md text-xs h-8 px-3 transition-all flex items-center gap-1.5"
                  >
                    <rt.icon className="w-3.5 h-3.5" /> {rt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Date Range */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {dateRanges.map((dr) => (
            <Button
              key={dr.id}
              variant="outline"
              size="sm"
              className={`h-8 text-xs rounded-lg transition-all ${
                dateRange === dr.id
                  ? 'gradient-blue text-white border-0'
                  : 'border-blue-500/10 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400'
              }`}
              onClick={() => setDateRange(dr.id)}
            >
              {dr.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {summaryData.map((stat, i) => (
          <Card key={i} className="glass-card rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-bold text-slate-200">{stat.value}</p>
                {stat.change && (
                  <Badge className={`${stat.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border text-[10px] px-1.5 py-0`}>
                    {stat.change}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300 capitalize">
              {reportType.replace('-', ' ')} — {dateRanges.find(d => d.id === dateRange)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-80">
              {renderChart()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300">Detailed Data</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-blue-500/20 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
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
            <div className="overflow-x-auto crypto-scrollbar max-h-[350px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium">Period</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Value</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, i) => {
                    const changeNum = parseFloat(row.change);
                    return (
                      <TableRow
                        key={i}
                        className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                      >
                        <TableCell className="text-sm text-slate-300">{row.period}</TableCell>
                        <TableCell className="text-sm text-slate-200 font-semibold">
                          {row.value > 1_000_000
                            ? `$${(row.value / 1_000_000).toFixed(2)}M`
                            : row.value > 1000
                              ? `$${(row.value / 1000).toFixed(1)}K`
                              : reportType === 'users'
                                ? row.value.toString()
                                : `$${row.value.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${changeNum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {changeNum >= 0 ? '+' : ''}{row.change}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}