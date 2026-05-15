# Spec: Teacher Applications

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `08-teacher-applications` |
| Route (Expo Router) | `/(teacher)/applications` |
| Source file | `app/(teacher)/applications/index.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `1155–1220` |
| Roles | `teacher` |
| Related specs | `05-teacher-courses`, `06-teacher-course-detail`, `07-teacher-course-brief` |

---

## 2. Purpose

The history view for everything the teacher has submitted or been assigned to. Each application shows its status (pending / approved / rejected / withdrawal-requested), its 3-step timeline, and a way to jump into the pre-course brief if confirmed. From here the teacher can navigate back to the browse list to apply for more.

This screen also distinguishes *applied* applications (teacher self-applied) from *assigned* ones (admin assigned the teacher) — they get a different left-border colour and a different timeline.

---

## 3. Layout zones (top → bottom)

### 3.1 Plain white header (no gradient)

- Padding `56 / 18 / 14` (top scaled with safe-area).
- **Title** — `My Applications`, 26 px / 800 / Plus Jakarta Sans ExtraBold.
- **Subtitle** — `{N} applications · {K} approved`, 13.5 px / `Colors.tx2`, marginTop 2.

### 3.2 Cream divider strip

8 px tall, `Colors.cr` background — the visual seam between header and cards (same as the browse screen).

### 3.3 Application card stack

One card per application, stacked vertically. Card base (matches `.card` in prototype CSS):

- `Colors.white` background, radius **16**, padding **15**, margin `0 18 11`, `Shadows.card`.
- TouchableOpacity wrapper, `activeOpacity={0.85}` (RN equivalent of the prototype's `.c-ptr` press-scale). Only enabled when `status === 'approved' && course.arrivalDate` exists.

#### Border colour (left edge, **4 px solid**)

| Condition | Colour |
|---|---|
| `source === 'assigned'` | `#5B6FA8` (cool blue) |
| `status === 'approved'` (applied path) | `Colors.fo` |
| `status === 'pending'` | `Colors.sf` |
| `status === 'rejected'` | `Colors.bd2` |
| any other (incl. `withdrawal_requested`) | `Colors.bd2` (fallthrough — prototype doesn't define this state) |

#### Top row (`marginBottom: 9`)

- **Left column**
  - Centre name — **15 px / 700** / `Colors.tx`
  - `{type} · {dates}` — **12.5 px** / `Colors.tx2`
  - When `source === 'applied'`: `Applied {date}` — **11 px** / `Colors.tx3`, `marginTop: 2`
  - Applied date row hidden for `source === 'assigned'`.
- **Right column** (`flexDirection: column, alignItems: flex-end, gap: 5`)
  - **Status spill chip** (`.spill.appr/pend/reje`) — **11.5 px / 700**, padding `5 / 11`, radius **20**, `inline-flex` with internal gap 5:
    - approved → `Colors.fol` bg / `Colors.fo` fg
    - pending → **`Colors.gdl` bg / `Colors.gd` fg** (gold — prototype uses gold, not orange)
    - rejected → `Colors.url` bg / `Colors.ur` fg
    - withdrawal_requested → `Colors.cr2` bg / `Colors.tx2` fg (defensive — not in prototype)
  - **`📨 Assigned` pill** (only when `source === 'assigned'`) — `rgba(91,111,168,0.12)` bg, `#5B6FA8` fg, **10 px / 700**, padding `3 / 9`, radius **20**, 1 px border `rgba(91,111,168,0.25)`, `whiteSpace: 'nowrap'`.

#### Timeline (3 steps, vertical dot + connector)

`.tl-item` row layout: `display: flex, gap: 11, marginBottom: 0`. Each row has a left "dot column" and a right "label column".

**Dot** (`.tl-dot`) — **13 × 13**, radius 50%, `flexShrink: 0`, `marginTop: 3`:

- `.done` → `Colors.fo` background
- `.act` → `Colors.sf` background + **`box-shadow: 0 0 0 4px Colors.sfl`** halo ring
- `.pend` → `Colors.bd2` background
- Rejected step override → background `Colors.ur`

**Connector** (`.tl-conn`, between consecutive dots) — `width: 2, flex: 1, minHeight: 22`:

- Base → `Colors.bd`
- `.done` (when the step ABOVE this connector is done) → `Colors.fom`

**Label column** — `paddingBottom: 13` (when not the last step), 0 otherwise. Label text **12 px / 600** in the colour matching the step state:

- active step → `Colors.sf`
- rejected step → `Colors.ur`
- done step → `Colors.fo`
- pending step → `Colors.tx3`

Step list depends on `application.source`:

**`source === 'applied'`:**

1. `Applied` — always done
2. `Under Review` — done when `status !== 'pending'`; **active** (with halo ring) when `status === 'pending'`
3. Tail:
   - approved → `Confirmed ✓` (done, forest)
   - rejected → `Not Selected` (rejected-red dot)
   - pending → `Awaiting Decision` (pend grey)

**`source === 'assigned'`:**

1. `Assigned by Admin` — always done
2. `Accepted` — done when `status === 'approved'`
3. Tail:
   - approved → `Confirmed ✓`
   - else → `Awaiting Confirmation`

#### Conditional footer (approved + brief available)

When `status === 'approved'` AND the joined course has an `arrivalDate`, the entire card is tappable → navigates to `routeTo.teacherApplicationBrief(application.id)`. Bottom of the card gets a dashed-top row:

- `marginTop: 8, paddingTop: 9, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: Colors.bd` (rendered via the same `DashedDivider` clipping trick we used on the course-detail screen, since RN's top-only dashed border doesn't render on web/iOS).
- `flexDirection: row, justifyContent: space-between, alignItems: center`
- Left: `🛬 {course.arrivalDate}` — **11.5 px** / `Colors.tx2`
- Right: `View Brief` — **12 px / 700** / `Colors.fo`

#### Conditional rejection-reason box (rejected + reason)

When `status === 'rejected' && application.rejectionReason`, render below the timeline:

- `Colors.url` bg, radius **10**, padding `9 / 11`, `marginTop: 8`
- Title `Reason:` — **11 px / 700** / `Colors.ur`, `marginBottom: 2`
- Body — **12 px** / `Colors.ur`

### 3.4 Browse More CTA

Container: `padding: 6 / 18` (gives a 6 px gap from last card).
Button (`.btn.se` style) — full-width, `Colors.sfl` bg / `Colors.sfd` text, padding `14 / 22`, radius **13**, **14 px / 700**.
Tapping navigates to `Routes.teacherCourses`.

Bottom of the scroll: 20 px spacer.

### 3.5 Empty state

When the teacher has no applications: centred 📋 emoji (48 px) + title (FontSize.lg / 700) + message ("Browse open courses and apply to teach") + the same "Browse Courses" CTA.

---

## 4. Behaviour

- **Sort order**: most recent first (`appliedDate DESC`). Falls back to `id DESC` when dates tie.
- **Tap target**: whole card is tappable when `status === 'approved'`; tapping navigates to the brief. Non-approved cards are inert (no detail navigation — the apply CTA on the course detail handles re-engagement).
- **Refresh**: `loadApplications(userId)` runs on mount; no manual pull-to-refresh needed for v1.
- **i18n**: all visible strings go through `applications.*` keys in `en.json` + `ne.json`. Source-aware timeline labels live under `applications.timeline.applied.*` and `applications.timeline.assigned.*`.

---

## 5. What's changing vs current implementation

The current `app/(teacher)/applications/index.tsx` uses generic `SectionHeader` + `FilterRow` + `ApplicationCard` + `Button`. It also adds a 5-tab filter row (All / Pending / Approved / Rejected / Step Down) which **isn't in the prototype**. The rebuild:

- Drops the filter row (single list, sorted by date) — matches prototype.
- Replaces the abstracted `ApplicationCard` component with an inline prototype-faithful version using literal sizes/colors.
- Replaces `SectionHeader` with the inline header + cream divider strip pattern used elsewhere (home, courses, brief).
- Pulls every status sublabel through the `applications.timeline.*` i18n namespace (no English hardcodes).
- Adds the `📨 Assigned` source pill missing from current.
- Adds the dashed-top "🛬 arrival · View Brief" footer for approved cards.

---

## 6. Data model

No schema additions. Uses existing fields:

| Field | Source |
|---|---|
| `application.status` | `applications.status_*` enum |
| `application.source` | `'applied' \| 'assigned'` |
| `application.appliedDate` | display in "Applied {date}" line |
| `application.rejectionReason` | red box body for rejected |
| `course.center / type / dates / arrivalDate` | join via `courseId` |

`coursesStore` is already loaded by the app shell so course details are available in memory at render time.

---

## 7. Acceptance checklist

- [ ] Header matches prototype (26/800 title + 13.5 subtitle "{N} apps · {K} approved")
- [ ] 4 demo applications render with correct left-border colour per source/status
- [ ] Applied path timeline: Applied → Under Review → Confirmed/Not Selected/Awaiting Decision
- [ ] Assigned path timeline: Assigned by Admin → Accepted → Confirmed/Awaiting Confirmation
- [ ] Approved + briefRef cards show dashed "🛬 arrival · View Brief" footer
- [ ] Rejected cards show red rejection-reason box
- [ ] Card tap navigates to brief only for approved (not for pending/rejected/withdrawal_requested)
- [ ] Browse More Courses CTA at bottom
- [ ] Empty state matches the existing emoji + title + button pattern
- [ ] No filter tabs (single sorted list, prototype-faithful)
- [ ] All copy goes through i18n (en + ne, Acharya-correct Nepali)
- [ ] Typecheck clean, tests pass
