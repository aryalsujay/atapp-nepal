import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../../src/store/authStore';
import { useApplicationsStore } from '../../../../src/store/applicationsStore';
import { useNotificationsStore } from '../../../../src/store/notificationsStore';
import { useTeachersStore } from '../../../../src/store/teachersStore';
import { Colors } from '../../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../../src/theme/spacing';
import { Shadows } from '../../../../src/theme/shadows';
import { HeroSection } from '../../../../src/components/layout/HeroSection';
import { Chip } from '../../../../src/components/ui/Badge';
import { Button } from '../../../../src/components/ui/Button';
import coursesData from '../../../../src/data/courses.json';
import { Course } from '../../../../src/types';

const WHAT_TO_BRING = [
  { key: 'dhamma', emoji: '👘' },
  { key: 'toiletries', emoji: '🧴' },
  { key: 'medicine', emoji: '💊' },
  { key: 'phone', emoji: '📱' },
  { key: 'notebook', emoji: '📓' },
  { key: 'warm', emoji: '🧥' },
  { key: 'cash', emoji: '💵' },
];

export default function CourseBriefScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { applications, requestWithdrawal, getCoTeachersForCourse } = useApplicationsStore();
  const { addNotification } = useNotificationsStore();
  const { findTeacher } = useTeachersStore();
  const [requestSent, setRequestSent] = useState(false);
  const [withdrawNote, setWithdrawNote] = useState('');
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const [coTeacherIds, setCoTeacherIds] = useState<string[]>([]);

  const application = applications.find((a) => a.id === Number(id));
  const course = application
    ? (coursesData as Course[]).find((c) => c.id === application.courseId)
    : null;

  useFocusEffect(
    useCallback(() => {
      if (application && course && userId) {
        getCoTeachersForCourse(course.id, userId).then(setCoTeacherIds);
      }
    }, [application?.id, course?.id, userId])
  );

  if (!course || !application) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.tx3 }}>Brief not found</Text>
      </View>
    );
  }

  const isWithdrawalPending = application.status === 'withdrawal_requested';

  const handleStepDown = () => {
    if (!userId) return;
    if (showWithdrawInput) {
      Alert.alert(
        t('brief.stepDown'),
        t('brief.stepDownConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: 'Send Request',
            style: 'destructive',
            onPress: async () => {
              await requestWithdrawal(application.id, userId, withdrawNote.trim() || undefined);
              await addNotification({
                targetUserId: 'admin',
                type: 'update',
                center: course.center,
                course: `${course.center} — ${course.type}`,
                courseId: course.id,
                subjectEn: 'Teacher requested step-down',
                bodyEn: `A teacher has requested to step down from the ${course.type} course at ${course.center} (${course.dates}).${withdrawNote.trim() ? '\n\nReason: ' + withdrawNote.trim() : ''}\n\nPlease review and approve or reject this request.`,
                bodyNe: `एक शिक्षकले ${course.center}को ${course.type} पाठ्यक्रमबाट पछि हट्न अनुरोध गरेका छन्। कृपया समीक्षा गर्नुहोस्।`,
              });
              setRequestSent(true);
            },
          },
        ]
      );
    } else {
      setShowWithdrawInput(true);
    }
  };

  if (requestSent) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🙏</Text>
        <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.tx, textAlign: 'center', marginBottom: 8 }}>
          Request Sent
        </Text>
        <Text style={{ fontSize: FontSize.smPlus, color: Colors.tx3, textAlign: 'center', marginBottom: 32 }}>
          Your step-down request has been sent to admin for approval.
        </Text>
        <Button label="Back to Applications" variant="primary" onPress={() => router.replace('/(teacher)/applications')} />
      </View>
    );
  }

  const langLabel = (code: string) =>
    code === 'ne' ? 'Nepali' : code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : code;

  const coTeachers = useMemo(
    () => coTeacherIds.map((tid) => findTeacher(tid)).filter(Boolean),
    [coTeacherIds, findTeacher]
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroSection
          title={course.center}
          subtitle={course.type}
          gradient="approved"
          onBack={() => router.back()}
          badge={
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>
                {isWithdrawalPending ? '⏸ Step-down Pending' : `✓ ${t('brief.confirmed')}`}
              </Text>
            </View>
          }
        >
          <Text style={styles.heroDates}>📅 {course.dates}</Text>
        </HeroSection>

        {/* Withdrawal pending banner */}
        {isWithdrawalPending && (
          <View style={styles.withdrawalBanner}>
            <Text style={styles.withdrawalBannerText}>
              ⏸ Your step-down request is awaiting admin approval. You are still assigned until approved.
            </Text>
          </View>
        )}

        {/* Arrival Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('brief.arrivalInfo')}</Text>
          <InfoRow label={t('brief.arriveBy')} value={`${course.arrivalDate}, ${course.arrivalTime}`} />
          <InfoRow label={t('brief.transport')} value={course.transport} />
          <InfoRow
            label={t('brief.students')}
            value={`${course.students.expected} (${course.students.male}M / ${course.students.female}F)`}
          />
        </View>

        {/* Coordinator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('brief.coordinator')}</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>{course.coordinator.name.charAt(0)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{course.coordinator.name}</Text>
              <Text style={styles.contactRole}>{course.coordinator.role}</Text>
              <Text style={styles.contactPhone}>{course.coordinator.phone}</Text>
            </View>
          </View>
        </View>

        {/* Static co-teacher (only when no dynamic co-teachers from approvals) */}
        {course.coTeacher && coTeachers.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('brief.coTeacher')}</Text>
            <View style={styles.contactCard}>
              <View style={[styles.contactAvatar, { backgroundColor: Colors.bll }]}>
                <Text style={[styles.contactAvatarText, { color: Colors.bl }]}>
                  {course.coTeacher.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{course.coTeacher.name}</Text>
                <View style={styles.langRow}>
                  {course.coTeacher.languages.map((l) => (
                    <Chip key={l} label={langLabel(l)} variant="blue" style={styles.langChip} />
                  ))}
                </View>
                {course.coTeacher.phone && (
                  <Text style={styles.contactPhone}>{course.coTeacher.phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Co-teachers from applications store */}
        {coTeachers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {coTeachers.length === 1 ? 'Your Co-Teacher' : 'Your Co-Teachers'}
            </Text>
            {coTeachers.map((ct) => ct && (
              <View key={ct.id} style={styles.contactCard}>
                <View style={[styles.contactAvatar, { backgroundColor: Colors.sfl }]}>
                  <Text style={[styles.contactAvatarText, { color: Colors.sf }]}>
                    {ct.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{ct.name}</Text>
                  <Text style={styles.contactRole}>
                    {ct.gender === 'F' ? '👩 Female AT' : '👨 Male AT'} · {ct.totalCourses} courses
                  </Text>
                  <View style={styles.langRow}>
                    {Object.entries(ct.languages)
                      .filter(([, v]) => v !== 'off')
                      .map(([lang, level]) => (
                        <Chip key={lang} label={lang} variant={level === 'primary' ? 'orange' : 'gray'} />
                      ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* What to bring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('brief.whatToBring')}</Text>
          {WHAT_TO_BRING.map(({ key, emoji }) => (
            <View key={key} style={styles.bringItem}>
              <Text style={styles.bringEmoji}>{emoji}</Text>
              <Text style={styles.bringLabel}>{t(`brief.checklist.${key}`)}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {course.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('brief.notes')}</Text>
            <Text style={styles.notesText}>{course.notes}</Text>
          </View>
        ) : null}

        {/* Step down */}
        {!isWithdrawalPending && (
          <View style={styles.stepDownSection}>
            <Text style={styles.stepDownWarning}>⚠️ {t('brief.stepDownWarning')}</Text>

            {showWithdrawInput && (
              <TextInput
                value={withdrawNote}
                onChangeText={setWithdrawNote}
                style={styles.withdrawInput}
                placeholder="Reason for stepping down (optional)"
                placeholderTextColor={Colors.tx3}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}

            <Button
              label={showWithdrawInput ? 'Send Step-Down Request' : t('brief.stepDown')}
              variant="danger"
              fullWidth
              onPress={handleStepDown}
            />

            {showWithdrawInput && (
              <TouchableOpacity onPress={() => setShowWithdrawInput(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  confirmedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  confirmedText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  heroDates: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
    marginTop: 6,
  },

  withdrawalBanner: {
    backgroundColor: '#EDE9FE',
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  withdrawalBannerText: {
    fontSize: FontSize.sm,
    color: '#7C3AED',
    lineHeight: FontSize.sm * 1.5,
  },

  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 4,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    gap: 8,
  },
  infoLabel: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.semibold,
    flex: 2,
    textAlign: 'right',
  },

  contactCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  contactInfo: {
    flex: 1,
    gap: 3,
  },
  contactName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  contactRole: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  contactPhone: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
  },
  langRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  langChip: {},

  bringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  bringEmoji: {
    fontSize: 18,
  },
  bringLabel: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.medium,
    flex: 1,
  },

  notesText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.55,
  },

  stepDownSection: {
    padding: Layout.horizontalPad,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.sm,
  },
  stepDownWarning: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    textAlign: 'center',
  },
  withdrawInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    padding: 12,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    minHeight: 80,
  },
  cancelLink: {
    textAlign: 'center',
    color: Colors.tx3,
    fontSize: FontSize.sm,
    paddingTop: 4,
  },
});
