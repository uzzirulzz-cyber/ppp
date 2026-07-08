'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  CircleDollarSign,
  Building2,
  CreditCard,
  Globe,
  QrCode,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

type PaymentMethod = 'usdt' | 'bank' | 'card' | 'local';
type Network = 'TRC-20' | 'ERC-20' | 'BEP-20';

const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'usdt', name: 'USDT', icon: <CircleDollarSign className="w-6 h-6" />, desc: 'Crypto deposit' },
  { id: 'bank', name: 'Bank Transfer', icon: <Building2 className="w-6 h-6" />, desc: 'Wire transfer' },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="w-6 h-6" />, desc: 'Visa, Mastercard' },
  { id: 'local', name: 'Local Payment', icon: <Globe className="w-6 h-6" />, desc: 'Regional methods' },
];

const WALLET_ADDRESSES: Record<Network, string> = {
  'TRC-20': 'TJxR4f8mQbFNfPcisZrhfB8LpXvF3k7dEmG',
  'ERC-20': '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  'BEP-20': '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
};

const NETWORKS: Network[] = ['TRC-20', 'ERC-20', 'BEP-20'];

const DEPOSIT_HISTORY = [
  { id: 'D001', amount: 5000.00, method: 'USDT (TRC-20)', status: 'completed' as const, date: '2025-06-23 14:30', txId: '0xabc...123' },
  { id: 'D002', amount: 2500.00, method: 'Credit Card', status: 'completed' as const, date: '2025-06-22 09:15', txId: 'TXN-456' },
  { id: 'D003', amount: 10000.00, method: 'Bank Transfer', status: 'pending' as const, date: '2025-06-22 13:00', txId: 'REF-789' },
  { id: 'D004', amount: 1500.00, method: 'USDT (ERC-20)', status: 'failed' as const, date: '2025-06-21 16:00', txId: '0xdef...456' },
];

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DepositPage() {
  const { goBack } = useAppStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [network, setNetwork] = useState<Network>('TRC-20');
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <h1 className="text-xl md:text-2xl font-bold text-white">Deposit Funds</h1>
          <p className="text-xs text-muted-foreground">Choose a method to add funds to your account</p>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 md:gap-4"
        >
          {PAYMENT_METHODS.map((method, i) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedMethod(method.id)}
              className="glass-card rounded-xl p-5 text-left hover:border-blue-500/40 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors text-blue-400">
                {method.icon}
              </div>
              <p className="text-sm font-semibold text-white">{method.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* USDT Deposit Flow */}
      <AnimatePresence mode="wait">
        {selectedMethod === 'usdt' && (
          <motion.div
            key="usdt-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Network Selection */}
            <div className="glass-card rounded-xl p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Select Network</Label>
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

            {/* Wallet Address */}
            <div className="glass-card rounded-xl p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                {network} Wallet Address
              </Label>
              <div className="flex items-center gap-2 bg-crypto-navy/50 rounded-lg border border-blue-500/10 p-3">
                <code className="text-xs text-blue-300 flex-1 break-all font-mono">
                  {WALLET_ADDRESSES[network]}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400"
                  onClick={() => handleCopy(WALLET_ADDRESSES[network])}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="glass-card rounded-xl p-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-xl bg-white flex items-center justify-center mb-3">
                <div className="w-44 h-44 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <QrCode className="w-16 h-16" />
                  <span className="text-xs font-medium">QR Code</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code to get the deposit address
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-400" />
                <Label className="text-sm font-medium text-white">Payment Instructions</Label>
              </div>
              <ul className="space-y-2.5">
                {[
                  'Only send USDT on the selected network. Sending other tokens may result in permanent loss.',
                  'Minimum deposit: 10 USDT',
                  `Network confirmation required: ${network === 'TRC-20' ? '1' : network === 'ERC-20' ? '12' : '3'} blocks`,
                  'Deposit will be credited after network confirmations (usually 5-30 minutes).',
                  'Do not include any memo or destination tag.',
                ].map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-blue-400 font-bold mt-0.5">{i + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upload Proof & Amount */}
            <div className="glass-card rounded-xl p-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Upload Payment Proof</Label>
                <button className="w-full h-24 rounded-xl border-2 border-dashed border-blue-500/20 hover:border-blue-500/40 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-blue-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Click to upload receipt/screenshot</span>
                </button>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Deposit Amount (USDT)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-11"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setPaymentConfirmed(!paymentConfirmed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    paymentConfirmed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-blue-500/30 group-hover:border-blue-500/50'
                  }`}
                >
                  {paymentConfirmed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-muted-foreground">I have completed payment</span>
              </label>

              <Button
                className="w-full gradient-green neon-glow-green h-12 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                disabled={!amount || !paymentConfirmed}
              >
                Submit Deposit Request
              </Button>
            </div>
          </motion.div>
        )}

        {/* Bank Transfer Flow */}
        {selectedMethod === 'bank' && (
          <motion.div
            key="bank-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <Label className="text-sm font-medium text-white">Bank Account Details</Label>
              </div>
              {[
                { label: 'Bank Name', value: 'JPMorgan Chase Bank' },
                { label: 'Account Holder', value: 'NexTrade Pro Inc.' },
                { label: 'Account Number', value: '****-****-****-4829' },
                { label: 'Routing Number', value: '021000021' },
                { label: 'SWIFT Code', value: 'CHASUS33' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-blue-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Reference Number</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-blue-400 font-mono">REF-{Date.now().toString().slice(-8)}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400"
                      onClick={() => handleCopy(`REF-${Date.now().toString().slice(-8)}`)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300/80">
                  Please include the reference number in your transfer note. Deposits without a reference may be delayed.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Upload Transfer Proof</Label>
                <button className="w-full h-24 rounded-xl border-2 border-dashed border-blue-500/20 hover:border-blue-500/40 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-blue-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Click to upload bank receipt</span>
                </button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Transfer Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-crypto-navy/50 border-blue-500/10 focus:border-blue-500/40 text-white placeholder:text-muted-foreground/50 h-11"
                />
              </div>
              <Button
                className="w-full gradient-green neon-glow-green h-12 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                disabled={!amount}
              >
                Submit Deposit Request
              </Button>
            </div>
          </motion.div>
        )}

        {/* Card / Local placeholder */}
        {(selectedMethod === 'card' || selectedMethod === 'local') && (
          <motion.div
            key="other-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              {selectedMethod === 'card' ? (
                <CreditCard className="w-8 h-8 text-blue-400" />
              ) : (
                <Globe className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {selectedMethod === 'card' ? 'Card Payment' : 'Local Payment'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This payment method will be available soon. Please use USDT or Bank Transfer for now.
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

      {/* Deposit History */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-4 md:p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Recent Deposits
        </h3>
        <div className="space-y-3">
          {DEPOSIT_HISTORY.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between py-2.5 border-b border-blue-500/5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">+{dep.amount.toLocaleString()} USDT</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_STYLES[dep.status]}`}>
                    {dep.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                    {dep.status === 'pending' && <Clock className="w-2.5 h-2.5 mr-1" />}
                    {dep.status === 'failed' && <XCircle className="w-2.5 h-2.5 mr-1" />}
                    {dep.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{dep.method}</span>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground">{dep.date}</span>
                </div>
              </div>
              <code className="text-[10px] text-muted-foreground/60 font-mono hidden sm:block">{dep.txId}</code>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}