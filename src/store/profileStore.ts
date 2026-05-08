import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeacherProfile } from '../types';
import teachersData from '../data/teachers.json';

interface ProfileState {
  profile: TeacherProfile | null;
  setProfile: (profile: TeacherProfile) => Promise<void>;
  updateProfile: (partial: Partial<TeacherProfile>) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
}

const PROFILE_KEY = '@dhamma_profile';

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
        set({ profile: JSON.parse(stored) });
        return;
      }
      // Fall back to seeded JSON data
      const seed = (teachersData as unknown as TeacherProfile[]).find((t) => t.id === userId);
      if (seed) {
        set({ profile: seed });
        await AsyncStorage.setItem(PROFILE_KEY + '_' + userId, JSON.stringify(seed));
      }
    } catch {}
  },

  clearProfile: () => set({ profile: null }),
}));
