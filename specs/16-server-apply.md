---
id: 16-server-apply
title: Server Apply
route: /(server)/apply/[id]
prototype: VipassanaTeacherApp/app.html:2679–2821
status: draft
related: [15-server-course-detail, 17-server-applications, 18-server-application-detail]
---

# 16 · Server Apply

The 3-step application form the Server submits to register for a
course. Reached from "Apply to Serve →" on the course detail (spec 15)
or from "Apply" on the opportunities list (spec 14). On submit the
screen swaps to a success state with two CTAs.

---

## 1. Identity

| Property         | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/apply/[id]` (hidden from tab bar)                |
| **Component**    | `app/(server)/apply/[id].tsx` default export `ServerApplyScreen` |
| **Prototype**    | `ServerApply` function, app.html 2679–2821                  |
| **Status bar**   | `barStyle="light-content"` over the hero (dark gradient)    |
| **Param**        | `id: string` — looked up in `serverCourses` by numeric id   |

If id missing → fall back to `serverCourses[0]` (matches prototype).

## 2. State

```ts
const [selAreas, setSelAreas] = useState<string[]>([]);
const [partial, setPartial] = useState(false);          // false = full course
const [pMode, setPMode] = useState<'duration' | 'exact'>('duration');
const [duration, setDuration] = useState(5);            // # of days for flexible mode
const [startDay, setStartDay] = useState(1);
const [endDay, setEndDay] = useState(c.days);           // initial = total course days
const [period, setPeriod] = useState<'Start'|'Middle'|'End'|'Flexible'>('Flexible');
const [note, setNote] = useState('');
const [done, setDone] = useState(false);
```

Selecting/deselecting an area toggles its id in `selAreas`. Submit
button is **disabled** until `selAreas.length > 0`.

In **exact-dates** mode, tapping a day on the strip:
- `if (d <= startDay) setStartDay(d)` — picks new start
- `else setEndDay(d)` — picks new end

This is a simple "two-tap range" picker, no chip-style drag. Matches prototype line 2789.

## 3. Layout (top → bottom)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Hero (server gradient #5A3800 → #9B6B14, 160°)                       │
│   ← Back                                                              │
│   Apply to Serve                                                      │
│   Dhamma Shringa                                       (22 / 800)     │
│   Budhanilkantha, Kathmandu 🇳🇵 · Jul 7–18, 2026                       │
│   [ 8 slots open ] [ 12M + 10F ]                                      │
├───────────────────────────────────────────────────────────────────────┤
│  STEP 1 · CHOOSE SERVICE AREAS                                        │
│  [🍳 Kitchen  desc…] [🍽 Dining  desc…] [🔔 Dhamma  desc…]            │
│  (selected area uses its own brand colour; rest are white)            │
│  ✓ 2 areas selected                       (only when >0 selected)     │
│                                                                       │
│  STEP 2 · DURATION                                                    │
│  [ 🪷 Full Course  All 11 days ] [ 📅 Partial  Choose days ]          │
│  (when Partial)                                                       │
│  [ Flexible ] [ Exact Dates ]                                         │
│  Card:                                                                │
│    How many days?                                                     │
│    [3][4][5][6][7][8][9][10] (chip pills)                              │
│    Preferred period:                                                  │
│    [Start][Middle][End][Flexible]                                     │
│  — OR —                                                               │
│  Card:                                                                │
│    Select days (tap to set range)                                     │
│    [1][2][3]…[11] (30×30 day cells)                                   │
│    Day 1 → Day 5 (5 days)                                              │
│                                                                       │
│  STEP 3 · OPTIONAL NOTE                                               │
│  ┌──────── textarea (min-height 65) ──────────┐                       │
│  │ Any notes for the center manager…           │                      │
│  └─────────────────────────────────────────────┘                      │
│                                                                       │
│  [          Submit Application 🙏          ]  (gradient or disabled)  │
│  (20px footer)                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

Tab bar is **hidden** on this screen (`tabBarStyle: { display: 'none' }` in layout).

## 4. Hero

### 4.1 Gradient
- Colors `['#5A3800', '#9B6B14']`, 160°
- LotusHero `color="white" opacity={0.08} size={180}` (same as course detail, **no MountainSilhouette here** — prototype line 2706 only includes LotusHero)
- `paddingHorizontal: 18`, `paddingTop: Math.max(56, insets.top + 12)`, `paddingBottom: 22`

### 4.2 Back row
- Identical SVG arrow as course detail (`M15 18L9 12L15 6`, 18×18, strokeWidth 2.2)
- Stroke colour: `rgba(255,255,255,0.75)` (slightly dimmer than course-detail's 0.85)
- fontSize 13, color `rgba(255,255,255,0.75)`, marginBottom 13 (vs 12 on course detail), gap 4
- `t('common.back')`
- onPress → `router.back()` (returns to course detail OR opportunities list depending on entry point)

### 4.3 Title block
- Kicker — fontSize 13, color `rgba(255,255,255,0.7)`: `t('server.apply.kicker')` ("Apply to Serve" / "सेवाका लागि आवेदन")
- Title — fontSize **22** (note: 22, not 23 like course detail), fontWeight 800, color white: `c.center`
- Sub — fontSize 13, color `rgba(255,255,255,0.75)`: `"{c.city} · {c.dates}"`

### 4.4 Hero pills
Row, gap 8, marginTop 12 (vs 14 on course detail).

| Pill                | Text                                    | Style                                                              |
|---------------------|-----------------------------------------|--------------------------------------------------------------------|
| Open count          | `{open} slots open`                     | `rgba(255,255,255,0.2)` bg, white, padding `3 10` (vs 4/11 on detail), radius 20, fontSize 12, weight 600 |
| M/F                 | `{m}M + {f}F`                           | Same style                                                         |

> "slots open" is **English literal in both languages** in prototype (line 2713). NE: "खुला".

Wait — prototype `{lang==="np"?"खुला":"slots open"}`. So NE shows just "खुला" (single word), EN shows "slots open" (two words). i18n key `slots_open`.

## 5. Step 1 — Choose Service Areas

### 5.1 Section header
- Use `.sph` (fontSize 12, weight 700, uppercase, letter-spacing 0.84, color `tx2`, margins 18/18/9)
- **`marginTop: 16`** override (vs default 18 from base `sph`)
- Text: `t('server.apply.step1')` → `"Step 1 · Choose Service Areas"` / `"चरण १ · सेवा क्षेत्र छान्नुहोस्"`

### 5.2 Tile grid
Container: `paddingHorizontal: 18`, `flexDirection: 'row'`, `flexWrap: 'wrap'`, `gap: 8`.

Only render areas that exist in `c.areas` (filter `SERVICE_AREAS` by `c.areas.includes(a.id)`).

Each tile:
- `padding: 10px 12px`, `borderRadius: 13`, `minWidth: 105`, `borderWidth: 2`
- Inactive: `backgroundColor: Colors.white`, `borderColor: Colors.bd2`
- Active: `backgroundColor: sa.color`, `borderColor: sa.color` (each service area has its own brand colour, e.g. kitchen=#E8744A)

Inside the tile:
- Emoji — fontSize 18, marginBottom 3
- Label — fontSize 12, fontWeight 700, color (active: white; inactive: `Colors.tx`)
- Description preview — fontSize 9.5, lineHeight 9.5 × 1.3 ≈ 12.35, marginTop 1
  - Active text color `rgba(255,255,255,0.75)`, inactive `Colors.tx3`
  - Text: `sa.desc.substring(0, 26) + '…'` — first 26 chars + ellipsis

> **Important**: prototype only includes `sa.desc` in English. NE doesn't have a translated description. We will display the English description in both languages (matches prototype faithfully). Or — Option B — we add `desc_ne` to SERVICE_AREAS and use it. Spec defaults to A; flag for user.

### 5.3 Selected count line
Below the grid, only if `selAreas.length > 0`:
- `paddingHorizontal: 18`, `paddingTop: 8`
- fontSize 12, color `#9B6B14`, fontWeight 600
- Text: `"✓ {n} {areas_selected}"`
  - EN: `"area selected"` (singular) / `"areas selected"` (plural)
  - NE: `"क्षेत्र छानियो"` (no plural — same for any count)

Use i18next plural feature with `count`: `t('server.apply.areas_selected', { count: selAreas.length })`. Provide `areas_selected_one` and `areas_selected_other` keys for EN.

## 6. Step 2 — Duration

### 6.1 Section header
Same `.sph`, marginTop 16. Text: `t('server.apply.step2')`.

### 6.2 Full vs Partial big tiles
Container: `paddingHorizontal: 18`, `flexDirection: 'row'`, `gap: 10`, `marginBottom: 12`.

Two tiles (`flex: 1`):

| Tile      | Emoji | Label             | Sub                              |
|-----------|-------|-------------------|----------------------------------|
| Full      | 🪷    | "Full Course" / "पूरा शिविर"     | "All {c.days} days" / "सबै {c.days} दिन" |
| Partial   | 📅    | "Partial" / "आंशिक"              | "Choose days" / "दिनहरू छान्नुहोस्"      |

Each tile:
- `padding: 14`, `borderRadius: 14`, `borderWidth: 2`, `textAlign: center`
- Inactive: `backgroundColor: Colors.white`, `borderColor: Colors.bd2`
- Active: `backgroundColor: '#FBF0E0'` (Colors.svl), `borderColor: '#9B6B14'`

Inside:
- Emoji — fontSize 22, marginBottom 4
- Label — fontSize 13, fontWeight 700; active color `#9B6B14`, inactive `Colors.tx`
- Sub — fontSize 11, color `Colors.tx3`, marginTop 2

Pressing toggles `partial` boolean.

### 6.3 When `partial === true`: mode toggle

Two tabs at `paddingHorizontal: 18`, `gap: 8`, `marginBottom: 10`:

| Tab      | Label                                |
|----------|---------------------------------------|
| Flexible | "Flexible" / "लचिलो"                  |
| Exact    | "Exact Dates" / "निश्चित मिति"        |

Each tab tile:
- `flex: 1`, `padding: 9`, `borderRadius: 11`, `borderWidth: 1.5`, `textAlign: center`
- Inactive: `backgroundColor: Colors.white`, `borderColor: Colors.bd2`
- Active: `backgroundColor: '#FBF0E0'`, `borderColor: '#9B6B14'`
- Label — fontSize 12, fontWeight 700; active `#9B6B14`, inactive `Colors.tx`

Pressing sets `pMode` to `'duration'` or `'exact'`.

### 6.4 When `pMode === 'duration'`: Flexible card

Card with `margin: 0 18px 10px 18px` (no marginTop, marginBottom 10). Standard `.card` background, padding 15, radius 16, shadow.

Contents (top → bottom):
1. Title — fontSize 13, fontWeight 700, marginBottom 8: `t('server.apply.how_many')` → `"How many days?"` / `"कति दिन?"`
2. Day-count grid — `flexDirection: 'row'`, `gap: 7`, `flexWrap: 'wrap'`
   - Options: `[3, 4, 5, 6, 7, 8, 9, 10].filter(d => d <= c.days)`
   - Each cell: `width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center'`
   - Inactive: `backgroundColor: Colors.cr2`, color `Colors.tx`
   - Active: `backgroundColor: '#9B6B14'`, color white
   - Text fontSize 15, fontWeight 700
3. Period label — fontSize 11, color `Colors.tx3`, marginTop 10, marginBottom 5: `t('server.apply.pref_period')` → `"Preferred period:"` / `"मनपर्ने अवधि:"`
4. Period chip row — `flexDirection: 'row'`, `gap: 5`, `flexWrap: 'wrap'`
   - Options: `['Start', 'Middle', 'End', 'Flexible']` (rendered with translations)
   - Each chip: padding `5 11`, borderRadius 20, fontSize 11, fontWeight 600, `borderWidth: 1.5`
   - Inactive: `backgroundColor: Colors.white`, color `Colors.tx2`, `borderColor: Colors.bd2`
   - Active: `backgroundColor: '#9B6B14'`, color white, `borderColor: '#9B6B14'`

i18n: `period.start`, `period.middle`, `period.end`, `period.flexible`.

### 6.5 When `pMode === 'exact'`: Exact-dates card

Same card frame.

Contents:
1. Title — fontSize 13, fontWeight 700, marginBottom 8: `t('server.apply.select_days')` → `"Select days (tap to set range)"` / `"दिनहरू छान्नुहोस् (दायरा सेट गर्न थिच्नुहोस्)"`
2. Day grid — `flexDirection: 'row'`, `gap: 3`, `flexWrap: 'wrap'`
   - Cells: `Array.from({length: c.days}, (_, i) => i + 1)` → [1..11]
   - Each cell: `width: 30, height: 30, borderRadius: 7`, fontSize 11, fontWeight 700
   - In range (`d >= startDay && d <= endDay`): `backgroundColor: '#9B6B14'`, color white
   - Out of range: `backgroundColor: Colors.cr2`, color `Colors.tx`
3. Range summary — fontSize 11, color `#9B6B14`, marginTop 8, fontWeight 600
   - Text: `"Day {startDay} → Day {endDay} ({endDay - startDay + 1} days)"`
   - NE: `"दिन {startDay} → दिन {endDay} ({endDay - startDay + 1} दिन)"`

i18n: `day_label` ("Day" / "दिन"), `days_suffix` ("days" / "दिन") — reuse from `server.detail.days_suffix`.

## 7. Step 3 — Optional Note

### 7.1 Section header
Same `.sph`, marginTop 12 (vs 16 above — tighter to its content).

### 7.2 Textarea
- `paddingHorizontal: 18`, `paddingBottom: 0`
- `<TextInput>` multiline:
  - width 100%
  - `backgroundColor: Colors.cr`
  - `borderWidth: 1.5`, `borderColor: Colors.bd`
  - `borderRadius: 12`
  - `paddingHorizontal: 14`, `paddingVertical: 12`
  - fontSize 13, color `Colors.tx`
  - `textAlignVertical: 'top'`
  - `minHeight: 65`
  - Placeholder: `t('server.apply.note_ph')` → `"Any notes for the center manager… (optional)"` / `"केन्द्र व्यवस्थापकका लागि टिप्पणी… (वैकल्पिक)"`
  - Placeholder color `Colors.tx3`
- onChangeText → `setNote`

## 8. Submit button

### 8.1 Container
`paddingTop: 14`, `paddingBottom: 10`, `paddingHorizontal: 18`.

### 8.2 Button
- Width 100%, `paddingVertical: 15`, `borderRadius: 13`
- **Enabled** when `selAreas.length > 0`:
  - Background gradient `['#9B6B14', '#6B4610']` at 135°
  - Text color: `Colors.white`
- **Disabled** when `selAreas.length === 0`:
  - Background `Colors.cr3` (`#E5DDD0`)
  - Text color `Colors.tx3`
  - Render as plain `View` (no LinearGradient)
- Text fontSize 15, fontWeight 700
- When enabled, onPress → `setDone(true)` (prototype line 2811)
- When disabled, label changes:
  - Enabled label: `t('server.apply.submit')` → `"Submit Application 🙏"` / `"आवेदन पेश गर्नुहोस् 🙏"`
  - Disabled label: `t('server.apply.select_first')` → `"Select a service area to continue"` / `"अघि बढ्न सेवा क्षेत्र छान्नुहोस्"`

## 9. Success state (when `done === true`)

The whole screen is replaced (early return). Layout:

- Outer View: `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, `padding: 28`, `backgroundColor: Colors.cr`
- 🙏 emoji — fontSize 60, marginBottom 16
- Title — fontSize 22, fontWeight 800, color `Colors.fo`, marginBottom 8: `t('server.apply.dhanyabad')` → `"Dhanyabad!"` / `"धन्यवाद!"`
- Body 1 — fontSize 14, color `Colors.tx2`, lineHeight 22.4 (×1.6), marginBottom 6, textAlign center:
  - `t('server.apply.app_submitted')` + space + `<bold>{c.center}</bold>` + `.`
  - EN format: `"Application submitted for Dhamma Shringa."`
  - NE format: `"Dhamma Shringa का लागि आवेदन पेश भयो।"` ← word order differs; NE places center name before the phrase
  - To support both word orders, use a single template key with `{{center}}` interpolation:
    - EN: `"Application submitted for {{center}}."`
    - NE: `"{{center}} का लागि आवेदन पेश भयो।"`
- Body 2 — fontSize 13, color `Colors.tx3`, marginBottom 28, textAlign center: `t('server.apply.review_msg')` → full review-message string
- Two stacked CTAs:
  - **View My Applications** — `.btn.fo-btn` reskinned with server gradient: gradient `['#9B6B14', '#6B4610']` at 135°, width 100%, paddingVertical 15, borderRadius 13, fontSize 15, weight 700, white text. onPress → `router.replace(Routes.serverApplications)`.
  - Gap 10
  - **Back to Dashboard** — `.btn.ou` outline: transparent background, `borderWidth: 2`, `borderColor: Colors.bd2`, color `Colors.tx`, paddingVertical 13, fontSize 14, weight 700, width 100%, borderRadius 13. onPress → `router.replace(Routes.serverHome)`.

> The prototype uses `nav("serverApps")` and `nav("serverDash")` which navigate without history. We use `router.replace` so the user can't "go back" into the form they just submitted.

## 10. Hide bottom tab bar

Add to `app/(server)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="apply/[id]"
  options={{ href: null, tabBarStyle: { display: 'none' } }}
/>
```
(Existing entry has `href: null` only — we add `tabBarStyle: { display: 'none' }`.)

## 11. i18n keys

New block under `server.apply.*`:

| Key                          | EN                                                      | NE                                                  |
|------------------------------|---------------------------------------------------------|------------------------------------------------------|
| `kicker`                     | Apply to Serve                                          | सेवाका लागि आवेदन                                    |
| `slots_open`                 | slots open                                              | खुला                                                 |
| `step1`                      | Step 1 · Choose Service Areas                           | चरण १ · सेवा क्षेत्र छान्नुहोस्                       |
| `step2`                      | Step 2 · Duration                                       | चरण २ · अवधि                                          |
| `step3`                      | Step 3 · Optional Note                                  | चरण ३ · वैकल्पिक टिप्पणी                              |
| `full_course`                | Full Course                                             | पूरा शिविर                                            |
| `full_course_sub`            | All {{days}} days                                       | सबै {{days}} दिन                                      |
| `partial`                    | Partial                                                 | आंशिक                                                 |
| `choose_days`                | Choose days                                             | दिनहरू छान्नुहोस्                                     |
| `flexible`                   | Flexible                                                | लचिलो                                                 |
| `exact`                      | Exact Dates                                             | निश्चित मिति                                          |
| `how_many`                   | How many days?                                          | कति दिन?                                              |
| `pref_period`                | Preferred period:                                       | मनपर्ने अवधि:                                         |
| `period.start`               | Start                                                   | सुरु                                                  |
| `period.middle`              | Middle                                                  | बीच                                                   |
| `period.end`                 | End                                                     | अन्त्य                                                |
| `period.flexible`            | Flexible                                                | लचिलो                                                 |
| `select_days`                | Select days (tap to set range)                          | दिनहरू छान्नुहोस् (दायरा सेट गर्न थिच्नुहोस्)           |
| `day_label`                  | Day                                                     | दिन                                                   |
| `note_ph`                    | Any notes for the center manager… (optional)            | केन्द्र व्यवस्थापकका लागि टिप्पणी… (वैकल्पिक)         |
| `submit`                     | Submit Application 🙏                                    | आवेदन पेश गर्नुहोस् 🙏                                |
| `select_first`               | Select a service area to continue                       | अघि बढ्न सेवा क्षेत्र छान्नुहोस्                       |
| `areas_selected_one`         | ✓ {{count}} area selected                               | ✓ {{count}} क्षेत्र छानियो                            |
| `areas_selected_other`       | ✓ {{count}} areas selected                              | ✓ {{count}} क्षेत्र छानियो                            |
| `dhanyabad`                  | Dhanyabad!                                              | धन्यवाद!                                              |
| `app_submitted`              | Application submitted for {{center}}.                   | {{center}} का लागि आवेदन पेश भयो।                     |
| `review_msg`                 | The center manager will review and confirm. May your service bring peace and merit. 🌿 | केन्द्र व्यवस्थापकले समीक्षा गरी पुष्टि गर्नेछन्। तपाईंको सेवाले शान्ति र पुण्य ल्याओस्। 🌿 |
| `view_apps`                  | View My Applications                                    | मेरा आवेदनहरू हेर्नुहोस्                              |
| `back_dash`                  | Back to Dashboard                                       | ड्यासबोर्डमा फर्कनुहोस्                               |

Reuse: `common.back`, `server.detail.days_suffix` (where applicable — but `day_label` is its own key here).

## 12. Behaviour

| Trigger                            | Action                                                            |
|------------------------------------|-------------------------------------------------------------------|
| Tap back                           | `router.back()`                                                   |
| Tap service-area tile              | Toggle `selAreas`                                                 |
| Tap Full/Partial                   | Set `partial`                                                     |
| Tap Flexible/Exact tab             | Set `pMode`                                                       |
| Tap day-count cell                 | Set `duration`                                                    |
| Tap period chip                    | Set `period`                                                      |
| Tap day cell (exact mode)          | If `d <= startDay`, setStartDay(d); else setEndDay(d)             |
| Edit note textarea                 | `setNote`                                                         |
| Tap Submit (enabled)               | `setDone(true)`                                                   |
| Tap View My Applications (success) | `router.replace(Routes.serverApplications)`                       |
| Tap Back to Dashboard (success)    | `router.replace(Routes.serverHome)`                               |

**No persistence yet** — submission is in-memory `done` state. Wiring to a real `applicationsStore` write is out of scope for this spec.

## 13. Things being omitted vs prototype

| Prototype style                   | RN decision                                                |
|-----------------------------------|------------------------------------------------------------|
| `cursor: 'pointer'`               | TouchableOpacity activeOpacity                              |
| `transition: 'all .15s'`          | No animated transitions — instant state change            |
| `<textarea resize: 'none'>`       | `TextInput multiline textAlignVertical='top'`              |
| `:active { transform: scale(.96) }`| Skip; rely on opacity feedback                            |
| `sa.desc` truncation              | Keep prototype's English-only desc; no NE description     |

### 13.1 Other small details to preserve

- The middle-dot `·` separators in step headers and the hero sub-line are U+00B7 (not `•`).
- Hero pill padding is `3 10` (smaller than detail screen's `4 11`) — keep this difference.
- Title is **22** (not 23). Hero `marginBottom` on back row is **13** (not 12).
- Service-area tile uses each area's `.color` as the active bg (not the saffron `#9B6B14`). Each area's brand colour: kitchen #E8744A, dining #D4A020, dhamma #7B5EA6, compound #4A7A58, reception #2A6496, at_assist #8B4A00, manager #5A3A8A, residence #3A7A6A.
- `minWidth: 105` on service tiles allows ~3 per row on a 390px-wide phone (with 36px horizontal padding + 8px gap × 2). On smaller phones it wraps to 2 per row — intentional.
- Day-count cells are **42×42** (vs 30×30 for the exact-date strip). Don't conflate.
- The exact-date strip uses `gap: 3` (very tight) so 11 cells fit comfortably across.
- Range summary `"Day 1 → Day 5 (5 days)"` — the arrow is U+2192 (right arrow), not `->`.
- Disabled submit text and gradient are mutually exclusive: render disabled state as a plain `View`, not a `LinearGradient` with grey colors (cleaner DOM, no useless gradient calc).
- Success screen has the **forest green** title color (`Colors.fo`), not the server saffron — visual cue of completion / approval-feel.
- Success screen CTAs are stacked vertically (not side-by-side). The gradient one comes first, outline below.

## 14. Acceptance checklist

### Hero
- [ ] 2-stop gradient `#5A3800 → #9B6B14`, 160°
- [ ] LotusHero only (no MountainSilhouette)
- [ ] Back row strokeWidth 2.2 / color `rgba(255,255,255,0.75)` / marginBottom 13
- [ ] Kicker "Apply to Serve" / "सेवाका लागि आवेदन"
- [ ] Title fontSize **22** (not 23)
- [ ] Sub `{c.city} · {c.dates}` separator is U+00B7
- [ ] Pills padding `3 10` with `{open} slots open` (English literal) and `MM + FF`

### Step 1
- [ ] `sph` marginTop 16
- [ ] Tiles `minWidth: 105`, `gap: 8`, padding `10 12`, radius 13, borderWidth 2
- [ ] Tile active bg uses each area's brand color (kitchen orange, etc.)
- [ ] Tile description truncated to 26 chars + `…` (English in both langs)
- [ ] Selected count line only renders when count > 0, with `✓` prefix and plural-aware text

### Step 2
- [ ] Full/Partial big tiles `flex: 1`, padding 14, radius 14, gap 10
- [ ] Active state: `Colors.svl` bg, `#9B6B14` border + text
- [ ] When Partial: Flexible/Exact tabs (padding 9, radius 11, fontSize 12)
- [ ] Flexible card: day-count grid (42×42 cells, fontSize 15), period chips (padding 5,11)
- [ ] Exact card: day strip (30×30 cells, fontSize 11, gap 3), range summary "Day X → Day Y (N days)" with U+2192

### Step 3
- [ ] `sph` marginTop **12** (tighter)
- [ ] TextInput multiline, `Colors.cr` bg, 1.5px `Colors.bd` border, radius 12, minHeight 65, placeholder color `Colors.tx3`

### Submit
- [ ] Disabled when `selAreas.length === 0`: `Colors.cr3` bg, `Colors.tx3` text, label = "Select a service area to continue"
- [ ] Enabled: gradient `#9B6B14 → #6B4610`, white text, label = "Submit Application 🙏"
- [ ] Tap when enabled → success screen

### Success screen
- [ ] Centered layout, 🙏 60px, title 22/800 forest green
- [ ] Body 1 interpolates `{{center}}` (different word order in NE)
- [ ] Body 2 review message, color `tx3`
- [ ] Stacked CTAs: gradient "View My Applications" + outlined "Back to Dashboard"
- [ ] CTAs use `router.replace` (no back-history into form)

### Cross-cutting
- [ ] Tab bar hidden on this screen
- [ ] Status bar `light-content`
- [ ] No TypeScript errors
- [ ] No runtime warning about controlled vs uncontrolled TextInput
