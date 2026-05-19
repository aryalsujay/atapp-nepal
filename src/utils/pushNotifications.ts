/**
 * Push notifications — spec 34.
 *
 * Three responsibilities:
 *  1. Ask OS permission + fetch the Expo push token for this device.
 *  2. Send the token to our Cloudflare Worker so the Worker can target
 *     this user when something happens on another device.
 *  3. Wire foreground display + tap handlers so banners look right and
 *     taps deep-link to the matching screen (see spec 34 §7).
 *
 * `PUSH_WORKER_URL` empty → every function here becomes a no-op. The
 * app continues to work in-app-only with zero failed network calls.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Router } from 'expo-router';

import { PUSH_WORKER_URL, PUSH_WORKER_SECRET } from '@/config/app';
import { routeTo, Routes } from '@/routes';
import type { NotificationType } from '@/types';
import { logger } from './logger';

// Show foreground notifications as banners so users see them even when
// the app is in the foreground. The default `shouldShowAlert` was
// deprecated; the new fields land in expo-notifications SDK 51+.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface RegisterResult {
  granted: boolean;
  pushToken: string | null;
}

/**
 * Request notification permission and fetch the Expo push token. Idempotent:
 * call on every boot — if the user has already granted permission the
 * existing token is returned without a fresh OS prompt. POSTs the token to
 * `${PUSH_WORKER_URL}/tokens` so the Worker can target this device later.
 */
export async function registerForPushAsync(
  userId: string,
  role: 'teacher' | 'server' | 'admin',
): Promise<RegisterResult> {
  if (!userId) return { granted: false, pushToken: null };

  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return { granted: false, pushToken: null };

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C87010',
      });
    }

    let pushToken: string | null = null;
    try {
      const projectId =
        // Read Expo project ID from app config. EAS sets this on first build.
        (await import('expo-constants').then((m) => m.default.expoConfig?.extra?.eas?.projectId)) ??
        undefined;
      const tok = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
      pushToken = tok.data;
    } catch (err) {
      logger.warn('[push] getExpoPushTokenAsync failed', err);
      return { granted: true, pushToken: null };
    }

    if (PUSH_WORKER_URL && pushToken) {
      // Fire-and-forget; failure here doesn't block the user.
      fetch(`${PUSH_WORKER_URL}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PUSH_WORKER_SECRET}`,
        },
        body: JSON.stringify({ userId, role, pushToken }),
      }).catch((err) => logger.warn('[push] token POST failed', err));
    }

    return { granted: true, pushToken };
  } catch (err) {
    logger.warn('[push] registerForPushAsync failed', err);
    return { granted: false, pushToken: null };
  }
}

/**
 * Wire foreground + tap handlers. Call once near the root. Returns a
 * cleanup function the parent should call on unmount.
 */
export function setupNotificationHandlers(router: Router): () => void {
  // Cold-start tap: app was killed and user tapped the OS banner. The
  // payload survives the relaunch in `getLastNotificationResponseAsync`.
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) routeFromPayload(router, extractPayload(response));
    })
    .catch((err) => logger.warn('[push] cold-start handler failed', err));

  // Background tap: app was in background; this fires once the OS hands
  // it back to JS land.
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    routeFromPayload(router, extractPayload(response));
  });

  return () => sub.remove();
}

interface EventPayload {
  type?: NotificationType;
  courseId?: number;
  applicationId?: number;
}

function extractPayload(response: Notifications.NotificationResponse): EventPayload {
  const data = response.notification.request.content.data ?? {};
  return {
    type: data.type as NotificationType | undefined,
    courseId: typeof data.courseId === 'number' ? data.courseId : undefined,
    applicationId: typeof data.applicationId === 'number' ? data.applicationId : undefined,
  };
}

function routeFromPayload(router: Router, payload: EventPayload) {
  if (!payload.type) return;
  // Admin-facing
  if (
    (payload.type === 'new_application' || payload.type === 'withdrawal_request') &&
    payload.applicationId
  ) {
    router.push(routeTo.adminApplicationReview(payload.applicationId));
    return;
  }
  // Teacher-facing
  if ((payload.type === 'approval' || payload.type === 'rejection') && payload.courseId) {
    router.push(routeTo.teacherCourseDetail(payload.courseId));
    return;
  }
  // Invites + everything else → land them on their notifications tab so
  // they see the full list and pick what to act on.
  router.push(Routes.teacherNotifications);
}

/**
 * Notify the Worker that something happened so it can push the OS-level
 * banner to whoever needs to know. Mirrors `addNotification`'s payload
 * shape so emit sites pass the same object to both calls.
 */
export function sendEventToWorker(event: {
  targetUserId: string;
  type: NotificationType;
  courseId?: number;
  applicationId?: number;
  center: string;
  course: string;
  subjectEn: string;
  bodyEn: string;
  bodyNe: string;
}): void {
  if (!PUSH_WORKER_URL) return;
  fetch(`${PUSH_WORKER_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PUSH_WORKER_SECRET}`,
    },
    body: JSON.stringify(event),
  }).catch((err) => logger.warn('[push] event POST failed', err));
}
