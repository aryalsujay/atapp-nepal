import React, { useEffect, useMemo } from 'react';
import { DimensionValue, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Gradients } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { CourseCard } from '@/components/cards/CourseCard';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { FadeInView } from '@/components/ui/FadeInView';
import { useCoursesStore } from '@/store/coursesStore';
import { Course, TeacherProfile } from '@/types';
import { enrichCoursesWithMatch, getMatchTier } from '@/utils/matching';

const TYPE_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  '45-Day': '🌲',
  '60-Day': '🏔️',
  '3-Day': '🌸',
  '1-Day': '☸️',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🧒',
  Executive: '💼',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TIER_COLOR = { high: Colors.fo, mid: Colors.bl, low: Colors.tx3 };
const TIER_BG = { high: Colors.fol, mid: Colors.bll, low: Colors.cr2 };

function getTodayLabel(): string {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function availableMonthsLabel(availableMonths: number[]): string {
  const count = availableMonths.length;
  if (count === 0) return 'No months set';
  const sorted = [...availableMonths].sort((a, b) => a - b);
  return `${MONTHS[sorted[0]]}+ (${count} mo)`;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { profile, loadProfile } = useProfileStore();
  const { applications, loadApplications } = useApplicationsStore();
  const { language, setLanguage } = useSettingsStore();

  useEffect(() => {
    loadProfile(userId);
    loadApplications(userId);
  }, [userId]);

  const courses = useCoursesStore((s) => s.courses) as Course[];
  const visibleCourses = useMemo(() => courses.filter((c) => (c.needCount ?? 1) > 0), [courses]);
  const enriched = useMemo(
    () => (profile ? enrichCoursesWithMatch(visibleCourses, profile) : visibleCourses),
    [visibleCourses, profile],
  );
  const topMatches = useMemo(
    () => enriched.filter((c) => (c.match ?? 0) >= 83).slice(0, 5),
    [enriched],
  );

  const approvedApps = applications.filter((a) => a.status === 'approved');
  const approvedCourses = approvedApps
    .map((app) => courses.find((c) => c.id === app.courseId))
    .filter(Boolean) as Course[];

  const name = profile?.name ?? 'Teacher';
  const firstName = name.split(' ')[0];
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const availLabel = profile ? availableMonthsLabel(profile.availableMonths) : '—';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <LinearGradient
          colors={Gradients.teacher as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 16 }]}
        >
          <LotusHero color="white" opacity={0.09} size={240} />
          <MountainSilhouette />

          {/* Top row: avatar + date + lang + bell */}
          <View style={styles.heroTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.heroTopCenter}>
              <Text style={styles.todayLabel}>{getTodayLabel()}</Text>
            </View>
            <View style={styles.heroTopRight}>
              <TouchableOpacity
                onPress={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                style={styles.langBtn}
              >
                <Text style={styles.langBtnText}>{language === 'en' ? 'NE' : 'EN'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(Routes.teacherNotifications)}
                style={styles.bellBtn}
              >
                <Text style={styles.bellText}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.greeting}>
            🙏 {t('home.greeting')}, {firstName}!
          </Text>
          <Text style={styles.role}>{t('home.subtitle')}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard value={String(profile?.totalCourses ?? 0)} label="Total Courses" />
            <StatCard value={String(profile?.coursesThisYear ?? 0)} label="This Year" />
            <StatCard value={String(profile?.authorizations?.length ?? 0)} label="Authorizations" />
            <StatCard value={availLabel} label="Available" small />
          </View>
        </LinearGradient>

        {/* ── Upcoming confirmed ── */}
        {approvedCourses.length > 0 && (
          <>
            <SectionHeader title={t('home.upcomingCourses')} />
            {approvedCourses.map((course, i) => (
              <FadeInView key={course.id} delay={80 + i * 60}>
                <CourseCard
                  course={course}
                  isAssigned
                  onPress={() => router.push(routeTo.teacherCourseDetail(course.id))}
                />
              </FadeInView>
            ))}
          </>
        )}

        {/* ── Rest & Practice Reminder ── */}
        {profile?.teachingHistory && profile.teachingHistory.length > 0 && (
          <FadeInView delay={60}>
            <RestReminderCard
              lastCourseDate={profile.teachingHistory[0]?.date ?? ''}
              availableMonth={MONTHS[[...profile.availableMonths].sort((a, b) => a - b)[0]] ?? '—'}
            />
          </FadeInView>
        )}

        {/* ── Best Matches ── */}
        <SectionHeader
          title={t('home.bestMatches')}
          action="See All"
          onAction={() => router.push(Routes.teacherCourses)}
        />
        <Text style={styles.matchSubtitle}>Based on profile & availability</Text>
        {topMatches.map((course, i) => (
          <FadeInView key={course.id} delay={100 + i * 50}>
            <MatchCard
              course={course}
              isApplied={applications.some((a) => a.courseId === course.id)}
              onPress={() => router.push(routeTo.teacherCourseDetail(course.id))}
            />
          </FadeInView>
        ))}

        {/* ── Browse all CTA ── */}
        <TouchableOpacity
          onPress={() => router.push(Routes.teacherCourses)}
          style={styles.browseBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.browseBtnText}>🪷 {t('home.browseAll')}</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface StatCardProps {
  value: string;
  label: string;
  small?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ value, label, small }) => (
  <View style={styles.statCard}>
    <Text
      style={[styles.statValue, small && { fontSize: FontSize.smPlus }]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
    <Text style={styles.statLabel} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

interface RestReminderCardProps {
  lastCourseDate: string;
  availableMonth: string;
}
const RestReminderCard: React.FC<RestReminderCardProps> = ({ lastCourseDate, availableMonth }) => (
  <View style={styles.restCard}>
    <Text style={styles.restTitle}>🌙 Rest & Practice Reminder</Text>
    <Text style={styles.restBody}>
      Your last course was {lastCourseDate}. You are now eligible to serve again.
      {availableMonth !== '—' ? ` Next available: ${availableMonth} 2026.` : ''}
    </Text>
  </View>
);

interface MatchCardProps {
  course: Course & { match?: number };
  isApplied: boolean;
  onPress: () => void;
}
const MatchCard: React.FC<MatchCardProps> = ({ course, isApplied, onPress }) => {
  const score = course.match ?? 0;
  const tier = getMatchTier(score);
  const accentColor = TIER_COLOR[tier];
  const accentBg = TIER_BG[tier];
  const emoji = TYPE_EMOJI[course.type] ?? '🧘';

  return (
    <TouchableOpacity
      style={[styles.matchCard, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.matchCardRow}>
        {/* Icon box */}
        <View style={[styles.matchIcon, { backgroundColor: accentBg }]}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.matchInfo}>
          <View style={styles.matchTopRow}>
            <Text style={styles.matchCenter} numberOfLines={1}>
              {course.center}
            </Text>
            <View style={[styles.matchBadge, { backgroundColor: accentBg }]}>
              <Text style={[styles.matchBadgeText, { color: accentColor }]}>{score}% match</Text>
            </View>
          </View>
          <Text style={styles.matchType}>{course.type}</Text>
          <Text style={styles.matchMeta}>
            📅 {course.dates} · 📍 {course.city.split(',')[0]}
          </Text>

          {/* Lang chips + applied */}
          <View style={styles.matchChipRow}>
            {course.languages.map((lang) => (
              <View key={lang} style={styles.langPill}>
                <Text style={styles.langPillText}>
                  {lang === 'ne'
                    ? 'NE'
                    : lang === 'en'
                      ? 'EN'
                      : lang === 'hi'
                        ? 'HI'
                        : lang.toUpperCase()}
                </Text>
              </View>
            ))}
            {isApplied && (
              <View style={[styles.langPill, { backgroundColor: Colors.gdl }]}>
                <Text style={[styles.langPillText, { color: Colors.gd }]}>Applied</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Match meter */}
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            { width: `${score}%` as DimensionValue, backgroundColor: accentColor },
          ]}
        />
      </View>

      <Text style={[styles.viewLink, { color: accentColor }]}>View & Apply →</Text>
    </TouchableOpacity>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: 28,
    overflow: 'hidden',
  },

  // Hero top row
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
  heroTopCenter: {
    flex: 1,
    alignItems: 'center',
  },
  todayLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
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

  // Greeting
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 7,
  },
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

  // Rest reminder
  restCard: {
    backgroundColor: Colors.gdl,
    borderWidth: 1,
    borderColor: '#F5E0A0',
    borderRadius: Radius.lg,
    padding: 14,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    gap: 5,
  },
  restTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.gd,
  },
  restBody: {
    fontSize: FontSize.sm,
    color: '#7A6000',
    lineHeight: FontSize.sm * 1.6,
  },

  matchSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    paddingHorizontal: Layout.horizontalPad,
    marginTop: -6,
    marginBottom: 4,
  },

  // Vertical match card
  matchCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    padding: 13,
    gap: 8,
    ...Shadows.card,
  },
  matchCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  matchIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  matchInfo: { flex: 1, gap: 3 },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchCenter: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  matchBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  matchBadgeText: { fontSize: 11, fontWeight: FontWeight.extrabold },
  matchType: { fontSize: FontSize.sm, color: Colors.tx2, fontWeight: FontWeight.medium },
  matchMeta: { fontSize: FontSize.xs, color: Colors.tx3 },
  matchChipRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 2 },
  langPill: {
    backgroundColor: Colors.bll,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  langPillText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.bl },
  meterTrack: {
    height: 4,
    backgroundColor: Colors.cr2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 2 },
  viewLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },

  // Browse CTA
  browseBtn: {
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    backgroundColor: Colors.sfl,
    borderRadius: Radius.lg,
    paddingVertical: Layout.buttonPadV,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  browseBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
});
