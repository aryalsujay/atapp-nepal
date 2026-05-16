# Dhamma AT — Phase 1 Audit

Audit run after admin cycle was completed (specs 03–30, excluding 28). The goal is to
document the current state of spec ↔ code drift, the architecture inventory, and a
triage list before any refactor work.

---

## Part 1 · Spec ↔ Code drift

The drift falls into three buckets:

- **🟢 Intentional drift** — code changed after the spec was approved, based on your in-session feedback. The code is the source of truth; the spec is stale.
- **🟡 Documentation gap** — the code is fine but the spec doesn't describe what was built.
- **🔴 Real bug / regression** — code doesn't match spec AND the spec was right.

### 🟢 Intentional drift (spec is stale → update spec to match code)

| Spec                   | What changed in code                                                                                                                             | Where                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 12 Server Onboarding   | Q2 icon replaced `🧘` emoji with animated dhamma-wheel GIF + `☸️` glyph in recap                                                                 | `app/(server)/onboarding.tsx`    |
| 12 Server Onboarding   | `resultSub` fontSize bumped 13 → 14, lineHeight 19.5 → 21                                                                                        | `app/(server)/onboarding.tsx`    |
| 13 Server Dashboard    | `slots_left`, `filled`, `serving_since`, `last_served` i18n keys removed; text rendered as English literal in both languages (matches prototype) | `app/(server)/home.tsx`          |
| 13 Server Dashboard    | Area chips always use `sa.label` (English) — matches prototype                                                                                   | same                             |
| 13 Server Dashboard    | All numbers stay Latin digits in NE (no Devanagari substitution) — matches prototype                                                             | same                             |
| 19 Server Profile      | Availability grid split into 2 explicit rows of 6 instead of `flexWrap` (12×) — visually identical, cleaner code                                 | `app/(server)/profile/index.tsx` |
| 19 Server Profile      | "View all courses →" wired to Alert ("coming soon") with a TODO for SQLite-backed per-server history                                             | `app/(server)/profile/index.tsx` |
| 21 Admin Dashboard     | Urgent course dates include year (`Jul 15–26, 2026`)                                                                                             | `app/(admin)/dashboard.tsx`      |
| 21 Admin Dashboard     | Notification bell tile added to hero top-right                                                                                                   | `app/(admin)/dashboard.tsx`      |
| 22 Admin Inbox         | Stat chip labels changed `Pending / Urgent / Month` → `Pending / Rejected / Approved` (wired to live counts)                                     | `app/(admin)/inbox/index.tsx`    |
| 22 Admin Inbox         | On Approved/Rejected tabs, cards show a status pill (`✓ Approved` / `✗ Rejected`) + Review →, not just Review →                                  | same                             |
| 22 Admin Inbox         | Action row uses `minHeight: 34` to align gradient + bordered buttons                                                                             | same                             |
| 23 Admin Review        | Approve/Reject buttons mutate `useAdminApplicationsStore` (real state change, not just local)                                                    | `app/(admin)/inbox/[id].tsx`     |
| 23 Admin Review        | Re-opening a decided application skips to result card (preserves existing decision)                                                              | same                             |
| 24 Admin Directory     | Add Teacher button label has leading `+` prefix                                                                                                  | `app/(admin)/directory.tsx`      |
| 25 Admin Auto-Schedule | Matching-criteria chips width 22.7% (4 per row)                                                                                                  | `app/(admin)/schedule.tsx`       |
| 25 Admin Auto-Schedule | Override modal uses **dropdown-style selects** (expandable list) instead of always-visible vertical lists                                        | same                             |
| 25 Admin Auto-Schedule | Footer Re-generate + Finalize buttons normalised to identical padding/fontSize                                                                   | same                             |
| 26 Admin Calendar      | Day-strip cells bumped 17×17 r4 → 22×22 r5, day number fontSize 8 → 10                                                                           | `app/(admin)/calendar.tsx`       |
| 27 Admin Notifications | Tab bar visible (`tabBarStyle: display:none` removed)                                                                                            | `app/(admin)/_layout.tsx`        |
| 28 Admin Centres       | Skipped — not in prototype, no spec written                                                                                                      | —                                |

**Action**: bulk spec-sync pass in Phase 2. Each item is a 1-line spec edit.

### 🟡 Documentation gap (code OK, spec missing or partial)

| Spec                      | Gap                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **30 Admin Server Board** | `specs/30-admin-server-board.md` **does not exist**. `board.tsx` references this missing file in its header comment. The screen was built but the spec was never created. |
| 19 Server Profile         | `common.coming_soon` i18n key added for "View all courses" tap; not documented                                                                                            |
| 21 Admin Dashboard        | Bell tile design not in original spec                                                                                                                                     |
| 22 Admin Inbox            | Live-count stats + status pills on filtered tabs                                                                                                                          |

**Action**: write spec 30 from the code (reverse-spec), patch the others.

### 🔴 Real drift

None. (After verification, the agent's three flags on Spec 13 turn out to be intentional drift — keys were deliberately removed in-session when matching prototype's English-literal behaviour. The spec was the stale one, not the code.)

The single remaining real issue is **Spec 30 missing entirely** — covered under 🟡 documentation gap.

---

## Part 2 · Architecture inventory

### Scale

| Metric                       | Value                                                                                                                   | Comment                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Total screen LOC             | **25,628** (`app/**/*.tsx`)                                                                                             | Many screens 500–1000 lines            |
| Biggest screens              | `teacher/profile/index.tsx` (1176), `schedule.tsx` (958), `applications/brief/[id].tsx` (834), `courses/[id].tsx` (839) | Top refactor targets                   |
| Number of screens            | 30+ across 3 roles + auth                                                                                               |                                        |
| Languages                    | EN + NE (Acharya-correct)                                                                                               |                                        |
| Hex literals in `app/`       | 76                                                                                                                      | ~20 worth promoting to tokens          |
| `StyleSheet.create` blocks   | 33 per-screen                                                                                                           | Significant duplication                |
| `ScrollView` in `app/`       | 30                                                                                                                      | Should be `FlatList` for long lists    |
| `TouchableOpacity` in `app/` | 30 files                                                                                                                | OK; could migrate to `Pressable` later |

### Layers

```
                 ┌─────────────────────────────────────────┐
                 │   app/  (screens)                       │   ← 25k LOC, talks to:
                 │   - 30+ files                           │
                 │   - inline StyleSheet                   │
                 │   - hard-coded data arrays              │
                 │   - direct @/data imports               │
                 └─────────┬───────────────┬───────────────┘
                           │               │
                           ▼               ▼
                   ┌───────────────┐ ┌──────────────────┐
                   │ src/store/ ×11│ │ src/data/*.json  │   ← stores read from JSON
                   │ (zustand)     │ │ (11 files)       │     directly, not repos
                   └───────────────┘ └──────────────────┘
                           │
                           │  (intended path, currently unused)
                           ▼
                   ┌────────────────┐
                   │ db/repositories│   ← 12 repos exist
                   │ /  (SQLite)    │   ← only app/_layout.tsx imports `/db/`
                   └────────────────┘   ← **repos are DEAD CODE at runtime**
```

### Stores (11 total)

| Store                    | Used by app/ screens?                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `authStore`              | ✓ (login, role routing)                                                                              |
| `profileStore`           | ✓ (teacher profile + edit)                                                                           |
| `applicationsStore`      | ✓ (teacher applications)                                                                             |
| `coursesStore`           | ✓                                                                                                    |
| `hallsStore`             | ✓                                                                                                    |
| `notificationsStore`     | ✓                                                                                                    |
| `settingsStore`          | ✓ (language toggle)                                                                                  |
| `teachersStore`          | ✓                                                                                                    |
| `onboardingDraftStore`   | ✓ (teacher onboarding wizard)                                                                        |
| `adminApplicationsStore` | ✓ (added during admin cycle)                                                                         |
| _missing_                | admin: schedule, calendar, notifications, server-board all use local `useState` or hard-coded arrays |

### UI primitive coverage (`src/components/ui/`)

| Primitive                          | Exists | Used in screens?                                               |
| ---------------------------------- | ------ | -------------------------------------------------------------- |
| `Button.tsx`                       | ✓      | mostly NOT — screens roll their own `TouchableOpacity` buttons |
| `Badge.tsx`                        | ✓      | partial                                                        |
| `Toast.tsx`                        | ✓      | used in admin board                                            |
| `DashedDivider`                    | ✓      | yes (3+ screens)                                               |
| `Toggle.tsx`                       | ✓      | NOT used — dashboard rolls its own                             |
| `SearchBar.tsx`                    | ✓      | NOT used — opportunities + directory roll their own            |
| `FilterChip.tsx`                   | ✓      | NOT used — every chip-row screen reimplements                  |
| `MatchPill.tsx`                    | ✓      | NOT used — dashboard + inbox reimplement                       |
| `HeroDecorations` (Lotus/Mountain) | ✓      | ✓ used everywhere                                              |
| `LotusGlyph`                       | ✓      | partial                                                        |
| `ChecklistItem`                    | ✓      | unused                                                         |
| `ConfirmDialog`                    | ✓      | unused                                                         |
| `ErrorBoundary`                    | ✓      | partial                                                        |

**Headline**: ~half the UI primitives are unused; screens reinvent them. This is the biggest single source of code bloat.

### Data flow

| Data file                  | Used directly by screens? |
| -------------------------- | ------------------------- |
| `serverCourses.json`       | ✓ (multiple screens)      |
| `serverApplications.json`  | ✓                         |
| `serverApplicants.json`    | ✓ (admin server inbox)    |
| `serverNotifications.json` | ✓                         |
| `adminApplications.json`   | ✓                         |
| `courses.json`             | ✓                         |
| `applications.json`        | ✓                         |
| `teachers.json`            | ✓                         |
| `centers.json`             | partial                   |
| `halls.json`               | rare                      |
| `admin.json`               | login                     |

### Inline hard-coded data arrays in screen files (should be JSON)

| Screen                    | Constant                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| `admin/dashboard.tsx`     | `URGENT` (3 courses)                                                 |
| `admin/schedule.tsx`      | `AVAILABLE_TEACHERS` (7), `DRAFT` (6), `CRITERIA` (8), `REASONS` (5) |
| `admin/calendar.tsx`      | `EVENTS` (4), `LEGEND` (4)                                           |
| `admin/notifications.tsx` | `NOTIFS` (3 incl. full email bodies)                                 |
| `admin/directory.tsx`     | `TEACHERS` (6)                                                       |
| `admin/server/board.tsx`  | `FILLED` (mock slots)                                                |

**Action**: move all to `src/data/` JSON. Then trivially swappable to API responses.

### Backend readiness signals

| Signal                                        | Status                                                 |
| --------------------------------------------- | ------------------------------------------------------ |
| Repository pattern scaffolded                 | ✓ (12 repos)                                           |
| Repos imported at runtime                     | ✗ (only `_layout.tsx`)                                 |
| Migration scaffold                            | ✓ (5 migrations)                                       |
| Async data shape (`{ data, loading, error }`) | ✗ everything is sync                                   |
| Auth token plumbing                           | partial (`authStore` has `userId` but no `getToken()`) |
| Service layer (`src/services/`)               | ✗ not yet introduced                                   |
| API contracts (`src/types/api.ts`)            | ✗                                                      |

**Headline**: The seam is in place (repos + stores) but unused. Adding `src/services/` and wiring stores through it is the Phase 5 work — ~2 days, no rewrites.

---

## Part 3 · Triage

### 🔥 Fix now (Phase 2 spec sync — 1 hour, no code changes)

- [ ] Patch spec 12, 13, 19, 21, 22, 23, 25, 26, 27 to reflect intentional drift (each is a 1-line edit)
- [ ] **Write spec 30 from existing code** (reverse-engineer the spec)
- [ ] Add note to spec 28 explicitly marking "not built, no prototype"

### 🛠 Fix in Phase 3 (refactor — 2 days)

In order of impact:

1. **Extract `Card`, `SectionHeader`, `Chip`, `Toggle`, `MatchBadge`** as real primitives — used by 10+ screens each
2. **Migrate inline data arrays to `src/data/*.json`** — 6 files affected, no logic changes
3. **Promote ~20 inline hex literals to `Colors` tokens** (admin coral, soft pinks for gendered avatars, etc.)
4. **Adopt `FlatList` on the 4 long lists** (inbox, directory, notifications, server inbox)
5. **Split the 3 biggest screens** (`teacher/profile`, `schedule`, `teacher/courses/[id]`) into sub-components in `src/components/{teacher,admin}/`
6. **Use the existing `SearchBar`/`FilterChip` primitives** where screens reinvent them — kill duplicate styles

### 🐛 Real bug to fix (Phase 3 or earlier)

- [ ] **Spec 13 Server Dashboard i18n gap**: NE users see English fragments mixed with Nepali UI on "8 slots left", "14/22 filled", "44 open slots across 5 courses". 30-min fix.
- [ ] **Spec 13** area-chip NE localisation: currently always English. 5-min fix.

### ⚡ Phase 4 perf wins (½ day)

- [ ] `React.memo` on list-item components after primitives exist
- [ ] `FlatList` migration (above)
- [ ] Profile cold start, measure before/after
- [ ] Lazy-import the admin route group (most users never see admin screens)

### 🌐 Phase 5 backend prep (½ day, no behaviour change)

- [ ] Introduce `src/services/` with one service per resource
- [ ] Define `src/types/api.ts` contracts based on current data shapes
- [ ] Add `getToken()` to authStore (returns null today, real value when backend lands)
- [ ] Standardise `{ data, loading, error }` shape in stores
- [ ] Document the seam: "to add a real API, swap the service implementation, stores stay the same"

### 📈 Phase 6 scaling (advisory)

Foundation is **sound**. The architecture choices (Zustand + repos + Expo Router + i18next) all scale. No rewrites needed. The 4 things to watch as you grow:

1. **JSON-in-memory → SQLite-paginated** (repos already scaffold this)
2. **Multi-centre routing** (single-line filter additions to most screens)
3. **Realtime sync** (websocket layer can sit between services and stores)
4. **Image hosting** (avatar emoji → CDN URL pipeline)

---

## Recommended next move

Smallest meaningful step: **Phase 2 spec sync** (1 hour). Quick win, no risk, gets specs trustworthy again.

Then **Phase 3 pilot**: pick `admin/schedule.tsx` (958 lines, complex modal) — extract `OverrideModal`, `DayDotRow`, `DraftCard` into `src/components/admin/`. See if you like the new shape before doing more.
