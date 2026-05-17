/**
 * Teachers repo. The `teachers` table holds both `role='teacher'` and
 * `role='server'` records — the schema is unified because both share the
 * same identity fields (name, gender, email, password, region, history).
 *
 * Domain types use camelCase + parsed JSON; row types use snake_case + raw
 * JSON strings. Conversion happens here so callers never touch raw rows.
 */

import type { DB } from '../index';
import type { TeacherRow } from '../types';

export type Role = 'teacher' | 'server';

export interface TeacherDomain {
  id: string;
  role: Role;
  name: string;
  gender: 'M' | 'F' | null;
  email: string | null;
  phone: string | null;
  inviteCode: string | null;
  passwordHash: string;
  region: string | null;
  flag: string | null;
  authorizedSince: number | null;
  totalCourses: number;
  centersServed: number;
  coursesThisYear: number;
  isOnboarded: boolean;
  personalNote: string | null;
  /** Epoch ms of the last time `personalNote` was edited (null if never). */
  personalNoteUpdatedAt: number | null;
  authorizations: string[];
  languages: Record<string, string>;
  preferredRegions: string[];
  availableMonths: number[];
  festivalMonths: number[];
  teachingHistory: unknown[];
  homeCity: string | null;
  homeLat: number | null;
  homeLng: number | null;
}

function jsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToDomain(r: TeacherRow): TeacherDomain {
  return {
    id: r.id,
    role: r.role,
    name: r.name,
    gender: r.gender,
    email: r.email,
    phone: r.phone ?? null,
    inviteCode: r.invite_code,
    passwordHash: r.password_hash,
    region: r.region,
    flag: r.flag,
    authorizedSince: r.authorized_since,
    totalCourses: r.total_courses,
    centersServed: r.centers_served,
    coursesThisYear: r.courses_this_year,
    isOnboarded: r.is_onboarded === 1,
    personalNote: r.personal_note,
    personalNoteUpdatedAt: r.personal_note_updated_at ?? null,
    authorizations: jsonParse<string[]>(r.authorizations_json, []),
    languages: jsonParse<Record<string, string>>(r.languages_json, {}),
    preferredRegions: jsonParse<string[]>(r.preferred_regions_json, []),
    availableMonths: jsonParse<number[]>(r.available_months_json, []),
    festivalMonths: jsonParse<number[]>(r.festival_months_json, []),
    teachingHistory: jsonParse<unknown[]>(r.teaching_history_json, []),
    homeCity: r.home_city ?? null,
    homeLat: r.home_lat ?? null,
    homeLng: r.home_lng ?? null,
  };
}

export function list(db: DB, role?: Role): TeacherDomain[] {
  const rows = role
    ? db.query<TeacherRow>('SELECT * FROM teachers WHERE role = ? ORDER BY name', [role])
    : db.query<TeacherRow>('SELECT * FROM teachers ORDER BY name');
  return rows.map(rowToDomain);
}

export function findById(db: DB, id: string): TeacherDomain | null {
  const row = db.queryOne<TeacherRow>('SELECT * FROM teachers WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function findByIdentifier(db: DB, identifier: string): TeacherDomain | null {
  // Three indexed lookups instead of an OR-WHERE so the in-memory test shim
  // can run them. SQLite handles either form fine at native runtime.
  const byId = db.queryOne<TeacherRow>('SELECT * FROM teachers WHERE id = ?', [identifier]);
  if (byId) return rowToDomain(byId);

  const byEmail = db.queryOne<TeacherRow>(
    'SELECT * FROM teachers WHERE LOWER(email) = LOWER(?) LIMIT 1',
    [identifier],
  );
  if (byEmail) return rowToDomain(byEmail);

  const byCode = db.queryOne<TeacherRow>('SELECT * FROM teachers WHERE invite_code = ? LIMIT 1', [
    identifier,
  ]);
  if (byCode) return rowToDomain(byCode);

  return null;
}

export function upsert(db: DB, teacher: Partial<TeacherDomain> & { id: string }): void {
  const now = new Date().toISOString();
  const existing = findById(db, teacher.id);

  // Stamp `personalNoteUpdatedAt` when the note content actually changes —
  // not on every upsert. Lets callers ignore the field; we'll derive it.
  const incomingNote = teacher.personalNote ?? existing?.personalNote ?? null;
  const noteChanged =
    teacher.personalNote !== undefined && teacher.personalNote !== existing?.personalNote;
  const personalNoteUpdatedAt =
    teacher.personalNoteUpdatedAt !== undefined
      ? teacher.personalNoteUpdatedAt
      : noteChanged
        ? Date.now()
        : (existing?.personalNoteUpdatedAt ?? null);

  const merged: TeacherDomain = {
    id: teacher.id,
    role: teacher.role ?? existing?.role ?? 'teacher',
    name: teacher.name ?? existing?.name ?? '',
    gender: teacher.gender ?? existing?.gender ?? null,
    email: teacher.email ?? existing?.email ?? null,
    phone: teacher.phone ?? existing?.phone ?? null,
    inviteCode: teacher.inviteCode ?? existing?.inviteCode ?? null,
    passwordHash: teacher.passwordHash ?? existing?.passwordHash ?? '',
    region: teacher.region ?? existing?.region ?? null,
    flag: teacher.flag ?? existing?.flag ?? null,
    authorizedSince: teacher.authorizedSince ?? existing?.authorizedSince ?? null,
    totalCourses: teacher.totalCourses ?? existing?.totalCourses ?? 0,
    centersServed: teacher.centersServed ?? existing?.centersServed ?? 0,
    coursesThisYear: teacher.coursesThisYear ?? existing?.coursesThisYear ?? 0,
    isOnboarded: teacher.isOnboarded ?? existing?.isOnboarded ?? false,
    personalNote: incomingNote,
    personalNoteUpdatedAt,
    authorizations: teacher.authorizations ?? existing?.authorizations ?? [],
    languages: teacher.languages ?? existing?.languages ?? {},
    preferredRegions: teacher.preferredRegions ?? existing?.preferredRegions ?? [],
    availableMonths: teacher.availableMonths ?? existing?.availableMonths ?? [],
    festivalMonths: teacher.festivalMonths ?? existing?.festivalMonths ?? [],
    teachingHistory: teacher.teachingHistory ?? existing?.teachingHistory ?? [],
    homeCity: teacher.homeCity ?? existing?.homeCity ?? null,
    homeLat: teacher.homeLat ?? existing?.homeLat ?? null,
    homeLng: teacher.homeLng ?? existing?.homeLng ?? null,
  };

  db.exec(
    `INSERT INTO teachers (
       id, role, name, gender, email, phone, invite_code, password_hash,
       region, flag, authorized_since, total_courses, centers_served,
       courses_this_year, is_onboarded, personal_note, personal_note_updated_at,
       authorizations_json, languages_json, preferred_regions_json,
       available_months_json, festival_months_json, teaching_history_json,
       home_city, home_lat, home_lng,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       role                       = excluded.role,
       name                       = excluded.name,
       gender                     = excluded.gender,
       email                      = excluded.email,
       phone                      = excluded.phone,
       invite_code                = excluded.invite_code,
       password_hash              = excluded.password_hash,
       region                     = excluded.region,
       flag                       = excluded.flag,
       authorized_since           = excluded.authorized_since,
       total_courses              = excluded.total_courses,
       centers_served             = excluded.centers_served,
       courses_this_year          = excluded.courses_this_year,
       is_onboarded               = excluded.is_onboarded,
       personal_note              = excluded.personal_note,
       personal_note_updated_at   = excluded.personal_note_updated_at,
       authorizations_json        = excluded.authorizations_json,
       languages_json             = excluded.languages_json,
       preferred_regions_json     = excluded.preferred_regions_json,
       available_months_json      = excluded.available_months_json,
       festival_months_json       = excluded.festival_months_json,
       teaching_history_json      = excluded.teaching_history_json,
       home_city                  = excluded.home_city,
       home_lat                   = excluded.home_lat,
       home_lng                   = excluded.home_lng,
       updated_at                 = excluded.updated_at`,
    [
      merged.id,
      merged.role,
      merged.name,
      merged.gender,
      merged.email,
      merged.phone,
      merged.inviteCode,
      merged.passwordHash,
      merged.region,
      merged.flag,
      merged.authorizedSince,
      merged.totalCourses,
      merged.centersServed,
      merged.coursesThisYear,
      merged.isOnboarded ? 1 : 0,
      merged.personalNote,
      merged.personalNoteUpdatedAt,
      JSON.stringify(merged.authorizations),
      JSON.stringify(merged.languages),
      JSON.stringify(merged.preferredRegions),
      JSON.stringify(merged.availableMonths),
      JSON.stringify(merged.festivalMonths),
      JSON.stringify(merged.teachingHistory),
      merged.homeCity,
      merged.homeLat,
      merged.homeLng,
      // created_at only takes effect on INSERT (ON CONFLICT … DO UPDATE skips it).
      now,
      now,
    ],
  );
}

export function upsertMany(db: DB, teachers: (Partial<TeacherDomain> & { id: string })[]): void {
  db.transaction(() => {
    for (const t of teachers) upsert(db, t);
  });
}

export function deleteById(db: DB, id: string): void {
  db.exec('DELETE FROM teachers WHERE id = ?', [id]);
}

export function count(db: DB, role?: Role): number {
  const row = role
    ? db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM teachers WHERE role = ?', [role])
    : db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM teachers');
  return row?.n ?? 0;
}
