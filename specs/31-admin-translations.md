# Spec: Admin Translations (export · suggest · approve · import)

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-18

---

## 0. Source of truth

No prototype mockup for this screen — it's new functionality requested 2026-05-18 to let an admin maintain the EN / NE / HI translation files in Excel outside the app, collect suggestions per locale, and approve them back into the live translation files.

Existing translation files live in `src/translations/{en,ne}.json`. This spec adds `hi.json` (Hindi) as a peer language and a writable runtime layer so admin edits persist without an app rebuild.

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `31-admin-translations` |
| Routes | `/(admin)/translations`, `/(admin)/translations/import`, `/(admin)/translations/review` |
| Source files | `app/(admin)/translations/{index,import,review}.tsx`; new components in `src/components/admin/translations/`; new utilities in `src/utils/i18n{Export,Import}.ts`; new store `src/store/translationsStore.ts`; new repo `src/db/repositories/translations.ts`; new migration `0007_translations.ts` |
| Roles | `admin` |
| Related specs | none (new) |

---

## 2. Purpose

Three workflows for the admin:

1. **Export** the full translation set to an `.xlsx` so reviewers can edit Nepali / Hindi / English text in their own tools.
2. **Import** the reviewed `.xlsx` back into the app. Imports never overwrite the live values automatically; they land in a *suggestion* queue.
3. **Approve / reject** each suggestion in-app. Approval writes the new text into the live translation layer immediately (no app rebuild) and the app re-renders in the new wording.

Plus a one-button **Export current JSON** so the engineering team can sync admin-approved edits back into the bundled JSON files at release time.

---

## 3. Visual Layout

Three sub-screens; all reachable from a tile on the admin dashboard (`/(admin)/dashboard`) titled `🌐 Translations`.

### 3.1 `/(admin)/translations` — overview / queue

White header `Translations` (26 / weight 800) + subtitle `Edit EN · NE · HI` (13 / `tx2`). Then four stacked tiles:

| Tile | Subtitle | Action |
|---|---|---|
| `📤 Export to Excel` | `Download {{N}} keys × 3 languages` | calls `i18nExport.exportXlsx()` → triggers `expo-sharing.share` (native) or browser download (web) |
| `📥 Import from Excel` | `Upload reviewed sheet` | routes to `/(admin)/translations/import` |
| `📝 Review suggestions ({{pending}})` | `Pending review · {{pending}} rows` | routes to `/(admin)/translations/review`. Tile is dimmed when `pending === 0` |
| `💾 Export current JSON` | `Download EN · NE · HI as .json bundle` | runs `i18nExport.exportJsonBundle()` — used by engineering at release time |

Below the tiles: a one-line status row showing `Last imported · {{date}} by {{adminName}}` (driven by `settings.i18nLastImport`).

### 3.2 `/(admin)/translations/import` — upload + preview

Two phases:

**Phase A — pick file**
- Header `Import translations`.
- Body: drag-zone (web) / single button `Choose .xlsx file` (native). Uses `expo-document-picker`.
- Hint text: `File must have the column header row exported by this app. Mismatched headers will be rejected.`

**Phase B — preview**
- Header `Review changes` with file name + row count.
- Three counters: `Added: {{a}} · Changed: {{c}} · Errors: {{e}}`.
- List of preview rows (FlatList, 60 px each). Each row shows: `key` (`tx3` 10 px), `EN live → suggestion`, `NE live → suggestion`, `HI live → suggestion`. Empty side renders `—`.
- Errors (unknown keys, malformed cells, missing columns) shown in a red banner above the list with a `View errors` toggle.
- Two CTAs at bottom: `Cancel` and `Confirm import`. Confirm writes each non-error row into `translation_suggestions` (replacing any existing suggestion for the same key+lang).

### 3.3 `/(admin)/translations/review` — approve / reject queue

- Header `Pending suggestions ({{n}})`.
- Filter chips: `All`, `EN`, `NE`, `HI` (filter by suggested-language column).
- FlatList of suggestion rows. Each row card:
  - **Top**: `key` in monospace (10.5 / `tx3`), the source `note` (italic, 11 / `tx2`) if any.
  - **Middle**: side-by-side `Live` (left, `tx2`) and `Suggestion` (right, `tx`, bold). Single language per row.
  - **Bottom CTA row**: `Reject` (outlined) and `Approve` (saffron primary). Approve disabled when suggestion is identical to live.
- Empty state: card with `No pending suggestions. Run an import or wait for reviewer edits.`

---

## 4. Excel sheet format

One sheet named `translations`. First row is the header. One row per leaf translation key.

| Col | Header | Read/Write | Source | Notes |
|---|---|---|---|---|
| A | `key` | RW (read-only after export) | flattened dotted path | e.g. `courses.view_and_apply`; never edit |
| B | `EN (live)` | R | `src/translations/en.json` + overrides | reference only — ignored on import |
| C | `NE (live)` | R | `src/translations/ne.json` + overrides | reference only — ignored on import |
| D | `HI (live)` | R | `src/translations/hi.json` + overrides | reference only — ignored on import |
| E | `EN suggestion` | W | `translation_suggestions(key, lang='en')` | empty cell = no suggestion |
| F | `NE suggestion` | W | `translation_suggestions(key, lang='ne')` | empty cell = no suggestion |
| G | `HI suggestion` | W | `translation_suggestions(key, lang='hi')` | empty cell = no suggestion |
| H | `notes` | W | `translation_suggestions.note` | free text; persisted per key (not per language) |

A row with only live columns and no suggestions is a no-op on import. Keys present in the live JSON but absent from the sheet are not deleted (only adds/changes). Keys present in the sheet but unknown to the live JSON appear in the error banner — never silently created.

---

## 5. Data layer

### 5.1 Migration `0007_translations.ts`

```sql
CREATE TABLE IF NOT EXISTS translation_overrides (
  key            TEXT NOT NULL,
  lang           TEXT NOT NULL,     -- 'en' | 'ne' | 'hi'
  value          TEXT NOT NULL,
  approved_by    TEXT,
  approved_at    INTEGER NOT NULL,
  PRIMARY KEY (key, lang)
);

CREATE TABLE IF NOT EXISTS translation_suggestions (
  key            TEXT NOT NULL,
  lang           TEXT NOT NULL,
  value          TEXT NOT NULL,
  note           TEXT,
  suggested_by   TEXT,
  suggested_at   INTEGER NOT NULL,
  PRIMARY KEY (key, lang)
);
```

### 5.2 Repository `translations.ts`
- `getOverrides(db, lang) → Record<dotted-key, value>` — used at i18n init.
- `upsertOverride(db, { key, lang, value, approvedBy })`.
- `getSuggestions(db, lang?) → Suggestion[]`.
- `upsertSuggestion(db, suggestion)`.
- `deleteSuggestion(db, key, lang)`.

### 5.3 Store `translationsStore.ts`
- `pendingByLang: Record<'en' | 'ne' | 'hi', Suggestion[]>` (selector-friendly).
- `loadPending()`, `approveSuggestion(key, lang)`, `rejectSuggestion(key, lang)`.
- On approve: calls `repo.upsertOverride`, then `repo.deleteSuggestion`, then re-binds i18next bundle for that lang in place (`i18n.addResourceBundle(lang, 'translation', updated, true, true)`).

### 5.4 i18n wiring

`src/i18n.ts` already loads `en` + `ne` from JSON. Change:
1. Add `import hi from '@/translations/hi.json'` as a third base bundle.
2. After bundles register, call `applyOverridesFromDb()` which:
   - reads `translation_overrides` for each lang,
   - calls `i18n.addResourceBundle(lang, 'translation', overrideMap, true, true)` to deep-merge atop the bundled JSON.
3. Whenever an override changes (via the approve flow), re-bundle just the affected lang.

---

## 6. Strings & i18n

Namespace `admin.translations.*` — add the keys below in **all three** language files (EN as canonical, NE as Acharya-correct, HI empty/English-fallback for now).

| Key | EN |
|---|---|
| `admin.translations.title` | `Translations` |
| `admin.translations.subtitle` | `Edit EN · NE · HI` |
| `admin.translations.tile_export_xlsx` | `Export to Excel` |
| `admin.translations.tile_export_xlsx_sub` | `Download {{n}} keys × 3 languages` |
| `admin.translations.tile_import` | `Import from Excel` |
| `admin.translations.tile_import_sub` | `Upload reviewed sheet` |
| `admin.translations.tile_review` | `Review suggestions ({{n}})` |
| `admin.translations.tile_review_sub` | `Pending review · {{n}} rows` |
| `admin.translations.tile_export_json` | `Export current JSON` |
| `admin.translations.tile_export_json_sub` | `Download EN · NE · HI as .json bundle` |
| `admin.translations.last_imported` | `Last imported · {{date}} by {{name}}` |
| `admin.translations.import_title` | `Import translations` |
| `admin.translations.choose_file` | `Choose .xlsx file` |
| `admin.translations.preview_title` | `Review changes` |
| `admin.translations.preview_counts` | `Added: {{a}} · Changed: {{c}} · Errors: {{e}}` |
| `admin.translations.cancel` | `Cancel` |
| `admin.translations.confirm_import` | `Confirm import` |
| `admin.translations.review_title` | `Pending suggestions ({{n}})` |
| `admin.translations.approve` | `Approve` |
| `admin.translations.reject` | `Reject` |
| `admin.translations.empty_pending` | `No pending suggestions. Run an import or wait for reviewer edits.` |
| `admin.translations.err_unknown_keys` | `{{n}} unknown keys (not in app — will be skipped)` |
| `admin.translations.err_missing_columns` | `Header row is missing required columns: {{cols}}` |

NE translations to be added during implementation. HI starts as English-fallback for every key (so the runtime never returns `undefined`).

---

## 7. Local State

Most state lives in the store; per-screen state is:

| Screen | State |
|---|---|
| `index.tsx` | none |
| `import.tsx` | `phase: 'pick' \| 'preview'`, `parseResult: ImportPreview \| null` |
| `review.tsx` | `filterLang: 'all' \| 'en' \| 'ne' \| 'hi'` |

---

## 8. Behavior

| Trigger | Action |
|---|---|
| Tap `Export to Excel` | `i18nExport.exportXlsx()` → builds workbook → web: trigger anchor download; native: write to `FileSystem.documentDirectory` then call `Sharing.shareAsync`. |
| Tap `Import from Excel` | navigate to `import.tsx` |
| Pick file | `i18nImport.parse(buffer)` → preview |
| Confirm import | for each suggestion row → `translationsStore.upsertSuggestion`; set `settings.i18nLastImport`; toast + back to overview |
| Tap `Review suggestions` | navigate to `review.tsx` |
| Tap `Approve` | `translationsStore.approveSuggestion(key, lang)` → repo overrides table + i18next rebind + delete suggestion; row animates out |
| Tap `Reject` | `translationsStore.rejectSuggestion(key, lang)` → repo delete suggestion only |
| Tap `Export current JSON` | `i18nExport.exportJsonBundle()` produces 3 files zipped into one `.zip` (or 3 separate downloads on web). Used by engineering at release. |
| App boot | `i18n.init` loads bundled JSON then merges overrides table on top |

---

## 9. Data Dependencies

| Source | Reads | Writes |
|---|---|---|
| `src/translations/en.json` | read at i18n init | never written |
| `src/translations/ne.json` | read at i18n init | never written |
| `src/translations/hi.json` | read at i18n init | never written |
| `translation_overrides` | read at i18n init + on approve refresh | written on approve |
| `translation_suggestions` | review screen + import preview diff | written on import; deleted on approve / reject |
| `settings.i18nLastImport` | overview status row | written after a successful import |

`i18n.ts` exposes `applyOverridesFromDb()` (idempotent) so the boot order can be `migrate → load settings → load overrides → render`.

---

## 10. Navigation

| In | tap admin dashboard `🌐 Translations` tile | `/(admin)/translations` |
| Out | `📤 Export to Excel` tile | (no navigation — file download / share) |
| Out | `📥 Import from Excel` tile | `/(admin)/translations/import` |
| Out | `📝 Review suggestions` tile | `/(admin)/translations/review` |
| Out | `💾 Export current JSON` tile | (no navigation — file download) |
| Out | `Confirm import` button | back to `/(admin)/translations` |
| Out | review row approve/reject | row removed in place |

---

## 11. Acceptance Checklist

- [ ] Admin dashboard surfaces a `🌐 Translations` tile that opens this overview.
- [ ] Overview shows accurate `keys × 3` count and `pending` count.
- [ ] Export produces a `.xlsx` with the 8 columns described in §4. Opens in Excel / Numbers / Google Sheets without warnings.
- [ ] HI column appears in the export even though Hindi values are empty / English fallback.
- [ ] Importing the unedited export → `Added: 0 · Changed: 0 · Errors: 0`.
- [ ] Editing one Nepali cell, re-importing → exactly 1 suggestion appears in review queue under `NE`.
- [ ] Approving the suggestion: `t('thatKey')` returns the new Nepali value across every screen without an app reload (i18next live re-bind).
- [ ] Rejecting the suggestion: live value unchanged, suggestion removed from queue.
- [ ] Unknown keys in the sheet → error banner; not silently created.
- [ ] Header row mismatch → import aborts at parse with a clear error message.
- [ ] `Export current JSON` produces 3 well-formed JSON files matching what the engineer would commit to `src/translations/`.
- [ ] EN + NE + HI all render in the existing language toggle without `undefined` for any visible key.
- [ ] Migration `0007_translations` lands cleanly on a fresh DB and an existing DB.
- [ ] No new lint / typecheck warnings. All existing tests pass.

---

## 12. Intentional Deltas / Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Approve writes to | **SQLite override table** (read at i18n boot + on-approve rebind) | Admin can edit live without an app rebuild — user instruction 2026-05-18 |
| Bundled JSON as truth | Source-of-truth for shipping; SQLite layers on top | Engineering can `Export current JSON` periodically and commit back to `src/translations/*.json` so the bundled defaults catch up |
| Hindi values | Start empty (English fallback) | User: "currently add whatever hindi and eng we have" — we have none for HI, so we ship an empty HI bundle that i18next falls back through |
| Suggestions are per-key+lang | not per-row | Reviewers can suggest NE without touching HI on the same row |
| Import never deletes keys | Only adds & changes | Avoid accidental data loss from a missing row |
| Branch | `feature/i18n-export-import` (single feature, not screen-named) | Project-wide infra, not screen work |
| New deps | `xlsx` (SheetJS) + `expo-document-picker` + `expo-sharing` | All are platform-standard. **Requires user approval per CLAUDE.md "No new deps without asking"** — confirm at sign-off. |

---

## 13. Open Questions

- [ ] **Auth scope** — restricted to a single super-admin or any admin? Default: any user with `role === 'admin'`.
- [ ] **Audit trail** — should every approve/reject write a row to a `translation_audit` table? Default: defer; the override table already records `approved_by` + `approved_at`.
- [ ] **xlsx size** — at ~700 keys × 8 cols × 100 chars ≈ 560 KB. Trivial; no streaming needed.
- [ ] **Concurrent imports** — two admins importing at once is rare; last-write-wins in the suggestion table is acceptable.

---

## 14. Implementation phases (build order)

1. **Schema + repo + Hindi bundle** — migration 0007, `translations.ts` repo, ship empty `hi.json`, wire i18n override loader. App still has no UI; verified via unit test.
2. **Export utility + overview screen + dashboard tile** — minimal `index.tsx` with the 4 tiles; export works end-to-end first since it's the simplest path through the data layer.
3. **Import screen + parser + preview** — `import.tsx` and `i18nImport.ts`. Suggestions land in DB but aren't yet reviewable.
4. **Review screen + approve/reject + live rebind** — `review.tsx`, store actions, i18next `addResourceBundle` glue.
5. **Polish** — `Export current JSON`, last-imported status row, EN/NE/HI i18n keys for the admin screens themselves, acceptance test pass.

Each phase commits to `feature/i18n-export-import`; the branch merges to `main` only after the full §11 acceptance checklist is green.

---

## 15. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | Sujay + Claude | Initial draft. |
