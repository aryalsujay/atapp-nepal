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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useToast } from '@/components/ui/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverCourses as serverCoursesData } from '@/data';

const SV_GRADIENT: [string, string, string] = ['#5A3800', '#8B5E14', '#C8900A'];

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.min(filled / total, 1) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` as DimensionValue }]} />
    </View>
  );
}

export default function OpportunityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const course = serverCoursesData.find((c) => String(c.id) === id);

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [partial, setPartial] = useState(false);
  const [fromDay, setFromDay] = useState(1);
  const [toDay, setToDay] = useState(course?.days ?? 10);
  const [submitted, setSubmitted] = useState(false);

  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.cr,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.tx3 }}>Course not found.</Text>
      </View>
    );
  }

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId],
    );
  };

  const handleApply = () => {
    if (selectedAreas.length === 0) {
      toast.warning('Please select at least one service area to apply.', 'Select an area');
      return;
    }
    setSubmitted(true);
  };

  const open = course.total - course.filled;

  if (submitted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.cr,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Layout.horizontalPad,
        }}
      >
        <Text style={styles.successIcon}>🙏</Text>
        <Text style={styles.successTitle}>Application Submitted!</Text>
        <Text style={styles.successBody}>
          Your application to serve at {course.center} has been sent. The coordinator will review
          and notify you. Sadhu!
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace(Routes.serverApplications)}
        >
          <Text style={styles.backBtnText}>View My Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: Colors.cr2, marginTop: 8 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: Colors.tx2 }]}>Back to Opportunities</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero gradient header */}
        <LinearGradient
          colors={SV_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
            <Text style={styles.backArrowText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heroCenter}>
            {course.center} {course.flag}
          </Text>
          <Text style={styles.heroCity}>{course.city}</Text>
          <Text style={styles.heroDates}>📅 {course.dates}</Text>

          {/* Quick stat chips */}
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{course.type}</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{course.days} days</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{course.altitude}m alt.</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="Total Slots" value={String(course.total)} />
          <StatBox label="Filled" value={String(course.filled)} />
          <StatBox label="Open" value={String(open)} highlight={open > 0} />
          <StatBox label="Days" value={String(course.days)} />
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slots Filled</Text>
          <View style={styles.progressRow}>
            <ProgressBar filled={course.filled} total={course.total} />
            <Text style={styles.progressLabel}>
              {course.filled}/{course.total}
            </Text>
          </View>
          <Text style={styles.genderSlotsText}>
            {course.mServers} male · {course.fServers} female
          </Text>
        </View>

        {/* Arrive by */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrival</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Arrive by</Text>
            <Text style={styles.infoValue}>{course.arriveBy}</Text>
          </View>
        </View>

        {/* Area selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service Areas</Text>
          <Text style={styles.sectionHint}>Tap to select the areas you want to serve in.</Text>
          <View style={styles.areaGrid}>
            {course.areas.map((areaId) => {
              const area = SERVICE_AREAS.find((a) => a.id === areaId);
              if (!area) return null;
              const isSelected = selectedAreas.includes(areaId);
              return (
                <TouchableOpacity
                  key={areaId}
                  onPress={() => toggleArea(areaId)}
                  style={[styles.areaOption, isSelected && styles.areaOptionSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.areaOptionEmoji}>{area.emoji}</Text>
                  <Text
                    style={[styles.areaOptionLabel, isSelected && styles.areaOptionLabelSelected]}
                  >
                    {area.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Partial availability toggle */}
        <View style={styles.section}>
          <View style={styles.partialRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Partial Availability</Text>
              <Text style={styles.sectionHint}>Serve only certain days of the course.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPartial((v) => !v)}
              style={[styles.toggle, partial && styles.toggleActive]}
            >
              <View style={[styles.toggleThumb, partial && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {partial && (
            <View style={styles.dayRangeBox}>
              <Text style={styles.dayRangeLabel}>Serve days:</Text>
              <View style={styles.dayRangeRow}>
                <View style={styles.dayInput}>
                  <TouchableOpacity
                    onPress={() => setFromDay((v) => Math.max(1, v - 1))}
                    style={styles.dayBtn}
                  >
                    <Text style={styles.dayBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.dayValue}>Day {fromDay}</Text>
                  <TouchableOpacity
                    onPress={() => setFromDay((v) => Math.min(toDay, v + 1))}
                    style={styles.dayBtn}
                  >
                    <Text style={styles.dayBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.toText}>to</Text>
                <View style={styles.dayInput}>
                  <TouchableOpacity
                    onPress={() => setToDay((v) => Math.max(fromDay, v - 1))}
                    style={styles.dayBtn}
                  >
                    <Text style={styles.dayBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.dayValue}>Day {toDay}</Text>
                  <TouchableOpacity
                    onPress={() => setToDay((v) => Math.min(course.days, v + 1))}
                    style={styles.dayBtn}
                  >
                    <Text style={styles.dayBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.dayRangeSummary}>
                Serving {toDay - fromDay + 1} of {course.days} days (Day {fromDay}–{toDay})
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply button (floating) */}
      <View style={[styles.applyFooter, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.applyBtn, selectedAreas.length === 0 && styles.applyBtnDisabled]}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>
            {selectedAreas.length === 0
              ? 'Select an area to apply'
              : `Apply to Serve (${selectedAreas.length} area${selectedAreas.length > 1 ? 's' : ''})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statBox, highlight && { backgroundColor: Colors.svl }]}>
      <Text style={[styles.statBoxValue, highlight && { color: Colors.sv }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.xxl,
  },
  backArrow: {
    marginBottom: Spacing.lg,
  },
  backArrowText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },
  heroCenter: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  heroCity: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
  },
  heroDates: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.semibold,
    marginTop: 6,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 7,
    marginTop: Spacing.md,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  heroChipText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Layout.horizontalPad,
    marginTop: -20,
    gap: 7,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  statBoxValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  section: {
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  sectionHint: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.cr3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sv,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.semibold,
    minWidth: 44,
    textAlign: 'right',
  },
  genderSlotsText: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.semibold,
  },
  infoValue: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.bold,
  },

  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  areaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.cr,
  },
  areaOptionSelected: {
    backgroundColor: Colors.svl,
    borderColor: Colors.sv,
  },
  areaOptionEmoji: { fontSize: 14 },
  areaOptionLabel: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  areaOptionLabelSelected: {
    color: Colors.sv,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.sv,
    fontWeight: FontWeight.bold,
    marginLeft: 2,
  },

  partialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.cr3,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: Colors.sv },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },

  dayRangeBox: {
    backgroundColor: Colors.svl,
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
  },
  dayRangeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.sv,
  },
  dayRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dayInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  dayBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: Colors.cr2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.tx2,
  },
  dayValue: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    minWidth: 46,
    textAlign: 'center',
  },
  toText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  dayRangeSummary: {
    fontSize: FontSize.sm,
    color: Colors.sv,
    fontWeight: FontWeight.semibold,
  },

  applyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: 12,
  },
  applyBtn: {
    backgroundColor: Colors.sv,
    borderRadius: Radius.lg,
    paddingVertical: Layout.buttonPadV,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  applyBtnDisabled: {
    backgroundColor: Colors.cr3,
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  successIcon: { fontSize: 64, marginBottom: Spacing.lg },
  successTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successBody: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    textAlign: 'center',
    lineHeight: FontSize.smPlus * 1.6,
    marginBottom: Spacing.xxl,
  },
  backBtn: {
    backgroundColor: Colors.sv,
    borderRadius: Radius.lg,
    paddingVertical: Layout.buttonPadV,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
