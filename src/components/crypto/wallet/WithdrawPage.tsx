'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Wallet,
  Building2,
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

type WithdrawMethod = 'usdt' | 'bank' | 'card';
type Network = 'TRC-20' | 'ERC-20' | 'BEP-20';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  network: Network;
}

const SAVED_ADDRESSES: SavedAddress[] = [
  { id: '1', label: 'My Binance Wallet', address: 'TJxR4f8mQbFNfPcisZrhfB8LpXvF3k7dEmG', network: 'TRC-20' },
  { id: '2', label: 'Metamask ETH', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', network: 'ERC-20' },
  { id: '3', label: 'Trust Wallet BSC', address: '0x9a250d5630B4cF539739dF2C5dAcb4c659F9999A', network: 'BEP-20' },
];

const NETWORKS: Network[] = ['TRC-20', 'ERC-20', 'BEP-20'];
const NETWORK_FEE: Record<Network, number> = {
  'TRC-20': 1.00,
  'ERC-20': 5.50,
  'BEP-20': 0.80,
};

const WITHDRAWAL_HISTORY = [
  { id: 'W001', amount: 5000.00, method: 'USDT (TRC-20)', status: 'pending' as const, date: '2025-06-23 15:00', address: 'TJxR4...dEmG' },
  { id: 'W002', amount: 3000.00, method: 'Bank Transfer', status: 'approved' as const, date: '2025-06-22 11:30', address: '****-4829' },
  { id: 'W003', amount: 1200.00, method: 'USDT (ERC-20)', status: 'completed' as const, date: '2025-06-21 09:15', address: '0x7a2...888D' },
  { id: 'W004', amount: 800.00, method: 'USDT (TRC-20)', status: 'completed' as const, date: '2025-06-20 14:00', address: 'TJxR4...dEmG' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function WithdrawPage() {
  const { user, goBack } = useAppStore();
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [network, setNetwork] = useState<Network>('TRC-20');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);

  const fee = NETWORK_FEE[network];
  const numAmount = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, numAmount - fee);
  const maxAmount = user?.balance || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-10 w-10 hover:bg-blue-500/10 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Withdraw Funds</h1>
          <p className="text-xs text-muted-foreground">Transfer funds to your external wallet or bank</p>
        </div>
      </div>

      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card neon-glow-blue rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-bold text-white text-glow-blue">
            ${maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm text-muted-foreground">USDT</span>
        </div>
      </motion.div>

      {/* Method Selection */}
      {!selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {[
            { id: 'usdt' as WithdrawMethod, name: 'USDT', icon: <Wallet className="w-5 h-5" />, desc: 'Withdraw to crypto wallet', fee: 'From 0.80 USDT' },
            { id: 'bank' as WithdrawMethod, name: 'Bank Transfer', icon: <Building2 className="w-5 h-5" />, desc: 'Withdraw to bank account', fee: 'From 15.00 USD' },
            { id: 'card' as WithdrawMethod, name: 'Credit Card', icon: <CreditCard className="w-5 h-5" />, desc: 'Refund to card', fee: 'From 5.00 USD' },
          ].map((method, i) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              onClick={() => setSelectedMethod(method.id)}
              className="glass-card w-full rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/40 transition-all duration-300 group text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                {method.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/60 shrink-0">{method.fee}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* USDT Withdrawal Flow */}
      <AnimatePresence mode="wait">
        {selectedMethod === 'usdt' && (
          <motion.div
            key="usdt-withdraw"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Saved Addresses */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-white">Saved Wallet Addresses</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 px-2"
                  onClick={() => { setShowNewAddress(!showNewAddress); setSelectedAddress(null); }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add New
                </Button>
              </div>

              {!showNewAddress ? (
                <div className="space-y-2">
                  {SAVED_ADDRESSES.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => { setSelectedAddress(addr.id); setNetwork(addr.network); }}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        selectedAddress === addr.id
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-transparent hover:border-blue-500/20 hover:bg-blue-500/5/50'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{addr.label}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{addr.address}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-blue-500/20 text-blue-400 shrink-0">
                        {addr.network}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Wallet Label</Label>
                    <Input
                      placeholder="e.g. My Binance Wallet"
                      className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Wallet Address</Label>
                    <Input
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-10 text-sm font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 text-muted-foreground hover:text-white hover:bg-blue-500/10"
                      onClick={() => { setShowNewAddress(false); setNewAddress(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-blue text-white hover:opacity-90"
                    >
                      Save Address
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Network Selection */}
            <div className="glass-card rounded-xl p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Network</Label>
              <div className="grid grid-cols-3 gap-2">
                {NETWORKS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`rounded-lg p-2.5 text-center text-xs font-medium transition-all duration-200 border ${
                      network === n
                        ? 'gradient-blue text-white neon-glow-blue border-transparent'
                        : 'glass hover:border-blue-500/30 text-muted-foreground'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Input (if no saved selected) */}
            {!selectedAddress && !showNewAddress && (
              <div className="glass-card rounded-xl p-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Wallet Address</Label>
                <Input
                  placeholder="Enter withdrawal wallet address"
                  className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-11 text-sm font-mono"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="glass-card rounded-xl p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Withdrawal Amount (USDT)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 px-2"
                    onClick={() => setAmount(maxAmount.toString())}
                  >
                    Max
                  </Button>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-11 text-lg font-semibold"
                />
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Network Fee</span>
                  <span className="text-xs text-white font-medium">{fee.toFixed(2)} USDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">You&apos;ll Receive</span>
                  <span className="text-xs text-emerald-400 font-semibold">{receiveAmount.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>

            {/* Security Verification */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <Label className="text-sm font-medium text-white">Security Verification</Label>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Enter your password to confirm</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-11"
                />
              </div>
            </div>

            <Button
              className="w-full gradient-red neon-glow-red h-12 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              disabled={!amount || !password || numAmount <= fee}
            >
              Confirm Withdrawal
            </Button>
          </motion.div>
        )}

        {/* Bank / Card placeholder */}
        {(selectedMethod === 'bank' || selectedMethod === 'card') && (
          <motion.div
            key="other-withdraw"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              {selectedMethod === 'bank' ? (
                <Building2 className="w-8 h-8 text-blue-400" />
              ) : (
                <CreditCard className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {selectedMethod === 'bank' ? 'Bank Withdrawal' : 'Card Refund'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedMethod === 'bank'
                ? 'Please complete identity verification before using bank withdrawals.'
                : 'Card refunds are available for recent card deposits only.'}
            </p>
            <Button
              variant="outline"
              className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
              onClick={() => setSelectedMethod(null)}
            >
              Choose Another Method
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal History */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-4 md:p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Recent Withdrawals
        </h3>
        <div className="space-y-3">
          {WITHDRAWAL_HISTORY.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between py-2.5 border-b border-blue-500/5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">-{w.amount.toLocaleString()} USDT</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_STYLES[w.status]}`}>
                    {w.status === 'pending' && <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                    {w.status === 'approved' && <Copy className="w-2.5 h-2.5 mr-1" />}
                    {w.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                    {w.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{w.method}</span>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground">{w.date}</span>
                </div>
              </div>
              <code className="text-[10px] text-muted-foreground/60 font-mono hidden sm:block">{w.address}</code>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}