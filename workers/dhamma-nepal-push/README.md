# Dhamma Nepal Push Relay

A tiny Cloudflare Worker that relays push notifications between Dhamma Nepal app devices via [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/).

When admin approves a teacher's application on phone A, this Worker:

1. Receives the event via `POST /events`
2. Looks up the teacher's stored push token in Cloudflare KV
3. Sends a push notification through Expo to the teacher's phone B
4. Phone B shows an OS-level banner with sound + tap-to-open

Total latency: **~1–2 seconds.** Free tier handles ~5,000 daily active users; we're at 215. See spec `specs/34-os-push-notifications.md` for the design.

---

## First-time setup (one-time, ~15 minutes)

You need a free Cloudflare account.

### 1. Sign up + install Wrangler

- Go to [cloudflare.com](https://cloudflare.com) → Sign up (free).
- Install Wrangler CLI in this directory:

  ```bash
  cd workers/dhamma-nepal-push
  npm install
  npx wrangler login    # opens browser, click "Allow"
  ```

### 2. Create the KV namespace

```bash
npx wrangler kv:namespace create dhamma_nepal
```

This prints something like:

```
{ binding = "KV", id = "abc123def456..." }
```

Copy the `id` value. Open `wrangler.toml` and replace `REPLACE_WITH_KV_NAMESPACE_ID` with it.

### 3. Set the shared secret

Pick a random 32-character hex string. Run:

```bash
npx wrangler secret put SHARED_SECRET
# paste the random string when prompted
```

Save the secret somewhere safe (you'll need it in the next step).

### 4. Deploy

```bash
npx wrangler deploy
```

This prints the Worker URL, e.g.:

```
Published dhamma-nepal-push
  https://dhamma-nepal-push.yourname.workers.dev
```

### 5. Wire the app

Open `src/config/app.ts` in the RN app and set:

```ts
export const PUSH_WORKER_URL = 'https://dhamma-nepal-push.yourname.workers.dev';
export const PUSH_WORKER_SECRET = 'the random string from step 3';
```

Rebuild the dev/EAS build. On next app launch the device registers its push token; OS push notifications begin working.

---

## Verifying it works

### Token registration

```bash
curl -X POST https://dhamma-nepal-push.yourname.workers.dev/tokens \
  -H "Authorization: Bearer $SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId":"teacher-001","role":"teacher","pushToken":"ExpoPushToken[xxxxxx]"}'

# expect: { "ok": true }
```

Check in Cloudflare dashboard → Workers & Pages → KV → namespace `dhamma_nepal` → key `token:teacher-001` should exist.

### Push delivery

```bash
curl -X POST https://dhamma-nepal-push.yourname.workers.dev/events \
  -H "Authorization: Bearer $SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId":"teacher-001",
    "type":"approval",
    "courseId":42,
    "applicationId":7,
    "center":"Dharma Shringa",
    "course":"Dharma Shringa Aug 10-Day",
    "subjectEn":"You have been approved",
    "bodyEn":"Approved for Dharma Shringa Aug 10-Day course",
    "bodyNe":"धम्म श्रृंग शिविरका लागि स्वीकृत"
  }'

# expect: { "ok": true, "id": "..." }
# the phone with that pushToken receives a banner + tone
```

### Polling fallback

```bash
curl "https://dhamma-nepal-push.yourname.workers.dev/events?userId=teacher-001&since=1970-01-01T00:00:00Z" \
  -H "Authorization: Bearer $SHARED_SECRET"

# expect: { "events": [ ... ] }
```

---

## Local dev

```bash
npx wrangler dev
```

Starts the Worker on `http://localhost:8787` against a local KV emulator. Useful for tweaks before deploy.

---

## Cost monitoring

- Cloudflare dashboard → Workers & Pages → `dhamma-nepal-push` → Metrics shows daily request count + KV usage.
- Expo dashboard isn't strictly needed; the Push API is free + unmetered for non-commercial volumes.

Free tier limits (per day): 100k Worker requests, 1k KV writes, 100k KV reads. At 215 users you'll use ~5–10% of each.

---

## Security notes

- **Shared secret in app bundle**: spec 34 §9 covers the trade-off. Acceptable for a closed-distribution AT app; upgrade to per-device JWTs minted by the Worker at token-registration time if this ever becomes a publicly distributed app.
- **No PII leaves the device**: subjects + bodies are written by the app, not the Worker. The Worker is a dumb relay.
- **CORS**: not configured (Worker is called from the RN app only, not browser). Add `Access-Control-Allow-Origin` if you ever expose it to a web client.

---

## Tear-down

If you ever need to remove this:

```bash
npx wrangler delete dhamma-nepal-push
npx wrangler kv:namespace delete --binding KV
```

Set `PUSH_WORKER_URL = ''` in the RN app; push falls back to in-app-only without any errors.
