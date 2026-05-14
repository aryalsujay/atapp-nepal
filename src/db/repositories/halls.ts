/**
 * Halls repo — meditation halls within each centre (for capacity planning).
 */

import type { DB } from '../index';
import type { HallRow } from '../types';

export interface HallDomain {
  id: string;
  centreId: string;
  name: string;
  teacherSlots: number;
  genderRequired: string | null;
  notes: string | null;
}

function rowToDomain(r: HallRow): HallDomain {
  return {
    id: r.id,
    centreId: r.centre_id,
    name: r.name,
    teacherSlots: r.teacher_slots,
    genderRequired: r.gender_required,
    notes: r.notes,
  };
}

export function list(db: DB): HallDomain[] {
  return db.query<HallRow>('SELECT * FROM halls ORDER BY centre_id, name').map(rowToDomain);
}

export function listByCentre(db: DB, centreId: string): HallDomain[] {
  return db
    .query<HallRow>('SELECT * FROM halls WHERE centre_id = ? ORDER BY name', [centreId])
    .map(rowToDomain);
}

export function findById(db: DB, id: string): HallDomain | null {
  const row = db.queryOne<HallRow>('SELECT * FROM halls WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, h: HallDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO halls (
       id, centre_id, name, teacher_slots, gender_required, notes,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       centre_id        = excluded.centre_id,
       name             = excluded.name,
       teacher_slots    = excluded.teacher_slots,
       gender_required  = excluded.gender_required,
       notes            = excluded.notes,
       updated_at       = excluded.updated_at`,
    [h.id, h.centreId, h.name, h.teacherSlots, h.genderRequired, h.notes, now, now],
  );
}

export function upsertMany(db: DB, rows: HallDomain[]): void {
  db.transaction(() => {
    for (const h of rows) upsert(db, h);
  });
}
