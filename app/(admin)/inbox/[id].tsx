import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { HeroSection } from '@/components/layout/HeroSection';
import { ChecklistItem } from '@/components/ui/ChecklistItem';
import { MatchBadge, Chip } from '@/components/ui/Badge';
import { AvailabilityCalendar } from '@/components/ui/AvailabilityCalendar';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { courses as coursesData, teachers as teachersData } from '@/data';
import { calculateMatch } from '@/utils/matching';
import { buildEligibilityChecks } from '@/utils/eligibility';
import { toAvailabilityArray } from '@/utils/availability';
import type { TeacherProfile } from '@/types';

export default function AdminReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null);

  const { applications, loadAllApplications, updateStatus, getApprovedCountForCourse } =
    useApplicationsStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    if (applications.length === 0) loadAllApplications();
  }, []);

  const app = applications.find((a) => a.id === Number(id));
  const teacher = app ? teachersData.find((t) => t.id === app.teacherId) : null;
  const course = app ? coursesData.find((c) => c.id === app.courseId) : null;

  if (!app || !teacher || !course) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.cr,
        }}
      >
        <Text style={{ color: Colors.tx3 }}>Application not found</Text>
      </View>
    );
  }

  const matchResult = calculateMatch(teacher as unknown as TeacherProfile, course);
  const activeLangs = Object.entries(teacher.languages as Record<string, string>).filter(
    ([, v]) => v !== 'off',
  );

  const checks = buildEligibilityChecks(teacher, course, {
    authorization: t('courseDetail.checkItems.authorization'),
    language: t('courseDetail.checkItems.language'),
    availability: t('courseDetail.checkItems.availability'),
    restGap: t('courseDetail.checkItems.restGap'),
    gender: t('courseDetail.checkItems.gender'),
  });

  const handleDecision = async (action: 'approved' | 'rejected') => {
    if (action === 'rejected' && !rejectReason.trim()) {
      toast.error(t('system.reasonRequiredBody'), t('system.reasonRequired'));
      return;
    }

    if (action === 'approved') {
      const approvedCount = await getApprovedCountForCourse(app.courseId);
      const needCount = course.needCount ?? 1;
      if (approvedCount >= needCount) {
        const proceed = await new Promise<boolean>((resolve) => {
          confirm({
            title: 'Course Already Filled',
            message: `This course already has ${approvedCount} approved teacher(s) and only needs ${needCount}. Approve anyway?`,
            confirmText: 'Approve Anyway',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!proceed) return;
      }
    }

    await updateStatus(app.id, action, action === 'rejected' ? rejectReason : undefined);

    await addNotification({
      targetUserId: app.teacherId,
      type: action === 'approved' ? 'assignment' : 'rejection',
      center: course.center,
      course: `${course.center} — ${course.type}`,
      courseId: course.id,
      subjectEn:
        action === 'approved'
          ? 'You have been assigned to teach'
          : 'Application update — ' + course.center,
      bodyEn:
        action === 'approved'
          ? `Dear ${teacher.name},\n\nYour application for the ${course.type} course at ${course.center} has been approved.\n\nDates: ${course.dates}\n\n${adminNote ? 'Note from admin: ' + adminNote + '\n\n' : ''}Sadhu! 🙏`
          : `Dear ${teacher.name},\n\nThank you for applying to the ${course.type} course at ${course.center}. Unfortunately your application was not selected.\n\nReason: ${rejectReason}\n\nWe hope to have you join us soon.\n\nIn Dhamma,\nScheduling Team`,
      bodyNe:
        action === 'approved'
          ? `प्रिय ${teacher.name},\n\nतपाईंको आवेदन स्वीकृत भएको छ।`
          : `प्रिय ${teacher.name},\n\nआवेदनका लागि धन्यवाद। दुर्भाग्यवश तपाईंको आवेदन छनोट भएन।`,
    });

    setDecided(action);
  };

  if (decided) {
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
        <Text style={{ fontSize: 52, marginBottom: 16 }}>
          {decided === 'approved' ? '✅' : '❌'}
        </Text>
        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: Colors.tx,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Application {decided === 'approved' ? 'Approved' : 'Rejected'}
        </Text>
        <Text
          style={{
            fontSize: FontSize.smPlus,
            color: Colors.tx3,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {teacher.name} has been notified.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: Colors.bl,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: Radius.lg,
          }}
        >
          <Text style={{ color: Colors.white, fontWeight: FontWeight.bold }}>Back to Inbox</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroSection
          title={teacher.name}
          subtitle={`Applied · ${app.appliedDate}`}
          gradient="adminReview"
          onBack={() => router.back()}
          badge={
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {teacher.gender === 'F' ? '👩 Female AT' : '👨 Male AT'}
              </Text>
            </View>
          }
        >
          <View style={styles.heroStats}>
            <HeroStat label="Courses" value={String(teacher.totalCourses)} />
            <HeroStat label="Centers" value={String(teacher.centersServed)} />
            <HeroStat label="Since" value={String(teacher.authorizedSince)} />
            <MatchBadge score={matchResult.score} style={styles.matchBadge} />
          </View>
        </HeroSection>

        {/* Course being applied for */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applied Course</Text>
          <View style={styles.courseCard}>
            <Text style={styles.courseType}>{course.type}</Text>
            <Text style={styles.courseCenter}>{course.center}</Text>
            <Text style={styles.courseDates}>📅 {course.dates}</Text>
          </View>
        </View>

        {/* Match score breakdown */}
        <View style={styles.section}>
          <View style={styles.matchHeader}>
            <Text style={styles.sectionTitle}>{t('admin.review.matchScore')}</Text>
            <MatchBadge score={matchResult.score} />
          </View>
          {matchResult.reasons.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <Text style={styles.reasonCheck}>✓</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        {/* Eligibility checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.review.eligibility')}</Text>
          {checks.map((check, idx) => (
            <ChecklistItem
              key={idx}
              label={check.label}
              sublabel={check.sublabel}
              passed={check.passed}
            />
          ))}
        </View>

        {/* Teacher languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.chipRow}>
            {activeLangs.map(([lang, level]) => (
              <Chip
                key={lang}
                label={`${lang} · ${level}`}
                variant={level === 'primary' ? 'orange' : 'gray'}
              />
            ))}
          </View>
        </View>

        {/* Teacher authorizations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authorizations</Text>
          <View style={styles.chipRow}>
            {(teacher.authorizations as string[]).map((auth: string) => (
              <Chip key={auth} label={auth} variant="green" />
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <AvailabilityCalendar availability={toAvailabilityArray(teacher)} editable={false} />
        </View>

        {/* Teaching history */}
        {teacher.teachingHistory?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Teaching History</Text>
            {teacher.teachingHistory.map((entry, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {entry.date} · {entry.center}
                </Text>
                <Chip label={entry.type} variant="orange" />
              </View>
            ))}
          </View>
        )}

        {/* Admin notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.review.adminNotes')}</Text>
          <TextInput
            value={adminNote}
            onChangeText={setAdminNote}
            style={styles.noteInput}
            placeholder={t('admin.review.notesPlaceholder')}
            placeholderTextColor={Colors.tx3}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Rejection reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.review.rejectReason')}</Text>
          <TextInput
            value={rejectReason}
            onChangeText={setRejectReason}
            style={styles.noteInput}
            placeholder={t('admin.review.rejectPlaceholder')}
            placeholderTextColor={Colors.tx3}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Decision buttons */}
        <View style={styles.decisionRow}>
          <TouchableOpacity
            onPress={() => handleDecision('rejected')}
            style={[
              styles.decisionBtn,
              { backgroundColor: Colors.url, borderWidth: 1, borderColor: Colors.ur },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.decisionBtnText, { color: Colors.ur }]}>
              ✗ {t('admin.review.rejectConfirm')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDecision('approved')}
            style={[styles.decisionBtn, { backgroundColor: Colors.fo }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.decisionBtnText, { color: Colors.white }]}>
              ✓ {t('admin.review.approveConfirm')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const HeroStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.heroStat}>
    <Text style={styles.heroStatValue}>{value}</Text>
    <Text style={styles.heroStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  heroStat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
  },
  heroStatValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  matchBadge: {},

  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },

  courseCard: {
    backgroundColor: Colors.sfl,
    borderRadius: Radius.md,
    padding: 12,
    gap: 4,
  },
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
    color: Colors.tx2,
  },

  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  reasonCheck: {
    fontSize: FontSize.smPlus,
    color: Colors.fo,
    fontWeight: FontWeight.bold,
  },
  reasonText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  historyDate: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    flex: 1,
  },

  noteInput: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    padding: 12,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    minHeight: 80,
  },

  decisionRow: {
    flexDirection: 'row',
    padding: Layout.horizontalPad,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  decisionBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
