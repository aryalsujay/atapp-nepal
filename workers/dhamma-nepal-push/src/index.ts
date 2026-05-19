/**
 * Dhamma Nepal push relay — Cloudflare Worker (spec 34).
 *
 * Three endpoints:
 *
 *   POST /tokens   { userId, role, pushToken }
 *     Stores the Expo push token in KV under `token:${userId}`.
 *     Idempotent — re-registering with the same userId overwrites.
 *
 *   POST /events   { targetUserId, type, courseId?, applicationId?,
 *                    center, course, subjectEn, bodyEn, bodyNe }
 *     1. Looks up the recipient's push token in KV.
 *     2. POSTs to Expo Push API with title/body + data payload.
 *     3. Also stores a copy of the event in KV (7-day TTL) so the app
 *        can pull missed notifications via the polling fallback.
 *
 *   GET /events?userId=X&since=ISO
 *     Returns events for this user with timestamp > since.
 *     Used by the app's background-fetch as a reliability backstop when
 *     a push delivery fails (network blip, expired token, OS throttle).
 *
 * Auth: every request must carry `Authorization: Bearer ${SHARED_SECRET}`
 * matching the secret stored via `wrangler secret put`.
 */

export interface Env {
  KV: KVNamespace;
  SHARED_SECRET: string;
}

interface TokenPayload {
  userId: string;
  role: 'teacher' | 'server' | 'admin';
  pushToken: string;
}

interface EventPayload {
  targetUserId: string;
  type: string;
  courseId?: number;
  applicationId?: number;
  center: string;
  course: string;
  subjectEn: string;
  bodyEn: string;
  bodyNe: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EVENT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (!authorized(req, env)) return text('unauthorized', 401);

    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/tokens') {
      return handleTokenRegistration(req, env);
    }
    if (req.method === 'POST' && url.pathname === '/events') {
      return handleEventEmit(req, env);
    }
    if (req.method === 'GET' && url.pathname === '/events') {
      return handleEventPoll(url, env);
    }
    return text('not found', 404);
  },
};

function authorized(req: Request, env: Env): boolean {
  const header = req.headers.get('Authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/);
  if (!match) return false;
  // Constant-time-ish: same length, then loop.
  const provided = match[1];
  const expected = env.SHARED_SECRET ?? '';
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function text(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain' },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── /tokens ─────────────────────────────────────────────────────────────

async function handleTokenRegistration(req: Request, env: Env): Promise<Response> {
  let body: TokenPayload;
  try {
    body = (await req.json()) as TokenPayload;
  } catch {
    return text('bad json', 400);
  }
  if (!body.userId || !body.pushToken) return text('userId + pushToken required', 400);

  await env.KV.put(
    `token:${body.userId}`,
    JSON.stringify({
      pushToken: body.pushToken,
      role: body.role,
      updatedAt: new Date().toISOString(),
    }),
  );
  return json({ ok: true });
}

// ─── POST /events ────────────────────────────────────────────────────────

async function handleEventEmit(req: Request, env: Env): Promise<Response> {
  let body: EventPayload;
  try {
    body = (await req.json()) as EventPayload;
  } catch {
    return text('bad json', 400);
  }
  if (!body.targetUserId || !body.type) {
    return text('targetUserId + type required', 400);
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const event = { id, ...body, timestamp: new Date().toISOString() };

  // 1. Persist for polling fallback (7-day TTL).
  await env.KV.put(`event:${body.targetUserId}:${id}`, JSON.stringify(event), {
    expirationTtl: EVENT_TTL_SECONDS,
  });

  // 2. Look up the recipient's push token + fire the OS push.
  const tokenRaw = await env.KV.get(`token:${body.targetUserId}`);
  if (tokenRaw) {
    try {
      const { pushToken } = JSON.parse(tokenRaw) as { pushToken: string };
      await sendExpoPush(pushToken, body);
    } catch (err) {
      console.warn('[push] expo send failed', err);
      // We still return 200 — the in-app notification was already
      // delivered by the caller, and the event is persisted for polling.
    }
  }

  return json({ ok: true, id });
}

async function sendExpoPush(pushToken: string, event: EventPayload): Promise<void> {
  // Expo accepts an array of messages — useful for batching later if we
  // ever fan-out to multiple admins at once.
  const message = {
    to: pushToken,
    title: event.subjectEn,
    body: event.bodyEn.split('\n')[0], // first line keeps the banner tight
    sound: 'default' as const,
    priority: 'high' as const,
    data: {
      type: event.type,
      courseId: event.courseId,
      applicationId: event.applicationId,
    },
  };
  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(message),
  });
}

// ─── GET /events ─────────────────────────────────────────────────────────

async function handleEventPoll(url: URL, env: Env): Promise<Response> {
  const userId = url.searchParams.get('userId');
  const since = url.searchParams.get('since') ?? '1970-01-01T00:00:00Z';
  if (!userId) return text('userId required', 400);

  const list = await env.KV.list({ prefix: `event:${userId}:` });
  const events: unknown[] = [];
  for (const key of list.keys) {
    const raw = await env.KV.get(key.name);
    if (!raw) continue;
    try {
      const ev = JSON.parse(raw) as { timestamp: string };
      if (ev.timestamp > since) events.push(ev);
    } catch {
      // ignore malformed entries
    }
  }
  return json({ events });
}
