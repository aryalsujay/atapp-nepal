import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'teacher' | 'admin' | 'server';

interface AuthState {
  role: Role | null;
  userId: string | null;
  isOnboarded: boolean;
  isLoading: boolean;

  setAuth: (role: Role, userId: string, isOnboarded: boolean) => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  restoreSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AUTH_KEY = '@dhamma_auth';

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  userId: null,
  isOnboarded: false,
  isLoading: true,

  setAuth: async (role, userId, isOnboarded) => {
    const data = { role, userId, isOnboarded };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
    set({ role, userId, isOnboarded });
  },

  setOnboarded: async (value) => {
    const { role, userId } = useAuthStore.getState();
    const data = { role, userId, isOnboarded: value };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
    set({ isOnboarded: value });
  },

  restoreSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const { role, userId, isOnboarded } = JSON.parse(raw);
        set({ role, userId, isOnboarded, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ role: null, userId: null, isOnboarded: false });
  },
}));
