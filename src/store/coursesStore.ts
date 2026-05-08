import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bundledCourses from '../data/courses.json';
import { parseSchedulePage, NEPAL_CENTERS } from '../utils/scraper';
import type { Course } from '../types/course';

const COURSES_KEY = '@dhamma_courses_synced';
const SYNC_TIME_KEY = '@dhamma_courses_last_sync';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

interface CoursesState {
  courses: Course[];
  lastSyncAt: Date | null;
  syncing: boolean;
  loaded: boolean;
  loadCourses: () => Promise<void>;
  syncCourses: () => Promise<{ added: number; error?: string }>;
  shouldAutoSync: () => boolean;
}

function scrapedToCourse(scraped: ReturnType<typeof parseSchedulePage>[number], id: number): Course {
  return {
    id,
    type: scraped.type as any,
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
    status: scraped.status as any,
    notes: scraped.notes || undefined,
    distanceKm: 0,
    travelHrs: 0,
    altitude: scraped.altitude,
    students: { expected: 80, male: 40, female: 40 },
    arrivalDate: scraped.startDate ? (() => { const [,m,d] = scraped.startDate.split('-'); const mn = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${mn[+m]} ${+d}`; })() : '',
    arrivalTime: '5:00 PM',
    coordinator: { name: 'Center Coordinator', role: 'Course Coordinator', phone: 'See dhamma.org' },
    transport: 'See dhamma.org for directions',
  };
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: bundledCourses as unknown as Course[],
  lastSyncAt: null,
  syncing: false,
  loaded: false,

  loadCourses: async () => {
    try {
      const [raw, syncTimeRaw] = await Promise.all([
        AsyncStorage.getItem(COURSES_KEY),
        AsyncStorage.getItem(SYNC_TIME_KEY),
      ]);
      const synced: Course[] = raw ? JSON.parse(raw) : [];
      const lastSyncAt = syncTimeRaw ? new Date(syncTimeRaw) : null;
      set({
        courses: synced.length > 0 ? synced : (bundledCourses as unknown as Course[]),
        lastSyncAt,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  shouldAutoSync: () => {
    const { lastSyncAt } = get();
    if (!lastSyncAt) return true;
    return Date.now() - lastSyncAt.getTime() > SIX_HOURS_MS;
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
          const courses = parseSchedulePage(html, schId);
          allScraped.push(...courses);
        } catch {
          // skip failed centers, partial sync is fine
        }
      }

      if (allScraped.length === 0) {
        set({ syncing: false });
        return { added: 0, error: 'No courses returned from dhamma.org' };
      }

      const courses = allScraped.map((s, i) => scrapedToCourse(s, i + 1));
      const now = new Date();

      await Promise.all([
        AsyncStorage.setItem(COURSES_KEY, JSON.stringify(courses)),
        AsyncStorage.setItem(SYNC_TIME_KEY, now.toISOString()),
      ]);

      set({ courses, lastSyncAt: now, syncing: false });
      return { added: courses.length };
    } catch (err: any) {
      set({ syncing: false });
      return { added: 0, error: err?.message ?? 'Sync failed' };
    }
  },
}));
