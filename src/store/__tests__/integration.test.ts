/**
 * Store integration tests — exercise the public surface of each migrated
 * Zustand store against a real (in-memory) SQLite DB. Catches contract bugs
 * that the per-repo tests can't surface (param ordering, store-side
 * normalization, etc).
 *
 * Each test resets the DB connection so the stores boot from a clean slate.
 */

import { runMigrations } from '../../db/migrate';
import { seedDatabase, backfillTeacherPhone } from '../../db/seed';
import { getDb, resetDbForTests } from '../../db/index';
import { settingsRepo } from '../../db/repositories';

import { useTeachersStore } from '../teachersStore';
import { useProfileStore } from '../profileStore';
import { useAuthStore } from '../authStore';
import { useApplicationsStore } from '../applicationsStore';
import { useHallsStore } from '../hallsStore';
import { useCoursesStore } from '../coursesStore';
import { useNotificationsStore } from '../notificationsStore';

function bootDb() {
  resetDbForTests();
  const db = getDb();
  runMigrations(db);
  seedDatabase(db);
  backfillTeacherPhone(db);
  return db;
}

function resetStore<T>(
  store: { setState: (s: Partial<T>) => void; getState: () => T },
  fresh: Partial<T>,
): void {
  // Wipe + rehydrate a Zustand store between tests so state doesn't leak.
  store.setState(fresh);
}

beforeEach(() => {
  bootDb();
  resetStore(useTeachersStore, { allTeachers: [], loaded: false });
  resetStore(useProfileStore, { profile: null });
  resetStore(useAuthStore, { role: null, userId: null, isOnboarded: false, isLoading: true });
  resetStore(useApplicationsStore, { applications: [] });
  resetStore(useHallsStore, { halls: [], loaded: false });
  resetStore(useCoursesStore, { courses: [], lastSyncAt: null, syncing: false, loaded: false });
});

describe('teachersStore', () => {
  it('loads seeded teachers and finds by id / email / phone', async () => {
    await useTeachersStore.getState().loadTeachers();
    const list = useTeachersStore.getState().allTeachers;
    expect(list.length).toBeGreaterThan(0);

    // teacher-001 = Bhikkhu Ananda (seed)
    const byId = useTeachersStore.getState().findTeacher('teacher-001');
    expect(byId?.name).toMatch(/Ananda/);

    if (byId?.email) {
      expect(useTeachersStore.getState().findTeacher(byId.email)?.id).toBe('teacher-001');
    }
    if (byId?.phone) {
      // Strip the +977 prefix to test suffix matching.
      const lastNine = byId.phone.replace(/[^\d]/g, '').slice(-9);
      expect(useTeachersStore.getState().findTeacher(lastNine)?.id).toBe('teacher-001');
    }
  });

  it('addTeacher persists through to the next read', async () => {
    await useTeachersStore.getState().addTeacher({
      id: 'teacher-test',
      name: 'New Teacher',
      gender: 'M',
      email: 'new@dhamma.org',
      inviteCode: 'AT-TEST',
      passwordHash: 'pw',
      region: 'Nepal',
      flag: '🇳🇵',
      authorizedSince: 2024,
      totalCourses: 0,
      centersServed: 0,
      coursesThisYear: 0,
      authorizations: ['10-Day'],
      languages: { Nepali: 'primary' },
      preferredRegions: [],
      availableMonths: [],
      festivalMonths: [],
      personalNote: '',
      teachingHistory: [],
      role: 'teacher',
      isOnboarded: false,
    });
    expect(useTeachersStore.getState().findTeacher('teacher-test')?.email).toBe('new@dhamma.org');
  });
});

describe('profileStore', () => {
  it('loads a profile then updates it', async () => {
    await useProfileStore.getState().loadProfile('teacher-001');
    expect(useProfileStore.getState().profile?.id).toBe('teacher-001');

    await useProfileStore.getState().updateProfile({ personalNote: 'test note' });
    expect(useProfileStore.getState().profile?.personalNote).toBe('test note');

    // Drop state, reload from DB — should still have the note.
    resetStore(useProfileStore, { profile: null });
    await useProfileStore.getState().loadProfile('teacher-001');
    expect(useProfileStore.getState().profile?.personalNote).toBe('test note');
  });
});

describe('authStore', () => {
  it('persists session, restores it on fresh boot, and clears on signOut', async () => {
    await useAuthStore.getState().setAuth('teacher', 'teacher-001', true);
    expect(useAuthStore.getState().userId).toBe('teacher-001');
    expect(settingsRepo.getJson<{ userId: string }>(getDb(), 'auth.session')?.userId).toBe(
      'teacher-001',
    );

    // Simulate a relaunch — state wiped, session row still in DB.
    resetStore(useAuthStore, {
      role: null,
      userId: null,
      isOnboarded: false,
      isLoading: true,
    });
    await useAuthStore.getState().restoreSession();
    expect(useAuthStore.getState().userId).toBe('teacher-001');
    expect(useAuthStore.getState().isLoading).toBe(false);

    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().userId).toBeNull();
    expect(settingsRepo.get(getDb(), 'auth.session')).toBeNull();
  });

  it('setOnboarded merges with existing session', async () => {
    await useAuthStore.getState().setAuth('teacher', 'teacher-001', false);
    await useAuthStore.getState().setOnboarded(true);
    expect(useAuthStore.getState().isOnboarded).toBe(true);
    const persisted = settingsRepo.getJson<{ isOnboarded: boolean; userId: string }>(
      getDb(),
      'auth.session',
    );
    expect(persisted?.isOnboarded).toBe(true);
    expect(persisted?.userId).toBe('teacher-001');
  });
});

describe('applicationsStore', () => {
  it('loads + submits + transitions through statuses', async () => {
    await useApplicationsStore.getState().loadApplications('teacher-001');
    const initial = useApplicationsStore.getState().applications.length;

    const created = await useApplicationsStore.getState().submitApplication(99, 'teacher-001');
    expect(created.status).toBe('pending');
    expect(useApplicationsStore.getState().applications.length).toBe(initial + 1);

    await useApplicationsStore.getState().updateStatus(created.id, 'approved');
    const after = useApplicationsStore.getState().applications.find((a) => a.id === created.id);
    expect(after?.status).toBe('approved');
  });

  it('emits a notification to admin when a teacher applies', async () => {
    await useNotificationsStore.getState().loadNotifications();
    const initial = useNotificationsStore.getState().getUnreadCount('admin-001');

    await useApplicationsStore.getState().submitApplication(101, 'teacher-001');

    const after = useNotificationsStore.getState().getUnreadCount('admin-001');
    expect(after).toBe(initial + 1);

    const newest = useNotificationsStore.getState().notifications[0];
    expect(newest.targetUserId).toBe('admin-001');
    expect(newest.type).toBe('new_application');
    expect(newest.read).toBe(false);
  });

  it('emits an approval notification to the teacher when admin approves', async () => {
    const teacherId = 'teacher-001';
    const created = await useApplicationsStore.getState().submitApplication(102, teacherId);
    const beforeTeacher = useNotificationsStore.getState().getUnreadCount(teacherId);

    await useApplicationsStore.getState().updateStatus(created.id, 'approved');

    const afterTeacher = useNotificationsStore.getState().getUnreadCount(teacherId);
    expect(afterTeacher).toBe(beforeTeacher + 1);

    const matchingApproval = useNotificationsStore
      .getState()
      .notifications.find(
        (n) => n.targetUserId === teacherId && n.type === 'approval' && n.courseId === 102,
      );
    expect(matchingApproval).toBeDefined();
  });

  it('full end-to-end: create teacher -> apply -> admin bell -> approve -> teacher bell', async () => {
    // 1. Admin creates a brand-new teacher (mirrors the Add Teacher flow).
    const customTeacherId = 't-tt20m';
    await useTeachersStore.getState().addTeacher({
      id: customTeacherId,
      name: 'tt20.m Test',
      gender: 'M',
      email: 'tt20m@dhamma.org',
      phone: '+977 9812345678',
      inviteCode: '',
      passwordHash: 'demo',
      region: 'Nepal',
      flag: '🇳🇵',
      authorizedSince: 2024,
      totalCourses: 0,
      centersServed: 0,
      coursesThisYear: 0,
      authorizations: ['10-Day'],
      languages: { Nepali: 'primary' },
      preferredRegions: ['Kathmandu Valley'],
      availableMonths: [],
      festivalMonths: [],
      personalNote: '',
      teachingHistory: [],
      role: 'teacher',
      isOnboarded: true,
    });

    // 2. The new teacher logs in. setAuth flips userId to their id.
    await useAuthStore.getState().setAuth('teacher', customTeacherId, true);
    expect(useAuthStore.getState().userId).toBe(customTeacherId);

    // 3. Teacher applies to a course.
    await useNotificationsStore.getState().loadNotifications();
    const adminUnreadBefore = useNotificationsStore.getState().getUnreadCount('admin-001');
    const created = await useApplicationsStore.getState().submitApplication(201, customTeacherId);
    expect(created.status).toBe('pending');

    // 4. Admin's notification queue picked it up — bell should show.
    const adminUnreadAfter = useNotificationsStore.getState().getUnreadCount('admin-001');
    expect(adminUnreadAfter).toBe(adminUnreadBefore + 1);
    const adminNotif = useNotificationsStore
      .getState()
      .notifications.find(
        (n) => n.targetUserId === 'admin-001' && n.type === 'new_application' && n.courseId === 201,
      );
    expect(adminNotif).toBeDefined();
    expect(adminNotif?.subjectEn).toContain('tt20.m Test');

    // 5. Switch auth to admin.
    await useAuthStore.getState().setAuth('admin', 'admin-001', true);
    expect(useAuthStore.getState().userId).toBe('admin-001');
    expect(useNotificationsStore.getState().getUnreadCount('admin-001')).toBeGreaterThan(0);

    // 6. Admin approves.
    const teacherUnreadBefore = useNotificationsStore.getState().getUnreadCount(customTeacherId);
    await useApplicationsStore.getState().updateStatus(created.id, 'approved');

    // 7. Teacher's queue gets the approval notification.
    const teacherUnreadAfter = useNotificationsStore.getState().getUnreadCount(customTeacherId);
    expect(teacherUnreadAfter).toBe(teacherUnreadBefore + 1);
    const teacherNotif = useNotificationsStore
      .getState()
      .notifications.find(
        (n) => n.targetUserId === customTeacherId && n.type === 'approval' && n.courseId === 201,
      );
    expect(teacherNotif).toBeDefined();

    // 8. Switch back to teacher — their bell should now show.
    await useAuthStore.getState().setAuth('teacher', customTeacherId, true);
    expect(useNotificationsStore.getState().getUnreadCount(customTeacherId)).toBeGreaterThan(0);
  });
});

describe('hallsStore', () => {
  it('loads seeded halls + filters by centre + creates new', async () => {
    await useHallsStore.getState().loadHalls();
    const all = useHallsStore.getState().halls;
    expect(all.length).toBeGreaterThan(0);

    const centreIds = [...new Set(all.map((h) => h.centreId))];
    const sample = useHallsStore.getState().getHallsForCentre(centreIds[0]);
    expect(sample.every((h) => h.centreId === centreIds[0])).toBe(true);

    const created = await useHallsStore.getState().createHall({
      centreId: centreIds[0],
      name: 'Test Hall',
      teacherSlots: 1,
      genderRequired: 'Any',
    });
    expect(useHallsStore.getState().halls.find((h) => h.id === created.id)).toBeDefined();
  });
});

describe('coursesStore', () => {
  it('loads from SQLite + shouldAutoSync logic works', async () => {
    await useCoursesStore.getState().loadCourses();
    expect(useCoursesStore.getState().courses.length).toBeGreaterThan(0);

    // No sync ever happened → should auto-sync.
    expect(useCoursesStore.getState().shouldAutoSync()).toBe(true);
  });
});
