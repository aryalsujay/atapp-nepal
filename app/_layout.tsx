import '../global.css';
import '../src/i18n';
import React, { useEffect } from 'react';
import { AppState, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTeachersStore } from '../src/store/teachersStore';
import { useCoursesStore } from '../src/store/coursesStore';
import { useNotificationsStore } from '../src/store/notificationsStore';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';
import { Colors } from '../src/theme/colors';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
  });

  useEffect(() => {
    restoreSession();
    restoreSettings();
    loadTeachers();
    loadNotifications();
    loadCourses().then(() => {
      if (shouldAutoSync()) syncCourses();
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && shouldAutoSync()) {
        syncCourses();
      }
    });
    return () => sub.remove();
  }, []);

  const hydrated =
    !authLoading && teachersLoaded && coursesLoaded && notifsLoaded;

  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cr }}>
        <ActivityIndicator size="large" color={Colors.bl} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
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
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
