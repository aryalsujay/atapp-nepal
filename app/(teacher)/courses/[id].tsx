import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useProfileStore } from '../../../src/store/profileStore';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { Colors, Gradients } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { HeroSection } from '../../../src/components/layout/HeroSection';
import { ChecklistItem } from '../../../src/components/ui/ChecklistItem';
import { Chip } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import coursesData from '../../../src/data/courses.json';
import { Course, Application } from '../../../src/types';
import { calculateMatch } from '../../../src/utils/matching';
import { buildEligibilityChecks, langLabel as fmtLang } from '../../../src/utils/eligibility';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId);
  const { profile, loadProfile } = useProfileStore();
  const { applications, loadApplications, submitApplication } = useApplicationsStore();

  const [applying, setApplying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadProfile(userId);
    loadApplications(userId);
  }, [userId]);

  const course = (coursesData as Course[]).find((c) => c.id === Number(id));
  if (!course) return null;

  const existingApp = applications.find((a) => a.courseId === course.id);
  const isApplied = !!existingApp;
  const isAssigned = existingApp?.status === 'approved';

  const matchResult = profile ? calculateMatch(profile, course) : null;
  const matchScore = matchResult?.score ?? course.match ?? 0;

  const checks = profile
    ? buildEligibilityChecks(profile, course, {
        authorization: t('courseDetail.checkItems.authorization'),
        language: t('courseDetail.checkItems.language'),
        availability: t('courseDetail.checkItems.availability'),
        restGap: t('courseDetail.checkItems.restGap'),
        gender: t('courseDetail.checkItems.gender'),
      })
    : [];

  const handleApply = async () => {
    if (!userId) return;
    setApplying(true);
    try {
      await submitApplication(course.id, userId);
      setSubmitted(true);
    } finally {
      setApplying(false);
    }
  };

  const langLabel = (code: string) =>
    code === 'ne' ? 'Nepali' : code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : code;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroSection
          title={course.center}
          subtitle={`${course.city} · ${course.flag ?? '🇳🇵'}`}
          gradient="course"
          onBack={() => router.back()}
          badge={
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{course.type}</Text>
            </View>
          }
        >
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>📅 {course.dates}</Text>
            {matchScore > 0 && (
              <View style={styles.matchPill}>
                <Text style={styles.matchPillText}>{matchScore}% Match</Text>
              </View>
            )}
          </View>
        </HeroSection>

        {/* Course Info Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Information</Text>
          <InfoRow label="Type" value={course.type} />
          <InfoRow label={t('courseDetail.coordinator')} value={course.coordinator.name} />
          <InfoRow label={t('courseDetail.coordinator') + ' Phone'} value={course.coordinator.phone} />
          <InfoRow label={t('courseDetail.arrival')} value={`${course.arrivalDate} at ${course.arrivalTime}`} />
          <InfoRow label={t('courseDetail.transport')} value={course.transport} />
          <InfoRow
            label={t('courseDetail.students')}
            value={`${course.students.expected} expected (${course.students.male}M / ${course.students.female}F)`}
          />
          {course.altitude && (
            <InfoRow label={t('courseDetail.altitude')} value={`${course.altitude}m`} />
          )}
          <InfoRow
            label={t('courseDetail.languages')}
            value={course.languages.map(langLabel).join(', ')}
          />
          {course.notes ? <InfoRow label="Notes" value={course.notes} /> : null}
        </View>

        {/* Co-teacher section */}
        {course.coTeacher && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('courseDetail.coTeacher')}</Text>
            <View style={styles.coTeacherCard}>
              <View style={[styles.coAvatar, { backgroundColor: course.coTeacher.gender === 'F' ? '#FBE8F0' : Colors.fol }]}>
                <Text style={styles.coAvatarText}>{course.coTeacher.name.charAt(0)}</Text>
              </View>
              <View style={styles.coInfo}>
                <Text style={styles.coName}>{course.coTeacher.name}</Text>
                <View style={styles.coLangs}>
                  {course.coTeacher.languages.map((l) => (
                    <Chip key={l} label={langLabel(l)} variant="blue" style={styles.langChip} />
                  ))}
                </View>
                {course.coTeacher.phone && (
                  <Text style={styles.coPhone}>{course.coTeacher.phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Eligibility checklist */}
        {checks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('courseDetail.eligibility')}</Text>
            {checks.map((check, idx) => (
              <ChecklistItem
                key={idx}
                label={check.label}
                sublabel={(check as any).sublabel}
                passed={check.passed}
              />
            ))}
          </View>
        )}

        {/* Apply / status area */}
        <View style={styles.applySection}>
          {submitted || (isApplied && !isAssigned) ? (
            <View style={styles.submittedBox}>
              <Text style={styles.submittedTitle}>🙏 {t('courseDetail.applicationSubmitted')}</Text>
              <Text style={styles.submittedMsg}>{t('courseDetail.reviewMessage')}</Text>
            </View>
          ) : isAssigned ? (
            <View style={styles.assignedBox}>
              <Text style={styles.assignedText}>✓ {t('courseDetail.assigned')}</Text>
              <Button
                label="View Course Brief"
                variant="forest"
                fullWidth
                onPress={() => router.push(`/(teacher)/applications/brief/${existingApp?.id}`)}
              />
            </View>
          ) : (
            <>
              <Text style={styles.shareNote}>🔒 {t('courseDetail.shareProfile')}</Text>
              <Button
                label={t('courseDetail.applyNow')}
                variant="primary"
                fullWidth
                loading={applying}
                onPress={handleApply}
                style={styles.applyBtn}
              />
            </>
          )}
        </View>
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
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 8,
  },
  heroMetaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
  },
  matchPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  matchPillText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
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

  coTeacherCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  coAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coAvatarText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
  },
  coInfo: {
    flex: 1,
    gap: 5,
  },
  coName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  coLangs: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  langChip: {},
  coPhone: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },

  applySection: {
    padding: Layout.horizontalPad,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  shareNote: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.5,
  },
  applyBtn: {
    marginTop: 4,
  },
  submittedBox: {
    backgroundColor: Colors.fol,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    alignItems: 'center',
    gap: 6,
  },
  submittedTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
  },
  submittedMsg: {
    fontSize: FontSize.smPlus,
    color: Colors.fo,
    textAlign: 'center',
    lineHeight: FontSize.smPlus * 1.5,
  },
  assignedBox: {
    gap: Spacing.md,
  },
  assignedText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
    textAlign: 'center',
  },
});
