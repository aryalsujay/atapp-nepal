import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { HomeIcon, LotusIcon, InboxIcon, BellIcon, PersonIcon } from '@/components/ui/TabIcons';

const SV_ACCENT = '#9B6B14';
const SV_INACTIVE = '#AFA090';

interface TabIconProps {
  focused: boolean;
}

const makeTabIcon = (Icon: React.FC<{ size?: number; active?: boolean; accentColor?: string }>) =>
  function TabIconComp({ focused }: TabIconProps) {
    return (
      <View style={styles.icon}>
        <Icon size={22} active={focused} accentColor={SV_ACCENT} />
      </View>
    );
  };

const HomeTab = makeTabIcon(HomeIcon);
const LotusTab = makeTabIcon(LotusIcon);
const InboxTab = makeTabIcon(InboxIcon);
const PersonTab = makeTabIcon(PersonIcon);

function BellTab({ focused }: TabIconProps) {
  const unread = 0;
  return (
    <View style={styles.icon}>
      <BellIcon size={22} active={focused} accentColor={SV_ACCENT} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread}</Text>
        </View>
      )}
    </View>
  );
}

function makeLabel(text: string) {
  return function TabLabel({ focused }: { focused: boolean }) {
    return (
      <Text
        numberOfLines={1}
        style={[styles.label, focused && { color: SV_ACCENT, fontWeight: '800' }]}
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
    width: 32,
    height: 28,
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: SV_INACTIVE,
    fontFamily: FontFamily.sansSemiBold,
    textAlign: 'center',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.ur,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
});

export default function ServerLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 66,
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopColor: Colors.bd,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 4,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <HomeTab focused={focused} />,
          tabBarLabel: makeLabel(t('server.nav.home')),
        }}
      />
      <Tabs.Screen
        name="opportunities/index"
        options={{
          tabBarIcon: ({ focused }) => <LotusTab focused={focused} />,
          tabBarLabel: makeLabel(t('server.nav.serve')),
        }}
      />
      <Tabs.Screen
        name="applications/index"
        options={{
          tabBarIcon: ({ focused }) => <InboxTab focused={focused} />,
          tabBarLabel: makeLabel(t('server.nav.my_service')),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => <BellTab focused={focused} />,
          tabBarLabel: makeLabel(t('server.nav.notifications')),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => <PersonTab focused={focused} />,
          tabBarLabel: makeLabel(t('server.nav.profile')),
        }}
      />
      {/* Hidden screens (no tab) */}
      <Tabs.Screen name="opportunities/[id]" options={{ href: null }} />
      <Tabs.Screen name="apply/[id]" options={{ href: null }} />
      <Tabs.Screen name="applications/[id]" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
