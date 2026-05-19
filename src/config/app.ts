/**
 * App-wide tunables that aren't part of the matching algorithm itself.
 * Same principle as `match.ts`: keep magic numbers in one place so future
 * admin UI can tune them by writing to a `settings` row instead of editing
 * code.
 */

/**
 * Days between a teacher's last course and when they're eligible to teach
 * again. Used by the home "Rest & Practice Reminder" card and by the
 * matching algorithm's rest-gap bucket.
 */
export const REST_GAP_DAYS = 60;

/** Max number of "Best Matches" cards rendered on the teacher home. */
export const MAX_MATCHES_ON_HOME = 5;

/**
 * Within the home preview, allow at most this many courses from the same
 * centre. Prevents one popular centre (e.g. Dharma Shringa with 31 courses)
 * from filling every slot.
 */
export const MAX_PER_CENTRE_ON_HOME = 2;

/** Minimum match score for a course to appear in the home "Best Matches". */
export const MATCH_HOME_THRESHOLD = 83;

/**
 * Sync cadence — how stale `coursesStore` can be before we re-fetch from
 * dhamma.org. App boot, foregrounding, AND a heartbeat timer in
 * `app/_layout.tsx` all check this against `lastSyncAt`.
 * Currently 2 hours — see spec 32-admin-course-sync.
 */
export const SYNC_MIN_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Push notifications (spec 34) — Cloudflare Worker URL + shared secret.
 *
 * Empty URL disables push: app continues to work in-app-only, no error
 * banners, no failed requests. Set after deploying the Worker (see
 * `workers/dhamma-nepal-push/README.md`).
 *
 * Both values are bundled with the app. The secret is acceptable to ship
 * inside the binary for a closed-distribution AT app — see spec 34 §9.
 */
export const PUSH_WORKER_URL = 'https://dhamma-nepal-push.aryalsujay.workers.dev';
export const PUSH_WORKER_SECRET = '5d4618bbffa5feeb2adbdcc069dabe2a';
