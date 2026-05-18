/**
 * Settings store — UI-level preferences (language, showCoTeacher, view modes).
 * Persisted via the `settings` table (key/value).
 */

import { create } from 'zustand';

import i18n from '@/i18n';
import { getDb } from '@/db';
import { settingsRepo } from '@/db/repositories';
import { logger } from '@/utils/logger';

type Language = 'en' | 'ne';
export type ViewMode = 'cards' | 'table';

interface SettingsState {
  language: Language;
  showCoTeacher: boolean;
  coursesViewMode: ViewMode;
  homeMatchesViewMode: ViewMode;

  setLanguage: (lang: Language) => Promise<void>;
  toggleCoTeacher: () => Promise<void>;
  setCoursesViewMode: (mode: ViewMode) => Promise<void>;
  setHomeMatchesViewMode: (mode: ViewMode) => Promise<void>;
  restoreSettings: () => Promise<void>;
}

const KEY_LANGUAGE = 'ui.language';
const KEY_SHOW_CO_TEACHER = 'ui.showCoTeacher';
const KEY_COURSES_VIEW_MODE = 'ui.coursesViewMode';
const KEY_HOME_MATCHES_VIEW_MODE = 'ui.homeMatchesViewMode';

function persist(key: string, value: string) {
  try {
    settingsRepo.set(getDb(), key, value);
  } catch (err) {
    logger.warn(`[settingsStore] persist ${key} failed`, err);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  showCoTeacher: false,
  coursesViewMode: 'cards',
  homeMatchesViewMode: 'cards',

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
    persist(KEY_LANGUAGE, lang);
  },

  toggleCoTeacher: async () => {
    const next = !get().showCoTeacher;
    set({ showCoTeacher: next });
    persist(KEY_SHOW_CO_TEACHER, next ? '1' : '0');
  },

  setCoursesViewMode: async (mode) => {
    set({ coursesViewMode: mode });
    persist(KEY_COURSES_VIEW_MODE, mode);
  },

  setHomeMatchesViewMode: async (mode) => {
    set({ homeMatchesViewMode: mode });
    persist(KEY_HOME_MATCHES_VIEW_MODE, mode);
  },

  restoreSettings: async () => {
    try {
      const db = getDb();
      const lang = settingsRepo.get(db, KEY_LANGUAGE) as Language | null;
      const sct = settingsRepo.get(db, KEY_SHOW_CO_TEACHER);
      const cvm = settingsRepo.get(db, KEY_COURSES_VIEW_MODE);
      const hvm = settingsRepo.get(db, KEY_HOME_MATCHES_VIEW_MODE);
      if (lang === 'en' || lang === 'ne') {
        i18n.changeLanguage(lang);
        set({ language: lang });
      }
      set({
        showCoTeacher: sct === '1',
        coursesViewMode: cvm === 'table' ? 'table' : 'cards',
        homeMatchesViewMode: hvm === 'table' ? 'table' : 'cards',
      });
    } catch (err) {
      logger.warn('[settingsStore] restoreSettings failed', err);
    }
  },
}));
