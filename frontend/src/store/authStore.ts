import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setToken: (token: string) => set({ token }),
      setUser: (user: AuthUser) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null;
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(key);
        },
      },
    }
  )
);
