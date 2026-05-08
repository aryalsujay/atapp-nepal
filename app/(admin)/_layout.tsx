import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme/colors';
import {
  DashboardIcon,
  AppsIcon,
  PeopleIcon,
  CalendarIcon,
  LightningIcon,
  PersonIcon,
} from '../../src/components/ui/TabIcons';

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

const DashTab    = makeTabIcon(DashboardIcon, Colors.bl, Colors.bll);
const AppsTab    = makeTabIcon(AppsIcon,      Colors.bl, Colors.bll);
const PeopleTab  = makeTabIcon(PeopleIcon,    Colors.bl, Colors.bll);
const CalTab     = makeTabIcon(CalendarIcon,  Colors.bl, Colors.bll);
const LightTab   = makeTabIcon(LightningIcon, Colors.bl, Colors.bll);
const ServersTab = makeTabIcon(PersonIcon,    Colors.bl, Colors.bll);

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default function AdminLayout() {
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
        name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <DashTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{ tabBarIcon: ({ focused }) => <AppsTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="directory"
        options={{ tabBarIcon: ({ focused }) => <PeopleTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ tabBarIcon: ({ focused }) => <CalTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ tabBarIcon: ({ focused }) => <LightTab focused={focused} /> }}
      />
      <Tabs.Screen
        name="server/board"
        options={{ tabBarIcon: ({ focused }) => <ServersTab focused={focused} /> }}
      />
      {/* Hidden screens — no tab */}
      <Tabs.Screen name="inbox/[id]"      options={{ href: null }} />
      <Tabs.Screen name="notifications"   options={{ href: null }} />
      <Tabs.Screen name="server/inbox"    options={{ href: null }} />
      <Tabs.Screen name="centres/index"   options={{ href: null }} />
      <Tabs.Screen name="centres/[id]"    options={{ href: null }} />
    </Tabs>
  );
}
