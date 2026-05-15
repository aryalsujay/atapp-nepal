/**
 * Teacher Course Detail (View & Apply) — implements `specs/06-teacher-course-detail.md`.
 *
 * Prototype-faithful port of `app.html:1071–1153`. Forest-green hero with
 * type kicker / centre / city / travel line / match badge + AT-needed pill,
 * info table (5 rows), AT Pair card (admin-managed badge + co-teacher +
 * looking-for chip), eligibility checklist (5 rows), apply CTA / submitted
 * state.
 *
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 * Per-text fontFamily ties weights to the registered Plus Jakarta Sans
 * variants so 700/800 don't fall back to synthetic-bold.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useProfileStore } from '@/store/profileStore';
import type { TeacherProfile, Course } from '@/types';
import { useTeachersStore } from '@/store/teachersStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { MatchBadge } from '@/components/ui/MatchPill';
import { DashedDivider } from '@/components/ui/DashedDivider';
import { langLabel } from '@/utils/eligibility';
import { enrichCoursesWithMatch } from '@/utils/matching';
import { travelFor } from '@/utils/travel';
import { resolveOpenSlots } from '@/types/course';

export default function TeacherCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = userId ? findTeacher(userId) : undefined;

  const courses = useCoursesStore((s) => s.courses) as Course[];
  const loadCourses = useCoursesStore((s) => s.loadCourses);
  const { profile, loadProfile } = useProfileStore();
  const { applications, loadApplications, submitApplication } = useApplicationsStore();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (courses.length === 0) loadCourses();
    if (userId) {
      loadProfile(userId);
      loadApplications(userId);
    }
  }, [userId, courses.length, loadCourses, loadProfile, loadApplications]);

  // Profile fallback — hydrate match scores from teachersStore before the
  // profileStore async load completes.
  const matchProfile = useMemo(() => {
    if (profile) return profile;
    if (!teacher) return null;
    return {
      ...teacher,
      gender: teacher.gender,
      email: teacher.email,
      flag: teacher.flag,
      authorizedSince: teacher.authorizedSince,
    } as unknown as NonNullable<typeof profile>;
  }, [profile, teacher]);

  const enrichedCourse = useMemo(() => {
    const numericId = Number(id);
    const raw = courses.find((c) => c.id === numericId);
    if (!raw) return undefined;
    if (!matchProfile) return raw;
    return enrichCoursesWithMatch([raw], matchProfile)[0];
  }, [id, courses, matchProfile]);

  const travel = useMemo(() => {
    if (!enrichedCourse) return null;
    const origin = {
      homeLat: matchProfile?.homeLat ?? teacher?.homeLat ?? null,
      homeLng: matchProfile?.homeLng ?? teacher?.homeLng ?? null,
      preferredRegions: matchProfile?.preferredRegions ?? teacher?.preferredRegions ?? [],
    };
    return travelFor(origin, enrichedCourse.center);
  }, [enrichedCourse, matchProfile, teacher]);

  if (!enrichedCourse) {
    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }
  const course = enrichedCourse;

  const existingApp = applications.find((a) => a.courseId === course.id);
  const isApplied = !!existingApp;
  const isAssigned = existingApp?.status === 'approved';
  const showSubmitted = submitted || (isApplied && !isAssigned);

  const matchScore = course.match ?? 0;
  const needCount = course.needCount ?? 1;
  const co = course.coTeacher;
  // Per-slot gender breakdown (preferred). Falls back to deriving from
  // legacy `genderRequired` + remaining `needCount`. Filter out 'Any' —
  // we only render a chip when the centre actually specifies a gender.
  const lookingForSlots = resolveOpenSlots(course).filter(
    (g): g is 'M' | 'F' => g === 'M' || g === 'F',
  );

  const eligibility = matchProfile ? buildPrototypeChecks(course, matchProfile, t) : [];

  const onApply = async () => {
    if (!userId || submitting || isApplied) return;
    setSubmitting(true);
    try {
      await submitApplication(course.id, userId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace(Routes.teacherCourses));

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#2A4A30', Colors.fo] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 14) }]}
        >
          <LotusHero color="white" opacity={0.08} size={210} right={-30} bottom={-30} />
          <MountainSilhouette color="rgba(255,255,255,0.07)" />

          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.heroBackRow}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.heroBackText}>{t('courseDetail.back')}</Text>
          </TouchableOpacity>

          <Text style={s.heroKicker}>{course.type}</Text>
          <Text style={s.heroTitle}>{course.center}</Text>
          <Text style={s.heroCity}>
            {course.city}
            {course.flag ? ` ${course.flag}` : ''}
          </Text>
          {travel ? (
            <Text style={s.heroTravel}>
              📍 {travel.distanceKm} {t('courseDetail.km')} · {travel.travelLabel} ·{' '}
              {travel.altitude} {t('courseDetail.m_alt')}
            </Text>
          ) : null}

          <View style={s.heroPillRow}>
            <MatchBadge score={matchScore} label={t('courseDetail.match_label')} />
            <View style={s.heroNeedPill}>
              <Text style={s.heroNeedText}>
                {t('courseDetail.at_needed', { count: needCount })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info table */}
        <View style={[s.card, s.infoCard]}>
          <InfoRow label={`📅 ${t('courseDetail.field_dates')}`} value={course.dates} />
          <InfoRow
            label={`🗣 ${t('courseDetail.field_languages')}`}
            value={course.languages.map(langLabel).join(', ')}
          />
          <InfoRow
            label={`👤 ${t('courseDetail.field_gender')}`}
            value={genderText(course.genderRequired, t)}
          />
          <InfoRow
            label={`📍 ${t('courseDetail.field_location')}`}
            value={`${course.city}${course.flag ? ` ${course.flag}` : ''}`}
          />
          <InfoRow label={`🎓 ${t('courseDetail.field_type')}`} value={course.type} isLast />
        </View>

        {/* AT Pair */}
        <View style={s.sphRow}>
          <Text style={s.sphTitle}>🧘 {t('courseDetail.at_pair')}</Text>
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>🛠 {t('courseDetail.admin_managed')}</Text>
          </View>
        </View>
        <View style={[s.card, s.atPairCard]}>
          {co ? (
            <View style={s.coRow}>
              <View
                style={[
                  s.coAvatar,
                  co.gender === 'F'
                    ? { backgroundColor: '#FBE8F0', borderColor: '#F0C8D8' }
                    : { backgroundColor: Colors.fol, borderColor: Colors.fom },
                ]}
              >
                <Text style={s.coAvatarEmoji}>{co.gender === 'F' ? '🙏🏻' : '🧘'}</Text>
              </View>
              <View style={s.coInfo}>
                <View style={s.coNameRow}>
                  <Text style={s.coName}>{co.name}</Text>
                  <View style={s.confirmedChip}>
                    <Text style={s.confirmedChipText}>{t('courseDetail.confirmed')}</Text>
                  </View>
                </View>
                <Text style={s.coSub}>
                  {co.gender === 'F' ? t('courseDetail.female_at') : t('courseDetail.male_at')} ·{' '}
                  {co.languages.map(langLabel).join(', ')}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={s.coEmptyText}>{t('courseDetail.no_co_teacher')}</Text>
          )}

          {lookingForSlots.length > 0 ? (
            <>
              <DashedDivider />
              <View style={s.lookingForRow}>
                <Text style={s.lookingForLabel}>{t('courseDetail.looking_for')}</Text>
                <View style={s.lookingForChipGroup}>
                  {lookingForSlots.map((g, i) => (
                    <View key={`${g}-${i}`} style={s.lookingForChip}>
                      <Text style={s.lookingForChipText}>
                        {g === 'F' ? t('courseDetail.female_at') : t('courseDetail.male_at')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Eligibility */}
        <Text style={s.sphTitleStandalone}>{t('courseDetail.eligibility')}</Text>
        <View style={[s.card, s.eligibilityCard]}>
          {eligibility.map((c, i) => (
            <View key={c.key} style={[s.chkRow, i === eligibility.length - 1 && s.chkRowLast]}>
              <View style={[s.chkIc, c.passed ? s.chkIcOk : s.chkIcFail]}>
                {c.passed ? <CheckIcon /> : <XIcon />}
              </View>
              <View style={s.chkBody}>
                <Text style={s.chkLabel}>{c.label}</Text>
                {c.sublabel ? <Text style={s.chkSublabel}>{c.sublabel}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Apply / Submitted */}
        <View style={s.applySection}>
          {isAssigned ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(routeTo.teacherApplicationBrief(existingApp?.id ?? ''))}
              style={s.viewBriefBtn}
            >
              <Text style={s.viewBriefText}>{t('courseDetail.view_brief')}</Text>
            </TouchableOpacity>
          ) : showSubmitted ? (
            <View style={s.submittedBox}>
              <Text style={s.submittedEmoji}>✅</Text>
              <Text style={s.submittedTitle}>{t('courseDetail.submitted_title')}</Text>
              <Text style={s.submittedMsg}>{t('courseDetail.submitted_message')}</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={onApply}
                activeOpacity={0.85}
                disabled={submitting}
                style={s.applyBtnWrap}
              >
                <LinearGradient
                  colors={[Colors.sf, Colors.sfd] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.applyBtn}
                >
                  <Text style={s.applyBtnText}>
                    {submitting ? t('courseDetail.submitting') : t('courseDetail.apply_button')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={s.shareNote}>{t('courseDetail.share_note')}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[s.infoRow, isLast && s.infoRowLast]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12L10 17L20 7"
        stroke={Colors.fo}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={Colors.ur}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genderText(g: Course['genderRequired'], t: (k: string) => string): string {
  if (g === 'M') return t('courseDetail.gender_male');
  if (g === 'F') return t('courseDetail.gender_female');
  return t('courseDetail.gender_any');
}

type Profile = TeacherProfile;

type Check = {
  key: 'language' | 'location' | 'restGap' | 'authorization' | 'availability';
  label: string;
  sublabel: string;
  passed: boolean;
};

function buildPrototypeChecks(
  course: Course,
  profile: Profile,
  t: (k: string, opts?: Record<string, unknown>) => string,
): Check[] {
  // Language: pass if any course language is primary for teacher
  const teacherLangs = Object.keys(profile.languages).filter(
    (l) => profile.languages[l] === 'primary' || profile.languages[l] === 'secondary',
  );
  const langPass = course.languages.some((lc) => {
    const label = langLabel(lc);
    const lvl = profile.languages[label] ?? profile.languages[lc];
    return lvl === 'primary';
  });

  // Location: pass if course city/region matches one of teacher's preferredRegions
  const cityLower = (course.city ?? '').toLowerCase();
  const locationPass = (profile.preferredRegions ?? []).some((r: string) => {
    const first = r.split(' ')[0].toLowerCase();
    return cityLower.includes(first) || r.toLowerCase().includes(cityLower);
  });

  // Rest gap: pass if last teachingHistory entry is older than 21 days
  const lastEntry = (profile.teachingHistory ?? [])[0];
  const lastTaught = lastEntry?.date ?? '';
  const restPass = (() => {
    if (!lastTaught) return true;
    const parsed = new Date(`${lastTaught} 01`).getTime();
    if (Number.isNaN(parsed)) return true;
    return Date.now() - parsed > 21 * 24 * 60 * 60 * 1000;
  })();

  // Authorization
  const authPass = (profile.authorizations ?? []).includes(course.type);

  // Availability: pass if course start month is in availableMonths or not in festivalMonths
  const startMonth = new Date(course.startDate).getMonth();
  const inAvailable = (profile.availableMonths ?? []).includes(startMonth);
  const inFestival = (profile.festivalMonths ?? []).includes(startMonth);
  const availPass = inAvailable && !inFestival;

  return [
    {
      key: 'language',
      label: t('courseDetail.check_language'),
      sublabel: t('courseDetail.check_language_sub', {
        course: course.languages.map(langLabel).join('/'),
        yours: teacherLangs.join(', '),
      }),
      passed: langPass,
    },
    {
      key: 'location',
      label: t('courseDetail.check_location'),
      sublabel: locationPass
        ? t('courseDetail.check_location_sub_pass', {
            city: `${course.city}${course.flag ? ` ${course.flag}` : ''}`,
          })
        : t('courseDetail.check_location_sub_fail', {
            city: `${course.city}${course.flag ? ` ${course.flag}` : ''}`,
          }),
      passed: locationPass,
    },
    {
      key: 'restGap',
      label: t('courseDetail.check_restGap'),
      sublabel: lastTaught
        ? t('courseDetail.check_restGap_sub', { lastTaught })
        : t('courseDetail.check_restGap_sub_none'),
      passed: restPass,
    },
    {
      key: 'authorization',
      label: t('courseDetail.check_authorization'),
      sublabel: t('courseDetail.check_authorization_sub', { type: course.type }),
      passed: authPass,
    },
    {
      key: 'availability',
      label: t('courseDetail.check_availability'),
      sublabel: t('courseDetail.check_availability_sub', { dates: course.dates }),
      passed: availPass,
    },
  ];
}

// ─── Styles (inline literal sizes from prototype) ────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 13,
    marginLeft: -2,
    position: 'relative',
  },
  heroBackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '500',
  },
  heroKicker: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
    position: 'relative',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 26,
    position: 'relative',
  },
  heroCity: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
    position: 'relative',
  },
  heroTravel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.62)',
    fontFamily: FontFamily.sansRegular,
    marginTop: 3,
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    marginTop: 13,
    alignItems: 'center',
    position: 'relative',
  },
  heroNeedPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  heroNeedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Card (shared)
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    ...Shadows.card,
  },
  infoCard: {
    marginTop: 14,
  },

  // Info table
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    gap: 12,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.tx2,
    fontWeight: '500',
    fontFamily: FontFamily.sansMedium,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx,
    textAlign: 'right',
    flex: 1,
    maxWidth: '60%',
  },

  // Section header
  sphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
  sphTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
  },
  sphTitleStandalone: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
  adminBadge: {
    backgroundColor: Colors.cr2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx3,
  },

  // AT Pair card
  atPairCard: {},
  coRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  coAvatarEmoji: {
    fontSize: 22,
  },
  coInfo: {
    flex: 1,
  },
  coNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  coName: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  confirmedChip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  confirmedChipText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.fo,
  },
  coSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
  },
  coEmptyText: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    fontStyle: 'italic',
  },
  lookingForRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lookingForLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  lookingForChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  lookingForChip: {
    backgroundColor: Colors.sfl,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  lookingForChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sfd,
  },

  // Eligibility
  eligibilityCard: {},
  chkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  chkRowLast: {
    borderBottomWidth: 0,
  },
  chkIc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  chkIcOk: {
    backgroundColor: Colors.fol,
  },
  chkIcFail: {
    backgroundColor: Colors.url,
  },
  chkBody: {
    flex: 1,
  },
  chkLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  chkSublabel: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
    lineHeight: 16,
  },

  // Apply
  applySection: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  applyBtnWrap: {},
  applyBtn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  shareNote: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
    textAlign: 'center',
  },
  submittedBox: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submittedEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  submittedTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
  },
  submittedMsg: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 4,
    textAlign: 'center',
  },
  viewBriefBtn: {
    backgroundColor: Colors.fo,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBriefText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
