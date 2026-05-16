/**
 * Teacher Course Brief — implements `specs/07-teacher-course-brief.md`.
 *
 * Prototype-faithful port of `app.html:1225–1382`. Forest-green hero,
 * source-aware status pills (applied vs admin-assigned), arrival card,
 * co-teacher with gendered avatar, coordinator, students gender-split bar,
 * 3-tile travel stats + transport prose, 7-item what-to-bring checklist,
 * conditional notes-from-center, source-aware step-down CTA backed by
 * `useConfirm` + `applicationsStore.requestWithdrawal`.
 *
 * Refactor: sections live in `src/components/teacher/brief/`. This screen
 * is now the orchestration layer — fetching data, deriving flags, wiring
 * callbacks — and is composed from per-section sub-components.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors } from '@/theme/colors';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  ArrivalCard,
  BriefHero,
  CoTeacherCard,
  CoordinatorCard,
  NotesCard,
  SectionHeader,
  StepDownAction,
  StudentsCard,
  TravelCard,
  WhatToBringCard,
  type ChecklistItem,
} from '@/components/teacher/brief';
import type { Course } from '@/types';

export default function CourseBriefScreen() {
  const { id, back } = useLocalSearchParams<{ id: string; back?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const toast = useToast();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const applications = useApplicationsStore((s) => s.applications);
  const loadApplications = useApplicationsStore((s) => s.loadApplications);
  const requestWithdrawal = useApplicationsStore((s) => s.requestWithdrawal);
  const courses = useCoursesStore((s) => s.courses) as Course[];
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = userId ? findTeacher(userId) : undefined;
  // Origin city for the Travel header — extract the city portion of the
  // teacher's home region (e.g. "Kathmandu Valley" → "Kathmandu").
  const homeCity =
    (teacher?.preferredRegions?.[0] ?? teacher?.region ?? '').split(' ')[0] || 'home';

  useEffect(() => {
    if (userId) loadApplications(userId);
  }, [userId, loadApplications]);

  const courseId = Number(id);
  const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const application = useMemo(
    () => applications.find((a) => a.courseId === courseId && a.teacherId === userId),
    [applications, courseId, userId],
  );

  const [localSent, setLocalSent] = useState(false);
  const sent = localSent || application?.status === 'withdrawal_requested';

  const goBack = () => {
    if (back === 'applications') {
      router.replace(Routes.teacherApplications);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(Routes.teacherHome);
    }
  };

  if (!course) {
    return (
      <View style={[s.flex, s.notFoundWrap]}>
        <Text style={s.notFoundText}>{t('brief.course_not_found')}</Text>
        <TouchableOpacity
          onPress={() => router.replace(Routes.teacherHome)}
          style={s.outlineBtn}
          activeOpacity={0.7}
        >
          <Text style={s.outlineBtnText}>← {t('brief.back_to_home')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAssigned = application?.source === 'assigned';

  const handleCall = async (phone: string) => {
    const url = `tel:${phone.replace(/[\s•]/g, '')}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch {
      // Silent — Linking failures are not user-facing here.
    }
  };

  const handleStepDown = () => {
    if (!application) return;
    confirm({
      title: t('brief.step_down_dialog_title'),
      message: t('brief.step_down_dialog_body'),
      confirmText: t('brief.step_down_applied_cta'),
      destructive: true,
      onConfirm: async () => {
        await requestWithdrawal(application.id, userId);
        setLocalSent(true);
        toast.success(t('brief.step_down_sent'));
      },
    });
  };

  // Checklist comes from i18n as an array of { icon, text } objects.
  const checklist = (t('brief.checklist', { returnObjects: true }) ?? []) as ChecklistItem[];

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <BriefHero
          course={course}
          isAssigned={isAssigned}
          hasApplication={!!application}
          insetsTop={insets.top}
          onBack={goBack}
          labels={{
            back: t('brief.back'),
            title: t('brief.title'),
            confirmed: t('brief.confirmed'),
            assignedByAdmin: t('brief.assigned_by_admin'),
            youApplied: t('brief.you_applied'),
          }}
        />

        <SectionHeader>🛬 {t('brief.arrival_label')}</SectionHeader>
        <ArrivalCard
          arrivalDate={course.arrivalDate}
          arrivalTime={course.arrivalTime}
          labels={{
            arriveBy: t('brief.arrive_by'),
            context: t('brief.arrival_context'),
          }}
        />

        <SectionHeader>🧘 {t('brief.co_teacher_label')}</SectionHeader>
        <CoTeacherCard
          coTeacher={course.coTeacher}
          onCall={handleCall}
          labels={{
            confirmed: t('brief.co_teacher_confirmed'),
            call: t('brief.call'),
            femaleAt: t('brief.female_at'),
            maleAt: t('brief.male_at'),
            noCoTeacher: t('brief.no_co_teacher'),
          }}
        />

        <SectionHeader>👤 {t('brief.coordinator_label')}</SectionHeader>
        <CoordinatorCard
          coordinator={course.coordinator}
          onCall={handleCall}
          callLabel={t('brief.call')}
        />

        <SectionHeader>👥 {t('brief.students_expected')}</SectionHeader>
        <StudentsCard
          students={course.students}
          labels={{
            word: t('brief.students_word'),
            splitLabel: t('brief.students_split'),
          }}
        />

        <SectionHeader>
          🚌 {t('brief.travel')} {t('brief.travel_from', { city: homeCity })}
        </SectionHeader>
        <TravelCard
          distanceKm={course.distanceKm}
          travelHrs={course.travelHrs}
          altitude={course.altitude}
          transport={course.transport}
          labels={{
            distance: t('brief.distance'),
            hrsShort: t('brief.hrs_short'),
            altitude: t('brief.altitude'),
            kmShort: t('brief.km_short'),
            mAlt: t('brief.m_alt'),
            transportLabel: t('brief.transport_label'),
          }}
        />

        <SectionHeader>🎒 {t('brief.what_to_bring_at')}</SectionHeader>
        <WhatToBringCard items={checklist} />

        {course.notes ? (
          <>
            <SectionHeader>💬 {t('brief.notes_from_center')}</SectionHeader>
            <NotesCard notes={course.notes} />
          </>
        ) : null}

        {application ? (
          <StepDownAction
            sent={!!sent}
            onPress={handleStepDown}
            labels={{
              cta: t('brief.step_down_applied_cta'),
              sent: t('brief.step_down_sent'),
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  notFoundWrap: {
    backgroundColor: Colors.cr,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  notFoundText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.tx2,
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
  },
});
