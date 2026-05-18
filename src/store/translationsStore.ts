/**
 * Translations store — admin i18n workflow (spec 31).
 *
 * Wraps `translationsRepo` for the import preview, suggestion queue, and
 * approve/reject actions. The suggestion list is refreshed lazily from
 * the DB on each `loadSuggestions()` so multiple admin tabs/sessions
 * don't grow stale.
 */

import { create } from 'zustand';

import { getDb } from '@/db';
import { translationsRepo } from '@/db/repositories';
import { applyOverrides, type SupportedLang } from '@/i18n';
import { logger } from '@/utils/logger';
import type { SuggestionRow } from '@/db/repositories/translations';

interface TranslationsState {
  suggestions: SuggestionRow[];
  loadSuggestions: () => void;
  upsertSuggestions: (
    rows: { key: string; lang: SupportedLang; value: string; note: string | null }[],
    suggestedBy: string | null,
  ) => number;
  approveSuggestion: (key: string, lang: SupportedLang, approvedBy: string | null) => void;
  rejectSuggestion: (key: string, lang: SupportedLang) => void;
}

export const useTranslationsStore = create<TranslationsState>((set, get) => ({
  suggestions: [],

  loadSuggestions: () => {
    try {
      const rows = translationsRepo.listSuggestions(getDb());
      set({ suggestions: rows });
    } catch (err) {
      logger.warn('[translationsStore] loadSuggestions failed', err);
    }
  },

  upsertSuggestions: (rows, suggestedBy) => {
    try {
      const db = getDb();
      let n = 0;
      db.transaction(() => {
        for (const r of rows) {
          translationsRepo.upsertSuggestion(db, { ...r, suggestedBy });
          n++;
        }
      });
      get().loadSuggestions();
      return n;
    } catch (err) {
      logger.warn('[translationsStore] upsertSuggestions failed', err);
      return 0;
    }
  },

  approveSuggestion: (key, lang, approvedBy) => {
    try {
      const db = getDb();
      const s = get().suggestions.find((x) => x.key === key && x.lang === lang);
      if (!s) return;
      db.transaction(() => {
        translationsRepo.upsertOverride(db, { key, lang, value: s.value, approvedBy });
        translationsRepo.deleteSuggestion(db, key, lang);
      });
      // Live re-bind so screens re-render in the approved wording immediately.
      applyOverrides(lang, { [key]: s.value });
      set({ suggestions: get().suggestions.filter((x) => !(x.key === key && x.lang === lang)) });
    } catch (err) {
      logger.warn('[translationsStore] approveSuggestion failed', err);
    }
  },

  rejectSuggestion: (key, lang) => {
    try {
      translationsRepo.deleteSuggestion(getDb(), key, lang);
      set({ suggestions: get().suggestions.filter((x) => !(x.key === key && x.lang === lang)) });
    } catch (err) {
      logger.warn('[translationsStore] rejectSuggestion failed', err);
    }
  },
}));
