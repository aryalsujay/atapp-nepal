import React from 'react';
import { DimensionValue, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTeachersStore } from '@/store/teachersStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { FadeInView } from '@/components/ui/FadeInView';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import {
  serverApplications as serverApplicationsData,
  serverCourses as serverCoursesData,
} from '@/data';

const SV_GRADIENT: [string, string, string] = ['#5A3800', '#8B5E14', '#C8900A'];

function AreaChip({ areaId }: { areaId: string }) {
  const area = SERVICE_AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return (
    <View style={[styles.areaChip, { backgroundColor: Colors.svl }]}>
      <Text style={styles.areaChipText}>
        {area.emoji} {area.label}
      </Text>
    </View>
  );
}

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.min(filled / total, 1) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` as DimensionValue }]} />
    </View>
  );
}

export default function ServerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettingsStore();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const user = findTeacher(userId);

  const name = user?.name ?? 'Server';
  const firstName = name.split(' ')[0];
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  const approvedApp = serverApplicationsData.find((a) => a.status === 'approved');
  const openCourses = serverCoursesData.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView
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
          <LotusHero color="white" opacity={0.09} size={240} />
          <MountainSilhouette />

          {/* Top row */}
          <View style={styles.heroTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.heroTopRight}>
              <TouchableOpacity
                onPress={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                style={styles.langBtn}
              >
                <Text style={styles.langBtnText}>{language === 'en' ? 'NE' : 'EN'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(Routes.serverNotifications)}
                style={styles.bellBtn}
              >
                <Text style={styles.bellText}>🔔</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.greeting}>🙏 Namaste, {firstName}!</Text>
          <Text style={styles.role}>Dhamma Server · सेवक</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard value={String(user?.totalCourses ?? 0)} label="Courses Served" />
            <StatCard value={String(user?.centersServed ?? 0)} label="Centers" />
            <StatCard value={String(user?.coursesThisYear ?? 0)} label="Upcoming" />
          </View>
        </LinearGradient>

        {/* Upcoming Service */}
        {approvedApp && (
          <>
            <SectionHeader title="My Upcoming Service" />
            <FadeInView delay={60}>
              <View style={styles.approvedCard}>
                <View style={styles.approvedHeader}>
                  <View style={styles.approvedBadge}>
                    <Text style={styles.approvedBadgeText}>✓ Approved</Text>
                  </View>
                  <Text style={styles.approvedMeta}>
                    {approvedApp.type} · {approvedApp.dates}
                  </Text>
                </View>
                <Text style={styles.approvedCenter}>{approvedApp.center}</Text>
                <View style={styles.chipRow}>
                  {approvedApp.areas.map((a) => (
                    <AreaChip key={a} areaId={a} />
                  ))}
                </View>
                <View style={styles.approvedInfoRow}>
                  <View style={styles.approvedInfoItem}>
                    <Text style={styles.infoLabel}>Arrive by</Text>
                    <Text style={styles.infoValue}>{approvedApp.arriveBy}</Text>
                  </View>
                  <View style={styles.approvedInfoItem}>
                    <Text style={styles.infoLabel}>Coordinator</Text>
                    <Text style={styles.infoValue}>{approvedApp.coordinator}</Text>
                  </View>
                </View>
              </View>
            </FadeInView>
          </>
        )}

        {/* Open Opportunities */}
        <SectionHeader
          title="Open Opportunities"
          action="See All"
          onAction={() => router.push(Routes.serverOpportunities)}
        />
        {openCourses.map((course, i) => {
          const open = course.total - course.filled;
          const pct = course.total > 0 ? course.filled / course.total : 0;
          return (
            <FadeInView key={course.id} delay={80 + i * 60}>
              <TouchableOpacity
                style={styles.courseCard}
                activeOpacity={0.88}
                onPress={() => router.push(routeTo.serverOpportunityDetail(course.id))}
              >
                <View style={styles.courseCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.courseName}>
                      {course.center} {course.flag}
                    </Text>
                    <Text style={styles.courseMeta}>
                      {course.city} · {course.dates}
                    </Text>
                  </View>
                  <View style={styles.courseTypeBadge}>
                    <Text style={styles.courseTypeText}>{course.type}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressRow}>
                  <ProgressBar filled={course.filled} total={course.total} />
                  <Text style={styles.progressLabel}>
                    {course.filled}/{course.total} filled
                  </Text>
                </View>
                <View style={styles.slotRow}>
                  <View style={styles.openBadge}>
                    <Text style={styles.openText}>{open} open</Text>
                  </View>
                  <Text style={styles.genderSlots}>
                    {course.mServers}m + {course.fServers}f
                  </Text>
                </View>

                {/* Area chips */}
                <View style={styles.chipRow}>
                  {course.areas.slice(0, 4).map((a) => (
                    <AreaChip key={a} areaId={a} />
                  ))}
                  {course.areas.length > 4 && (
                    <View style={styles.areaChip}>
                      <Text style={styles.areaChipText}>+{course.areas.length - 4}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.viewLink}>View Details →</Text>
              </TouchableOpacity>
            </FadeInView>
          );
        })}

        {/* Eligibility card */}
        <FadeInView delay={200}>
          <View style={styles.eligibilityCard}>
            <Text style={styles.eligibilityIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eligibilityTitle}>Eligible to Serve</Text>
              <Text style={styles.eligibilityBody}>
                You have completed the required courses and rest period. You may apply for upcoming
                service.
              </Text>
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
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
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  langBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  bellBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellText: { fontSize: 16 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.ur,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold },

  greeting: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  role: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.lg,
  },
  statsRow: { flexDirection: 'row', gap: 7 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.md,
    padding: 10,
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

  approvedCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: Spacing.sm,
  },
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  approvedBadge: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  approvedBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
  },
  approvedMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    flex: 1,
  },
  approvedCenter: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  approvedInfoRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: 4,
  },
  approvedInfoItem: { gap: 2 },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.semibold,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  areaChip: {
    backgroundColor: Colors.svl,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  areaChipText: {
    fontSize: FontSize.xs,
    color: Colors.sv,
    fontWeight: FontWeight.semibold,
  },

  courseCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: Spacing.sm,
  },
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  courseName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  courseMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    marginTop: 2,
  },
  courseTypeBadge: {
    backgroundColor: Colors.svl,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  courseTypeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.sv,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sv,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  openBadge: {
    backgroundColor: Colors.url,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  openText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },
  genderSlots: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  viewLink: {
    fontSize: FontSize.sm,
    color: Colors.sv,
    fontWeight: FontWeight.bold,
    marginTop: 2,
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
});
