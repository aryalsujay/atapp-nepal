/**
 * Applications repo — teacher applications to courses.
 *
 * Domain type mirrors the existing `Application` interface used by
 * `applicationsStore`. Lookups by teacher are the hot path (drives the home
 * upcoming list + the applications screen).
 */

import type { DB } from '../index';
import type { ApplicationRow } from '../types';

/**
 * Mirrors `Status` from `@/types/common`. The repo stores status as TEXT, so
 * extending this union is a code-only change (no migration needed).
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawal_requested';

export interface ApplicationDomain {
  id: number;
  courseId: number;
  teacherId: string;
  status: ApplicationStatus;
  appliedDate: string | null;
  source: 'applied' | 'assigned' | null;
  rejectionReason: string | null;
  queuePosition: number | null;
  withdrawalNote: string | null;
}

function rowToDomain(r: ApplicationRow): ApplicationDomain {
  return {
    id: r.id,
    courseId: r.course_id,
    teacherId: r.teacher_id,
    status: r.status as ApplicationStatus,
    appliedDate: r.applied_date,
    source: (r.source as 'applied' | 'assigned' | null) ?? null,
    rejectionReason: r.rejection_reason,
    queuePosition: r.queue_position,
    withdrawalNote: r.withdrawal_note,
  };
}

export function list(db: DB): ApplicationDomain[] {
  return db.query<ApplicationRow>('SELECT * FROM applications ORDER BY id ASC').map(rowToDomain);
}

export function listByTeacher(db: DB, teacherId: string): ApplicationDomain[] {
  return db
    .query<ApplicationRow>('SELECT * FROM applications WHERE teacher_id = ? ORDER BY id DESC', [
      teacherId,
    ])
    .map(rowToDomain);
}

export function listByCourse(db: DB, courseId: number): ApplicationDomain[] {
  return db
    .query<ApplicationRow>('SELECT * FROM applications WHERE course_id = ? ORDER BY id ASC', [
      courseId,
    ])
    .map(rowToDomain);
}

export function findById(db: DB, id: number): ApplicationDomain | null {
  const row = db.queryOne<ApplicationRow>('SELECT * FROM applications WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function countApprovedForCourse(db: DB, courseId: number): number {
  const row = db.queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM applications
     WHERE course_id = ? AND status IN ('approved','assigned')`,
    [courseId],
  );
  return row?.n ?? 0;
}

/**
 * Insert when id is undefined (auto-increment), or upsert by id. `appliedDate`
 * defaults to today if not provided on insert.
 */
export function upsert(
  db: DB,
  app: Omit<ApplicationDomain, 'id'> & { id?: number },
): ApplicationDomain {
  const now = new Date().toISOString();
  const appliedDate = app.appliedDate ?? now.slice(0, 10);

  if (app.id == null) {
    db.exec(
      `INSERT INTO applications (
         course_id, teacher_id, status, applied_date, source,
         rejection_reason, queue_position, withdrawal_note,
         created_at, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        app.courseId,
        app.teacherId,
        app.status,
        appliedDate,
        app.source,
        app.rejectionReason,
        app.queuePosition,
        app.withdrawalNote,
        now,
        now,
      ],
    );
    // SQLite reports the last inserted rowid via `last_insert_rowid()`.
    const row = db.queryOne<{ id: number }>('SELECT last_insert_rowid() AS id');
    const id = row?.id ?? 0;
    return { ...app, id, appliedDate };
  }

  db.exec(
    `INSERT INTO applications (
       id, course_id, teacher_id, status, applied_date, source,
       rejection_reason, queue_position, withdrawal_note,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       course_id         = excluded.course_id,
       teacher_id        = excluded.teacher_id,
       status            = excluded.status,
       applied_date      = excluded.applied_date,
       source            = excluded.source,
       rejection_reason  = excluded.rejection_reason,
       queue_position    = excluded.queue_position,
       withdrawal_note   = excluded.withdrawal_note,
       updated_at        = excluded.updated_at`,
    [
      app.id,
      app.courseId,
      app.teacherId,
      app.status,
      appliedDate,
      app.source,
      app.rejectionReason,
      app.queuePosition,
      app.withdrawalNote,
      now,
      now,
    ],
  );
  return { ...app, id: app.id, appliedDate };
}

export function upsertMany(
  db: DB,
  apps: (Omit<ApplicationDomain, 'id'> & { id?: number })[],
): void {
  db.transaction(() => {
    for (const a of apps) upsert(db, a);
  });
}

export function updateStatus(
  db: DB,
  id: number,
  status: ApplicationStatus,
  rejectionReason?: string,
): void {
  db.exec(
    `UPDATE applications
     SET status = ?, rejection_reason = ?, updated_at = ?
     WHERE id = ?`,
    [status, rejectionReason ?? null, new Date().toISOString(), id],
  );
}

export function deleteById(db: DB, id: number): void {
  db.exec('DELETE FROM applications WHERE id = ?', [id]);
}
