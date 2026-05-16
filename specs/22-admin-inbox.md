---
id: 22-admin-inbox
title: Admin Inbox
route: /(admin)/inbox
prototype: VipassanaTeacherApp/app.html:2013–2056
status: draft
related: [21-admin-dashboard, 23-admin-review]
---

# 22 · Admin Inbox

The Centre Manager's "Applications" tab — paginated by status (pending /
approved / rejected). For each applicant: avatar, name, match badge,
course, language + experience chips, applied-date, and **3 inline
action buttons** (Approve / Reject / Review).

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/inbox` (tab 2 — `AppsIcon`)                      |
| **Component**    | `app/(admin)/inbox/index.tsx` default `AdminInboxScreen`   |
| **Prototype**    | `AdminInbox` function, app.html 2013–2056                   |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. Layout overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                   │
│   Admin Panel                                          [🔔 40×40] │
│   Applications  (26/800)                              · red dot   │
│   [4 Pending (gd)] [2 Urgent (ur)] [18 Month (fo)]               │
├──────────────────────────────────────────────────────────────────┤
│ White tab bar with bottom 2px line                               │
│   Pending  |  Approved  |  Rejected     (sf-underline active)   │
├ 8px cream gap ───────────────────────────────────────────────────┤
│ ┌─ Card (4px left-border by match score) ────────────────────┐  │
│ │ [A] Asha Mehta                          [94% match]         │  │
│ │     Dhamma Shringa — Sep Satipatthana                       │  │
│ │     [Nepali] [English] [23 courses]                         │  │
│ │     Applied 2 days ago                                      │  │
│ │     [✓ Approve]  [✗ Reject]  [Review →]                    │  │
│ └────────────────────────────────────────────────────────────┘  │
│  ... (one card per admApps entry filtered by tab)               │
│ (20px footer)                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## 3. State

```ts
const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
```

For v1, all admApps entries are treated as **pending** (no status field on the AdminApplication type). The approved/rejected tabs render the empty state. We add a `status` field later when the inbox connects to a real applications store.

## 4. Header

### 4.1 Container
White panel, padding `56 18 14`, top inset.

### 4.2 Top row
- `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`

Left column:
- Kicker — fontSize 13, color `Colors.tx3`, fontWeight **500**: `t('admin.inbox.kicker')` ("Admin Panel" / "व्यवस्थापक प्यानल")
- Title — fontSize 26, fontWeight 800, color `Colors.tx`: `t('admin.inbox.title')` ("Applications" / "आवेदनहरू")

Right — bell icon tile with unread dot:
- Outer: `width: 40`, `height: 40`, `borderRadius: 12`, `backgroundColor: Colors.sfl` (saffron-light bg), centred. Note: saffron, not blue.
- Bell SVG inside: `size={20}`, stroke `Colors.sf` (saffron)
- Unread dot (absolute): top -2, right -2, width 8, height 8, radius 4 (50%), bg `Colors.ur`, border 1.5px white
- onPress → `router.push(Routes.adminNotifications)`

### 4.3 Stats row
`flexDirection: 'row'`, `gap: 8`, `marginTop: 13`.

Three chips (`flex: 1`):
| Property            | Value                                  |
|---------------------|---------------------------------------|
| flex                | 1                                     |
| backgroundColor     | per-chip (see below)                  |
| borderRadius        | 12                                    |
| paddingHorizontal   | 7                                     |
| paddingVertical     | 10                                    |
| alignItems          | centre                                |

Stats data (matches prototype line 2024):
| n  | label    | text colour     | bg colour       |
|----|----------|------------------|------------------|
| 4  | Pending  | `Colors.gd`      | `Colors.gdl`     |
| 2  | Urgent   | `Colors.ur`      | `Colors.url`     |
| 18 | Month    | `Colors.fo`      | `Colors.fol`     |

> Numbers and labels both use the **same colour** (text-on-tinted-bg pattern). Labels are **English literals** ("Pending", "Urgent", "Month") in both languages.

Inner stack:
- Number — fontSize 18, fontWeight 800, color = chip text colour
- Label — fontSize 9.5, fontWeight 600, color = same as number, `opacity: 0.8`

## 5. Tab bar

White-bg row sitting **directly below** the header, no gap (the bottom border + cream gap below separate it).

Container:
- `backgroundColor: Colors.white`
- `paddingHorizontal: 18`, `paddingBottom: 10`
- `flexDirection: 'row'`
- `borderBottomWidth: 2`, `borderBottomColor: Colors.bd`

Three tab items (`flex: 1`, textAlign center):
- `paddingVertical: 10`, fontSize 13, fontWeight 700
- Border-bottom 2px (always — colour conditional):
  - active: `Colors.sf` (saffron)
  - inactive: transparent
- `marginBottom: -2` so the active tab's underline overlaps the container's bottom border (creates the connected-underline look)
- color:
  - active: `Colors.sf`
  - inactive: `Colors.tx2`
- text: `textTransform: 'capitalize'`
- Tab labels: `pending` / `approved` / `rejected` (English literals capitalized — match prototype which renders the raw key)

i18n for tab labels — keep as English literals to match prototype. Or use `admin.inbox.tabs.pending` etc.? Per "match prototype exactly" → **keep English**.

## 6. Cream gap

`<View style={{ height: 8, backgroundColor: Colors.cr }} />` between the tab bar and card list.

## 7. Application card

Standard `.card` with override:
- `borderLeftWidth: 4`, `borderLeftColor`:
  - `match >= 95` → `Colors.fo` (forest — top tier)
  - `match >= 85` → `Colors.sf` (saffron — mid)
  - else → `Colors.tx3` (muted)

Tap card → `router.push(routeTo.adminApplicationReview(a.id))`.

### 7.1 Top section row
`flexDirection: 'row'`, `gap: 10`, `alignItems: 'flex-start'`.

#### 7.1.1 Avatar
`.avatar` styles:
- `width: 38`, `height: 38`, `borderRadius: 19` (50%)
- `backgroundColor: Colors.sfm` (saffron muted)
- centred initial — fontSize 14, fontWeight 700, color `Colors.sfd` (saffron dark)
- `flexShrink: 0`

#### 7.1.2 Body (`flex: 1`)
- Name row: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`
  - Name — fontSize **14.5**, fontWeight 700, color `Colors.tx`, `flex: 1`, paddingRight 8
  - `.mbadge` right — same 3-tier hi/md/lo as dashboard. Base: fontSize 12, fontWeight 700, padding 3/10, radius 20
- Course — fontSize 12, color `Colors.tx2`, marginTop 1
- Chips row — `flexDirection: 'row'`, `gap: 4`, `flexWrap: 'wrap'`, `marginTop: 5`
  - Each `a.langs` → `.chip.bl` (background `Colors.bll`, color `Colors.bl`)
  - Plus one trailing `.chip.gy` (background `Colors.cr2`, color `Colors.tx2`): `"{a.courses} courses"` — `courses` English literal
  - `.chip` base: fontSize 11, fontWeight 600, padding 3/9, radius 20, margin 2
- Applied line — fontSize 11, color `Colors.tx3`, marginTop 4: `"Applied {a.applied}"` (English literal in both langs)

### 7.2 Action button row
`flexDirection: 'row'`, `gap: 7`, `marginTop: 10`. Three buttons (`flex: 1`):

| Button       | Style                                                                                  | Action                       |
|--------------|----------------------------------------------------------------------------------------|------------------------------|
| ✓ Approve    | `.btn.fo-btn.sm` — forest gradient `Gradients.forestCta`, white text, padding 7/15, radius 10, fontSize 12.5 / 700 | `Alert("coming soon")` (v1)  |
| ✗ Reject     | `.btn.dg.sm` — bg `Colors.url`, color `Colors.ur`, border `1.5px Colors.urd`, padding 7/15, radius 10, fontSize 12.5 / 700 | `Alert("coming soon")` (v1)  |
| Review →     | `.btn.ou.sm` — transparent bg, 2px `Colors.bd2` border, color `Colors.tx`, padding 7/15, radius 10, fontSize 12.5 / 700 | `router.push(routeTo.adminApplicationReview(a.id))` |

> Approve / Reject inline-action stubs Alert "coming soon" — backend wiring is for spec 23's full review screen. Tapping Review → opens spec 23.

### 7.3 Press-propagation
In RN, child `TouchableOpacity` consumes the tap; the parent card `TouchableOpacity` won't fire. No `stopPropagation` shim needed.

## 8. Empty states

When `tab !== 'pending'` (or filtered count is zero):
- Centred text, fontSize 13, color `Colors.tx3`, paddingVertical 40
- EN: `"No applications in this category."`
- NE: `"यस श्रेणीमा कुनै आवेदन छैन।"`

`tab === 'pending'` always renders all 4 admApps entries.

## 9. Footer spacer
`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView.

## 10. Routes/data
- Reuse existing `adminApplications` from `@/data` (added in spec 21).
- Reuse `routeTo.adminApplicationReview(id)` for card / Review → button taps.
- Add `Routes.adminNotifications` reference for the bell icon (already in routes.ts).

## 11. i18n

New block under `admin.inbox.*`:

| Key                    | EN                                                  | NE                                       |
|------------------------|-----------------------------------------------------|-------------------------------------------|
| `kicker`               | Admin Panel                                         | व्यवस्थापक प्यानल                          |
| `title`                | Applications                                        | आवेदनहरू                                   |
| `empty_state`          | No applications in this category.                  | यस श्रेणीमा कुनै आवेदन छैन।                |

Hard-coded English literals (no i18n):
- Stats labels: `"Pending"`, `"Urgent"`, `"Month"`
- Tab labels: `"pending"`, `"approved"`, `"rejected"` (capitalized via CSS)
- `"X courses"` chip
- `"Applied {date}"`
- Button labels `"✓ Approve"`, `"✗ Reject"`, `"Review →"`

Reuse:
- `common.coming_soon` for v1 approve/reject stubs

## 12. Things being omitted vs prototype

| Prototype style                  | RN decision                                              |
|----------------------------------|----------------------------------------------------------|
| `cursor: 'pointer'`              | TouchableOpacity activeOpacity                            |
| `transition: 'all .15s'` on tabs | Skip animation                                            |
| `e.stopPropagation()` on buttons | Unnecessary — RN consumes child press                    |

### 12.1 Other small details to preserve

- Bell icon tile background is **saffron-light** (`Colors.sfl`), not admin-blue light — visual cue this notifications shortcut routes to a teacher-related screen (the notification centre is about teacher emails).
- Stat chip uses **single-colour** for both number and label (only `opacity: 0.8` separates them). Don't introduce a separate label colour.
- "Month" is short for "this month" — kept as the prototype's single-word label.
- Tab underline appears to **bleed off the bottom edge** because of the `marginBottom: -2` overlap with the 2px container border. This is intentional — gives the connected-segment look.
- Match-score 4px left-border colour mapping differs from match-badge tiers:
  - **Border**: ≥95 fo / ≥85 sf / else tx3 (saffron in the middle tier)
  - **Badge** (mbadge): ≥90 hi (fol/fo) / ≥70 md (bll/bl) / else lo (cr2/tx3) — blue in the middle tier
  - So an 87% applicant has a **saffron** border but a **blue** match-badge. Don't normalize.
- The avatar size on this screen is **38** (vs 36 on dashboard) — one step larger because the inbox row is the primary surface for the applicant.
- Name fontSize **14.5** (a half-step) — between dashboard's 13.5 and detail-screen's 16.
- Card name row uses `align-items: flex-start` so a long name + match badge stays top-aligned (badge doesn't drift mid-line).
- Lang chip background is `Colors.bll` (admin-blue tint) — not saffron — because language match is an admin-evaluation criterion (logical "match" rather than identity).
- Courses chip uses `.chip.gy` (cream-2 bg / tx2 text) — neutral grey-tan tone signalling experience count (informational, not evaluative).
- "✓" and "✗" glyphs are baked into button labels (prototype line 2047-2049). No separate icon component.
- Reject button uses `.btn.dg` (danger): `url` bg + `ur` text + 1.5px `urd` border — softer than a solid red, but unmistakable.
- Approve button uses `.btn.fo-btn` (forest gradient) — same gradient as the apply CTA on teacher screens. Reuse semantics: green = positive action.

## 13. Acceptance checklist

### Header
- [ ] Kicker 13/tx3/500 "Admin Panel"
- [ ] Title 26/800 "Applications"
- [ ] Bell tile 40×40 r12 `sfl` bg + saffron icon + red 8×8 unread dot
- [ ] Stat chips: 3 entries with chip-coloured (gd/ur/fo) numbers AND labels, label opacity 0.8

### Tab bar
- [ ] White bg, 2px bd bottom border, padding `0 18 10`
- [ ] 3 tabs, capitalize, active = saffron underline + saffron text
- [ ] Underline overlap via `marginBottom: -2`

### Cream gap
- [ ] 8px tall, `Colors.cr` bg, after tabs

### Cards
- [ ] 4px left border by match-tier (≥95 fo / ≥85 sf / else tx3)
- [ ] Avatar 38×38 r19 sfm bg + sfd initial 14/700
- [ ] Name 14.5/700 + mbadge right
- [ ] Course 12/tx2 mt 1
- [ ] Chips: language chips (bll/bl) + N-courses chip (cr2/tx2), 11/600/3-9
- [ ] Applied date 11/tx3 mt 4
- [ ] 3 action buttons: forest-gradient Approve, danger Reject, outline Review →
- [ ] Card tap and Review → both navigate to spec 23

### Empty state
- [ ] Approved/Rejected tabs render the empty-state line (until status field exists)

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors

---

## Implementation notes (post-build corrections)

- **Stat chips** changed from prototype's `Pending / Urgent / Month` to `Pending / Rejected / Approved` — wired to live counts (`useAdminApplicationsStore`). Colours: Pending = `gd/gdl`, Rejected = `ur/url`, Approved = `fo/fol`.
- **Cards on Approved/Rejected tabs** show a non-tappable status pill (`✓ Approved` or `✗ Rejected`) in place of the Approve/Reject buttons, alongside the Review → button. Pill bg matches stat-chip palette; same `minHeight: 34` as the buttons it replaces.
- **Action button heights aligned** via `minHeight: 34` on the outer wrapper because gradient buttons render shorter than bordered ones by default.
- `Approve`/`Reject` actions are wired to `useAdminApplicationsStore` — tapping moves a card to its corresponding tab.
