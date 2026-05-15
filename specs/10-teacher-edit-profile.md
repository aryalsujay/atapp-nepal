# Spec: Teacher Edit Profile

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `10-teacher-edit-profile` |
| Route (Expo Router) | `/(teacher)/profile/edit` |
| Source file | `app/(teacher)/profile/edit.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `1585–1715` |
| Roles | `teacher` |
| Related specs | `09-teacher-profile`, `03-onboarding-teacher` |

---

## 2. Purpose

The teacher's one-stop edit screen for everything **they** control. Fields that the admin owns (name, gender, course authorizations, authorization year) are surfaced as a locked preview at the bottom so the teacher sees the full picture without being able to change it. Saving writes back through `profileStore.setProfile` (same SQLite upsert as the per-tile writes on the Profile screen).

---

## 3. Layout zones (top → bottom)

### 3.1 Compact orange hero (`linear-gradient(160deg, #6B3600, Colors.sf)`)

Smaller than the Profile screen's hero. `paddingHorizontal: 18, paddingTop: max(54, safeAreaTop + 14), paddingBottom: 18, overflow: hidden, position: relative`.

- **`LotusHero`** (white, opacity 0.07, size 170, right -25, bottom -25).
- Top row (`flexDirection: row, alignItems: center, gap: 10, marginBottom: 12, position: relative`):
  - **Back chevron tile** — 34 × 34, radius **11**, `rgba(255,255,255,0.18)` bg, 1 px `rgba(255,255,255,0.3)` border. Content: `‹` glyph at **16 / 800 / white**. Tap navigates back to `/(teacher)/profile`.
  - **Title column** (`flex: 1`):
    - Title — `Edit Profile` (`ep_title`), **21 / 800 / white**, `lineHeight: 23.1` (= 21 × 1.1).
    - Sub — `Update what only you know` (`ep_sub`), **12 / `rgba(255,255,255,0.72)`**, marginTop 2.

### 3.2 Locked notice banner (blue tint)

`paddingHorizontal: 18, paddingTop: 12, paddingBottom: 0` wrapper.

Banner: `Colors.bll` bg, 1 px `#BDD4EE` border, radius **12**, padding `10 / 12`, `flexDirection: row, gap: 10, alignItems: flex-start`.

- 🔒 emoji at **18 px** in the left column.
- Body text (flex 1): **11.5 / `Colors.tx2`**, `lineHeight: 17` (= 11.5 × 1.5).
  - EN: `Name, gender, course authorizations, and authorization year are set by your administrator. Contact your Regional Admin for changes.`
  - NE: same idea, Acharya-correct.

### 3.3 Contact (`.sph` 📞 Contact)

Card (standard `.card`). Inputs match the prototype's `.inp` class — **full bordered**, cream background, not underline-only:

- Field wrapper: `marginBottom: 13` between fields, none after the last.
- **Label** (`.ilab` style) — **11 px / 700 / `Colors.tx2`**, uppercase, letterSpacing **0.44** (`.04em × 11`), marginBottom 5.
- **Input** (`.inp` style) — `Colors.cr` background, **1.5 px** solid `Colors.bd` border, radius **12**, padding `13 / 15`, **14 px / `Colors.tx`**, fontFamily Plus Jakarta Sans. `:focus` state changes `borderColor → Colors.sf` and `backgroundColor → Colors.white` (RN equivalent: track `focused` state, override styles).
- **Phone field** → updates `profile.phone`. Auto-trim on blur. Default placeholder `+977 98XXXXXXXX`.
- **Personal email field** → updates `profile.email`. Simple regex validation on blur; inline red helper text below the input if invalid (`fontSize: 11 / Colors.ur`, marginTop 4).

Both inputs flip the `dirty` flag on change; Save enables only when dirty.

### 3.4 Teaching Languages (`.sph` 🗣 Teaching Languages)

Card body:

- Hint text: `Tap a language to cycle: Primary → Secondary → Don't teach` (11 / italic / `Colors.tx3`, marginBottom 8).
- Iterate over `profile.languages` keys. Each row tappable, cycles `primary → secondary → off → primary`:
  - Row: `flexDirection: row, alignItems: center, gap: 11, padding: 10 / 0, borderBottomWidth: 1 / Colors.bd`. Pressable with active opacity 0.85.
  - State tile — 34 × 34, radius 10, fontSize 16, fontWeight 800:
    - `primary` → `Colors.fol` bg / `Colors.fo` fg / `★` glyph
    - `secondary` → `Colors.gdl` bg / `Colors.gd` fg / `·` glyph
    - `off` → `Colors.cr2` bg / `Colors.tx3` fg / `✗` glyph
  - Language name (flex 1) — **13.5 / 600**. Colour `Colors.tx3` when off, `Colors.tx` otherwise.
  - Right chip — `★ Primary` / `Secondary` / `Don't teach`:
    - primary → `.chip.fo` (`Colors.fol` / `Colors.fo`)
    - secondary → `.chip.gd` (`Colors.gdl` / `Colors.gd`)
    - off → `.chip.gy` (`Colors.cr2` / `Colors.tx2`)
  - Chip: 11 / 600, padding 3 / 9, radius 20, margin 0.

### 3.5 Preferred Regions (`.sph` 📍 Preferred Regions)

- Hint paragraph (between header and card): `paddingHorizontal: 18, fontSize: 11, color: Colors.tx3, fontStyle: italic, marginTop: -4, marginBottom: 6`. Text — `Tap up/down to reorder · tap × to remove`.
- Card body — list of regions with reorder controls. Each row: `flexDirection: row, alignItems: center, gap: 9, padding: 9 / 0, borderBottomWidth: 1 (only when not last)`.
  - Rank tile — 24 × 24, radius 7, `Colors.sf` bg, **11 / 800 / white** number (1, 2, 3 …).
  - Region name (flex 1) — **13.5 / 600**.
  - **↑** button — 26 × 26, radius 7, `flexShrink: 0`. Disabled (greyed) when index 0: `Colors.cr2` bg, `Colors.tx3` fg. Else `Colors.cr` bg, `Colors.tx2` fg, 1 px `Colors.bd` border. fontSize 13.
  - **↓** button — same shape; disabled when last index.
  - **×** button — 26 × 26, radius 7, `Colors.url` bg / `Colors.ur` fg, 1 px `#F5C0BB` border, fontSize 13 / 800. Tap removes the region.

(No "Add region" affordance in the prototype — out of scope for v1. Removed regions can be re-added on a future "+ Add" iteration.)

### 3.6 Personal Note (`.sph` 💬 Personal Note)

Card body:

- **Multiline TextInput** (RN equivalent of `<textarea rows={5}>`). Adopts the same `.inp` styling as Contact inputs (`Colors.cr` bg, 1.5 px `Colors.bd` border, radius **12**, padding `13 / 15`, **14 px / `Colors.tx`**, fontFamily Plus Jakarta Sans). Plus multiline-specific:
  - `multiline: true`, `textAlignVertical: top`
  - `lineHeight: 21` (= 14 × 1.5)
  - `minHeight: 130` (≈ 5 × 21 line-height + 26 padding)
- Placeholder (`ep_note_ph`): `Notes for the admin (e.g. travel preferences, dietary)` — `Colors.tx3`.
- Char counter below — **10.5 px / `Colors.tx3`**, `textAlign: right`, marginTop 6. Format: `{N} chars`.

### 3.7 Locked Preview (`.sph` 🔒 Locked — `ep_locked: "Set by your center administrator"`)

Card with `Colors.cr` bg, `opacity: 0.85`, otherwise standard `.card` (radius 16, padding 15, margin 0/18/11, shadow). The opacity dims the whole card to telegraph "not editable here".

4 rows of admin-set fields:

| Key (i18n) | Value |
|---|---|
| `Full Name` (`ep_field_name`) | `profile.name` |
| `Gender` (`ep_field_gender`) | `Male AT` / `Female AT` |
| `Year Authorized` (`ep_field_year`) | `profile.authorizedSince` |
| `Course Authorizations` (`ep_field_auth`) | `{N} types` (count of `profile.authorizations`) |

Row: `flexDirection: row, justifyContent: space-between, padding: 8 / 0`. Between rows: **1 px dashed `Colors.bd` bottom-border** on rows 1–3, none on row 4. Use the same `DashedDivider` component as a sibling between rows (RN's single-side dashed border doesn't render reliably).

- **Left text** — **12 px / `Colors.tx3`**, prefixed with 🔒 emoji, `flexDirection: row, alignItems: center, gap: 5`.
- **Right text** — **12.5 px / 700 / `Colors.tx2`**.

### 3.8 Action row (Cancel + Save)

Wrapper: `paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6, flexDirection: row, gap: 9`.

Both buttons use the prototype's `.btn.sm` size modifier — **smaller than the default `.btn`**:

- Common to both: padding `7 / 15`, fontSize **12.5**, radius **10**, fontWeight 700, `width: auto`.

- **Cancel** (`.btn.ou.sm`) — `flex: 1`, transparent bg, **2 px `Colors.bd2` border**, **`Colors.tx`** text. Tap → `router.back()` (no save). If `dirty === true`, confirm via `useConfirm` ("Discard unsaved changes?") first.

- **Save Changes** (`.btn.pr.sm`) — `flex: 2`. Gradient **`linear-gradient(135deg, Colors.sf, Colors.sfd)`** (note: 135° not 160°), white text. Shadow `{ shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4 }` (= `box-shadow: 0 4px 16px rgba(212,118,14,0.32)` from the prototype).
  - Label flips to `✓ Saved` (`ep_saved`) for **900 ms** after a successful save, then `router.replace('/(teacher)/profile')`.
  - Disabled (opacity 0.5, `disabled={true}`) when `dirty === false`.

Bottom spacer: **24 px**.

---

## 4. Behaviour

- **Local edit buffer**: all 5 editable fields (phone, email, languages, regions, note) live in component state on mount, initialized from `profile`. Save copies the buffer back into the profile and calls `profileStore.setProfile`.
- **Dirty tracking**: any field change flips a `dirty` flag. Save is disabled when `!dirty`. Cancel asks for confirm when `dirty`.
- **Language cycle**: tap a row → `primary → secondary → off → primary`. Updates immediately in the buffer (not persisted until Save).
- **Region reorder**: ↑ / ↓ swap with neighbour; × removes. `dirty` flips on any change.
- **Save flow**:
  1. Write merged profile via `profileStore.setProfile` (writes to SQLite via the existing `teachersRepo.upsert`).
  2. Label flips to `✓ Saved` for 900 ms.
  3. `router.replace('/(teacher)/profile')` to return to the profile view (replace, not push, so the back button doesn't go back into the edit screen).
- **Validation**:
  - Phone: trim + accept any non-empty string (admin can format-validate later).
  - Email: simple regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Inline red helper text on blur if invalid.
- **Translations**: all visible text uses the `editProfile.*` namespace (new) — Acharya-correct Nepali.

---

## 5. Data model

No schema changes. Uses existing fields on `TeacherProfile`:

| Buffer field | Profile field |
|---|---|
| phone | `profile.phone` |
| email | `profile.email` |
| languages | `profile.languages` (record of name → level) |
| regions | `profile.preferredRegions` (string array) |
| note | `profile.personalNote` |

Read-only preview pulls from `profile.name`, `profile.gender`, `profile.authorizedSince`, `profile.authorizations.length`.

---

## 6. What's changing vs current implementation

The current `app/(teacher)/profile/edit.tsx` exists (Spec 10 had an earlier stub). The rebuild:

- Hero matches Profile's orange gradient (only smaller padding).
- Locked notice banner is new — current screen lacks it.
- Locked preview table is new — current shows nothing for admin-set fields.
- Region reorder ↑/↓ buttons match the prototype's per-row controls (current likely uses drag-handles).
- Language cycle includes the explicit "Don't teach" off state with a `✗` icon (current may not distinguish off from missing).
- `✓ Saved` label flash for 900 ms before navigating back.

---

## 7. Acceptance checklist

- [ ] Compact orange hero with back chevron + title + sub
- [ ] Blue locked-notice banner with the full explanatory copy
- [ ] Contact card with phone + email inputs (only the underline border, no full input box border)
- [ ] Languages list cycles Primary → Secondary → Don't teach with correct icon + chip per state
- [ ] Regions list shows ranks 1, 2, 3 …; ↑/↓ disabled at edges; × removes
- [ ] Personal note textarea expandable, char counter updates
- [ ] Locked preview table with 4 rows, dashed separators, name/gender/year/auth-count
- [ ] Cancel button confirms when dirty; Save disabled when not dirty
- [ ] Save writes through `profileStore.setProfile`, shows ✓ Saved for 900 ms, then `router.replace` to /profile
- [ ] All copy through `editProfile.*` i18n (en + ne, Acharya-correct)
- [ ] Typecheck clean, tests pass
