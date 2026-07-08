export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  color: string;
}

export const COINS: CoinData[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 67245.30, change24h: 2.35, volume24h: 28500000000, marketCap: 1320000000000, icon: '₿', color: '#f59e0b' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 3456.78, change24h: 1.82, volume24h: 15200000000, marketCap: 415000000000, icon: 'Ξ', color: '#6366f1' },
  { symbol: 'BNBUSDT', name: 'BNB', price: 589.45, change24h: -0.94, volume24h: 2100000000, marketCap: 87000000000, icon: 'B', color: '#f5b400' },
  { symbol: 'SOLUSDT', name: 'Solana', price: 178.92, change24h: 4.21, volume24h: 3800000000, marketCap: 78000000000, icon: 'S', color: '#8b5cf6' },
  { symbol: 'XRPUSDT', name: 'XRP', price: 0.6234, change24h: -1.37, volume24h: 1800000000, marketCap: 34000000000, icon: 'X', color: '#00e5ff' },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.4821, change24h: 3.15, volume24h: 620000000, marketCap: 17000000000, icon: 'A', color: '#00d26a' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.1634, change24h: 5.67, volume24h: 2400000000, marketCap: 23000000000, icon: 'D', color: '#f59e0b' },
  { symbol: 'DOTUSDT', name: 'Polkadot', price: 7.82, change24h: -2.18, volume24h: 480000000, marketCap: 10500000000, icon: 'D', color: '#e6007a' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', price: 38.45, change24h: 1.56, volume24h: 890000000, marketCap: 14200000000, icon: 'A', color: '#ff3d57' },
  { symbol: 'MATICUSDT', name: 'Polygon', price: 0.7213, change24h: -0.83, volume24h: 540000000, marketCap: 6700000000, icon: 'M', color: '#8247e5' },
  { symbol: 'LINKUSDT', name: 'Chainlink', price: 18.34, change24h: 2.91, volume24h: 780000000, marketCap: 10800000000, icon: 'L', color: '#375bd2' },
  { symbol: 'UNIUSDT', name: 'Uniswap', price: 12.67, change24h: -1.45, volume24h: 420000000, marketCap: 7600000000, icon: 'U', color: '#ff007a' },
  { symbol: 'ATOMUSDT', name: 'Cosmos', price: 9.23, change24h: 0.78, volume24h: 310000000, marketCap: 3600000000, icon: 'C', color: '#6f7390' },
  { symbol: 'LTCUSDT', name: 'Litecoin', price: 84.56, change24h: 1.12, volume24h: 560000000, marketCap: 6300000000, icon: 'Ł', color: '#a6a9aa' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', price: 6.78, change24h: 6.34, volume24h: 720000000, marketCap: 7400000000, icon: 'N', color: '#00ec97' },
  { symbol: 'APTUSDT', name: 'Aptos', price: 9.45, change24h: -3.22, volume24h: 380000000, marketCap: 4200000000, icon: 'A', color: '#2dd8a3' },
  { symbol: 'ARBUSDT', name: 'Arbitrum', price: 1.23, change24h: 1.89, volume24h: 510000000, marketCap: 3800000000, icon: 'A', color: '#28a0f0' },
  { symbol: 'OPUSDT', name: 'Optimism', price: 2.34, change24h: -0.56, volume24h: 290000000, marketCap: 2700000000, icon: 'O', color: '#ff0420' },
  { symbol: 'INJUSDT', name: 'Injective', price: 28.90, change24h: 3.67, volume24h: 210000000, marketCap: 2600000000, icon: 'I', color: '#00f2fe' },
  { symbol: 'TIAUSDT', name: 'Celestia', price: 11.23, change24h: -2.44, volume24h: 340000000, marketCap: 2200000000, icon: 'T', color: '#7b2bf9' },
];

export const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'];

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function formatChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

/** Get the base symbol without USDT suffix (e.g., "BTCUSDT" → "BTC") */
export function getBaseSymbol(symbol: string): string {
  return symbol.replace('USDT', '');
}

/** Generate a simple SVG sparkline path from a seed string */
export function generateSparkline(seed: string, isPositive: boolean): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const points: number[] = [];
  let value = 50;
  for (let i = 0; i < 20; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const delta = ((hash % 20) - 10) * 0.8;
    value = Math.max(10, Math.min(90, value + delta));
    if (i === 19 && isPositive) value = Math.min(90, value + 15);
    if (i === 19 && !isPositive) value = Math.max(10, value - 15);
    points.push(value);
  }
  const w = 100;
  const h = 40;
  const step = w / (points.length - 1);
  let d = '';
  points.forEach((p, i) => {
    const x = i * step;
    const y = h - (p / 100) * h;
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  });
  return d;
}