/**
 * Teacher Home — implements `specs/04-teacher-home.md`.
 *
 * Prototype-faithful port of `app.html:940–1005`. Visuals match the
 * prototype exactly: saffron two-stop hero, 58×58 dhamma-wheel avatar tile,
 * `.card`/`.sph`/`.chip`/`.spill`/`.mbadge`/`.meter` CSS values, prototype
 * literal font sizes (no FontSize tokens, no premium module).
 *
 * Data sources:
 *  - `teachersStore.findTeacher(userId)` — identity + lifetime stats
 *  - `applicationsStore.applications` — appliedCount (non-rejected),
 *    upcoming (approved + future startDate)
 *  - `coursesStore.courses` — base list (synced from dhamma.org), enriched
 *    with match score for the "Best Matches for You" section
 *  - `profileStore.profile` — input for match scoring
 *  - `settingsStore.language` — drives the 🌐 toggle pill label
 */

import React, { useEffect, useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors, GradientDirection } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { LotusGlyph } from '@/components/ui/LotusGlyph';
import { langLabel } from '@/utils/eligibility';
import { enrichCoursesWithMatch } from '@/utils/matching';
import {
  MATCH_HOME_THRESHOLD,
  MAX_MATCHES_ON_HOME,
  MAX_PER_CENTRE_ON_HOME,
  REST_GAP_DAYS,
} from '@/config/app';
import type { Course } from '@/types';

const DHAMMA_WHEEL = require('../../assets/logo-dhamma.gif');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Per-course-type tone for the upcoming-card lotus tile. Forest-green is
 * the default for the main 10-Day family; specialty courses get their own
 * accent to read at a glance.
 */
const TYPE_TONE: Record<string, { bg: string; fg: string }> = {
  '10-Day': { bg: Colors.fol, fg: Colors.fo },
  '20-Day': { bg: Colors.fol, fg: Colors.fo },
  '30-Day': { bg: Colors.fol, fg: Colors.fo },
  '45-Day': { bg: Colors.fol, fg: Colors.fo },
  '60-Day': { bg: Colors.fol, fg: Colors.fo },
  'Satipatthana Sutta': { bg: Colors.gdl, fg: Colors.gd },
  "Children's Anapana": { bg: Colors.bll, fg: Colors.bl },
  'Teen Course': { bg: Colors.bll, fg: Colors.bl },
  Executive: { bg: Colors.sfl, fg: Colors.sf },
};
const DEFAULT_TONE = { bg: Colors.fol, fg: Colors.fo };

/**
 * Format a course date range with explicit year on both ends so the end-date
 * never wraps to a bare "2026" line.
 *
 *   Same year:   "May 12 – May 23, 2026"
 *   Diff year:   "Dec 28, 2025 – Jan 8, 2026"
 *   Fallback:    course.dates (e.g. "May 12–23, 2026")
 */
function formatDateRange(course: { dates: string; startDate?: string; endDate?: string }): string {
  if (!course.startDate || !course.endDate) return course.dates;
  const s = new Date(course.startDate);
  const e = new Date(course.endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return course.dates;
  // Single-day course → "Jul 27, 2026"
  if (s.getTime() === e.getTime()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    // "Jul 27 – 31, 2026"
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (sameYear) {
    // "Oct 31 – Nov 8, 2026"
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  // "Dec 28, 2025 – Jan 8, 2026"
  return `${MONTHS[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
}

/** Last word of full name + ` Ji 🙏`. "Bhikkhu Ananda" → "Ananda Ji 🙏". */
function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return `${parts[parts.length - 1] ?? fullName} Ji 🙏`;
}

function formatMonth(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function TeacherHome() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = useMemo(() => findTeacher(userId), [userId, findTeacher]);

  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const altLangLabel = language === 'en' ? 'नेपाली' : 'English';

  const { profile, loadProfile } = useProfileStore();
  const { applications, loadApplications } = useApplicationsStore();
  const courses = useCoursesStore((s) => s.courses) as Course[];

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
      loadApplications(userId);
    }
  }, [userId, loadProfile, loadApplications]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const appliedCount = useMemo(
    () => applications.filter((a) => a.status !== 'rejected').length,
    [applications],
  );

  const nepalCentersCount = useMemo(() => {
    const history = teacher?.teachingHistory ?? [];
    const nepalCenters = new Set(
      history.filter((h) => (h.country ?? '').toLowerCase() === 'nepal').map((h) => h.center),
    );
    return nepalCenters.size > 0 ? nepalCenters.size : (teacher?.centersServed ?? 0);
  }, [teacher]);

  const upcomingCourses = useMemo(() => {
    const now = Date.now();
    const approved = applications.filter((a) => a.status === 'approved');
    return approved
      .map((a) => courses.find((c) => c.id === a.courseId))
      .filter((c): c is Course => !!c && new Date(c.startDate).getTime() >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [applications, courses]);

  const enriched = useMemo(
    () => (profile ? enrichCoursesWithMatch(courses, profile) : courses),
    [courses, profile],
  );

  const topMatches = useMemo(() => {
    const upcomingIds = new Set(upcomingCourses.map((c) => c.id));
    const now = Date.now();
    const eligible = enriched
      .filter(
        (c) =>
          (c.match ?? 0) >= MATCH_HOME_THRESHOLD &&
          !upcomingIds.has(c.id) &&
          new Date(c.startDate).getTime() >= now,
      )
      .sort((a, b) => {
        const scoreDiff = (b.match ?? 0) - (a.match ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });

    // Round-robin across score tiers for visible variation. Step 1: bucket
    // eligible by score, descending. Step 2: pick one course per tier per
    // round (skipping tiers we've already taken a course from in this round
    // and centres we've already shown). After one pass we get tier diversity;
    // subsequent passes fill remaining slots if any tier has more to offer.
    const tiers = new Map<number, Course[]>();
    for (const c of eligible) {
      const s = c.match ?? 0;
      if (!tiers.has(s)) tiers.set(s, []);
      tiers.get(s)!.push(c);
    }
    const sortedTiers = [...tiers.keys()].sort((a, b) => b - a);
    const seenCentre = new Map<string, number>();
    const picks: Course[] = [];
    let rounds = 0;
    while (picks.length < MAX_MATCHES_ON_HOME && rounds < 5) {
      let pickedThisRound = false;
      for (const tier of sortedTiers) {
        if (picks.length >= MAX_MATCHES_ON_HOME) break;
        const pool = tiers.get(tier) ?? [];
        // Find first course in this tier whose centre hasn't been shown yet
        // this round (and at most twice overall).
        const idx = pool.findIndex((c) => (seenCentre.get(c.center) ?? 0) < MAX_PER_CENTRE_ON_HOME);
        if (idx === -1) continue;
        const [c] = pool.splice(idx, 1);
        seenCentre.set(c.center, (seenCentre.get(c.center) ?? 0) + 1);
        picks.push(c);
        pickedThisRound = true;
      }
      if (!pickedThisRound) break;
      rounds++;
    }
    // Final order: highest score first.
    return picks.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
  }, [enriched, upcomingCourses]);

  const restBlock = useMemo(() => {
    const history = teacher?.teachingHistory ?? [];
    const dates = history
      .map((h) => (h.date ? new Date(h.date) : null))
      .filter((d): d is Date => !!d && !isNaN(d.getTime()) && d.getTime() < Date.now());
    const last = dates.sort((a, b) => b.getTime() - a.getTime())[0];
    if (!last) return null;

    const eligible = new Date(last.getTime() + REST_GAP_DAYS * 86_400_000);
    const now = new Date();
    if (eligible.getTime() <= now.getTime()) {
      const next = new Date(now.getTime() + 14 * 86_400_000);
      return t('home.rest_complete_template', {
        last: formatMonth(last),
        next: formatMonth(next),
      });
    }
    return t('home.rest_pending_template', {
      last: formatMonth(last),
      eligible: formatMonth(eligible),
    });
  }, [teacher?.teachingHistory, t]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#6B3600', Colors.sf] as [string, string]}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(58, insets.top + 18) }]}
        >
          <LotusHero color="white" opacity={0.09} size={230} right={-35} bottom={-35} />
          <MountainSilhouette color="rgba(255,255,255,0.07)" />

          <View style={s.heroTopRow}>
            <View style={s.heroIdentity}>
              <Text style={s.heroGreeting}>{t('home.greeting')}</Text>
              <Text style={s.heroName}>{teacher ? displayName(teacher.name) : '—'}</Text>
              <Text style={s.heroSubtitle}>{t('home.subtitle')}</Text>
            </View>
            <View style={s.heroRightCol}>
              <View style={s.avatarTile}>
                <Image source={DHAMMA_WHEEL} style={s.avatarImage} resizeMode="contain" />
              </View>
              <TouchableOpacity
                onPress={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                style={s.langPill}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.langPillText}>🌐 {altLangLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.statsRow}>
            <StatTile value={String(teacher?.totalCourses ?? 0)} label={t('home.stat_courses')} />
            <StatTile value={`🇳🇵 ${nepalCentersCount}`} label={t('home.stat_nepal')} />
            <StatTile value={`✓ ${appliedCount}`} label={t('home.stat_applied')} />
          </View>
        </LinearGradient>

        {/* ─── Upcoming Courses ────────────────────────────────────────── */}

        <Text style={s.sectionHeader}>📅 {t('home.upcoming_title')}</Text>

        {upcomingCourses.length > 0 ? (
          upcomingCourses.map((c) => (
            <UpcomingCard
              key={c.id}
              course={c}
              onPress={() => router.push(routeTo.teacherApplicationBrief(c.id))}
              confirmedLabel={t('home.confirmed_pill')}
              viewBriefLabel={t('home.view_brief')}
            />
          ))
        ) : (
          <View style={s.card}>
            <Text style={s.emptyText}>{t('home.no_upcoming')}</Text>
            <TouchableOpacity
              onPress={() => router.push(Routes.teacherCourses)}
              style={s.outlineBtn}
              activeOpacity={0.7}
            >
              <Text style={s.outlineBtnText}>{t('home.browse_all')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Best Matches for You ────────────────────────────────────── */}

        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionHeader, s.sectionHeaderInline]}>⭐ {t('home.best_matches')}</Text>
          <TouchableOpacity
            onPress={() => router.push(Routes.teacherCourses)}
            hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
          >
            <Text style={s.seeAllText}>{t('home.see_all')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.matchBasis}>{t('home.match_basis')}</Text>

        {topMatches.map((c) => (
          <MatchCard
            key={c.id}
            course={c}
            onPress={() => router.push(routeTo.teacherCourseDetail(c.id))}
            needAtLabel={t('home.need_at', { count: c.needCount ?? 1 })}
          />
        ))}

        {/* ─── Rest & Practice Reminder ────────────────────────────────── */}

        {restBlock && (
          <View style={[s.card, s.restCard]}>
            <Text style={s.restTitle}>🌙 {t('home.rest_title')}</Text>
            <Text style={s.restBody}>{restBlock}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statTile}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function UpcomingCard({
  course,
  onPress,
  confirmedLabel,
  viewBriefLabel,
}: {
  course: Course;
  onPress: () => void;
  confirmedLabel: string;
  viewBriefLabel: string;
}) {
  const tone = TYPE_TONE[course.type] ?? DEFAULT_TONE;
  const title = /course/i.test(course.type) ? course.type : `${course.type} Course`;
  const dateRange = formatDateRange(course);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={[s.card, s.upcomingCard]}>
        <View style={[s.lotusTile, { backgroundColor: tone.bg }]}>
          <LotusGlyph size={28} color={tone.fg} />
        </View>
        <View style={s.upcomingMid}>
          <Text style={s.upcomingTitle}>{title}</Text>
          <Text style={s.upcomingMeta}>
            {course.center}
            {course.city ? ` · ${course.city}` : ''}
          </Text>
          <Text style={s.upcomingDates}>📅 {dateRange}</Text>
        </View>
        <View style={s.upcomingRight}>
          <View style={s.spillAppr}>
            <Text style={s.spillApprText}>✓ {confirmedLabel}</Text>
          </View>
          <Text style={s.viewBriefText}>{viewBriefLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MatchCard({
  course,
  onPress,
  needAtLabel,
}: {
  course: Course;
  onPress: () => void;
  needAtLabel: string;
}) {
  const score = Math.round(course.match ?? 0);
  const borderColor = score >= 95 ? Colors.fo : Colors.sf;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={[s.card, s.matchCard, { borderLeftColor: borderColor }]}>
        <View style={s.matchTopRow}>
          <View style={s.matchTopLeft}>
            <Text style={s.matchType}>{course.type}</Text>
            <Text style={s.matchCenter}>{course.center}</Text>
            {course.city ? <Text style={s.matchCity}>{course.city}</Text> : null}
          </View>
          <MatchBadge score={score} />
        </View>

        <View style={s.matchChipRow}>
          <View style={[s.chip, s.chipGy]}>
            <Text style={s.chipGyText}>📅 {course.dates}</Text>
          </View>
          {(course.languages ?? []).map((lang) => (
            <View key={lang} style={[s.chip, s.chipBl]}>
              <Text style={s.chipBlText}>{langLabel(lang)}</Text>
            </View>
          ))}
          <View style={[s.chip, s.chipSf]}>
            <Text style={s.chipSfText}>{needAtLabel}</Text>
          </View>
        </View>

        <Meter score={score} />
      </View>
    </TouchableOpacity>
  );
}

function MatchBadge({ score }: { score: number }) {
  const tier =
    score >= 90
      ? { bg: Colors.fol, fg: Colors.fo }
      : score >= 70
        ? { bg: Colors.bll, fg: Colors.bl }
        : { bg: Colors.cr2, fg: Colors.tx2 };
  return (
    <View style={[s.mbadge, { backgroundColor: tier.bg }]}>
      <Text style={[s.mbadgeText, { color: tier.fg }]}>{score}% match</Text>
    </View>
  );
}

function Meter({ score }: { score: number }) {
  const fill = score >= 90 ? Colors.fo : score >= 70 ? Colors.bl : Colors.tx3;
  return (
    <View style={s.meter}>
      <View
        style={[
          s.meterFill,
          { width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: fill },
        ]}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  heroIdentity: {
    flex: 1,
    paddingRight: 12,
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.devanagari,
    lineHeight: 18,
  },
  heroName: {
    fontSize: 23,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 28,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroRightCol: {
    alignItems: 'flex-end',
    gap: 9,
  },
  avatarTile: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  langPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  langPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.white,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    position: 'relative',
  },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
  },

  // Section headers — .sph
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84, // 0.07em on 12 px
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
  sectionHeaderInline: {
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 9,
    paddingRight: 18,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.sf,
    fontWeight: '600',
  },
  matchBasis: {
    fontSize: 12,
    color: Colors.tx3,
    paddingHorizontal: 18,
    paddingBottom: 9,
    fontStyle: 'italic',
  },

  // Card — prototype .card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },

  // Upcoming card
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  lotusTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.fol,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  upcomingMid: { flex: 1 },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
  },
  upcomingMeta: {
    fontSize: 12,
    color: Colors.tx2,
  },
  upcomingDates: {
    fontSize: 11.5,
    color: Colors.tx3,
    marginTop: 1,
  },
  upcomingRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  spillAppr: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  spillApprText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.fo,
  },
  viewBriefText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.fo,
  },

  // Empty state
  emptyText: {
    fontSize: 12.5,
    color: Colors.tx2,
    marginBottom: 11,
  },
  outlineBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx,
  },

  // Match card
  matchCard: {
    borderLeftWidth: 4,
    paddingLeft: 15 - 4,
  },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  matchTopLeft: { flex: 1, paddingRight: 8 },
  matchType: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.tx,
  },
  matchCenter: {
    fontSize: 13,
    color: Colors.tx2,
  },
  matchCity: {
    fontSize: 12,
    color: Colors.tx3,
  },
  matchChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 7,
  },

  // Chips
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chipGy: { backgroundColor: Colors.cr2 },
  chipGyText: { fontSize: 11, fontWeight: '600', color: Colors.tx2 },
  chipBl: { backgroundColor: Colors.bll },
  chipBlText: { fontSize: 11, fontWeight: '600', color: Colors.bl },
  chipSf: { backgroundColor: Colors.sfl },
  chipSfText: { fontSize: 11, fontWeight: '600', color: Colors.sfd },

  // Match badge
  mbadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  mbadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Meter
  meter: {
    height: 5,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Rest card
  restCard: {
    backgroundColor: Colors.gdl,
    borderWidth: 1,
    borderColor: '#F5E0A0',
  },
  restTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gd,
    marginBottom: 4,
  },
  restBody: {
    fontSize: 12,
    color: '#7A6000',
    lineHeight: 18,
  },
});
