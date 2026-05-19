/**
 * Teacher Applications — implements `specs/08-teacher-applications.md`.
 *
 * Prototype-faithful port of `app.html:1155–1220`. Plain white header,
 * 8 px cream divider, card stack sorted by appliedDate DESC. Each card has
 * a coloured left border (assigned blue / approved forest / pending orange /
 * rejected grey), a top row with status spill + optional 📨 Assigned pill,
 * a 3-step timeline (source-aware), a dashed-top "🛬 arrival · View Brief"
 * footer for approved + briefed cards, and a red reason box for rejected
 * cards.
 *
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 * Per-text fontFamily ties weights to registered Plus Jakarta Sans variants.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useApplicationsStore } from '@/store/applicationsStore';
import { useCoursesStore } from '@/store/coursesStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { DashedDivider } from '@/components/ui/DashedDivider';
import type { Application, Course } from '@/types';

const ASSIGNED_BLUE = '#5B6FA8';
const ASSIGNED_BG = 'rgba(91,111,168,0.12)';
const ASSIGNED_BORDER = 'rgba(91,111,168,0.25)';

type Status = Application['status'];
type Source = 'applied' | 'assigned';

interface TimelineStep {
  label: string;
  state: 'done' | 'active' | 'pending';
  rejected?: boolean;
}

export default function TeacherApplications() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const applications = useApplicationsStore((s) => s.applications);
  const loadApplications = useApplicationsStore((s) => s.loadApplications);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await loadApplications(userId);
    } finally {
      setRefreshing(false);
    }
  }, [userId, loadApplications]);
  const loadedForUserId = useApplicationsStore((s) => s.loadedForUserId);
  const courses = useCoursesStore((s) => s.courses) as Course[];

  useEffect(() => {
    // Skip if the app shell has already preloaded for this user. The shell
    // fires `loadApplications` as soon as the session restores, so by the
    // time this screen first mounts the data is already in zustand.
    if (!userId || loadedForUserId === userId) return;
    loadApplications(userId);
  }, [userId, loadedForUserId, loadApplications]);

  const courseById = useMemo(() => {
    const m = new Map<number, Course>();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const sorted = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const da = parseAppliedDate(a.appliedDate);
        const db = parseAppliedDate(b.appliedDate);
        if (da !== db) return db - da;
        return b.id - a.id;
      }),
    [applications],
  );

  const approvedCount = sorted.filter((a) => a.status === 'approved').length;

  // Brief screen's URL param is the *courseId*, not the applicationId — it
  // joins on courseId + teacherId to find the application. Passing app.id
  // here silently broke navigation for approved cards.
  const onViewBrief = (app: Application) =>
    router.push(routeTo.teacherApplicationBrief(app.courseId));

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.sf} />
        }
      >
        {/* Header */}
        <View style={[s.headerWrap, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('applications.title')}</Text>
          <Text style={s.subtitle}>
            {t('applications.subtitle', {
              count: sorted.length,
              approved: approvedCount,
            })}
          </Text>
        </View>

        {/* Cream divider strip */}
        <View style={s.dividerStrip} />

        {sorted.length === 0 ? (
          <EmptyState t={t} onBrowse={() => router.push(Routes.teacherCourses)} />
        ) : (
          <>
            {sorted.map((app) => {
              const course = courseById.get(app.courseId);
              return (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  course={course}
                  onPress={
                    app.status === 'approved' && course?.arrivalDate
                      ? () => onViewBrief(app)
                      : undefined
                  }
                  t={t}
                />
              );
            })}
            <View style={s.browseRow}>
              <TouchableOpacity
                onPress={() => router.push(Routes.teacherCourses)}
                activeOpacity={0.85}
                style={s.browseBtn}
              >
                <Text style={s.browseBtnText}>{t('applications.browse_more')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  course,
  onPress,
  t,
}: {
  app: Application;
  course: Course | undefined;
  onPress?: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const source = (app.source ?? 'applied') as Source;
  const borderColor = leftBorderColor(app.status, source);
  const steps = buildTimeline(app.status, source, t);
  const showBriefFooter = app.status === 'approved' && Boolean(course?.arrivalDate);
  const showReasonBox = app.status === 'rejected' && Boolean(app.rejectionReason);

  const cardBody = (
    <View style={[s.card, { borderLeftColor: borderColor }]}>
      {/* Top row */}
      <View style={s.cardTopRow}>
        <View style={s.cardLeft}>
          <Text style={s.cardCenter}>{course?.center ?? '—'}</Text>
          <Text style={s.cardMeta}>
            {course?.type ?? '—'} · {course?.dates ?? '—'}
          </Text>
          {source === 'applied' && app.appliedDate ? (
            <Text style={s.cardApplied}>
              {t('applications.applied_date', { date: app.appliedDate })}
            </Text>
          ) : null}
        </View>
        <View style={s.cardRight}>
          <StatusSpill status={app.status} t={t} />
          {source === 'assigned' ? <AssignedPill t={t} /> : null}
        </View>
      </View>

      {/* Timeline */}
      <View>
        {steps.map((step, i) => (
          <TimelineRow
            key={`${step.label}-${i}`}
            step={step}
            isLast={i === steps.length - 1}
            nextDone={i + 1 < steps.length ? steps[i + 1].state === 'done' : false}
          />
        ))}
      </View>

      {/* Approved + brief → dashed footer */}
      {showBriefFooter ? (
        <>
          <DashedDivider marginVertical={0} />
          <View style={s.briefFooterRow}>
            <Text style={s.briefArrival}>🛬 {course?.arrivalDate}</Text>
            <Text style={s.briefLink}>{t('applications.view_brief')}</Text>
          </View>
        </>
      ) : null}

      {/* Rejected + reason → red box */}
      {showReasonBox ? (
        <View style={s.reasonBox}>
          <Text style={s.reasonTitle}>{t('applications.reason_label')}</Text>
          <Text style={s.reasonBody}>{app.rejectionReason}</Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {cardBody}
      </TouchableOpacity>
    );
  }
  return cardBody;
}

function StatusSpill({ status, t }: { status: Status; t: (key: string) => string }) {
  const variant = (() => {
    switch (status) {
      case 'approved':
        return { bg: Colors.fol, fg: Colors.fo, label: t('applications.status.approved') };
      case 'pending':
        return { bg: Colors.gdl, fg: Colors.gd, label: t('applications.status.pending') };
      case 'rejected':
        return { bg: Colors.url, fg: Colors.ur, label: t('applications.status.rejected') };
      case 'withdrawal_requested':
        return {
          bg: Colors.cr2,
          fg: Colors.tx2,
          label: t('applications.status.withdrawal_requested'),
        };
    }
  })();
  return (
    <View style={[s.spill, { backgroundColor: variant.bg }]}>
      <Text style={[s.spillText, { color: variant.fg }]}>{variant.label}</Text>
    </View>
  );
}

function AssignedPill({ t }: { t: (key: string) => string }) {
  return (
    <View style={s.assignedPill}>
      <Text style={s.assignedPillText}>{t('applications.assigned_pill')}</Text>
    </View>
  );
}

function TimelineRow({
  step,
  isLast,
  nextDone,
}: {
  step: TimelineStep;
  isLast: boolean;
  nextDone: boolean;
}) {
  const dotColor = step.rejected
    ? Colors.ur
    : step.state === 'done'
      ? Colors.fo
      : step.state === 'active'
        ? Colors.sf
        : Colors.bd2;
  const labelColor = step.rejected
    ? Colors.ur
    : step.state === 'active'
      ? Colors.sf
      : step.state === 'done'
        ? Colors.fo
        : Colors.tx3;
  const connectorColor = nextDone ? Colors.fom : Colors.bd;

  return (
    <View style={s.tlItem}>
      <View style={s.tlDotCol}>
        <View
          style={[
            s.tlDot,
            { backgroundColor: dotColor },
            step.state === 'active' ? s.tlDotActiveRing : null,
          ]}
        />
        {isLast ? null : <View style={[s.tlConn, { backgroundColor: connectorColor }]} />}
      </View>
      <View style={[s.tlLabelCol, { paddingBottom: isLast ? 0 : 13 }]}>
        <Text style={[s.tlLabel, { color: labelColor }]}>{step.label}</Text>
      </View>
    </View>
  );
}

function EmptyState({ t, onBrowse }: { t: (key: string) => string; onBrowse: () => void }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyEmoji}>📋</Text>
      <Text style={s.emptyTitle}>{t('applications.empty_title')}</Text>
      <Text style={s.emptyMsg}>{t('applications.empty_message')}</Text>
      <TouchableOpacity onPress={onBrowse} activeOpacity={0.85} style={s.emptyBtn}>
        <Text style={s.emptyBtnText}>{t('applications.browse_more')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function leftBorderColor(status: Status, source: Source): string {
  if (source === 'assigned') return ASSIGNED_BLUE;
  if (status === 'approved') return Colors.fo;
  if (status === 'pending') return Colors.sf;
  if (status === 'rejected') return Colors.bd2;
  return Colors.bd2;
}

function buildTimeline(status: Status, source: Source, t: (key: string) => string): TimelineStep[] {
  if (source === 'assigned') {
    return [
      { label: t('applications.timeline.assigned'), state: 'done' },
      {
        label: t('applications.timeline.accepted'),
        state: status === 'approved' ? 'done' : 'pending',
      },
      status === 'approved'
        ? { label: t('applications.timeline.confirmed'), state: 'done' }
        : { label: t('applications.timeline.awaiting_confirmation'), state: 'pending' },
    ];
  }
  // applied
  return [
    { label: t('applications.timeline.applied'), state: 'done' },
    {
      label: t('applications.timeline.under_review'),
      state: status === 'pending' ? 'active' : 'done',
    },
    status === 'approved'
      ? { label: t('applications.timeline.confirmed'), state: 'done' }
      : status === 'rejected'
        ? { label: t('applications.timeline.not_selected'), state: 'pending', rejected: true }
        : { label: t('applications.timeline.awaiting_decision'), state: 'pending' },
  ];
}

/** Parses "May 06, 2026" / "Apr 18, 2026" etc. Returns 0 on failure. */
function parseAppliedDate(raw: string | undefined): number {
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// ─── Styles (inline literal sizes from prototype) ────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Header
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
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },

  // Divider strip between header + cards
  dividerStrip: {
    height: 8,
    backgroundColor: Colors.cr,
  },

  // Card base
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 9,
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardCenter: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  cardMeta: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 1,
  },
  cardApplied: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },

  // Status spill chip
  spill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  spillText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // 📨 Assigned pill
  assignedPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: ASSIGNED_BG,
    borderWidth: 1,
    borderColor: ASSIGNED_BORDER,
  },
  assignedPillText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: ASSIGNED_BLUE,
  },

  // Timeline
  tlItem: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 0,
  },
  tlDotCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  tlDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    marginTop: 3,
    flexShrink: 0,
  },
  tlDotActiveRing: {
    // Halo ring around the active orange dot. RN doesn't have CSS
    // `box-shadow:0 0 0 4px` — approximate with elevation/shadow tokens
    // and a soft platform-appropriate spread.
    shadowColor: Colors.sf,
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  tlConn: {
    width: 2,
    flex: 1,
    minHeight: 22,
  },
  tlLabelCol: {
    flex: 1,
  },
  tlLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Brief footer (approved + arrival)
  briefFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingTop: 9,
  },
  briefArrival: {
    fontSize: 11.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
  },
  briefLink: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
  },

  // Rejection-reason box
  reasonBox: {
    backgroundColor: Colors.url,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginTop: 8,
  },
  reasonTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.ur,
    marginBottom: 2,
  },
  reasonBody: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.ur,
  },

  // Browse more button
  browseRow: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  browseBtn: {
    backgroundColor: Colors.sfl,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtnText: {
    color: Colors.sfd,
    fontSize: 14,
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
  emptyBtn: {
    backgroundColor: Colors.sfl,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 13,
    marginTop: 4,
  },
  emptyBtnText: {
    color: Colors.sfd,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
