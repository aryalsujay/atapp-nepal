# Spec: Admin Course Sync (continuous 2h cadence + manual control)

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-18

---

## 0. Source of truth

No prototype mockup — new functionality requested 2026-05-18.

Today the app already scrapes `https://www.dhamma.org/en/schedules/{schId}` for 22 Nepal centres via `src/utils/scraper.ts` + `src/store/coursesStore.ts`. This spec keeps that pipeline as-is and adds:

1. **Tighter cadence** — 2h instead of 3h.
2. **Foreground heartbeat** — re-check while the app is open, not only on app-state changes.
3. **Admin visibility** — a read-only card on the admin dashboard showing last-sync time and course count. No manual button (per user 2026-05-18: "should sync auto without manual button press").

This is the only external network dependency the app has. No new backend, no API gateway.

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `32-admin-course-sync` |
| Routes | `(admin)/dashboard` — adds one new card; no new routes |
| Source files | `src/config/app.ts`, `app/_layout.tsx`, `app/(admin)/dashboard.tsx`, new `src/components/admin/SyncStatusCard.tsx`, `src/translations/{en,ne}.json` |
| Roles | `admin` |
| Related specs | `00-data-layer` (sync flow already documented there), `21-admin-dashboard` |

---

## 2. Purpose

Keep the local SQLite `courses` table within 2 hours of `dhamma.org` so teachers never see a stale schedule, while making the freshness visible to admin and giving admin a manual override when needed.

---

## 3. Visual Layout

### 3.1 New card on `/(admin)/dashboard`

Inserted directly **below** the `📧 Notification Center` card and **above** the `🌐 Translations` card. Same `notifCard` shape used by both neighbours so the dashboard stays visually consistent.

```
┌────────────────────────────────────────────┐
│ 🔄  Course Sync                            │
│     Last synced · 12 min ago · 184 courses │
│     Auto-syncs every 2 hours               │
└────────────────────────────────────────────┘
```

- Card chrome: same `notifCard` style (white bg, radius 16, padding 15, `Shadows.card`, full-width minus 18px gutters).
- Left: 🔄 emoji (22 px). Replaced with a spinning dot indicator (small SVG / activity dot) while `syncing === true`.
- Middle column (`flex: 1`):
  - **Title** `Course Sync` (13.5 / weight 700 / `tx`).
  - **Subtitle** (12 / `tx2`): `Last synced · {{relative}} · {{count}} courses`. Examples:
    - `Last synced · 12 min ago · 184 courses`
    - `Last synced · 2 h ago · 184 courses`
    - `Never synced` (when `lastSyncAt === null` — only on first launch without network).
  - **Hint line** (11 / `tx3` / italic): `Auto-syncs every 2 hours`. Hidden while `syncing === true` (replaced with `Syncing now…`).
  - **Error subtitle** (12 / `Colors.ur`) — only when the last attempt errored and no successful sync has happened since: `Last sync failed · will retry automatically`.
- Right: no button. The card is purely informational.

---

## 4. Behavior

| Trigger | Action |
|---|---|
| App cold start, after migrations | If `shouldAutoSync()` → fire sync. (Already in place — keep.) |
| App returns to foreground (`AppState 'active'`) | Same gate. (Already in place — keep.) |
| **Heartbeat (new)** | `setInterval(120 min, …)` while app is mounted. Inside the callback: if `shouldAutoSync()` → fire sync. Cleared on unmount. |
| **OS background fetch (new)** | `expo-background-fetch` task `com.dhammanepal.coursesync` registered at app boot with `minimumInterval = SYNC_MIN_AGE_MS / 1000` (clamped to 900 s = iOS floor). The OS chooses the actual cadence based on usage — iOS typically fires every few hours when the app is killed; Android every 15–30 min. Task body: if `shouldAutoSync()` → call `syncCourses()`. Returns `NewData` / `NoData` / `Failed` so the OS can schedule the next wake intelligently. |

### Sync gate (`shouldAutoSync`)

- Stays the same shape but the constant changes:
  - **Before**: `SYNC_MIN_AGE_MS = 3 * 60 * 60 * 1000` (3 h)
  - **After**: `SYNC_MIN_AGE_MS = 2 * 60 * 60 * 1000` (2 h)
- Heartbeat interval also = 2 h (single source of truth — both pull from the same constant). On a perfectly behaved app session, the heartbeat fires once every 2 h and the gate passes immediately.

### Failure handling

- A failed sync is logged + persisted in `settings.courses.lastSyncError` so the card can surface it.
- The next heartbeat / foreground event retries automatically — no exponential backoff for now; the 2 h cadence is conservative enough not to hammer dhamma.org if it's temporarily down.
- If a sync succeeds, `lastSyncError` is cleared.

---

## 5. State

`coursesStore` already exposes `lastSyncAt`, `syncing`, and `syncCourses`. Add:

- **`lastSyncError: string | null`** — populated when `syncCourses` returns `{ error }`. Cleared on a successful sync. Persisted in `settings` under `courses.lastSyncError` so the card survives an app restart.
- **`courses.length`** read off the existing store state — no new field needed.

---

## 6. Strings & i18n

Namespace `admin.sync.*` (new). Add to both `en` + `ne`:

| Key | EN | NE |
|---|---|---|
| `admin.sync.title` | `Course Sync` | `पाठ्यक्रम सिंक` |
| `admin.sync.last_synced` | `Last synced · {{relative}} · {{count}} courses` | `अन्तिम सिंक · {{relative}} · {{count}} पाठ्यक्रमहरू` |
| `admin.sync.never_synced` | `Never synced` | `कहिल्यै सिंक भएको छैन` |
| `admin.sync.last_failed` | `Last sync failed · will retry automatically` | `अन्तिम सिंक असफल · स्वत: पुन: प्रयास हुनेछ` |
| `admin.sync.hint` | `Auto-syncs every 2 hours` | `हरेक २ घण्टामा स्वत: सिंक` |
| `admin.sync.in_flight` | `Syncing now…` | `सिंक हुँदै…` |

Relative formatting (`12 min ago`, `2 h ago`, `Just now`, `Yesterday`) goes through a small helper `relativeTime(date, lang)` in `src/utils/relativeTime.ts` (new). Returns `"Just now"` when delta < 60 s.

---

## 7. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| 2 h cadence | Both the gate AND the heartbeat | User instruction 2026-05-18 |
| OS-level background fetch | **Added 2026-05-18** — `expo-background-fetch` + `expo-task-manager` | User asked for app-closed sync without a server. Apple's `BGTaskScheduler` is the only no-backend option. Requires a dev build / EAS build (Expo Go cannot run background tasks). iOS info.plist: `UIBackgroundModes=['fetch','processing']` + `BGTaskSchedulerPermittedIdentifiers=['com.dhammanepal.coursesync']`. |
| Manual override | **None** — auto-sync only | User instruction 2026-05-18: "should sync auto without manual button press". Dashboard card stays as read-only status. |
| Course type allowlist | Unchanged — see scraper `parseCourseType` | User: "ok later we will add" — defer to a follow-up spec when new types are spotted in the wild. |
| Status filter | Unchanged — drop `completed/in_progress/closed` at parse-time | Non-actionable for AT scheduling. |
| New deps | `expo-background-fetch` + `expo-task-manager` | Required for the OS background-fetch layer. User-approved 2026-05-18. |
| Web mode CORS failure | **Accepted — web is dev preview only** | `dhamma.org` does not send `Access-Control-Allow-Origin`, so browser fetches are blocked. Courses still render from the seed in `src/data/courses.json` (loaded by `db/seed.ts` on first launch). The card surfaces "Last sync failed · will retry automatically" — accurate and expected. On native (iOS / Android) the same code path works without CORS restrictions. |

---

## 8. Acceptance Checklist

- [ ] `SYNC_MIN_AGE_MS` is 2 hours; reflected in spec 00 (data layer) too.
- [ ] Admin dashboard shows the new `🔄 Course Sync` card between Notification Center and Translations.
- [ ] Card subtitle reads correctly with each state: never · just now · 12 min ago · 2 h ago · 1 day ago · error.
- [ ] App left open for >2 h re-syncs automatically without backgrounding/foregrounding.
- [ ] After a fresh dev build, an app that has been killed for >2 h still syncs in the background (iOS: opportunistic; Android: within ~30 min).
- [ ] `BACKGROUND_COURSE_SYNC_TASK` registers without throwing on boot; web platform is a no-op.
- [ ] Heartbeat is cleared on root-layout unmount (no leak).
- [ ] EN + NE both render without overflow.
- [ ] Typecheck + lint + tests pass.

---

## 9. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | Sujay + Claude | Initial draft. |
| 2026-05-18 | Sujay + Claude | Dropped manual "Sync now" button per user — card is read-only status. Auto-sync only (cold start + foreground + 2 h heartbeat). |
| 2026-05-18 | Sujay + Claude | Added `expo-background-fetch` + `expo-task-manager` so sync also runs when the app is killed. Requires a dev build (Expo Go cannot run background tasks). |
