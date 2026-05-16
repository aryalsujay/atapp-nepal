---
id: 17-server-applications
title: Server Applications (My Service)
route: /(server)/applications
prototype: VipassanaTeacherApp/app.html:2823–2862
status: draft
related: [16-server-apply, 18-server-application-detail]
---

# 17 · Server Applications (My Service)

The "My Service" tab — list of every application a Server has filed,
each card colour-accented by status (approved/pending/rejected). Tap a
card → application detail (spec 18). Footer button → opportunities
list to apply again.

---

## 1. Identity

| Property         | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/applications` (tab 3 — `InboxIcon`)              |
| **Component**    | `app/(server)/applications/index.tsx` default `ServerApplicationsScreen` |
| **Prototype**    | `ServerApps` function, app.html 2823–2862                   |
| **Status bar**   | `barStyle="dark-content"` (page is light)                   |
| **Safe area**    | Top inset added to header `paddingTop`                      |

## 2. Layout (top → bottom)

```
┌─ Header (white) ──────────────────────────────────────────────────────┐
│  My Service                            (fontSize 26 / weight 800)     │
│  3 applications · 1 confirmed          (13.5 / tx2 / mt 2)            │
├─ 8px cream gap ───────────────────────────────────────────────────────┤
│  ┌─ Card · 4px left-border colour by status ──────────────────────┐   │
│  │ Dhamma Shringa                              [✓ Confirmed]      │   │
│  │ 10-Day · Jul 7–18, 2026                                        │   │
│  │ Applied Apr 20 · Full course                                   │   │
│  │ [🍳 Kitchen][🍽 Dining]                                         │   │
│  │ (optional reason box if rejected)                              │   │
│  │                                          View Details →        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ... (one card per serverApplication)                                 │
│  ┌─ Browse more button (full width, svl bg) ──────────────────────┐   │
│  │ Browse More Courses →                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  (20px footer)                                                        │
└───────────────────────────────────────────────────────────────────────┘
                ┌─ Bottom Tab Bar (visible) ─┐
```

## 3. Header

White panel (continues `Colors.white` from the SBar).

| Property               | Value                                                     |
|------------------------|-----------------------------------------------------------|
| Background             | `Colors.white`                                            |
| Padding                | `paddingTop: Math.max(56, insets.top + 14)`, `paddingHorizontal: 18`, `paddingBottom: 14` |
| Title                  | fontSize 26, fontWeight 800, color `Colors.tx` — `t('server.applications.title')` ("My Service" / "मेरो सेवा") |
| Sub-line               | fontSize **13.5** (note: half-step), color `Colors.tx2`, marginTop 2 |
| Sub-line format        | `"{n} {applications_lbl} · {m} {confirmed_lbl}"`           |

- `n = serverApplications.length`
- `m = serverApplications.filter(a => a.status === 'approved').length`
- `applications_lbl`: "applications" / "आवेदन"
- `confirmed_lbl`: "confirmed" / "पुष्टि"

Both label words are independent i18n keys (prototype uses inline ternaries — line 2833 — so each word translates separately).

## 4. Cream gap

`<View style={{ height: 8, backgroundColor: Colors.cr }} />` immediately after the header. Separates white panel from the scrolling card list.

## 5. Application card

Each entry in `serverApplications` becomes one tappable card.

### 5.1 Base
Standard `.card` (white, padding 15, borderRadius 16, marginHorizontal 18, marginBottom 11, shadow). Adds:

- `borderLeftWidth: 4`
- `borderLeftColor` by `a.status`:
  - `approved` → `Colors.fo` (`#3D6847`)
  - `pending` → `#9B6B14`
  - `rejected` → `Colors.bd2` (`#DDD4C5`) — muted, almost no accent

Tap → `router.push(routeTo.serverApplicationDetail(a.id))`.

### 5.2 Top row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, `marginBottom: 8`.

Left (`flex: 1`, `paddingRight: 8`):
- Title — fontSize **15**, fontWeight 700, color `Colors.tx`: `a.center`
- Sub 1 — fontSize **12.5**, color `Colors.tx2`: `"{a.type} · {a.dates}"`
- Sub 2 — fontSize 11, color `Colors.tx3`, marginTop 1:
  - EN: `"Applied {a.applied} · {duration}"` where `duration` is `"Full course"` or `"Partial: Day 3–8"`
  - NE: `"आवेदन {a.applied} · {duration}"` where `duration` is `"पूरा शिविर"` or `"आंशिक: Day 3–8"`
  - The literal `"Applied"`/`"आवेदन"` translates; `a.applied` is the raw date string (stays English in data).

Right — status pill (reused from spec 13 dashboard's confirmed pill, with variants):
- `approved` → `.spill.appr` — bg `Colors.fol`, color `Colors.fo`, text `t('server.applications.status.approved')` ("✓ Confirmed" / "✓ पुष्टि")
- `pending` → `.spill.pend` — bg `Colors.gdl`, color `Colors.gd`, text `t('server.applications.status.pending')` ("⏳ Pending" / "⏳ विचाराधीन")
- `rejected` → `.spill.reje` — bg `Colors.url`, color `Colors.ur`, text `t('server.applications.status.rejected')` ("Not Selected" / "छनोट भएन")

Pill: `paddingHorizontal: 11`, `paddingVertical: 5`, `borderRadius: 20`, fontSize **11.5** (note: NOT the 10 we used in spec 13's overridden case — here it's the base `.spill` size), fontWeight 700, `flexShrink: 0`.

### 5.3 Area chips row
`flexDirection: 'row'`, `gap: 5`, `flexWrap: 'wrap'`, `marginBottom: ${a.status === 'rejected' ? 8 : 0}` (conditional gap because the reason box follows when rejected).

Each chip from `a.areas`:
- fontSize **10**, padding **2/7**, borderRadius 20, bg `Colors.svl` (`#FBF0E0`), color `#9B6B14`, fontWeight 600
- Content: `${sa.emoji} ${sa.label}` — English labels always

### 5.4 Rejection reason box (only when `status === 'rejected'` and `a.reason`)

Container:
- Background `Colors.url` (`#FDECEA`)
- borderRadius 10
- `paddingHorizontal: 11`, `paddingVertical: 9`

Inside (2 lines):
- Reason header — fontSize 11, fontWeight 700, color `Colors.ur`, marginBottom 2: `t('server.applications.reason_lbl')` → `"Reason:"` / `"कारण:"`
- Reason text — fontSize 12, color `Colors.ur`: `a.reason`

### 5.5 "View Details →" link

Bottom-right footer of the card:
- `textAlign: 'right'`, fontSize 11, color `#9B6B14`, fontWeight 600, marginTop 6
- Text: `t('server.applications.view_details')` → `"View Details →"` / `"विवरण हेर्नुहोस् →"` (reuse existing key if present, otherwise add)

This is **not** a separate tap target — the entire card is the press surface; this link is just a visual affordance.

## 6. Browse More CTA

After all cards. Standalone button, full-width:

| Property         | Value                                                         |
|------------------|---------------------------------------------------------------|
| Container        | `paddingHorizontal: 18`, `paddingVertical: 6`                  |
| Button           | width 100%, paddingVertical 13, borderRadius 13                |
| Background       | `Colors.svl` (`#FBF0E0`)                                      |
| Text             | fontSize **14**, fontWeight 700, color `#9B6B14`, textAlign center |
| Text             | `t('server.applications.browse_more')` → `"Browse More Courses →"` / `"थप शिविरहरू →"` |
| onPress          | `router.push(Routes.serverOpportunities)`                      |

No gradient, no border — flat saffron-tinted background.

## 7. Empty state

If `serverApplications.length === 0`:

- Text centred, paddingVertical 40, fontSize 13, color `Colors.tx3`:
  - EN: `"You haven't applied to any courses yet."`
  - NE: `"तपाईंले अहिलेसम्म कुनै शिविरमा आवेदन दिनुभएको छैन।"`
- The Browse More CTA still renders below — gives a clear next action.

## 8. Footer spacer
`<View style={{ height: 20 }} />` plus `paddingBottom: insets.bottom + 8` on ScrollView content.

## 9. Behaviour

| Trigger                    | Action                                                       |
|----------------------------|--------------------------------------------------------------|
| Tap card body              | `router.push(routeTo.serverApplicationDetail(a.id))`         |
| Tap "Browse More Courses →"| `router.push(Routes.serverOpportunities)`                    |

Pull-to-refresh: not in prototype; skip.

## 10. i18n

New block under `server.applications.*` (replace existing `applications` block from old WIP):

| Key                            | EN                                          | NE                                                |
|--------------------------------|---------------------------------------------|---------------------------------------------------|
| `title`                        | My Service                                  | मेरो सेवा                                          |
| `applications_lbl`             | applications                                | आवेदन                                              |
| `confirmed_lbl`                | confirmed                                   | पुष्टि                                             |
| `applied_lbl`                  | Applied                                     | आवेदन                                              |
| `full_course`                  | Full course                                 | पूरा शिविर                                         |
| `partial_lbl`                  | Partial                                     | आंशिक                                              |
| `reason_lbl`                   | Reason:                                     | कारण:                                              |
| `view_details`                 | View Details →                              | विवरण हेर्नुहोस् →                                 |
| `browse_more`                  | Browse More Courses →                       | थप शिविरहरू →                                      |
| `empty_state`                  | You haven't applied to any courses yet.    | तपाईंले अहिलेसम्म कुनै शिविरमा आवेदन दिनुभएको छैन। |
| `status.approved`              | ✓ Confirmed                                 | ✓ पुष्टि                                           |
| `status.pending`               | ⏳ Pending                                  | ⏳ विचाराधीन                                       |
| `status.rejected`              | Not Selected                                | छनोट भएन                                           |

> `applied_lbl` and `applications_lbl` both render the same Devanagari word `"आवेदन"` (no plural variation) — but the EN values differ. Keep both keys.

## 11. Things being omitted vs prototype

| Prototype style               | RN decision                                    |
|-------------------------------|------------------------------------------------|
| `cursor: 'pointer'`           | TouchableOpacity activeOpacity                  |
| `.card.c-ptr:active { scale .975 }` | Skip — opacity feedback                  |
| Inline ternaries for labels   | Translate via i18n keys                        |

### 11.1 Other small details to preserve

- Card title fontSize **15** matches opportunities list (spec 14), not the smaller 14 used on dashboard.
- The status pill uses the **base** `.spill` fontSize of **11.5**, not the inline-overridden 10 used in the dashboard's upcoming-service card.
- All status pill texts include their glyph (`✓`, `⏳`) inside the i18n string — no separate icon component.
- Rejected pill text is plain `"Not Selected"` — **no `✗` glyph** (unlike approved/pending). Prototype hard-codes it this way.
- Status colour table uses the existing `StatusColors` token from `src/theme/colors.ts` — saves duplicating shades.
- Area chip fontSize **10** + padding **2/7** matches dashboard/opportunities cards (smaller than the 11/5×10 chips on course detail).
- The "View Details →" text is NOT a TouchableOpacity — pressing it inherits the parent card's tap. Only one tap target per card.
- The reason box `borderRadius: 10` is **smaller** than the standard card's 16 — keeps the embed feeling like a callout, not a sub-card.
- Conditional `marginBottom` on the area chips row: `8` when followed by reason box, `0` otherwise. The "View Details →" line then carries its own `marginTop: 6` for the trailing whitespace.
- Browse More button uses `Colors.svl` directly — no border, no shadow.

## 12. Acceptance checklist

### Header
- [ ] Title `My Service` / `मेरो सेवा` at 26/800
- [ ] Sub-line `{n} applications · {m} confirmed` at 13.5/tx2
- [ ] 8px cream gap follows

### Card
- [ ] 4px left-border colour matches status: fo / 9B6B14 / bd2
- [ ] Title 15/700, sub-1 12.5/tx2, sub-2 11/tx3 with `Applied {date} · {duration}`
- [ ] Status pill: `.spill` style with 11.5px text, correct bg/text colour per status
- [ ] Status pill text includes glyph (`✓` / `⏳`); rejected has no glyph
- [ ] Area chips: 10/2-7/svl/9B6B14/600, English labels
- [ ] Conditional `marginBottom: 8` on area chips when rejected (else 0)
- [ ] Rejection reason: only when status==='rejected' && reason; url bg, radius 10, header 11/700/ur + body 12/ur
- [ ] "View Details →" right-aligned 11/600/9B6B14 marginTop 6
- [ ] Card-body tap navigates to spec 18 detail

### CTA
- [ ] Browse More button: svl bg, 9B6B14 text 14/700, paddingVertical 13, radius 13
- [ ] Tap navigates to `Routes.serverOpportunities`

### Empty state
- [ ] When 0 applications: centred empty-state text + Browse More button still visible

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors
- [ ] Reuses `StatusColors` token from colors.ts
