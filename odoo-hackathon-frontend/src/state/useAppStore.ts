import { create } from 'zustand';
import type { User, Company } from '../types';
import { getCurrentUser } from '../api/auth';

interface AppState {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  company: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setCompany: (company) => set({ company }),

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const result = await getCurrentUser();
      if (result) {
        set({
          user: result.user,
          company: result.company,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          company: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Hydration error:', error);
      set({
        user: null,
        company: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  logout: () => {
    set({
      user: null,
      company: null,
    });
  },
}));
