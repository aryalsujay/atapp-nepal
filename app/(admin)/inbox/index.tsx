import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { SectionHeader } from '../../../src/components/layout/SectionHeader';
import { StatusPill, MatchBadge } from '../../../src/components/ui/Badge';
import { FilterRow } from '../../../src/components/ui/FilterChip';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { useNotificationsStore } from '../../../src/store/notificationsStore';
import coursesData from '../../../src/data/courses.json';
import teachersData from '../../../src/data/teachers.json';
import { calculateMatch } from '../../../src/utils/matching';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminInbox() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('all');

  const { applications, loadAllApplications, updateStatus } = useApplicationsStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    loadAllApplications();
  }, []);

  const tabOptions = ['All', 'Pending', 'Approved', 'Rejected'];
  const tabKeys: TabKey[] = ['all', 'pending', 'approved', 'rejected'];

  const filtered = tab === 'all' ? applications : applications.filter((a) => a.status === tab);

  const handleQuickAction = (appId: number, teacherId: string, courseId: number, action: 'approved' | 'rejected') => {
    const teacher = (teachersData as any[]).find((t) => t.id === teacherId);
    const course = (coursesData as any[]).find((c) => c.id === courseId);
    const label = action === 'approved' ? 'Approve' : 'Reject';

    Alert.alert(`${label} Application`, `Are you sure you want to ${label.toLowerCase()} this application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        style: action === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          await updateStatus(appId, action);
          if (teacher && course) {
            await addNotification({
              targetUserId: teacherId,
              type: action === 'approved' ? 'assignment' : 'rejection',
              center: course.center,
              course: `${course.center} — ${course.type}`,
              subjectEn: action === 'approved'
                ? 'You have been assigned to teach'
                : 'Application update — ' + course.center,
              bodyEn: action === 'approved'
                ? `Dear ${teacher.name},\n\nYour application for the ${course.type} course at ${course.center} has been approved.\n\nDates: ${course.dates}\n\nSadhu! 🙏`
                : `Dear ${teacher.name},\n\nThank you for applying to the ${course.type} course at ${course.center}. Unfortunately another AT was confirmed.\n\nWe hope to have you join us soon.\n\nIn Dhamma,\nScheduling Team`,
              bodyNe: action === 'approved'
                ? `प्रिय ${teacher.name},\n\nतपाईंको आवेदन स्वीकृत भएको छ।`
                : `प्रिय ${teacher.name},\n\nआवेदनका लागि धन्यवाद। दुर्भाग्यवश अर्को AT पुष्टि भइसकेको थियो।`,
              courseId,
            });
          }
        },
      },
    ]);
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title={t('admin.inbox.title')} style={styles.header} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={String(applications.length)} color={Colors.bl} />
        <StatCard label="Pending" value={String(pendingCount)} color={Colors.gd} />
        <StatCard label="Approved" value={String(applications.filter((a) => a.status === 'approved').length)} color={Colors.fo} />
        <StatCard label="Rejected" value={String(applications.filter((a) => a.status === 'rejected').length)} color={Colors.ur} />
      </View>

      {/* Filters */}
      <FilterRow
        options={tabOptions}
        active={tabOptions[tabKeys.indexOf(tab)]}
        onSelect={(opt) => setTab(tabKeys[tabOptions.indexOf(opt)])}
        activeColor={Colors.bl}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map((app) => {
          const teacher = (teachersData as any[]).find((t) => t.id === app.teacherId);
          const course = (coursesData as any[]).find((c) => c.id === app.courseId);
          const matchScore = teacher && course
            ? calculateMatch(teacher as any, course as any).score
            : 0;

          return (
            <View key={app.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{teacher?.name?.charAt(0) ?? '?'}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.teacherName}>{teacher?.name ?? 'Unknown Teacher'}</Text>
                  <Text style={styles.teacherMeta}>
                    {teacher?.gender === 'F' ? '👩' : '👨'} · {teacher?.totalCourses ?? 0} {t('admin.inbox.courses')}
                  </Text>
                </View>
                <StatusPill status={app.status} />
              </View>

              {/* Course */}
              <View style={styles.courseRow}>
                <Text style={styles.courseName}>{course?.center ?? 'Unknown'} — {course?.type}</Text>
                {matchScore > 0 && <MatchBadge score={matchScore} />}
              </View>
              <Text style={styles.courseDates}>📅 {course?.dates} · Applied {app.appliedDate}</Text>

              {/* Actions */}
              {app.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(admin)/inbox/${app.id}`)}
                    style={styles.reviewBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewBtnText}>{t('admin.inbox.review')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAction(app.id, app.teacherId, app.courseId, 'approved')}
                    style={[styles.actionBtn, { backgroundColor: Colors.fol }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.fo }]}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAction(app.id, app.teacherId, app.courseId, 'rejected')}
                    style={[styles.actionBtn, { backgroundColor: Colors.url }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.ur }]}>✗ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {app.status !== 'pending' && (
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/inbox/${app.id}`)}
                  style={styles.viewBtn}
                >
                  <Text style={styles.viewBtnText}>View Details →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {tab === 'all' ? '' : tab} applications</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[statStyles.card, { borderTopColor: color }]}>
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  label: {
    fontSize: 10,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
});

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  list: { paddingBottom: 110, paddingTop: 4 },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  headerInfo: { flex: 1, gap: 2 },
  teacherName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  teacherMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
    flex: 1,
  },
  courseDates: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
  },
  reviewBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: Colors.bll,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  reviewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },
  actionBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  viewBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.cr2,
    borderRadius: Radius.full,
  },
  viewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.tx3,
  },
});
