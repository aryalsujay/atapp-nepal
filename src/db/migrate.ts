/**
 * Migration runner.
 *
 * On every app boot we:
 *   1. Ensure the `_migrations` table exists.
 *   2. Read its current contents.
 *   3. Run any migrations from the list below that haven't been applied yet,
 *      in order, each in its own transaction.
 *
 * Rules:
 *   - Migrations are forward-only. Once shipped, never modify.
 *   - File names are zero-padded: `0001_*`, `0002_*`, `0010_*`.
 *   - Each migration exports a `name` and an `up(db)` function.
 */

import type { DB } from './index';
import type { MigrationRow } from './types';
import { logger } from '@/utils/logger';
import { migration0001Initial } from './migrations/0001_initial';
import { migration0002TeacherPhone } from './migrations/0002_teacher_phone';

export interface Migration {
  name: string;
  up(db: DB): void;
}

/** Append new migrations to the END of this array. Order is load-bearing. */
const MIGRATIONS: Migration[] = [migration0001Initial, migration0002TeacherPhone];

const ENSURE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    applied_at  TEXT NOT NULL
  );
`;

export function runMigrations(db: DB): { applied: string[]; alreadyApplied: string[] } {
  db.exec(ENSURE_TABLE_SQL);

  const existing = db.query<MigrationRow>('SELECT id, name, applied_at FROM _migrations');
  const appliedNames = new Set(existing.map((m) => m.name));

  const newlyApplied: string[] = [];
  for (const m of MIGRATIONS) {
    if (appliedNames.has(m.name)) continue;
    db.transaction(() => {
      m.up(db);
      const nextId = existing.length + newlyApplied.length + 1;
      db.exec('INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)', [
        nextId,
        m.name,
        new Date().toISOString(),
      ]);
    });
    newlyApplied.push(m.name);
    logger.info('[db] applied migration', m.name);
  }

  return {
    applied: newlyApplied,
    alreadyApplied: existing.map((m) => m.name),
  };
}
