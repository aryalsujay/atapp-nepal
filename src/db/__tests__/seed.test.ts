import { runMigrations } from '../migrate';
import { seedDatabase, isSeeded, resetSeedFlag } from '../seed';
import { getDb, resetDbForTests } from '../index';

describe('seedDatabase', () => {
  beforeEach(() => {
    resetDbForTests();
  });

  it('returns inserted counts on first run', () => {
    const db = getDb();
    runMigrations(db);
    const { inserted } = seedDatabase(db);

    // Don't pin exact counts to the JSON contents — those drift. Just verify
    // every table got at least one row.
    expect(inserted.admins).toBeGreaterThanOrEqual(1);
    expect(inserted.teachers).toBeGreaterThanOrEqual(1);
    expect(inserted.centres).toBeGreaterThanOrEqual(1);
    expect(inserted.halls).toBeGreaterThanOrEqual(1);
    expect(inserted.courses).toBeGreaterThanOrEqual(1);
    expect(inserted.service_areas).toBeGreaterThanOrEqual(1);
    expect(inserted.applications).toBeGreaterThanOrEqual(1);
    expect(inserted.server_courses).toBeGreaterThanOrEqual(1);
    expect(inserted.server_applications).toBeGreaterThanOrEqual(1);
  });

  it('marks the database as seeded', () => {
    const db = getDb();
    runMigrations(db);
    expect(isSeeded(db)).toBe(false);
    seedDatabase(db);
    expect(isSeeded(db)).toBe(true);
  });

  it('is idempotent — second call returns empty insert map', () => {
    const db = getDb();
    runMigrations(db);
    seedDatabase(db);
    const second = seedDatabase(db);
    expect(second.inserted).toEqual({});
  });

  it('resetSeedFlag allows re-seeding', () => {
    const db = getDb();
    runMigrations(db);
    seedDatabase(db);
    resetSeedFlag(db);
    expect(isSeeded(db)).toBe(false);
    const second = seedDatabase(db);
    expect(Object.keys(second.inserted).length).toBeGreaterThan(0);
  });
});
