import { runMigrations } from '../migrate';
import { getDb, resetDbForTests } from '../index';
import type { MigrationRow } from '../types';

describe('runMigrations', () => {
  beforeEach(() => {
    resetDbForTests();
  });

  it('creates the _migrations table and records the initial migration', () => {
    const db = getDb();
    const result = runMigrations(db);

    expect(result.applied).toEqual(['0001_initial']);
    expect(result.alreadyApplied).toEqual([]);

    const rows = db.query<MigrationRow>('SELECT id, name, applied_at FROM _migrations');
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('0001_initial');
  });

  it('is idempotent — re-running does nothing', () => {
    const db = getDb();
    runMigrations(db);
    const second = runMigrations(db);

    expect(second.applied).toEqual([]);
    expect(second.alreadyApplied).toEqual(['0001_initial']);
  });

  it('creates the expected tables', () => {
    const db = getDb();
    runMigrations(db);

    // We can insert into each canonical table without error.
    expect(() => {
      const now = new Date().toISOString();
      db.exec(
        `INSERT INTO admins (id, username, password_hash, name, center_name, settings_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin-1', 'admin', 'hash', 'Admin', null, null, now, now],
      );
      db.exec(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)`, [
        'foo',
        'bar',
        now,
      ]);
      db.exec(
        `INSERT INTO centres (id, name, name_ne, city, region, country, flag, altitude, lat, lng, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['c1', 'Centre', null, null, null, 'NP', null, 1000, 27.7, 85.3, now, now],
      );
    }).not.toThrow();
  });
});
