/**
 * Courses repo. Source of truth for the synced dhamma.org schedule. The
 * `coursesStore.syncCourses()` writes through `upsertMany` after each
 * scrape; reads go through `list` / `findById`.
 */

import type { DB } from '../index';
import type { CourseRow } from '../types';
import type { Course } from '@/types';

function jsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToDomain(r: CourseRow): Course {
  return {
    id: r.id,
    type: r.type as Course['type'],
    center: r.center,
    centerId: r.center_id ?? '',
    city: r.city ?? '',
    country: r.country ?? '',
    flag: r.flag ?? undefined,
    dates: r.dates ?? '',
    startDate: r.start_date,
    endDate: r.end_date,
    languages: jsonParse<string[]>(r.languages_json, []),
    needCount: r.need_count,
    genderRequired: (r.gender_required as Course['genderRequired']) ?? 'Any',
    distanceKm: r.distance_km ?? 0,
    travelHrs: r.travel_hrs ?? 0,
    altitude: r.altitude ?? undefined,
    students: jsonParse<Course['students']>(r.students_json, {
      expected: 0,
      male: 0,
      female: 0,
    }),
    arrivalDate: r.arrival_date ?? '',
    arrivalTime: r.arrival_time ?? '',
    coordinator: jsonParse<Course['coordinator']>(r.coordinator_json, {
      name: '',
      role: '',
      phone: '',
    }),
    coTeacher: r.coteacher_json
      ? jsonParse<NonNullable<Course['coTeacher']>>(r.coteacher_json, {
          name: '',
          gender: 'M',
          languages: [],
        })
      : undefined,
    openSlots: r.open_slots_json
      ? jsonParse<NonNullable<Course['openSlots']>>(r.open_slots_json, [])
      : undefined,
    transport: r.transport ?? '',
    status: r.status ?? undefined,
    notes: r.notes ?? undefined,
  };
}

export function list(db: DB): Course[] {
  const rows = db.query<CourseRow>('SELECT * FROM courses ORDER BY start_date ASC');
  return rows.map(rowToDomain);
}

export function findById(db: DB, id: number): Course | null {
  const row = db.queryOne<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, course: Course): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO courses (
       id, type, center, center_id, city, country, flag,
       dates, start_date, end_date, languages_json, need_count,
       gender_required, status, distance_km, travel_hrs, altitude,
       students_json, arrival_date, arrival_time, coordinator_json,
       coteacher_json, open_slots_json, transport, notes, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       type             = excluded.type,
       center           = excluded.center,
       center_id        = excluded.center_id,
       city             = excluded.city,
       country          = excluded.country,
       flag             = excluded.flag,
       dates            = excluded.dates,
       start_date       = excluded.start_date,
       end_date         = excluded.end_date,
       languages_json   = excluded.languages_json,
       need_count       = excluded.need_count,
       gender_required  = excluded.gender_required,
       status           = excluded.status,
       distance_km      = excluded.distance_km,
       travel_hrs       = excluded.travel_hrs,
       altitude         = excluded.altitude,
       students_json    = excluded.students_json,
       arrival_date     = excluded.arrival_date,
       arrival_time     = excluded.arrival_time,
       coordinator_json = excluded.coordinator_json,
       coteacher_json   = excluded.coteacher_json,
       open_slots_json  = excluded.open_slots_json,
       transport        = excluded.transport,
       notes            = excluded.notes,
       updated_at       = excluded.updated_at`,
    [
      course.id,
      course.type,
      course.center,
      course.centerId || null,
      course.city || null,
      course.country || null,
      course.flag ?? null,
      course.dates || null,
      course.startDate,
      course.endDate,
      JSON.stringify(course.languages),
      course.needCount,
      course.genderRequired,
      course.status ?? null,
      course.distanceKm ?? null,
      course.travelHrs ?? null,
      course.altitude ?? null,
      JSON.stringify(course.students),
      course.arrivalDate || null,
      course.arrivalTime || null,
      JSON.stringify(course.coordinator),
      course.coTeacher ? JSON.stringify(course.coTeacher) : null,
      course.openSlots ? JSON.stringify(course.openSlots) : null,
      course.transport || null,
      course.notes ?? null,
      now,
      now,
    ],
  );
}

export function upsertMany(db: DB, courses: Course[]): void {
  db.transaction(() => {
    for (const c of courses) upsert(db, c);
  });
}

/**
 * Sync-time upsert — writes ONLY the fields derived from the dhamma.org
 * scrape and leaves admin-set fields untouched on existing rows. New rows
 * still insert all fields the scrape ships (no admin data to preserve).
 *
 * Admin-set fields preserved across sync:
 *   - coteacher_json
 *   - open_slots_json (admin-set per-slot gender breakdown)
 *   - coordinator_json (admin replaces "See dhamma.org" placeholder with
 *     real coordinator name + phone)
 *   - transport prose
 *   - notes
 *   - students breakdown (admin sets male/female once registrations close)
 *   - arrival_date / arrival_time (admin-controlled per course)
 *   - distance_km / travel_hrs (admin overrides per teacher's home centre)
 *
 * Scrape-derived fields that DO update on every sync:
 *   - type, center, center_id, city, country, flag
 *   - dates, start_date, end_date
 *   - languages_json
 *   - need_count, gender_required, status
 *   - altitude (scraped from centre meta, not admin)
 */
export function syncUpsert(db: DB, course: Course): void {
  const now = new Date().toISOString();
  // Insert clause shipped with sane defaults for first-time inserts; the
  // ON CONFLICT clause is intentionally narrow.
  db.exec(
    `INSERT INTO courses (
       id, type, center, center_id, city, country, flag,
       dates, start_date, end_date, languages_json, need_count,
       gender_required, status, distance_km, travel_hrs, altitude,
       students_json, arrival_date, arrival_time, coordinator_json,
       coteacher_json, open_slots_json, transport, notes, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       type             = excluded.type,
       center           = excluded.center,
       center_id        = excluded.center_id,
       city             = excluded.city,
       country          = excluded.country,
       flag             = excluded.flag,
       dates            = excluded.dates,
       start_date       = excluded.start_date,
       end_date         = excluded.end_date,
       languages_json   = excluded.languages_json,
       need_count       = excluded.need_count,
       gender_required  = excluded.gender_required,
       status           = excluded.status,
       altitude         = excluded.altitude,
       updated_at       = excluded.updated_at`,
    [
      course.id,
      course.type,
      course.center,
      course.centerId || null,
      course.city || null,
      course.country || null,
      course.flag ?? null,
      course.dates || null,
      course.startDate,
      course.endDate,
      JSON.stringify(course.languages),
      course.needCount,
      course.genderRequired,
      course.status ?? null,
      course.distanceKm ?? null,
      course.travelHrs ?? null,
      course.altitude ?? null,
      JSON.stringify(course.students),
      course.arrivalDate || null,
      course.arrivalTime || null,
      JSON.stringify(course.coordinator),
      course.coTeacher ? JSON.stringify(course.coTeacher) : null,
      course.openSlots ? JSON.stringify(course.openSlots) : null,
      course.transport || null,
      course.notes ?? null,
      now,
      now,
    ],
  );
}

export function syncUpsertMany(db: DB, courses: Course[]): void {
  db.transaction(() => {
    for (const c of courses) syncUpsert(db, c);
  });
}

export function deleteById(db: DB, id: number): void {
  db.exec('DELETE FROM courses WHERE id = ?', [id]);
}

export function count(db: DB): number {
  const row = db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM courses');
  return row?.n ?? 0;
}

/** Wipe the table — used by sync when it wants to replace instead of merge. */
export function clear(db: DB): void {
  db.exec('DELETE FROM courses');
}
