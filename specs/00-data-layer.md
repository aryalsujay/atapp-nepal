# Spec: 00 — Data Layer (SQLite)

> **Status:** 🔨 `phase_a_b_complete` — plumbing + seed done, repositories + store migration pending
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-13
> **Foundation work** — affects every screen. Numbered `00` because it must land before any further UI work to avoid retrofitting.

---

## Implementation log

### Phase A — Plumbing ✅ COMPLETE (2026-05-13)
- [x] Installed `expo-sqlite`, `expo-file-system`, `expo-sharing` (with `--legacy-peer-deps`)
- [x] `src/db/schema.sql` — canonical schema reference (12 tables + indexes)
- [x] `src/db/types.ts` — row types matching schema columns
- [x] `src/db/index.ts` — `DB` interface + `getDb()` singleton.
   - **Native** (iOS/Android): `expo-sqlite.openDatabaseSync('dhamma-at.db')`
   - **Web + Jest**: in-memory shim with mini SQL parser (handles CREATE/INSERT/UPDATE/DELETE/SELECT/DROP, transactions with rollback)
- [x] `src/db/migrate.ts` — forward-only migration runner; tracks applied migrations in `_migrations` table
- [x] `src/db/migrations/0001_initial.ts` — creates all 12 tables + 11 indexes
- [x] Boot sequence wired into `app/_layout.tsx`: open DB → migrate → seed → hydrate stores
- [x] Unit tests: `src/db/__tests__/migrate.test.ts` (3 tests)

### Phase B — Seeding ✅ COMPLETE (2026-05-13)
- [x] `src/db/seed.ts` — reads all 9 JSON files + `serviceAreas.ts`, inserts in a single transaction
- [x] `isSeeded()` + `resetSeedFlag()` helpers; gate stored as `settings.seeded = 'v1'`
- [x] Idempotent — second call returns empty insert map without re-inserting
- [x] Unit tests: `src/db/__tests__/seed.test.ts` (4 tests)

### Phase C — Repositories ⏳ NEXT
- [ ] `admins` repo (login flow needs this)
- [ ] `teachers` repo
- [ ] `centres` repo
- [ ] `halls` repo
- [ ] `courses` repo
- [ ] `service_areas` repo
- [ ] `applications` repo
- [ ] `server_courses` repo
- [ ] `server_applications` repo
- [ ] `notifications` repo
- [ ] `settings` repo

### Phase D — Store migration ⏳
- [ ] `authStore` + `teachersStore` (login depends on these)
- [ ] `profileStore`, `applicationsStore`, `coursesStore`
- [ ] `notificationsStore`, `settingsStore`, `hallsStore`
- [ ] Remove direct JSON imports outside `seed.ts`

### Phase E — Export ⏳
- [ ] Admin "Export DB" → `expo-sharing` with `.db` file
- [ ] JSON dump alternative

### Phase F — Cleanup ⏳
- [ ] Remove `src/data/*.json` runtime imports (keep as seed-only)

---

**Verification at Phase A+B checkpoint:**
| Check | Result |
|---|---|
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors, 83 warnings |
| `npm run format:check` | ✓ clean |
| `npm test` | ✓ **28 tests / 5 suites passing** (incl. 7 new db tests) |
| Web bundle | ✓ 1324 modules, no errors |
| Boot sequence | ✓ DB opens → migrates → seeds → hydrates stores before first render |

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `00-data-layer` |
| Scope | foundation (not a screen) |
| Source files | `src/db/**`, all `src/store/*.ts` |
| Prototype reference | n/a — prototype uses in-memory mock data only |
| Related specs | every screen spec (each one reads/writes through this layer) |

---

## 2. Purpose

Replace the current JSON-file-based mock data with a **production-grade SQLite database** as the single source of truth for app data. The database lives **on-device** in each user's app sandbox; data is durable across app restarts, easy to back up, easy to export.

**Motivations:**
- Production reliability (atomic transactions, no JSON parse errors mid-write)
- Easy export — copy the `.db` file or dump to JSON via a single share-sheet action
- Foundation for future sync to a central server (delta sync via `updated_at`)
- Performance on the large `courses.json` (200 KB — SQLite can index and query without loading it all)
- Standard practice — `expo-sqlite` is the official Expo SDK pattern

**Non-goals (for v1):**
- Multi-device sync — each user has one device, one DB. Sync is Phase F (future).
- Real-time collaboration — not needed at Nepal scale (~hundreds of users).
- Schema validation / ORM — direct SQL with prepared statements; an ORM is overkill here.

---

## 3. Architecture

```
src/db/
├── index.ts                   # connection singleton, exports `db`
├── schema.sql                 # canonical CREATE TABLE statements
├── migrate.ts                 # migration runner (called once on app boot)
├── migrations/
│   ├── 0001_initial.ts        # creates all tables + indexes from schema
│   └── 0002_*.ts              # future migrations (one file per change)
├── seed.ts                    # one-time JSON → DB import on first run
├── types.ts                   # row types matching schema columns
└── repositories/              # one file per logical entity
    ├── admins.ts
    ├── teachers.ts            # handles both teacher + server users (role column)
    ├── centers.ts
    ├── halls.ts
    ├── courses.ts
    ├── service_areas.ts
    ├── applications.ts
    ├── server_applications.ts
    ├── server_courses.ts
    ├── notifications.ts
    └── settings.ts            # key-value store
```

**Layers:**

```
UI (screens)
  ↓ reads/writes via
Zustand store (e.g. teachersStore)
  ↓ calls
Repository (e.g. teachers.findByEmail)
  ↓ executes
SQL via `expo-sqlite` connection
  ↓ persists to
on-disk .db file
```

Screens don't change. Stores change once (swap JSON imports for repo calls). Repos own all SQL.

---

## 4. Module Inventory

| File | Purpose | Status |
|---|---|---|
| `src/db/index.ts` | Open / re-open the SQLite connection; expose typed `db` instance | new |
| `src/db/schema.sql` | Plain SQL — canonical table definitions, kept as a doc as well | new |
| `src/db/migrate.ts` | Detect current DB version, apply pending migrations in order | new |
| `src/db/migrations/0001_initial.ts` | Create all v1 tables + indexes | new |
| `src/db/seed.ts` | First-run only — read JSON files, insert seed rows | new |
| `src/db/types.ts` | TS row types (one per table) | new |
| `src/db/repositories/*.ts` | CRUD API per entity | new |
| `src/store/*.ts` | Existing Zustand stores | modify to call repos instead of JSON |
| `app/_layout.tsx` | Boot sequence | modify to run migrations + seed before render |

---

## 5. Schema

All tables use `TEXT` for IDs (matching current string IDs like `"teacher-001"`, `"dhamma-shringa"`); integer IDs in current data (courses, applications) keep `INTEGER PRIMARY KEY`. Every table has `created_at` and `updated_at` (ISO-8601 strings) to support future delta sync.

### `admins`
```sql
CREATE TABLE admins (
  id              TEXT PRIMARY KEY,
  username        TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  center_name     TEXT,
  settings_json   TEXT,           -- e.g. {"showCoTeacher": false}
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
```

### `teachers` (covers both `teacher` and `server` roles)
```sql
CREATE TABLE teachers (
  id                     TEXT PRIMARY KEY,
  role                   TEXT NOT NULL CHECK (role IN ('teacher','server')),
  name                   TEXT NOT NULL,
  gender                 TEXT,                 -- 'M' | 'F' | NULL
  email                  TEXT UNIQUE,
  invite_code            TEXT UNIQUE,
  password_hash          TEXT NOT NULL,
  region                 TEXT,
  flag                   TEXT,
  authorized_since       INTEGER,
  total_courses          INTEGER DEFAULT 0,
  centers_served         INTEGER DEFAULT 0,
  courses_this_year      INTEGER DEFAULT 0,
  is_onboarded           INTEGER DEFAULT 0,    -- boolean as 0/1
  personal_note          TEXT,
  authorizations_json    TEXT,                 -- JSON array of strings
  languages_json         TEXT,                 -- JSON object
  preferred_regions_json TEXT,                 -- JSON array
  monthly_availability_json TEXT,              -- JSON array of 12 entries
  teaching_history_json  TEXT,                 -- JSON array
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);
CREATE INDEX idx_teachers_role ON teachers(role);
CREATE INDEX idx_teachers_email ON teachers(email);
```

> Mixed-shape arrays/objects (languages, availability, teaching history) are stored as JSON blobs. They are read/displayed but rarely queried by content; if querying becomes needed we add an `entries` child table at that time.

### `centers`
```sql
CREATE TABLE centers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  name_ne      TEXT,
  city         TEXT,
  region       TEXT,
  country      TEXT,
  flag         TEXT,
  altitude     INTEGER,
  lat          REAL,
  lng          REAL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
```

### `halls`
```sql
CREATE TABLE halls (
  id               TEXT PRIMARY KEY,
  centre_id        TEXT NOT NULL REFERENCES centers(id),
  name             TEXT NOT NULL,
  teacher_slots    INTEGER NOT NULL DEFAULT 1,
  gender_required  TEXT,                 -- 'M' | 'F' | 'Any'
  notes            TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX idx_halls_centre ON halls(centre_id);
```

### `courses`
```sql
CREATE TABLE courses (
  id                INTEGER PRIMARY KEY,
  type              TEXT NOT NULL,        -- '10-Day', 'Satipatthana Sutta', etc.
  center            TEXT NOT NULL,
  center_id         TEXT REFERENCES centers(id),
  city              TEXT,
  country           TEXT,
  flag              TEXT,
  dates             TEXT,                 -- display string
  start_date        TEXT NOT NULL,        -- ISO yyyy-mm-dd
  end_date          TEXT NOT NULL,
  languages_json    TEXT,                 -- JSON array of language codes
  need_count        INTEGER DEFAULT 1,
  gender_required   TEXT,
  status            TEXT,                 -- 'open' | 'closed' | 'not_yet_open'
  distance_km       INTEGER,
  travel_hrs        REAL,
  altitude          INTEGER,
  students_json     TEXT,                 -- JSON {expected,male,female}
  arrival_date      TEXT,
  arrival_time      TEXT,
  coordinator_json  TEXT,                 -- JSON {name,role,phone}
  transport         TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_center ON courses(center_id);
CREATE INDEX idx_courses_start ON courses(start_date);
```

### `service_areas`
```sql
CREATE TABLE service_areas (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  label_ne    TEXT,
  emoji       TEXT,
  color       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

### `applications` (teacher applications)
```sql
CREATE TABLE applications (
  id                INTEGER PRIMARY KEY,
  course_id         INTEGER NOT NULL REFERENCES courses(id),
  teacher_id        TEXT NOT NULL REFERENCES teachers(id),
  status            TEXT NOT NULL,        -- 'pending' | 'approved' | 'rejected' | 'step_down' | 'withdrawn'
  applied_date      TEXT,
  source            TEXT,                 -- 'applied' | 'invited'
  rejection_reason  TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_apps_teacher ON applications(teacher_id);
CREATE INDEX idx_apps_course ON applications(course_id);
CREATE INDEX idx_apps_status ON applications(status);
```

### `server_applications`
```sql
CREATE TABLE server_applications (
  id                INTEGER PRIMARY KEY,
  course_id         INTEGER NOT NULL REFERENCES server_courses(id),
  server_id         TEXT REFERENCES teachers(id),
  center            TEXT,
  type              TEXT,
  dates             TEXT,
  status            TEXT NOT NULL,        -- 'pending' | 'approved' | 'rejected' | 'withdrawn'
  areas_json        TEXT,                 -- JSON array of service-area ids
  partial           INTEGER DEFAULT 0,
  days              TEXT,                 -- 'Day 3–8' or NULL for full course
  applied           TEXT,
  coordinator       TEXT,
  coord_phone       TEXT,
  arrive_by         TEXT,
  reason            TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_sapps_status ON server_applications(status);
```

### `server_courses`
```sql
CREATE TABLE server_courses (
  id            INTEGER PRIMARY KEY,
  center        TEXT NOT NULL,
  center_id     TEXT REFERENCES centers(id),
  city          TEXT,
  type          TEXT,
  dates         TEXT,
  start_date    TEXT,
  end_date      TEXT,
  days          INTEGER,
  m_servers     INTEGER DEFAULT 0,
  f_servers     INTEGER DEFAULT 0,
  filled        INTEGER DEFAULT 0,
  total         INTEGER DEFAULT 0,
  areas_json    TEXT,
  arrive_by     TEXT,
  altitude      INTEGER,
  country       TEXT,
  flag          TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,           -- teacher_id or admin_id
  user_role    TEXT NOT NULL,           -- 'teacher' | 'server' | 'admin'
  kind         TEXT NOT NULL,           -- 'application_approved' | 'reminder' | etc.
  title        TEXT NOT NULL,
  body         TEXT,
  link_target  TEXT,                    -- screen route to open on tap
  link_params_json TEXT,
  is_read      INTEGER DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE INDEX idx_notifs_user ON notifications(user_id, user_role);
CREATE INDEX idx_notifs_unread ON notifications(user_id, is_read);
```

### `settings` (key-value)
```sql
CREATE TABLE settings (
  key          TEXT PRIMARY KEY,
  value        TEXT,                    -- JSON-encoded values
  updated_at   TEXT NOT NULL
);
```

Stores: `language` (`"en"`|`"ne"`), `lastSyncAt`, feature flags, etc.

### Migration metadata
```sql
CREATE TABLE _migrations (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  applied_at   TEXT NOT NULL
);
```

---

## 6. Migration Strategy

- `migrate.ts` reads `_migrations` to find applied versions, runs anything pending in order
- Each migration is a self-contained `.ts` file exporting an `up(db)` function
- **Forward-only** — no `down`. If we need to fix a bad migration, write a new one.
- Migrations are pure SQL via `db.execSync()` — no JS data manipulation
- File naming: `NNNN_short_description.ts`, where `NNNN` is zero-padded and monotonic

**`0001_initial.ts`** creates every table + index in §5. Subsequent migrations add/modify columns.

> **Rule:** never modify a migration that has been shipped. Once it's in a release, write a new one.

---

## 7. Seeding Strategy

On first run (when `_migrations` has just been bootstrapped and tables are empty), `seed.ts`:

1. Imports each JSON file from `src/data/*` directly
2. Inserts seed rows in a single transaction
3. Writes a `seeded=1` flag in the `settings` table to prevent re-seeding

For dev convenience, expose a debug action `Reset & Reseed` that wipes the DB and re-runs migrations + seed.

After first ship, **seed runs once per user** — subsequent app updates that change seed data should be handled via migrations (e.g. add a migration to insert/update specific rows), not by re-running seed.

---

## 8. Repository API Conventions

Every repo exports a small, typed surface. Example for `teachers.ts`:

```ts
import { db } from '../index';
import type { TeacherRow } from '../types';

export const teachersRepo = {
  list(opts?: { role?: 'teacher' | 'server' }): TeacherRow[] { ... },
  findById(id: string): TeacherRow | null { ... },
  findByEmail(email: string): TeacherRow | null { ... },
  findByInviteCode(code: string): TeacherRow | null { ... },
  create(input: Omit<TeacherRow, 'id' | 'created_at' | 'updated_at'>): TeacherRow { ... },
  update(id: string, patch: Partial<TeacherRow>): TeacherRow { ... },
  delete(id: string): void { ... },
};
```

**Rules:**
- Use prepared statements (`db.prepareSync(...)` and `db.runAsync(...)`) — never string-concat SQL with user input
- Return plain row objects (TS types in `db/types.ts`), not "model instances"
- Repos are pure data access — no business logic, no React hooks, no Zustand
- Read methods are sync (small DB); write methods can be sync for simplicity

---

## 9. Store Integration Pattern

Each store keeps its current shape but swaps data source. Example:

```ts
// before
import teachersJson from '../data/teachers.json';
const teachers = teachersJson;

// after
import { teachersRepo } from '../db/repositories/teachers';
const teachers = teachersRepo.list();
```

State updates flow back through the repo:

```ts
addTeacher: (input) => {
  const row = teachersRepo.create(input);
  set((s) => ({ teachers: [...s.teachers, row] }));
}
```

Stores still own ephemeral UI state (loading flags, filters); repos own persistence.

---

## 10. Boot Sequence

Update `app/_layout.tsx`:

```
1. open DB connection
2. run pending migrations
3. seed if empty
4. hydrate stores from repos (loadTeachers, loadCourses, etc.)
5. hide splash
```

This is one extra phase before the existing hydration step. Total cold-start adds ~50-100ms for a small DB; first-run seeding adds ~200ms.

---

## 11. Export & Import

**Export** (admin / settings screen action):
1. Locate the DB file via `FileSystem.documentDirectory + 'SQLite/dhamma-at.db'`
2. Copy to a shareable cache path
3. Open the system share sheet via `expo-sharing`
4. User picks email / Drive / WhatsApp / AirDrop

**Optional: JSON dump for human-readable export:**
- Iterate each table, write `dhamma-at-export-YYYY-MM-DD.json`
- Same share-sheet flow

**Import** (Phase B feature — not v1):
- Accept a shared `.db` file via deep link / file association
- Validate schema version
- Replace the local DB (with user confirmation) or merge row-by-row

---

## 12. Future Sync (Phase F — not v1)

Out of scope for the initial migration. Sketched here so the schema doesn't paint us into a corner:

- Every row already has `updated_at` (ISO timestamp)
- A central REST API accepts deltas since `lastSyncAt` and returns its own
- Conflict resolution: last-write-wins by `updated_at` (acceptable for Nepal-scale where same-row simultaneous edits are rare)
- For multi-user shared records (e.g. `applications` reviewed by admin while teacher reads them) — server is authoritative
- We add a `dirty` boolean to flag locally-modified rows that still need to upload

This is enough lookahead — don't build until there's a server.

---

## 13. Dependencies

| Package | Purpose | Status |
|---|---|---|
| `expo-sqlite` | SQLite binding for Expo / RN | needs install |
| `expo-file-system` | Read/write the DB file for export | likely already transitively present; install explicit |
| `expo-sharing` | Open system share sheet | needs install |

No ORM, no separate query builder. Direct SQL is fine at this scale.

---

## 14. Acceptance Checklist

### Foundation
- [ ] `expo-sqlite`, `expo-file-system`, `expo-sharing` installed and added to `package.json`
- [ ] `src/db/` directory created with all files in §4
- [ ] `app/_layout.tsx` runs migrations + seed before hydration
- [ ] DB file persists across app restarts (verify: kill app, reopen, data still there)
- [ ] Reset & Reseed debug action works (admin / settings)

### Schema
- [ ] All 12 tables from §5 exist after first boot
- [ ] All indexes from §5 exist
- [ ] `_migrations` records `0001_initial` as applied
- [ ] Seed populates every table with the contents of the matching JSON file

### Repositories
- [ ] Every entity has a typed `*Repo` exporting `list`, `findById`, `create`, `update`, `delete` at minimum
- [ ] No raw SQL outside `src/db/` (lint or grep check)
- [ ] All write paths use prepared statements

### Store integration
- [ ] Every existing Zustand store reads from a repo instead of importing JSON
- [ ] All current screens still work without modification
- [ ] No remaining `import ... from '../data/*.json'` outside `src/db/seed.ts`

### Export
- [ ] "Export Data" action in admin settings produces a `.db` file via share sheet
- [ ] JSON dump variant produces a single valid JSON file with all tables

### Tests
- [ ] Cold start adds < 200ms vs current
- [ ] App handles a wiped DB (first-run flow works on fresh install)
- [ ] App handles a corrupted DB (graceful error, offer to reset)

---

## 15. Intentional Deltas from Prototype

n/a — the prototype has no persistence layer.

---

## 16. Open Questions

- [ ] **DB file name** — `dhamma-at.db` or `dhamma.db`? Affects backups and any future file-association deep link. Recommend `dhamma-at.db`.
- [ ] **Password hashing** — current `passwordHash` field is literally the plaintext `"demo123"`. For production, are we going to actually hash? If yes, when? Recommend: real hashing in Phase B alongside real auth. For now, copy the plaintext field as-is.
- [ ] **JSON-blob columns** — for fields like `languages_json`, `teaching_history_json`, we trade query flexibility for simplicity. Acceptable? Or do we want normalized child tables now? Recommend: blobs for v1, normalize if/when a screen needs to query them.
- [ ] **Course data refresh** — current `coursesStore` has `syncCourses()` that hits dhamma.org. Where does this fit? Recommend: rename to `refreshCoursesFromUpstream`, hits the URL, upserts into the SQLite courses table, becomes optional.
- [ ] **Multi-user on one device** — does an admin ever sign in alongside a teacher on the same physical phone? If yes, we need per-user namespacing. Recommend: assume one user per device for now; revisit if needed.
- [ ] **Backup automation** — should the app auto-backup to iCloud / Google Drive (whichever the OS offers)? Or only manual export? Recommend: manual for v1, then add OS-level backup hints later.
- [ ] **Existing AsyncStorage state** — auth session, settings, etc. currently use AsyncStorage. Move them into SQLite `settings` table? Recommend: yes, single source of truth simplifies things. Migrate values on first boot of the new build.

---

## 17. Implementation Phases (within this spec)

Even within "do the data layer now," there's a natural order:

**A — Plumbing (1 session)**
- Install deps
- Create `db/index.ts`, `migrate.ts`, `0001_initial.ts`
- Wire boot sequence in `_layout.tsx`
- Verify migrations apply on a fresh install

**B — Seeding (1 session)**
- Write `seed.ts` consuming each JSON file
- Verify all tables populate

**C — Repositories (2–3 sessions, one entity at a time)**
- Start with `teachers` (needed by login)
- Then `admins`, `centers`, `halls`, `service_areas`
- Then `courses`, `applications`, `server_courses`, `server_applications`
- Then `notifications`, `settings`

**D — Store migration (parallel, one store at a time)**
- For each store: swap JSON import for repo call, verify the screen still works
- Order: `authStore` + `teachersStore` first (login depends on them), then the rest

**E — Export (1 session)**
- Build admin settings "Export DB" + "Export JSON" actions

**F — Cleanup**
- Delete `src/data/*.json` files (they're now seed-only, kept in `src/db/seed-data/`)
- Update `_INDEX.md` to mark data layer ✓

Total estimate: 6–10 working sessions before we can resume screen-by-screen UI work.

---

## 18. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-13 | Claude (drafted) | Initial spec for review |
