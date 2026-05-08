import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme/colors';
import {
  HomeIcon,
  LotusIcon,
  InboxIcon,
  BellIcon,
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
  function TabIconComp({ focused }: TabIconProps) {
    return (
      <View style={[styles.icon, focused && { backgroundColor: activeBg }]}>
        <Icon size={22} active={focused} accentColor={accentColor} />
      </View>
    );
  };

const HomeTab = makeTabIcon(HomeIcon, Colors.sv, Colors.svl);
const LotusTab = makeTabIcon(LotusIcon, Colors.sv, Colors.svl);
const InboxTab = makeTabIcon(InboxIcon, Colors.sv, Colors.svl);
const BellTab = makeTabIcon(BellIcon, Colors.sv, Colors.svl);
const PersonTab = makeTabIcon(PersonIcon, Colors.sv, Colors.svl);

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default function ServerLayout() {
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
        name="opportunities/index"
        options={{ tabBarIcon: ({ focused }) => <LotusTab focused={focused} /> }}
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
      <Tabs.Screen name="opportunities/[id]"   options={{ href: null }} />
      <Tabs.Screen name="apply/[id]"           options={{ href: null }} />
      <Tabs.Screen name="applications/[id]"    options={{ href: null }} />
      <Tabs.Screen name="onboarding"           options={{ href: null }} />
    </Tabs>
  );
}
