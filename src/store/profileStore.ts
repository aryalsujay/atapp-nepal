/**
 * Profile store — wraps `teachersRepo` for the single "logged-in user's
 * profile" cursor. Same table as `teachersStore` reads, different access
 * pattern (one row at a time, write-heavy).
 *
 * Onboarding writes here on step-5 completion. Edit-profile writes here on
 * save. Home + course-detail read here.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { teachersRepo } from '@/db/repositories';
import type { TeacherProfile, CourseType, LanguageLevel, HistoryEntry } from '@/types';
import { logger } from '@/utils/logger';

interface ProfileState {
  profile: TeacherProfile | null;
  setProfile: (profile: TeacherProfile) => Promise<void>;
  updateProfile: (partial: Partial<TeacherProfile>) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
}

function domainToProfile(t: ReturnType<typeof teachersRepo.findById>): TeacherProfile | null {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    gender: (t.gender ?? 'M') as TeacherProfile['gender'],
    email: t.email ?? '',
    phone: t.phone ?? undefined,
    region: t.region ?? '',
    flag: t.flag ?? undefined,
    authorizedSince: t.authorizedSince ?? 0,
    totalCourses: t.totalCourses,
    centersServed: t.centersServed,
    coursesThisYear: t.coursesThisYear,
    authorizations: t.authorizations as CourseType[],
    languages: t.languages as Record<string, LanguageLevel>,
    preferredRegions: t.preferredRegions,
    availableMonths: t.availableMonths,
    festivalMonths: t.festivalMonths,
    personalNote: t.personalNote ?? '',
    teachingHistory: t.teachingHistory as HistoryEntry[],
    inviteCode: t.inviteCode ?? undefined,
    isOnboarded: t.isOnboarded,
    homeCity: t.homeCity ?? null,
    homeLat: t.homeLat ?? null,
    homeLng: t.homeLng ?? null,
  };
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,

  setProfile: async (profile) => {
    try {
      teachersRepo.upsert(getDb(), {
        id: profile.id,
        role: 'teacher',
        name: profile.name,
        gender: profile.gender,
        email: profile.email || null,
        phone: profile.phone || null,
        inviteCode: profile.inviteCode || null,
        region: profile.region || null,
        flag: profile.flag || null,
        authorizedSince: profile.authorizedSince || null,
        totalCourses: profile.totalCourses,
        centersServed: profile.centersServed,
        coursesThisYear: profile.coursesThisYear,
        isOnboarded: profile.isOnboarded,
        personalNote: profile.personalNote || null,
        authorizations: profile.authorizations,
        languages: profile.languages as Record<string, string>,
        preferredRegions: profile.preferredRegions,
        availableMonths: profile.availableMonths,
        festivalMonths: profile.festivalMonths,
        teachingHistory: profile.teachingHistory,
        homeCity: profile.homeCity ?? null,
        homeLat: profile.homeLat ?? null,
        homeLng: profile.homeLng ?? null,
      });
      set({ profile });
    } catch (err) {
      logger.warn('[profileStore] setProfile failed', err);
    }
  },

  updateProfile: async (partial) => {
    const current = get().profile;
    if (!current) return;
    const updated: TeacherProfile = { ...current, ...partial };
    await get().setProfile(updated);
  },

  loadProfile: async (userId) => {
    try {
      const fromDb = teachersRepo.findById(getDb(), userId);
      const profile = domainToProfile(fromDb);
      if (profile) set({ profile });
    } catch (err) {
      logger.warn('[profileStore] loadProfile failed', err);
    }
  },

  clearProfile: () => set({ profile: null }),
}));
