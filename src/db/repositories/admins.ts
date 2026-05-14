/**
 * Admins repo — single-row-ish in practice (one admin per centre for the
 * pilot). Used by the login flow's admin path.
 */

import type { DB } from '../index';
import type { AdminRow } from '../types';

export interface AdminDomain {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  centerName: string | null;
  settings: Record<string, unknown>;
}

function rowToDomain(r: AdminRow): AdminDomain {
  let settings: Record<string, unknown> = {};
  if (r.settings_json) {
    try {
      settings = JSON.parse(r.settings_json) as Record<string, unknown>;
    } catch {
      // Leave as empty object.
    }
  }
  return {
    id: r.id,
    username: r.username,
    passwordHash: r.password_hash,
    name: r.name,
    centerName: r.center_name,
    settings,
  };
}

export function list(db: DB): AdminDomain[] {
  return db.query<AdminRow>('SELECT * FROM admins ORDER BY username').map(rowToDomain);
}

export function findById(db: DB, id: string): AdminDomain | null {
  const row = db.queryOne<AdminRow>('SELECT * FROM admins WHERE id = ?', [id]);
  return row ? rowToDomain(row) : null;
}

export function findByUsername(db: DB, username: string): AdminDomain | null {
  const row = db.queryOne<AdminRow>(
    'SELECT * FROM admins WHERE LOWER(username) = LOWER(?) LIMIT 1',
    [username],
  );
  return row ? rowToDomain(row) : null;
}

export function upsert(db: DB, admin: AdminDomain): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO admins (
       id, username, password_hash, name, center_name, settings_json,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       username       = excluded.username,
       password_hash  = excluded.password_hash,
       name           = excluded.name,
       center_name    = excluded.center_name,
       settings_json  = excluded.settings_json,
       updated_at     = excluded.updated_at`,
    [
      admin.id,
      admin.username,
      admin.passwordHash,
      admin.name,
      admin.centerName,
      JSON.stringify(admin.settings ?? {}),
      now,
      now,
    ],
  );
}
