import { applyOverrides, SUPPORTED_LANGS } from '@/i18n';
import { translationsRepo } from '@/db/repositories';
import React, { useEffect, useState } from 'react';
import { AppState, Platform, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTeachersStore } from '@/store/teachersStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import { SYNC_MIN_AGE_MS } from '@/config/app';
import { registerBackgroundSync } from '@/utils/backgroundSync';
import { registerForPushAsync, setupNotificationHandlers } from '@/utils/pushNotifications';
import { getDb } from '@/db';
import { runMigrations } from '@/db/migrate';
import {
  seedDatabase,
  backfillTeacherPhone,
  backfillTeacherHomeLocation,
  backfillTeacherDemoMonths,
  dropDemoShringaJulApplication,
  seedExtraDemoApplications,
  enrichDemoCourses,
} from '@/db/seed';
import { legacyMigrate } from '@/db/legacyMigrate';
import { logger } from '@/utils/logger';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const authLoading = useAuthStore((s) => s.isLoading);
  const restoreSettings = useSettingsStore((s) => s.restoreSettings);
  const settingsLanguage = useSettingsStore((s) => s.language);
  const loadTeachers = useTeachersStore((s) => s.loadTeachers);
  const teachersLoaded = useTeachersStore((s) => s.loaded);
  const loadCourses = useCoursesStore((s) => s.loadCourses);
  const coursesLoaded = useCoursesStore((s) => s.loaded);
  const syncCourses = useCoursesStore((s) => s.syncCourses);
  const shouldAutoSync = useCoursesStore((s) => s.shouldAutoSync);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);
  const notifsLoaded = useNotificationsStore((s) => s.loaded);
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const loadApplications = useApplicationsStore((s) => s.loadApplications);
  const applicationsLoadedForUserId = useApplicationsStore((s) => s.loadedForUserId);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
    NotoSansDevanagari_700Bold,
  });

  // Boot: open DB → run migrations → seed if empty → backfill phone →
  // migrate legacy AsyncStorage (one-time) → hydrate stores.
  useEffect(() => {
    (async () => {
      try {
        const db = getDb();
        runMigrations(db);
        for (const lang of SUPPORTED_LANGS) {
          applyOverrides(lang, translationsRepo.getOverridesForLang(db, lang));
        }
        seedDatabase(db);
        backfillTeacherPhone(db);
        backfillTeacherHomeLocation(db);
        backfillTeacherDemoMonths(db);
        dropDemoShringaJulApplication(db);
        seedExtraDemoApplications(db);
        enrichDemoCourses(db);
        // Legacy AsyncStorage → SQLite migration. Idempotent + gated by a
        // settings flag, so it's a no-op on subsequent boots and on new
        // installs that never had the old keys in the first place.
        await legacyMigrate(db);
        // Schedule OS-level background sync so courses can refresh even
        // when the app is killed. No-op on web; native only.
        if (Platform.OS !== 'web') {
          await registerBackgroundSync();
        }
      } catch (err) {
        logger.error('[boot] db init failed', err);
      } finally {
        setDbReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!dbReady) return;
    restoreSession();
    restoreSettings();
    loadTeachers();
    loadNotifications();
    loadCourses().then(() => {
      if (shouldAutoSync()) syncCourses();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbReady]);

  // Preload the teacher's applications once the session is restored so the
  // Applications tab is instant on first visit instead of showing the empty
  // state for a frame while the DB query runs.
  useEffect(() => {
    if (!dbReady || !userId) return;
    if (applicationsLoadedForUserId === userId) return;
    loadApplications(userId);
  }, [dbReady, userId, applicationsLoadedForUserId, loadApplications]);

  // Register for OS push notifications once the user is known. No-op on
  // web and when PUSH_WORKER_URL is empty (push disabled). Idempotent.
  useEffect(() => {
    if (!dbReady || !userId || !role || Platform.OS === 'web') return;
    registerForPushAsync(userId, role).catch(() => {
      /* logged inside the helper */
    });
  }, [dbReady, userId, role]);

  // Wire foreground display + tap-to-deep-link handlers once.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const cleanup = setupNotificationHandlers(router);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && shouldAutoSync()) {
        syncCourses();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Heartbeat — re-sync every SYNC_MIN_AGE_MS so an app left open all day
  // still receives fresh schedule data without needing to be backgrounded.
  useEffect(() => {
    if (!dbReady) return;
    const id = setInterval(() => {
      if (shouldAutoSync()) syncCourses();
    }, SYNC_MIN_AGE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbReady]);

  const hydrated = dbReady && !authLoading && teachersLoaded && coursesLoaded && notifsLoaded;

  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.cr,
        }}
      >
        <ActivityIndicator size="large" color={Colors.bl} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <Stack
                // re-mount the navigation tree on language change so all screens
                // pick up the new translation strings without per-screen wiring
                key={settingsLanguage}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(teacher)" />
                <Stack.Screen name="(admin)" />
                <Stack.Screen name="(server)" />
                <Stack.Screen name="onboarding" />
              </Stack>
            </ConfirmDialogProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
