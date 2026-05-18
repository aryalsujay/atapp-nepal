/**
 * Translations repo — admin i18n workflow (spec 31).
 *
 * Two tables:
 *  - `translation_overrides`  — admin-approved values that layer on top
 *    of the bundled JSON at i18n boot. Read at startup, written on
 *    approve.
 *  - `translation_suggestions` — pending reviewer edits imported from
 *    Excel. Written on import, deleted on approve/reject.
 */

import type { DB } from '../index';
import type { SupportedLang } from '@/i18n';

export interface OverrideRow {
  key: string;
  lang: SupportedLang;
  value: string;
  approved_by: string | null;
  approved_at: number;
}

export interface SuggestionRow {
  key: string;
  lang: SupportedLang;
  value: string;
  note: string | null;
  suggested_by: string | null;
  suggested_at: number;
}

export function getOverridesForLang(db: DB, lang: SupportedLang): Record<string, string> {
  const rows = db.query<OverrideRow>(
    'SELECT key, lang, value, approved_by, approved_at FROM translation_overrides WHERE lang = ?',
    [lang],
  );
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function upsertOverride(
  db: DB,
  override: { key: string; lang: SupportedLang; value: string; approvedBy: string | null },
): void {
  db.exec(
    `INSERT INTO translation_overrides (key, lang, value, approved_by, approved_at)
       VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key, lang) DO UPDATE SET
       value       = excluded.value,
       approved_by = excluded.approved_by,
       approved_at = excluded.approved_at`,
    [override.key, override.lang, override.value, override.approvedBy, Date.now()],
  );
}

export function listSuggestions(db: DB, lang?: SupportedLang): SuggestionRow[] {
  return lang
    ? db.query<SuggestionRow>(
        'SELECT key, lang, value, note, suggested_by, suggested_at FROM translation_suggestions WHERE lang = ? ORDER BY suggested_at DESC',
        [lang],
      )
    : db.query<SuggestionRow>(
        'SELECT key, lang, value, note, suggested_by, suggested_at FROM translation_suggestions ORDER BY suggested_at DESC',
      );
}

export function upsertSuggestion(
  db: DB,
  s: {
    key: string;
    lang: SupportedLang;
    value: string;
    note: string | null;
    suggestedBy: string | null;
  },
): void {
  db.exec(
    `INSERT INTO translation_suggestions (key, lang, value, note, suggested_by, suggested_at)
       VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(key, lang) DO UPDATE SET
       value        = excluded.value,
       note         = excluded.note,
       suggested_by = excluded.suggested_by,
       suggested_at = excluded.suggested_at`,
    [s.key, s.lang, s.value, s.note, s.suggestedBy, Date.now()],
  );
}

export function deleteSuggestion(db: DB, key: string, lang: SupportedLang): void {
  db.exec('DELETE FROM translation_suggestions WHERE key = ? AND lang = ?', [key, lang]);
}

export function countSuggestions(db: DB): number {
  const row = db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM translation_suggestions');
  return row?.n ?? 0;
}
