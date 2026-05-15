/**
 * Teacher Courses (browse) — implements `specs/05-teacher-courses.md`.
 *
 * Prototype-faithful port of `app.html:1007–1068`. White header zone with
 * title + subtitle + filtered-count caption; sticky filter zone with a
 * search bar and two horizontally-scrolling chip rows (type + centre);
 * card list sorted by match score; per-card type chip + meta lines +
 * date/lang chips + match badge + 5 px meter + "View & Apply →".
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useProfileStore } from '@/store/profileStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { langLabel } from '@/utils/eligibility';
import { enrichCoursesWithMatch } from '@/utils/matching';
import { travelFor } from '@/utils/travel';
import { MatchBadge, Meter } from '@/components/ui/MatchPill';
import type { Course } from '@/types';

const TYPE_FILTERS = ['All', '1-Day', '10-Day', 'Satipatthana', '20-Day', '30-Day'] as const;

const TYPE_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  '45-Day': '🌲',
  '60-Day': '🏔️',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🧒',
  Executive: '💼',
  '1-Day': '☸️',
  '3-Day': '🌸',
};

function shortCenterName(name: string): string {
  return name.replace(/^(Dhamma|Dharma) /, '');
}

export default function TeacherCourses() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = userId ? findTeacher(userId) : undefined;

  const courses = useCoursesStore((s) => s.courses) as Course[];
  const loadCourses = useCoursesStore((s) => s.loadCourses);
  const { profile, loadProfile } = useProfileStore();

  useEffect(() => {
    if (courses.length === 0) loadCourses();
    if (userId) loadProfile(userId);
  }, [userId, courses.length, loadCourses, loadProfile]);

  // Profile fallback — if profileStore hasn't loaded yet, synthesize a
  // matcher-compatible profile from the teachersStore row so the match
  // scores aren't all 0% on first paint.
  const matchProfile = useMemo(() => {
    if (profile) return profile;
    if (!teacher) return null;
    return {
      id: teacher.id,
      name: teacher.name,
      gender: teacher.gender,
      email: teacher.email,
      region: teacher.region,
      flag: teacher.flag,
      authorizedSince: teacher.authorizedSince,
      totalCourses: teacher.totalCourses,
      centersServed: teacher.centersServed,
      coursesThisYear: teacher.coursesThisYear,
      authorizations: teacher.authorizations,
      languages: teacher.languages,
      preferredRegions: teacher.preferredRegions,
      availableMonths: teacher.availableMonths,
      festivalMonths: teacher.festivalMonths,
      personalNote: teacher.personalNote,
      teachingHistory: teacher.teachingHistory,
      isOnboarded: teacher.isOnboarded,
    } as unknown as NonNullable<typeof profile>;
  }, [profile, teacher]);

  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [centerFilter, setCenterFilter] = useState<string>('All');

  const enriched = useMemo(
    () => (matchProfile ? enrichCoursesWithMatch(courses, matchProfile) : courses),
    [courses, matchProfile],
  );

  const travelOrigin = useMemo(
    () => ({
      homeLat: matchProfile?.homeLat ?? teacher?.homeLat ?? null,
      homeLng: matchProfile?.homeLng ?? teacher?.homeLng ?? null,
      preferredRegions: matchProfile?.preferredRegions ?? teacher?.preferredRegions ?? [],
    }),
    [matchProfile, teacher],
  );

  const withTravel = useMemo<CardCourse[]>(
    () =>
      enriched.map((c) => ({
        ...c,
        travel: travelFor(travelOrigin, c.center),
      })),
    [enriched, travelOrigin],
  );

  const centerList = useMemo(
    () => Array.from(new Set(enriched.map((c) => c.center))).sort(),
    [enriched],
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return withTravel
      .filter((c) => {
        if (typeFilter !== 'All' && !c.type.includes(typeFilter)) return false;
        if (centerFilter !== 'All' && c.center !== centerFilter) return false;
        if (ql) {
          const inCenter = c.center.toLowerCase().includes(ql);
          const inCity = (c.city ?? '').toLowerCase().includes(ql);
          const inType = c.type.toLowerCase().includes(ql);
          if (!inCenter && !inCity && !inType) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const m = (b.match ?? 0) - (a.match ?? 0);
        if (m !== 0) return m;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [withTravel, q, typeFilter, centerFilter]);

  const subtitle = teacher
    ? `${teacher.region ?? 'Nepal'} ${teacher.flag ?? '🇳🇵'}`
    : t('courses.subtitle_fallback');

  const clearAllFilters = () => {
    setQ('');
    setTypeFilter('All');
    setCenterFilter('All');
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={s.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={s.stickyHeader}>
          {/* Header */}
          <View style={[s.headerWrap, { paddingTop: Math.max(56, insets.top + 14) }]}>
            <Text style={s.title}>{t('courses.title')}</Text>
            <Text style={s.subtitle}>{subtitle}</Text>
            <Text style={s.caption}>
              {filtered.length} {t('courses.seeking')}
            </Text>
          </View>

          {/* Search bar */}
          <View style={s.filtersWrap}>
            <View style={s.sbar}>
              <SearchIcon />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={t('courses.search')}
                placeholderTextColor={Colors.tx3}
                style={s.sbarInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {q ? (
                <TouchableOpacity
                  onPress={() => setQ('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.sbarClear}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Type filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.frow}
            >
              {TYPE_FILTERS.map((f) => {
                const on = typeFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setTypeFilter(f)}
                    activeOpacity={0.75}
                    style={[s.fchip, on && s.fchipOn]}
                  >
                    <Text style={[s.fchipText, on && s.fchipTextOn]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Centre filters */}
            <View style={s.centerFilterRow}>
              <Text style={s.locationGlyph}>📍</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.frowSm}
              >
                <TouchableOpacity
                  onPress={() => setCenterFilter('All')}
                  activeOpacity={0.75}
                  style={[s.fchipSm, centerFilter === 'All' && s.fchipOn]}
                >
                  <Text style={[s.fchipSmText, centerFilter === 'All' && s.fchipTextOn]}>
                    {t('courses.all_types')}
                  </Text>
                </TouchableOpacity>
                {centerList.map((c) => {
                  const on = centerFilter === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCenterFilter(c)}
                      activeOpacity={0.75}
                      style={[s.fchipSm, on && s.fchipOn]}
                    >
                      <Text style={[s.fchipSmText, on && s.fchipTextOn]}>{shortCenterName(c)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Card list */}
        <View style={s.dividerStrip} />
        {filtered.length === 0 ? (
          <View style={[s.card, s.emptyCard]}>
            <Text style={s.emptyText}>{t('courses.no_results')}</Text>
            <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
              <Text style={s.clearFiltersLink}>{t('courses.clear_filters')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onPress={() => router.push(routeTo.teacherCourseDetail(c.id))}
              applyLabel={t('courses.view_and_apply')}
              needLabel={t('courses.need_at', { count: c.needCount ?? 1 })}
              matchLabel={t('courses.match_label')}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={Colors.tx3} strokeWidth={2} />
      <Path d="M21 21L16.65 16.65" stroke={Colors.tx3} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

type CardCourse = Course & {
  travel: ReturnType<typeof travelFor> | null;
};

function CourseCard({
  course,
  onPress,
  applyLabel,
  needLabel,
  matchLabel,
}: {
  course: CardCourse;
  onPress: () => void;
  applyLabel: string;
  needLabel: string;
  matchLabel: string;
}) {
  const emoji = TYPE_EMOJI[course.type] ?? '🪷';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={s.card}>
        <View style={s.cardTopRow}>
          <View style={{ flex: 1, paddingRight: 9 }}>
            <View style={s.typeChipRow}>
              <Text style={s.typeEmoji}>{emoji}</Text>
              <View style={[s.chip, s.chipSf]}>
                <Text style={s.chipSfText}>{course.type}</Text>
              </View>
            </View>
            <Text style={s.cardCenter}>{course.center}</Text>
            {course.city ? <Text style={s.cardCity}>{course.city}</Text> : null}
            {course.travel ? (
              <Text style={s.cardMeta}>
                📍 {course.travel.distanceKm} km · {course.travel.travelLabel} ·{' '}
                {course.travel.altitude} m
              </Text>
            ) : null}
          </View>
          <View style={s.cardRight}>
            <MatchBadge score={course.match ?? 0} label={matchLabel} />
            <Text style={s.needLabel}>{needLabel}</Text>
          </View>
        </View>

        <View style={s.chipRow}>
          <View style={[s.chip, s.chipGy]}>
            <Text style={s.chipGyText}>📅 {course.dates}</Text>
          </View>
          {(course.languages ?? []).map((lang) => (
            <View key={lang} style={[s.chip, s.chipBl]}>
              <Text style={s.chipBlText}>{langLabel(lang)}</Text>
            </View>
          ))}
        </View>

        <Meter score={course.match ?? 0} />

        <View style={s.applyRow}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onPress();
            }}
            activeOpacity={0.85}
            style={s.applyBtnWrap}
          >
            <LinearGradient
              colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.applyBtn}
            >
              <Text style={s.applyBtnText}>{applyLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles — inline literal sizes from prototype ────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  stickyHeader: {
    backgroundColor: Colors.white,
  },

  // Header
  headerWrap: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  caption: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },

  // Filters
  filtersWrap: {
    backgroundColor: Colors.white,
    paddingBottom: 10,
  },
  sbar: {
    marginHorizontal: 18,
    marginBottom: 13,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sbarInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
    padding: 0,
  },
  sbarClear: {
    fontSize: 16,
    color: Colors.tx3,
    lineHeight: 16,
  },
  frow: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 7,
  },
  frowSm: {
    paddingLeft: 6,
    paddingRight: 18,
    paddingBottom: 4,
    gap: 7,
  },
  fchip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  fchipOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  fchipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx2,
  },
  fchipTextOn: {
    color: Colors.white,
  },
  fchipSm: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  fchipSmText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx2,
  },
  centerFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
  },
  locationGlyph: {
    fontSize: 13,
    color: Colors.tx3,
    paddingLeft: 18,
  },

  // Divider between filter zone and cards
  dividerStrip: {
    height: 8,
    backgroundColor: Colors.cr,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  typeEmoji: { fontSize: 16 },
  cardCenter: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
    marginTop: 3,
  },
  cardCity: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
  },
  cardMeta: {
    fontSize: 10.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  needLabel: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 3,
  },

  // Chips (shared shape with home)
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chipSf: { backgroundColor: Colors.sfl },
  chipSfText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sfd,
  },
  chipGy: { backgroundColor: Colors.cr2 },
  chipGyText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx2,
  },
  chipBl: { backgroundColor: Colors.bll },
  chipBlText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.bl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 7,
  },

  // Apply CTA
  applyRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 9,
  },
  applyBtnWrap: {},
  applyBtn: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Empty state
  emptyCard: {
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 14,
  },
  emptyText: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    fontStyle: 'italic',
  },
  clearFiltersLink: {
    fontSize: 13,
    fontFamily: FontFamily.sansBold,
    color: Colors.sf,
    fontWeight: '700',
  },
});
