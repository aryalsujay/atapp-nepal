import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme/colors';

export default function Index() {
  const router = useRouter();
  const { role, isOnboarded, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!role) {
      router.replace(Routes.login);
      return;
    }

    if (role === 'teacher' && !isOnboarded) {
      router.replace(routeTo.onboardingTeacher(1));
      return;
    }

    if (role === 'teacher') {
      router.replace(Routes.teacherHome);
      return;
    }

    if (role === 'admin') {
      router.replace(Routes.adminDashboard);
      return;
    }

    if (role === 'server') {
      if (!isOnboarded) {
        router.replace(Routes.serverOnboarding);
      } else {
        router.replace(Routes.serverHome);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isOnboarded, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.cr,
      }}
    >
      <ActivityIndicator color={Colors.sf} size="large" />
    </View>
  );
}
