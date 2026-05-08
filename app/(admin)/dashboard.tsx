import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { LotusHero, MountainSilhouette } from '../../src/components/ui/HeroDecorations';
import { FadeInView } from '../../src/components/ui/FadeInView';
import { Colors, Gradients } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../src/theme/spacing';
import { Shadows } from '../../src/theme/shadows';
import { SectionHeader } from '../../src/components/layout/SectionHeader';
import { Toggle } from '../../src/components/ui/Toggle';
import { Chip } from '../../src/components/ui/Badge';
import { useCoursesStore } from '../../src/store/coursesStore';
import applicationsData from '../../src/data/applications.json';
import teachersData from '../../src/data/teachers.json';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);
  const { showCoTeacher, toggleCoTeacher } = useSettingsStore();
  const { courses, lastSyncAt, syncing, syncCourses } = useCoursesStore();

  const pendingApps = (applicationsData as any[]).filter((a) => a.status === 'pending').length;
  const totalTeachers = (teachersData as any[]).length;

  const urgentCourses = courses
    .filter((c: any) => c.status === 'open' || c.status === 'not_yet_open')
    .slice(0, 3);

  const handleSync = async () => {
    const result = await syncCourses();
    if (result.error) {
      Alert.alert('Sync Failed', result.error);
    } else {
      Alert.alert('Sync Complete', `${result.added} courses updated from dhamma.org`);
    }
  };

  const syncLabel = lastSyncAt
    ? `Last sync: ${lastSyncAt.toLocaleDateString()} ${lastSyncAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Never synced';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.cr }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={Gradients.admin as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <LotusHero color="white" opacity={0.09} size={240} />
        <MountainSilhouette />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>{t('admin.dashboard.title')}</Text>
            <Text style={styles.heroCenter}>{t('admin.dashboard.center')}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <AdminStat label={t('admin.dashboard.pending')} value={String(pendingApps)} emoji="📥" />
          <AdminStat label="Teachers" value={String(totalTeachers)} emoji="🧘" />
          <AdminStat label={t('admin.dashboard.activeATs')} value="2" emoji="✅" />
          <AdminStat label="Courses" value={String(urgentCourses.length)} emoji="🪷" />
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <QuickAction emoji="📥" label="Applications" onPress={() => router.push('/(admin)/inbox')} color={Colors.sf} />
        <QuickAction emoji="👥" label="Teachers" onPress={() => router.push('/(admin)/directory')} color={Colors.fo} />
        <QuickAction emoji="⚡" label="Auto-Schedule" onPress={() => router.push('/(admin)/schedule')} color={Colors.bl} />
        <QuickAction emoji="📅" label="Calendar" onPress={() => router.push('/(admin)/calendar')} color={Colors.gd} />
      </View>

      {/* Urgent courses */}
      <SectionHeader
        title={t('admin.dashboard.urgentCourses')}
        action="View All"
        onAction={() => router.push('/(admin)/schedule')}
      />
      {urgentCourses.map((course: any, i: number) => (
        <FadeInView key={course.id} delay={100 + i * 60}>
          <View style={styles.urgentCard}>
            <View style={styles.urgentLeft}>
              <Text style={styles.urgentType}>{course.type}</Text>
              <Text style={styles.urgentCenter}>{course.center}</Text>
              <Text style={styles.urgentDates}>📅 {course.dates}</Text>
            </View>
            <View style={styles.urgentRight}>
              <Chip
                label={course.status === 'open' ? 'Open' : 'Upcoming'}
                variant={course.status === 'open' ? 'orange' : 'gray'}
              />
              <TouchableOpacity
                onPress={() => router.push('/(admin)/inbox')}
                style={styles.assignBtn}
              >
                <Text style={styles.assignBtnText}>Assign →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeInView>
      ))}

      {/* Recent applications */}
      <SectionHeader
        title={t('admin.dashboard.recentApplications')}
        action="See All"
        onAction={() => router.push('/(admin)/inbox')}
      />
      {(applicationsData as any[]).slice(0, 3).map((app: any) => {
        const teacher = (teachersData as any[]).find((t) => t.id === app.teacherId);
        const course = (courses as any[]).find((c) => c.id === app.courseId);
        return (
          <TouchableOpacity
            key={app.id}
            onPress={() => router.push(`/(admin)/inbox/${app.id}`)}
            style={styles.appCard}
            activeOpacity={0.85}
          >
            <View style={styles.appAvatar}>
              <Text style={styles.appAvatarText}>{teacher?.name?.charAt(0) ?? '?'}</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{teacher?.name ?? 'Unknown'}</Text>
              <Text style={styles.appCourse}>{course?.center} — {course?.type}</Text>
              <Text style={styles.appDate}>{app.appliedDate}</Text>
            </View>
            <Chip
              label={app.status.toUpperCase()}
              variant={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : 'gold'}
            />
          </TouchableOpacity>
        );
      })}

      {/* Course Sync */}
      <SectionHeader title="📡 Course Data" />
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🔄 Sync from dhamma.org</Text>
            <Text style={styles.settingDesc}>{syncLabel} · {courses.length} courses loaded</Text>
          </View>
          <TouchableOpacity
            onPress={handleSync}
            disabled={syncing}
            style={[styles.syncBtn, syncing && { opacity: 0.55 }]}
          >
            <Text style={styles.syncBtnText}>{syncing ? 'Syncing…' : 'Sync'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings */}
      <SectionHeader title={t('admin.dashboard.settings')} />
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('admin.dashboard.showCoTeacher')}</Text>
            <Text style={styles.settingDesc}>Show co-teacher contact info to assigned ATs</Text>
          </View>
          <Toggle value={showCoTeacher} onToggle={toggleCoTeacher} />
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const AdminStat = ({ label, value, emoji }: { label: string; value: string; emoji: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({ emoji, label, onPress, color }: { emoji: string; label: string; onPress: () => void; color: string }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.quickAction, { borderColor: color + '33' }]}>
    <View style={[styles.quickIcon, { backgroundColor: color + '18' }]}>
      <Text style={styles.quickEmoji}>{emoji}</Text>
    </View>
    <Text style={[styles.quickLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Layout.heroPadBottom + 10,
    gap: Spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroCenter: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginTop: 3,
  },
  signOutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  signOutText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 16 },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },

  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...Shadows.card,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickEmoji: { fontSize: 18 },
  quickLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },

  urgentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 4,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sf,
    ...Shadows.card,
    gap: 8,
  },
  urgentLeft: { flex: 1, gap: 3 },
  urgentType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgentCenter: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  urgentDates: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  urgentRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  assignBtn: {
    backgroundColor: Colors.sfl,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  assignBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },

  appCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 4,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: Spacing.md,
  },
  appAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appAvatarText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  appInfo: { flex: 1, gap: 2 },
  appName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  appCourse: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
  },
  appDate: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },

  settingsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingInfo: { flex: 1, gap: 3 },
  settingLabel: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  settingDesc: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    lineHeight: FontSize.sm * 1.4,
  },
  syncBtn: {
    backgroundColor: Colors.bll,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  syncBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },
});
