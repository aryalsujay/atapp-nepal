---
id: 27-admin-notifications
title: Admin Notifications (Notification Center)
route: /(admin)/notifications
prototype: VipassanaTeacherApp/app.html:2487–2523
status: draft
related: [21-admin-dashboard, 23-admin-review]
---

# 27 · Admin Notifications

The Centre Manager's "Notification Center" — log of every notification
the system has sent to teachers (approval / rejection / reminder).
Each card expands inline to reveal the rendered email preview with
**Copy** and **Resend** action buttons. A bottom **Compose
Notification** CTA opens the (future) compose flow.

Reached from the **dashboard's Notification Center card** (spec 21
§7) — not a tab.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/notifications` (hidden from tab bar)             |
| **Component**    | `app/(admin)/notifications.tsx` default `AdminNotificationsScreen` |
| **Prototype**    | `AdminNotifs` function, app.html 2487–2523                  |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. State

```ts
const [expandedId, setExpandedId] = useState<number | null>(null);
```

Tap a card → toggles its expanded body. Only one expanded at a time
(tapping another collapses the prior).

## 3. Data

Hard-coded list of 3 notification logs (matches prototype 2489):

```ts
type NotifType = 'approval' | 'rejection' | 'reminder';
interface AdminNotif {
  id: number;
  type: NotifType;
  time: string;
  read: boolean;
  teacher: string;
  course: string;
  subj: string;
  en: string;
  np: string;
}

const NOTIFS: AdminNotif[] = [
  { id: 1, type: 'approval', time: '2 hours ago', read: false, teacher: 'Bhikkhu Ananda', course: 'Dhamma Shringa — Jul 10-Day', subj: 'Your application has been approved', en: '…full email body…', np: '…पूरा इमेल बडी…' },
  { id: 2, type: 'rejection', time: 'Yesterday', read: true, teacher: 'Rajan Pillai', course: 'Dhamma Adhara — Aug 10-Day', subj: 'Application update — Dhamma Adhara', en: '…', np: '…' },
  { id: 3, type: 'reminder', time: '3 days ago', read: true, teacher: 'All Nepal ATs', course: 'Dhamma Shringa — Aug 10-Day', subj: 'Open course — Nepali-speaking AT needed', en: '…', np: '…' },
];
```

(Full email bodies are in the prototype; we copy them verbatim into the data constant.)

## 4. Type palette

```ts
const TYPE_BORDER = { approval: Colors.fo, rejection: Colors.ur, reminder: Colors.sf };
const TYPE_TILE_BG = { approval: Colors.fol, rejection: Colors.url, reminder: Colors.sfl };
const TYPE_ICON  = { approval: '✅', rejection: '❌', reminder: '📣' };
```

## 5. Layout overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                    │
│   Notifications                              (26/800)             │
│   Sent to teachers                           (13.5/tx2 mt 2)      │
├ 8px cream gap ────────────────────────────────────────────────────┤
│ ┌─ Card (4px left-border by type, 0.88 opacity if read) ──────┐  │
│ │ [✅ tile]  Your application has been approved        ● dot   │  │
│ │           → Bhikkhu Ananda                                  │  │
│ │           📅 Dhamma Shringa — Jul 10-Day · 2 hours ago     │  │
│ │                                                              │  │
│ │   (if expanded)                                              │  │
│ │   ┌─ Email Preview card (cr bg) ────────────────────────┐   │  │
│ │   │ EMAIL PREVIEW · ENGLISH                              │   │  │
│ │   │ Dear Ananda Ji,                                      │   │  │
│ │   │ … full email body with \n preserved …                 │   │  │
│ │   │ [📋 Copy]    [📤 Resend]                              │   │  │
│ │   └─────────────────────────────────────────────────────┘   │  │
│ └─────────────────────────────────────────────────────────────┘  │
│  ... (3 cards)                                                    │
│  [          ✍️ Compose Notification          ]   (full-width)    │
│  (20px footer)                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Tab bar hidden on this route.

## 6. Header

White panel, padding `56 18 14`, top inset.

- Title — fontSize 26, fontWeight 800, color `Colors.tx`: `t('admin.notifications.title')` ("Notifications" / "सूचनाहरू")
- Sub-line — fontSize **13.5**, color `Colors.tx2`, marginTop 2: `t('admin.notifications.sent_to_teachers')` ("Sent to teachers" / "आचार्यहरूलाई पठाइएका" — Acharya-correct)

## 7. Cream gap
`<View style={{ height: 8, backgroundColor: Colors.cr }} />`.

## 8. Notification card

Standard `.card` with overrides:
- `borderLeftWidth: 4`, `borderLeftColor: TYPE_BORDER[n.type]`
- `opacity: n.read ? 0.88 : 1` (read cards slightly dimmer)

Tap card → `setExpandedId(expandedId === n.id ? null : n.id)`.

### 8.1 Top row
`flexDirection: 'row'`, `gap: 10`, `alignItems: 'flex-start'`.

#### 8.1.1 Icon tile
- `width: 38`, `height: 38`, `borderRadius: 11`
- `backgroundColor: TYPE_TILE_BG[n.type]` (fol / url / sfl tint)
- Centred emoji — fontSize 19: `TYPE_ICON[n.type]`
- `flexShrink: 0`

#### 8.1.2 Body (`flex: 1`)
1. Subject row — `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`
   - Subject — fontSize 13, fontWeight 700, color `Colors.tx`, `flex: 1`, paddingRight 8
   - Unread dot (only `!n.read`) — `width: 8`, `height: 8`, `borderRadius: 4`, `backgroundColor: Colors.sf` (saffron — note: NOT the type's accent), `flexShrink: 0`, `marginTop: 4`
2. Recipient — fontSize 11.5, color `Colors.tx2`, marginTop 2: `"→ {n.teacher}"`
3. Course + time — fontSize 11, color `Colors.tx3`, marginTop 1: `"📅 {n.course} · {n.time}"`

### 8.2 Expanded body (only when `expandedId === n.id`)

Inset block below the top row:
- `marginTop: 12`
- `backgroundColor: Colors.cr`
- `borderRadius: 11`
- `paddingHorizontal: 13`, `paddingVertical: 12`

Contents:
- Label — fontSize 10, fontWeight 700, color `Colors.tx2`, `textTransform: 'uppercase'`, `letterSpacing: 0.6` (`10 × 0.06`), marginBottom 7: `"Email Preview · {lang === 'ne' ? 'नेपाली' : 'English'}"`
- Body — fontSize 12.5, color `Colors.tx`, `lineHeight: 12.5 × 1.7 ≈ 21.25`: `lang === 'ne' ? n.np : n.en` (preserves `\n` as line breaks natively in RN `<Text>`)
- Button row — `flexDirection: 'row'`, `gap: 8`, marginTop 11
  - **📋 Copy** — `.btn.ou.sm`: transparent, 2px `Colors.bd2`, color `Colors.tx`, padding 7/15, radius 10, fontSize 12.5, weight 700. `flex: 1`. onPress → use `Clipboard.setString(body)` + Alert "Copied" (or `expo-clipboard`).
  - **📤 Resend** — `.btn.pr.sm`: saffron gradient, white text, same size. `flex: 1`. onPress → Alert "coming soon" for v1.

## 9. Compose CTA

- Container: `paddingHorizontal: 18`, `paddingTop: 4`, `paddingBottom: 12`
- Button — `.btn.fo-btn`: forest gradient `Gradients.forestCta`, white text, paddingVertical 15, paddingHorizontal 22, borderRadius 13, fontSize 15, fontWeight 700, width 100%
- Text: `"✍️ Compose Notification"` / `"✍️ नयाँ सूचना"` — i18n key `compose`
- onPress → `Alert.alert(t('common.coming_soon'))` (v1 placeholder)

## 10. Footer spacer
`<View style={{ height: 20 }} />`.

## 11. Hide tab bar

Add to `app/(admin)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="notifications"
  options={{ href: null, tabBarStyle: { display: 'none' } }}
/>
```
Currently `href: null` only — add the tabBarStyle.

## 12. i18n

New block under `admin.notifications.*`:

| Key                    | EN                              | NE                                     |
|------------------------|---------------------------------|----------------------------------------|
| `title`                | Notifications                   | सूचनाहरू                                |
| `sent_to_teachers`     | Sent to teachers                | आचार्यहरूलाई पठाइएका                    |
| `email_preview`        | Email Preview                   | इमेल पूर्वावलोकन                        |
| `compose`              | ✍️ Compose Notification          | ✍️ नयाँ सूचना                           |

Hard-coded English literals (per prototype):
- `"📋 Copy"`, `"📤 Resend"`
- `"English"` / `"नेपाली"` (lang-aware language indicator next to "Email Preview")

Reuse: `common.coming_soon`.

## 13. Things omitted vs prototype

| Prototype feature            | RN decision                                                       |
|------------------------------|-------------------------------------------------------------------|
| `cursor: 'pointer'`          | `TouchableOpacity activeOpacity={0.85}`                            |
| Multi-expand                 | Single-expand (only one open at a time) — cleaner UX               |
| Real Copy/Resend wiring      | Copy uses `Clipboard.setStringAsync` (expo-clipboard); Resend = Alert "coming soon" |

### 13.1 Other small details to preserve

- Unread dot is **saffron** (`Colors.sf`) — same colour for every notification type. Unread is a single state regardless of type.
- Icon tile bg uses the type's **tint** (`fol`/`url`/`sfl`), not the strong border colour. Softer on the eye when stacked.
- The reminder icon is `📣` (megaphone) — outreach to a group. Different from server-screen's `⏰` (alarm clock) for the same type. Intentional admin/server distinction.
- Recipient line uses `→` arrow prefix to clarify "sent to X" (not "from X").
- Course-line `📅` prefix groups course identifier and timestamp together visually.
- Card opacity drops to `0.88` (not 0.5) when read — subtle de-emphasis without losing legibility.
- "Email Preview" label letter-spacing is `0.6` (10 × 0.06) — matches the dashboard's small uppercase labels.
- Email body lineHeight `1.7` is **looser** than typical (1.4–1.55) — emails are longer-form text; the wider leading aids reading.
- `whiteSpace: pre-line` in CSS preserves `\n` line breaks. RN `<Text>` does this natively — no special handling needed.
- The expanded block sits **inside** the card (not outside). Tap area expands with the content. Tap on the body still toggles closed.
- Compose button uses **forest-gradient** (not saffron) — consistency with the dashboard's primary green-on-create CTA pattern.

## 14. Acceptance checklist

### Header
- [ ] Title "Notifications" 26/800
- [ ] Sub "Sent to teachers" 13.5/tx2 mt 2 (Acharya-correct NE)

### Cards
- [ ] 4px left-border by type (fo/ur/sf)
- [ ] Card opacity 0.88 if read, 1 if unread
- [ ] 38×38 r11 icon tile with fol/url/sfl bg + 19px emoji (✅/❌/📣)
- [ ] Subject 13/700, unread dot 8×8 saffron mt 4 only when !read
- [ ] Recipient line 11.5/tx2 with `→` prefix
- [ ] Course+time line 11/tx3 with `📅` prefix
- [ ] Tap toggles expanded; only one open at a time

### Expanded block
- [ ] cr bg, r11, padding 13/12
- [ ] Label 10/700/tx2 uppercase letter-spacing 0.6
- [ ] Body 12.5/tx lineHeight 21.25 with `\n` preserved
- [ ] Copy + Resend buttons row (outline + saffron-gradient, fontSize 12.5)

### Compose CTA
- [ ] Forest-gradient full-width button "✍️ Compose Notification"

### Cross-cutting
- [ ] Tab bar hidden
- [ ] Copy actually writes to clipboard
- [ ] No TS errors

---

## Implementation notes (post-build corrections)

- **Tab bar is visible on this route** (removed the `tabBarStyle: { display: 'none' }` override from `(admin)/_layout.tsx`). User needs global nav back to other admin tabs. Spec §14's "Tab bar hidden" line is stale.
- **Admin dashboard now has a quick bell shortcut** in the hero top-right — see spec 21 notes. The Notification Center card on the dashboard stays as the primary path.
- **Copy button** shows an informational Alert noting `expo-clipboard` is required for real clipboard wiring. To enable, install `expo-clipboard` and replace the Alert handler with `Clipboard.setStringAsync(body)`.
- **Resend** and **Compose** are v1 `coming_soon` Alerts.
