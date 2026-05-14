/**
 * Service areas repo — kitchen / dining / dhamma / etc. Reference data for
 * the server flow.
 */

import type { DB } from '../index';
import type { ServiceAreaRow } from '../types';

export interface ServiceAreaDomain {
  id: string;
  label: string;
  labelNe: string | null;
  emoji: string | null;
  color: string | null;
}

function rowToDomain(r: ServiceAreaRow): ServiceAreaDomain {
  return {
    id: r.id,
    label: r.label,
    labelNe: r.label_ne,
    emoji: r.emoji,
    color: r.color,
  };
}

export function list(db: DB): ServiceAreaDomain[] {
  return db.query<ServiceAreaRow>('SELECT * FROM service_areas ORDER BY label').map(rowToDomain);
}

export function findById(db: DB, id: string): ServiceAreaDomain | null {
  const row = db.queryOne<ServiceAreaRow>('SELECT * FROM service_areas WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, a: ServiceAreaDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO service_areas (id, label, label_ne, emoji, color, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       label      = excluded.label,
       label_ne   = excluded.label_ne,
       emoji      = excluded.emoji,
       color      = excluded.color,
       updated_at = excluded.updated_at`,
    [a.id, a.label, a.labelNe, a.emoji, a.color, now, now],
  );
}

export function upsertMany(db: DB, rows: ServiceAreaDomain[]): void {
  db.transaction(() => {
    for (const a of rows) upsert(db, a);
  });
}
