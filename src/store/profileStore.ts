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
    personalNoteUpdatedAt: t.personalNoteUpdatedAt,
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
      // Stamp `personalNoteUpdatedAt` when the note text actually changes vs
      // what's already in store. Lets edit screens just write `personalNote`
      // without thinking about the timestamp.
      const prevNote = get().profile?.personalNote ?? null;
      const nextNote = profile.personalNote || null;
      const noteChanged = nextNote !== prevNote;
      const stampedAt = noteChanged ? Date.now() : profile.personalNoteUpdatedAt;
      const finalProfile: TeacherProfile = { ...profile, personalNoteUpdatedAt: stampedAt };

      teachersRepo.upsert(getDb(), {
        id: finalProfile.id,
        role: 'teacher',
        name: finalProfile.name,
        gender: finalProfile.gender,
        email: finalProfile.email || null,
        phone: finalProfile.phone || null,
        inviteCode: finalProfile.inviteCode || null,
        region: finalProfile.region || null,
        flag: finalProfile.flag || null,
        authorizedSince: finalProfile.authorizedSince || null,
        totalCourses: finalProfile.totalCourses,
        centersServed: finalProfile.centersServed,
        coursesThisYear: finalProfile.coursesThisYear,
        isOnboarded: finalProfile.isOnboarded,
        personalNote: finalProfile.personalNote || null,
        personalNoteUpdatedAt: finalProfile.personalNoteUpdatedAt,
        authorizations: finalProfile.authorizations,
        languages: finalProfile.languages as Record<string, string>,
        preferredRegions: finalProfile.preferredRegions,
        availableMonths: finalProfile.availableMonths,
        festivalMonths: finalProfile.festivalMonths,
        teachingHistory: finalProfile.teachingHistory,
        homeCity: finalProfile.homeCity ?? null,
        homeLat: finalProfile.homeLat ?? null,
        homeLng: finalProfile.homeLng ?? null,
      });
      set({ profile: finalProfile });
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
