import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import seedTeachers from '../data/teachers.json';

export interface StoredTeacher {
  id: string;
  name: string;
  gender: 'M' | 'F';
  email: string;
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
  monthlyAvailability: (number | string)[];
  personalNote: string;
  teachingHistory: any[];
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
    } catch {
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
    return all.find((t) => t.id === identifier || t.email.toLowerCase() === lower);
  },
}));
