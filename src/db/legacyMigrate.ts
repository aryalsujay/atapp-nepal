/**
 * One-time migration of pre-SQLite AsyncStorage state into the new repos.
 *
 * Runs once on boot (gated by a `legacyMigrated.v1` settings flag) for users
 * upgrading from a build that stored everything in AsyncStorage.
 * Subsequent boots see the flag and short-circuit.
 *
 * Behavior per key:
 *   - `@dhamma_auth`              → settings.auth.session JSON
 *   - `@dhamma_settings`          → settings.ui.language / .ui.showCoTeacher
 *   - `@dhamma_applications_v2`   → applications rows (upsert by id)
 *   - `@dhamma_courses_synced`    → ignored (we re-sync on next cycle anyway)
 *   - `@dhamma_courses_last_sync` → settings.courses.lastSyncAt
 *   - `@dhamma_halls_v1`          → halls rows
 *   - `@dhamma_teachers_extra`    → teachers rows
 *   - `@dhamma_profile_*`         → teachers rows (single-user profile cursor)
 *
 * After all reads, the legacy keys are removed.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DB } from './index';
import { applicationsRepo, hallsRepo, settingsRepo, teachersRepo } from './repositories';
import { logger } from '@/utils/logger';

const FLAG_KEY = 'legacyMigrated';
const FLAG_VALUE = 'v1';

const KEYS = {
  auth: '@dhamma_auth',
  settings: '@dhamma_settings',
  apps: '@dhamma_applications_v2',
  coursesSynced: '@dhamma_courses_synced',
  coursesSyncTime: '@dhamma_courses_last_sync',
  halls: '@dhamma_halls_v1',
  teachersExtra: '@dhamma_teachers_extra',
  // profile uses '@dhamma_profile_' + userId, handled by prefix scan
  profilePrefix: '@dhamma_profile',
} as const;

interface Summary {
  ranBefore: boolean;
  authMigrated: boolean;
  settingsMigrated: boolean;
  applicationsMigrated: number;
  hallsMigrated: number;
  extraTeachersMigrated: number;
  profilesMigrated: number;
  lastSyncMigrated: boolean;
}

export async function legacyMigrate(db: DB): Promise<Summary> {
  const summary: Summary = {
    ranBefore: false,
    authMigrated: false,
    settingsMigrated: false,
    applicationsMigrated: 0,
    hallsMigrated: 0,
    extraTeachersMigrated: 0,
    profilesMigrated: 0,
    lastSyncMigrated: false,
  };

  // Gate: only run once per install.
  const flag = settingsRepo.get(db, FLAG_KEY);
  if (flag === FLAG_VALUE) {
    summary.ranBefore = true;
    return summary;
  }

  try {
    // ── @dhamma_auth → settings.auth.session ────────────────────────────────
    const authRaw = await AsyncStorage.getItem(KEYS.auth);
    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw) as {
          role: string | null;
          userId: string | null;
          isOnboarded: boolean;
        };
        settingsRepo.setJson(db, 'auth.session', parsed);
        summary.authMigrated = true;
      } catch (err) {
        logger.warn('[legacyMigrate] auth parse failed', err);
      }
    }

    // ── @dhamma_settings → ui.language / ui.showCoTeacher ───────────────────
    const settingsRaw = await AsyncStorage.getItem(KEYS.settings);
    if (settingsRaw) {
      try {
        const parsed = JSON.parse(settingsRaw) as {
          language?: 'en' | 'ne';
          showCoTeacher?: boolean;
        };
        if (parsed.language) settingsRepo.set(db, 'ui.language', parsed.language);
        if (typeof parsed.showCoTeacher === 'boolean') {
          settingsRepo.set(db, 'ui.showCoTeacher', parsed.showCoTeacher ? '1' : '0');
        }
        summary.settingsMigrated = true;
      } catch (err) {
        logger.warn('[legacyMigrate] settings parse failed', err);
      }
    }

    // ── @dhamma_applications_v2 → applications table ────────────────────────
    const appsRaw = await AsyncStorage.getItem(KEYS.apps);
    if (appsRaw) {
      try {
        const parsed = JSON.parse(appsRaw) as {
          id: number;
          courseId: number;
          teacherId: string;
          status: string;
          appliedDate?: string;
          source?: 'applied' | 'assigned';
          rejectionReason?: string;
          queuePosition?: number;
          withdrawalNote?: string;
        }[];
        for (const a of parsed) {
          applicationsRepo.upsert(db, {
            id: a.id,
            courseId: a.courseId,
            teacherId: a.teacherId,
            status: a.status as Parameters<typeof applicationsRepo.upsert>[1]['status'],
            appliedDate: a.appliedDate ?? null,
            source: a.source ?? 'applied',
            rejectionReason: a.rejectionReason ?? null,
            queuePosition: a.queuePosition ?? null,
            withdrawalNote: a.withdrawalNote ?? null,
          });
          summary.applicationsMigrated++;
        }
      } catch (err) {
        logger.warn('[legacyMigrate] applications parse failed', err);
      }
    }

    // ── @dhamma_courses_last_sync → settings.courses.lastSyncAt ─────────────
    const syncRaw = await AsyncStorage.getItem(KEYS.coursesSyncTime);
    if (syncRaw) {
      settingsRepo.set(db, 'courses.lastSyncAt', syncRaw);
      summary.lastSyncMigrated = true;
    }

    // ── @dhamma_halls_v1 → halls ────────────────────────────────────────────
    const hallsRaw = await AsyncStorage.getItem(KEYS.halls);
    if (hallsRaw) {
      try {
        const parsed = JSON.parse(hallsRaw) as {
          id: string;
          centreId: string;
          name: string;
          teacherSlots: number;
          genderRequired?: string;
          notes?: string;
        }[];
        for (const h of parsed) {
          hallsRepo.upsert(db, {
            id: h.id,
            centreId: h.centreId,
            name: h.name,
            teacherSlots: h.teacherSlots,
            genderRequired: h.genderRequired ?? null,
            notes: h.notes ?? null,
          });
          summary.hallsMigrated++;
        }
      } catch (err) {
        logger.warn('[legacyMigrate] halls parse failed', err);
      }
    }

    // ── @dhamma_teachers_extra → teachers (extra rows beyond seed) ─────────
    const extraRaw = await AsyncStorage.getItem(KEYS.teachersExtra);
    if (extraRaw) {
      try {
        const parsed = JSON.parse(extraRaw) as Record<string, unknown>[];
        for (const t of parsed) {
          const teacher = t as {
            id: string;
            name: string;
            [k: string]: unknown;
          };
          teachersRepo.upsert(db, {
            id: teacher.id,
            role: (teacher.role as 'teacher' | 'server') ?? 'teacher',
            name: teacher.name,
            gender: (teacher.gender as 'M' | 'F') ?? null,
            email: (teacher.email as string) || null,
            phone: (teacher.phone as string) || null,
            inviteCode: (teacher.inviteCode as string) || null,
            passwordHash: (teacher.passwordHash as string) ?? '',
            region: (teacher.region as string) || null,
            flag: (teacher.flag as string) || null,
            authorizedSince: (teacher.authorizedSince as number) || null,
            totalCourses: (teacher.totalCourses as number) || 0,
            centersServed: (teacher.centersServed as number) || 0,
            coursesThisYear: (teacher.coursesThisYear as number) || 0,
            isOnboarded: Boolean(teacher.isOnboarded),
            personalNote: (teacher.personalNote as string) || null,
            authorizations: (teacher.authorizations as string[]) ?? [],
            languages: (teacher.languages as Record<string, string>) ?? {},
            preferredRegions: (teacher.preferredRegions as string[]) ?? [],
            availableMonths: (teacher.availableMonths as number[]) ?? [],
            festivalMonths: (teacher.festivalMonths as number[]) ?? [],
            teachingHistory: (teacher.teachingHistory as unknown[]) ?? [],
          });
          summary.extraTeachersMigrated++;
        }
      } catch (err) {
        logger.warn('[legacyMigrate] teachers_extra parse failed', err);
      }
    }

    // ── @dhamma_profile_<userId> → teachers row (user-edited prefs) ─────────
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const profileKeys = allKeys.filter((k) => k.startsWith(KEYS.profilePrefix + '_'));
      for (const key of profileKeys) {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) continue;
        try {
          const profile = JSON.parse(raw) as {
            id: string;
            name?: string;
            gender?: 'M' | 'F';
            email?: string;
            phone?: string;
            inviteCode?: string;
            region?: string;
            flag?: string;
            authorizedSince?: number;
            totalCourses?: number;
            centersServed?: number;
            coursesThisYear?: number;
            isOnboarded?: boolean;
            personalNote?: string;
            authorizations?: string[];
            languages?: Record<string, string>;
            preferredRegions?: string[];
            availableMonths?: number[];
            festivalMonths?: number[];
            teachingHistory?: unknown[];
          };
          if (!profile.id) continue;
          teachersRepo.upsert(db, {
            id: profile.id,
            role: 'teacher',
            name: profile.name ?? '',
            gender: profile.gender ?? null,
            email: profile.email || null,
            phone: profile.phone || null,
            inviteCode: profile.inviteCode || null,
            region: profile.region || null,
            flag: profile.flag || null,
            authorizedSince: profile.authorizedSince ?? null,
            totalCourses: profile.totalCourses ?? 0,
            centersServed: profile.centersServed ?? 0,
            coursesThisYear: profile.coursesThisYear ?? 0,
            isOnboarded: Boolean(profile.isOnboarded),
            personalNote: profile.personalNote ?? null,
            authorizations: profile.authorizations ?? [],
            languages: profile.languages ?? {},
            preferredRegions: profile.preferredRegions ?? [],
            availableMonths: profile.availableMonths ?? [],
            festivalMonths: profile.festivalMonths ?? [],
            teachingHistory: profile.teachingHistory ?? [],
          });
          summary.profilesMigrated++;
        } catch (err) {
          logger.warn('[legacyMigrate] profile parse failed for ' + key, err);
        }
      }
    } catch (err) {
      logger.warn('[legacyMigrate] getAllKeys failed', err);
    }

    // ── Delete legacy keys ─────────────────────────────────────────────────
    const allKeys = await AsyncStorage.getAllKeys();
    const toRemove = allKeys.filter(
      (k) =>
        k === KEYS.auth ||
        k === KEYS.settings ||
        k === KEYS.apps ||
        k === KEYS.coursesSynced ||
        k === KEYS.coursesSyncTime ||
        k === KEYS.halls ||
        k === KEYS.teachersExtra ||
        k.startsWith(KEYS.profilePrefix + '_'),
    );
    if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);

    // ── Set the flag last so we only mark "done" after a successful run ────
    settingsRepo.set(db, FLAG_KEY, FLAG_VALUE);

    logger.info('[legacyMigrate] complete', summary);
  } catch (err) {
    logger.warn('[legacyMigrate] outer failure (will retry next boot)', err);
  }

  return summary;
}
