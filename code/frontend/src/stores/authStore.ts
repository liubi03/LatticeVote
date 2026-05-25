import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { User } from '../types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, role?: string) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(username, password);
          const { access_token, user } = response.data;
          set({
            user: user as User,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          localStorage.setItem('token', access_token);
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.detail || '登录失败';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      register: async (username: string, password: string, role?: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(username, password, role);
          set({ isLoading: false, error: null });
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.detail || '注册失败';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
