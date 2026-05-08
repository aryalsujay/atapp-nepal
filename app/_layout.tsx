import '../global.css';
import '../src/i18n';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTeachersStore } from '../src/store/teachersStore';
import { useCoursesStore } from '../src/store/coursesStore';
import { useNotificationsStore } from '../src/store/notificationsStore';
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

const queryClient = new QueryClient();

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const restoreSettings = useSettingsStore((s) => s.restoreSettings);
  const loadTeachers = useTeachersStore((s) => s.loadTeachers);
  const loadCourses = useCoursesStore((s) => s.loadCourses);
  const syncCourses = useCoursesStore((s) => s.syncCourses);
  const shouldAutoSync = useCoursesStore((s) => s.shouldAutoSync);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(server)" />
            <Stack.Screen name="onboarding" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
