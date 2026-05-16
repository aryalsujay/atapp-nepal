import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import {
  DashboardIcon,
  AppsIcon,
  PeopleIcon,
  CalendarIcon,
  LightningIcon,
  PersonIcon,
} from '@/components/ui/TabIcons';

const BL_ACTIVE = Colors.bl; // admin blue
const BL_INACTIVE = '#AFA090';

interface TabIconProps {
  focused: boolean;
}

const makeTabIcon = (Icon: React.FC<{ size?: number; active?: boolean; accentColor?: string }>) =>
  function TabIcon({ focused }: TabIconProps) {
    return (
      <View style={styles.icon}>
        <Icon size={20} active={focused} accentColor={BL_ACTIVE} />
      </View>
    );
  };

const DashTab = makeTabIcon(DashboardIcon);
const PeopleTab = makeTabIcon(PeopleIcon);
const CalTab = makeTabIcon(CalendarIcon);
const LightTab = makeTabIcon(LightningIcon);
const ServersTab = makeTabIcon(PersonIcon);

function AppsTab({ focused }: TabIconProps) {
  // Prototype shows an unread dot on the inbox tab — hardcoded for now.
  const hasUnread = true;
  return (
    <View style={styles.icon}>
      <AppsIcon size={20} active={focused} accentColor={BL_ACTIVE} />
      {hasUnread && <View style={styles.unreadDot} />}
    </View>
  );
}

function makeLabel(text: string) {
  return function TabLabel({ focused }: { focused: boolean }) {
    return (
      <Text
        numberOfLines={1}
        style={[styles.label, focused && { color: BL_ACTIVE, fontWeight: '800' }]}
      >
        {text}
      </Text>
    );
  };
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 26,
  },
  label: {
    fontSize: 8.2,
    lineHeight: 9,
    fontWeight: '600',
    color: BL_INACTIVE,
    fontFamily: FontFamily.sansSemiBold,
    textAlign: 'center',
    marginTop: -2,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.ur,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});

export default function AdminLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopColor: Colors.bd,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 4,
          paddingHorizontal: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarItemStyle: { paddingVertical: 4, paddingHorizontal: 1 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <DashTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.dashboard')),
        }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{
          tabBarIcon: ({ focused }) => <AppsTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.applications')),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          tabBarIcon: ({ focused }) => <PeopleTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.teachers')),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => <CalTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.calendar')),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ focused }) => <LightTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.schedule')),
        }}
      />
      <Tabs.Screen
        name="server/board"
        options={{
          tabBarIcon: ({ focused }) => <ServersTab focused={focused} />,
          tabBarLabel: makeLabel(t('admin.nav.servers')),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="inbox/[id]" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="server/inbox" options={{ href: null }} />
      <Tabs.Screen name="centres/index" options={{ href: null }} />
      <Tabs.Screen name="centres/[id]" options={{ href: null }} />
    </Tabs>
  );
}
