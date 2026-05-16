---
id: 29-admin-server-inbox
title: Admin Server Inbox
route: /(admin)/server/inbox
prototype: VipassanaTeacherApp/app.html:3492–3646
status: draft
related: [21-admin-dashboard, 22-admin-inbox, 30-admin-server-board]
---

# 29 · Admin Server Inbox

The Centre Manager's review queue for **server applications** (course
volunteers). Filterable by course; each card lets the admin approve or
reject inline, or tap "View Applicant →" to open the full review
detail with a reason textarea + decision buttons.

Reached from the **Server Board** (spec 30 — pending review).

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/server/inbox` (hidden from tab bar)              |
| **Component**    | `app/(admin)/server/inbox.tsx` default `AdminServerInboxScreen` |
| **Prototype**    | `AdminServerInbox` function, app.html 3492–3646             |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. State

```ts
type Filter = 'all' | 'course' | 'area';
const [filter, setFilter] = useState<Filter>('all');
const [filterVal, setFilterVal] = useState<string | null>(null);
const [sel, setSel] = useState<ServerApplicant | null>(null);
const [decisions, setDecisions] = useState<Record<number, 'approved' | 'rejected'>>({});
const [reason, setReason] = useState('');
```

- `filter` + `filterVal`: drives the chip filter row. For v1 we only implement `all` + `course` (prototype's `area` branch isn't wired in the chip row).
- `sel`: opens detail view in same component.
- `decisions`: tracks reviewed apps (removes from pending list).
- `reason`: textarea content in detail view.

Pending app filter:
```ts
const apps = SERVER_APPLICANTS.filter((a) => {
  if (decisions[a.id]) return false;
  if (filter === 'course' && filterVal && a.course !== filterVal) return false;
  if (filter === 'area' && filterVal && !a.areas.includes(filterVal)) return false;
  return true;
});
```

## 3. Data

Hard-coded list of 5 server applicants (matches prototype line 878):

```ts
interface ServerApplicant {
  id: number;
  name: string;
  g: 'M' | 'F';
  courses: number;
  last: string;
  areas: string[];          // SERVICE_AREAS ids
  partial: boolean;
  days: string | null;
  applied: string;
  course: string;
  note: string;
}

const SERVER_APPLICANTS: ServerApplicant[] = [
  { id: 1, name: 'Suman Karki',      g: 'M', courses: 5,  last: 'Jan 2026', areas: ['kitchen','compound'],         partial: false, days: null,        applied: '2 days ago', course: 'Dhamma Shringa — Jul 10-Day', note: 'Local · drives own vehicle. Available all 11 days.' },
  { id: 2, name: 'Maya Tamang',      g: 'F', courses: 8,  last: 'Mar 2026', areas: ['dining','reception'],         partial: true,  days: 'Day 1–5',   applied: '1 day ago',  course: 'Dhamma Shringa — Jul 10-Day', note: "Available first half only · sister's wedding on Day 7." },
  { id: 3, name: 'Krishna Shrestha', g: 'M', courses: 3,  last: 'Sep 2025', areas: ['dhamma'],                     partial: false, days: null,        applied: '5 hrs ago',  course: 'Dhamma Pokhara — Jul 10-Day', note: 'First time at Pokhara · served 3× at Shringa.' },
  { id: 4, name: 'Anita Rai',        g: 'F', courses: 11, last: 'Feb 2026', areas: ['kitchen','dining','at_assist'], partial: false, days: null,      applied: '6 hrs ago',  course: 'Dhamma Adhara — Aug 10-Day',  note: 'Senior server · willing to lead kitchen team.' },
  { id: 5, name: 'Bikash Lama',      g: 'M', courses: 2,  last: 'Nov 2025', areas: ['compound','residence'],       partial: true,  days: 'Day 6–11',  applied: '3 days ago', course: 'Dhamma Janani — Aug 10-Day',  note: 'Coming from Itahari · second half availability.' },
];
```

For v1 stored as a constant in the screen. Future SQLite migration moves it under a `serverApplicantsRepository`.

Course filter options derived dynamically: `[...new Set(SERVER_APPLICANTS.map(a => a.course))]`.

## 4. Avatar palette

Gendered soft-pastel backgrounds:
- `F` → `#F3DDF0` (soft pink)
- `M` → `#D6E5F0` (soft blue)

Emoji: `F` → `👩`, `M` → `👨`.

## 5. List view layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                    │
│   ← Back                                                          │
│   Server Applications      (24/800)                               │
│   3 pending · 2 reviewed                  (13/tx2)                │
├─ Filter chip row (white wrapper) ───────────────────────────────┤
│   [All] [Shringa · Jul 10-Day] [Pokhara · Jul 10-Day] …          │
├ 8px cream gap ────────────────────────────────────────────────────┤
│ ┌─ Applicant card ─────────────────────────────────────────────┐ │
│ │ [👨 tile]  Suman Karki                        2 days ago     │ │
│ │           5 courses · Jan 2026                                │ │
│ │           Dhamma Shringa — Jul 10-Day  (bl/600)              │ │
│ │  [🍳 Kitchen][🌿 Compound][Full course]                       │ │
│ │  [Reject (outline)] [Approve (forest)] [View Applicant → (bl)]│ │
│ └──────────────────────────────────────────────────────────────┘ │
│  ... (one card per pending applicant)                             │
│  (20px footer)                                                    │
└──────────────────────────────────────────────────────────────────┘
              ┌─ Bottom Tab Bar (visible) ─┐
```

## 6. Header (list view)

White panel, padding `56 18 12`, top inset.

### 6.1 Back link
- Row, gap 4, marginBottom 6
- SVG back arrow 18×18 strokeWidth 2.2, stroke `Colors.bl` (admin blue — NOT white this time, since header is on light bg)
- Label: `t('common.back')` — fontSize 13, color `Colors.bl`, fontWeight 600
- Tap → `router.push(Routes.adminServerBoard)` (or back if board → inbox push history exists)

### 6.2 Title + sub
- Title — fontSize **24** (slightly smaller than other admin screens' 26), fontWeight 800, color `Colors.tx`: `"Server Applications"` (Acharya-correct ne: `"सेवक आवेदनहरू"`)
- Sub — fontSize 13, color `Colors.tx2`, marginTop 2: `"{pending} pending · {reviewed} reviewed"` (translated)

## 7. Filter chips

White wrapper continues from header: `paddingHorizontal: 18`, `paddingBottom: 12`.

Horizontal `ScrollView`, `contentContainerStyle: { gap: 6 }`. First chip is `"All"`, then one per unique course (simplified label).

Course label simplification (per prototype line 3597): `co.replace('Dhamma ','').replace(' — ',' · ')`. Examples:
- `"Dhamma Shringa — Jul 10-Day"` → `"Shringa · Jul 10-Day"`
- `"Dhamma Pokhara — Jul 10-Day"` → `"Pokhara · Jul 10-Day"`

Each chip — `.fchip`:
- `paddingHorizontal: 14`, `paddingVertical: 7`, `borderRadius: 20`, `borderWidth: 1.5`
- fontSize 13, fontWeight 600
- Inactive: bg `Colors.white`, border `Colors.bd2`, color `Colors.tx2`
- Active: bg `Colors.bl` (admin blue — NOT saffron — this is admin's own screen), border `Colors.bl`, color `Colors.white`

Tap "All" → `setFilter('all'); setFilterVal(null)`. Tap course chip → `setFilter('course'); setFilterVal(courseString)`.

## 8. Cream gap
8px `Colors.cr` band.

## 9. Empty state

If `apps.length === 0`:
- Centred, padding `60 22`
- 🙏 emoji fontSize 46, marginBottom 12
- Text 14/tx2 lineHeight 21: `"No pending applications. Sadhu! 🙏"` (English literal — prototype line 3606)

## 10. Applicant card

Standard `.card` (white, padding 15, radius 16, mh 18, mb 11). Tap → `setSel(applicant)`.

### 10.1 Top row
`flexDirection: 'row'`, `gap: 11`, `alignItems: 'flex-start'`, `marginBottom: 8`.

#### 10.1.1 Avatar tile (gendered, `flexShrink: 0`)
- `width: 42`, `height: 42`, `borderRadius: 12`
- `backgroundColor: a.g === 'F' ? '#F3DDF0' : '#D6E5F0'`
- Centred emoji fontSize 20

#### 10.1.2 Body (`flex: 1`, `minWidth: 0`)
1. Name row — `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, gap 6
   - Name — fontSize 14, fontWeight 700, color `Colors.tx`
   - Applied — fontSize 10.5, color `Colors.tx3`, `flexShrink: 0`
2. History line — fontSize 11.5, color `Colors.tx2`, marginTop 1: `"{courses} courses · {last}"`
3. Course line — fontSize 11.5, color `Colors.bl`, fontWeight 600, marginTop 3: `a.course`

### 10.2 Chip row
`flexDirection: 'row'`, `gap: 5`, `flexWrap: 'wrap'`, `marginBottom: 9`.

For each area → saffron `Colors.svl` chip (fontSize 10, padding 2/7, weight 700, `#9B6B14` text) with `{sa.emoji} {sa.label}`.

Trailing duration chip — bg `Colors.cr2`, color `Colors.tx2`, weight 600, same padding:
- `"Full course"` if not partial
- `"Partial · Day X–Y"` otherwise

### 10.3 Action button row
`flexDirection: 'row'`, `gap: 6`.

Three buttons (`flex: 1`):

| Button         | Style                                                                                | Action                                     |
|----------------|--------------------------------------------------------------------------------------|---------------------------------------------|
| Reject         | transparent bg, 1.5px `#E8B0A0` border, color `#B85040`, padding 9, radius 10, fontSize 12, weight 700 | `setDecisions(d => ({...d, [a.id]: 'rejected'}))` |
| Approve        | forest gradient `Gradients.forestCta`, white text, same size                          | `setDecisions(d => ({...d, [a.id]: 'approved'}))` |
| View Applicant →| solid `Colors.bl` bg, white text, same size                                          | `setSel(a)` (opens detail)                  |

All three buttons inside the row stop click propagation implicitly (RN's child Touchable consumption).

Add `numberOfLines={1}` on all three button texts.

## 11. Detail view

When `sel !== null`, render this instead of the list.

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                    │
│   ← Back to Inbox                                                 │
│   [👨 50×50 tile]  Suman Karki                                    │
│                    5 courses served · last: Jan 2026              │
├ 8px cream gap ────────────────────────────────────────────────────┤
│ 📋 APPLYING FOR                                                   │
│ ┌─ Card (bl 4px left-border) ──────────────────────────────────┐ │
│ │ Dhamma Shringa — Jul 10-Day                                  │ │
│ │ Applied: 2 days ago                                          │ │
│ │ [🍳 Kitchen] [🌿 Compound]                                    │ │
│ │ Duration: Full course                                         │ │
│ │ ── dashed divider ──                                          │ │
│ │ "Local · drives own vehicle. Available all 11 days."         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ 📖 THEIR HISTORY                                                  │
│ ┌─ Card · 3 stat tiles + footnote ────────────────────────────┐ │
│ │ [5 Courses] [Jan 2026 Last] [♂ Gender]                       │ │
│ │ Full history available in server profile                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ⚖️ DECISION                                                       │
│   ┌─ Reason textarea ──────────────────────────────────────────┐ │
│   │ Reason (sent to applicant)                                  │ │
│   └────────────────────────────────────────────────────────────┘ │
│   [Reject (outline red)] [Approve (forest gradient)]              │
│  (20px footer)                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 11.1 Header
White panel, padding `56 18 14`.

#### 11.1.1 Back link
- Same style as list back link but text is `t('common.back')` → ideally "Back to Inbox". Prototype line 3515 uses `t('backInbox')` = "Back to Inbox".

#### 11.1.2 Identity row
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 11`
- Avatar tile: `width: 50`, `height: 50`, `borderRadius: 14`, gendered bg, emoji fontSize 22, `flexShrink: 0`
- Body (`flex: 1`):
  - Name — fontSize 18, fontWeight 800, color `Colors.tx`
  - Meta — fontSize 12, color `Colors.tx2`: `"{courses} courses served · last: {last}"`

### 11.2 Cream gap
8px.

### 11.3 Applying for section

sph `📋 Applying for` (reuse `t('a_app_for')` → "Applying for" / "का लागि आवेदन").

Card with `margin: '0 18px'`, `borderLeftWidth: 4`, `borderLeftColor: Colors.bl`, `marginBottom: 0` per section-card convention.

Contents:
- Course title — fontSize 14, fontWeight 700, color `Colors.tx`
- Applied date — fontSize 12, color `Colors.tx3`, marginTop 2: `"Applied: {applied}"`
- Area chips row — `gap: 5`, `flexWrap: 'wrap'`, marginTop 8:
  - Each chip fontSize 10.5, padding `3 9`, radius 20, bg `Colors.svl`, color `#9B6B14`, weight 700
- Duration line — fontSize 12, color `Colors.tx2`, marginTop 8:
  - `"Duration: <bold>{Full course | Partial · Day X-Y}</bold>"` (bold default `Colors.tx`)
- Dashed divider (top border) — `borderTopWidth: 1, borderTopStyle: 'dashed', borderTopColor: Colors.bd, paddingTop: 8, marginTop: 8`
- Note — fontSize 12, color `Colors.tx2`, italic: `"\"{note}\""`

Use `DashedDivider` for the divider (RN's `borderStyle: 'dashed'` is broken).

### 11.4 Their history section

sph `📖 Their History` (reuse `t('a_their_history')` → "Their Service History" / "उनको सेवा इतिहास").

Card with section-card convention.

Top row — 3 stat tiles, `flexDirection: 'row'`, `gap: 10`, `marginBottom: 9`:
- Each tile: `flex: 1`, bg `Colors.cr`, borderRadius 11, padding `8 4`, textAlign center
  - Number — fontSize 13.5, fontWeight 800, color `Colors.bl`
  - Label — fontSize 9.5, color `Colors.tx3`, marginTop 1
- Three stats: `[courses, 'Courses']`, `[last, 'Last']`, `[g==='F'?'♀':'♂', 'Gender']`

Footnote — fontSize 11.5, color `Colors.tx3`: `"Full history available in server profile"` (English literal)

### 11.5 Decision section

sph `⚖️ Decision` (reuse `t('a_decision')`).

Container `paddingHorizontal: 18`.

#### 11.5.1 Textarea
- `<TextInput multiline>`:
  - bg `Colors.cr`, 1.5px `Colors.bd`, radius 12, padding `12 14`
  - fontSize 13, color `Colors.tx`
  - `placeholder = "Reason (sent to applicant)"` (English literal — Acharya translation in NE)
  - `minHeight: 60`, `textAlignVertical: 'top'`
  - marginBottom 12
- Value wired to `reason` state.

#### 11.5.2 Button row
`flexDirection: 'row'`, `gap: 8`. Two buttons `flex: 1`:

| Button   | Style                                                                                  | Action                                                                              |
|----------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| Reject   | transparent bg, 1.5px `#E8B0A0` border, color `#B85040`, padding 13, radius 13, fontSize 13.5, weight 700 | `setDecisions(d => ({...d, [a.id]: 'rejected'})); setSel(null); setReason('');` |
| Approve  | forest gradient (2-stop `fo → #3D6847`), white text, same size                          | `setDecisions(d => ({...d, [a.id]: 'approved'})); setSel(null); setReason('');` |

Per prototype line 3567, the Approve gradient is `linear-gradient(135deg, var(--fo), #3D6847)` — same colour both stops basically (fo IS #3D6847). Reuse `Gradients.forestCta` which is `['#3D6847', '#2D5236']` — same forest theme.

### 11.6 Footer spacer
20px.

## 12. i18n

New block under `admin.serverInbox.*`:

| Key                  | EN                                      | NE                                            |
|----------------------|-----------------------------------------|------------------------------------------------|
| `title`              | Server Applications                     | सेवक आवेदनहरू                                   |
| `pending_lbl`        | pending                                 | विचाराधीन                                       |
| `reviewed_lbl`       | reviewed                                | समीक्षा भयो                                     |
| `filter_all`         | All                                     | सबै                                            |
| `no_pending`         | No pending applications. Sadhu! 🙏     | विचाराधीन आवेदन छैन। साधु! 🙏                  |
| `back_inbox`         | Back to Inbox                           | इनबक्समा फर्कनुहोस्                             |
| `courses_lbl`        | courses                                 | शिविर                                          |
| `courses_served`     | courses served                          | शिविर सेवा                                      |
| `last_lbl`           | last                                    | अघिल्लो                                        |
| `applying_for`       | Applying for                            | का लागि आवेदन                                  |
| `applied_lbl`        | Applied                                 | आवेदन                                          |
| `duration_lbl`       | Duration                                | अवधि                                           |
| `full_course`        | Full course                             | पूरा शिविर                                     |
| `partial_lbl`        | Partial                                 | आंशिक                                          |
| `their_history`      | Their Service History                   | उनको सेवा इतिहास                                |
| `history_courses`    | Courses                                 | शिविर                                          |
| `history_last`       | Last                                    | अघिल्लो                                        |
| `history_gender`     | Gender                                  | लिङ्ग                                          |
| `history_footnote`   | Full history available in server profile| पूर्ण इतिहास सेवक प्रोफाइलमा                    |
| `decision`           | Decision                                | निर्णय                                         |
| `reason_placeholder` | Reason (sent to applicant)              | कारण (आवेदकलाई पठाइनेछ)                        |
| `approve`            | ✓ Approve                               | ✓ स्वीकृत                                       |
| `reject`             | ✗ Reject                                | ✗ अस्वीकार                                     |
| `view_applicant`     | View Applicant →                        | आवेदक हेर्नुहोस् →                              |

Reuse: `common.back` (where "Back to Inbox" doesn't fit), `common.coming_soon`.

## 13. Behaviour

| Trigger                          | Action                                                                |
|----------------------------------|-----------------------------------------------------------------------|
| Tap Back (list)                  | `router.push(Routes.adminServerBoard)` (or `router.back()`)           |
| Tap filter chip                  | Sets `filter` + `filterVal`                                           |
| Tap card body                    | `setSel(a)` (opens detail)                                            |
| Tap card Reject                  | Adds id to `decisions` as rejected; card disappears from list         |
| Tap card Approve                 | Adds id to `decisions` as approved; card disappears                   |
| Tap card View Applicant →        | `setSel(a)` (opens detail)                                            |
| Tap Back (detail)                | `setSel(null); setReason('')`                                         |
| Type in reason textarea          | `setReason(text)`                                                     |
| Tap Reject (detail)              | Records rejection + clears `sel` + clears reason                      |
| Tap Approve (detail)             | Records approval + clears `sel` + clears reason                       |

## 14. Things being omitted vs prototype

| Prototype feature                | RN decision                                              |
|----------------------------------|----------------------------------------------------------|
| Area filter chip variant         | List shows course filters only (per prototype's wired chip row) |
| `e.stopPropagation` on buttons   | RN consumes child press automatically                    |
| `<textarea>` element             | `TextInput multiline textAlignVertical='top'`            |

### 14.1 Other small details to preserve

- Gendered avatar pastels (`#F3DDF0` F / `#D6E5F0` M) — single-screen palette, not in tokens.
- Avatar border-radius **12** on list (square-ish) and **14** on detail (slightly more rounded for bigger 50×50 size) — kept consistent ratio.
- Detail avatar uses fontSize **22** vs list's 20 — sized up for hero prominence.
- Filter chip active state is **admin blue** (`Colors.bl`), not saffron — distinct from spec 22's inbox which uses saffron-underline tabs. Different visual language: chip-fill here vs underline there.
- Course chip label simplification strips "Dhamma " prefix and replaces " — " with " · " — saves horizontal real estate so more chips fit per row.
- Card title fontSize **14** (not 14.5 like spec 22's inbox card) — slight downshift because there are 3 action buttons instead of 2.
- Course-line colour is `Colors.bl` (admin blue) — links the application to admin's review surface.
- Each card has 3 buttons inline; **fontSize 12** is tightest in the app to fit 3 labels with padding 9.
- View Applicant → uses **solid blue** (not gradient or outline) — a third button style to visually separate "go deeper" from "act now" (Approve/Reject).
- Reject button colour `#B85040` matches server screen's softer red — consistent palette.
- Detail card "Applying for" has a **bl 4px left-border** (not the typical fo/sf accent) — visually links to admin theme.
- Stat tiles in detail use `Colors.bl` numbers — admin owns this view.
- Decision textarea minHeight **60** is shorter than spec 16's apply note (65). Admin notes tend to be brief.
- Detail approve/reject button padding **13** (vs list's 9) — primary surface, bigger tap targets.

## 15. Acceptance checklist

### List view
- [ ] Back link (blue arrow + label) routes back to adminServerBoard
- [ ] Title 24/800 "Server Applications" + sub "{n} pending · {n} reviewed"
- [ ] Filter chips (horizontal scroll, gap 6): All + simplified course labels
- [ ] Active chip = bl bg / bl border / white text
- [ ] 8px cream gap, then applicant cards
- [ ] Card: 42×42 r12 gendered avatar tile + name 14/700 + applied date right + courses · last + bl course line
- [ ] Area chips (svl bg/9B6B14 text) + duration chip (cr2/tx2)
- [ ] 3 buttons row: Reject (outline red) / Approve (forest gradient) / View Applicant → (solid blue)
- [ ] Inline approve/reject removes card from list
- [ ] Empty state: 🙏 46 + 14/tx2 message centered

### Detail view
- [ ] Back to Inbox link (blue)
- [ ] 50×50 r14 gendered avatar + name 18/800 + meta
- [ ] 8px cream gap
- [ ] 📋 Applying for sph + bl-left-border card with course title, applied, area chips (11/3-9), duration, DashedDivider, italic quoted note
- [ ] 📖 Their History sph + card with 3 stat tiles (cr bg, bl number 13.5/800) + footnote 11.5/tx3
- [ ] ⚖️ Decision sph + multiline TextInput (cr bg, bd 1.5px, radius 12, minHeight 60) + 2 buttons (Reject outline / Approve forest)
- [ ] Approve/Reject in detail clears reason + closes detail

### Cross-cutting
- [ ] Tab bar visible on both views (not hidden — admin user needs to navigate)
- [ ] No TS errors
