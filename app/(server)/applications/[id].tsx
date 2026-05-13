import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverApplications, serverCourses } from '@/data';

const WHAT_TO_BRING = [
  'Comfortable meditation clothing (loose, modest)',
  'Personal toiletries and towel',
  'Any prescribed medication (inform management)',
  'Warm layer for early mornings',
  'Closed-toe shoes for kitchen/compound work',
  'Small torch / flashlight',
  'Valid ID document',
];

export default function ServerAppDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const confirm = useConfirm();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const app = serverApplications.find((a) => a.id === Number(id));
  const course = serverCourses.find((c) => c.id === app?.courseId);

  if (!app || !course) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Application not found.</Text>
      </View>
    );
  }

  const isApproved = app.status === 'approved';
  const isPending = app.status === 'pending';
  const isRejected = app.status === 'rejected';

  const statusColor = isApproved
    ? { bg: Colors.fol, text: Colors.fo }
    : isPending
      ? { bg: Colors.gdl, text: Colors.gd }
      : { bg: Colors.url, text: Colors.ur };

  const toggleCheck = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleWithdraw = () => {
    confirm({
      title: 'Withdraw Application',
      message: 'Are you sure you want to withdraw this application? This cannot be undone.',
      confirmText: 'Withdraw',
      destructive: true,
      onConfirm: () => {
        router.back();
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Applications</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.courseTitle}>{course.center}</Text>
        <Text style={styles.courseType}>
          {course.type} · {course.dates}
        </Text>
        <Text style={styles.appliedOn}>Applied {app.applied}</Text>
      </View>

      <View style={{ paddingHorizontal: Layout.horizontalPad, gap: Spacing.md }}>
        {/* Service areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Areas</Text>
          <View style={styles.areaList}>
            {(app.areas as string[]).map((aId) => {
              const area = SERVICE_AREAS.find((a) => a.id === aId);
              if (!area) return null;
              return (
                <View key={aId} style={[styles.areaRow, { backgroundColor: area.color + '15' }]}>
                  <View style={[styles.areaDot, { backgroundColor: area.color }]} />
                  <Text style={styles.areaLabel}>{area.label}</Text>
                  <Text style={styles.areaNepali}>{area.nepali}</Text>
                </View>
              );
            })}
          </View>
          {app.partial && (
            <View style={styles.partialNote}>
              <Text style={styles.partialNoteText}>Partial availability · {app.days}</Text>
            </View>
          )}
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Arrive By</Text>
              <Text style={styles.detailValue}>{app.arriveBy}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Course Ends</Text>
              <Text style={styles.detailValue}>{course.endDate.slice(5).replace('-', ' ')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Days</Text>
              <Text style={styles.detailValue}>{course.days + 1} days</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Coverage</Text>
              <Text style={styles.detailValue}>
                {app.partial ? (app.days ?? 'Partial') : 'Full course'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status-specific section */}
        {isApproved && (
          <>
            <View style={[styles.section, styles.approvedBanner]}>
              <Text style={styles.approvedTitle}>Coordinator Contact</Text>
              <Text style={styles.approvedName}>{app.coordinator}</Text>
              <Text style={styles.approvedPhone}>{app.coordPhone}</Text>
            </View>

            {/* What to bring checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to Bring</Text>
              <View style={styles.checklist}>
                {WHAT_TO_BRING.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.checkItem}
                    onPress={() => toggleCheck(i)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, checked.has(i) && styles.checkboxChecked]}>
                      {checked.has(i) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkText, checked.has(i) && styles.checkTextDone]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.packingNote}>
                {checked.size}/{WHAT_TO_BRING.length} packed
              </Text>
            </View>
          </>
        )}

        {isPending && (
          <View style={[styles.section, styles.pendingBanner]}>
            <Text style={styles.pendingTitle}>Under Review</Text>
            <Text style={styles.pendingBody}>
              The center manager is reviewing your application. You will be notified once a decision
              is made.
            </Text>
          </View>
        )}

        {isRejected && app.reason && (
          <View style={[styles.section, styles.rejectedBanner]}>
            <Text style={styles.rejectedTitle}>Reason</Text>
            <Text style={styles.rejectedBody}>{app.reason}</Text>
          </View>
        )}

        {/* Withdraw button — only for pending */}
        {isPending && (
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Text style={styles.withdrawBtnText}>Withdraw Application</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cr },
  errorText: { color: Colors.tx3, fontSize: FontSize.md },

  backBtn: {
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: 56,
    paddingBottom: Spacing.sm,
  },
  backText: { fontSize: FontSize.smPlus, color: Colors.sv, fontWeight: FontWeight.semibold },

  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: 6,
  },
  statusBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  courseTitle: { fontSize: FontSize.h2, fontWeight: FontWeight.extrabold, color: Colors.tx },
  courseType: { fontSize: FontSize.smPlus, color: Colors.tx2, fontWeight: FontWeight.medium },
  appliedOn: { fontSize: FontSize.sm, color: Colors.tx3 },

  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.bd,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  areaList: { gap: 6 },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  areaDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  areaLabel: {
    flex: 1,
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
  },
  areaNepali: { fontSize: FontSize.sm, color: Colors.tx3 },
  partialNote: {
    backgroundColor: Colors.gdl,
    borderRadius: Radius.sm,
    padding: 8,
    alignSelf: 'flex-start',
  },
  partialNoteText: { fontSize: FontSize.sm, color: Colors.gd, fontWeight: FontWeight.semibold },

  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', paddingVertical: 6 },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
    marginTop: 2,
  },

  approvedBanner: {
    borderColor: Colors.fom,
    backgroundColor: Colors.fol,
    gap: 3,
  },
  approvedTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  approvedName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.tx },
  approvedPhone: { fontSize: FontSize.smPlus, color: Colors.tx2 },

  checklist: { gap: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.fo, borderColor: Colors.fo },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold },
  checkText: {
    flex: 1,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    lineHeight: FontSize.smPlus * 1.5,
  },
  checkTextDone: { color: Colors.tx3, textDecorationLine: 'line-through' },
  packingNote: {
    fontSize: FontSize.sm,
    color: Colors.fo,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },

  pendingBanner: {
    borderColor: Colors.gdl,
    backgroundColor: Colors.gdl,
    gap: 6,
  },
  pendingTitle: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.gd },
  pendingBody: { fontSize: FontSize.smPlus, color: Colors.tx2, lineHeight: FontSize.smPlus * 1.6 },

  rejectedBanner: {
    borderColor: Colors.url,
    backgroundColor: Colors.url,
    gap: 6,
  },
  rejectedTitle: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.ur },
  rejectedBody: { fontSize: FontSize.smPlus, color: Colors.tx, lineHeight: FontSize.smPlus * 1.6 },

  withdrawBtn: {
    borderWidth: 1.5,
    borderColor: Colors.ur,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  withdrawBtnText: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.ur },
});
