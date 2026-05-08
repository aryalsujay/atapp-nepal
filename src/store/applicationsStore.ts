import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application } from '../types';
import seedData from '../data/applications.json';

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
    const queuePosition = all.filter((a) => a.courseId === courseId).length + 1;
    const newApp: Application = {
      id: Date.now(),
      courseId,
      teacherId: userId,
      status: 'pending',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      source: 'applied',
      queuePosition,
    };
    const updated = [...all, newApp];
    await persistAll(updated);
    set({ applications: updated.filter((a) => a.teacherId === userId) });
    return newApp;
  },

  // Teacher requests step-down — creates a pending withdrawal for admin review
  requestWithdrawal: async (applicationId, userId, note) => {
    const all = await loadFromStorage();
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
    const updated = all.filter((a) => a.id !== applicationId);
    await persistAll(updated);
    set({ applications: updated.filter((a) => a.teacherId === userId) });
  },

  updateStatus: async (applicationId, status, reason) => {
    const all = await loadFromStorage();
    const updated = all.map((a) =>
      a.id === applicationId ? { ...a, status, rejectionReason: reason } : a
    );
    await persistAll(updated);
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId ? { ...a, status, rejectionReason: reason } : a
      ),
    }));
  },

  addAssignment: async (courseId, teacherId) => {
    const all = await loadFromStorage();
    const queuePosition = all.filter((a) => a.courseId === courseId).length + 1;
    const newApp: Application = {
      id: Date.now(),
      courseId,
      teacherId,
      status: 'approved',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      source: 'assigned',
      queuePosition,
    };
    const updated = [...all, newApp];
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
