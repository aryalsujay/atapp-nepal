/**
 * Centres repo — reference data (one row per dhamma centre).
 */

import type { DB } from '../index';
import type { CentreRow } from '../types';

export interface CentreDomain {
  id: string;
  name: string;
  nameNe: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  flag: string | null;
  altitude: number | null;
  lat: number | null;
  lng: number | null;
}

function rowToDomain(r: CentreRow): CentreDomain {
  return {
    id: r.id,
    name: r.name,
    nameNe: r.name_ne,
    city: r.city,
    region: r.region,
    country: r.country,
    flag: r.flag,
    altitude: r.altitude,
    lat: r.lat,
    lng: r.lng,
  };
}

export function list(db: DB): CentreDomain[] {
  return db.query<CentreRow>('SELECT * FROM centres ORDER BY name').map(rowToDomain);
}

export function findById(db: DB, id: string): CentreDomain | null {
  const row = db.queryOne<CentreRow>('SELECT * FROM centres WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, c: CentreDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO centres (
       id, name, name_ne, city, region, country, flag, altitude, lat, lng,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       name       = excluded.name,
       name_ne    = excluded.name_ne,
       city       = excluded.city,
       region     = excluded.region,
       country    = excluded.country,
       flag       = excluded.flag,
       altitude   = excluded.altitude,
       lat        = excluded.lat,
       lng        = excluded.lng,
       updated_at = excluded.updated_at`,
    [
      c.id,
      c.name,
      c.nameNe,
      c.city,
      c.region,
      c.country,
      c.flag,
      c.altitude,
      c.lat,
      c.lng,
      now,
      now,
    ],
  );
}

export function upsertMany(db: DB, rows: CentreDomain[]): void {
  db.transaction(() => {
    for (const c of rows) upsert(db, c);
  });
}
