# Spec: Teacher Notifications

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `11-teacher-notifications` |
| Route (Expo Router) | `/(teacher)/notifications` |
| Source file | `app/(teacher)/notifications.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `3377–3490` |
| Roles | `teacher` |
| Related specs | `06-teacher-course-detail`, `07-teacher-course-brief`, `08-teacher-applications` |

---

## 2. Purpose

The teacher's inbox: invites from admins (which they accept/decline inline), assignment confirmations (which link straight to the pre-course brief), and reminders / updates. The unread count badge on the tab bar pulls from the same store that this screen renders.

Two states share one route:
- **List view** — every notification stacked, newest first, with a coloured left border by type and an unread dot.
- **Detail view** — when a notification is tapped, the screen replaces the list with the notification body + type-specific CTAs (accept/decline for invites; "View Course Brief" for assignments).

---

## 3. Type system (5 notification kinds, matches prototype)

| Type | Emoji | Border / accent | Use |
|---|---|---|---|
| `invite` | 📬 | `#5B6FA8` (cool blue) | Admin invited this teacher to a course. Needs accept/decline. |
| `assignment` | 📋 | `Colors.fo` (forest) | Admin assigned + confirmed the teacher. Links to course brief. |
| `reminder` | ⏰ | `#9B6B14` (gold-dark) | "Sit reminder" / "Festival deadline" / "Update profile" nudges. |
| `update` | 🔄 | `Colors.bl` (blue) | Course schedule change, system updates. |
| `default` (any other) | 🔔 | `Colors.tx3` | Fallback. |

The icon tile uses the accent colour at 13% alpha (CSS `+"22"`). Implementation: `accent + '22'` for the tile bg, accent itself for the left-border / text.

---

## 4. Layout zones — LIST view (top → bottom)

### 4.1 Plain white header (no gradient)

`paddingHorizontal: 18, paddingTop: max(56, safeAreaTop + 14), paddingBottom: 14`.

- **Title** — `Notifications` (`notifs`), **26 px / 800 / Plus Jakarta Sans ExtraBold / `Colors.tx`**.
- **Subtitle** — `{N} new · {M} total`, **13 px / `Colors.tx2`**, marginTop 2.

### 4.2 Cream divider strip

8 px tall, `Colors.cr` background.

### 4.3 Notification card stack

One card per notification (newest first). Standard `.card` (radius 16, padding 15, margin 0/18/11, `Shadows.card`) plus:

- **Left border** — 4 px solid, accent colour per type.
- **Background** — `Colors.fol` (forest tint) when **unread**, `Colors.white` when read.
- TouchableOpacity wrapper, `activeOpacity={0.85}`. Tapping marks read + opens detail view.

#### Top row (`flexDirection: row, gap: 11, alignItems: flex-start`)

- **Icon tile** — **38 × 38**, radius **11**, accent-bg-at-13%, centred icon emoji **18 px**.
- **Body column** (flex 1, `minWidth: 0` for ellipsis):
  - **Subject row** (`flexDirection: row, justifyContent: space-between, alignItems: flex-start, gap: 6`):
    - Subject text — **13.5 px / `Colors.tx`**, `lineHeight: 18`. Weight: **800 if unread**, **600 if read**.
    - Unread dot — **8 × 8** circle, `Colors.fo` bg, `marginTop: 5`. Hidden when read.
  - Course line — **11.5 px / `Colors.tx3`**, marginTop 2. From `notification.course`.
  - Time line — **11 px / `Colors.tx3`**, marginTop 1. Relative time string via `formatNotifTime`.

#### Conditional footer (per-type)

- **`invite`** — `marginTop: 7, paddingTop: 7`, then a `DashedDivider` (RN's `borderStyle: 'dashed'` doesn't render reliably for single-side borders). Inside: `flexDirection: row, justifyContent: space-between, alignItems: center`.
  - Left chip — fontSize **10.5** (overrides the default chip 11), padding 3 / 9, radius 20:
    - `pending` → `.chip.gy` (`Colors.cr2` / `Colors.tx2`) `⏳ Response needed`
    - `accepted` → `.chip.fo` (`Colors.fol` / `Colors.fo`) `✓ Accepted`
    - `rejected` → `.chip.ur` (`Colors.url` / `Colors.ur`) `✗ Declined`
  - Right caption (only when `pending`) — `Tap to respond →`, **11 px / 700 / `#5B6FA8`**.
- **`assignment`** with a matching course in `coursesStore`:
  - `marginTop: 8, paddingTop: 8`, then a `DashedDivider`. Stack of 2 text rows:
    - `✓ Confirmed` — **11 px / 700 / `Colors.fo`**.
    - `📅 {dates} · 🛬 {arrivalDate}` — **11 px / `Colors.tx2`**.
- Other types: no footer.

---

## 5. Layout zones — DETAIL view (top → bottom)

When `selected !== null`, the list view is hidden and the detail panel renders instead. State is local to the screen component (not navigation-based).

### 5.1 Plain white header

Same padding shape as list (`56 / 18 / 14`).

- **Back row** (`flexDirection: row, gap: 4, alignItems: center, marginBottom: 8`):
  - SVG chevron `M15 18L9 12L15 6`, stroke `Colors.sf`, 18 × 18, strokeWidth 2.
  - `Back` label — 13 / 600 / `Colors.sf`.
- **Header row** (`flexDirection: row, gap: 11, alignItems: flex-start`):
  - Larger icon tile — **46 × 46**, radius **13**, accent-bg-at-13%, centred icon emoji **22 px**.
  - Right column:
    - Subject — **16 px / 800 / `Colors.tx`**, `lineHeight: 21`.
    - Meta — `{center} · {timeAgo}`, **12 px / `Colors.tx3`**, marginTop 3.
    - **For invites only** — status chip (same palette as list view) below meta, marginTop 6. Text: `✓ Accepted` / `✗ Declined` / `⏳ Awaiting your response`. Display `inline-flex`.

### 5.2 Cream divider strip (same 8 px)

### 5.3 Body card

`margin: 14`. Standard `.card` body — **13.5 px / `Colors.tx`**, `lineHeight: 22` (≈ 13.5 × 1.6), `whiteSpace: pre-wrap` equivalent (RN: `<Text>` preserves \n). Renders `body` in the current language (`bodyEn` / `bodyNe`).

### 5.4 Invite response zone

Only when `type === 'invite' && status === 'pending'`. Wrapper: `paddingHorizontal: 18, paddingBottom: 10` (no top padding — the body card above already has margin).

Two sub-states:

#### a) Default state — 2 buttons side-by-side

`flexDirection: row, gap: 8`:

- **Accept** (`.btn.pr.sm`, `flex: 1`) — primary orange-gradient (135° linear), padding 7 / 15, fontSize 12.5 / 700, radius 10, shadow `0 4px 16px rgba(212,118,14,0.32)`. Text `✓ Accept Invitation`. Tap: `respondToInvite(id, 'accepted')` → close detail → success toast.
- **Decline** (`.btn.ou.sm`, `flex: 1`) — outline with `borderColor: '#F5C0BB'` (red-tinted), `color: Colors.ur`, padding 7 / 15, fontSize 12.5 / 700, radius 10. Tap flips to decline-reason state.

#### b) Decline-reason state

- TextInput (`.inp` styling — `Colors.cr` bg, 1.5 px `Colors.bd` border, radius 12, padding 13 / 15, fontSize 14, fontFamily Plus Jakarta Sans, lineHeight **21** (= 14 × 1.5)). Plus multiline-specific:
  - `multiline: true`, `textAlignVertical: 'top'`
  - `minHeight: 90` (≈ 3 rows × 21 line-height + 26 padding)
  - **`marginBottom: 8`** to separate from the button row.
- Placeholder: `Reason for declining… (will be sent to admin)`, `Colors.tx3`.
- Button row (`flexDirection: row, gap: 8`):
  - **Cancel** (`.btn.ou.sm`, `flex: 1`) — default outline (`Colors.bd2` border, `Colors.tx` text). Returns to default state, clears `rejectReason`.
  - **Confirm Decline** (`.btn.pr.sm`, `flex: 1`) — **overrides the orange gradient with solid `Colors.ur` bg, `border: none`, white text**. Calls `respondToInvite(id, 'rejected', rejectReason)` → close detail → success toast.

### 5.5 Rejection reason recap

Only when `type === 'invite' && status === 'rejected' && declineReason` exists. Read-only red box:

- `marginHorizontal: 18`, `Colors.url` bg, radius **11**, padding `10 / 12`.
- **`Your reason:`** bold, then the saved reason inline. 12 / `Colors.ur`.

### 5.6 Assignment quick-link

Only when `type === 'assignment' && courseId`. Wrapper: `paddingHorizontal: 18, paddingVertical: 6` (= `padding: 6 / 18` in the prototype — applies to top *and* bottom).

- Single **full-width `.btn.pr` (full size, not `.sm`)** — gradient bg, padding 15 / 22, **fontSize 15 / 700 / white**, radius **13**, width 100%, shadow `0 4px 16px rgba(212,118,14,0.32)`.
- Text: `📋 View Course Brief` (en) / `📋 शिविर विवरण हेर्नुहोस्` (ne).
- Tap: `setSelected(null)` (close detail) then `router.push(routeTo.teacherApplicationBrief(courseId))` so the back stack is clean.

### 5.7 Bottom spacer — **20 px**.

---

## 6. Behaviour

- **Mount**: `loadNotifications()` runs already at app shell startup; this screen just reads from the store.
- **`getForUser(userId)`**: filters notifications to the current teacher, newest first (timestamp DESC).
- **Unread count**: `notifs.filter(n => !n.read).length`. Surfaced in the header subtitle.
- **Tap card → detail**: sets `selected`, immediately calls `markRead(id)` if unread (the store writes through `notificationsRepo.upsert`).
- **Accept invite**: `respondToInvite(id, 'accepted')` updates the store (which writes through repo), shows a toast, closes the detail.
- **Decline invite**:
  1. First tap on Decline opens the reason textarea.
  2. Cancel goes back; Confirm Decline calls `respondToInvite(id, 'rejected', reason)`, toast, close.
- **Assignment "View Course Brief"**: `router.push(routeTo.teacherApplicationBrief(courseId))`, closes the detail panel via `setSelected(null)` before navigating so the back-stack stays clean.
- **No swipe-to-dismiss** in v1 — out of scope.
- **Empty state**: when `notifs.length === 0`, render a centred 🔔 (48 px) + title (`No notifications yet`) + sub (`We'll let you know when invites arrive.`). Same vertical rhythm as the applications empty state.

---

## 7. Data model

No schema additions. Existing `Notification` type covers everything:

| Display piece | Field |
|---|---|
| Icon + accent + border colour | `type` |
| Subject | `subjectEn` (for now; later add `subjectNe`) |
| Body | `bodyEn` / `bodyNe` switched by `settingsStore.language` |
| Course | `course` (display string) |
| Centre | `center` |
| Timestamp | `timestamp` (ISO) → relative via `formatNotifTime` |
| Read state | `read: boolean` |
| Invite status | `status: 'pending' | 'accepted' | 'rejected'` |
| Decline reason | `declineReason: string | null` |
| Course brief link | `courseId: number | undefined` |

---

## 8. What's changing vs current implementation

Current `app/(teacher)/notifications.tsx` is one screen with **inline expand-in-place** (no detail view), uses `SectionHeader` + a generic `TYPE_CONFIG`, and lacks:

- The left-border colour per type
- Forest-tint unread row background
- Unread dot on the right of the subject
- Dashed-top invite footer with status chip + "Tap to respond"
- The 2-step decline flow (default → reason textarea → confirm)
- The dedicated detail view (currently expands inline)

The rebuild adopts the prototype's list/detail toggle inside one component, matches all literal sizes/colours, and uses the existing store API as-is.

---

## 9. i18n

All copy through `notifications.*` keys. New entries needed:

- `subtitle` — `{{new}} new · {{total}} total`
- `back` — `Back`
- `body.placeholder_decline` — `Reason for declining… (will be sent to admin)`
- `body.confirm_decline` — `Confirm Decline`
- `body.cancel` — `Cancel`
- `body.accept` — `✓ Accept Invitation`
- `body.decline` — `Decline`
- `body.view_brief` — `📋 View Course Brief`
- `body.your_reason` — `Your reason:`
- `status.pending_list` — `⏳ Response needed`
- `status.pending_detail` — `⏳ Awaiting your response`
- `status.accepted` — `✓ Accepted`
- `status.declined` — `✗ Declined`
- `tap_to_respond` — `Tap to respond →`
- `confirmed_short` — `✓ Confirmed`
- `empty_title` — `No notifications yet`
- `empty_message` — `We'll let you know when invites arrive.`
- `toast_accepted` — `Invitation accepted`
- `toast_declined` — `Invitation declined`

Nepali equivalents per the prototype, Acharya-correct.

---

## 10. Acceptance checklist

- [ ] Header subtitle reads `{N} new · {M} total`
- [ ] Each notification card has the correct 4 px left-border colour per type
- [ ] Unread cards show `Colors.fol` background + 800-weight subject + 8 px green dot
- [ ] Read cards show white background + 600-weight subject + no dot
- [ ] Invite cards show a dashed-top status chip + "Tap to respond" for pending
- [ ] Assignment cards show a dashed-top `✓ Confirmed · 📅 dates · 🛬 arrival` footer
- [ ] Tapping a card opens the detail view in-place (no navigation route change)
- [ ] Detail view back link uses a chevron SVG matching the brief screen pattern
- [ ] Body renders with line breaks preserved
- [ ] Invite pending state shows Accept + Decline buttons; Decline opens textarea + Cancel/Confirm
- [ ] Invite rejected state shows the red "Your reason: …" box
- [ ] Assignment detail shows the full-width `📋 View Course Brief` CTA
- [ ] Empty state when there are no notifications
- [ ] All copy through `notifications.*` i18n (en + ne, Acharya-correct)
- [ ] Typecheck clean, tests pass
