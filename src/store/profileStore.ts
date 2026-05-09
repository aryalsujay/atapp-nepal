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

// Ensure monthlyAvailability has 12 entries (one per month). Pads with 0 (unavailable).
function normalizeProfile(p: TeacherProfile): TeacherProfile {
  const avail = Array.isArray(p.monthlyAvailability) ? p.monthlyAvailability.slice(0, 12) : [];
  while (avail.length < 12) avail.push(0);
  return { ...p, monthlyAvailability: avail };
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
    } catch {}
  },

  clearProfile: () => set({ profile: null }),
}));
