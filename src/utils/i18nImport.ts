/**
 * i18n import parser — spec 31 §4 + §8.
 *
 * Reads an .xlsx buffer, validates the header row, and diffs each
 * suggestion column against the live (bundled + override) values. The
 * preview object describes what would change without writing to the DB.
 */

import * as XLSX from 'xlsx';

import type { DB } from '@/db';
import { readLive, type Lang } from './i18nExport';

const REQUIRED_COLUMNS = [
  'key',
  'EN (live)',
  'NE (live)',
  'EN suggestion',
  'NE suggestion',
  'notes',
] as const;

export interface PreviewSuggestion {
  key: string;
  lang: Lang;
  value: string;
  liveValue: string;
  note: string | null;
  /** True if this key is brand-new (not in live JSON yet). */
  unknownKey: boolean;
}

export interface ImportPreview {
  ok: boolean;
  /** Suggestions that will be written if the admin confirms. */
  suggestions: PreviewSuggestion[];
  /** Keys present in the sheet but unknown to the app. */
  unknownKeys: string[];
  /** Header-row problems. When set, `ok === false`. */
  missingColumns: string[];
  /** Row count read from the sheet (incl. unchanged rows). */
  totalRows: number;
  changed: number;
  added: number;
  errors: number;
}

const LANG_COLUMN: Record<Lang, string> = {
  en: 'EN suggestion',
  ne: 'NE suggestion',
};

export function parseXlsx(buffer: ArrayBuffer | Uint8Array, db: DB): ImportPreview {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number | undefined>>(sheet, {
    defval: '',
    raw: false,
  });

  const headers = rows.length ? Object.keys(rows[0]) : [];
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missingColumns.length) {
    return {
      ok: false,
      suggestions: [],
      unknownKeys: [],
      missingColumns,
      totalRows: rows.length,
      changed: 0,
      added: 0,
      errors: 0,
    };
  }

  const live = readLive(db);
  const knownKeys = new Set([...Object.keys(live.en), ...Object.keys(live.ne)]);

  const suggestions: PreviewSuggestion[] = [];
  const unknownKeys: string[] = [];
  let changed = 0;
  let added = 0;

  for (const row of rows) {
    const key = String(row['key'] ?? '').trim();
    if (!key) continue;

    const note = String(row['notes'] ?? '').trim() || null;
    const isUnknown = !knownKeys.has(key);
    if (isUnknown) unknownKeys.push(key);

    for (const lang of ['en', 'ne'] as Lang[]) {
      const suggestionValue = String(row[LANG_COLUMN[lang]] ?? '').trim();
      if (!suggestionValue) continue;
      const liveValue = live[lang][key] ?? '';
      if (suggestionValue === liveValue) continue; // No-op suggestion.

      suggestions.push({
        key,
        lang,
        value: suggestionValue,
        liveValue,
        note,
        unknownKey: isUnknown,
      });
      if (isUnknown) continue;
      if (liveValue) changed++;
      else added++;
    }
  }

  const writable = suggestions.filter((s) => !s.unknownKey);

  return {
    ok: true,
    suggestions: writable,
    unknownKeys,
    missingColumns: [],
    totalRows: rows.length,
    changed,
    added,
    errors: suggestions.length - writable.length,
  };
}
