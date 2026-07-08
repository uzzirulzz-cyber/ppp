import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page =
  | 'login' | 'register' | 'change-password'
  | 'dashboard' | 'trade' | 'wallet' | 'deposit' | 'withdraw'
  | 'transaction-history' | 'referral' | 'profile' | 'security' | 'notifications'
  | 'admin-lock' | 'admin-dashboard' | 'admin-users' | 'admin-agents'
  | 'admin-trading' | 'admin-deposits' | 'admin-withdrawals'
  | 'admin-finance' | 'admin-support' | 'admin-coins'
  | 'admin-notifications' | 'admin-settings';

export interface CoinData {
  id: string; symbol: string; name: string; pair: string; logo: string;
  price: number; change24h: number; high24h: number; low24h: number;
  volume24h: number; marketCap: number; sparkline: number[];
}

export interface UserData {
  id: string; uid: string; username: string; email: string;
  phone: string; country: string; avatar: string | null;
  role: string; balance: number; frozenBalance: number; bonusBalance: number;
  totalProfit: number; todayProfit: number; todayLoss: number;
  activeTrades: number; completedTrades: number; referralCode: string;
  twoFactor: boolean; emailVerified: boolean; mustChangePass?: boolean;
  subAgentId?: string | null; invitationCode?: string | null;
  userInvitationCode?: string | null;
}

interface AppState {
  currentPage: Page;
  previousPage: Page | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: UserData | null;
  token: string | null;
  selectedCoin: CoinData | null;
  coins: CoinData[];
  recentTrades: any[];
  notifications: any[];
  sidebarOpen: boolean;

  navigate: (page: Page) => void;
  goBack: () => void;
  login: (user: UserData, token: string, targetPage?: Page) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isSubAgent: () => boolean;
  isCustomer: () => boolean;
  setCoins: (coins: CoinData[]) => void;
  updateCoinPrice: (symbol: string, price: number) => void;
  selectCoin: (coin: CoinData | null) => void;
  addTrade: (trade: any) => void;
  updateTrade: (id: string, updates: any) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (n: any) => void;
  markNotificationRead: (id: string) => void;
  updateUserBalance: (amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: 'login',
      previousPage: null,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      token: null,
      selectedCoin: null,
      coins: [],
      recentTrades: [],
      notifications: [],
      sidebarOpen: false,

      navigate: (page) => set({ currentPage: page, previousPage: get().currentPage, sidebarOpen: false }),
      goBack: () => { const s = get(); set({ currentPage: s.previousPage || 'dashboard', previousPage: null }); },
      login: (user, token, targetPage?) => set({
        isAuthenticated: true,
        isAdmin: user.role === 'super_admin' || user.role === 'sub_agent',
        user, token,
        currentPage: targetPage || (
          user.mustChangePass ? 'change-password' :
          (user.role === 'super_admin' || user.role === 'sub_agent' ? 'admin-lock' : 'dashboard')
        ),
      }),
      logout: () => set({ isAuthenticated: false, isAdmin: false, user: null, token: null, selectedCoin: null, currentPage: 'login' }),
      isSuperAdmin: () => get().user?.role === 'super_admin',
      isSubAgent: () => get().user?.role === 'sub_agent',
      isCustomer: () => get().user?.role === 'user',
      setCoins: (coins) => set({ coins }),
      updateCoinPrice: (symbol, price) => set((s) => ({
        coins: s.coins.map((c) => c.symbol === symbol ? {
          ...c, price,
          change24h: c.change24h + ((price - c.price) / c.price) * 100 * 0.1,
          sparkline: [...c.sparkline.slice(1), price],
        } : c),
      })),
      selectCoin: (coin) => set({ selectedCoin: coin }),
      addTrade: (trade) => set((s) => ({
        recentTrades: [trade, ...s.recentTrades],
        user: s.user ? { ...s.user, activeTrades: s.user.activeTrades + 1, balance: s.user.balance - trade.amount } : null,
      })),
      updateTrade: (id, updates) => set((s) => ({
        recentTrades: s.recentTrades.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n) })),
      updateUserBalance: (amount) => set((s) => ({ user: s.user ? { ...s.user, balance: s.user.balance + amount } : null })),
    }),
    { name: 'nextrade-storage', partialize: (s) => ({ currentPage: s.currentPage, isAuthenticated: s.isAuthenticated, isAdmin: s.isAdmin, user: s.user, token: s.token }) }
  )
);