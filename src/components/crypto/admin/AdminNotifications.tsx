'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, Wrench, Megaphone, ShieldAlert, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const mockNotifications = [
  { id: 'N001', type: 'maintenance', title: 'Scheduled Maintenance', message: 'Platform maintenance on June 25, 2025 from 02:00-04:00 UTC.', target: 'all', sentBy: 'Admin', date: '2025-06-23 14:00', status: 'sent' },
  { id: 'N002', type: 'promotion', title: 'Weekend Trading Bonus', message: 'Get 10% bonus on all deposits this weekend!', target: 'all', sentBy: 'Admin', date: '2025-06-22 10:00', status: 'sent' },
  { id: 'N003', type: 'security', title: 'Two-Factor Authentication', message: 'Please enable 2FA on your account for enhanced security.', target: 'individual', sentBy: 'System', date: '2025-06-21 08:00', status: 'sent' },
  { id: 'N004', type: 'promotion', title: 'VIP Exclusive Offer', message: 'Upgrade to VIP and get 20% reduced trading fees.', target: 'vip', sentBy: 'Admin', date: '2025-06-20 16:00', status: 'sent' },
  { id: 'N005', type: 'maintenance', title: 'System Update Complete', message: 'All systems have been updated successfully.', target: 'all', sentBy: 'System', date: '2025-06-19 12:00', status: 'sent' },
];

const typeColors: Record<string, string> = {
  maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  promotion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const templates = [
  { label: 'Maintenance Notice', icon: Wrench, type: 'maintenance', title: 'Scheduled Maintenance', message: 'The platform will undergo scheduled maintenance. Please save your work and log out before the maintenance window.' },
  { label: 'Promotion', icon: Megaphone, type: 'promotion', title: 'Special Promotion', message: 'Limited time offer! Enjoy exclusive trading bonuses and rewards.' },
  { label: 'Security Alert', icon: ShieldAlert, type: 'security', title: 'Security Advisory', message: 'We have detected unusual activity. Please verify your account security settings immediately.' },
];

export default function AdminNotifications() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ type: '', title: '', message: '', target: 'all' });

  const applyTemplate = (tpl: typeof templates[0]) => {
    setForm({ type: tpl.type, title: tpl.title, message: tpl.message, target: 'all' });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-glow-blue"
        >
          Notification Center
        </motion.h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-white hover:opacity-90 h-9 text-sm">
              <Plus className="w-4 h-4 mr-2" /> Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-blue-500/20 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Create Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Quick Templates */}
              <div>
                <Label className="text-sm text-slate-400 mb-2 block">Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((tpl) => (
                    <Button
                      key={tpl.label}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-blue-500/20 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                      onClick={() => applyTemplate(tpl)}
                    >
                      <tpl.icon className="w-3 h-3 mr-1.5" /> {tpl.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-white/[0.03] border-blue-500/10 text-slate-200 rounded-lg h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-blue-500/20">
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="security">Security Alert</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Target</Label>
                  <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                    <SelectTrigger className="bg-white/[0.03] border-blue-500/10 text-slate-200 rounded-lg h-10">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-blue-500/20">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="individual">Individual User</SelectItem>
                      <SelectItem value="vip">VIP Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Notification title..."
                  className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Notification message..."
                  rows={4}
                  className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg resize-none"
                />
              </div>

              {form.target === 'individual' && (
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">User UID or Email</Label>
                  <Input
                    placeholder="Enter UID or email..."
                    className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button className="gradient-blue text-white hover:opacity-90 h-9" onClick={() => setCreateOpen(false)}>
                <Send className="w-4 h-4 mr-2" /> Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" /> Notification History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto crypto-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium">ID</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Type</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Title</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Target</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Sent By</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Date</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockNotifications.map((n, i) => (
                    <TableRow
                      key={n.id}
                      className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                    >
                      <TableCell className="text-xs text-slate-400 font-mono">{n.id}</TableCell>
                      <TableCell>
                        <Badge className={`${typeColors[n.type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'} border text-xs capitalize px-2 py-0.5`}>
                          {n.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-200 font-medium max-w-[200px] truncate">{n.title}</TableCell>
                      <TableCell className="text-xs text-slate-400 hidden md:table-cell capitalize">{n.target}</TableCell>
                      <TableCell className="text-xs text-slate-400 hidden lg:table-cell">{n.sentBy}</TableCell>
                      <TableCell className="text-xs text-slate-400 whitespace-nowrap">{n.date}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs px-2 py-0.5">
                          {n.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}