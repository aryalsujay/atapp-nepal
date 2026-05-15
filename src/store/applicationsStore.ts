/**
 * Applications store — wraps `applicationsRepo`. Drives the home upcoming
 * list, the teacher applications screen, and the admin inbox.
 *
 * Queue ordering ("you are #N in line for this course") is recomputed in JS
 * on every status change since SQLite doesn't have a clean way to express
 * "rank pending applications by appliedDate within course". Cheap operation
 * — bounded by # of pendings per course.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { applicationsRepo } from '@/db/repositories';
import type { Application } from '@/types';
import { logger } from '@/utils/logger';
import { useNotificationsStore } from './notificationsStore';

interface ApplicationsState {
  applications: Application[];
  loaded: boolean;
  /** The teacher we last loaded applications for. Empty string = never loaded. */
  loadedForUserId: string;
  loadApplications: (userId: string) => Promise<void>;
  loadAllApplications: () => Promise<void>;
  submitApplication: (courseId: number, userId: string) => Promise<Application>;
  requestWithdrawal: (applicationId: number, userId: string, note?: string) => Promise<void>;
  withdrawApplication: (applicationId: number, userId: string) => Promise<void>;
  updateStatus: (
    applicationId: number,
    status: Application['status'],
    reason?: string,
  ) => Promise<void>;
  addAssignment: (courseId: number, teacherId: string) => Promise<Application>;
  getApprovedCountForCourse: (courseId: number) => Promise<number>;
  getCoTeachersForCourse: (courseId: number, currentTeacherId: string) => Promise<string[]>;
}

const ALLOWED_TRANSITIONS: Record<Application['status'], Application['status'][]> = {
  pending: ['approved', 'rejected'],
  approved: ['withdrawal_requested', 'rejected'],
  rejected: [],
  withdrawal_requested: ['approved'],
};

function isValidTransition(from: Application['status'], to: Application['status']): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

function domainToApplication(d: ReturnType<typeof applicationsRepo.list>[number]): Application {
  return {
    id: d.id,
    courseId: d.courseId,
    teacherId: d.teacherId,
    status: d.status as Application['status'],
    appliedDate: d.appliedDate ?? '',
    source: (d.source as Application['source']) ?? 'applied',
    rejectionReason: d.rejectionReason ?? undefined,
    queuePosition: d.queuePosition ?? undefined,
    withdrawalNote: d.withdrawalNote ?? undefined,
  };
}

/**
 * Recompute queue_position for every pending row of a course, ordered by
 * appliedDate. Writes the new positions in a single transaction.
 */
function recomputeQueue(courseId: number): void {
  const db = getDb();
  const forCourse = applicationsRepo.listByCourse(db, courseId);
  const pendings = forCourse
    .filter((a) => a.status === 'pending')
    .sort((a, b) => (a.appliedDate ?? '').localeCompare(b.appliedDate ?? ''));
  db.transaction(() => {
    forCourse.forEach((a) => {
      const pendingIdx = pendings.findIndex((p) => p.id === a.id);
      const newPos = a.status === 'pending' && pendingIdx >= 0 ? pendingIdx + 1 : null;
      applicationsRepo.upsert(db, {
        ...a,
        queuePosition: newPos,
      });
    });
  });
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  loaded: false,
  loadedForUserId: '',

  loadApplications: async (userId) => {
    try {
      const rows = applicationsRepo.listByTeacher(getDb(), userId).map(domainToApplication);
      set({ applications: rows, loaded: true, loadedForUserId: userId });
    } catch (err) {
      logger.warn('[applicationsStore] loadApplications failed', err);
    }
  },

  loadAllApplications: async () => {
    try {
      set({ applications: applicationsRepo.list(getDb()).map(domainToApplication) });
    } catch (err) {
      logger.warn('[applicationsStore] loadAllApplications failed', err);
    }
  },

  submitApplication: async (courseId, userId) => {
    const db = getDb();
    const inserted = applicationsRepo.upsert(db, {
      courseId,
      teacherId: userId,
      status: 'pending',
      appliedDate: new Date().toISOString().slice(0, 10),
      source: 'applied',
      rejectionReason: null,
      queuePosition: null,
      withdrawalNote: null,
    });
    recomputeQueue(courseId);

    const persisted = applicationsRepo.findById(db, inserted.id);
    const created: Application = persisted
      ? domainToApplication(persisted)
      : domainToApplication(inserted);
    set({
      applications: applicationsRepo.listByTeacher(db, userId).map(domainToApplication),
    });
    return created;
  },

  requestWithdrawal: async (applicationId, _userId, note) => {
    const db = getDb();
    const target = applicationsRepo.findById(db, applicationId);
    if (
      !target ||
      !isValidTransition(target.status as Application['status'], 'withdrawal_requested')
    )
      return;
    applicationsRepo.upsert(db, {
      ...target,
      status: 'withdrawal_requested',
      withdrawalNote: note ?? null,
    });
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? { ...a, status: 'withdrawal_requested' as const, withdrawalNote: note }
          : a,
      ),
    }));
  },

  withdrawApplication: async (applicationId, userId) => {
    const db = getDb();
    const target = applicationsRepo.findById(db, applicationId);
    if (!target) return;
    applicationsRepo.deleteById(db, applicationId);
    recomputeQueue(target.courseId);
    useNotificationsStore.getState().removeForApplication?.(target.teacherId, target.courseId);
    set({
      applications: applicationsRepo.listByTeacher(db, userId).map(domainToApplication),
    });
  },

  updateStatus: async (applicationId, status, reason) => {
    const db = getDb();
    const target = applicationsRepo.findById(db, applicationId);
    if (!target) return;
    if (!isValidTransition(target.status as Application['status'], status)) return;
    applicationsRepo.upsert(db, {
      ...target,
      status,
      rejectionReason: reason ?? null,
    });
    recomputeQueue(target.courseId);
    // Refresh the slice we currently hold (per-user OR all).
    const all = applicationsRepo.list(db).map(domainToApplication);
    set((state) => {
      const sliceUserId = state.applications[0]?.teacherId;
      const isFilteredSlice =
        sliceUserId && state.applications.every((a) => a.teacherId === sliceUserId);
      if (isFilteredSlice) return { applications: all.filter((a) => a.teacherId === sliceUserId) };
      return { applications: all };
    });
  },

  addAssignment: async (courseId, teacherId) => {
    const db = getDb();
    const inserted = applicationsRepo.upsert(db, {
      courseId,
      teacherId,
      status: 'approved',
      appliedDate: new Date().toISOString().slice(0, 10),
      source: 'assigned',
      rejectionReason: null,
      queuePosition: null,
      withdrawalNote: null,
    });
    recomputeQueue(courseId);

    const persisted = applicationsRepo.findById(db, inserted.id);
    const created: Application = persisted
      ? domainToApplication(persisted)
      : domainToApplication(inserted);
    set((state) => ({ applications: [...state.applications, created] }));
    return created;
  },

  getApprovedCountForCourse: async (courseId) => {
    return applicationsRepo.countApprovedForCourse(getDb(), courseId);
  },

  getCoTeachersForCourse: async (courseId, currentTeacherId) => {
    return applicationsRepo
      .listByCourse(getDb(), courseId)
      .filter((a) => a.teacherId !== currentTeacherId && a.status === 'approved')
      .map((a) => a.teacherId);
  },
}));
