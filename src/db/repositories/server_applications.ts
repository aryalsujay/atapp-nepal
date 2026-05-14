/**
 * Server-applications repo — analogous to teacher applications but for
 * server-courses + server users.
 */

import type { DB } from '../index';
import type { ServerApplicationRow } from '../types';

export interface ServerApplicationDomain {
  id: number;
  courseId: number;
  serverId: string | null;
  center: string | null;
  type: string | null;
  dates: string | null;
  status: string;
  areas: string[];
  partial: boolean;
  days: string | null;
  applied: string | null;
  coordinator: string | null;
  coordPhone: string | null;
  arriveBy: string | null;
  reason: string | null;
}

function rowToDomain(r: ServerApplicationRow): ServerApplicationDomain {
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
    courseId: r.course_id,
    serverId: r.server_id,
    center: r.center,
    type: r.type,
    dates: r.dates,
    status: r.status,
    areas,
    partial: r.partial === 1,
    days: r.days,
    applied: r.applied,
    coordinator: r.coordinator,
    coordPhone: r.coord_phone,
    arriveBy: r.arrive_by,
    reason: r.reason,
  };
}

export function list(db: DB): ServerApplicationDomain[] {
  return db
    .query<ServerApplicationRow>('SELECT * FROM server_applications ORDER BY id DESC')
    .map(rowToDomain);
}

export function listByServer(db: DB, serverId: string): ServerApplicationDomain[] {
  return db
    .query<ServerApplicationRow>(
      'SELECT * FROM server_applications WHERE server_id = ? ORDER BY id DESC',
      [serverId],
    )
    .map(rowToDomain);
}

export function findById(db: DB, id: number): ServerApplicationDomain | null {
  const row = db.queryOne<ServerApplicationRow>('SELECT * FROM server_applications WHERE id = ?', [
    id,
  ]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, a: ServerApplicationDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO server_applications (
       id, course_id, server_id, center, type, dates, status, areas_json,
       partial, days, applied, coordinator, coord_phone, arrive_by, reason,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       course_id    = excluded.course_id,
       server_id    = excluded.server_id,
       center       = excluded.center,
       type         = excluded.type,
       dates        = excluded.dates,
       status       = excluded.status,
       areas_json   = excluded.areas_json,
       partial      = excluded.partial,
       days         = excluded.days,
       applied      = excluded.applied,
       coordinator  = excluded.coordinator,
       coord_phone  = excluded.coord_phone,
       arrive_by    = excluded.arrive_by,
       reason       = excluded.reason,
       updated_at   = excluded.updated_at`,
    [
      a.id,
      a.courseId,
      a.serverId,
      a.center,
      a.type,
      a.dates,
      a.status,
      JSON.stringify(a.areas),
      a.partial ? 1 : 0,
      a.days,
      a.applied,
      a.coordinator,
      a.coordPhone,
      a.arriveBy,
      a.reason,
      now,
      now,
    ],
  );
}

export function upsertMany(db: DB, rows: ServerApplicationDomain[]): void {
  db.transaction(() => {
    for (const a of rows) upsert(db, a);
  });
}
