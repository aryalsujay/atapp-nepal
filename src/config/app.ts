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
 * dhamma.org. App boot and foregrounding check this against `lastSyncAt`.
 */
export const SYNC_MIN_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
