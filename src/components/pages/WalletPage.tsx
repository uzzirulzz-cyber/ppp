'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Bitcoin,
  CircleDollarSign,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  QrCode,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { useStore, Pages } from '@/store/useStore';
import { Skeleton } from '@/components/ui/skeleton';

/* ════════════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════════════ */
type WalletTab = 'overview' | 'spot' | 'futures' | 'earn';
type TxFilter = 'all' | 'deposits' | 'withdrawals' | 'trades';

interface Balance {
  currency: string;
  amount: number;
  frozen: number;
}

interface WalletData {
  id: string;
  type: string;
  totalEquity: number;
  balances: Balance[];
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  currency: string;
  amount: number;
  fee: number;
  description: string;
  createdAt: string;
}

/* ════════════════════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════════════════════ */
const CURRENCIES = ['USDT', 'BTC', 'ETH'] as const;
const NETWORKS = ['TRC20', 'ERC20', 'BEP20'] as const;

const WITHDRAW_METHODS = ['JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'VISA', 'MASTERCARD'] as const;

const DEPOSIT_ADDRESSES: Record<string, string> = {
  'USDT-TRC20': 'TN2Y3R4Xk8jZBbPq7vMwEgHsLdFt5nKcAo',
  'USDT-ERC20': '0x7a3B9c2D8e1F4a6B5d0C3E7f8A9b1D2c4E5F6a7B',
  'USDT-BEP20': '0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B',
  'BTC-TRC20': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'BTC-ERC20': 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  'BTC-BEP20': 'bc1q42lja79elem0lh0rlvte0dptd6c4qf6z9xwlnv',
  'ETH-TRC20': '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  'ETH-ERC20': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  'ETH-BEP20': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

const WALLET_TABS: { key: WalletTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spot', label: 'Spot' },
  { key: 'futures', label: 'Futures' },
  { key: 'earn', label: 'Earn' },
];

const TX_FILTERS: { key: TxFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'withdrawals', label: 'Withdrawals' },
  { key: 'trades', label: 'Trades' },
];

const CURRENCY_META: Record<string, { bg: string; fg: string }> = {
  USDT: { bg: 'rgba(59,130,246,0.1)', fg: '#3B82F6' },
  BTC: { bg: 'rgba(245,158,11,0.1)', fg: '#F59E0B' },
  ETH: { bg: 'rgba(99,102,241,0.1)', fg: '#6366F1' },
};

const BANKING_STYLES = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderRadius: '12px',
  } as React.CSSProperties,
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderRadius: '12px',
    padding: '20px',
  } as React.CSSProperties,
  input: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    borderRadius: '12px',
    padding: '14px',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  btnPrimary: {
    background: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 38px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  btnSecondary: {
    background: '#F1F5F9',
    color: '#1E293B',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  btnDanger: {
    background: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  dataTable: {
    background: '#FFFFFF',
    color: '#1E293B',
  } as React.CSSProperties,
};

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const formatUSD = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatAmount = (n: number, currency: string): string => {
  if (currency === 'USDT')
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

const formatDate = (raw: string): string => {
  try {
    const d = new Date(raw);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return raw;
  }
};

const statusBadgeStyle = (s: string): React.CSSProperties => {
  switch (s.toUpperCase()) {
    case 'COMPLETED':
      return { background: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case 'PENDING':
      return { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
    case 'PROCESSING':
      return { background: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case 'FAILED':
      return { background: 'rgba(239,68,68,0.08)', color: '#EF4444' };
    default:
      return { background: 'rgba(148,163,184,0.1)', color: '#64748B' };
  }
};

const typeBadgeStyle = (t: string): React.CSSProperties => {
  switch (t.toUpperCase()) {
    case 'DEPOSIT':
    case 'REFERRAL_BONUS':
      return { background: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case 'WITHDRAW':
      return { background: 'rgba(239,68,68,0.08)', color: '#EF4444' };
    case 'TRADE':
      return { background: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case 'COMMISSION':
      return { background: 'rgba(99,102,241,0.1)', color: '#6366F1' };
    default:
      return { background: 'rgba(148,163,184,0.1)', color: '#64748B' };
  }
};

const authHeaders = (token: string | null): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/* ════════════════════════════════════════════════════════════
   Skeleton Loaders
   ════════════════════════════════════════════════════════════ */
function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="transition-all duration-200" style={BANKING_STYLES.statCard}>
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-8">
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28 flex-shrink-0" />
          <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-14 flex-shrink-0" />
          <Skeleton className="h-4 w-24 flex-shrink-0" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Currency Icon
   ════════════════════════════════════════════════════════════ */
function CurrencyIcon({ currency, size = 22 }: { currency: string; size?: number }) {
  const meta = CURRENCY_META[currency] || CURRENCY_META.USDT;
  if (currency === 'BTC') return <Bitcoin size={size} style={{ color: meta.fg }} />;
  if (currency === 'ETH') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={meta.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <path d="M12 6L6 12l6 6 6-6-6-6z" />
      </svg>
    );
  }
  return <CircleDollarSign size={size} style={{ color: meta.fg }} />;
}

/* ════════════════════════════════════════════════════════════
   Select (styled)
   ════════════════════════════════════════════════════════════ */
function StyledSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <select
      className="trade-input appearance-none cursor-pointer disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...BANKING_STYLES.input,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a8d' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════ */
export default function WalletPage() {
  const { token, currentPage, navigate } = useStore();

  /* ── server state ──────────────────────────────────── */
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [totalEquity, setTotalEquity] = useState(0);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txPage, setTxPage] = useState({ page: 1, total: 0, totalPages: 0 });
  const [walletLoading, setWalletLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── ui state ──────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<WalletTab>('overview');
  const [txFilter, setTxFilter] = useState<TxFilter>('all');

  // deposit
  const [depCurrency, setDepCurrency] = useState('USDT');
  const [depNetwork, setDepNetwork] = useState('TRC20');
  const [depAmount, setDepAmount] = useState('');
  const [depTxHash, setDepTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depError, setDepError] = useState('');
  const [depSuccess, setDepSuccess] = useState('');

  // withdraw
  const [wdCurrency, setWdCurrency] = useState('USDT');
  const [wdAmount, setWdAmount] = useState('');
  const [wdMethod, setWdMethod] = useState('BANK_TRANSFER');
  const [wdAccountNumber, setWdAccountNumber] = useState('');
  const [wdAccountName, setWdAccountName] = useState('');
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [wdError, setWdError] = useState('');
  const [wdSuccess, setWdSuccess] = useState('');

  /* ══════════════════════════════════════════════════
     Data Fetching
     ══════════════════════════════════════════════════ */
  const fetchWallets = useCallback(async () => {
    try {
      setWalletLoading(true);
      const res = await fetch('/api/wallet', { headers: authHeaders(token) });
      if (!res.ok) throw new Error('Failed to load wallet data');
      const data = await res.json();
      setWallets(data.wallets ?? []);
      setTotalEquity(data.totalEquity ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setWalletLoading(false);
    }
  }, [token]);

  const fetchTransactions = useCallback(
    async (page = 1, filter: TxFilter = 'all') => {
      try {
        setTxLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: '50' });
        if (filter !== 'all') {
          const map: Record<string, string> = {
            deposits: 'DEPOSIT',
            withdrawals: 'WITHDRAW',
            trades: 'TRADE',
          };
          params.set('type', map[filter] ?? '');
        }
        const res = await fetch(`/api/wallet/transactions?${params}`, {
          headers: authHeaders(token),
        });
        if (!res.ok) throw new Error('Failed to load transactions');
        const data = await res.json();
        const norm = (data.transactions ?? []).map((tx: Record<string, unknown>) => ({
          id: (tx._id as string) ?? (tx.id as string) ?? '',
          type: tx.type as string,
          status: tx.status as string,
          currency: tx.currency as string,
          amount: Number(tx.amount) || 0,
          fee: Number(tx.fee) || 0,
          description: (tx.description as string) ?? '',
          createdAt: tx.createdAt as string,
        }));
        setTransactions(norm);
        setTxPage(data.pagination ?? { page: 1, total: 0, totalPages: 0 });
        if (page === 1 && filter === 'all') setRecentTx(norm.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setTxLoading(false);
      }
    },
    [token],
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    fetchTransactions(1, 'all');
  }, [fetchTransactions]);

  useEffect(() => {
    if (currentPage === Pages.TRANSACTIONS) {
      fetchTransactions(1, txFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txFilter, currentPage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ══════════════════════════════════════════════════
     Computed
     ══════════════════════════════════════════════════ */
  const allBalances = wallets.flatMap((w) => w.balances);

  const getBalance = (currency: string): Balance =>
    allBalances.find((b) => b.currency === currency) ?? {
      currency,
      amount: 0,
      frozen: 0,
    };

  const totalAvailable = allBalances
    .filter((b) => b.currency === 'USDT')
    .reduce((s, b) => s + Math.max(0, b.amount - b.frozen), 0);

  const totalFrozen = allBalances.reduce((s, b) => s + b.frozen, 0);

  const filteredBalances = (() => {
    const src =
      activeTab === 'overview'
        ? wallets
        : wallets.filter((w) => w.type.toUpperCase() === activeTab.toUpperCase());
    const map = new Map<string, Balance>();
    src.forEach((w) =>
      w.balances.forEach((b) => {
        const ex = map.get(b.currency) ?? { currency: b.currency, amount: 0, frozen: 0 };
        map.set(b.currency, {
          ...ex,
          amount: ex.amount + b.amount,
          frozen: ex.frozen + b.frozen,
        });
      }),
    );
    return Array.from(map.values());
  })();

  /* ══════════════════════════════════════════════════
     Handlers
     ══════════════════════════════════════════════════ */
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const refreshAfterMutation = useCallback(() => {
    fetchWallets();
    fetchTransactions(1, 'all');
  }, [fetchWallets, fetchTransactions]);

  const resetDepositForm = () => {
    setDepAmount('');
    setDepTxHash('');
    setDepError('');
    setDepSuccess('');
  };

  const handleDepositSubmit = async () => {
    setDepError('');
    setDepSuccess('');
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepError('Please enter a valid amount');
      return;
    }
    setDepSubmitting(true);
    try {
      const hash = depTxHash.trim();
      const body: Record<string, unknown> = {
        currency: depCurrency,
        amount: amt,
        method: depNetwork,
        txHash: hash,
      };

      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Deposit request failed');

      setDepSuccess(data.message || 'Deposit submitted — pending confirmation');

      // If the server returns the new transaction, prepend it
      if (data.transaction) {
        const norm: Transaction = {
          id: data.transaction._id ?? data.transaction.id ?? '',
          type: data.transaction.type ?? 'DEPOSIT',
          status: data.transaction.status ?? 'PENDING',
          currency: data.transaction.currency ?? depCurrency,
          amount: Number(data.transaction.amount) || amt,
          fee: Number(data.transaction.fee) || 0,
          description: data.transaction.description ?? '',
          createdAt: data.transaction.createdAt ?? new Date().toISOString(),
        };
        setTransactions((prev) => [norm, ...prev]);
        setRecentTx((prev) => [norm, ...prev].slice(0, 5));
      }

      refreshAfterMutation();
      setTimeout(() => {
        resetDepositForm();
        navigate(Pages.WALLET);
      }, 2500);
    } catch (err) {
      setDepError(err instanceof Error ? err.message : 'Deposit request failed');
    } finally {
      setDepSubmitting(false);
    }
  };

  const resetWithdrawForm = () => {
    setWdAmount('');
    setWdAccountNumber('');
    setWdAccountName('');
    setWdError('');
    setWdSuccess('');
  };

  const handleWithdraw = async () => {
    setWdError('');
    setWdSuccess('');
    const amt = parseFloat(wdAmount);
    if (isNaN(amt) || amt <= 0) {
      setWdError('Please enter a valid amount');
      return;
    }
    if (!wdAccountNumber.trim()) {
      setWdError('Please enter an account number');
      return;
    }
    if (!wdAccountName.trim()) {
      setWdError('Please enter an account name');
      return;
    }
    setWdSubmitting(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          currency: wdCurrency,
          amount: amt,
          method: wdMethod,
          accountNumber: wdAccountNumber.trim(),
          accountName: wdAccountName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Withdrawal request failed');

      setWdSuccess(data.message || 'Withdrawal submitted — Pending approval');

      // If the server returns the new transaction, prepend it
      if (data.transaction) {
        const norm: Transaction = {
          id: data.transaction._id ?? data.transaction.id ?? '',
          type: data.transaction.type ?? 'WITHDRAW',
          status: data.transaction.status ?? 'PENDING',
          currency: data.transaction.currency ?? wdCurrency,
          amount: Number(data.transaction.amount) || amt,
          fee: Number(data.transaction.fee) || 0,
          description: data.transaction.description ?? '',
          createdAt: data.transaction.createdAt ?? new Date().toISOString(),
        };
        setTransactions((prev) => [norm, ...prev]);
        setRecentTx((prev) => [norm, ...prev].slice(0, 5));
      }

      refreshAfterMutation();
      setTimeout(() => {
        resetWithdrawForm();
        navigate(Pages.WALLET);
      }, 2500);
    } catch (err) {
      setWdError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWdSubmitting(false);
    }
  };

  /* ══════════════════════════════════════════════════
     Page routing booleans
     ══════════════════════════════════════════════════ */
  const isDeposit = currentPage === Pages.DEPOSIT;
  const isWithdraw = currentPage === Pages.WITHDRAW;
  const isTxPage = currentPage === Pages.TRANSACTIONS;
  const isOverview = !isDeposit && !isWithdraw && !isTxPage;

  /* ══════════════════════════════════════════════════
     Sub-views
     ══════════════════════════════════════════════════ */

  /* ── Deposit Form ────────────────────────────────── */
  const depAddr = DEPOSIT_ADDRESSES[`${depCurrency}-${depNetwork}`] ?? '0x0';

  const renderDeposit = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(Pages.WALLET)}
          className="btn-secondary flex items-center gap-2 !py-2 !px-4"
          style={BANKING_STYLES.btnSecondary}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold" style={{ color: '#1E293B' }}>
          Deposit
        </h2>
      </div>

      {depSuccess ? (
        <div className="p-8 text-center space-y-4 transition-all duration-300" style={BANKING_STYLES.card}>
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16, 185, 129, 0.1)' }}
          >
            <Check size={32} style={{ color: '#10B981' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#10B981' }}>
            Deposit Request Submitted
          </h3>
          <p style={{ color: '#64748B' }}>
            {depSuccess}
          </p>
          <p style={{ color: '#94A3B8' }}>
            Funds will appear in your wallet once confirmed on the network.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-6 transition-all duration-300" style={BANKING_STYLES.card}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
                Select Currency
              </label>
              <StyledSelect
                value={depCurrency}
                onChange={(v) => {
                  setDepCurrency(v);
                  setCopied(false);
                }}
                options={CURRENCIES}
                disabled={depSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
                Network / Method
              </label>
              <StyledSelect
                value={depNetwork}
                onChange={(v) => {
                  setDepNetwork(v);
                  setCopied(false);
                }}
                options={NETWORKS}
                disabled={depSubmitting}
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
              Amount
            </label>
            <input
              type="number"
              className="trade-input"
              placeholder="0.00"
              value={depAmount}
              onChange={(e) => setDepAmount(e.target.value)}
              min="0"
              step="any"
              disabled={depSubmitting}
              style={BANKING_STYLES.input}
            />
          </div>

          {/* Deposit address */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
              Deposit Address
            </label>
            <div className="flex items-center gap-2">
              <div
                className="trade-input flex-1 !py-3 font-mono text-xs sm:text-sm select-all"
                style={{
                  ...BANKING_STYLES.input,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                }}
              >
                {depAddr}
              </div>
              <button
                onClick={() => handleCopy(depAddr)}
                className="btn-secondary !p-3 flex-shrink-0"
                style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' }}
                title="Copy address"
              >
                {copied ? (
                  <Check size={18} style={{ color: '#10B981' }} />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          {/* QR code placeholder */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className="w-48 h-48 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: '#FFFFFF',
                border: '2px dashed #E2E8F0',
              }}
            >
              <QrCode size={48} style={{ color: '#94A3B8' }} />
              <span className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                QR Code
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
              <Info size={14} />
              Minimum Deposit: $10.00
            </div>
          </div>

          {/* Optional Tx Hash */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
              Transaction Hash <span style={{ color: '#94A3B8' }}>(optional)</span>
            </label>
            <input
              type="text"
              className="trade-input font-mono text-xs"
              placeholder="Paste your transaction hash here..."
              value={depTxHash}
              onChange={(e) => setDepTxHash(e.target.value)}
              disabled={depSubmitting}
              style={BANKING_STYLES.input}
            />
          </div>

          {/* Error message */}
          {depError && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertCircle size={16} /> {depError}
            </div>
          )}

          <button
            onClick={handleDepositSubmit}
            disabled={depSubmitting}
            className="btn-gold w-full !py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '12px' }}
          >
            {depSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              'I Have Sent the Funds'
            )}
          </button>
        </div>
      )}
    </div>
  );

  /* ── Withdraw Form ───────────────────────────────── */
  const wdBal = getBalance(wdCurrency);
  const wdAvailable = Math.max(0, wdBal.amount - wdBal.frozen);

  const renderWithdraw = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(Pages.WALLET)}
          className="btn-secondary flex items-center gap-2 !py-2 !px-4"
          style={BANKING_STYLES.btnSecondary}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold" style={{ color: '#1E293B' }}>
          Withdraw
        </h2>
      </div>

      <div className="p-6 space-y-5 transition-all duration-300" style={BANKING_STYLES.card}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
              Currency
            </label>
            <StyledSelect value={wdCurrency} onChange={setWdCurrency} options={CURRENCIES} disabled={wdSubmitting} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
              Withdrawal Method
            </label>
            <StyledSelect value={wdMethod} onChange={setWdMethod} options={WITHDRAW_METHODS} disabled={wdSubmitting} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: '#64748B' }}>
              Amount
            </label>
            <button
              onClick={() => setWdAmount(String(wdAvailable))}
              className="text-xs font-medium"
              style={{
                color: '#3B82F6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              disabled={wdSubmitting}
            >
              Available: {formatAmount(wdAvailable, wdCurrency)} {wdCurrency}
            </button>
          </div>
          <input
            type="number"
            className="trade-input"
            placeholder="0.00"
            value={wdAmount}
            onChange={(e) => setWdAmount(e.target.value)}
            min="0"
            step="any"
            disabled={wdSubmitting}
            style={BANKING_STYLES.input}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
            Account Number
          </label>
          <input
            type="text"
            className="trade-input font-mono text-sm"
            placeholder="Enter your account number or wallet address"
            value={wdAccountNumber}
            onChange={(e) => setWdAccountNumber(e.target.value)}
            disabled={wdSubmitting}
            style={BANKING_STYLES.input}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>
            Account Name
          </label>
          <input
            type="text"
            className="trade-input"
            placeholder="Enter account holder name"
            value={wdAccountName}
            onChange={(e) => setWdAccountName(e.target.value)}
            disabled={wdSubmitting}
            style={BANKING_STYLES.input}
          />
        </div>

        <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
          <Info size={14} />
          Fee: 1.00 USDT
        </div>

        {wdError && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{
              background: 'rgba(255, 61, 87, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(255, 61, 87, 0.2)',
            }}
          >
            <AlertCircle size={16} /> {wdError}
          </div>
        )}

        {wdSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <Check size={16} /> {wdSuccess}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={wdSubmitting}
          className="btn-danger w-full !py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
          style={BANKING_STYLES.btnDanger}
        >
          {wdSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Processing...
            </>
          ) : (
            'Submit Withdrawal'
          )}
        </button>
      </div>
    </div>
  );

  /* ── Transactions Page ───────────────────────────── */
  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(Pages.WALLET)}
            className="btn-secondary flex items-center gap-2 !py-2 !px-4"
            style={BANKING_STYLES.btnSecondary}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h2 className="text-xl font-bold" style={{ color: '#1E293B' }}>
            Transaction History
          </h2>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          width: 'fit-content',
        }}
      >
        {TX_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTxFilter(f.key)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              color: txFilter === f.key ? '#FFFFFF' : '#64748B',
              background: txFilter === f.key ? '#3B82F6' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden transition-all duration-300" style={BANKING_STYLES.card}>
        {txLoading ? (
          <TableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#94A3B8' }}>
            <Wallet size={40} className="mx-auto mb-3 opacity-40" />
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="data-table [&_th]:text-[#94A3B8] [&_th]:border-b-[#E2E8F0] [&_td]:text-[#1E293B] [&_td]:border-b-[#F1F5F9] [&_tr:hover]:bg-[#F8FAFC]" style={BANKING_STYLES.dataTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th className="hidden md:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                      <td>
                        <span className="badge" style={typeBadgeStyle(tx.type)}>{tx.type}</span>
                      </td>
                      <td className="font-medium" style={{ color: '#1E293B' }}>
                        {tx.currency}
                      </td>
                      <td
                        className="font-semibold"
                        style={{
                          color:
                            tx.type === 'DEPOSIT' || tx.type === 'REFERRAL_BONUS'
                              ? '#10B981'
                              : '#EF4444',
                        }}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'REFERRAL_BONUS' ? '+' : '-'}
                        {formatAmount(tx.amount, tx.currency)}
                      </td>
                      <td>{tx.fee > 0 ? formatAmount(tx.fee, tx.currency) : '—'}</td>
                      <td>
                        <span className="badge" style={statusBadgeStyle(tx.status)}>{tx.status}</span>
                      </td>
                      <td
                        className="hidden md:table-cell max-w-[200px] truncate"
                        style={{ color: '#94A3B8' }}
                      >
                        {tx.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {txPage.totalPages > 1 && (
              <div
                className="flex items-center justify-between p-4"
                style={{ borderTop: '1px solid #E2E8F0' }}
              >
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  Page {txPage.page} of {txPage.totalPages} &middot; {txPage.total} total
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchTransactions(txPage.page - 1, txFilter)}
                    disabled={txPage.page <= 1 || txLoading}
                    className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"
                    style={BANKING_STYLES.btnSecondary}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => fetchTransactions(txPage.page + 1, txFilter)}
                    disabled={txPage.page >= txPage.totalPages || txLoading}
                    className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"
                    style={BANKING_STYLES.btnSecondary}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  /* ── Balance List (overview / tab) ───────────────── */
  const renderBalanceList = () => (
    <div className="space-y-3">
      {CURRENCIES.map((cur) => {
        const bal = filteredBalances.find((b) => b.currency === cur) ?? {
          currency: cur,
          amount: 0,
          frozen: 0,
        };
        const meta = CURRENCY_META[cur] ?? CURRENCY_META.USDT;
        return (
          <motion.div
            key={cur}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
            }}
            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 42, height: 42, background: meta.bg }}
              >
                <CurrencyIcon currency={cur} />
              </div>
              <div>
                <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                  {cur}
                </span>
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  Available:{' '}
                  <span style={{ color: '#10B981' }}>
                    {formatAmount(bal.amount, cur)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-10 text-right">
              <div className="hidden sm:block">
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  Frozen
                </div>
                <div className="text-sm font-medium" style={{ color: '#64748B' }}>
                  {formatAmount(bal.frozen, cur)}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  Total Value
                </div>
                <div className="text-sm font-bold" style={{ color: '#1E293B' }}>
                  {cur === 'USDT'
                    ? formatUSD(bal.amount + bal.frozen)
                    : formatAmount(bal.amount + bal.frozen, cur)}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  /* ── Wallet Overview ─────────────────────────────── */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          width: 'fit-content',
        }}
      >
        {WALLET_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-5 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.key ? '#FFFFFF' : '#64748B',
              background: activeTab === tab.key ? '#3B82F6' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="wallet-tab-ind"
                className="absolute inset-0 rounded-md"
                style={{
                  background: '#3B82F6',
                  border: '1px solid #3B82F6',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          className="btn-primary flex items-center gap-2"
          style={BANKING_STYLES.btnPrimary}
          whileHover={{ scale: 1.03, background: '#2563EB' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(Pages.DEPOSIT)}
        >
          <ArrowDownLeft size={16} /> Deposit
        </motion.button>
        <motion.button
          className="btn-secondary flex items-center gap-2"
          style={BANKING_STYLES.btnSecondary}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(Pages.WITHDRAW)}
        >
          <ArrowUpRight size={16} /> Withdraw
        </motion.button>
        <motion.button
          className="btn-secondary flex items-center gap-2"
          style={BANKING_STYLES.btnSecondary}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeftRight size={16} /> Transfer
        </motion.button>
      </div>

      {/* Balance list */}
      {walletLoading ? <BalanceSkeleton /> : renderBalanceList()}

      {/* Recent transactions */}
      <div className="transition-all duration-300" style={BANKING_STYLES.card}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>
            Recent Transactions
          </h3>
          <button
            className="text-sm font-medium hover:underline"
            style={{
              color: '#3B82F6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => navigate(Pages.TRANSACTIONS)}
          >
            View All
          </button>
        </div>
        {recentTx.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#94A3B8' }}>
            <p className="text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table [&_th]:text-[#94A3B8] [&_th]:border-b-[#E2E8F0] [&_td]:text-[#1E293B] [&_td]:border-b-[#F1F5F9] [&_tr:hover]:bg-[#F8FAFC]" style={BANKING_STYLES.dataTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="badge" style={typeBadgeStyle(tx.type)}>{tx.type}</span>
                    </td>
                    <td className="font-medium" style={{ color: '#1E293B' }}>
                      {tx.currency}
                    </td>
                    <td
                      className="font-semibold"
                      style={{
                        color:
                          tx.type === 'DEPOSIT' || tx.type === 'REFERRAL_BONUS'
                            ? '#10B981'
                            : '#EF4444',
                      }}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'REFERRAL_BONUS' ? '+' : '-'}
                      {formatAmount(tx.amount, tx.currency)}
                    </td>
                    <td>
                      <span className="badge" style={statusBadgeStyle(tx.status)}>{tx.status}</span>
                    </td>
                    <td style={{ color: '#94A3B8' }}>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════ */
  return (
    <motion.div
      className="space-y-6"
      style={{ paddingBottom: 40 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
    >
      {/* Header (overview only) */}
      {isOverview && (
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>
            Wallet
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
            Manage your assets and transactions
          </p>
        </div>
      )}

      {/* Global error */}
      {error && isOverview && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertCircle size={16} /> {error}
          <button
            onClick={() => setError('')}
            className="ml-auto"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* ── Summary Cards (always visible) ──────────── */}
      {walletLoading && isOverview ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="transition-all duration-200" style={BANKING_STYLES.statCard}>
            <span className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
              Total Assets
            </span>
            <div className="stat-value text-xl sm:text-2xl" style={{ color: '#1E293B' }}>{formatUSD(totalEquity)}</div>
          </div>
          <div className="transition-all duration-200" style={BANKING_STYLES.statCard}>
            <span className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
              Available
            </span>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: '#3B82F6' }}>
              {formatUSD(totalAvailable)}
            </div>
          </div>
          <div className="transition-all duration-200" style={BANKING_STYLES.statCard}>
            <span className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
              In Orders
            </span>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: '#F59E0B' }}>
              {formatUSD(totalFrozen)}
            </div>
          </div>
          <div className="transition-all duration-200" style={BANKING_STYLES.statCard}>
            <span className="text-xs font-medium block mb-1" style={{ color: '#94A3B8' }}>
              Today&apos;s P&amp;L
            </span>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: '#10B981' }}>
              $0.00
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isDeposit ? (
          <motion.div
            key="deposit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderDeposit()}
          </motion.div>
        ) : isWithdraw ? (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderWithdraw()}
          </motion.div>
        ) : isTxPage ? (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderTransactions()}
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderOverview()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}