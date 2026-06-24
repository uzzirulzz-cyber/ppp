import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USDT'): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${currency}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${currency}`;
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}