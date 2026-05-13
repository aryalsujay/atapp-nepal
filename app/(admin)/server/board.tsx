import React, { useState } from 'react';
import {
  DimensionValue,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverCourses } from '@/data';

const MOCK_ASSIGNMENTS: Record<number, Record<string, string[]>> = {
  1: {
    kitchen: ['Priya Thapa', 'Maya Rai'],
    dining: ['Sita Karki'],
    dhamma: ['Anita Shrestha', 'Gita Malla'],
    compound: ['Ram Bahadur'],
    reception: ['Bindu Tamang'],
    at_assist: [],
    manager: ['Dev Adhikari'],
    residence: ['Kamala Bist'],
  },
  2: {
    kitchen: ['Priya Thapa'],
    dining: ['Maya Rai', 'Laxmi Devi'],
    dhamma: [],
    compound: ['Bikram KC'],
    reception: [],
    at_assist: ['Sarita Pun'],
    manager: [],
    residence: ['Hira Tamang'],
  },
};

export default function AdminServerBoard() {
  const toast = useToast();
  const [selectedCourse, setSelectedCourse] = useState(serverCourses[0].id);
  const course = serverCourses.find((c) => c.id === selectedCourse)!;
  const assignments = MOCK_ASSIGNMENTS[selectedCourse] ?? {};

  const totalFilled = Object.values(assignments).reduce((s, arr) => s + arr.length, 0);
  const capacity = course.total;

  const handleAssign = (areaId: string) => {
    toast.info(`Manually assign a server to ${areaId} — coming soon.`, 'Assign Server');
  };

  const handleViewApplicants = (areaId: string) => {
    toast.info(`Applicants for ${areaId} area — open inbox filtered.`, 'View Applicants');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <SectionHeader title="Server Board" style={styles.header} />
      <Text style={styles.subtitle}>Slot coverage per course</Text>

      {/* Course selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courseScroll}
      >
        {serverCourses.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCourse(c.id)}
            style={[styles.courseChip, selectedCourse === c.id && styles.courseChipActive]}
          >
            <Text
              style={[
                styles.courseChipText,
                selectedCourse === c.id && styles.courseChipTextActive,
              ]}
              numberOfLines={1}
            >
              {c.center.replace('Dhamma ', '')} · {c.type}
            </Text>
            <Text style={[styles.courseChipDate, selectedCourse === c.id && { color: Colors.bll }]}>
              {c.dates}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalFilled}</Text>
          <Text style={styles.summaryLabel}>Assigned</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{capacity - totalFilled}</Text>
          <Text style={styles.summaryLabel}>Open Slots</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{capacity}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (totalFilled / capacity) * 100)}%` as DimensionValue },
              ]}
            />
          </View>
          <Text style={styles.progressPct}>{Math.round((totalFilled / capacity) * 100)}%</Text>
        </View>
      </View>

      {/* Area cards */}
      <View style={{ paddingHorizontal: Layout.horizontalPad, gap: 10, marginTop: Spacing.md }}>
        {SERVICE_AREAS.filter((a) => (course.areas as string[]).includes(a.id)).map((area) => {
          const assigned = assignments[area.id] ?? [];
          const isFull = assigned.length >= 3;
          return (
            <View key={area.id} style={styles.areaCard}>
              <View style={styles.areaHeader}>
                <View style={[styles.areaTag, { backgroundColor: area.color + '22' }]}>
                  <Text style={styles.areaTagText}>{area.label}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    isFull
                      ? { backgroundColor: Colors.fol }
                      : assigned.length > 0
                        ? { backgroundColor: Colors.gdl }
                        : { backgroundColor: Colors.url },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isFull
                        ? { color: Colors.fo }
                        : assigned.length > 0
                          ? { color: Colors.gd }
                          : { color: Colors.ur },
                    ]}
                  >
                    {isFull
                      ? 'Filled'
                      : assigned.length > 0
                        ? `${assigned.length} assigned`
                        : 'Open'}
                  </Text>
                </View>
              </View>

              {assigned.length > 0 && (
                <View style={styles.assignedList}>
                  {assigned.map((name) => (
                    <View key={name} style={styles.assignedPill}>
                      <Text style={styles.assignedPillText}>{name}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.areaActions}>
                <TouchableOpacity
                  style={[styles.areaBtn, { backgroundColor: Colors.bll }]}
                  onPress={() => handleViewApplicants(area.id)}
                >
                  <Text style={[styles.areaBtnText, { color: Colors.bl }]}>View Applicants</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.areaBtn, { backgroundColor: Colors.fo + '22' }]}
                  onPress={() => handleAssign(area.id)}
                >
                  <Text style={[styles.areaBtnText, { color: Colors.fo }]}>+ Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
  },
  courseScroll: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  courseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    minWidth: 120,
  },
  courseChipActive: {
    backgroundColor: Colors.bl,
    borderColor: Colors.bl,
  },
  courseChipText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    textAlign: 'center',
  },
  courseChipTextActive: { color: Colors.white },
  courseChipDate: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    textAlign: 'center',
    marginTop: 2,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: Spacing.sm,
    gap: 0,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.tx3 },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.bd },
  progressWrap: { flex: 2, paddingLeft: 12, gap: 4 },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.cr2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.bl,
    borderRadius: 3,
  },
  progressPct: { fontSize: FontSize.xs, color: Colors.tx2, fontWeight: FontWeight.semibold },

  areaCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    gap: 10,
    ...Shadows.card,
  },
  areaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  areaTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  areaTagText: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.tx },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  assignedList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  assignedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cr2,
    borderRadius: Radius.full,
  },
  assignedPillText: { fontSize: FontSize.xs, color: Colors.tx2 },

  areaActions: { flexDirection: 'row', gap: 8 },
  areaBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  areaBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
