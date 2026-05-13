import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Routes, routeTo } from '@/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SERVICE_AREAS } from '@/data/serviceAreas';

const SV_GRADIENT: [string, string, string] = ['#5A3800', '#8B5E14', '#C8900A'];

const FALLBACK_HISTORY = [
  { center: 'Dhamma Shringa', type: '10-Day', year: 2025, areas: ['kitchen', 'dining'] },
  { center: 'Dhamma Pokhara', type: '10-Day', year: 2024, areas: ['dhamma', 'compound'] },
];

function AreaPill({ areaId }: { areaId: string }) {
  const area = SERVICE_AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return (
    <View style={[styles.areaPill, { backgroundColor: area.color + '22' }]}>
      <Text style={[styles.areaPillText, { color: area.color }]}>
        {area.emoji} {area.label}
      </Text>
    </View>
  );
}

export default function ServerProfileScreen() {
  const router = useRouter();
  const confirm = useConfirm();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);
  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const user = findTeacher(userId);

  const name = user?.name ?? 'Server';
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();
  const history: { center: string; type: string; year: number; areas: string[] }[] =
    FALLBACK_HISTORY;

  const handleSignOut = () => {
    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      destructive: true,
      onConfirm: async () => {
        await signOut();
        router.replace(Routes.login);
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* Hero */}
      <LinearGradient
        colors={SV_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>
          Dhamma Server · सेवक · {user?.region ?? 'Nepal'} {user?.flag ?? '🇳🇵'}
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={String(user?.totalCourses ?? 0)} label="Courses Served" />
          <StatCard value={String(user?.centersServed ?? 0)} label="Centers" />
          <StatCard value={String(user?.authorizedSince ?? '—')} label="Since" />
        </View>
      </LinearGradient>

      {/* Eligibility badge */}
      <View style={styles.eligibilityCard}>
        <Text style={styles.eligibilityIcon}>✅</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.eligibilityTitle}>Eligible to Serve</Text>
          <Text style={styles.eligibilityBody}>
            You have completed the required Vipassana courses and rest period.
          </Text>
        </View>
      </View>

      {/* Service history */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Service History</Text>
        {history.map((item, i) => (
          <View key={i} style={[styles.historyItem, i > 0 && styles.historyItemBorder]}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyCenter}>{item.center}</Text>
              <Text style={styles.historyMeta}>
                {item.type} · {item.year}
              </Text>
            </View>
            <View style={styles.historyAreas}>
              {item.areas.map((a) => (
                <AreaPill key={a} areaId={a} />
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
  },
  name: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    textAlign: 'center',
  },
  role: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 7,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  eligibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.fol,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.fom,
  },
  eligibilityIcon: { fontSize: 22 },
  eligibilityTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
  },
  eligibilityBody: {
    fontSize: FontSize.sm,
    color: Colors.fo,
    marginTop: 2,
    lineHeight: FontSize.sm * 1.5,
  },

  sectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    marginBottom: Spacing.md,
  },
  historyItem: {
    paddingVertical: Spacing.sm,
    gap: 5,
  },
  historyItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
  },
  historyLeft: { gap: 2 },
  historyCenter: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  historyMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  historyAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  areaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  areaPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  signOutBtn: {
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.xl,
    paddingVertical: Layout.buttonPadV,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ur,
    backgroundColor: Colors.url,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },
});
