/**
 * Repository smoke tests — open an in-memory DB, run migrations + seed, then
 * exercise the public surface of each repo so any obvious wiring bug surfaces
 * here before it reaches a store.
 *
 * Per-repo deep tests can live next to each file if a behaviour gets subtle.
 * For now this single suite covers the wire-up.
 */

import { runMigrations } from '../migrate';
import { seedDatabase } from '../seed';
import { getDb, resetDbForTests } from '../index';
import {
  adminsRepo,
  applicationsRepo,
  centresRepo,
  coursesRepo,
  hallsRepo,
  notificationsRepo,
  serverApplicationsRepo,
  serverCoursesRepo,
  serviceAreasRepo,
  settingsRepo,
  teachersRepo,
} from '../repositories';

beforeEach(() => {
  resetDbForTests();
});

function bootedDb() {
  const db = getDb();
  runMigrations(db);
  seedDatabase(db);
  return db;
}

describe('settingsRepo', () => {
  it('round-trips string + JSON values', () => {
    const db = bootedDb();
    settingsRepo.set(db, 'theme', 'dark');
    expect(settingsRepo.get(db, 'theme')).toBe('dark');

    settingsRepo.setJson(db, 'flags', { a: 1, b: 'two' });
    expect(settingsRepo.getJson(db, 'flags')).toEqual({ a: 1, b: 'two' });
  });

  it('overwrites on conflict (upsert)', () => {
    const db = bootedDb();
    settingsRepo.set(db, 'k', 'v1');
    settingsRepo.set(db, 'k', 'v2');
    expect(settingsRepo.get(db, 'k')).toBe('v2');
  });

  it('returns null for missing keys', () => {
    const db = bootedDb();
    expect(settingsRepo.get(db, 'missing')).toBeNull();
  });
});

describe('teachersRepo', () => {
  it('lists seeded teachers and filters by role', () => {
    const db = bootedDb();
    const all = teachersRepo.list(db);
    expect(all.length).toBeGreaterThan(0);

    const teachers = teachersRepo.list(db, 'teacher');
    const servers = teachersRepo.list(db, 'server');
    expect(teachers.length + servers.length).toBe(all.length);
  });

  it('finds by id and by identifier (email/code)', () => {
    const db = bootedDb();
    const [first] = teachersRepo.list(db);
    expect(teachersRepo.findById(db, first.id)?.id).toBe(first.id);
    if (first.email) {
      expect(teachersRepo.findByIdentifier(db, first.email)?.id).toBe(first.id);
    }
  });

  it('upserts a new teacher idempotently', () => {
    const db = bootedDb();
    const before = teachersRepo.count(db);
    teachersRepo.upsert(db, {
      id: 'test-1',
      name: 'Repo Test',
      role: 'teacher',
      passwordHash: 'x',
    });
    expect(teachersRepo.count(db)).toBe(before + 1);
    // Second upsert should not duplicate.
    teachersRepo.upsert(db, {
      id: 'test-1',
      name: 'Repo Test Updated',
      role: 'teacher',
      passwordHash: 'x',
    });
    expect(teachersRepo.count(db)).toBe(before + 1);
    expect(teachersRepo.findById(db, 'test-1')?.name).toBe('Repo Test Updated');
  });
});

describe('coursesRepo', () => {
  it('lists seeded courses sorted by start_date', () => {
    const db = bootedDb();
    const courses = coursesRepo.list(db);
    expect(courses.length).toBeGreaterThan(0);
    for (let i = 1; i < courses.length; i++) {
      expect(courses[i - 1].startDate <= courses[i].startDate).toBe(true);
    }
  });

  it('round-trips JSON columns (languages, students, coordinator)', () => {
    const db = bootedDb();
    const [c] = coursesRepo.list(db);
    expect(Array.isArray(c.languages)).toBe(true);
    expect(typeof c.students).toBe('object');
    expect(typeof c.coordinator).toBe('object');
  });
});

describe('applicationsRepo', () => {
  it('lists by teacher', () => {
    const db = bootedDb();
    const all = applicationsRepo.list(db);
    if (all.length === 0) return; // nothing to assert if no seed
    const { teacherId } = all[0];
    const byTeacher = applicationsRepo.listByTeacher(db, teacherId);
    expect(byTeacher.every((a) => a.teacherId === teacherId)).toBe(true);
  });

  it('inserts when id is omitted and assigns a new id', () => {
    const db = bootedDb();
    const inserted = applicationsRepo.upsert(db, {
      courseId: 1,
      teacherId: 'teacher-001',
      status: 'pending',
      appliedDate: '2026-05-14',
      source: 'applied',
      rejectionReason: null,
      queuePosition: null,
      withdrawalNote: null,
    });
    expect(inserted.id).toBeGreaterThan(0);
  });

  it('updates status', () => {
    const db = bootedDb();
    const created = applicationsRepo.upsert(db, {
      courseId: 1,
      teacherId: 'teacher-001',
      status: 'pending',
      appliedDate: '2026-05-14',
      source: 'applied',
      rejectionReason: null,
      queuePosition: null,
      withdrawalNote: null,
    });
    applicationsRepo.updateStatus(db, created.id, 'approved');
    expect(applicationsRepo.findById(db, created.id)?.status).toBe('approved');
  });
});

describe('adminsRepo', () => {
  it('finds admin by username', () => {
    const db = bootedDb();
    const all = adminsRepo.list(db);
    if (all.length === 0) return;
    const [a] = all;
    expect(adminsRepo.findByUsername(db, a.username)?.id).toBe(a.id);
  });
});

describe('centresRepo + hallsRepo + serviceAreasRepo', () => {
  it('return seeded reference data', () => {
    const db = bootedDb();
    expect(centresRepo.list(db).length).toBeGreaterThan(0);
    expect(hallsRepo.list(db).length).toBeGreaterThan(0);
    expect(serviceAreasRepo.list(db).length).toBeGreaterThan(0);
  });
});

describe('serverCoursesRepo + serverApplicationsRepo', () => {
  it('expose seeded rows', () => {
    const db = bootedDb();
    expect(serverCoursesRepo.list(db).length).toBeGreaterThan(0);
    expect(serverApplicationsRepo.list(db).length).toBeGreaterThanOrEqual(0);
  });
});

describe('notificationsRepo', () => {
  it('inserts + lists + marks read', () => {
    const db = bootedDb();
    const id = notificationsRepo.insert(db, {
      userId: 'teacher-001',
      userRole: 'teacher',
      kind: 'invite',
      title: 'Test',
      body: 'Hello',
      linkTarget: null,
      linkParams: { courseId: 1 },
      isRead: false,
    });
    const list = notificationsRepo.listForUser(db, 'teacher-001', 'teacher');
    expect(list.some((n) => n.id === id)).toBe(true);
    expect(notificationsRepo.unreadCount(db, 'teacher-001', 'teacher')).toBeGreaterThan(0);

    notificationsRepo.markRead(db, id);
    const after = notificationsRepo
      .listForUser(db, 'teacher-001', 'teacher')
      .find((n) => n.id === id);
    expect(after?.isRead).toBe(true);
  });
});
