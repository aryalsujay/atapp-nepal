/**
 * Seed — first-run only. Reads JSON files from `src/data/` and inserts them
 * into the empty tables.
 *
 * Subsequent app launches read from the DB; seeding is gated by the
 * `seeded` flag in the `settings` table.
 *
 * Once SQLite is the primary source, future seed data changes ship as
 * migrations (`0002_*`) — not via re-seeding.
 */

import type { DB } from './index';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import adminJson from '@/data/admin.json';
import teachersJson from '@/data/teachers.json';
import centersJson from '@/data/centers.json';
import hallsJson from '@/data/halls.json';
import coursesJson from '@/data/courses.json';
import applicationsJson from '@/data/applications.json';
import serverCoursesJson from '@/data/serverCourses.json';
import serverApplicationsJson from '@/data/serverApplications.json';
import { logger } from '@/utils/logger';

const SEED_KEY = 'seeded';
const SEED_VALUE = 'v1';

interface SeedTeacher {
  id: string;
  name: string;
  gender?: 'M' | 'F';
  email?: string;
  inviteCode?: string;
  passwordHash: string;
  role?: 'teacher' | 'server';
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
}

interface SeedCentre {
  id: string;
  name: string;
  nameNe?: string;
  city?: string;
  region?: string;
  country?: string;
  flag?: string;
  altitude?: number;
  lat?: number;
  lng?: number;
}

interface SeedHall {
  id: string;
  centreId: string;
  name: string;
  teacherSlots?: number;
  genderRequired?: string;
  notes?: string;
}

interface SeedCourse {
  id: number;
  type: string;
  center: string;
  centerId?: string;
  city?: string;
  country?: string;
  flag?: string;
  dates?: string;
  startDate: string;
  endDate: string;
  languages?: string[];
  needCount?: number;
  genderRequired?: string;
  status?: string;
  distanceKm?: number;
  travelHrs?: number;
  altitude?: number;
  students?: unknown;
  arrivalDate?: string;
  arrivalTime?: string;
  coordinator?: unknown;
  transport?: string;
  notes?: string;
}

interface SeedApplication {
  id: number;
  courseId: number;
  teacherId: string;
  status: string;
  appliedDate?: string;
  source?: string;
  rejectionReason?: string;
  queuePosition?: number;
  withdrawalNote?: string;
}

interface SeedServerCourse {
  id: number;
  center: string;
  centerId?: string;
  city?: string;
  type?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  mServers?: number;
  fServers?: number;
  filled?: number;
  total?: number;
  areas?: string[];
  arriveBy?: string;
  altitude?: number;
  country?: string;
  flag?: string;
}

interface SeedServerApplication {
  id: number;
  courseId: number;
  serverId?: string;
  center?: string;
  type?: string;
  dates?: string;
  status: string;
  areas?: string[];
  partial?: boolean;
  days?: string | null;
  applied?: string;
  coordinator?: string;
  coordPhone?: string;
  arriveBy?: string;
  reason?: string;
}

export function isSeeded(db: DB): boolean {
  const row = db.queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    SEED_KEY,
  ]);
  return row?.value === SEED_VALUE;
}

export function seedDatabase(db: DB): { inserted: Record<string, number> } {
  if (isSeeded(db)) {
    return { inserted: {} };
  }

  const now = new Date().toISOString();
  const inserted: Record<string, number> = {};

  db.transaction(() => {
    // ─── admins ───
    db.exec(
      `INSERT INTO admins (id, username, password_hash, name, center_name, settings_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminJson.id,
        adminJson.username,
        adminJson.password,
        adminJson.name,
        adminJson.centerName ?? null,
        adminJson.settings ? JSON.stringify(adminJson.settings) : null,
        now,
        now,
      ],
    );
    inserted.admins = 1;

    // ─── teachers ───
    const teachers = teachersJson as unknown as SeedTeacher[];
    for (const t of teachers) {
      db.exec(
        `INSERT INTO teachers
          (id, role, name, gender, email, phone, invite_code, password_hash, region, flag,
           authorized_since, total_courses, centers_served, courses_this_year, is_onboarded,
           personal_note, authorizations_json, languages_json, preferred_regions_json,
           available_months_json, festival_months_json, teaching_history_json,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.role ?? 'teacher',
          t.name,
          t.gender ?? null,
          t.email ?? null,
          (t as { phone?: string }).phone ?? null,
          t.inviteCode ?? null,
          t.passwordHash,
          t.region ?? null,
          t.flag ?? null,
          t.authorizedSince ?? null,
          t.totalCourses ?? 0,
          t.centersServed ?? 0,
          t.coursesThisYear ?? 0,
          t.isOnboarded ? 1 : 0,
          t.personalNote ?? null,
          JSON.stringify(t.authorizations ?? []),
          JSON.stringify(t.languages ?? {}),
          JSON.stringify(t.preferredRegions ?? []),
          JSON.stringify(t.availableMonths ?? []),
          JSON.stringify(t.festivalMonths ?? []),
          JSON.stringify(t.teachingHistory ?? []),
          now,
          now,
        ],
      );
    }
    inserted.teachers = teachers.length;

    // ─── centres ───
    const centres = centersJson as unknown as SeedCentre[];
    for (const c of centres) {
      db.exec(
        `INSERT INTO centres (id, name, name_ne, city, region, country, flag, altitude, lat, lng, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.name,
          c.nameNe ?? null,
          c.city ?? null,
          c.region ?? null,
          c.country ?? null,
          c.flag ?? null,
          c.altitude ?? null,
          c.lat ?? null,
          c.lng ?? null,
          now,
          now,
        ],
      );
    }
    inserted.centres = centres.length;

    // ─── halls ───
    const halls = hallsJson as unknown as SeedHall[];
    for (const h of halls) {
      db.exec(
        `INSERT INTO halls (id, centre_id, name, teacher_slots, gender_required, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          h.id,
          h.centreId,
          h.name,
          h.teacherSlots ?? 1,
          h.genderRequired ?? null,
          h.notes ?? null,
          now,
          now,
        ],
      );
    }
    inserted.halls = halls.length;

    // ─── courses ───
    const courses = coursesJson as unknown as SeedCourse[];
    for (const c of courses) {
      db.exec(
        `INSERT INTO courses
          (id, type, center, center_id, city, country, flag, dates, start_date, end_date,
           languages_json, need_count, gender_required, status, distance_km, travel_hrs,
           altitude, students_json, arrival_date, arrival_time, coordinator_json, transport,
           notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.type,
          c.center,
          c.centerId ?? null,
          c.city ?? null,
          c.country ?? null,
          c.flag ?? null,
          c.dates ?? null,
          c.startDate,
          c.endDate,
          JSON.stringify(c.languages ?? []),
          c.needCount ?? 1,
          c.genderRequired ?? null,
          c.status ?? null,
          c.distanceKm ?? null,
          c.travelHrs ?? null,
          c.altitude ?? null,
          c.students ? JSON.stringify(c.students) : null,
          c.arrivalDate ?? null,
          c.arrivalTime ?? null,
          c.coordinator ? JSON.stringify(c.coordinator) : null,
          c.transport ?? null,
          c.notes ?? null,
          now,
          now,
        ],
      );
    }
    inserted.courses = courses.length;

    // ─── service_areas ───
    for (const a of SERVICE_AREAS) {
      db.exec(
        `INSERT INTO service_areas (id, label, label_ne, emoji, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.label, a.nepali, a.emoji, a.color, now, now],
      );
    }
    inserted.service_areas = SERVICE_AREAS.length;

    // ─── applications ───
    const applications = applicationsJson as unknown as SeedApplication[];
    for (const a of applications) {
      db.exec(
        `INSERT INTO applications
          (id, course_id, teacher_id, status, applied_date, source, rejection_reason,
           queue_position, withdrawal_note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.courseId,
          a.teacherId,
          a.status,
          a.appliedDate ?? null,
          a.source ?? null,
          a.rejectionReason ?? null,
          a.queuePosition ?? null,
          a.withdrawalNote ?? null,
          now,
          now,
        ],
      );
    }
    inserted.applications = applications.length;

    // ─── server_courses ───
    const serverCourses = serverCoursesJson as unknown as SeedServerCourse[];
    for (const c of serverCourses) {
      db.exec(
        `INSERT INTO server_courses
          (id, center, center_id, city, type, dates, start_date, end_date, days,
           m_servers, f_servers, filled, total, areas_json, arrive_by, altitude, country, flag,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.center,
          c.centerId ?? null,
          c.city ?? null,
          c.type ?? null,
          c.dates ?? null,
          c.startDate ?? null,
          c.endDate ?? null,
          c.days ?? null,
          c.mServers ?? 0,
          c.fServers ?? 0,
          c.filled ?? 0,
          c.total ?? 0,
          JSON.stringify(c.areas ?? []),
          c.arriveBy ?? null,
          c.altitude ?? null,
          c.country ?? null,
          c.flag ?? null,
          now,
          now,
        ],
      );
    }
    inserted.server_courses = serverCourses.length;

    // ─── server_applications ───
    const serverApplications = serverApplicationsJson as unknown as SeedServerApplication[];
    for (const a of serverApplications) {
      db.exec(
        `INSERT INTO server_applications
          (id, course_id, server_id, center, type, dates, status, areas_json, partial, days,
           applied, coordinator, coord_phone, arrive_by, reason, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.courseId,
          a.serverId ?? null,
          a.center ?? null,
          a.type ?? null,
          a.dates ?? null,
          a.status,
          JSON.stringify(a.areas ?? []),
          a.partial ? 1 : 0,
          a.days ?? null,
          a.applied ?? null,
          a.coordinator ?? null,
          a.coordPhone ?? null,
          a.arriveBy ?? null,
          a.reason ?? null,
          now,
          now,
        ],
      );
    }
    inserted.server_applications = serverApplications.length;

    // ─── settings: mark seeded ───
    db.exec('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)', [
      SEED_KEY,
      SEED_VALUE,
      now,
    ]);
  });

  logger.info('[db] seed complete', inserted);
  return { inserted };
}

/**
 * Test / debug helper — drops all data (NOT schema) and resets the seeded
 * flag so the next `seedDatabase()` re-runs.
 */
export function resetSeedFlag(db: DB): void {
  db.exec('DELETE FROM settings WHERE key = ?', [SEED_KEY]);
}
