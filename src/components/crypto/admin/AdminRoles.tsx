'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, DollarSign, Headphones, TrendingUp, ShieldCheck, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const allPermissions = [
  'User Management', 'Financial', 'Deposits', 'Withdrawals',
  'Trading', 'Coins', 'Support', 'Notifications', 'Reports', 'Settings',
];

const roles = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full access to all platform features and settings. Can manage other admins.',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    borderHover: 'hover:border-purple-500/30',
    admins: 2,
    permissions: allPermissions,
  },
  {
    id: 'finance-admin',
    name: 'Finance Admin',
    description: 'Manages deposits, withdrawals, balance adjustments, and financial reports.',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    borderHover: 'hover:border-emerald-500/30',
    admins: 3,
    permissions: ['Financial', 'Deposits', 'Withdrawals', 'Reports'],
  },
  {
    id: 'support-admin',
    name: 'Support Admin',
    description: 'Handles support tickets, user inquiries, and account verification.',
    icon: Headphones,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    borderHover: 'hover:border-blue-500/30',
    admins: 5,
    permissions: ['User Management', 'Support', 'Notifications'],
  },
  {
    id: 'trading-admin',
    name: 'Trading Admin',
    description: 'Manages trading pairs, coin listings, and monitors trading activity.',
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    borderHover: 'hover:border-amber-500/30',
    admins: 2,
    permissions: ['Trading', 'Coins', 'Reports'],
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Basic access for content moderation and user support. Limited permissions.',
    icon: ShieldCheck,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    borderHover: 'hover:border-slate-500/30',
    admins: 8,
    permissions: ['Support', 'Notifications'],
  },
];

export default function AdminRoles() {
  const [addDialog, setAddDialog] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-glow-blue"
        >
          Role Management
        </motion.h1>
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-white hover:opacity-90 h-9 text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-blue-500/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Username</Label>
                <Input placeholder="Enter admin username" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Email</Label>
                <Input type="email" placeholder="Enter admin email" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 placeholder:text-slate-500 rounded-lg h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Role</Label>
                <Select defaultValue="support-admin">
                  <SelectTrigger className="bg-white/[0.03] border-blue-500/10 text-slate-200 rounded-lg h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-blue-500/20">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-slate-300">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9" onClick={() => setAddDialog(false)}>
                Cancel
              </Button>
              <Button className="gradient-blue text-white hover:opacity-90 h-9" onClick={() => setAddDialog(false)}>
                Add Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <Card className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:${role.borderHover} hover:border-opacity-50`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${role.bg}`}>
                      <role.icon className={`w-5 h-5 ${role.color}`} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-200">{role.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500">{role.admins} assigned</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 border text-xs px-2 py-0.5">
                    {role.permissions.length} perms
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{role.description}</p>

                <Separator className="bg-blue-500/10 mb-4" />

                <div className="grid grid-cols-2 gap-1.5">
                  {allPermissions.map((perm) => {
                    const has = role.permissions.includes(perm);
                    return (
                      <div key={perm} className="flex items-center gap-1.5">
                        <Checkbox
                          checked={has}
                          disabled
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-3.5 w-3.5 rounded"
                        />
                        <span className={`text-[11px] ${has ? 'text-slate-300' : 'text-slate-600'}`}>
                          {perm}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Permission Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-300">Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto crypto-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/10 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-medium sticky left-0 bg-transparent min-w-[140px]">Permission</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-xs text-slate-400 font-medium text-center min-w-[100px]">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPermissions.map((perm, i) => (
                    <TableRow
                      key={perm}
                      className={`border-blue-500/[0.06] hover:bg-blue-500/[0.03] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                    >
                      <TableCell className="text-sm text-slate-300 font-medium sticky left-0 bg-transparent">
                        {perm}
                      </TableCell>
                      {roles.map((role) => {
                        const has = role.permissions.includes(perm);
                        return (
                          <TableCell key={role.id} className="text-center">
                            {has ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.03]">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
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