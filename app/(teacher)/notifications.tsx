/**
 * Teacher Notifications — implements `specs/11-teacher-notifications.md`.
 *
 * Prototype-faithful port of `app.html:3377–3490`. List view (white header +
 * cream divider + card stack with type-coloured left border + unread tint) +
 * in-place detail view (back row + body card + per-type CTAs). State is
 * local — no route change between list and detail.
 *
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 * Per-text fontFamily ties weights to registered Plus Jakarta Sans variants.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useCoursesStore } from '@/store/coursesStore';
import { useNotificationsStore, formatNotifTime } from '@/store/notificationsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { DashedDivider } from '@/components/ui/DashedDivider';
import type { Course, Notification, NotificationType } from '@/types';

const ASSIGNED_BLUE = '#5B6FA8';
const REMINDER_GOLD = '#9B6B14';

const ACCENT: Record<NotificationType, string> = {
  invite: ASSIGNED_BLUE,
  assignment: Colors.fo,
  reminder: REMINDER_GOLD,
  update: Colors.bl,
  approval: Colors.fo,
  rejection: Colors.ur,
  new_application: Colors.bl,
  withdrawal_request: REMINDER_GOLD,
};

const ICON: Record<NotificationType, string> = {
  invite: '📬',
  assignment: '📋',
  reminder: '⏰',
  update: '🔄',
  approval: '✓',
  rejection: '✗',
  new_application: '📨',
  withdrawal_request: '↩︎',
};

const accent = (type: NotificationType) => ACCENT[type] ?? Colors.tx3;
const icon = (type: NotificationType) => ICON[type] ?? '🔔';

/** Apply a flat 13 % alpha to a hex accent for the icon-tile background. */
const tile = (type: NotificationType) => `${accent(type)}22`;

type InviteStatus = 'pending' | 'approved' | 'rejected';

export default function TeacherNotifications() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const getForUser = useNotificationsStore((s) => s.getForUser);
  const markRead = useNotificationsStore((s) => s.markRead);
  const respondToInvite = useNotificationsStore((s) => s.respondToInvite);
  // Subscribe to notifications so the screen re-renders after store mutations.
  useNotificationsStore((s) => s.notifications);
  const courses = useCoursesStore((s) => s.courses) as Course[];
  const language = useSettingsStore((s) => s.language);

  const [selected, setSelected] = useState<Notification | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const notifs = getForUser(userId);
  const unread = notifs.filter((n) => !n.read).length;

  const openNotif = (n: Notification) => {
    if (!n.read) markRead(n.id);

    // Deep-link non-invite notifications to the relevant course-detail
    // screen so the teacher sees the live application status, dates,
    // travel info, etc. Invites stay inline because they have an
    // accept / decline action that lives in this screen.
    if (n.type !== 'invite' && n.courseId) {
      router.push(routeTo.teacherCourseDetail(n.courseId));
      return;
    }

    setSelected(n);
    setRejecting(false);
    setRejectReason('');
  };

  const closeDetail = () => {
    setSelected(null);
    setRejecting(false);
    setRejectReason('');
  };

  const onAccept = async (n: Notification) => {
    await respondToInvite(n.id, 'accepted');
    closeDetail();
    toast.success(t('notifications.toast_accepted'));
  };

  const onConfirmDecline = async (n: Notification) => {
    await respondToInvite(n.id, 'declined', rejectReason);
    closeDetail();
    toast.success(t('notifications.toast_declined'));
  };

  // ─── Detail view ────────────────────────────────────────────────────────
  if (selected) {
    const n = selected;
    const status = n.status as InviteStatus | undefined;
    const courseForBrief = n.courseId ? courses.find((c) => c.id === n.courseId) : undefined;

    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.headerWrap, { paddingTop: Math.max(56, insets.top + 14) }]}>
            <TouchableOpacity
              onPress={closeDetail}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={s.backRow}
            >
              <BackChevron />
              <Text style={s.backText}>{t('notifications.back')}</Text>
            </TouchableOpacity>

            <View style={s.detailHeaderRow}>
              <View style={[s.detailIconTile, { backgroundColor: tile(n.type) }]}>
                <Text style={s.detailIconEmoji}>{icon(n.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.detailSubject}>{n.subjectEn}</Text>
                <Text style={s.detailMeta}>
                  {n.center} · {formatNotifTime(n.timestamp)}
                </Text>
                {n.type === 'invite' ? (
                  <StatusChip status={status} placement="detail" t={t} />
                ) : null}
              </View>
            </View>
          </View>

          <View style={s.dividerStrip} />

          <View style={[s.card, s.bodyCard]}>
            <Text style={s.bodyText}>{language === 'ne' && n.bodyNe ? n.bodyNe : n.bodyEn}</Text>
          </View>

          {/* Invite — pending response zone */}
          {n.type === 'invite' && status === 'pending' ? (
            <View style={s.inviteWrap}>
              {rejecting ? (
                <>
                  <TextInput
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    multiline
                    textAlignVertical="top"
                    placeholder={t('notifications.decline_placeholder')}
                    placeholderTextColor={Colors.tx3}
                    style={[s.inp, s.declineInput]}
                  />
                  <View style={s.btnRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setRejecting(false);
                        setRejectReason('');
                      }}
                      activeOpacity={0.85}
                      style={[s.btnSm, s.btnOu, { flex: 1 }]}
                    >
                      <Text style={s.btnOuText}>{t('notifications.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onConfirmDecline(n)}
                      activeOpacity={0.85}
                      style={[s.btnSm, s.btnDanger, { flex: 1 }]}
                    >
                      <Text style={s.btnDangerText}>{t('notifications.confirm_decline')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={s.btnRow}>
                  <TouchableOpacity
                    onPress={() => onAccept(n)}
                    activeOpacity={0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[Colors.sf, Colors.sfd] as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[s.btnSm, s.btnPr]}
                    >
                      <Text style={s.btnPrText}>{t('notifications.accept')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRejecting(true)}
                    activeOpacity={0.85}
                    style={[s.btnSm, s.btnDeclineOu, { flex: 1 }]}
                  >
                    <Text style={s.btnDeclineOuText}>{t('notifications.decline')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          {/* Invite — rejected reason recap */}
          {n.type === 'invite' && status === 'rejected' && n.declineReason ? (
            <View style={s.reasonRecap}>
              <Text style={s.reasonRecapText}>
                <Text style={s.reasonRecapStrong}>{t('notifications.your_reason')} </Text>
                {n.declineReason}
              </Text>
            </View>
          ) : null}

          {/* Assignment — View Course Brief */}
          {n.type === 'assignment' && courseForBrief ? (
            <View style={s.assignmentLinkWrap}>
              <TouchableOpacity
                onPress={() => {
                  setSelected(null);
                  router.push(routeTo.teacherApplicationBrief(courseForBrief.id));
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.sf, Colors.sfd] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.btnPrFull}
                >
                  <Text style={s.btnPrFullText}>📋 {t('notifications.view_brief')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  // ─── List view ──────────────────────────────────────────────────────────
  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.headerWrap, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('notifications.title')}</Text>
          <Text style={s.subtitle}>
            {t('notifications.subtitle', { new: unread, total: notifs.length })}
          </Text>
        </View>

        <View style={s.dividerStrip} />

        {notifs.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🔔</Text>
            <Text style={s.emptyTitle}>{t('notifications.empty_title')}</Text>
            <Text style={s.emptyMsg}>{t('notifications.empty_message')}</Text>
          </View>
        ) : (
          notifs.map((n) => (
            <NotificationCard
              key={n.id}
              n={n}
              courses={courses}
              onPress={() => openNotif(n)}
              t={t}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NotificationCard({
  n,
  courses,
  onPress,
  t,
}: {
  n: Notification;
  courses: Course[];
  onPress: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const isUnread = !n.read;
  const accentColor = accent(n.type);
  const status = n.status as InviteStatus | undefined;
  const matchedCourse = n.courseId ? courses.find((c) => c.id === n.courseId) : undefined;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          s.card,
          {
            borderLeftColor: accentColor,
            backgroundColor: isUnread ? Colors.fol : Colors.white,
          },
        ]}
      >
        <View style={s.cardTopRow}>
          <View style={[s.iconTile, { backgroundColor: tile(n.type) }]}>
            <Text style={s.iconTileEmoji}>{icon(n.type)}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={s.subjectRow}>
              <Text style={[s.subjectText, isUnread ? s.subjectUnread : s.subjectRead]}>
                {n.subjectEn}
              </Text>
              {isUnread ? <View style={s.unreadDot} /> : null}
            </View>
            <Text style={s.courseLine}>{n.course}</Text>
            <Text style={s.timeLine}>{formatNotifTime(n.timestamp)}</Text>

            {/* Type-specific footers */}
            {n.type === 'invite' ? <InviteFooter status={status} t={t} /> : null}
            {n.type === 'assignment' && matchedCourse ? (
              <AssignmentFooter course={matchedCourse} t={t} />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function InviteFooter({ status, t }: { status?: InviteStatus; t: (key: string) => string }) {
  return (
    <View style={s.inviteFooterWrap}>
      <DashedDivider marginVertical={0} />
      <View style={s.inviteFooterRow}>
        <StatusChip status={status} placement="list" t={t} />
        {status === 'pending' || !status ? (
          <Text style={s.tapToRespond}>{t('notifications.tap_to_respond')}</Text>
        ) : null}
      </View>
    </View>
  );
}

function AssignmentFooter({ course, t }: { course: Course; t: (k: string) => string }) {
  return (
    <View style={s.assignmentFooterWrap}>
      <DashedDivider marginVertical={0} />
      <Text style={s.confirmedText}>✓ {t('notifications.confirmed_short')}</Text>
      <Text style={s.assignmentMeta}>
        📅 {course.dates} · 🛬 {course.arrivalDate}
      </Text>
    </View>
  );
}

function StatusChip({
  status,
  placement,
  t,
}: {
  status?: InviteStatus;
  placement: 'list' | 'detail';
  t: (key: string) => string;
}) {
  const variant = (() => {
    if (status === 'approved') {
      return { bg: Colors.fol, fg: Colors.fo, label: t('notifications.status_accepted') };
    }
    if (status === 'rejected') {
      return { bg: Colors.url, fg: Colors.ur, label: t('notifications.status_declined') };
    }
    return {
      bg: Colors.cr2,
      fg: Colors.tx2,
      label:
        placement === 'detail'
          ? t('notifications.status_pending_detail')
          : t('notifications.status_pending_list'),
    };
  })();
  return (
    <View
      style={[
        s.statusChip,
        placement === 'detail' ? s.statusChipDetail : null,
        { backgroundColor: variant.bg },
      ]}
    >
      <Text
        style={[
          s.statusChipText,
          placement === 'detail' ? s.statusChipTextDetail : null,
          { color: variant.fg },
        ]}
      >
        {variant.label}
      </Text>
    </View>
  );
}

function BackChevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={Colors.sf}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Header (shared by list + detail)
  headerWrap: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },

  // Detail back row + header
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sf,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  detailIconTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailIconEmoji: {
    fontSize: 22,
  },
  detailSubject: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
    lineHeight: 21,
  },
  detailMeta: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 3,
  },

  // Divider
  dividerStrip: {
    height: 8,
    backgroundColor: Colors.cr,
  },

  // Card base (list rows + detail body)
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    ...Shadows.card,
  },

  // Detail body card (no left border, all-around margin)
  bodyCard: {
    margin: 14,
    marginHorizontal: 14,
    borderLeftWidth: 0,
  },
  bodyText: {
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
    lineHeight: 22,
  },

  // ── List card content ──
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTileEmoji: {
    fontSize: 18,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  subjectText: {
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
    lineHeight: 18,
    flex: 1,
  },
  subjectUnread: {
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  subjectRead: {
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.fo,
    marginTop: 5,
    flexShrink: 0,
  },
  courseLine: {
    fontSize: 11.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 2,
  },
  timeLine: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },

  // Invite footer (list)
  inviteFooterWrap: {
    marginTop: 7,
    paddingTop: 7,
  },
  inviteFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tapToRespond: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: ASSIGNED_BLUE,
  },

  // Assignment footer (list)
  assignmentFooterWrap: {
    marginTop: 8,
    paddingTop: 8,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
  },
  assignmentMeta: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 1,
  },

  // Status chip (used in both list footer + detail header)
  statusChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  statusChipDetail: {
    marginTop: 6,
  },
  statusChipTextDetail: {
    fontSize: 11,
  },

  // ── Invite response zone ──
  inviteWrap: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSm: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPr: {
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnPrText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  btnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  btnOuText: {
    color: Colors.tx,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  btnDeclineOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F5C0BB',
  },
  btnDeclineOuText: {
    color: Colors.ur,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  btnDanger: {
    backgroundColor: Colors.ur,
  },
  btnDangerText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  // Multiline `.inp` for decline reason
  inp: {
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
  },
  declineInput: {
    minHeight: 90,
    lineHeight: 21,
    marginBottom: 8,
  },

  // Rejection reason recap
  reasonRecap: {
    marginHorizontal: 18,
    backgroundColor: Colors.url,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasonRecapText: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.ur,
  },
  reasonRecapStrong: {
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Assignment quick-link (detail)
  assignmentLinkWrap: {
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  btnPrFull: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnPrFullText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 14,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
    textAlign: 'center',
  },
  emptyMsg: {
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    textAlign: 'center',
    lineHeight: 20,
  },
});

type InviteStatusType = InviteStatus;
// re-export internal type for symbol stability if used elsewhere
export type { InviteStatusType };
