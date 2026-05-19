/**
 * Background course sync — spec 32.
 *
 * Registers an `expo-background-fetch` task so the device OS can call
 * `coursesStore.syncCourses()` even when the app is killed. The OS
 * decides the actual cadence:
 *   - iOS:   "opportunistic" — usually a few hours, throttled by usage
 *   - Android: ~15–30 minutes, more reliable
 *
 * We ask for `BackgroundFetchInterval = SYNC_MIN_AGE_MS / 1000`, but
 * the OS treats this as a minimum hint, not a guarantee.
 *
 * The task itself is a small wrapper that defers to the existing store
 * action so there's only one sync path. On native it actually runs; on
 * web it no-ops (Expo's web shim returns Unavailable).
 *
 * IMPORTANT — `TaskManager.defineTask` MUST be called at module scope
 * (not inside a useEffect), so the JS bundle re-registers the handler
 * every time the OS wakes the app, before any React tree mounts.
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import { SYNC_MIN_AGE_MS } from '@/config/app';
import { useCoursesStore } from '@/store/coursesStore';
import { logger } from './logger';

export const BACKGROUND_COURSE_SYNC_TASK = 'com.dhammanepal.coursesync';

TaskManager.defineTask(BACKGROUND_COURSE_SYNC_TASK, async () => {
  try {
    const { syncCourses, shouldAutoSync } = useCoursesStore.getState();
    if (!shouldAutoSync()) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const result = await syncCourses();
    return result.error
      ? BackgroundFetch.BackgroundFetchResult.Failed
      : BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    logger.warn('[backgroundSync] task crashed', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Idempotent — safe to call on every app boot. Re-registering with the
 * same identifier just refreshes the OS-level schedule.
 */
export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      logger.info('[backgroundSync] OS disallows background fetch — skipping');
      return;
    }
    await BackgroundFetch.registerTaskAsync(BACKGROUND_COURSE_SYNC_TASK, {
      minimumInterval: Math.max(900, Math.floor(SYNC_MIN_AGE_MS / 1000)), // seconds; iOS floor is ~900
      stopOnTerminate: false,
      startOnBoot: true,
    });
    logger.info('[backgroundSync] registered');
  } catch (err) {
    // Expected failure in Expo Go (UIBackgroundModes can't be set) — log
    // at info level instead of warning so the dev console stays clean.
    // On a real dev/EAS build the info.plist contains `fetch` and this
    // call succeeds.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UIBackgroundModes')) {
      logger.info('[backgroundSync] skipped (Expo Go) — use a dev build to enable');
    } else {
      logger.warn('[backgroundSync] register failed', err);
    }
  }
}
