/**
 * Server-courses repo — opportunities for dhamma servers (separate from
 * teacher courses; different staffing model).
 */

import type { DB } from '../index';
import type { ServerCourseRow } from '../types';

export interface ServerCourseDomain {
  id: number;
  center: string;
  centerId: string | null;
  city: string | null;
  type: string | null;
  dates: string | null;
  startDate: string | null;
  endDate: string | null;
  days: number | null;
  mServers: number;
  fServers: number;
  filled: number;
  total: number;
  areas: string[];
  arriveBy: string | null;
  altitude: number | null;
  country: string | null;
  flag: string | null;
}

function rowToDomain(r: ServerCourseRow): ServerCourseDomain {
  let areas: string[] = [];
  if (r.areas_json) {
    try {
      areas = JSON.parse(r.areas_json) as string[];
    } catch {
      areas = [];
    }
  }
  return {
    id: r.id,
    center: r.center,
    centerId: r.center_id,
    city: r.city,
    type: r.type,
    dates: r.dates,
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.days,
    mServers: r.m_servers,
    fServers: r.f_servers,
    filled: r.filled,
    total: r.total,
    areas,
    arriveBy: r.arrive_by,
    altitude: r.altitude,
    country: r.country,
    flag: r.flag,
  };
}

export function list(db: DB): ServerCourseDomain[] {
  return db
    .query<ServerCourseRow>('SELECT * FROM server_courses ORDER BY start_date ASC')
    .map(rowToDomain);
}

export function findById(db: DB, id: number): ServerCourseDomain | null {
  const row = db.queryOne<ServerCourseRow>('SELECT * FROM server_courses WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, c: ServerCourseDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO server_courses (
       id, center, center_id, city, type, dates, start_date, end_date, days,
       m_servers, f_servers, filled, total, areas_json, arrive_by, altitude,
       country, flag, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       center       = excluded.center,
       center_id    = excluded.center_id,
       city         = excluded.city,
       type         = excluded.type,
       dates        = excluded.dates,
       start_date   = excluded.start_date,
       end_date     = excluded.end_date,
       days         = excluded.days,
       m_servers    = excluded.m_servers,
       f_servers    = excluded.f_servers,
       filled       = excluded.filled,
       total        = excluded.total,
       areas_json   = excluded.areas_json,
       arrive_by    = excluded.arrive_by,
       altitude     = excluded.altitude,
       country      = excluded.country,
       flag         = excluded.flag,
       updated_at   = excluded.updated_at`,
    [
      c.id,
      c.center,
      c.centerId,
      c.city,
      c.type,
      c.dates,
      c.startDate,
      c.endDate,
      c.days,
      c.mServers,
      c.fServers,
      c.filled,
      c.total,
      JSON.stringify(c.areas),
      c.arriveBy,
      c.altitude,
      c.country,
      c.flag,
      now,
      now,
    ],
  );
}

export function upsertMany(db: DB, rows: ServerCourseDomain[]): void {
  db.transaction(() => {
    for (const c of rows) upsert(db, c);
  });
}
