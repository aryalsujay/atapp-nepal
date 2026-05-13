import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Gradients } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MatchBadge, Chip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useCoursesStore } from '@/store/coursesStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { teachers as teachersData } from '@/data';
import { calculateMatch } from '@/utils/matching';
import type { Course, TeacherProfile } from '@/types';

type Confidence = 'high' | 'review' | 'none';

interface AssignmentDraft {
  courseId: number;
  teacherId: string | null;
  score: number;
  confidence: Confidence;
}

function buildDrafts(allCourses: Course[]): AssignmentDraft[] {
  const openCourses = allCourses
    .filter((c) => c.status === 'open' || c.status === 'not_yet_open')
    .slice(0, 6);

  return openCourses.map((course) => {
    const matches = teachersData
      .map((t) => ({ teacher: t, result: calculateMatch(t as unknown as TeacherProfile, course) }))
      .sort((a, b) => b.result.score - a.result.score);

    const best = matches[0];
    if (!best || best.result.score < 40) {
      return { courseId: course.id, teacherId: null, score: 0, confidence: 'none' };
    }
    return {
      courseId: course.id,
      teacherId: best.teacher.id,
      score: best.result.score,
      confidence: best.result.score >= 80 ? 'high' : 'review',
    };
  });
}

export default function AdminSchedule() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const courses = useCoursesStore((s) => s.courses) as Course[];
  const { addAssignment } = useApplicationsStore();
  const { addNotification } = useNotificationsStore();
  const [drafts, setDrafts] = useState<AssignmentDraft[]>(() => buildDrafts(courses));
  const [selectedDraft, setSelectedDraft] = useState<AssignmentDraft | null>(null);
  const [finalized, setFinalized] = useState(false);

  const teachers = teachersData;

  const getTeacher = (id: string | null) => (id ? teachers.find((t) => t.id === id) : null);

  const getCourse = (id: number) => courses.find((c) => c.id === id);

  const handleChangeTeacher = (draft: AssignmentDraft, newTeacherId: string) => {
    const teacher = teachers.find((t) => t.id === newTeacherId);
    const course = getCourse(draft.courseId);
    const score =
      teacher && course ? calculateMatch(teacher as unknown as TeacherProfile, course).score : 0;
    setDrafts((prev) =>
      prev.map((d) =>
        d.courseId === draft.courseId
          ? { ...d, teacherId: newTeacherId, score, confidence: score >= 80 ? 'high' : 'review' }
          : d,
      ),
    );
    setSelectedDraft(null);
  };

  const handleFinalize = () => {
    const highConfidence = drafts.filter((d) => d.confidence === 'high' && d.teacherId);
    confirm({
      title: 'Finalize & Notify',
      message: `This will confirm ${highConfidence.length} high-confidence assignment(s) and notify teachers. Continue?`,
      confirmText: 'Finalize',
      onConfirm: async () => {
        for (const draft of highConfidence) {
          const teacher = teachers.find((t) => t.id === draft.teacherId);
          const course = courses.find((c) => c.id === draft.courseId);
          if (!teacher || !course) continue;
          await addAssignment(draft.courseId, draft.teacherId!);
          await addNotification({
            targetUserId: draft.teacherId!,
            type: 'assignment',
            center: course.center,
            course: `${course.center} — ${course.type}`,
            courseId: course.id,
            subjectEn: 'You have been assigned to teach',
            bodyEn: `Dear ${teacher.name},\n\nWith great joy we confirm your assignment to teach the ${course.type} course at ${course.center}.\n\nDates: ${course.dates}\n\nSadhu! 🙏`,
            bodyNe: `प्रिय ${teacher.name},\n\n${course.center}मा ${course.type} पाठ्यक्रम पढाउन तपाईंको नियुक्ति पुष्टि गर्दा हामी हर्षित छौं।`,
          });
        }
        setFinalized(true);
      },
    });
  };

  const confidenceColor: Record<Confidence, string> = {
    high: Colors.fo,
    review: Colors.gd,
    none: Colors.tx3,
  };

  const confidenceLabel: Record<Confidence, string> = {
    high: t('admin.schedule.confidence.high'),
    review: t('admin.schedule.confidence.review'),
    none: t('admin.schedule.confidence.none'),
  };

  if (finalized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.cr,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <Text style={{ fontSize: 52, marginBottom: 16 }}>✅</Text>
        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: Colors.tx,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Assignments Finalized
        </Text>
        <Text
          style={{
            fontSize: FontSize.smPlus,
            color: Colors.tx3,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: FontSize.smPlus * 1.5,
          }}
        >
          {drafts.filter((d) => d.confidence === 'high').length} teachers have been notified of
          their assignments.
        </Text>
        <Button label="Back to Dashboard" variant="primary" onPress={() => setFinalized(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title={t('admin.schedule.title')} style={styles.header} />

      {/* Criteria card */}
      <View style={styles.criteriaCard}>
        <Text style={styles.criteriaTitle}>⚡ {t('admin.schedule.criteria')}</Text>
        <View style={styles.criteriaRow}>
          <CriteriaItem label="Language" value="35pts" />
          <CriteriaItem label="Region" value="25pts" />
          <CriteriaItem label="Availability" value="20pts" />
          <CriteriaItem label="Authorization" value="15pts" />
          <CriteriaItem label="Rest Gap" value="5pts" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {drafts.map((draft) => {
          const course = getCourse(draft.courseId);
          const teacher = getTeacher(draft.teacherId);
          const color = confidenceColor[draft.confidence];

          if (!course) return null;

          return (
            <View key={draft.courseId} style={[styles.draftCard, { borderLeftColor: color }]}>
              {/* Course */}
              <View style={styles.courseRow}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseType}>{course.type}</Text>
                  <Text style={styles.courseCenter}>{course.center}</Text>
                  <Text style={styles.courseDates}>📅 {course.dates}</Text>
                </View>
                <View style={[styles.confidenceBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.confidenceText, { color }]}>
                    {confidenceLabel[draft.confidence]}
                  </Text>
                </View>
              </View>

              {/* Assigned teacher */}
              {teacher ? (
                <View style={styles.teacherRow}>
                  <View style={styles.teacherAvatar}>
                    <Text style={styles.teacherAvatarText}>{teacher.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.teacherMeta}>
                      {teacher.gender === 'F' ? '👩' : '👨'} ·{' '}
                      {Object.entries(teacher.languages as Record<string, string>)
                        .filter(([, v]) => v === 'primary')
                        .map(([k]) => k)
                        .join(', ')}
                    </Text>
                  </View>
                  <MatchBadge score={draft.score} />
                </View>
              ) : (
                <View style={styles.unassigned}>
                  <Text style={styles.unassignedText}>🔍 No suitable AT found</Text>
                </View>
              )}

              {/* Change button */}
              <TouchableOpacity
                onPress={() => setSelectedDraft(draft)}
                style={styles.changeBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.changeBtnText}>{t('admin.schedule.changeTeacher')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Finalize button */}
      <View style={styles.finalizeWrap}>
        <Button
          label={`⚡ ${t('admin.schedule.finalizeAll')}`}
          variant="forest"
          fullWidth
          onPress={handleFinalize}
        />
      </View>

      {/* Change teacher modal */}
      <Modal
        visible={!!selectedDraft}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDraft(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelectedDraft(null)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('admin.schedule.changeTeacher')}</Text>
          <Text style={styles.sheetSub}>
            {selectedDraft
              ? getCourse(selectedDraft.courseId)?.type +
                ' — ' +
                getCourse(selectedDraft.courseId)?.dates
              : ''}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {teachers.map((teacher) => {
              const course = selectedDraft ? getCourse(selectedDraft.courseId) : null;
              const score = course
                ? calculateMatch(teacher as unknown as TeacherProfile, course).score
                : 0;
              return (
                <TouchableOpacity
                  key={teacher.id}
                  onPress={() => selectedDraft && handleChangeTeacher(selectedDraft, teacher.id)}
                  style={styles.teacherOption}
                  activeOpacity={0.8}
                >
                  <View style={styles.teacherAvatar}>
                    <Text style={styles.teacherAvatarText}>{teacher.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.teacherMeta}>{teacher.totalCourses} courses</Text>
                  </View>
                  <MatchBadge score={score} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const CriteriaItem = ({ label, value }: { label: string; value: string }) => (
  <View style={criteriaStyles.item}>
    <Text style={criteriaStyles.value}>{value}</Text>
    <Text style={criteriaStyles.label}>{label}</Text>
  </View>
);
const criteriaStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.bl },
  label: { fontSize: 9, color: Colors.tx3, fontWeight: FontWeight.medium },
});

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  criteriaCard: {
    backgroundColor: Colors.bll,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: Spacing.sm,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.bl + '33',
  },
  criteriaTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },
  criteriaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  list: { paddingBottom: 140, paddingTop: 4 },
  draftCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    ...Shadows.card,
    gap: 10,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseInfo: { flex: 1, gap: 2 },
  courseType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseCenter: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  courseDates: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  confidenceText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cr,
    borderRadius: Radius.md,
    padding: 10,
  },
  teacherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teacherAvatarText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  teacherInfo: { flex: 1, gap: 2 },
  teacherName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  teacherMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  unassigned: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
  },
  unassignedText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
  },
  changeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.bll,
    borderRadius: Radius.full,
  },
  changeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.bl,
  },
  finalizeWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.horizontalPad,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Layout.horizontalPad,
    paddingBottom: 40,
    maxHeight: '60%',
    gap: Spacing.sm,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.bd2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  sheetSub: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    marginBottom: Spacing.sm,
  },
  teacherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
});
