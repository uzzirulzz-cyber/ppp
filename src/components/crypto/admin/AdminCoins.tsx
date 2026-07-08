'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MOCK_COINS } from '@/lib/mock-data';

export default function AdminCoins() {
  const [coins, setCoins] = useState(MOCK_COINS.map((c) => ({ ...c, tradingEnabled: true })));
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<typeof coins[0] | null>(null);

  const toggleTrading = (id: string) => {
    setCoins((prev) => prev.map((c) => (c.id === id ? { ...c, tradingEnabled: !c.tradingEnabled } : c)));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-glow-blue"
        >
          Coin Management
        </motion.h1>
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-white hover:opacity-90 h-9 text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add New Coin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-blue-500/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Add New Coin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Symbol</Label>
                  <Input placeholder="e.g. PEPE" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Name</Label>
                  <Input placeholder="e.g. Pepe" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Pair</Label>
                <Input placeholder="e.g. PEPE/USDT" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Price (USDT)</Label>
                  <Input type="number" placeholder="0.00" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Logo Character</Label>
                  <Input placeholder="e.g. 🐸" className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9" onClick={() => setAddDialog(false)}>
                Cancel
              </Button>
              <Button className="gradient-blue text-white hover:opacity-90 h-9" onClick={() => setAddDialog(false)}>
                Add Coin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coin Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {coins.map((coin, i) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
          >
            <Card className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${coin.tradingEnabled ? '' : 'opacity-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-xl">
                      {coin.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{coin.name}</p>
                      <p className="text-xs text-slate-500">{coin.pair}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    onClick={() => setEditDialog(coin)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-slate-200">
                      ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
                    </p>
                  </div>
                  <Badge className={`${coin.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border text-xs px-2 py-0.5`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </Badge>
                </div>

                <Separator className="bg-blue-500/10 mb-3" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Trading Enabled</span>
                  <Switch
                    checked={coin.tradingEnabled}
                    onCheckedChange={() => toggleTrading(coin.id)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/[0.02] rounded-md p-2">
                    <p className="text-slate-500">24h High</p>
                    <p className="text-slate-300 font-medium">${coin.high24h >= 1 ? coin.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.high24h.toFixed(4)}</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-md p-2">
                    <p className="text-slate-500">24h Low</p>
                    <p className="text-slate-300 font-medium">${coin.low24h >= 1 ? coin.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.low24h.toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="glass-strong border-blue-500/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Edit Coin — {editDialog?.symbol}</DialogTitle>
          </DialogHeader>
          {editDialog && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Symbol</Label>
                  <Input defaultValue={editDialog.symbol} className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Name</Label>
                  <Input defaultValue={editDialog.name} className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Pair</Label>
                <Input defaultValue={editDialog.pair} className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Price (USDT)</Label>
                <Input type="number" defaultValue={editDialog.price} className="bg-white/[0.03] border-blue-500/10 focus:border-blue-500/30 text-slate-200 rounded-lg h-10" />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm text-slate-400">Trading Enabled</Label>
                <Switch defaultChecked={editDialog.tradingEnabled} className="data-[state=checked]:bg-blue-500" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-blue-500/20 text-slate-300 hover:bg-blue-500/10 h-9" onClick={() => setEditDialog(null)}>
              Cancel
            </Button>
            <Button className="gradient-blue text-white hover:opacity-90 h-9" onClick={() => setEditDialog(null)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}