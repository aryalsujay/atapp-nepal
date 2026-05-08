import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application } from '../types';
import seedData from '../data/applications.json';

interface ApplicationsState {
  applications: Application[];
  loadApplications: (userId: string) => Promise<void>;
  loadAllApplications: () => Promise<void>;
  submitApplication: (courseId: number, userId: string) => Promise<Application>;
  withdrawApplication: (applicationId: number, userId: string) => Promise<void>;
  updateStatus: (applicationId: number, status: Application['status'], reason?: string) => Promise<void>;
  addAssignment: (courseId: number, teacherId: string) => Promise<Application>;
}

const APPS_KEY = '@dhamma_applications_v2';

async function persistAll(apps: Application[]) {
  await AsyncStorage.setItem(APPS_KEY, JSON.stringify(apps));
}

async function loadFromStorage(): Promise<Application[]> {
  const raw = await AsyncStorage.getItem(APPS_KEY);
  if (raw) return JSON.parse(raw);
  // First boot: seed from JSON
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
    const newApp: Application = {
      id: Date.now(),
      courseId,
      teacherId: userId,
      status: 'pending',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      source: 'applied',
    };
    const updated = [...all, newApp];
    await persistAll(updated);
    set({ applications: updated.filter((a) => a.teacherId === userId) });
    return newApp;
  },

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
    // Update in-memory: replace the matching record in whatever slice is loaded
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId ? { ...a, status, rejectionReason: reason } : a
      ),
    }));
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
    const updated = [...all, newApp];
    await persistAll(updated);
    set((state) => ({ applications: [...state.applications, newApp] }));
    return newApp;
  },
}));
