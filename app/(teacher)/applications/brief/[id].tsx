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
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useCoursesStore } from '@/store/coursesStore';
import { Colors, GradientDirection } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { useTeachersStore } from '@/store/teachersStore';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import type { Course } from '@/types';

const DHAMMA_WHEEL = require('../../../../assets/logo-dhamma.gif');

interface ChecklistItem {
  icon: string;
  text: string;
}

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
        {/* ─── Hero ─────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#2A4A30', Colors.fo] as [string, string]}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 16) }]}
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
            <Text style={s.heroBackText}>{t('brief.back')}</Text>
          </TouchableOpacity>

          <Text style={s.heroKicker}>{t('brief.title')}</Text>
          <Text style={s.heroTitle}>{course.center}</Text>
          <Text style={s.heroSub}>
            {course.type} · {course.dates}
          </Text>
          {course.city ? (
            <Text style={s.heroCity}>
              {course.city}
              {course.country === 'NP' ? ' · Nepal' : course.country ? ` · ${course.country}` : ''}
              {course.flag ? ` ${course.flag}` : ''}
            </Text>
          ) : null}

          <View style={s.heroPillRow}>
            <View style={s.pillConfirmed}>
              <Text style={s.pillConfirmedText}>✓ {t('brief.confirmed')}</Text>
            </View>
            {isAssigned ? (
              <View style={s.pillAssigned}>
                <Text style={s.pillAssignedText}>📨 {t('brief.assigned_by_admin')}</Text>
              </View>
            ) : application ? (
              <View style={s.pillApplied}>
                <Text style={s.pillAppliedText}>✋ {t('brief.you_applied')}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ─── Arrival ─────────────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>🛬 {t('brief.arrival_label')}</Text>
        <View style={[s.card, s.arrivalCard]}>
          <Text style={s.arrivalSublabel}>{t('brief.arrive_by')}</Text>
          <Text style={s.arrivalValue}>
            {course.arrivalDate}
            {course.arrivalTime ? ` · ${course.arrivalTime}` : ''}
          </Text>
          <Text style={s.arrivalContext}>{t('brief.arrival_context')}</Text>
        </View>

        {/* ─── Co-Teacher ──────────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>🧘 {t('brief.co_teacher_label')}</Text>
        <View style={s.card}>
          {course.coTeacher ? (
            <CoTeacherRow
              co={course.coTeacher}
              onCall={() => {
                if (course.coTeacher?.phone) handleCall(course.coTeacher.phone);
              }}
              confirmedLabel={t('brief.co_teacher_confirmed')}
              callLabel={t('brief.call')}
              femaleLabel={t('brief.female_at')}
              maleLabel={t('brief.male_at')}
            />
          ) : (
            <Text style={s.emptyText}>{t('brief.no_co_teacher')}</Text>
          )}
        </View>

        {/* ─── Coordinator ─────────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>👤 {t('brief.coordinator_label')}</Text>
        <View style={s.card}>
          <View style={s.coTeacherRow}>
            <View style={s.coordinatorAvatar}>
              <Text style={{ fontSize: 18 }}>📋</Text>
            </View>
            <View style={s.coTeacherMid}>
              <Text style={s.coTeacherName}>{course.coordinator.name}</Text>
              <Text style={s.coTeacherSub}>{course.coordinator.role}</Text>
            </View>
          </View>
          {course.coordinator.phone ? (
            <TouchableOpacity
              onPress={() => handleCall(course.coordinator.phone ?? '')}
              activeOpacity={0.7}
              style={s.phoneRow}
            >
              <Text style={s.phoneText}>📞 {course.coordinator.phone}</Text>
              <Text style={[s.callLink, { color: Colors.sf }]}>{t('brief.call')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ─── Students ────────────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>👥 {t('brief.students_expected')}</Text>
        <View style={s.card}>
          <View style={s.studentsTopRow}>
            <Text style={s.studentsCount}>{course.students.expected}</Text>
            <Text style={s.studentsWord}>{t('brief.students_word')}</Text>
          </View>
          <Text style={s.studentsSplitLabel}>{t('brief.students_split')}</Text>
          <View style={s.splitBar}>
            <View style={[s.splitBarMale, { flex: Math.max(course.students.male, 0.001) }]}>
              <Text style={s.splitBarText}>♂ {course.students.male}</Text>
            </View>
            <View style={[s.splitBarFemale, { flex: Math.max(course.students.female, 0.001) }]}>
              <Text style={s.splitBarText}>♀ {course.students.female}</Text>
            </View>
          </View>
        </View>

        {/* ─── Travel ──────────────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>
          🚌 {t('brief.travel')} {t('brief.travel_from', { city: homeCity })}
        </Text>
        <View style={s.card}>
          <View style={s.travelStatRow}>
            <StatTile
              value={`${course.distanceKm ?? 0} ${t('brief.km_short')}`}
              label={t('brief.distance')}
            />
            <StatTile value={`~${course.travelHrs ?? 0}`} label={t('brief.hrs_short')} />
            <StatTile
              value={`${course.altitude ?? 0} ${t('brief.m_alt')}`}
              label={t('brief.altitude')}
            />
          </View>
          <Text style={s.transportLabel}>{t('brief.transport_label')}</Text>
          <Text style={s.transportProse}>{course.transport}</Text>
        </View>

        {/* ─── What to bring ───────────────────────────────────────────────── */}
        <Text style={s.sectionHeader}>🎒 {t('brief.what_to_bring_at')}</Text>
        <View style={s.card}>
          {checklist.map((item, idx) => (
            <View
              key={idx}
              style={[s.checklistRow, idx < checklist.length - 1 && s.checklistRowBorder]}
            >
              <Text style={s.checklistIcon}>{item.icon}</Text>
              <Text style={s.checklistText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ─── Notes (conditional) ─────────────────────────────────────────── */}
        {course.notes ? (
          <>
            <Text style={s.sectionHeader}>💬 {t('brief.notes_from_center')}</Text>
            <View style={[s.card, s.notesCard]}>
              <Text style={s.notesText}>{`"${course.notes}"`}</Text>
            </View>
          </>
        ) : null}

        {/* ─── Step-down action ────────────────────────────────────────────── */}
        {application ? (
          <View style={s.stepDownWrap}>
            {sent ? (
              <View style={s.sentBadge}>
                <Text style={s.sentBadgeText}>✓ {t('brief.step_down_sent')}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleStepDown} activeOpacity={0.7} style={s.outlineBtn}>
                <Text style={s.outlineBtnText}>{t('brief.step_down_applied_cta')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CoTeacherRow({
  co,
  onCall,
  confirmedLabel,
  callLabel,
  femaleLabel,
  maleLabel,
}: {
  co: NonNullable<Course['coTeacher']>;
  onCall: () => void;
  confirmedLabel: string;
  callLabel: string;
  femaleLabel: string;
  maleLabel: string;
}) {
  const isFemale = co.gender === 'F';
  const genderLabel = isFemale ? femaleLabel : maleLabel;
  return (
    <View>
      <View style={s.coTeacherRow}>
        <View
          style={[s.coTeacherAvatar, isFemale ? s.coTeacherAvatarFemale : s.coTeacherAvatarMale]}
        >
          {isFemale ? (
            <Text style={{ fontSize: 22 }}>🙏🏻</Text>
          ) : (
            <Image source={DHAMMA_WHEEL} style={s.coTeacherDhammaWheel} resizeMode="contain" />
          )}
        </View>
        <View style={s.coTeacherMid}>
          <Text style={s.coTeacherName}>{co.name}</Text>
          <Text style={s.coTeacherSub}>
            {genderLabel}
            {co.languages && co.languages.length > 0 ? ` · ${co.languages.join(', ')}` : ''}
          </Text>
        </View>
        <View style={s.coTeacherConfirmedChip}>
          <Text style={s.coTeacherConfirmedChipText}>{confirmedLabel}</Text>
        </View>
      </View>
      {co.phone ? (
        <TouchableOpacity onPress={onCall} activeOpacity={0.7} style={s.phoneRow}>
          <Text style={s.phoneText}>📞 {co.phone}</Text>
          <Text style={[s.callLink, { color: Colors.fo }]}>{callLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.travelStatTile}>
      <Text style={s.travelStatValue}>{value}</Text>
      <Text style={s.travelStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    marginBottom: 14,
    marginLeft: -2, // pulls the chevron just past the hero edge, like prototype
    position: 'relative',
  },
  heroBackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroKicker: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    position: 'relative',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 25,
    marginTop: 3,
    position: 'relative',
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
    position: 'relative',
  },
  heroCity: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 1,
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    marginTop: 13,
    position: 'relative',
  },
  pillConfirmed: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillConfirmedText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  pillAssigned: {
    backgroundColor: 'rgba(91,111,168,0.55)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillAssignedText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  pillApplied: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillAppliedText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Section header — same as home `.sph`
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },

  // Card chrome — same as home `.card`
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },

  // Arrival
  arrivalCard: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
  },
  arrivalSublabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  arrivalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.fo,
    marginTop: 3,
  },
  arrivalContext: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 4,
    lineHeight: 17,
  },

  // Co-Teacher
  emptyText: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontStyle: 'italic',
  },
  coTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coTeacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
  },
  coTeacherAvatarFemale: {
    backgroundColor: '#FBE8F0',
    borderColor: '#F0C8D8',
  },
  coTeacherAvatarMale: {
    backgroundColor: Colors.fol,
    borderColor: Colors.fom,
  },
  coTeacherDhammaWheel: {
    width: 30,
    height: 30,
  },
  coordinatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coTeacherMid: { flex: 1 },
  coTeacherName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.tx,
  },
  coTeacherSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 1,
  },
  coTeacherConfirmedChip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  coTeacherConfirmedChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.fo,
  },

  // Phone row
  phoneRow: {
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.cr,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneText: {
    fontSize: 12.5,
    color: Colors.tx2,
  },
  callLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Students
  studentsTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
  },
  studentsCount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.tx,
  },
  studentsWord: {
    fontSize: 12,
    color: Colors.tx2,
  },
  studentsSplitLabel: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 6,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  splitBar: {
    flexDirection: 'row',
    gap: 6,
    height: 32,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.cr3,
  },
  splitBarMale: {
    backgroundColor: Colors.bl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBarFemale: {
    backgroundColor: '#C8527A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBarText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Travel
  travelStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  travelStatTile: {
    flex: 1,
    backgroundColor: Colors.cr,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  travelStatValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.tx,
  },
  travelStatLabel: {
    fontSize: 9.5,
    color: Colors.tx3,
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  transportLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    marginBottom: 5,
  },
  transportProse: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 19,
  },

  // Checklist
  checklistRow: {
    flexDirection: 'row',
    gap: 11,
    paddingVertical: 7,
    alignItems: 'flex-start',
  },
  checklistRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    borderStyle: 'dashed',
  },
  checklistIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    flexShrink: 0,
  },
  checklistText: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 18,
    flex: 1,
  },

  // Notes
  notesCard: {
    backgroundColor: Colors.sfl,
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  notesText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 19,
    color: Colors.tx,
  },

  // Step-down
  stepDownWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
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
  assignedInset: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(91,111,168,0.3)',
    backgroundColor: 'rgba(91,111,168,0.07)',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  assignedInsetText: {
    fontSize: 12,
    color: '#5B6FA8',
    lineHeight: 19,
    marginBottom: 12,
  },
  assignedBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(91,111,168,0.5)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B6FA8',
  },
  sentBadge: {
    backgroundColor: Colors.fol,
    borderWidth: 1,
    borderColor: Colors.fom,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sentBadgeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.fo,
  },

  // Course-not-found state
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
});
