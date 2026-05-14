/**
 * Halls store — wraps `hallsRepo`. Used by admin centre management.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { hallsRepo } from '@/db/repositories';
import type { Hall } from '@/types';
import { logger } from '@/utils/logger';

interface HallsState {
  halls: Hall[];
  loaded: boolean;
  loadHalls: () => Promise<void>;
  getHallsForCentre: (centreId: string) => Hall[];
  createHall: (hall: Omit<Hall, 'id'>) => Promise<Hall>;
  updateHall: (id: string, patch: Partial<Omit<Hall, 'id'>>) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
}

function toHall(h: ReturnType<typeof hallsRepo.list>[number]): Hall {
  return {
    id: h.id,
    centreId: h.centreId,
    name: h.name,
    teacherSlots: h.teacherSlots,
    genderRequired: h.genderRequired as Hall['genderRequired'],
    notes: h.notes ?? undefined,
  };
}

function readAll(): Hall[] {
  return hallsRepo.list(getDb()).map(toHall);
}

export const useHallsStore = create<HallsState>((set, get) => ({
  halls: [],
  loaded: false,

  loadHalls: async () => {
    try {
      set({ halls: readAll(), loaded: true });
    } catch (err) {
      logger.warn('[hallsStore] loadHalls failed', err);
      set({ loaded: true });
    }
  },

  getHallsForCentre: (centreId) => get().halls.filter((h) => h.centreId === centreId),

  createHall: async (partial) => {
    const hall: Hall = { ...partial, id: `hall-${Date.now()}` };
    hallsRepo.upsert(getDb(), {
      id: hall.id,
      centreId: hall.centreId,
      name: hall.name,
      teacherSlots: hall.teacherSlots,
      genderRequired: hall.genderRequired ?? null,
      notes: hall.notes ?? null,
    });
    set({ halls: readAll() });
    return hall;
  },

  updateHall: async (id, patch) => {
    const current = get().halls.find((h) => h.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    hallsRepo.upsert(getDb(), {
      id: merged.id,
      centreId: merged.centreId,
      name: merged.name,
      teacherSlots: merged.teacherSlots,
      genderRequired: merged.genderRequired ?? null,
      notes: merged.notes ?? null,
    });
    set({ halls: readAll() });
  },

  deleteHall: async (id) => {
    getDb().exec('DELETE FROM halls WHERE id = ?', [id]);
    set({ halls: readAll() });
  },
}));
