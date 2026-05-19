/**
 * Courses store — wraps `coursesRepo` + the dhamma.org sync flow.
 *
 * Source of truth is the `courses` table. On boot we read whatever is cached;
 * the sync flow (every 3 h via `SYNC_MIN_AGE_MS`) replaces it from the live
 * schedule pages.
 *
 * The native bundled JSON (`src/data/courses.json`) seeds SQLite on first
 * launch via `db/seed.ts`; this store never reads it directly.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { coursesRepo, settingsRepo } from '@/db/repositories';
import { parseSchedulePage, NEPAL_CENTERS } from '@/utils/scraper';
import { stableCourseId } from '@/utils/courseId';
import { SYNC_MIN_AGE_MS } from '@/config/app';
import type { Course } from '@/types/course';
import { logger } from '@/utils/logger';

const LAST_SYNC_KEY = 'courses.lastSyncAt';
const LAST_SYNC_ERROR_KEY = 'courses.lastSyncError';

interface CoursesState {
  courses: Course[];
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  syncing: boolean;
  loaded: boolean;
  loadCourses: () => Promise<void>;
  syncCourses: () => Promise<{ added: number; error?: string }>;
  shouldAutoSync: () => boolean;
}

function scrapedToCourse(scraped: ReturnType<typeof parseSchedulePage>[number]): Course {
  const id = stableCourseId(
    scraped.centerId,
    scraped.startDate,
    scraped.type,
    scraped.genderRequired,
  );
  const months = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const arrival = scraped.startDate
    ? (() => {
        const [, m, d] = scraped.startDate.split('-');
        return `${months[+m]} ${+d}`;
      })()
    : '';
  return {
    id,
    type: scraped.type as Course['type'],
    center: scraped.centerName,
    centerId: scraped.centerId,
    city: scraped.city,
    country: 'NP',
    flag: '🇳🇵',
    dates: scraped.dates,
    startDate: scraped.startDate,
    endDate: scraped.endDate,
    languages: scraped.languages,
    needCount: 1,
    genderRequired: scraped.genderRequired,
    status: scraped.status,
    notes: scraped.notes || undefined,
    distanceKm: 0,
    travelHrs: 0,
    altitude: scraped.altitude,
    students: { expected: 80, male: 40, female: 40 },
    arrivalDate: arrival,
    arrivalTime: '5:00 PM',
    coordinator: {
      name: 'Center Coordinator',
      role: 'Course Coordinator',
      phone: 'See dhamma.org',
    },
    transport: 'See dhamma.org for directions',
  };
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  lastSyncAt: null,
  lastSyncError: null,
  syncing: false,
  loaded: false,

  loadCourses: async () => {
    try {
      const db = getDb();
      const lastSyncRaw = settingsRepo.get(db, LAST_SYNC_KEY);
      const lastSyncAt = lastSyncRaw ? new Date(lastSyncRaw) : null;
      const lastSyncError = settingsRepo.get(db, LAST_SYNC_ERROR_KEY);
      set({ courses: coursesRepo.list(db), lastSyncAt, lastSyncError, loaded: true });
    } catch (err) {
      logger.warn('[coursesStore] loadCourses failed', err);
      set({ loaded: true });
    }
  },

  shouldAutoSync: () => {
    const { lastSyncAt } = get();
    if (!lastSyncAt) return true;
    return Date.now() - lastSyncAt.getTime() > SYNC_MIN_AGE_MS;
  },

  syncCourses: async () => {
    if (get().syncing) return { added: 0 };
    set({ syncing: true });

    try {
      const allScraped: ReturnType<typeof parseSchedulePage> = [];
      for (const schId of Object.keys(NEPAL_CENTERS)) {
        try {
          const res = await fetch(`https://www.dhamma.org/en/schedules/${schId}`, {
            headers: { 'User-Agent': 'DhammaATApp/1.0' },
          });
          if (!res.ok) continue;
          const html = await res.text();
          const parsed = parseSchedulePage(html, schId);
          allScraped.push(...parsed);
        } catch {
          // Partial sync is fine — keep going on per-centre failures.
        }
      }

      if (allScraped.length === 0) {
        const msg = 'No courses returned from dhamma.org';
        try {
          settingsRepo.set(getDb(), LAST_SYNC_ERROR_KEY, msg);
        } catch {
          /* settings write failure is non-fatal */
        }
        set({ syncing: false, lastSyncError: msg });
        return { added: 0, error: msg };
      }

      // Dedupe by stable ID — dhamma.org occasionally lists the same logical
      // course twice (e.g. a paired male+female slot rendered as one row).
      const byId = new Map<number, Course>();
      for (const s of allScraped) {
        const c = scrapedToCourse(s);
        if (!byId.has(c.id)) byId.set(c.id, c);
      }
      const courses = [...byId.values()];
      const now = new Date();
      const db = getDb();

      // Sync-upsert new rows (preserves admin-set fields like coteacher /
      // coordinator / transport / notes), then delete rows whose IDs are
      // no longer in the fresh set. `syncUpsertMany` already runs in its
      // own SQLite transaction — we do NOT wrap it in an outer one
      // because native SQLite forbids nested `BEGIN TRANSACTION`. The
      // few extra writes between the upsert and the delete are not
      // visible to other readers (single-process app), and a sync
      // interrupted between them is corrected on the next sync.
      const freshIds = new Set(courses.map((c) => c.id));
      coursesRepo.syncUpsertMany(db, courses);
      const existing = coursesRepo.list(db);
      for (const c of existing) {
        if (!freshIds.has(c.id)) coursesRepo.deleteById(db, c.id);
      }
      settingsRepo.set(db, LAST_SYNC_KEY, now.toISOString());
      settingsRepo.set(db, LAST_SYNC_ERROR_KEY, '');

      set({ courses, lastSyncAt: now, lastSyncError: null, syncing: false });
      return { added: courses.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      try {
        settingsRepo.set(getDb(), LAST_SYNC_ERROR_KEY, message);
      } catch {
        /* settings write failure is non-fatal */
      }
      set({ syncing: false, lastSyncError: message });
      logger.warn('[coursesStore] syncCourses failed', err);
      return { added: 0, error: message };
    }
  },
}));
