'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, UserCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const mockMessages: Record<string, Array<{ from: string; role: string; message: string; time: string }>> = {
  T001: [
    { from: 'alice_crypto', role: 'user', message: 'I deposited $5,000 USDT 2 hours ago but it has not been credited to my account. The transaction was confirmed on the blockchain.', time: '15:30' },
    { from: 'Support Agent', role: 'admin', message: 'Thank you for reaching out. Let me check the deposit status for you. Could you please share the transaction hash?', time: '15:35' },
    { from: 'alice_crypto', role: 'user', message: 'Here is the tx hash: 0x7a3b...f92e. I can see it confirmed on etherscan.', time: '15:38' },
    { from: 'Support Agent', role: 'admin', message: 'I found the transaction. It seems the deposit is stuck in our processing queue due to a network delay. I will escalate this to the finance team for immediate processing.', time: '15:45' },
  ],
  T002: [
    { from: 'bob_trader', role: 'user', message: 'My withdrawal of $3,000 has been pending for 24 hours. When will it be processed?', time: '14:00' },
    { from: 'Support Agent', role: 'admin', message: 'We apologize for the delay. Your withdrawal is currently under review. We expect it to be processed within the next few hours.', time: '14:15' },
    { from: 'bob_trader', role: 'user', message: 'It has been 24 hours already. This is unacceptable. I need my funds urgently.', time: '14:20' },
  ],
  T003: [
    { from: 'diana_trade', role: 'user', message: 'I cannot complete my account verification. The KYC page keeps showing an error when I upload my ID.', time: '12:00' },
    { from: 'Support Agent', role: 'admin', message: 'Sorry about that. Please try clearing your browser cache and using a different browser. Also, make sure the image is in JPG format and under 5MB.', time: '12:10' },
    { from: 'diana_trade', role: 'user', message: 'That worked! Thank you so much for the quick help.', time: '12:20' },
    { from: 'Support Agent', role: 'admin', message: 'Glad to help! Your verification is now approved. Happy trading!', time: '12:25' },
  ],
  T004: [
    { from: 'helen_vip', role: 'user', message: 'I would like to request a VIP upgrade. I have been trading over $500K monthly volume.', time: '10:00' },
    { from: 'Support Agent', role: 'admin', message: 'Thank you for your interest in our VIP program. I will review your account activity and get back to you shortly.', time: '10:10' },
  ],
};

const adminAgents = ['Admin Alpha', 'Admin Beta', 'Admin Gamma'];

interface Ticket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupport() {
  const { authFetch } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      const res = await authFetch(`/api/admin/support?${params}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Pick<Ticket, 'status' | 'priority' | 'assignedTo'>>) => {
    try {
      const res = await authFetch('/api/admin/support', {
        method: 'PUT',
        body: JSON.stringify({ ticketId, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  }, [selectedTicket]);

  const filtered = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.username.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-glow-blue"
      >
        Support Tickets
      </motion.h1>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tickets by ID, subject, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tickets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto crypto-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium">ID</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">User</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Subject</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium">Status</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden sm:table-cell">Priority</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs text-slate-400 font-medium hidden lg:table-cell">Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                  filtered.map((ticket, i) => (
                    <TableRow
                      key={ticket.id}
                      className={`border-blue-500/[0.06] hover:bg-blue-500/[0.05] transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <TableCell className="text-xs text-slate-400 font-mono">{ticket.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                            {ticket.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-slate-200 font-medium">{ticket.username}</p>
                            <p className="text-xs text-slate-500">{ticket.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-200">{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[ticket.status]} border text-xs capitalize px-2 py-0.5`}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`${priorityColors[ticket.priority]} border text-xs capitalize px-2 py-0.5`}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 hidden md:table-cell">{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Select value={ticket.assignedTo || ''} onValueChange={(val) => updateTicket(ticket.id, { assignedTo: val })}>
                          <SelectTrigger className="h-7 bg-white/[0.03] border-blue-500/10 text-xs text-slate-300 w-[130px] rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-blue-500/20">
                            {adminAgents.map((agent) => (
                              <SelectItem key={agent} value={agent} className="text-slate-300 text-xs">
                                {agent}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversation Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-slate-200">{selectedTicket?.subject}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">{selectedTicket?.id} • {selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : ''}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`${statusColors[selectedTicket?.status || 'open']} border text-xs capitalize px-2 py-0.5`}>
                  {selectedTicket?.status}
                </Badge>
                <Badge className={`${priorityColors[selectedTicket?.priority || 'medium']} border text-xs capitalize px-2 py-0.5`}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <Separator className="bg-blue-500/10" />

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4 crypto-scrollbar">
            <div className="space-y-4 py-2">
              {(mockMessages[selectedTicket?.id || ''] || []).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-3 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'admin' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {msg.role === 'admin' ? (
                      <UserCircle className="w-5 h-5 text-blue-400" />
                    ) : (
                      <div className="text-xs font-bold text-purple-400">
                        {msg.from.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`max-w-[75%] ${msg.role === 'admin' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${msg.role === 'admin' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {msg.from}
                      </span>
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                    <div className={`inline-block rounded-lg px-3 py-2 text-sm text-slate-200 ${
                      msg.role === 'admin'
                        ? 'bg-blue-500/10 border border-blue-500/10'
                        : 'bg-white/[0.03] border border-blue-500/[0.06]'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="bg-blue-500/10" />

          {/* Reply */}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10"
              onKeyDown={(e) => { if (e.key === 'Enter') setReply(''); }}
            />
            <Button className="gradient-blue text-white hover:opacity-90 h-10 px-4" onClick={() => setReply('')}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}