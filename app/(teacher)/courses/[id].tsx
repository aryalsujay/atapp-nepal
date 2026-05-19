/**
 * Teacher Course Detail (View & Apply) — implements `specs/06-teacher-course-detail.md`.
 *
 * Prototype-faithful port of `app.html:1071–1153`. Forest-green hero with
 * type kicker / centre / city / travel line / match badge + AT-needed pill,
 * info table (5 rows), AT Pair card (admin-managed badge + co-teacher +
 * looking-for chip), eligibility checklist (5 rows), apply CTA / submitted
 * state.
 *
 * Phase 3 refactor: section UI extracted to
 * `src/components/teacher/courseDetail/` — hero, info table, AT pair card,
 * eligibility check, and apply CTA each own their own StyleSheet.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useProfileStore } from '@/store/profileStore';
import type { Course } from '@/types';
import { useTeachersStore } from '@/store/teachersStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import { langLabel } from '@/utils/eligibility';
import { enrichCoursesWithMatch } from '@/utils/matching';
import { travelFor } from '@/utils/travel';
import { resolveOpenSlots } from '@/types/course';
import {
  ApplyCta,
  ATPairCard,
  buildPrototypeChecks,
  CourseHero,
  CourseInfoTable,
  EligibilityCheck,
} from '@/components/teacher/courseDetail';

export default function TeacherCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = userId ? findTeacher(userId) : undefined;

  const courses = useCoursesStore((s) => s.courses) as Course[];
  const loadCourses = useCoursesStore((s) => s.loadCourses);
  const { profile, loadProfile } = useProfileStore();
  const applications = useApplicationsStore((s) => s.applications);
  const loadApplications = useApplicationsStore((s) => s.loadApplications);
  const applicationsLoadedForUserId = useApplicationsStore((s) => s.loadedForUserId);
  const submitApplication = useApplicationsStore((s) => s.submitApplication);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (courses.length === 0) loadCourses();
    if (!userId) return;
    loadProfile(userId);
    if (applicationsLoadedForUserId !== userId) loadApplications(userId);
  }, [
    userId,
    courses.length,
    loadCourses,
    loadProfile,
    loadApplications,
    applicationsLoadedForUserId,
  ]);

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
  // Per-slot gender breakdown (preferred). Falls back to deriving from
  // legacy `genderRequired` + remaining `needCount`. Filter out 'Any' —
  // we only render a chip when the centre actually specifies a gender.
  const lookingForSlots = resolveOpenSlots(course).filter(
    (g): g is 'M' | 'F' => g === 'M' || g === 'F',
  );

  const eligibility = matchProfile ? buildPrototypeChecks(course, matchProfile, t) : [];

  const infoRows = [
    { label: `📅 ${t('courseDetail.field_dates')}`, value: course.dates },
    {
      label: `🗣 ${t('courseDetail.field_languages')}`,
      value: course.languages.map(langLabel).join(', '),
    },
    { label: `👤 ${t('courseDetail.field_gender')}`, value: genderText(course.genderRequired, t) },
    {
      label: `📍 ${t('courseDetail.field_location')}`,
      value: `${course.city}${course.flag ? ` ${course.flag}` : ''}`,
    },
    { label: `🎓 ${t('courseDetail.field_type')}`, value: course.type },
  ];

  const onApply = () => {
    if (!userId || submitting || isApplied) return;
    confirm({
      title: t('confirm.apply_course.title'),
      message: t('confirm.apply_course.message', {
        course: `${course.center} — ${course.type}`,
      }),
      confirmText: t('confirm.apply_course.yes'),
      cancelText: t('confirm.apply_course.no'),
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await submitApplication(course.id, userId);
          setSubmitted(true);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace(Routes.teacherCourses));

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <CourseHero
          paddingTop={Math.max(56, insets.top + 14)}
          onBack={goBack}
          backLabel={t('courseDetail.back')}
          type={course.type}
          center={course.center}
          city={course.city}
          flag={course.flag}
          travel={travel}
          kmLabel={t('courseDetail.km')}
          altLabel={t('courseDetail.m_alt')}
          matchScore={matchScore}
          matchLabel={t('courseDetail.match_label')}
          needText={t('courseDetail.at_needed', { count: needCount })}
        />

        <CourseInfoTable rows={infoRows} />

        <ATPairCard
          coTeacher={course.coTeacher}
          lookingForSlots={lookingForSlots}
          labels={{
            sectionTitle: t('courseDetail.at_pair'),
            adminManaged: t('courseDetail.admin_managed'),
            confirmed: t('courseDetail.confirmed'),
            femaleAt: t('courseDetail.female_at'),
            maleAt: t('courseDetail.male_at'),
            lookingFor: t('courseDetail.looking_for'),
            noCoTeacher: t('courseDetail.no_co_teacher'),
          }}
        />

        <EligibilityCheck title={t('courseDetail.eligibility')} checks={eligibility} />

        <ApplyCta
          isAssigned={!!isAssigned}
          showSubmitted={showSubmitted}
          submitting={submitting}
          onApply={onApply}
          onViewBrief={() => router.push(routeTo.teacherApplicationBrief(course.id))}
          labels={{
            viewBrief: t('courseDetail.view_brief'),
            submittedTitle: t('courseDetail.submitted_title'),
            submittedMessage: t('courseDetail.submitted_message'),
            applyButton: t('courseDetail.apply_button'),
            submitting: t('courseDetail.submitting'),
            shareNote: t('courseDetail.share_note'),
          }}
        />
      </ScrollView>
    </View>
  );
}

function genderText(g: Course['genderRequired'], t: (k: string) => string): string {
  if (g === 'M') return t('courseDetail.gender_male');
  if (g === 'F') return t('courseDetail.gender_female');
  return t('courseDetail.gender_any');
}

const s = StyleSheet.create({
  flex: { flex: 1 },
});
