import '@/i18n';
import React, { useEffect, useState } from 'react';
import { AppState, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTeachersStore } from '@/store/teachersStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import { getDb } from '@/db';
import { runMigrations } from '@/db/migrate';
import { seedDatabase } from '@/db/seed';
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

  // Boot: open DB → run migrations → seed if empty → then hydrate stores.
  useEffect(() => {
    try {
      const db = getDb();
      runMigrations(db);
      seedDatabase(db);
      setDbReady(true);
    } catch (err) {
      logger.error('[boot] db init failed', err);
      // Render the app anyway — stores still fall back to JSON imports until
      // the SQLite store migration (Phase D of 00-data-layer.md) is complete.
      setDbReady(true);
    }
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
  }, [dbReady]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && shouldAutoSync()) {
        syncCourses();
      }
    });
    return () => sub.remove();
  }, []);

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
