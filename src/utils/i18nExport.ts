/**
 * i18n export utilities — spec 31 §4 + §8.
 *
 * Flattens the two translation bundles (en · ne) plus any pending
 * suggestions into a single workbook so reviewers can edit offline in
 * Excel.
 */

import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import enJson from '@/translations/en.json';
import neJson from '@/translations/ne.json';
import type { DB } from '@/db';
import { translationsRepo } from '@/db/repositories';

export const SHEET_HEADERS = [
  'key',
  'EN (live)',
  'NE (live)',
  'EN suggestion',
  'NE suggestion',
  'notes',
] as const;

export type Lang = 'en' | 'ne';

/** Flatten nested JSON to dotted keys (`a.b.c`). */
export function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      out[path] = v;
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, path));
    }
  }
  return out;
}

/** Inverse of `flatten` — used by the importer when writing back. */
export function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [dotted, value] of Object.entries(flat)) {
    const parts = dotted.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
      cur = cur[k] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return out;
}

/** Read all live translations (bundled + DB overrides merged on top). */
export function readLive(db: DB): Record<Lang, Record<string, string>> {
  const en = flatten(enJson as Record<string, unknown>);
  const ne = flatten(neJson as Record<string, unknown>);
  Object.assign(en, translationsRepo.getOverridesForLang(db, 'en'));
  Object.assign(ne, translationsRepo.getOverridesForLang(db, 'ne'));
  return { en, ne };
}

/** Build the workbook rows. Exported for unit tests. */
export function buildWorkbookRows(
  live: Record<Lang, Record<string, string>>,
  suggestions: { key: string; lang: Lang; value: string; note: string | null }[],
): (string | null)[][] {
  // Union of keys across both live bundles, sorted for stable output.
  const keys = Array.from(new Set([...Object.keys(live.en), ...Object.keys(live.ne)])).sort();

  // Index suggestions by key for O(1) lookup per row.
  const sugByKey = new Map<string, { en?: string; ne?: string; note?: string }>();
  for (const s of suggestions) {
    const slot = sugByKey.get(s.key) ?? {};
    slot[s.lang] = s.value;
    if (s.note) slot.note = s.note;
    sugByKey.set(s.key, slot);
  }

  return keys.map((key) => {
    const sug = sugByKey.get(key) ?? {};
    return [
      key,
      live.en[key] ?? '',
      live.ne[key] ?? '',
      sug.en ?? '',
      sug.ne ?? '',
      sug.note ?? '',
    ];
  });
}

/**
 * Export the full translation set as a single-sheet .xlsx file.
 * Returns the file path / URI on native, or triggers a browser download
 * on web. Resolves once the share sheet has been presented (native) or
 * the download has fired (web).
 */
export async function exportXlsx(db: DB): Promise<{ uri: string; fileName: string }> {
  const live = readLive(db);
  const suggestions = translationsRepo.listSuggestions(db).map((s) => ({
    key: s.key,
    lang: s.lang as Lang,
    value: s.value,
    note: s.note,
  }));
  const rows = buildWorkbookRows(live, suggestions);

  const sheet = XLSX.utils.aoa_to_sheet([SHEET_HEADERS as unknown as string[], ...rows]);
  // Set sensible column widths so the file opens readably in Excel.
  sheet['!cols'] = [
    { wch: 38 }, // key
    { wch: 36 }, // EN live
    { wch: 36 }, // NE live
    { wch: 36 }, // EN sugg
    { wch: 36 }, // NE sugg
    { wch: 30 }, // notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'translations');
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `dhamma-nepal-translations-${date}.xlsx`;

  if (Platform.OS === 'web') {
    XLSX.writeFile(workbook, fileName);
    return { uri: fileName, fileName };
  }

  const b64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;
  const uri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, b64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export translations',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }
  return { uri, fileName };
}

/**
 * Export the two live language JSONs (bundled + overrides merged) so
 * engineering can commit the result back into `src/translations/*.json`
 * at release time.
 */
export async function exportJsonBundle(db: DB): Promise<string[]> {
  const live = readLive(db);
  const date = new Date().toISOString().slice(0, 10);
  const files: { name: string; content: string }[] = (['en', 'ne'] as Lang[]).map((lang) => ({
    name: `${lang}-${date}.json`,
    content: JSON.stringify(unflatten(live[lang]), null, 2),
  }));

  if (Platform.OS === 'web') {
    for (const f of files) {
      const blob = new Blob([f.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
    }
    return files.map((f) => f.name);
  }

  const uris: string[] = [];
  for (const f of files) {
    const uri = `${FileSystem.documentDirectory}${f.name}`;
    await FileSystem.writeAsStringAsync(uri, f.content);
    uris.push(uri);
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uris[0], {
      mimeType: 'application/json',
      dialogTitle: 'Export translations as JSON',
    });
  }
  return uris;
}
