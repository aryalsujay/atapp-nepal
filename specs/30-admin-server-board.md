---
id: 30-admin-server-board
title: Admin Server Board (Server Management)
route: /(admin)/server/board
prototype: VipassanaTeacherApp/app.html:3649–3785
status: done
related: [29-admin-server-inbox]
---

# 30 · Admin Server Board (Server Management)

The Centre Manager's "Servers" tab — per-course view of slot coverage
across all 8 service areas, with two display modes (Area List, Day
Grid). Header shows the selected course's stats in an admin-blue
banner. Every path leads to the Server Inbox (spec 29) for reviewing
volunteer applications.

> This spec was written **after** the screen was built (the build
> happened before spec 30 was drafted). Treat it as the source-of-
> truth going forward.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/server/board` (tab 6 — `PersonIcon`)             |
| **Component**    | `app/(admin)/server/board.tsx` default `AdminServerBoardScreen` |
| **Prototype**    | `AdminServerBoard` function, app.html 3649–3785             |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. State

```ts
const [selCourse, setSelCourse] = useState(0);    // index into serverCourses
const [view, setView] = useState<'list' | 'grid'>('list');
```

`days` derived from `Math.min(course.days, 11)`. Each area's filled-slot
boolean array is read from a hard-coded `FILLED` constant (v1 mock —
real implementation will pull from a `serverSlotsRepository`).

## 3. Data

Selected course from existing `serverCourses` array. Mock slot map:

```ts
const FILLED: Record<string, number[]> = {
  kitchen:  [1,1,1,1,1,0,1,1,1,0,1],
  dining:   [1,1,0,1,1,1,1,0,1,1,1],
  dhamma:   [1,0,1,1,1,1,0,1,1,1,0],
  compound: [1,1,1,0,1,1,1,1,0,1,1],
  reception:[1,1,1,1,0,0,1,1,1,1,0],
  at_assist:[1,0,1,1,1,0,0,1,1,1,1],
  manager:  [0,1,1,1,1,1,0,0,1,1,1],
  residence:[1,1,1,1,1,1,1,0,1,0,1],
};
```

## 4. Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white) padding 56/18/12                                   │
│   Server Management                  (26/800)                     │
│   Assign & approve servers per course (13/tx2 mt 2)               │
├──────────────────────────────────────────────────────────────────┤
│ Course selector (white wrapper, paddingBottom 12)                 │
│   [Shringa · Jul 7–18] [Pokhara · Jul 15–26] …  (horizontal      │
│                                                  scroll, active = │
│                                                  bl-fill chip)    │
├ Course stats banner (bll bg + bld 1px bottom border, padding ──── │
│   10/18, flex row gap 16) ────────────────────────────────────── │
│   Dhamma Shringa                              8 open (bl/14/800)  │
│   Budhanilkantha · Jul 7–18 · 10-Day          14/22 filled (10)   │
├ View toggle padding 10/18/0 ──────────────────────────────────── │
│   [☰ Area List] [⊞ Day Grid]   (bl active / cr2 inactive, flex 1) │
│ (10px spacer)                                                     │
├──────────────────────────────────────────────────────────────────┤
│ — LIST VIEW (default) —                                           │
│ ┌─ Per-area card ────────────────────────────────────────────┐   │
│ │ [🍳 40 r11 tinted tile] Kitchen        8/11 days (color)   │   │
│ │                          Cooking & cleaning… 73% covered    │   │
│ │ [1][2][3]…[11]  ← day dots (flex 1 each, h22, r5, day #)   │   │
│ │ [+ Assign Server (bl)] [View Applicants (cr2)]              │   │
│ └────────────────────────────────────────────────────────────┘   │
│ ... (one card per area in course.areas)                           │
│                                                                   │
│ — GRID VIEW (alt) —                                               │
│ ┌─ Compact table card ───────────────────────────────────────┐   │
│ │ Area    | D1  D2  D3  D4  D5  D6  D7  D8  D9  D10 D11      │   │
│ │ 🍳 Kitchen|  ✓   ✓   ✓   ✓   ✓   ○   ✓   ✓   ✓   ○   ✓     │   │
│ │ ... per area row                                            │   │
│ └────────────────────────────────────────────────────────────┘   │
│ ✓ = Filled · ○ = Open slot · Tap to assign                       │
│ [📨 Review All Server Applications]                               │
├──────────────────────────────────────────────────────────────────┤
│ [📨 Open Server Applications Inbox →]   (bl-gradient, always vis) │
│ (20px footer)                                                     │
└──────────────────────────────────────────────────────────────────┘
                ┌─ Bottom Tab Bar (visible) ─┐
```

## 5. Header

White panel, padding `56 18 12`, top inset respected.

- Title — fontSize 26, fontWeight 800, color `Colors.tx`: `"Server Management"` (English literal in both langs per prototype)
- Sub — fontSize 13, color `Colors.tx2`, marginTop 2: `"Assign & approve servers per course"` (English literal)

## 6. Course selector

White wrapper (`backgroundColor: Colors.white`, `paddingBottom: 12`).

Horizontal `ScrollView`, `contentContainerStyle: { paddingHorizontal: 18, gap: 6 }`.

Each chip:
- `paddingHorizontal: 14`, `paddingVertical: 7`, borderRadius 20, borderWidth 1.5
- fontSize 13, fontWeight 600
- Inactive: bg `Colors.white`, border `Colors.bd2`, color `Colors.tx2`
- Active: bg `Colors.bl`, border `Colors.bl`, color `Colors.white`

Label: `c.center.replace('Dhamma ', '') + ' · ' + c.dates.split(',')[0]` — e.g. `"Shringa · Jul 7–18"`.

`numberOfLines={1}` on chip text.

## 7. Course stats banner

Below selector — admin-blue tinted strip:

- `backgroundColor: Colors.bll`
- `borderBottomWidth: 1`, `borderBottomColor: Colors.bld`
- `paddingHorizontal: 18`, `paddingVertical: 10`
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 16`

Left column (`flex: 1`):
- Centre — fontSize 13.5, fontWeight 700, color `Colors.bl`
- Meta — fontSize 11, color `Colors.tx2`: `"{c.city} · {c.dates} · {c.type}"`

Right column (`align-items: flex-end`):
- Open count — fontSize 14, fontWeight 800, colour `open <= 3 ? Colors.ur : Colors.bl`: `"{open} open"` (English literal)
- Filled — fontSize 10, color `Colors.tx3`: `"{filled}/{total} filled"` (English literal)

## 8. View toggle

`paddingHorizontal: 18`, `paddingTop: 10`. Two tabs (`flex: 1`):

| Tab | Label |
|---|---|
| list | `"☰ Area List"` |
| grid | `"⊞ Day Grid"` |

Each tab:
- `paddingVertical: 9`, borderRadius 11
- fontSize 13, fontWeight 700
- Active: bg `Colors.bl`, text `Colors.white`
- Inactive: bg `Colors.cr2`, text `Colors.tx2`

Then a 10px spacer before the content.

## 9. List view

For each area in `course.areas` (filtered through `SERVICE_AREAS`):

### 9.1 Per-area card

Standard `.card`. No left-border accent.

### 9.2 Header row
`flexDirection: 'row'`, `alignItems: 'center'`, `gap: 10`, `marginBottom: 8`.

- Icon tile: 40×40 r11, bg `${a.color}22` (hex-8 ≈ 13% alpha tint of the area's brand colour), centred emoji fontSize 20
- Body (`flex: 1`):
  - Label — fontSize 14, fontWeight 700, color `Colors.tx`
  - Description — fontSize 11, color `Colors.tx2`: `a.desc`
- Right (`align-items: flex-end`):
  - `"{filledDays}/{total} days"` — fontSize 13, fontWeight 700, colour `pct < 70 ? Colors.ur : a.color`
  - `"{pct}% covered"` — fontSize 9, color `Colors.tx3`

### 9.3 Day-dot row
`flexDirection: 'row'`, `gap: 3`, `marginBottom: 8`.

11 cells (`flex: 1`):
- height 22, borderRadius 5
- Filled: bg `a.color`, text white
- Empty: bg `Colors.cr3`, text `Colors.tx3`
- Day number — fontSize 9, fontWeight 600

### 9.4 Action row
`flexDirection: 'row'`, `gap: 6`. Two buttons (`flex: 1`, `minHeight: 32`):

| Button | Style | Action |
|---|---|---|
| `+ Assign Server` | bg `Colors.bl`, white text, padding 7/10, radius 10, fontSize 12.5, weight 700 | `Alert("Coming soon")` (v1) |
| `View Applicants` | bg `Colors.cr2`, color `Colors.tx2`, same size | `router.push(Routes.adminServerInbox)` |

## 10. Grid view

`marginHorizontal: 18`. White card with overflow hidden + shadow:

### 10.1 Header row
- bg `Colors.cr3`, 1px `Colors.bd` bottom border
- Area column: `width: 90`, paddingHorizontal 8, paddingVertical 7
  - Label "Area" — fontSize 9, fontWeight 700, color `Colors.tx2`, uppercase
- 11 day columns (`flex: 1`):
  - `paddingHorizontal: 2`, `paddingVertical: 5`, centred
  - "D{n}" — fontSize 9, fontWeight 700, color `Colors.tx2`

### 10.2 Area rows
For each area in `course.areas`, 1px `bd` bottom border:

- Area column: `width: 90`, padding 7/8, flex row, gap 5
  - Emoji fontSize 14
  - First word of label — fontSize 9.5, fontWeight 600, color `Colors.tx`
- Day cells (`flex: 1`):
  - Padding 5/1, centred
  - 22×22 r5 inner cell
  - Filled: bg `a.color`, white ✓ glyph fontSize 9
  - Empty: bg `Colors.cr3`, `tx3` ○ glyph fontSize 9

### 10.3 Legend
Below the grid:
- fontSize 10, color `Colors.tx3`, marginTop 8, textAlign center
- `"✓ = Filled · ○ = Open slot · Tap to assign"`

### 10.4 Grid action button
`marginTop: 10`, full-width:
- bg `Colors.bl`, white text, paddingVertical 12, borderRadius 10
- fontSize 12.5, fontWeight 700
- Text: `"📨 Review All Server Applications"`
- onPress → `router.push(Routes.adminServerInbox)`

## 11. Always-visible footer button

Container: `paddingHorizontal: 18`, `paddingTop: 6`.

Gradient button (`Colors.bl → '#1A4A72'` at 135°):
- paddingVertical 13, borderRadius 10
- fontSize 12.5, fontWeight 700, color `Colors.white`
- Text: `"📨 Open Server Applications Inbox →"`
- onPress → `router.push(Routes.adminServerInbox)`

## 12. Footer spacer
`<View style={{ height: 20 }} />`.

## 13. Behaviour

| Trigger                          | Action                                                |
|----------------------------------|-------------------------------------------------------|
| Tap course chip                  | `setSelCourse(i)`                                     |
| Tap ☰ Area List / ⊞ Day Grid     | `setView('list' | 'grid')`                            |
| Tap `+ Assign Server`            | `Alert.alert('Coming soon')`                          |
| Tap `View Applicants`            | `router.push(Routes.adminServerInbox)`                |
| Tap `Review All Server Applications` (grid) | `router.push(Routes.adminServerInbox)`     |
| Tap `Open Server Applications Inbox →` (footer) | `router.push(Routes.adminServerInbox)` |

## 14. i18n

This screen renders **all text as English literal** (matching the prototype's hard-coded strings). No new i18n keys.

## 15. Things omitted vs prototype

| Prototype feature                | RN decision                                       |
|----------------------------------|---------------------------------------------------|
| Per-day-cell tap-to-assign (grid)| Static for v1; tap is a no-op pending the assign flow |
| Real slot occupancy              | Mock `FILLED` constant; replace with repo when SQLite slot table lands |

### 15.1 Other small details preserved

- Course chip simplification trick: `replace('Dhamma ','')` + ` · ` + `dates.split(',')[0]` — saves horizontal real estate so 5+ course chips fit on a 390-wide screen.
- Course stats banner border is `bld` (= `#BDD4EE`) not `bd2` — keeps the strip in admin-blue palette.
- Icon tile tint formula `${a.color}22` (hex-8 alpha) keeps the area's brand colour readable but soft.
- Day-dot row uses `flex: 1` per cell so the strip stretches edge-to-edge of the card regardless of card width.
- "{filled}/{total} days" colour flips to `ur` only when `pct < 70` — encourages admin attention on under-covered areas.
- All three action buttons (`+ Assign Server`, `View Applicants`, `Review All`, `Open Inbox`) collectively give 4 paths to the Server Inbox — intentional redundancy because reviewing applicants is the primary action of this screen.

## 16. Acceptance checklist

- [ ] Header: title 26/800 + sub 13/tx2
- [ ] Course selector chips with simplified labels, active = bl fill
- [ ] Stats banner: bll bg + bld border, course meta + open/filled stats with ur threshold
- [ ] View toggle: ☰ Area List / ⊞ Day Grid, active = bl, inactive = cr2
- [ ] **List view**: per-area card with tinted icon tile + filled-days count + day-dot row + 2 action buttons
- [ ] Per-area card right-side count flips to `ur` when <70% covered
- [ ] **Grid view**: compact table with Area column + D1..D11 + ✓/○ cells coloured by area
- [ ] Grid legend visible
- [ ] Grid "Review All Server Applications" full-width bl button
- [ ] Always-visible bl-gradient footer "Open Server Applications Inbox →" button
- [ ] All 4 inbox paths route to `Routes.adminServerInbox`
- [ ] Tab bar visible
- [ ] No TS errors
