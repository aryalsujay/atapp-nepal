import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme/colors';
import { HomeIcon, ListIcon, InboxIcon, PersonIcon, BellIcon } from '@/components/ui/TabIcons';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';

interface TabIconProps {
  focused: boolean;
}

const makeTabIcon = (
  Icon: React.FC<{ size?: number; active?: boolean; accentColor?: string }>,
  accentColor: string,
  activeBg: string,
) =>
  function TabIcon({ focused }: TabIconProps) {
    return (
      <View style={[styles.icon, focused && { backgroundColor: activeBg }]}>
        <Icon size={22} active={focused} accentColor={accentColor} />
      </View>
    );
  };

const HomeTab = makeTabIcon(HomeIcon, Colors.sf, Colors.sfl);
const ListTab = makeTabIcon(ListIcon, Colors.sf, Colors.sfl);
const InboxTab = makeTabIcon(InboxIcon, Colors.sf, Colors.sfl);
const PersonTab = makeTabIcon(PersonIcon, Colors.sf, Colors.sfl);
function BellTab({ focused }: TabIconProps) {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const unread = useNotificationsStore((s) => s.getUnreadCount(userId));
  return (
    <View style={[styles.icon, focused && { backgroundColor: Colors.sfl }]}>
      <BellIcon size={22} active={focused} accentColor={Colors.sf} />
      {unread > 0 && <View style={styles.unreadDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ur,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.bd,
          borderTopWidth: 1,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <HomeTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="courses/index"
        options={{ tabBarIcon: ({ focused }) => <ListTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="applications/index"
        options={{ tabBarIcon: ({ focused }) => <InboxTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIcon: ({ focused }) => <BellTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{ tabBarIcon: ({ focused }) => <PersonTab focused={focused} /> }}
      />
      {/* Hidden screens (no tab) */}
      <Tabs.Screen name="courses/[id]" options={{ href: null }} />
      <Tabs.Screen name="applications/brief/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
    </Tabs>
  );
}
