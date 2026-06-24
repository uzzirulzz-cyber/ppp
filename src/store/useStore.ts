import { create } from 'zustand';

// Page type constants (31 pages)
export const Pages = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  DASHBOARD: 'DASHBOARD',
  TRADING: 'TRADING',
  SPOT: 'SPOT',
  FUTURES: 'FUTURES',
  WALLET: 'WALLET',
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  EARN: 'EARN',
  TRANSACTIONS: 'TRANSACTIONS',
  PROFILE: 'PROFILE',
  SECURITY: 'SECURITY',
  NOTIFICATIONS: 'NOTIFICATIONS',
  REFERRAL: 'REFERRAL',
  LOCK_SCREEN: 'LOCK_SCREEN',
  // Admin pages
  ADMIN_USERS: 'ADMIN_USERS',
  ADMIN_AGENTS: 'ADMIN_AGENTS',
  ADMIN_TRADES: 'ADMIN_TRADES',
  ADMIN_WALLETS: 'ADMIN_WALLETS',
  ADMIN_ANALYTICS: 'ADMIN_ANALYTICS',
  ADMIN_COMMISSIONS: 'ADMIN_COMMISSIONS',
  ADMIN_RISK: 'ADMIN_RISK',
  ADMIN_SETTINGS: 'ADMIN_SETTINGS',
  ADMIN_NOTIFICATIONS: 'ADMIN_NOTIFICATIONS',
  ADMIN_AUDIT: 'ADMIN_AUDIT',
  ADMIN_INVITATIONS: 'ADMIN_INVITATIONS',
} as const;

export type PageType = (typeof Pages)[keyof typeof Pages];

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  agentId?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface StoreState {
  currentPage: PageType;
  pageHistory: PageType[];
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  notifications: any[];
  unreadCount: number;
  sidebarOpen: boolean;
  loading: boolean;
  
  // Actions
  navigate: (page: PageType) => void;
  goBack: () => void;
  setAuth: (user: UserInfo, token: string) => void;
  logout: () => void;
  setNotifications: (notifications: any[]) => void;
  setUnreadCount: (count: number) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

const TOKEN_KEY = 'nextrade_token';
const USER_KEY = 'nextrade_user';

export const useStore = create<StoreState>((set, get) => ({
  currentPage: Pages.LOGIN,
  pageHistory: [Pages.LOGIN],
  user: null,
  token: null,
  isAuthenticated: false,
  notifications: [],
  unreadCount: 0,
  sidebarOpen: true,
  loading: false,

  navigate: (page) => {
    const { currentPage, pageHistory } = get();
    set({
      currentPage: page,
      pageHistory: [...pageHistory.slice(-19), currentPage],
    });
  },

  goBack: () => {
    const { pageHistory } = get();
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      const prevPage = newHistory[newHistory.length - 1];
      set({ currentPage: prevPage, pageHistory: newHistory });
    }
  },

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'SUB_AGENT';
    set({
      user,
      token,
      isAuthenticated: true,
      currentPage: isAdmin ? Pages.ADMIN_USERS : Pages.DASHBOARD,
      pageHistory: [isAdmin ? Pages.ADMIN_USERS : Pages.DASHBOARD],
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentPage: Pages.LOGIN,
      pageHistory: [Pages.LOGIN],
      notifications: [],
      unreadCount: 0,
    });
  },

  setNotifications: (notifications) => {
    const unread = notifications.filter((n: any) => !n.read).length;
    set({ notifications, unreadCount: unread });
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setLoading: (loading) => set({ loading }),
}));

// Hydrate from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useStore.setState({
        user,
        token,
        isAuthenticated: true,
        currentPage: user.role === 'SUPER_ADMIN' ? Pages.ADMIN_USERS : user.role === 'SUB_AGENT' ? Pages.DASHBOARD : Pages.DASHBOARD,
      });
    } catch {}
  }
}

export default useStore;