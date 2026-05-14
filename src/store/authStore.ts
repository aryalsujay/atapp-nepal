/**
 * Auth store — the active session (role + userId + onboarded flag).
 * Persisted as a single JSON-serialised row in `settings` under `auth.session`.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { settingsRepo } from '@/db/repositories';
import { logger } from '@/utils/logger';

export type Role = 'teacher' | 'admin' | 'server';

interface SessionPayload {
  role: Role | null;
  userId: string | null;
  isOnboarded: boolean;
}

interface AuthState extends SessionPayload {
  isLoading: boolean;
  setAuth: (role: Role, userId: string, isOnboarded: boolean) => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  restoreSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const KEY = 'auth.session';

function persist(payload: SessionPayload): void {
  try {
    settingsRepo.setJson(getDb(), KEY, payload);
  } catch (err) {
    logger.warn('[authStore] persist failed', err);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  role: null,
  userId: null,
  isOnboarded: false,
  isLoading: true,

  setAuth: async (role, userId, isOnboarded) => {
    persist({ role, userId, isOnboarded });
    set({ role, userId, isOnboarded });
  },

  setOnboarded: async (value) => {
    const { role, userId } = get();
    persist({ role, userId, isOnboarded: value });
    set({ isOnboarded: value });
  },

  restoreSession: async () => {
    try {
      const payload = settingsRepo.getJson<SessionPayload>(getDb(), KEY);
      if (payload && payload.role && payload.userId) {
        set({
          role: payload.role,
          userId: payload.userId,
          isOnboarded: payload.isOnboarded,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      logger.warn('[authStore] restoreSession failed', err);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      settingsRepo.remove(getDb(), KEY);
    } catch (err) {
      logger.warn('[authStore] signOut failed', err);
    }
    set({ role: null, userId: null, isOnboarded: false });
  },
}));
