/**
 * Admin Applications store — manages decision state for AT applications.
 *
 * Backing data is `src/data/adminApplications.json`. This store only tracks
 * the local decision overrides (approve / reject) for v1; persistence to
 * SQLite will land when the wider applications layer is wired through.
 */

import { create } from 'zustand';

import { adminApplications, type AdminApplicationStatus } from '@/data';

interface AdminApplicationsState {
  /** Map of applicationId → status. Falls back to 'pending' if not set. */
  statuses: Record<number, AdminApplicationStatus>;
  approve: (id: number) => void;
  reject: (id: number) => void;
  /** Returns the resolved status (override or 'pending'). */
  statusFor: (id: number) => AdminApplicationStatus;
}

export const useAdminApplicationsStore = create<AdminApplicationsState>((set, get) => ({
  statuses: Object.fromEntries(
    adminApplications.map((a) => [a.id, 'pending' as AdminApplicationStatus]),
  ),
  approve: (id) =>
    set((state) => ({
      statuses: { ...state.statuses, [id]: 'approved' },
    })),
  reject: (id) =>
    set((state) => ({
      statuses: { ...state.statuses, [id]: 'rejected' },
    })),
  statusFor: (id) => get().statuses[id] ?? 'pending',
}));
