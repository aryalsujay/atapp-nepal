import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/translations/en.json';
import ne from '@/translations/ne.json';
import { logger } from '@/utils/logger';

export type SupportedLang = 'en' | 'ne';
export const SUPPORTED_LANGS: SupportedLang[] = ['en', 'ne'];

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ne: { translation: ne },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

/**
 * Merge admin-approved overrides from SQLite on top of the bundled JSON.
 * Call this once after migrations have run and again whenever an override
 * changes so screens re-render with the new wording. Keys arrive as flat
 * dotted paths (`admin.translations.title`) and are nested here so
 * i18next can deep-merge them with the bundled tree.
 */
export function applyOverrides(lang: SupportedLang, overrides: Record<string, string>) {
  try {
    const nested: Record<string, unknown> = {};
    for (const [dotted, value] of Object.entries(overrides)) {
      setNested(nested, dotted.split('.'), value);
    }
    i18n.addResourceBundle(lang, 'translation', nested, true, true);
  } catch (err) {
    logger.warn('[i18n] applyOverrides failed', err);
  }
}

function setNested(obj: Record<string, unknown>, path: string[], value: string) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

export default i18n;
