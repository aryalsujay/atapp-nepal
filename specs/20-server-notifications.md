---
id: 20-server-notifications
title: Server Notifications
route: /(server)/notifications
prototype: VipassanaTeacherApp/app.html:3307–3374
status: draft
related: [11-teacher-notifications, 18-server-application-detail]
---

# 20 · Server Notifications

The Notifications tab for a Server. **Single component** with two view
modes: a list and a detail (the `open` notification swaps the screen
content — there's no separate route, identical pattern to spec 11
teacher notifications).

Three notification types (each with its own emoji + accent):

| Type        | Icon | Accent colour     | Meaning                          |
|-------------|------|-------------------|----------------------------------|
| `approval`  | ✅   | `Colors.fo`        | Service application approved     |
| `rejection` | ⚠️   | `#B85040`          | Application not selected         |
| `reminder`  | ⏰   | `#9B6B14`          | Pre-arrival or schedule reminder |
| _(default)_ | 🔔   | `Colors.bl`        | Generic / unknown type           |

Read-state visual treatment: unread cards have `fol` background tint +
800-weight subject + saffron unread-dot. Read cards have white bg +
600-weight subject + no dot.

---

## 1. Identity

| Property        | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/notifications` (tab 4 — `BellIcon`)             |
| **Component**    | `app/(server)/notifications.tsx` default `ServerNotificationsScreen` |
| **Prototype**    | `ServerNotifs` function, app.html 3307–3374                 |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |
| **Safe area**    | Top inset added to header `paddingTop`                      |

Tab bar **visible** in both list and detail states (the detail view stays inside the tab — no full-screen takeover).

## 2. State

```ts
const [open, setOpen] = useState<ServerNotification | null>(null);
```

Tapping a card sets `open` to that notification. Tapping back resets to `null`. **No mutation** of the read state in v1 — read/unread is hard-coded in seed data.

## 3. Data

Add `src/data/serverNotifications.json` (new file, matching prototype seed):

```json
[
  {
    "id": 1,
    "type": "approval",
    "time": "2 hours ago",
    "read": false,
    "center": "Dhamma Shringa",
    "course": "Dhamma Shringa — Jul 10-Day",
    "subj": "Your service application has been approved",
    "en": "Dear Priya Ji,\n\nWith great joy we confirm your service at Dhamma Shringa for the 10-Day course Jul 7–18, 2026 in the Kitchen & Dining areas.\n\nPlease arrive by 7:00 AM on July 6. Bring your ID, two pairs of comfortable clothing, a shawl, and a flashlight.\n\nIn Dhamma,\nDhamma Shringa Management",
    "np": "प्रिय प्रिया जी,\n\nधम्म श्रृंगमा जुलाई ७–१८, २०२६ को १०-दिने पाठ्यक्रममा भान्सा र भोजन कक्षमा तपाईंको सेवा पुष्टि गर्न पाउँदा खुसी छौं।\n\nकृपया जुलाई ६ को बिहान ७:०० बजेसम्म आइपुग्नुहोस्। परिचयपत्र, दुई जोर सजिलो लुगा, शाल र टर्च ल्याउनुहोस्।\n\nधम्ममा,\nधम्म श्रृंग व्यवस्थापन"
  },
  {
    "id": 2,
    "type": "reminder",
    "time": "Yesterday",
    "read": false,
    "center": "Dhamma Shringa",
    "course": "Pre-arrival reminder",
    "subj": "Reminder: arrival in 2 weeks",
    "en": "Dear Priya Ji,\n\nThis is a reminder that your service at Dhamma Shringa begins on July 7. Please review the arrival checklist in the app.\n\nSadhu 🙏",
    "np": "प्रिय प्रिया जी,\n\nधम्म श्रृंगमा तपाईंको सेवा जुलाई ७ बाट सुरु हुन्छ। कृपया एपमा आगमन चेकलिस्ट हेर्नुहोस्।\n\nसाधु 🙏"
  },
  {
    "id": 3,
    "type": "rejection",
    "time": "3 days ago",
    "read": true,
    "center": "Dhamma Adhara",
    "course": "Dhamma Adhara — Aug 10-Day",
    "subj": "Application update — Dhamma Adhara",
    "en": "Dear Priya Ji,\n\nThank you for offering to serve. The Compound area for Aug 2–13 is now fully booked. We will keep you in mind for future courses.\n\nIn Dhamma,\nDhamma Adhara",
    "np": "प्रिय प्रिया जी,\n\nसेवा गर्ने प्रस्तावका लागि धन्यवाद। अगस्ट २–१३ का लागि परिसर क्षेत्र पूर्ण भइसकेको छ। भविष्यका शिविरहरूका लागि सम्झनेछौं।\n\nधम्ममा,\nधम्म आधार"
  }
]
```

Add a `ServerNotification` interface to `src/data/index.ts` and export `serverNotifications`. The `time` string stays a plain English literal in both languages (prototype hard-codes `"2 hours ago"` etc.; no translation in prototype).

## 4. Helpers

```ts
function notifIcon(type: string): string {
  if (type === 'approval') return '✅';
  if (type === 'rejection') return '⚠️';
  if (type === 'reminder') return '⏰';
  return '🔔';
}

function notifColor(type: string): string {
  if (type === 'approval') return Colors.fo;
  if (type === 'rejection') return '#B85040';
  if (type === 'reminder') return '#9B6B14';
  return Colors.bl;
}
```

Both helpers live at the top of the component file (not extracted — local to this screen). Tile background uses `${color}22` (RGBA hex-8 ≈ 13% alpha), same trick used on profile expertise tiles.

## 5. List view

### 5.1 Header (white panel)
- Background `Colors.white`
- `paddingTop: Math.max(56, insets.top + 14)`, `paddingHorizontal: 18`, `paddingBottom: 14`
- Title — fontSize **26**, fontWeight 800, color `Colors.tx`: `t('server.notifications.title')` ("Notifications" / "सूचनाहरू")
- Sub-line — fontSize 13, color `Colors.tx2`, marginTop 2: `"{unread} {new_lbl} · {total} {total_lbl}"`
  - `new_lbl`: `"new"` / `"नयाँ"`
  - `total_lbl`: `"total"` / `"कुल"`
  - Two-word substitutions, prototype line 3351 uses inline ternaries — keep as separate i18n keys.

### 5.2 Cream gap
`<View style={{ height: 8, backgroundColor: Colors.cr }} />` immediately after the header.

### 5.3 Notification card

Standard `.card` (white, padding 15, radius 16, mh 18, mb 11, shadow) **with overrides**:

- `borderLeftWidth: 4`, `borderLeftColor: notifColor(n.type)`
- `backgroundColor: n.read ? Colors.white : Colors.fol` — **unread cards have forest-light bg**

Tap → `setOpen(n)`.

#### 5.3.1 Card row
- `flexDirection: 'row'`, `alignItems: 'flex-start'`, `gap: 11`

#### 5.3.2 Icon tile (`flexShrink: 0`)
- `width: 38` (smaller than profile's 42 or detail's 46)
- `height: 38`, `borderRadius: 11`
- `backgroundColor: ${notifColor(n.type)}22` (tinted bg)
- centered emoji fontSize 18

#### 5.3.3 Content column (`flex: 1`, `minWidth: 0`)
1. Top-row (row, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, `gap: 6`):
   - Subject — fontSize **13.5**, fontWeight `n.read ? '600' : '800'`, color `Colors.tx`, lineHeight 17.55 (×1.3)
   - Unread dot (`!n.read` only):
     - `width: 8, height: 8, borderRadius: 4` (perfect circle)
     - `backgroundColor: '#9B6B14'`
     - `flexShrink: 0`, `marginTop: 5` (aligns with subject baseline)
2. Centre name — fontSize 11.5, color `Colors.tx3`, marginTop 2: `n.center`
3. Timestamp — fontSize 11, color `Colors.tx3`, marginTop 1: `n.time` (English literal)

### 5.4 Footer spacer
`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView content.

### 5.5 Empty state
If `serverNotifications.length === 0`:
- Centred fontSize 13, color `Colors.tx3`, `paddingVertical: 40`
- EN: `"No notifications yet."`
- NE: `"अहिलेसम्म कुनै सूचना छैन।"`

## 6. Detail view

When `open !== null`, render this layout instead of the list.

### 6.1 Header (white panel)
- Background `Colors.white`
- `paddingTop: Math.max(56, insets.top + 14)`, `paddingHorizontal: 18`, `paddingBottom: 14`

#### 6.1.1 Back link
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 4`, `marginBottom: 8`
- SVG back arrow 18×18 — `M15 18L9 12L15 6`, strokeWidth 2.2, stroke `#9B6B14`
- Label: `t('common.back')` — fontSize 13, color `#9B6B14`, fontWeight 600
- onPress → `setOpen(null)`

#### 6.1.2 Identity row
- `flexDirection: 'row'`, `gap: 11`, `alignItems: 'flex-start'`

Icon tile:
- `width: 46`, `height: 46`, `borderRadius: 13` (bigger than list's 38/11)
- `backgroundColor: ${notifColor(open.type)}22`
- Centered emoji fontSize 22

Content (`flex: 1`):
- Subject — fontSize 16, fontWeight 800, lineHeight 20.8 (×1.3), color `Colors.tx`: `open.subj`
- Meta — fontSize 12, color `Colors.tx3`, marginTop 3: `"{open.center} · {open.time}"`

### 6.2 Cream gap
`<View style={{ height: 8, backgroundColor: Colors.cr }} />`

### 6.3 Body card

Standard `.card` with **`margin: 14`** (all sides — different from sectioncards). Prototype line 3331 uses `margin: 14`.

> ⚠️ Detail re-check: prototype style is `margin:14`. Single value = all sides. So in RN: `margin: 14` (overrides default `.card` `marginHorizontal: 18, marginBottom: 11`). So **`margin: 14`** literal, not `margin 0 18`. That means horizontal margin is 14 here (not 18 like everything else).

Card content:
- Body — fontSize **13.5**, color `Colors.tx`, lineHeight 21.6 (×1.6)
- Pre-wrap text — preserve `\n` line breaks. In RN, `\n` in a `<Text>` string renders as a hard break naturally.

Text source: `lang === 'ne' ? open.np : open.en`.

### 6.4 Action button (approval only)

When `open.type === 'approval'`:
- Container: `paddingHorizontal: 18`, `paddingVertical: 6`
- Full-width gradient button:
  - Gradient `['#9B6B14', '#6B4610']` at 135°
  - `paddingVertical: 15`, `borderRadius: 13`
  - Text fontSize 15, fontWeight 700, color white: `t('server.notifications.view_apps')` reuses spec 17 key
- onPress → `setOpen(null)` first, then `router.push(Routes.serverApplications)`

Other types: no action button. Just the body card and 20px footer.

### 6.5 Footer spacer
`<View style={{ height: 20 }} />`.

## 7. Behaviour

| Trigger                  | Action                                                       |
|--------------------------|--------------------------------------------------------------|
| Tap notification card    | `setOpen(notification)`                                      |
| Tap Back (in detail)     | `setOpen(null)`                                              |
| Tap View My Applications | `setOpen(null); router.push(Routes.serverApplications)`     |

The "Notifications" tab badge (set by `_layout.tsx`) currently shows
`unread = 0` — wire to a real count via `useNotificationsStore` when
that store grows server support. Out of scope for v1.

## 8. i18n

New block under `server.notifications.*`:

| Key                | EN                              | NE                                       |
|--------------------|---------------------------------|-------------------------------------------|
| `title`            | Notifications                   | सूचनाहरू                                   |
| `new_lbl`          | new                             | नयाँ                                       |
| `total_lbl`        | total                           | कुल                                        |
| `empty_state`      | No notifications yet.           | अहिलेसम्म कुनै सूचना छैन।                  |
| `view_apps`        | View My Applications            | मेरा आवेदनहरू हेर्नुहोस्                   |

Reuse: `common.back`.

> `view_apps` text is identical to `server.applicationDetail.view_apps` and `server.apply.view_apps` — keep its own scoped key for cohesion (small duplication, easy to change later).

## 9. Things being omitted vs prototype

| Prototype style                  | RN decision                                         |
|----------------------------------|------------------------------------------------------|
| `cursor: 'pointer'`              | TouchableOpacity activeOpacity                        |
| `whiteSpace: 'pre-wrap'`         | RN `<Text>` preserves `\n` natively                  |
| `:active { scale .975 }`         | Opacity feedback                                     |
| Modal-style detail               | Same-route state swap (RN convention)                 |

### 9.1 Other small details to preserve

- The icon-tile sizes step up between list (**38**) and detail (**46**) — visual weight increases when zoomed in.
- The icon-tile `borderRadius` steps up similarly (11 vs 13) — keeps `borderRadius / width ≈ 0.29` ratio constant.
- Unread cards' `borderLeftColor` = type accent, but the background is `Colors.fol` (forest-light) **regardless of type**. So a rejection card with `fol` bg + `#B85040` border has a mild visual mismatch — that's the prototype's intent (unread is unread, accented by type).
- Unread dot is server-accent `#9B6B14` — **not** type-coloured. This is a single colour for "you haven't read this," not per-type.
- Unread dot `marginTop: 5` aligns with the typographic centre of the subject's first line, not the top edge.
- Subject weight switch: 800 unread, 600 read. **Not** 700/400 — both stay heavy because 600 is the floor for primary list-text.
- Detail header re-uses the white panel pattern from the list (same paddings). Visual continuity.
- Detail body card uses `margin: 14` (all sides), not the section-card `margin: 0 18` — sets it apart from other cards and gives a slightly tighter look.
- Body lineHeight `1.6 × 13.5 ≈ 21.6` is **looser** than typical card body (1.4–1.55) — improves long-form email-style reading.
- Approval-only CTA mirrors spec 16 / 17 / 18 gradient — same `#9B6B14 → #6B4610` at 135°. Don't introduce a new gradient.
- After tapping View My Applications, we `setOpen(null)` first so the user returning to the tab sees the list, not stale detail.
- The notification list is sorted by **prototype-declared order**: id 1 (approval, newest), id 2 (reminder), id 3 (rejection, oldest). No client-side sort.
- `time` is always English (`"2 hours ago"` / `"Yesterday"` / `"3 days ago"`) — prototype doesn't translate timestamps. Keep as-is.
- `n.course` field exists in seed but **isn't rendered** in either list or detail. Reserved for future filtering — keep in the data shape.

## 10. Acceptance checklist

### List view
- [ ] Title 26/800, sub-line `{unread} new · {total} total` at 13/tx2 mt 2
- [ ] 8px cream gap
- [ ] Per card: 4px left-border = type accent; bg `fol` if unread else white
- [ ] Icon tile 38×38 radius 11 with `${accent}22` bg, emoji 18
- [ ] Subject 13.5/`n.read?600:800`, lineHeight 17.55
- [ ] Unread dot 8×8 `#9B6B14` mt 5, only when !read
- [ ] Center 11.5/tx3 mt 2, time 11/tx3 mt 1
- [ ] Empty state when no notifications

### Detail view
- [ ] White header with back link (`#9B6B14` arrow + label)
- [ ] Identity row: 46×46 icon tile r13, subject 16/800 lh 20.8, meta 12/tx3 mt 3
- [ ] 8px cream gap
- [ ] Body card `margin: 14` all sides (NOT 0/18), body 13.5/tx lineHeight 21.6
- [ ] `\n` rendered as hard breaks
- [ ] When approval: gradient CTA "View My Applications" (`#9B6B14 → #6B4610` 135°)

### Data
- [ ] `src/data/serverNotifications.json` created with 3 entries
- [ ] `ServerNotification` type added to `src/data/index.ts`
- [ ] Exported as `serverNotifications`

### Cross-cutting
- [ ] Tab bar visible (no hide override)
- [ ] No TS errors
- [ ] Reuses `common.back` i18n key
