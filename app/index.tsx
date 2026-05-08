import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/theme/colors';

export default function Index() {
  const router = useRouter();
  const { role, isOnboarded, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!role) {
      router.replace('/(auth)/login');
      return;
    }

    if (role === 'teacher' && !isOnboarded) {
      router.replace('/onboarding/teacher/1');
      return;
    }

    if (role === 'teacher') {
      router.replace('/(teacher)/home');
      return;
    }

    if (role === 'admin') {
      router.replace('/(admin)/dashboard');
      return;
    }

    if (role === 'server') {
      if (!isOnboarded) {
        router.replace('/(server)/onboarding');
      } else {
        router.replace('/(server)/home');
      }
      return;
    }
  }, [role, isOnboarded, isLoading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cr }}>
      <ActivityIndicator color={Colors.sf} size="large" />
    </View>
  );
}
