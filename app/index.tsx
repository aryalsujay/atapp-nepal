import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme/colors';

export default function Index() {
  const router = useRouter();
  const { role, userId, isOnboarded, isLoading } = useAuthStore();

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

    // Land non-admin users on their notifications tab when they have
    // unread items so non-tech-savvy users can't miss approvals,
    // rejections, or invites. Admins still land on the dashboard since
    // they have the bell badge at the top of every screen.
    const checkUnreadAndRoute = async (
      userIdLocal: string,
      notifRoute: string,
      defaultRoute: string,
    ) => {
      try {
        await useNotificationsStore.getState().loadNotifications();
        const unread = useNotificationsStore.getState().getUnreadCount(userIdLocal);
        router.replace(unread > 0 ? notifRoute : defaultRoute);
      } catch {
        router.replace(defaultRoute);
      }
    };

    if (role === 'teacher') {
      checkUnreadAndRoute(userId ?? '', Routes.teacherNotifications, Routes.teacherHome);
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
        checkUnreadAndRoute(userId ?? '', Routes.serverNotifications, Routes.serverHome);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userId, isOnboarded, isLoading]);

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
