# Spec: OS Push Notifications (Worker + Expo Push)

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-18

---

## 0. Source of truth

No prototype. New functionality, requested 2026-05-18.

Builds on the in-app notification work in spec 33 + `feature/in-app-notifications`. Same `Notification` type, same emit sites. This spec adds an **OS push notification** that fires on the recipient's phone — with sound, banner, and tap-to-open — even when the app is killed.

The app stays "no Anthropic/server" except for one **tiny Cloudflare Worker** (~50 lines) that mediates between the two phones. The Worker is free-tier forever at our scale (200 teachers + 15 admins).

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `34-os-push-notifications` |
| Source files (app) | `src/utils/pushNotifications.ts` (new), `src/store/applicationsStore.ts` (emit hook), `app/_layout.tsx` (register on boot), `app.json` (permissions) |
| Source files (Worker) | `workers/dhamma-nepal-push/` (new dir): `src/index.ts`, `wrangler.toml`, `README.md`, `package.json` |
| Roles | all (teacher, server, admin) |
| Related specs | `33-admin-add-teacher` (push tokens stored per teacher), in-app notifications (spec is in-progress in repo only) |

---

## 2. Purpose

The teacher persona is non-tech-savvy. They forget to open the app. The in-app bell (spec from this morning) is good, but useless if the phone never rings. This spec makes the phone ring:

- Admin approves a teacher's application → teacher's phone vibrates + plays notification tone + shows banner "✓ Approved: Dharma Shringa Aug 10-Day", *even if app is closed*
- Teacher taps the banner → app opens → deep-link to the course detail screen
- Same for: new_application (to admin), rejection, invite, withdrawal_request

Without this, admins must call/text teachers manually. With this, the app is the primary channel.

---

## 3. Architecture

```
┌─────────────┐   1. POST /events            ┌─────────────────────┐
│   Admin     │ ─────────────────────────── ▶│  Cloudflare Worker  │
│   Phone     │   {targetUserId,             │  + KV (token store) │
│             │    type, courseId,           └─────────┬───────────┘
│             │    subjectEn, bodyEn, ...}             │
└─────────────┘                                        │
                                              2. lookup pushToken
                                                       │
                                                       ▼
                                              ┌─────────────────────┐
                                              │    Expo Push API    │
                                              │ exp.host/--/api/v2  │
                                              └─────────┬───────────┘
                                                        │
                                              3. fan-out to FCM / APNs
                                                        ▼
                                              ┌─────────────────────┐
                                              │   Teacher Phone     │
                                              │ Banner + tone + tap │
                                              └─────────────────────┘
```

Latency end-to-end: ~1–2 s (admin tap → teacher banner). Comparable to WhatsApp.

---

## 4. App-side changes

### 4.1 New dep

- `expo-notifications` (~50 KB). Handles permission UX, token generation, foreground/background handlers, deep-link tap routing.

### 4.2 `app.json` additions

- iOS: add `expo-notifications` plugin block; Apple capability is configured by EAS on first build.
- Android: notification icon + channel + colour.

### 4.3 `src/utils/pushNotifications.ts` (new)

Exports:
- `registerForPushAsync(userId: string, role: Role): Promise<void>` — asks permission, gets Expo push token, POSTs to Worker `/tokens` to register.
- `setupNotificationHandlers(router: Router): () => void` — wires foreground display + tap-to-deep-link. Returns a cleanup function.
- `sendEventToWorker(event: NotificationEvent): Promise<void>` — fire-and-forget POST to Worker `/events`. Used by every emit site.

### 4.4 Boot wiring (`app/_layout.tsx`)

- After `restoreSession()`, when userId is known: `await registerForPushAsync(userId, role)`.
- Mount `setupNotificationHandlers(router)` once per app session.

### 4.5 Emit hook (`src/store/applicationsStore.ts`)

- `emitNotification()` already updates local store. Add a line: `sendEventToWorker(partial).catch(...)` so the Worker also relays to the other phone.

### 4.6 Config

- `PUSH_WORKER_URL` constant in `src/config/app.ts`. Defaults to `''` (disabled). Once admin deploys the Worker, set the URL here and rebuild.
- When empty, all push calls are no-ops — app continues to work in-app-only.

---

## 5. Worker side

### 5.1 Directory layout

```
workers/dhamma-nepal-push/
├── package.json
├── wrangler.toml
├── tsconfig.json
├── README.md
└── src/
    └── index.ts
```

Self-contained — separate from the RN app's package.json.

### 5.2 `src/index.ts` — three endpoints

```ts
// POST /tokens  { userId, pushToken }
//   Stores token in KV under key `token:${userId}`. Idempotent.
//
// POST /events  { targetUserId, type, courseId, applicationId,
//                 subjectEn, bodyEn, bodyNe, ... }
//   1. Looks up `token:${targetUserId}` in KV.
//   2. POSTs to Expo Push API with payload.
//   3. Returns 200 OK regardless (fire-and-forget).
//
// GET /events?since=<iso>&userId=<id>  (fallback polling)
//   Returns notifications stored for this user since the given time.
//   Useful when push delivery fails for any reason.
```

### 5.3 KV bindings

- `KV` namespace (created via `wrangler kv:namespace create dhamma_nepal`).
- Keys: `token:${userId}` (push token strings), `event:${id}` (recent events, 7-day TTL for polling).

### 5.4 Auth

- Shared secret in `Authorization: Bearer <secret>` header. Worker rejects without it.
- Secret stored in app's `src/config/app.ts` (read-only constant; bundled with app). Not ideal but acceptable for our scale + trust model. Future: per-device JWT.

### 5.5 Deploy steps (in README)

1. `cd workers/dhamma-nepal-push`
2. `npm install`
3. `npx wrangler login` (one-time browser flow)
4. `npx wrangler kv:namespace create dhamma_nepal` → copy the ID into `wrangler.toml`
5. `npx wrangler secret put SHARED_SECRET` → paste a random 32-char hex string
6. `npx wrangler deploy` → outputs `https://dhamma-nepal-push.<sub>.workers.dev`
7. Paste that URL + the secret into `src/config/app.ts` of the RN app, rebuild

Total time: ~15 minutes after first-time Cloudflare setup.

---

## 6. Permission UX

iOS shows the "Allow notifications?" prompt the first time `registerForPushAsync` runs. The prompt is OS-controlled; we can only choose *when* to ask.

- **First time**: After they finish onboarding (teacher) or after login (admin). At that point they understand what the app is for and are most likely to allow.
- **If denied**: app continues to work in-app-only. We re-ask once on a future app open, then back off.
- **No nag**: never repeat-prompt within the same session.

Android: notifications are granted by default on most versions. Android 13+ asks once; same UX rules.

---

## 7. Deep-link tap routing

Same routes wired in the prior commit for in-app taps:

| Notification type | Tap routes to |
|---|---|
| `new_application` | `/(admin)/inbox/<applicationId>` |
| `withdrawal_request` | `/(admin)/inbox/<applicationId>` |
| `approval` / `rejection` | `/(teacher)/courses/<courseId>` |
| `invite` | `/(teacher)/notifications` (accept/decline lives there) |
| `assignment` / `reminder` / `update` | `/(teacher)/notifications` |

`expo-notifications` exposes the tap event in two places:
- App was killed: `Notifications.getLastNotificationResponseAsync()` on boot
- App was backgrounded: `Notifications.addNotificationResponseReceivedListener()`

Both pass the data payload (`event.data`) which carries `type` + `applicationId`/`courseId`. The handler reads those and calls `router.replace(...)`.

---

## 8. Reliability / fallback

If push delivery fails (network blip, expired token, OS throttle):
- Worker still wrote the event to KV with 7-day TTL
- App's existing background-fetch task (every 2h) can call `GET /events?since=...` and pull missed notifications
- This guarantees eventual delivery; usually push is instant, but worst case the user sees it within 2h

---

## 9. Decisions

| Decision | Choice | Why |
|---|---|---|
| Hosting | Cloudflare Workers | Free at our scale; 99.99% uptime; instant cold start; no servers to babysit |
| Storage | Cloudflare KV | Free; perfect for tiny user-keyed payloads; replicated to all 300+ Cloudflare edges |
| Push relay | Expo Push Service | Free; handles APNs + FCM signing for us; standard for Expo apps |
| Auth | Shared secret in app bundle | Acceptable for closed-distribution app. Real public app would use per-device JWT minted by the Worker at registration. |
| Polling fallback cadence | 2h (existing bg-fetch) | Already configured; adds zero new work |
| App config knob | `PUSH_WORKER_URL` constant | When empty, push is disabled — app degrades gracefully to in-app-only |
| Dev build requirement | Yes | `expo-notifications` needs native modules; Expo Go cannot test real push. Document clearly. |
| New deps | `expo-notifications` only on app side | Worker is its own package |

---

## 10. Acceptance checklist

- [ ] First app launch after install asks for notification permission.
- [ ] If granted, push token is sent to the Worker and stored in KV (verify via Cloudflare dashboard).
- [ ] Admin approves a teacher's application on phone A → within ~3 seconds, teacher's phone B shows an OS banner with the approval text + plays the default notification tone.
- [ ] Tapping the banner opens the app + lands on `/(teacher)/courses/<courseId>`.
- [ ] If teacher's phone is offline at the moment of approval, banner appears when the phone reconnects (APNs/FCM queue).
- [ ] Worker URL empty in `src/config/app.ts` → app continues to work in-app-only with no errors.
- [ ] Worker URL invalid → push fails silently; in-app bell still works.
- [ ] 102+ existing tests still pass.
- [ ] Typecheck + lint clean.

---

## 11. Phases (build order)

1. **Spec sign-off** (this doc) — pause for review.
2. **App side**: install `expo-notifications`, register token, hook up handlers, gate behind `PUSH_WORKER_URL`. Verify on phone with a fake URL — token is requested but POST 404s gracefully.
3. **Worker side**: write the Worker, `wrangler deploy`, smoke-test endpoints with `curl`.
4. **Wire**: set the Worker URL + secret in `src/config/app.ts`, rebuild dev build. Live test admin→teacher push.
5. **Polish**: notification icon assets, Android channel name, OS settings deep-link from the in-app "manage notifications" link (future).

Each phase is a separate commit on `feature/push-notifications`. Merge to main after the full §10 checklist is green.

---

## 12. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | Sujay + Claude | Initial draft. |
