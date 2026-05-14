/**
 * Settings store — UI-level preferences (language, showCoTeacher).
 * Persisted via the `settings` table (key/value).
 */

import { create } from 'zustand';

import i18n from '@/i18n';
import { getDb } from '@/db';
import { settingsRepo } from '@/db/repositories';
import { logger } from '@/utils/logger';

type Language = 'en' | 'ne';

interface SettingsState {
  language: Language;
  showCoTeacher: boolean;

  setLanguage: (lang: Language) => Promise<void>;
  toggleCoTeacher: () => Promise<void>;
  restoreSettings: () => Promise<void>;
}

const KEY_LANGUAGE = 'ui.language';
const KEY_SHOW_CO_TEACHER = 'ui.showCoTeacher';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  showCoTeacher: false,

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
    try {
      settingsRepo.set(getDb(), KEY_LANGUAGE, lang);
    } catch (err) {
      logger.warn('[settingsStore] setLanguage failed', err);
    }
  },

  toggleCoTeacher: async () => {
    const next = !get().showCoTeacher;
    set({ showCoTeacher: next });
    try {
      settingsRepo.set(getDb(), KEY_SHOW_CO_TEACHER, next ? '1' : '0');
    } catch (err) {
      logger.warn('[settingsStore] toggleCoTeacher failed', err);
    }
  },

  restoreSettings: async () => {
    try {
      const db = getDb();
      const lang = settingsRepo.get(db, KEY_LANGUAGE) as Language | null;
      const sct = settingsRepo.get(db, KEY_SHOW_CO_TEACHER);
      if (lang === 'en' || lang === 'ne') {
        i18n.changeLanguage(lang);
        set({ language: lang });
      }
      set({ showCoTeacher: sct === '1' });
    } catch (err) {
      logger.warn('[settingsStore] restoreSettings failed', err);
    }
  },
}));
