import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeacherProfile } from '@/types';
import teachersData from '@/data/teachers.json';
import { logger } from '@/utils/logger';

interface ProfileState {
  profile: TeacherProfile | null;
  setProfile: (profile: TeacherProfile) => Promise<void>;
  updateProfile: (partial: Partial<TeacherProfile>) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
}

const PROFILE_KEY = '@dhamma_profile';

/**
 * Defensively coerce availability fields to typed arrays. Handles legacy
 * payloads that may have `monthlyAvailability: (0 | 1 | 'f')[]` from earlier
 * builds.
 */
function normalizeProfile(p: TeacherProfile): TeacherProfile {
  const next = { ...p } as TeacherProfile & { monthlyAvailability?: unknown };
  if (Array.isArray(next.monthlyAvailability) && (!p.availableMonths || !p.festivalMonths)) {
    const arr = next.monthlyAvailability as (number | string)[];
    next.availableMonths = arr.reduce<number[]>((acc, v, i) => (v === 1 ? [...acc, i] : acc), []);
    next.festivalMonths = arr.reduce<number[]>((acc, v, i) => (v === 'f' ? [...acc, i] : acc), []);
  }
  next.availableMonths = Array.isArray(next.availableMonths) ? next.availableMonths : [];
  next.festivalMonths = Array.isArray(next.festivalMonths) ? next.festivalMonths : [];
  delete next.monthlyAvailability;
  return next;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,

  setProfile: async (profile) => {
    await AsyncStorage.setItem(PROFILE_KEY + '_' + profile.id, JSON.stringify(profile));
    set({ profile });
  },

  updateProfile: async (partial) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(PROFILE_KEY + '_' + current.id, JSON.stringify(updated));
    set({ profile: updated });
  },

  loadProfile: async (userId) => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY + '_' + userId);
      if (stored) {
        const parsed = JSON.parse(stored) as TeacherProfile;
        set({ profile: normalizeProfile(parsed) });
        return;
      }
      const seed = (teachersData as unknown as TeacherProfile[]).find((t) => t.id === userId);
      if (seed) {
        const normalized = normalizeProfile(seed);
        set({ profile: normalized });
        await AsyncStorage.setItem(PROFILE_KEY + '_' + userId, JSON.stringify(normalized));
      }
    } catch (err) {
      logger.warn('[profileStore] loadProfile failed', err);
    }
  },

  clearProfile: () => set({ profile: null }),
}));
