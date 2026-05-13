import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hall } from '@/types';
import seedHalls from '@/data/halls.json';

const HALLS_KEY = '@dhamma_halls_v1';

interface HallsState {
  halls: Hall[];
  loaded: boolean;
  loadHalls: () => Promise<void>;
  getHallsForCentre: (centreId: string) => Hall[];
  createHall: (hall: Omit<Hall, 'id'>) => Promise<Hall>;
  updateHall: (id: string, patch: Partial<Omit<Hall, 'id'>>) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
}

async function loadFromStorage(): Promise<Hall[]> {
  const raw = await AsyncStorage.getItem(HALLS_KEY);
  if (raw) return JSON.parse(raw);
  await AsyncStorage.setItem(HALLS_KEY, JSON.stringify(seedHalls));
  return seedHalls as Hall[];
}

async function saveAll(halls: Hall[]) {
  await AsyncStorage.setItem(HALLS_KEY, JSON.stringify(halls));
}

export const useHallsStore = create<HallsState>((set, get) => ({
  halls: [],
  loaded: false,

  loadHalls: async () => {
    try {
      const halls = await loadFromStorage();
      set({ halls, loaded: true });
    } catch {
      set({ halls: seedHalls as Hall[], loaded: true });
    }
  },

  getHallsForCentre: (centreId) => get().halls.filter((h) => h.centreId === centreId),

  createHall: async (partial) => {
    const hall: Hall = { ...partial, id: `hall-${Date.now()}` };
    const updated = [...get().halls, hall];
    await saveAll(updated);
    set({ halls: updated });
    return hall;
  },

  updateHall: async (id, patch) => {
    const updated = get().halls.map((h) => (h.id === id ? { ...h, ...patch } : h));
    await saveAll(updated);
    set({ halls: updated });
  },

  deleteHall: async (id) => {
    const updated = get().halls.filter((h) => h.id !== id);
    await saveAll(updated);
    set({ halls: updated });
  },
}));
