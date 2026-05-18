/**
 * 0007_translations — adds two tables for the admin i18n workflow
 * (spec 31). `translation_overrides` is merged on top of bundled JSON at
 * i18n boot so admin-approved edits take effect without an app rebuild.
 * `translation_suggestions` queues reviewer edits imported from Excel
 * until an admin approves or rejects each one.
 */

import type { Migration } from '../migrate';

export const migration0007Translations: Migration = {
  name: '0007_translations',
  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS translation_overrides (
        key         TEXT NOT NULL,
        lang        TEXT NOT NULL,
        value       TEXT NOT NULL,
        approved_by TEXT,
        approved_at INTEGER NOT NULL,
        PRIMARY KEY (key, lang)
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS translation_suggestions (
        key          TEXT NOT NULL,
        lang         TEXT NOT NULL,
        value        TEXT NOT NULL,
        note         TEXT,
        suggested_by TEXT,
        suggested_at INTEGER NOT NULL,
        PRIMARY KEY (key, lang)
      )
    `);
  },
};
