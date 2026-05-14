/**
 * Settings repo — flat key/value table for app-level state that isn't tied
 * to a row in another table. Examples: `seeded`, `last_sync_at`, future
 * admin-tunable knobs.
 *
 * Values are stored as TEXT; JSON serialization is the caller's job (use
 * `getJson`/`setJson` for objects).
 */

import type { DB } from '../index';
import type { SettingRow } from '../types';

export function get(db: DB, key: string): string | null {
  const row = db.queryOne<SettingRow>('SELECT * FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export function set(db: DB, key: string, value: string | null): void {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, now],
  );
}

export function remove(db: DB, key: string): void {
  db.exec('DELETE FROM settings WHERE key = ?', [key]);
}

export function getJson<T>(db: DB, key: string): T | null {
  const raw = get(db, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(db: DB, key: string, value: unknown): void {
  set(db, key, JSON.stringify(value));
}
