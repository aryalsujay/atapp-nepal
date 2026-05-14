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

interface CoursesState {
  courses: Course[];
  lastSyncAt: Date | null;
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
  syncing: false,
  loaded: false,

  loadCourses: async () => {
    try {
      const db = getDb();
      const lastSyncRaw = settingsRepo.get(db, LAST_SYNC_KEY);
      const lastSyncAt = lastSyncRaw ? new Date(lastSyncRaw) : null;
      set({ courses: coursesRepo.list(db), lastSyncAt, loaded: true });
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
        set({ syncing: false });
        return { added: 0, error: 'No courses returned from dhamma.org' };
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

      // Atomic replace: upsert new rows + delete any rows whose IDs aren't in
      // the fresh set. No "empty list" window because we never truncate the
      // table first.
      const freshIds = new Set(courses.map((c) => c.id));
      db.transaction(() => {
        coursesRepo.upsertMany(db, courses);
        const existing = coursesRepo.list(db);
        for (const c of existing) {
          if (!freshIds.has(c.id)) coursesRepo.deleteById(db, c.id);
        }
        settingsRepo.set(db, LAST_SYNC_KEY, now.toISOString());
      });

      set({ courses, lastSyncAt: now, syncing: false });
      return { added: courses.length };
    } catch (err) {
      set({ syncing: false });
      const message = err instanceof Error ? err.message : 'Sync failed';
      logger.warn('[coursesStore] syncCourses failed', err);
      return { added: 0, error: message };
    }
  },
}));
