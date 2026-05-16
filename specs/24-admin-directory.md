---
id: 24-admin-directory
title: Admin Directory (Teachers)
route: /(admin)/directory
prototype: VipassanaTeacherApp/app.html:2115–2206
status: draft
related: [21-admin-dashboard, 22-admin-inbox, 23-admin-review]
---

# 24 · Admin Directory

The Centre Manager's "Teachers" tab — searchable, language-filterable
list of every AT in the system. Each card shows availability, gender,
languages, course-type authorisations, total courses taught, and two
action buttons: View Profile (→ admin review) and 📨 Assign to Course
(opens course-pick sheet).

A small "Add Teacher" button in the header opens a multi-step invite
sheet. For v1 the **Add Teacher sheet** and **Assign-to-Course sheet**
are deferred to follow-up specs; this spec covers the **list + search
+ filter + buttons-as-placeholders** layer.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/directory` (tab 3 — `PeopleIcon`)                |
| **Component**    | `app/(admin)/directory.tsx` default `AdminDirectoryScreen` |
| **Prototype**    | `AdminDir` function, app.html 2115–2206                     |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. Data

Hard-coded directory list of 6 ATs (matches prototype line 2122–2129):

```ts
const TEACHERS = [
  {
    name: 'Bhikkhu Ananda',
    gender: 'M',
    langs: ['Nepali', 'English', 'Hindi'],
    regions: ['Kathmandu', 'Pokhara', 'Lumbini'],
    types: '10-Day, Satip., 20-Day',
    total: 47,
    avail: true,
    flag: '🇳🇵',
  },
  { name: 'Asha Mehta', gender: 'F', langs: ['Nepali', 'English'], regions: ['Kathmandu'], types: '10-Day, Satip.', total: 23, avail: true, flag: '🇳🇵' },
  { name: 'Ram Prasad Sharma', gender: 'M', langs: ['Nepali', 'Hindi'], regions: ['Lumbini', 'Madhesh'], types: '10-Day', total: 18, avail: true, flag: '🇳🇵' },
  { name: 'Sita Devi', gender: 'F', langs: ['Nepali'], regions: ['Koshi', 'Itahari'], types: '10-Day', total: 14, avail: false, flag: '🇳🇵' },
  { name: 'Gopal Thapa', gender: 'M', langs: ['Nepali', 'English'], regions: ['Kathmandu', 'Pokhara'], types: '10-Day, 20-Day, 30-Day', total: 29, avail: true, flag: '🇳🇵' },
  { name: 'Kamala Gurung', gender: 'F', langs: ['Nepali', 'English'], regions: ['Pokhara', 'Gandaki'], types: '10-Day, Satip.', total: 12, avail: true, flag: '🇳🇵' },
];
```

This can live as a constant in the component for v1. When the teacher list lands in the SQLite layer (future task), swap to a repository read.

## 3. State

```ts
const [query, setQuery] = useState('');
const [filter, setFilter] = useState<'All' | 'Nepali' | 'English' | 'Hindi' | 'German'>('All');
```

Filtering logic (mirrors prototype line 2130):
```ts
const filtered = TEACHERS.filter((tc) =>
  (query === '' || tc.name.toLowerCase().includes(query.toLowerCase())) &&
  (filter === 'All' || tc.langs.includes(filter))
);
```

## 4. Layout overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                    │
│   Teachers              (26/800)                  [Add Teacher]   │
│   138 active assistant teachers                                   │
│                                                                  │
│   ┌─ Search input ────────────────────────────────────────┐      │
│   │ 🔍  Search by name…                                    │     │
│   └──────────────────────────────────────────────────────┘      │
│   [All] [Nepali] [English] [Hindi] [German]   (sf-active chip)   │
├ 8px cream gap ────────────────────────────────────────────────────┤
│ ┌─ Teacher card ─────────────────────────────────────────────┐   │
│ │ [A•] Bhikkhu Ananda 🇳🇵           [● Available]            │   │
│ │      Male AT · 47 courses · Kathmandu, Pokhara, Lumbini   │   │
│ │      [Nepali] [English] [Hindi]                           │   │
│ │      10-Day, Satip., 20-Day                               │   │
│ │ ─────────────────────────────────────────────────────     │   │
│ │ [View Profile]            [📨 Assign to Course]           │   │
│ └────────────────────────────────────────────────────────────┘   │
│  ... (one per filtered teacher)                                   │
│ (20px footer)                                                     │
└──────────────────────────────────────────────────────────────────┘
              ┌─ Bottom Tab Bar (visible) ─┐
```

## 5. Header

White panel, padding `56 18 12`. Top inset.

### 5.1 Top row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-end'`.

Left:
- Title — fontSize 26, fontWeight 800, color `Colors.tx`: `t('admin.directory.title')` ("Teachers" / "आचार्यहरू")
- Sub-line — fontSize **13.5**, color `Colors.tx2`, marginTop 2: `"138 active assistant teachers"` (English literal in both; prototype hard-codes line 2137)

Right — small primary button:
- `.btn.pr.sm` reskin: saffron gradient `Gradients.primaryCta`, white text
- paddingHorizontal **13**, paddingVertical **8**, fontSize **12**, fontWeight 700, borderRadius 10
- `numberOfLines: 1` (so "Add Teacher" doesn't wrap on small phones)
- Text: `t('admin.directory.add_teacher')` ("Add Teacher" / "आचार्य थप्नुहोस्")
- onPress → `Alert.alert(t('common.coming_soon'))` for v1 (Add Teacher sheet deferred)

## 6. Search bar (`.sbar`)

White wrapper continues from header. Padding inside the wrapper: `0 18 12` for the white block that contains search + chips.

The search bar itself (`.sbar` from prototype line 514):
- `marginHorizontal: 18` (within the wrapper, but wrapper has 18 padding already — so actually 0 horizontal on the sbar inside)
- Reading prototype: `<div style={{background:"var(--card)",padding:"0 18px 12px"}}>` wraps the `.sbar` and `.frow`. The `.sbar` itself has `margin: 0 18px 13px` from the base class, but the prototype's outer wrapper already adds 18 horizontal padding. RN doesn't have margin collapse like that. Just remove the inner margin: in our component the search bar has no `marginHorizontal` (parent already provides it).

Final styles:
- `backgroundColor: Colors.white`
- `borderWidth: 1.5`, `borderColor: Colors.bd`
- `borderRadius: 13`
- `paddingHorizontal: 14`, `paddingVertical: 11`
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`
- `marginBottom: 13` (gap before filter chips)

Inside:
- SearchIcon SVG 18×18 (circle r7 + diagonal handle, stroke `Colors.tx3`)
- `<TextInput>`:
  - `flex: 1`
  - fontSize **13.5**, color `Colors.tx`
  - `placeholderTextColor: Colors.tx3`
  - placeholder: `"Search by name…"` (English literal — prototype hard-codes line 2142)
  - `value`/`onChangeText` wired to `query` state
  - No border / outline (consumed by parent `.sbar`)

## 7. Filter chips (`.frow`)

Below the search bar, **horizontal scrolling** chip row.

- Container: `flexDirection: 'row'`, `gap: 7`
- Inside white wrapper, **`padding: 0`** (per prototype line 2143 — overrides the `.frow` base padding of `0 18 4`)
- 5 chips: `['All', 'Nepali', 'English', 'Hindi', 'German']`

Each chip (uses `.fchip` base):
- `paddingHorizontal: 14`, `paddingVertical: 7`
- `borderRadius: 20`, `borderWidth: 1.5`
- fontSize **13**, fontWeight 600
- Inactive: `backgroundColor: Colors.white`, `borderColor: Colors.bd2`, color `Colors.tx2`
- Active: `backgroundColor: Colors.sf`, `borderColor: Colors.sf`, color `Colors.white`

`flex-shrink: 0` so chips never squish.

Note: this `.fchip.on` uses **saffron** (not the server-screen's #9B6B14 override). The prototype defaults `.fchip.on` to `var(--sf)`.

## 8. Cream gap

`<View style={{ height: 8, backgroundColor: Colors.cr }} />`.

## 9. Teacher card

Standard `.card`. No left-border accent.

### 9.1 Top row
`flexDirection: 'row'`, `gap: 11`, `alignItems: 'flex-start'`.

#### 9.1.1 Avatar (with availability dot)
Position relative wrapper, `flexShrink: 0`.

Avatar (`.avatar` styles):
- `width: 44`, `height: 44`, `borderRadius: 22` (50%)
- `backgroundColor: Colors.sfm`, color `Colors.sfd`
- fontSize **17**, fontWeight 700
- Centered initial

Availability dot (only when `avail === true`):
- `position: 'absolute'`, `bottom: 1`, `right: 1`
- `width: 11`, `height: 11`, `borderRadius: 5.5` (50%)
- `backgroundColor: Colors.fo` (forest)
- `borderWidth: 2`, `borderColor: Colors.white`

#### 9.1.2 Body (`flex: 1`)
1. Name + status row — `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`
   - Name — fontSize **14.5**, fontWeight 700: `"{name} {flag}"` (e.g. `"Bhikkhu Ananda 🇳🇵"`)
   - Status pill — `.spill.appr` (available) or `.spill.reje` (busy)
     - bg `Colors.fol`/`Colors.url`, color `Colors.fo`/`Colors.ur`
     - paddingHorizontal 11, paddingVertical 5, borderRadius 20
     - fontSize **9.5** (note: prototype overrides `.spill` 11.5 base to 9.5 here)
     - Content: `"● Available"` / `"● Busy"` — English literals (prototype hard-codes line 2154; the ● glyph is part of the string)
2. Meta line — fontSize **11.5**, color `Colors.tx2`, marginTop 1:
   - Format: `"{Male|Female} AT · {total} courses · {regions.join(', ')}"`
   - "Male AT" / "Female AT" English literals. `regions` strings English. `courses` literal.
3. Lang chips row — `flexDirection: 'row'`, `gap: 4`, `flexWrap: 'wrap'`, marginTop 5
   - Each chip = `.chip.bl` (bg `Colors.bll`, color `Colors.bl`, padding 3/9, radius 20, fontSize 11, fontWeight 600)
4. Types line — fontSize **10.5**, color `Colors.tx3`, marginTop 4: `tc.types` (English literal comma-separated string)

### 9.2 Action button row
Above the buttons: `paddingTop: 10`, `borderTopWidth: 1`, `borderTopColor: Colors.bd` — divider between body and actions.

Row: `flexDirection: 'row'`, `gap: 8`, `marginTop: 10`.

Two buttons (`flex: 1`):

| Button              | Style                                                                                    | Action                                          |
|---------------------|------------------------------------------------------------------------------------------|--------------------------------------------------|
| View Profile        | `.btn.ou.sm`: transparent bg, 2px `Colors.bd2` border, color `Colors.tx`, padding 6/8, fontSize **11**, fontWeight 700, borderRadius 10 | `router.push(routeTo.adminApplicationReview(matchingId))` — match the teacher name to an `adminApplications` entry (or fall back to id 1) |
| 📨 Assign to Course | `.btn.pr.sm`: saffron gradient `Gradients.primaryCta`, white text, padding 6/8, fontSize **11**, fontWeight 700, borderRadius 10 | `Alert.alert(t('common.coming_soon'))` (v1 — sheet deferred) |

Note: fontSize **11** is tighter than the inbox row's 12.5 — directory cards have 2 buttons, not 3, but inside narrower cards still need to fit two labels including the emoji on Assign.

Add `numberOfLines={1}` on both button texts to prevent wrap.

## 10. Empty state

If `filtered.length === 0`:
- Centred text, fontSize 13, color `Colors.tx3`, paddingVertical 40
- EN: `"No teachers match your search."`
- NE: `"तपाईंको खोजसँग कुनै आचार्य मेल खाएन।"`

## 11. Footer spacer
`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView content.

## 12. Behaviour

| Trigger                       | Action                                                       |
|-------------------------------|--------------------------------------------------------------|
| Type in search box            | `setQuery(text)`                                             |
| Tap filter chip               | `setFilter(label)`                                           |
| Tap "Add Teacher"             | `Alert.alert(t('common.coming_soon'))` (v1 placeholder)     |
| Tap "View Profile"            | `router.push(routeTo.adminApplicationReview(matchedId))`     |
| Tap "📨 Assign to Course"     | `Alert.alert(t('common.coming_soon'))` (v1 placeholder)     |

The View Profile mapping: find the `adminApplications` entry whose `name === teacher.name`. If none, route to id 1.

## 13. i18n

New block under `admin.directory.*`:

| Key                       | EN                                              | NE                                       |
|---------------------------|-------------------------------------------------|-------------------------------------------|
| `title`                   | Teachers                                        | आचार्यहरू                                 |
| `add_teacher`             | Add Teacher                                     | आचार्य थप्नुहोस्                          |
| `empty_state`             | No teachers match your search.                  | तपाईंको खोजसँग कुनै आचार्य मेल खाएन।       |

Hard-coded English literals (per prototype):
- `"138 active assistant teachers"` (sub-line)
- `"Search by name…"` (placeholder)
- Filter chip labels: `"All"`, `"Nepali"`, `"English"`, `"Hindi"`, `"German"`
- `"● Available"`, `"● Busy"`
- `"Male AT"`, `"Female AT"`
- `"X courses"`, region names, types string
- Button labels: `"View Profile"`, `"📨 Assign to Course"`

Reuse: `common.coming_soon`.

## 14. Things being omitted vs prototype

| Prototype feature                | RN decision                                                 |
|----------------------------------|-------------------------------------------------------------|
| AddTeacherSheet modal            | Deferred — Alert "coming soon" placeholder                  |
| Assign-to-Course sheet           | Deferred — Alert "coming soon" placeholder                  |
| Toast notification on invite     | Deferred — would land with AddTeacherSheet                   |
| Search input focus border        | RN TextInput uses platform default focus styling             |

### 14.1 Other small details to preserve

- The header's right-aligned "Add Teacher" small button aligns to the **bottom** of the title block (`alignItems: 'flex-end'`) — not the top. So when the title is taller than the button, the button drops to the sub-line baseline.
- The Add Teacher button uses **smaller padding** (`8 13`) than the row-action `.btn.sm` (`7 15`). Header buttons are deliberately compact.
- Availability dot is **only** rendered when `avail === true`. There's no "busy" dot (the `●` glyph is in the pill text).
- Avatar fontSize **17** is one step bigger than dashboard's 14 and inbox's 14 — directory has fewer cards per screen so the avatar dominates the row more.
- Status pill fontSize **9.5** is the smallest in the app — fits below the larger 14.5 name without crowding.
- The `●` glyph in the pill text is sized at the pill's fontSize (9.5) — gives a subtle dot leading the word.
- "Available" pill uses **forest tint** (fol/fo), matching approved-status semantics. Consistent: green = positive.
- "Busy" pill uses **red tint** (url/ur) — same as rejected. Stronger than "unavailable" wording. The label `Busy` keeps it polite.
- The `1px Colors.bd` divider between body and action row inside the card is **manual** — `.card` doesn't have one. Achieved via `borderTopWidth: 1, borderTopColor: Colors.bd, paddingTop: 10`.
- Action button fontSize **11** is the smallest button label in the app — fits two pill-buttons inside a 320-ish px card width.
- The `📨` glyph on Assign button is part of the label string (not a separate icon), keeping consistent with the inbox approve button's `✓` pattern.
- Search bar `marginBottom: 13` (inside the white wrapper) gives breathing room before chips. Chip row sits directly atop the cream gap.
- Filter chips do NOT scroll horizontally on standard 390-ish phone widths — they fit. On narrower phones (Plus has 414, mini 360) they'd wrap; for v1 we use `flexWrap` instead of horizontal scroll so they break to a second line naturally if needed. Prototype uses `.frow` which is horizontal scroll; we deviate for better RN compat. **Decision flag**.

## 15. Acceptance checklist

### Header
- [ ] Title 26/800 "Teachers"
- [ ] Sub-line 13.5/tx2 mt 2 "138 active assistant teachers" (English literal)
- [ ] "Add Teacher" small saffron button at `align-items: flex-end`, padding 8/13, fontSize 12

### Search + filter
- [ ] Search bar inside white wrapper, 1.5px bd border, radius 13, padding 11/14
- [ ] Search icon SVG + TextInput placeholder "Search by name…"
- [ ] 5 filter chips: All/Nepali/English/Hindi/German
- [ ] Active chip: saffron filled, white text
- [ ] 8px cream gap below

### Teacher card
- [ ] 44×44 avatar with `sfm` bg + `sfd` text (fontSize 17), avail dot (forest, 11×11, white border 2px) only when `avail: true`
- [ ] Name row: 14.5/700 `{name} {flag}` + pill `● Available` (9.5/fol/fo) or `● Busy` (9.5/url/ur)
- [ ] Meta line: `{Male|Female} AT · {total} courses · {regions...}` 11.5/tx2 mt 1
- [ ] Lang chips (`.chip.bl`): 11/600/bll/bl/padding 3,9
- [ ] Types line: 10.5/tx3 mt 4
- [ ] Action divider: 1px bd top, paddingTop 10, marginTop 10
- [ ] 2 buttons row: View Profile (outline) + 📨 Assign to Course (saffron gradient), fontSize 11
- [ ] View Profile routes to `routeTo.adminApplicationReview(matchedId)`

### Empty state
- [ ] Centred "No teachers match your search." when filter yields zero

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors
