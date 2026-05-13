import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StatusPill, MatchBadge } from '@/components/ui/Badge';
import { FilterRow } from '@/components/ui/FilterChip';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { courses as coursesData, teachers as teachersData } from '@/data';
import { calculateMatch } from '@/utils/matching';
import type { Course, TeacherProfile } from '@/types';
import type { StoredTeacher } from '@/store/teachersStore';

type TabKey = 'all' | 'pending' | 'withdrawal_requested' | 'approved' | 'rejected';

export default function AdminInbox() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<TabKey>('all');
  const [inviteModal, setInviteModal] = useState<{ courseId: number; courseName: string } | null>(
    null,
  );

  const {
    applications,
    loadAllApplications,
    updateStatus,
    withdrawApplication,
    getApprovedCountForCourse,
  } = useApplicationsStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    loadAllApplications();
  }, []);

  const tabOptions = ['All', 'Pending', 'Step Down', 'Approved', 'Rejected'];
  const tabKeys: TabKey[] = ['all', 'pending', 'withdrawal_requested', 'approved', 'rejected'];

  const filtered = useMemo(
    () => (tab === 'all' ? applications : applications.filter((a) => a.status === tab)),
    [tab, applications],
  );

  // Pre-compute teacher/course/match per row so re-renders don't redo it
  const rows = useMemo(
    () =>
      filtered.map((app) => {
        const teacher = teachersData.find((t) => t.id === app.teacherId);
        const course = coursesData.find((c) => c.id === app.courseId);
        const matchScore =
          teacher && course
            ? calculateMatch(teacher as unknown as TeacherProfile, course).score
            : 0;
        return { app, teacher, course, matchScore };
      }),
    [filtered],
  );

  // Courses with zero applications — need teacher invites
  const coursesNeedingTeachers = useMemo(() => {
    const allCourseIds = new Set(applications.map((a) => a.courseId));
    return coursesData.filter((c) => !allCourseIds.has(c.id)).slice(0, 3);
  }, [applications]);

  const handleQuickAction = async (
    appId: number,
    teacherId: string,
    courseId: number,
    action: 'approved' | 'rejected',
  ) => {
    const teacher = teachersData.find((t) => t.id === teacherId);
    const course = coursesData.find((c) => c.id === courseId);
    const label = action === 'approved' ? 'Approve' : 'Reject';

    if (action === 'approved') {
      const approvedCount = await getApprovedCountForCourse(courseId);
      const needCount = course?.needCount ?? 1;
      if (approvedCount >= needCount) {
        confirm({
          title: 'Course Already Filled',
          message: `This course already has ${approvedCount} approved teacher(s) and only needs ${needCount}. Approve anyway?`,
          confirmText: 'Approve Anyway',
          onConfirm: () => doAction(appId, teacherId, courseId, action, teacher, course),
        });
        return;
      }
    }

    confirm({
      title: `${label} Application`,
      message: `Are you sure you want to ${label.toLowerCase()} this application?`,
      confirmText: label,
      destructive: action === 'rejected',
      onConfirm: () => doAction(appId, teacherId, courseId, action, teacher, course),
    });
  };

  const doAction = async (
    appId: number,
    teacherId: string,
    courseId: number,
    action: 'approved' | 'rejected',
    teacher: StoredTeacher | undefined,
    course: Course | undefined,
  ) => {
    await updateStatus(appId, action);
    if (teacher && course) {
      await addNotification({
        targetUserId: teacherId,
        type: action === 'approved' ? 'assignment' : 'rejection',
        center: course.center,
        course: `${course.center} — ${course.type}`,
        subjectEn:
          action === 'approved'
            ? 'You have been assigned to teach'
            : 'Application update — ' + course.center,
        bodyEn:
          action === 'approved'
            ? `Dear ${teacher.name},\n\nYour application for the ${course.type} course at ${course.center} has been approved.\n\nDates: ${course.dates}\n\nSadhu! 🙏`
            : `Dear ${teacher.name},\n\nThank you for applying to the ${course.type} course at ${course.center}. Unfortunately another AT was confirmed.\n\nIn Dhamma,\nScheduling Team`,
        bodyNe:
          action === 'approved'
            ? `प्रिय ${teacher.name},\n\nतपाईंको आवेदन स्वीकृत भएको छ।`
            : `प्रिय ${teacher.name},\n\nआवेदनका लागि धन्यवाद।`,
        courseId,
      });
    }
  };

  const handleWithdrawalApprove = (appId: number, teacherId: string, courseId: number) => {
    const teacher = teachersData.find((t) => t.id === teacherId);
    const course = coursesData.find((c) => c.id === courseId);
    confirm({
      title: 'Approve Step-Down',
      message: `Approve ${teacher?.name ?? 'this teacher'}'s request to step down from ${course?.center ?? 'this course'}?`,
      confirmText: 'Approve',
      destructive: true,
      onConfirm: async () => {
        await withdrawApplication(appId, teacherId);
        if (teacher && course) {
          await addNotification({
            targetUserId: teacherId,
            type: 'update',
            center: course.center,
            course: `${course.center} — ${course.type}`,
            courseId: course.id,
            subjectEn: 'Step-down approved',
            bodyEn: `Dear ${teacher.name},\n\nYour request to step down from the ${course.type} course at ${course.center} has been approved.\n\nThank you for your service. We wish you well.\n\nIn Dhamma,\nScheduling Team`,
            bodyNe: `प्रिय ${teacher.name},\n\nतपाईंको पछि हट्ने अनुरोध स्वीकृत भएको छ। धन्यवाद।`,
          });
        }
      },
    });
  };

  const handleWithdrawalReject = (appId: number, teacherId: string, courseId: number) => {
    const teacher = teachersData.find((t) => t.id === teacherId);
    const course = coursesData.find((c) => c.id === courseId);
    confirm({
      title: 'Reject Step-Down Request',
      message: `Reject this step-down request? The teacher will remain assigned to ${course?.center ?? 'this course'}.`,
      confirmText: 'Reject',
      onConfirm: async () => {
        await updateStatus(appId, 'approved');
        if (teacher && course) {
          await addNotification({
            targetUserId: teacherId,
            type: 'update',
            center: course.center,
            course: `${course.center} — ${course.type}`,
            courseId: course.id,
            subjectEn: 'Step-down request not approved',
            bodyEn: `Dear ${teacher.name},\n\nWe are unable to approve your step-down request from the ${course.type} course at ${course.center} at this time.\n\nPlease contact us if you need to discuss further.\n\nIn Dhamma,\nScheduling Team`,
            bodyNe: `प्रिय ${teacher.name},\n\nतपाईंको पछि हट्ने अनुरोध अस्वीकार गरिएको छ।`,
          });
        }
      },
    });
  };

  const handleSendInvite = async (teacher: StoredTeacher, courseId: number) => {
    const course = coursesData.find((c) => c.id === courseId);
    if (!course) return;
    await addNotification({
      targetUserId: teacher.id,
      type: 'invite',
      center: course.center,
      course: `${course.center} — ${course.type}`,
      courseId: course.id,
      subjectEn: `Invitation to teach — ${course.center}`,
      bodyEn: `Dear ${teacher.name},\n\nWe would like to invite you to teach the ${course.type} course at ${course.center} (${course.dates}).\n\nPlease accept or decline at your earliest convenience.\n\nIn Dhamma,\nScheduling Team`,
      bodyNe: `प्रिय ${teacher.name},\n\n${course.center}को ${course.type} पाठ्यक्रममा पढाउनका लागि आमन्त्रण गर्न चाहन्छौं।`,
    });
    setInviteModal(null);
    toast.success(`Invitation sent to ${teacher.name}.`, t('system.inviteSent'));
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const withdrawalCount = applications.filter((a) => a.status === 'withdrawal_requested').length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title={t('admin.inbox.title')} style={styles.header} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={String(applications.length)} color={Colors.bl} />
        <StatCard label="Pending" value={String(pendingCount)} color={Colors.gd} />
        <StatCard
          label="Approved"
          value={String(applications.filter((a) => a.status === 'approved').length)}
          color={Colors.fo}
        />
        <StatCard label="Step Down" value={String(withdrawalCount)} color="#7C3AED" />
      </View>

      {/* Courses needing teachers banner */}
      {coursesNeedingTeachers.length > 0 && (
        <View style={styles.needsBanner}>
          <Text style={styles.needsBannerTitle}>📢 Courses Needing Teachers</Text>
          {coursesNeedingTeachers.map((c) => (
            <View key={c.id} style={styles.needsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.needsCenter}>{c.center}</Text>
                <Text style={styles.needsMeta}>
                  {c.type} · {c.dates}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.inviteBtn}
                onPress={() =>
                  setInviteModal({ courseId: c.id, courseName: `${c.center} — ${c.type}` })
                }
              >
                <Text style={styles.inviteBtnText}>Invite →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Filters */}
      <FilterRow
        options={tabOptions}
        active={tabOptions[tabKeys.indexOf(tab)]}
        onSelect={(opt) => setTab(tabKeys[tabOptions.indexOf(opt)])}
        activeColor={tab === 'withdrawal_requested' ? '#7C3AED' : Colors.bl}
      />

      <FlatList
        data={rows}
        keyExtractor={(row) => String(row.app.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { app, teacher, course, matchScore } = item;
          const isWithdrawal = app.status === 'withdrawal_requested';
          return (
            <View style={[styles.card, isWithdrawal && styles.withdrawalCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{teacher?.name?.charAt(0) ?? '?'}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.teacherName}>{teacher?.name ?? 'Unknown Teacher'}</Text>
                  <Text style={styles.teacherMeta}>
                    {teacher?.gender === 'F' ? '👩' : '👨'} · {teacher?.totalCourses ?? 0}{' '}
                    {t('admin.inbox.courses')}
                    {app.queuePosition ? ` · Queue #${app.queuePosition}` : ''}
                  </Text>
                </View>
                <StatusPill status={app.status} />
              </View>

              <View style={styles.courseRow}>
                <Text style={styles.courseName}>
                  {course?.center ?? 'Unknown'} — {course?.type}
                </Text>
                {matchScore > 0 && <MatchBadge score={matchScore} />}
              </View>
              <Text style={styles.courseDates}>
                📅 {course?.dates} · Applied {app.appliedDate}
              </Text>

              {isWithdrawal && app.withdrawalNote && (
                <View style={styles.withdrawalNote}>
                  <Text style={styles.withdrawalNoteLabel}>Teacher's reason:</Text>
                  <Text style={styles.withdrawalNoteText}>{app.withdrawalNote}</Text>
                </View>
              )}

              {app.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push(routeTo.adminApplicationReview(app.id))}
                    style={styles.reviewBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewBtnText}>{t('admin.inbox.review')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuickAction(app.id, app.teacherId, app.courseId, 'approved')
                    }
                    style={[styles.actionBtn, { backgroundColor: Colors.fol }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.fo }]}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuickAction(app.id, app.teacherId, app.courseId, 'rejected')
                    }
                    style={[styles.actionBtn, { backgroundColor: Colors.url }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.ur }]}>✗</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isWithdrawal && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleWithdrawalReject(app.id, app.teacherId, app.courseId)}
                    style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.fol }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.fo }]}>Keep Assigned</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleWithdrawalApprove(app.id, app.teacherId, app.courseId)}
                    style={[styles.actionBtn, { flex: 1, backgroundColor: '#EDE9FE' }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: '#7C3AED' }]}>
                      Approve Step-Down
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {app.status !== 'pending' && !isWithdrawal && (
                <TouchableOpacity
                  onPress={() => router.push(routeTo.adminApplicationReview(app.id))}
                  style={styles.viewBtn}
                >
                  <Text style={styles.viewBtnText}>View Details →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              No {tab === 'all' ? '' : tab.replace('_', ' ')} applications
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.centresLink}
            onPress={() => router.push('/(admin)/centres')}
          >
            <Text style={styles.centresLinkText}>🏛 Manage Centres & Halls →</Text>
          </TouchableOpacity>
        }
      />

      {/* Invite Modal */}
      <Modal
        visible={!!inviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Invite a Teacher</Text>
            <Text style={styles.modalSubtitle}>{inviteModal?.courseName}</Text>
            <FlatList
              data={teachersData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.teacherRow}
                  onPress={() => handleSendInvite(item, inviteModal!.courseId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.teacherAvatar}>
                    <Text style={styles.teacherAvatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teacherRowName}>{item.name}</Text>
                    <Text style={styles.teacherRowMeta}>
                      {item.gender === 'F' ? '👩' : '👨'} · {item.totalCourses} courses ·{' '}
                      {item.region}
                    </Text>
                  </View>
                  <Text
                    style={{ color: Colors.bl, fontWeight: FontWeight.bold, fontSize: FontSize.sm }}
                  >
                    Invite
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            <TouchableOpacity onPress={() => setInviteModal(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  needsBanner: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: Layout.horizontalPad,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8,
  },
  needsBannerTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
    marginBottom: 4,
  },
  needsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  needsCenter: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
  },
  needsMeta: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },
  inviteBtn: {
    backgroundColor: Colors.fo,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  inviteBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

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
  withdrawalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
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
  withdrawalNote: {
    backgroundColor: '#EDE9FE',
    borderRadius: Radius.sm,
    padding: 10,
    gap: 2,
  },
  withdrawalNoteLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#7C3AED',
  },
  withdrawalNoteText: {
    fontSize: FontSize.sm,
    color: '#7C3AED',
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
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.tx3,
  },
  centresLink: {
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.lg,
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.bd,
    alignItems: 'center',
  },
  centresLinkText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.bl,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Layout.horizontalPad,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  modalSubtitle: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    marginTop: -8,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  teacherAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teacherAvatarText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  teacherRowName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  teacherRowMeta: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
});
