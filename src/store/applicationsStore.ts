import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application } from '../types';
import seedData from '../data/applications.json';
import { useNotificationsStore } from './notificationsStore';

interface ApplicationsState {
  applications: Application[];
  loadApplications: (userId: string) => Promise<void>;
  loadAllApplications: () => Promise<void>;
  submitApplication: (courseId: number, userId: string) => Promise<Application>;
  requestWithdrawal: (applicationId: number, userId: string, note?: string) => Promise<void>;
  withdrawApplication: (applicationId: number, userId: string) => Promise<void>;
  updateStatus: (applicationId: number, status: Application['status'], reason?: string) => Promise<void>;
  addAssignment: (courseId: number, teacherId: string) => Promise<Application>;
  getApprovedCountForCourse: (courseId: number) => Promise<number>;
  getCoTeachersForCourse: (courseId: number, currentTeacherId: string) => Promise<string[]>;
}

const APPS_KEY = '@dhamma_applications_v2';

// Allowed status transitions. Anything outside this map is rejected.
const ALLOWED_TRANSITIONS: Record<Application['status'], Application['status'][]> = {
  pending: ['approved', 'rejected'],
  approved: ['withdrawal_requested', 'rejected'],
  rejected: [],
  withdrawal_requested: ['approved'], // admin rejects step-down → revert to approved
};

function isValidTransition(from: Application['status'], to: Application['status']): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// Renumber pending applications for a single course by appliedDate order.
function recalcQueueForCourse(apps: Application[], courseId: number): Application[] {
  const pending = apps
    .filter((a) => a.courseId === courseId && a.status === 'pending')
    .sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime());
  const positions = new Map<number, number>();
  pending.forEach((a, idx) => positions.set(a.id, idx + 1));
  return apps.map((a) =>
    a.courseId === courseId
      ? { ...a, queuePosition: a.status === 'pending' ? positions.get(a.id) : undefined }
      : a
  );
}

async function persistAll(apps: Application[]) {
  await AsyncStorage.setItem(APPS_KEY, JSON.stringify(apps));
}

async function loadFromStorage(): Promise<Application[]> {
  const raw = await AsyncStorage.getItem(APPS_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = seedData as Application[];
  await AsyncStorage.setItem(APPS_KEY, JSON.stringify(seeded));
  return seeded;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],

  loadApplications: async (userId) => {
    try {
      const all = await loadFromStorage();
      set({ applications: all.filter((a) => a.teacherId === userId) });
    } catch {}
  },

  loadAllApplications: async () => {
    try {
      const all = await loadFromStorage();
      set({ applications: all });
    } catch {}
  },

  submitApplication: async (courseId, userId) => {
    const all = await loadFromStorage();
    const pendingForCourse = all.filter((a) => a.courseId === courseId && a.status === 'pending').length;
    const newApp: Application = {
      id: Date.now(),
      courseId,
      teacherId: userId,
      status: 'pending',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      source: 'applied',
      queuePosition: pendingForCourse + 1,
    };
    const updated = recalcQueueForCourse([...all, newApp], courseId);
    await persistAll(updated);
    set({ applications: updated.filter((a) => a.teacherId === userId) });
    return newApp;
  },

  // Teacher requests step-down — creates a pending withdrawal for admin review
  requestWithdrawal: async (applicationId, userId, note) => {
    const all = await loadFromStorage();
    const target = all.find((a) => a.id === applicationId);
    if (!target || !isValidTransition(target.status, 'withdrawal_requested')) return;
    const updated = all.map((a) =>
      a.id === applicationId
        ? { ...a, status: 'withdrawal_requested' as const, withdrawalNote: note }
        : a
    );
    await persistAll(updated);
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? { ...a, status: 'withdrawal_requested' as const, withdrawalNote: note }
          : a
      ),
    }));
  },

  // Hard delete — only called by admin when approving a withdrawal
  withdrawApplication: async (applicationId, userId) => {
    const all = await loadFromStorage();
    const target = all.find((a) => a.id === applicationId);
    const courseId = target?.courseId;
    let updated = all.filter((a) => a.id !== applicationId);
    if (courseId !== undefined) updated = recalcQueueForCourse(updated, courseId);
    await persistAll(updated);
    // Drop notifications referencing the deleted application's course for that teacher
    if (target) {
      useNotificationsStore.getState().removeForApplication?.(target.teacherId, target.courseId);
    }
    set({ applications: updated.filter((a) => a.teacherId === userId) });
  },

  updateStatus: async (applicationId, status, reason) => {
    const all = await loadFromStorage();
    const target = all.find((a) => a.id === applicationId);
    if (!target) return;
    if (!isValidTransition(target.status, status)) {
      // Silently no-op; surfacing alerts here would couple store to UI
      return;
    }
    let updated = all.map((a) =>
      a.id === applicationId ? { ...a, status, rejectionReason: reason } : a
    );
    updated = recalcQueueForCourse(updated, target.courseId);
    await persistAll(updated);
    set((state) => {
      const inSlice = state.applications.some((a) => a.id === applicationId);
      // If we previously held a filtered (per-user) slice, only refresh that slice
      if (inSlice && state.applications.length < updated.length) {
        const userId = state.applications[0]?.teacherId;
        return { applications: updated.filter((a) => a.teacherId === userId) };
      }
      return { applications: updated };
    });
  },

  addAssignment: async (courseId, teacherId) => {
    const all = await loadFromStorage();
    const newApp: Application = {
      id: Date.now(),
      courseId,
      teacherId,
      status: 'approved',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      source: 'assigned',
    };
    const updated = recalcQueueForCourse([...all, newApp], courseId);
    await persistAll(updated);
    set((state) => ({ applications: [...state.applications, newApp] }));
    return newApp;
  },

  getApprovedCountForCourse: async (courseId) => {
    const all = await loadFromStorage();
    return all.filter((a) => a.courseId === courseId && a.status === 'approved').length;
  },

  getCoTeachersForCourse: async (courseId, currentTeacherId) => {
    const all = await loadFromStorage();
    return all
      .filter((a) => a.courseId === courseId && a.teacherId !== currentTeacherId && a.status === 'approved')
      .map((a) => a.teacherId);
  },
}));
