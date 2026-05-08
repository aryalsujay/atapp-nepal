import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { FadeInView } from '../../../src/components/ui/FadeInView';
import { SERVICE_AREAS } from '../../../src/data/serviceAreas';
import serverCoursesData from '../../../src/data/serverCourses.json';

type CourseEntry = typeof serverCoursesData[number];

const totalOpen = serverCoursesData.reduce((acc, c) => acc + (c.total - c.filled), 0);

function AreaChip({ areaId }: { areaId: string }) {
  const area = SERVICE_AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return (
    <View style={[styles.areaChip, { backgroundColor: Colors.svl }]}>
      <Text style={styles.areaChipText}>{area.emoji} {area.label}</Text>
    </View>
  );
}

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.min(filled / total, 1) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
    </View>
  );
}

export default function OpportunitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeArea, setActiveArea] = useState<string>('all');

  const filtered: CourseEntry[] = activeArea === 'all'
    ? serverCoursesData
    : serverCoursesData.filter((c) => c.areas.includes(activeArea));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Serve a Course</Text>
        <Text style={styles.headerSubtitle}>Nepal Vipassana Centers · {totalOpen} open slots</Text>
      </View>

      {/* Filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, activeArea === 'all' && styles.filterChipActive]}
          onPress={() => setActiveArea('all')}
        >
          <Text style={[styles.filterChipText, activeArea === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {SERVICE_AREAS.map((area) => (
          <TouchableOpacity
            key={area.id}
            style={[styles.filterChip, activeArea === area.id && styles.filterChipActive]}
            onPress={() => setActiveArea(area.id)}
          >
            <Text style={[styles.filterChipText, activeArea === area.id && styles.filterChipTextActive]}>
              {area.emoji} {area.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110, paddingTop: 4 }}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No courses need this area right now.</Text>
          </View>
        )}
        {filtered.map((course, i) => {
          const open = course.total - course.filled;
          return (
            <FadeInView key={course.id} delay={60 + i * 50}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/(server)/opportunities/${course.id}`)}
              >
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.centerName}>{course.center} {course.flag}</Text>
                    <Text style={styles.cityMeta}>{course.city}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{course.type}</Text>
                  </View>
                </View>

                {/* Dates */}
                <Text style={styles.dates}>📅 {course.dates} · {course.days} days</Text>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <ProgressBar filled={course.filled} total={course.total} />
                  <Text style={styles.progressLabel}>{course.filled}/{course.total}</Text>
                </View>

                {/* Slot info */}
                <View style={styles.slotRow}>
                  <View style={[styles.openBadge, open === 0 && { backgroundColor: Colors.cr2 }]}>
                    <Text style={[styles.openText, open === 0 && { color: Colors.tx3 }]}>
                      {open > 0 ? `${open} open` : 'Full'}
                    </Text>
                  </View>
                  <Text style={styles.genderText}>{course.mServers}m + {course.fServers}f slots</Text>
                </View>

                {/* Area chips */}
                <View style={styles.chipRow}>
                  {course.areas.slice(0, 5).map((a) => <AreaChip key={a} areaId={a} />)}
                  {course.areas.length > 5 && (
                    <View style={styles.areaChip}>
                      <Text style={styles.areaChipText}>+{course.areas.length - 5}</Text>
                    </View>
                  )}
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push(`/(server)/opportunities/${course.id}`)}
                >
                  <Text style={styles.viewBtnText}>View Details →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cr,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  headerTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
  },
  headerSubtitle: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    marginTop: 2,
  },

  filterScroll: {
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: Spacing.sm,
    gap: 7,
    backgroundColor: Colors.cr,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
  },
  filterChipActive: {
    backgroundColor: Colors.sv,
    borderColor: Colors.sv,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  empty: {
    alignItems: 'center',
    padding: 48,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.md, color: Colors.tx3 },

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  centerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  cityMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.svl,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.sv,
  },
  dates: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    fontWeight: FontWeight.medium,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sv,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
    minWidth: 40,
    textAlign: 'right',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  openBadge: {
    backgroundColor: Colors.url,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  openText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },
  genderText: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  areaChip: {
    backgroundColor: Colors.svl,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  areaChipText: {
    fontSize: FontSize.xs,
    color: Colors.sv,
    fontWeight: FontWeight.semibold,
  },
  viewBtn: {
    borderWidth: 1.5,
    borderColor: Colors.sv,
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 4,
  },
  viewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.sv,
  },
});
