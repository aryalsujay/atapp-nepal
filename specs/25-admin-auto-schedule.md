---
id: 25-admin-auto-schedule
title: Admin Auto-Schedule
route: /(admin)/schedule
prototype: VipassanaTeacherApp/app.html:2291–2427
status: draft
related: [21-admin-dashboard, 22-admin-inbox, 24-admin-directory]
---

# 25 · Admin Auto-Schedule

The Centre Manager's "Auto-Schedule" view — shows the system's
automatically-generated quarterly draft pairing each course with a
best-match AT, surfaces confidence levels (high / review / none), and
lets the admin override individual assignments via a modal.

Two CTAs at the bottom: **⚡ Re-generate** (regenerates the draft —
v1 no-op) and **✓ Finalize & Notify** (locks the draft and emails the
teachers).

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/schedule` (tab 5 — `LightningIcon`)              |
| **Component**    | `app/(admin)/schedule.tsx` default `AdminScheduleScreen`   |
| **Prototype**    | `AdminAuto` function, app.html 2291–2427                    |
| **Status bar**   | `barStyle="light-content"` (dark forest hero)              |

## 2. Data

Hard-coded for v1.

### 2.1 Available teachers (override pool)
```ts
const AVAILABLE_TEACHERS = [
  { name: 'Bhikkhu Ananda',    match: 97, langs: 'English, Hindi, Nepali' },
  { name: 'Kamala Gurung',     match: 91, langs: 'Nepali, English' },
  { name: 'Asha Mehta',        match: 94, langs: 'English, Nepali' },
  { name: 'Ram Prasad Sharma', match: 87, langs: 'Nepali, Hindi' },
  { name: 'Gopal Thapa',       match: 76, langs: 'Nepali, English' },
  { name: 'Priya Nair',        match: 88, langs: 'Hindi, Kannada' },
  { name: 'Hans Weber',        match: 82, langs: 'German, English' },
];
```

### 2.2 Draft assignments
```ts
type Confidence = 'high' | 'review' | 'none';
const DRAFT = [
  { center: 'Dhamma Shringa, Kathmandu 🇳🇵', dates: 'Jul 7–18',  type: '10-Day', teacher: 'Bhikkhu Ananda',    score: 97, conf: 'high',   note: '' },
  { center: 'Dhamma Pokhara 🇳🇵',            dates: 'Jul 15–26', type: '10-Day', teacher: 'Kamala Gurung',     score: 91, conf: 'high',   note: '' },
  { center: 'Dhamma Adhara, Kathmandu 🇳🇵',  dates: 'Aug 2–13',  type: '10-Day', teacher: 'Asha Mehta',        score: 89, conf: 'high',   note: '' },
  { center: 'Dhamma Janani, Lumbini 🇳🇵',    dates: 'Aug 20–31', type: '10-Day', teacher: 'Ram Prasad Sharma', score: 87, conf: 'review', note: 'First time at Dhamma Janani' },
  { center: 'Dhamma Shringa, Kathmandu 🇳🇵', dates: 'Nov 1–21',  type: '20-Day', teacher: 'Gopal Thapa',       score: 76, conf: 'review', note: '20-Day needs senior oversight' },
  { center: 'Dhamma Shringa, Kathmandu 🇳🇵', dates: 'Dec 1–30',  type: '30-Day', teacher: null,                score: 0,  conf: 'none',   note: 'No authorized 30-Day AT yet' },
];
```

## 3. State

```ts
const [finalized, setFinalized] = useState(false);
const [overrideCourse, setOverrideCourse] = useState<DraftRow | null>(null);
const [selectedTeacher, setSelectedTeacher] = useState('');
const [reason, setReason] = useState('');
```

Opening the modal stages the row + clears teacher/reason. Confirming applies the override (local state for v1).

## 4. Confidence palette

```ts
const CONF_BORDER = { high: Colors.fo, review: Colors.sf, none: Colors.ur };
const CONF_BG     = { high: Colors.fol, review: Colors.sfl, none: Colors.url };
const CONF_LABEL  = { high: '✓ High', review: '⚠ Review', none: '✗ None' };
```

## 5. Hero

### 5.1 Gradient
2-stop **auto-schedule forest gradient** `['#1C4228', Colors.fo]` at 160°. Already exists as `Gradients.autoSchedule`.

### 5.2 Padding & decorations
- `paddingHorizontal: 18`, `paddingTop: Math.max(56, insets.top + 12)`, `paddingBottom: 22`
- `position: relative`, `overflow: hidden`
- `<LotusHero color="white" opacity={0.08} size={210} />` — note **opacity 0.08** (vs 0.07 on other admin heroes) and **size 210**
- **No MountainSilhouette** here

### 5.3 Back link
- Row, gap 4, marginBottom 13
- SVG back arrow 18×18 strokeWidth 2.2, stroke `rgba(255,255,255,0.72)`
- Label: literal `"Dashboard"` (English in both langs per prototype line 2321)
- Tap → `router.back()`

### 5.4 Title block
- Title — fontSize **22**, fontWeight 800, color white: `t('admin.schedule.title')` ("Auto-Schedule Draft" / "स्वत: तालिका मस्यौदा")
- Sub — fontSize 13, color `rgba(255,255,255,0.7)`: hard-coded literal `"Q3 2026 · Jul – Sep · Apr 24"`

### 5.5 Stats row
`flexDirection: 'row'`, `gap: 8`, `marginTop: 14`.

Three chips (`flex: 1`):
| Property            | Value                                                     |
|---------------------|----------------------------------------------------------|
| backgroundColor     | `rgba(255,255,255,0.14)`                                |
| borderRadius        | 13                                                       |
| paddingHorizontal   | 6                                                        |
| paddingVertical     | 9                                                        |

Stats data (hard-coded per prototype line 2325):
| n     | label         | text colour       |
|-------|---------------|--------------------|
| `5/6` | Assigned      | `Colors.white`     |
| `3`   | Review        | `#FFD580` (warm tan — inline literal) |
| `1`   | Unscheduled   | `#FFB3AE` (coral — inline literal)    |

Inner:
- Number — fontSize 17, fontWeight 800, color per chip
- Label — fontSize 9.5, color `rgba(255,255,255,0.65)`, marginTop 1 — English literal

## 6. Matching criteria

### 6.1 Container
Below hero. `paddingHorizontal: 18`, `paddingTop: 12`, `paddingBottom: 0`.

### 6.2 Small label
- fontSize 11, fontWeight 700, color `Colors.tx2`, marginBottom 5
- `textTransform: 'uppercase'`, `letterSpacing: 0.55`
- Text: `t('admin.schedule.criteria')` ("Matching criteria" / "मिलान मानदण्ड")

### 6.3 Chip row
`flexDirection: 'row'`, `flexWrap: 'wrap'`, `gap: 5`.

Eight chips using `.chip.fo` (`Colors.fol` bg + `Colors.fo` text). Override fontSize to **10.5** (prototype line 2335). Padding 3/9 (base), borderRadius 20.

Labels (English literal, no NE translation per prototype):
```
['Language', 'Location', 'Availability', 'Festival blocks',
 'Rest gap', 'Course type', 'Gender', 'Travel distance']
```

## 7. Draft Assignments section

### 7.1 Section header
`.sph` → `"Draft Assignments"` / `"मस्यौदा असाइनमेन्टहरू"`. i18n key `admin.schedule.draft_assignments`.

### 7.2 Card per draft row

Standard `.card` with `borderLeftWidth: 4` and `borderLeftColor: CONF_BORDER[r.conf]`.

#### 7.2.1 Top row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, marginBottom 7.

Left (`flex: 1`, paddingRight 8):
- Type — fontSize 14, fontWeight 700, color `Colors.tx`: `r.type`
- Centre — fontSize 12.5, color `Colors.tx2`: `r.center`
- Dates — fontSize 11, color `Colors.tx3`, marginTop 1: `📅 {r.dates}`

Right — confidence pill (`flexShrink: 0`):
- bg `CONF_BG[r.conf]`, color `CONF_BORDER[r.conf]`
- paddingHorizontal 10, paddingVertical 3, borderRadius 20
- fontSize 11, fontWeight 700
- Text: `CONF_LABEL[r.conf]` (English literal — `✓ High` / `⚠ Review` / `✗ None`)

#### 7.2.2 Body — two variants

**A. Teacher assigned** (`r.teacher !== null`):

Inset row with cream background:
- bg `Colors.cr`, borderRadius 10, paddingHorizontal 10, paddingVertical 8
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`

Contents:
- Avatar (`.avatar`): width 30, height 30, fontSize 13, bg `Colors.sfm`, color `Colors.sfd`, weight 700, r15
- Body (`flex: 1`):
  - Name — fontSize 13, fontWeight 600, color `Colors.tx`: `r.teacher`
  - Review-note (only when `conf === 'review'`) — fontSize 10.5, color `Colors.sf`, marginTop 1: `⚠ {r.note}`
- Match badge (`.mbadge`): same 3-tier hi/md/lo as dashboard. fontSize 12, weight 700, padding 3/10, radius 20.
- "Change" button (`.btn.ou.sm` inline override):
  - bg transparent, 2px `Colors.bd2` border, color `Colors.tx`
  - paddingHorizontal 10, paddingVertical 5, borderRadius 10
  - fontSize 11, fontWeight 700
  - Text: `"Change"` (English literal)
  - onPress → opens override modal staged with this row

**B. No teacher** (`r.teacher === null`):

Banner with urgent-light background:
- bg `Colors.url`, borderRadius 10, paddingHorizontal 11, paddingVertical 8

Contents:
- Notice — fontSize 12, fontWeight 600, color `Colors.ur`, marginBottom 5: `"⚠ Unassigned — {r.note}"`
- "Assign Manually" button (`.btn.pr.sm` full width):
  - Saffron gradient `Gradients.primaryCta`
  - paddingVertical 7, paddingHorizontal 15, borderRadius 10
  - fontSize 12.5, fontWeight 700, color white
  - Width 100%
  - Text: `"Assign Manually"` (English literal)
  - onPress → opens override modal

## 8. Footer action row

Container: `paddingHorizontal: 18`, `paddingTop: 8`, `paddingBottom: 0`. `flexDirection: 'row'`, `gap: 9`.

Two buttons (`flex: 1`):

| Button                | Style                                                                                   | Action                              |
|-----------------------|-----------------------------------------------------------------------------------------|-------------------------------------|
| ⚡ Re-generate       | `.btn.ou`: transparent bg, 2px `Colors.bd2` border, color `Colors.tx`, paddingVertical 13, borderRadius 13, fontSize 14, weight 700 | v1 no-op (could add Alert "coming soon"); future regenerates the draft |
| ✓ Finalize & Notify  | `.btn.fo-btn`: forest gradient `Gradients.forestCta`, white text, padding 13, fontSize 14, weight 700, borderRadius 13 | `setFinalized(true)`                |

When `finalized === true`, the finalize button text becomes `"✅ Notified!"` (the prototype swaps in-place).

## 9. Finalized confirmation card

When `finalized === true`, render below the action row:

- `margin: '10px 18px'`, bg `Colors.fol`, borderRadius 12, padding 14, `alignItems: 'center'`
- 🎯 Glyph fontSize 24, marginBottom 5: `'✅'`
- Title — fontSize 15, fontWeight 700, color `Colors.fo`: `"Schedule Finalized!"` (English literal)
- Body — fontSize 12.5, color `Colors.tx2`, marginTop 3, textAlign center: `"All teachers notified. Sadhu! 🙏"` (English literal)

## 10. Override modal

When `overrideCourse !== null`, render a centred modal overlay.

### 10.1 Overlay
- `position: 'absolute'`, `inset: 0`, `zIndex: 200`
- `backgroundColor: rgba(0,0,0,0.5)` (backdrop)
- Tap backdrop → `setOverrideCourse(null)`

In RN, achieved via a `<Modal>` from react-native with `transparent`, `animationType="fade"`, `onRequestClose={() => setOverrideCourse(null)}`.

### 10.2 Card
- `width: 340`, `maxWidth: '90%'`, `padding: 18`
- bg `Colors.white`, borderRadius 16, shadow

#### 10.2.1 Title
- fontSize 16, fontWeight 700, marginBottom 12, color `Colors.tx`
- Text: `overrideCourse.teacher ? 'Change Teacher' : 'Assign Teacher'`

#### 10.2.2 Course summary tile
- bg `Colors.cr`, borderRadius 10, padding 10, marginBottom 14
- Type — fontSize 13, fontWeight 600, color `Colors.tx`
- Centre — fontSize 12, color `Colors.tx2`
- Dates — fontSize 11, color `Colors.tx3`: `📅 {overrideCourse.dates}`
- (only if has teacher) Current line — fontSize 11, color `Colors.tx3`, marginTop 4: `"Current: <bold>{teacher}</bold> ({score}%)"`

#### 10.2.3 Teacher select
Label — fontSize 11, color `Colors.tx2`, marginBottom 5: `"Select Teacher:"` (literal)

Native picker. Use `@react-native-picker/picker` (already in `package.json`? Check). If not present, use a simple list-button that opens a sub-modal, or render the 7 teachers as a vertical list inside the modal.

**Decision**: simplest — render a vertical list of tappable rows below the label (one row per `AVAILABLE_TEACHERS`). Active selection has a saffron-tinted bg + checkmark.

Each teacher row:
- paddingHorizontal 12, paddingVertical 10, borderRadius 10
- bg `selectedTeacher === t.name ? Colors.sfl : Colors.cr`
- 2px border, `Colors.sf` if selected else `Colors.bd`
- Inner: fontSize 12, weight 600 if selected, color tx, plus subtitle 10.5/tx3 "{t.match}% · {t.langs}"

#### 10.2.4 Reason select
Same vertical-list approach. 5 options:
- `"Better language/location match"`
- `"Rest gap concern"`
- `"Teacher request"`
- `"Experience at center"`
- `"Other"`

For v1, simplest: vertical list with single selection. Or skip entirely if user prefers minimal modal.

**Decision flag**: implement Teacher select as vertical list. Reason select as a single TextInput note for v1 (saves modal height, common note pattern).

#### 10.2.5 Button row
`flexDirection: 'row'`, `gap: 10`. Two buttons (`flex: 1`):

| Button   | Style                                                                | Action                       |
|----------|----------------------------------------------------------------------|------------------------------|
| Cancel   | `.btn.ou`: transparent, 2px bd2 border, color tx, padding 13, fontSize 14, weight 700, radius 13 | `setOverrideCourse(null)`    |
| Confirm  | `.btn.pr`: saffron gradient, white text, same padding              | Apply override + close modal |

Confirm button disabled (`opacity: 0.5`, no-op) when `selectedTeacher === ''`.

On confirm: for v1, just close the modal and show an Alert acknowledging the change. Backend write deferred.

## 11. Behaviour

| Trigger                          | Action                                                        |
|----------------------------------|---------------------------------------------------------------|
| Tap Back                          | `router.back()`                                              |
| Tap Change / Assign Manually      | Stage `overrideCourse` + clear selection                     |
| Tap teacher row (in modal)        | `setSelectedTeacher(name)`                                   |
| Tap Cancel (modal)                | `setOverrideCourse(null)`                                    |
| Tap Confirm (modal, with selection) | `Alert` confirming "{action} {name} for {center}", close   |
| Tap Re-generate                   | Alert "coming soon"                                          |
| Tap Finalize & Notify             | `setFinalized(true)` — swaps button label, shows banner      |

## 12. i18n

New block under `admin.schedule.*`:

| Key                     | EN                      | NE                                     |
|-------------------------|-------------------------|----------------------------------------|
| `title`                 | Auto-Schedule Draft     | स्वत: तालिका मस्यौदा                   |
| `criteria`              | Matching criteria       | मिलान मानदण्ड                          |
| `draft_assignments`     | Draft Assignments       | मस्यौदा असाइनमेन्टहरू                  |

Hard-coded English literals (per prototype):
- `"Dashboard"` back-link label
- `"Q3 2026 · Jul – Sep · Apr 24"` hero sub
- Stat labels: `"Assigned"`, `"Review"`, `"Unscheduled"`
- Criteria chip labels (all 8)
- Confidence labels: `✓ High`, `⚠ Review`, `✗ None`
- `"⚠ Unassigned — {note}"`
- Button labels: `"Change"`, `"Assign Manually"`, `"⚡ Re-generate"`, `"✓ Finalize & Notify"`, `"✅ Notified!"`
- Finalized banner: `"Schedule Finalized!"`, `"All teachers notified. Sadhu! 🙏"`
- Modal: `"Change Teacher"`, `"Assign Teacher"`, `"Current:"`, `"Select Teacher:"`, `"Cancel"`, `"Confirm"`
- Reason options

Reuse: `common.coming_soon` for Re-generate.

## 13. Things being omitted vs prototype

| Prototype feature              | RN decision                                                    |
|--------------------------------|----------------------------------------------------------------|
| `<select>` dropdowns           | Use vertical-list selection inside the modal (more native feel) |
| `position: fixed` modal        | RN `<Modal>` component                                          |
| Reason-code semantic strings   | v1 keeps the 5 prototype strings as the modal options          |
| Re-generate flow               | v1 no-op (Alert)                                                |

### 13.1 Other small details to preserve

- Hero gradient is **forest** (`#1C4228 → fo`), distinct from admin's navy and review's blue. Auto-Schedule is "the engine that picks teachers" — green = positive system action.
- Hero LotusHero size **210** (between dashboard's 220 and detail's 200) and opacity **0.08** (vs 0.07 elsewhere on admin).
- Back-link label is the literal word "Dashboard" — no localized translation in prototype. **English literal** matches.
- Hero sub `"Q3 2026 · Jul – Sep · Apr 24"` ties three pieces with U+00B7 — "quarter · range · generation date".
- Stat chips here are slightly different from inbox / dashboard — padding `9 6` (tighter horizontal) and `flex: 1`. Number colour varies (white / warm tan / coral).
- The **`#FFD580` warm tan** and **`#FFB3AE` coral** are inline literals (not tokens) — same coral as dashboard's "Unscheduled" stat.
- Confidence palette is consistent across border / pill bg / pill text: high=forest, review=saffron, none=urgent.
- Confidence pill at fontSize **11** (smaller than inbox's 11.5) because the card already shows type/centre/dates above.
- Assigned-teacher inset (`cr` bg, r10) uses a **smaller avatar** (30 vs cards' 36-44) — reflects that this is a sub-component within the card.
- Review-note (`⚠ {note}`) only renders when conf=review — fontSize 10.5/sf. Same warning saffron used elsewhere.
- "Change" button is intentionally **small + outline** — it's a tertiary affordance; the card's primary status is the confidence pill.
- "Assign Manually" button is **primary** (saffron-gradient, full-width) because it's the only path forward for an unassigned course.
- Finalize button **swaps label** on click (`✓ Finalize & Notify` → `✅ Notified!`) — no separate disabled state; the swap signals state change.
- The finalized banner sits **inside the scroll**, not as a sticky overlay. Tap away to dismiss not implemented (it persists for the session).
- Override modal teacher list is sorted by **declaration order** in `AVAILABLE_TEACHERS`. No client-side sort by match score — admin sees the system's preference order.

## 14. Acceptance checklist

### Hero
- [ ] Forest gradient `#1C4228 → fo`, 160°
- [ ] LotusHero size 210 opacity 0.08, no Mountain
- [ ] Back link with literal "Dashboard"
- [ ] Title "Auto-Schedule Draft" 22/800, sub "Q3 2026 · Jul – Sep · Apr 24"
- [ ] 3 stats: 5/6 Assigned (white), 3 Review (#FFD580), 1 Unscheduled (#FFB3AE)

### Matching criteria
- [ ] Small uppercase label "Matching criteria" 11/700/tx2 with letter-spacing 0.55
- [ ] 8 chip-fo at fontSize 10.5

### Draft cards
- [ ] 4px left border by conf (fo/sf/ur)
- [ ] Top row: type 14/700, center 12.5/tx2, dates 11/tx3, confidence pill right (11/700, bg/color per conf)
- [ ] Teacher-assigned row: cr bg r10, 30×30 avatar (sfm/sfd), name 13/600, ⚠ note 10.5/sf when conf=review, mbadge, Change outline btn (11/700/bd2)
- [ ] Unassigned row: url bg r10, ⚠ message + saffron-gradient Assign Manually btn full-width

### Footer actions
- [ ] ⚡ Re-generate (outline) + ✓ Finalize & Notify (forest gradient)
- [ ] Finalize swaps to "✅ Notified!" + shows confirmation card (fol bg, ✅ 24, title 15/700/fo, body 12.5/tx2)

### Override modal
- [ ] Centred 340-wide card with title (Change/Assign Teacher), summary tile, vertical teacher list (sfl bg + sf border when selected), reason list, Cancel/Confirm
- [ ] Confirm disabled at 0.5 opacity until a teacher is selected

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors

---

## Implementation notes (post-build corrections)

- **Matching criteria chips render 4-per-row** via `width: '22.7%'` + `gap: 5` on each chip (with `numberOfLines={1}` so "Travel distance" stays single-line). Prototype's `flexWrap: 'wrap'` produced unreliable 3-per-row.
- **Override modal uses dropdown-style selects** instead of always-visible vertical lists. Pattern: single-line button (`"Choose a teacher… ▾"`) that toggles a bordered expansion below. Mutually exclusive via `expandedField` state. Chevron rotates 180° when open. Closer to the prototype's native `<select>` UX.
- **Footer Re-generate + Finalize buttons normalised** to identical padding (`13/22`) and fontSize 14, even though prototype's CSS would render them at slightly different heights (`.btn.ou` 13/14 vs `.btn.fo-btn` 15/15).
- Re-generate button is a v1 no-op (`coming_soon` Alert).
- Reason field is a vertical-list select with the 5 prototype options.
