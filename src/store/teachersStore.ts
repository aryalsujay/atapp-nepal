import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import seedTeachers from '@/data/teachers.json';
import type { HistoryEntry } from '@/types';
import { logger } from '@/utils/logger';

export interface StoredTeacher {
  id: string;
  name: string;
  gender: 'M' | 'F';
  email: string;
  phone?: string;
  inviteCode: string;
  passwordHash: string;
  region: string;
  flag: string;
  authorizedSince: number;
  totalCourses: number;
  centersServed: number;
  coursesThisYear: number;
  authorizations: string[];
  languages: Record<string, string>;
  preferredRegions: string[];
  availableMonths: number[];
  festivalMonths: number[];
  personalNote: string;
  teachingHistory: HistoryEntry[];
  /** Server users have role='server'; teachers have role='teacher' or undefined. */
  role?: 'teacher' | 'server';
  isOnboarded: boolean;
}

const TEACHERS_KEY = '@dhamma_teachers_extra';

interface TeachersState {
  extraTeachers: StoredTeacher[];
  allTeachers: StoredTeacher[];
  loaded: boolean;
  loadTeachers: () => Promise<void>;
  addTeacher: (teacher: StoredTeacher) => Promise<void>;
  findTeacher: (identifier: string) => StoredTeacher | undefined;
}

export const useTeachersStore = create<TeachersState>((set, get) => ({
  extraTeachers: [],
  allTeachers: seedTeachers as unknown as StoredTeacher[],
  loaded: false,

  loadTeachers: async () => {
    try {
      const raw = await AsyncStorage.getItem(TEACHERS_KEY);
      const extra: StoredTeacher[] = raw ? JSON.parse(raw) : [];
      const all = [...(seedTeachers as unknown as StoredTeacher[]), ...extra];
      set({ extraTeachers: extra, allTeachers: all, loaded: true });
    } catch (err) {
      logger.warn('[teachersStore] loadTeachers failed', err);
      set({ loaded: true });
    }
  },

  addTeacher: async (teacher) => {
    const prev = get().extraTeachers;
    const updated = [...prev, teacher];
    await AsyncStorage.setItem(TEACHERS_KEY, JSON.stringify(updated));
    const all = [...(seedTeachers as unknown as StoredTeacher[]), ...updated];
    set({ extraTeachers: updated, allTeachers: all });
  },

  findTeacher: (identifier) => {
    const all = get().allTeachers;
    const lower = identifier.toLowerCase();
    const digits = identifier.replace(/[^\d]/g, '');
    return all.find((t) => {
      if (t.id === identifier) return true;
      if (t.email.toLowerCase() === lower) return true;
      if (t.inviteCode && t.inviteCode.toLowerCase() === lower) return true;
      if (t.phone && digits.length >= 5) {
        const tDigits = t.phone.replace(/[^\d]/g, '');
        if (tDigits === digits || tDigits.endsWith(digits) || digits.endsWith(tDigits)) {
          return true;
        }
      }
      return false;
    });
  },
}));
