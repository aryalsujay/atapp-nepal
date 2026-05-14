/**
 * Teachers store — thin wrapper over `teachersRepo`.
 *
 * Reads happen against SQLite at boot time (`loadTeachers`) and on demand
 * (`findTeacher`). Writes go through `addTeacher`, which upserts into the
 * `teachers` table — no more AsyncStorage JSON.
 *
 * The public interface (`allTeachers`, `findTeacher`, `addTeacher`) is
 * unchanged so existing screens don't need rewiring.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { teachersRepo } from '@/db/repositories';
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
  role?: 'teacher' | 'server';
  isOnboarded: boolean;
}

interface TeachersState {
  allTeachers: StoredTeacher[];
  loaded: boolean;
  loadTeachers: () => Promise<void>;
  addTeacher: (teacher: StoredTeacher) => Promise<void>;
  findTeacher: (identifier: string) => StoredTeacher | undefined;
}

/**
 * Convert the repo's domain type to the legacy `StoredTeacher` shape the rest
 * of the app expects. The shapes are nearly identical — only `inviteCode`
 * and a couple of nullables differ.
 */
function toStored(t: ReturnType<typeof teachersRepo.list>[number]): StoredTeacher {
  return {
    id: t.id,
    name: t.name,
    gender: (t.gender ?? 'M') as 'M' | 'F',
    email: t.email ?? '',
    phone: t.phone ?? undefined,
    inviteCode: t.inviteCode ?? '',
    passwordHash: t.passwordHash,
    region: t.region ?? '',
    flag: t.flag ?? '',
    authorizedSince: t.authorizedSince ?? 0,
    totalCourses: t.totalCourses,
    centersServed: t.centersServed,
    coursesThisYear: t.coursesThisYear,
    authorizations: t.authorizations,
    languages: t.languages,
    preferredRegions: t.preferredRegions,
    availableMonths: t.availableMonths,
    festivalMonths: t.festivalMonths,
    personalNote: t.personalNote ?? '',
    teachingHistory: t.teachingHistory as HistoryEntry[],
    role: t.role,
    isOnboarded: t.isOnboarded,
  };
}

export const useTeachersStore = create<TeachersState>((set) => ({
  allTeachers: [],
  loaded: false,

  loadTeachers: async () => {
    try {
      const all = teachersRepo.list(getDb()).map(toStored);
      set({ allTeachers: all, loaded: true });
    } catch (err) {
      logger.warn('[teachersStore] loadTeachers failed', err);
      set({ loaded: true });
    }
  },

  addTeacher: async (teacher) => {
    try {
      teachersRepo.upsert(getDb(), {
        id: teacher.id,
        role: teacher.role ?? 'teacher',
        name: teacher.name,
        gender: teacher.gender,
        email: teacher.email || null,
        phone: teacher.phone || null,
        inviteCode: teacher.inviteCode || null,
        passwordHash: teacher.passwordHash,
        region: teacher.region || null,
        flag: teacher.flag || null,
        authorizedSince: teacher.authorizedSince || null,
        totalCourses: teacher.totalCourses,
        centersServed: teacher.centersServed,
        coursesThisYear: teacher.coursesThisYear,
        isOnboarded: teacher.isOnboarded,
        personalNote: teacher.personalNote || null,
        authorizations: teacher.authorizations,
        languages: teacher.languages,
        preferredRegions: teacher.preferredRegions,
        availableMonths: teacher.availableMonths,
        festivalMonths: teacher.festivalMonths,
        teachingHistory: teacher.teachingHistory,
      });
      const all = teachersRepo.list(getDb()).map(toStored);
      set({ allTeachers: all });
    } catch (err) {
      logger.warn('[teachersStore] addTeacher failed', err);
    }
  },

  findTeacher: (identifier) => {
    // Phone lookups still need JS-side normalization (strip non-digits, then
    // suffix-match) so they're not delegated to the repo.
    const digits = identifier.replace(/[^\d]/g, '');

    try {
      const direct = teachersRepo.findByIdentifier(getDb(), identifier);
      if (direct) return toStored(direct);

      if (digits.length >= 5) {
        // Fall back to a list scan for phone matching — small data, cheap.
        const stored = teachersRepo.list(getDb()).map(toStored);
        return stored.find((t) => {
          if (!t.phone) return false;
          const tDigits = t.phone.replace(/[^\d]/g, '');
          return tDigits === digits || tDigits.endsWith(digits) || digits.endsWith(tDigits);
        });
      }
      return undefined;
    } catch (err) {
      logger.warn('[teachersStore] findTeacher failed', err);
      return undefined;
    }
  },
}));
