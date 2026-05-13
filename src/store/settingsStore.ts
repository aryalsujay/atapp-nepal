import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

type Language = 'en' | 'ne';

interface SettingsState {
  language: Language;
  showCoTeacher: boolean;

  setLanguage: (lang: Language) => Promise<void>;
  toggleCoTeacher: () => Promise<void>;
  restoreSettings: () => Promise<void>;
}

const SETTINGS_KEY = '@dhamma_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  showCoTeacher: false,

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const current = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, language: lang }));
  },

  toggleCoTeacher: async () => {
    const next = !get().showCoTeacher;
    set({ showCoTeacher: next });
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      const current = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, showCoTeacher: next }));
    } catch {}
  },

  restoreSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const { language, showCoTeacher } = JSON.parse(raw);
        if (language) {
          i18n.changeLanguage(language);
          set({ language, showCoTeacher: showCoTeacher ?? false });
        }
      }
    } catch {}
  },
}));
