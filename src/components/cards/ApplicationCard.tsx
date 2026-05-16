import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Application, Course } from '@/types';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { useTranslation } from 'react-i18next';

interface ApplicationCardProps {
  application: Application;
  course?: Course;
  onPress?: () => void;
  onViewBrief?: () => void;
  style?: ViewStyle;
}

// Timeline step data
function getTimelineSteps(application: Application) {
  const isAssigned = application.source === 'assigned';
  const isWithdrawal = application.status === 'withdrawal_requested';
  if (isAssigned) {
    return [
      { label: 'Assigned by Admin', done: true },
      { label: 'Confirmed ✓', done: application.status === 'approved' || isWithdrawal },
      {
        label: isWithdrawal
          ? 'Step-down Pending'
          : application.status === 'rejected'
            ? 'Not Selected'
            : 'Active',
        done: false,
        rejected: application.status === 'rejected',
        warning: isWithdrawal,
      },
    ];
  }
  return [
    { label: 'Applied', done: true },
    { label: 'Under Review', done: application.status !== 'pending' },
    {
      label: isWithdrawal
        ? 'Step-down Pending'
        : application.status === 'approved'
          ? 'Confirmed ✓'
          : application.status === 'rejected'
            ? 'Not Selected'
            : 'Awaiting Decision',
      done: application.status === 'approved' && !isWithdrawal,
      rejected: application.status === 'rejected',
      warning: isWithdrawal,
    },
  ];
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  course,
  onPress,
  onViewBrief,
  style,
}) => {
  const { t } = useTranslation();
  const steps = getTimelineSteps(application);

  const isWithdrawal = application.status === 'withdrawal_requested';

  const borderColor = isWithdrawal
    ? '#7C3AED'
    : application.source === 'assigned'
      ? '#5B6FA8'
      : application.status === 'approved'
        ? Colors.fo
        : application.status === 'rejected'
          ? Colors.bd2
          : Colors.sf;

  const statusBg = isWithdrawal
    ? '#EDE9FE'
    : application.status === 'approved'
      ? Colors.fol
      : application.status === 'rejected'
        ? Colors.url
        : Colors.gdl;
  const statusText = isWithdrawal
    ? '#7C3AED'
    : application.status === 'approved'
      ? Colors.fo
      : application.status === 'rejected'
        ? Colors.ur
        : Colors.gd;
  const statusLabel = isWithdrawal
    ? '⏸ Step-down Requested'
    : application.status === 'approved'
      ? '✓ Approved'
      : application.status === 'rejected'
        ? 'Not Selected'
        : '⏳ Pending';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      disabled={!onPress}
      style={[styles.card, { borderLeftColor: borderColor }, style]}
    >
      {/* Top row: center + status badge */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, gap: 2 }}>
          {course && (
            <>
              <Text style={styles.center}>{course.center}</Text>
              <Text style={styles.courseMeta}>
                {course.type} · {course.dates}
              </Text>
            </>
          )}
          {(!application.source || application.source === 'applied') && (
            <Text style={styles.appliedDate}>
              Applied {application.appliedDate}
              {application.queuePosition ? ` · Queue #${application.queuePosition}` : ''}
            </Text>
          )}
        </View>
        <View style={{ gap: 5, alignItems: 'flex-end' }}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: statusText }]}>{statusLabel}</Text>
          </View>
          {application.source === 'assigned' && (
            <View style={styles.assignedBadge}>
              <Text style={styles.assignedBadgeText}>📨 Assigned</Text>
            </View>
          )}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const dotColor = step.warning
            ? '#7C3AED'
            : step.rejected
              ? Colors.ur
              : step.done
                ? Colors.fo
                : Colors.cr3;
          const lineColor = steps[i + 1]?.done ? Colors.fo : Colors.cr3;
          return (
            <View key={i} style={styles.timelineStep}>
              {/* Dot + line */}
              <View style={styles.timelineDotCol}>
                <View
                  style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: dotColor }]}
                >
                  {step.done && !step.rejected && <Text style={styles.timelineCheck}>✓</Text>}
                </View>
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />}
              </View>
              {/* Label */}
              <Text
                style={[
                  styles.timelineLabel,
                  step.done && !step.rejected && { color: Colors.fo, fontWeight: FontWeight.bold },
                  step.rejected && { color: Colors.ur },
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Withdrawal request note */}
      {isWithdrawal && (
        <View style={[styles.reasonBox, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[styles.reasonLabel, { color: '#7C3AED' }]}>
            Step-down request pending admin approval
          </Text>
          {application.withdrawalNote ? (
            <Text style={[styles.reasonText, { color: '#7C3AED' }]}>
              {application.withdrawalNote}
            </Text>
          ) : null}
        </View>
      )}

      {/* Rejection reason */}
      {application.status === 'rejected' && application.rejectionReason && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>{t('applications.rejectionReason')}:</Text>
          <Text style={styles.reasonText}>{application.rejectionReason}</Text>
        </View>
      )}

      {/* View brief link for approved */}
      {application.status === 'approved' && onViewBrief && (
        <TouchableOpacity onPress={onViewBrief} style={styles.briefRow} activeOpacity={0.75}>
          <Text style={styles.briefText}>View pre-course brief →</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Layout.cardPad - 4,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    ...Shadows.card,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  center: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  courseMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
  },
  appliedDate: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  assignedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: '#5B6FA822',
  },
  assignedBadgeText: {
    fontSize: FontSize.xs,
    color: '#5B6FA8',
    fontWeight: FontWeight.semibold,
  },

  // Timeline
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  timelineStep: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineDotCol: {
    alignItems: 'center',
    width: '100%',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineCheck: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    lineHeight: 12,
  },
  timelineLine: {
    position: 'absolute',
    height: 2,
    left: '50%',
    right: '-50%',
    top: 9,
    zIndex: 0,
  },
  timelineLabel: {
    fontSize: 9,
    color: Colors.tx3,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 2,
    lineHeight: 13,
  },

  reasonBox: {
    backgroundColor: Colors.url,
    borderRadius: Radius.sm,
    padding: 10,
    gap: 2,
  },
  reasonLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.ur,
    lineHeight: FontSize.sm * 1.45,
  },

  briefRow: {
    paddingVertical: 4,
  },
  briefText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.gd,
  },
});
