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
import { applicationsRepo, coursesRepo, teachersRepo } from '@/db/repositories';
import type { Application } from '@/types';
import { logger } from '@/utils/logger';
import { useNotificationsStore } from './notificationsStore';
import adminData from '@/data/admin.json';

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

/**
 * Look up the centre + course-label strings we need to populate a
 * Notification row. Tolerant of missing data — returns sensible
 * fallbacks so a notification still gets emitted even if a sync stripped
 * the course mid-flight.
 */
function describeCourse(courseId: number): { center: string; course: string } {
  try {
    const c = coursesRepo.findById(getDb(), courseId);
    if (!c) return { center: 'Centre', course: `Course #${courseId}` };
    return {
      center: c.center,
      course: `${c.center} — ${c.type}${c.dates ? `, ${c.dates}` : ''}`,
    };
  } catch {
    return { center: 'Centre', course: `Course #${courseId}` };
  }
}

function describeTeacher(teacherId: string): { name: string } {
  try {
    const t = teachersRepo.findById(getDb(), teacherId);
    return { name: t?.name ?? 'A teacher' };
  } catch {
    return { name: 'A teacher' };
  }
}

function emitNotification(partial: {
  targetUserId: string;
  type: import('@/types').NotificationType;
  courseId?: number;
  center: string;
  course: string;
  subjectEn: string;
  bodyEn: string;
  bodyNe: string;
}) {
  try {
    useNotificationsStore.getState().addNotification(partial);
  } catch (err) {
    logger.warn('[applicationsStore] emitNotification failed', err);
  }
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

    // Notify admin that a new application has landed in the inbox.
    const { center, course } = describeCourse(courseId);
    const { name: teacherName } = describeTeacher(userId);
    emitNotification({
      targetUserId: adminData.id,
      type: 'new_application',
      courseId,
      center,
      course,
      subjectEn: `New application — ${teacherName}`,
      bodyEn: `${teacherName} has applied to ${course}. Review the application in the inbox to approve or reject.`,
      bodyNe: `${teacherName} ले ${course} मा आवेदन दिनुभएको छ। समीक्षा गर्न इनबक्स खोल्नुहोस्।`,
    });

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

    // Notify admin that a teacher wants to withdraw an approved/pending app.
    const { center, course } = describeCourse(target.courseId);
    const { name: teacherName } = describeTeacher(target.teacherId);
    emitNotification({
      targetUserId: adminData.id,
      type: 'withdrawal_request',
      courseId: target.courseId,
      center,
      course,
      subjectEn: `Withdrawal request — ${teacherName}`,
      bodyEn: `${teacherName} has requested to withdraw from ${course}.${note ? `\n\nNote: ${note}` : ''}`,
      bodyNe: `${teacherName} ले ${course} बाट फिर्ता हुने अनुरोध गर्नुभएको छ।${note ? `\n\nटिप्पणी: ${note}` : ''}`,
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

    // Notify the teacher when admin approves / rejects / requests withdrawal.
    if (status === 'approved' || status === 'rejected') {
      const { center, course } = describeCourse(target.courseId);
      const approved = status === 'approved';
      emitNotification({
        targetUserId: target.teacherId,
        type: approved ? 'approval' : 'rejection',
        courseId: target.courseId,
        center,
        course,
        subjectEn: approved ? `You have been assigned to teach` : `Application update — ${center}`,
        bodyEn: approved
          ? `Dear Teacher,\n\nWith great joy we confirm your assignment to teach the course at ${course}.\n\nSadhu! 🙏`
          : `Dear Teacher,\n\n${reason ? `Reason: ${reason}\n\n` : ''}Thank you for applying to ${course}. Unfortunately your application was not selected this round.\n\nWe hope to see you on a future course.`,
        bodyNe: approved
          ? `प्रिय आचार्य,\n\n${course} शिविरमा शिक्षणको नियुक्ति पुष्टि गर्दा हामी हर्षित छौं।\n\nसाधु! 🙏`
          : `प्रिय आचार्य,\n\n${reason ? `कारण: ${reason}\n\n` : ''}${course} शिविरका लागि आवेदन गर्नुभएकोमा धन्यवाद। दुर्भाग्यवश यस पटक चयन हुन सकेन।`,
      });
    }
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
