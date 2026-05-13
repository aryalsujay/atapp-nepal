import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Chip } from '@/components/ui/Badge';
import { courses as coursesData } from '@/data';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Color per course type
const TYPE_COLOR: Record<string, string> = {
  '10-Day': Colors.sf, // saffron
  '20-Day': '#2A7A3A', // deeper green
  '30-Day': '#166534', // forest
  '45-Day': '#0891b2', // teal
  '60-Day': '#0e7490', // dark teal
  '3-Day': Colors.fo, // green
  '1-Day': Colors.gd, // gold
  'Satipatthana Sutta': '#7c3aed', // purple
  "Children's Anapana": '#f59e0b', // amber
  'Teen Course': '#d97706', // orange-amber
  Executive: '#475569', // slate
};

function typeColor(type: string): string {
  return TYPE_COLOR[type] ?? Colors.tx3;
}

interface CalendarCourse {
  id: number;
  type: string;
  center: string;
  dates: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function AdminCalendar() {
  const { t } = useTranslation();
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const courses = coursesData as CalendarCourse[];

  // Which days in the current month have courses?
  const dayMap = useMemo(() => {
    const map: Record<number, CalendarCourse[]> = {};
    courses.forEach((c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      // Mark every day from start to end that falls in current month/year
      const cur = new Date(start);
      while (cur <= end) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          const d = cur.getDate();
          if (!map[d]) map[d] = [];
          // Only add once per course per start day to avoid duplicates in list
          if (!map[d].find((x) => x.id === c.id)) map[d].push(c);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [courses, year, month]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  // Courses to show in the list below: either for selected day or all this month
  const listedCourses = useMemo(() => {
    if (selectedDay !== null) {
      return dayMap[selectedDay] ?? [];
    }
    // Unique courses spanning this month
    const seen = new Set<number>();
    const result: CalendarCourse[] = [];
    Object.values(dayMap)
      .flat()
      .forEach((c) => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          result.push(c);
        }
      });
    return result.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [dayMap, selectedDay]);

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title={t('admin.calendar.title')} style={styles.header} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Month nav */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar card */}
        <View style={styles.calCard}>
          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={styles.weekday}>
                {d}
              </Text>
            ))}
          </View>

          {/* Day grid */}
          {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
            <View key={rowIdx} style={styles.weekRow}>
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                const hasCourses = day !== null && !!dayMap[day]?.length;
                const isSelected = day !== null && day === selectedDay;
                const dots = day !== null ? (dayMap[day] ?? []).slice(0, 3) : [];

                return (
                  <TouchableOpacity
                    key={colIdx}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isToday(day!) && !isSelected && styles.dayCellToday,
                    ]}
                    onPress={() => day !== null && setSelectedDay(isSelected ? null : day)}
                    activeOpacity={day !== null ? 0.7 : 1}
                    disabled={day === null}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        isSelected && styles.dayNumSelected,
                        isToday(day!) && !isSelected && styles.dayNumToday,
                        day === null && { opacity: 0 },
                      ]}
                    >
                      {day ?? ''}
                    </Text>
                    {hasCourses && (
                      <View style={styles.dotsRow}>
                        {dots.map((c, i) => (
                          <View
                            key={i}
                            style={[styles.dot, { backgroundColor: typeColor(c.type) }]}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legend}
        >
          {Object.entries(TYPE_COLOR).map(([type, color]) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{type}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Course list */}
        <SectionHeader
          title={
            selectedDay !== null
              ? `${MONTHS[month]} ${selectedDay}`
              : `All courses — ${MONTHS[month]}`
          }
          action={selectedDay !== null ? 'Clear' : undefined}
          onAction={() => setSelectedDay(null)}
        />

        {listedCourses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No courses this {selectedDay !== null ? 'day' : 'month'}
            </Text>
          </View>
        ) : (
          listedCourses.map((course) => (
            <View
              key={course.id}
              style={[styles.courseCard, { borderLeftColor: typeColor(course.type) }]}
            >
              <View style={styles.courseTop}>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseType, { color: typeColor(course.type) }]}>
                    {course.type}
                  </Text>
                  <Text style={styles.courseCenter}>{course.center}</Text>
                  <Text style={styles.courseDates}>📅 {course.dates}</Text>
                </View>
                <View style={styles.courseRight}>
                  <Chip
                    label={
                      course.status === 'open'
                        ? 'Open'
                        : course.status === 'waitlist'
                          ? 'Waitlist'
                          : course.status === 'not_yet_open'
                            ? 'Upcoming'
                            : 'Closed'
                    }
                    variant={
                      course.status === 'open'
                        ? 'orange'
                        : course.status === 'waitlist'
                          ? 'gold'
                          : course.status === 'not_yet_open'
                            ? 'gray'
                            : 'red'
                    }
                  />
                  <TouchableOpacity
                    onPress={() => router.push(Routes.adminSchedule)}
                    style={styles.scheduleBtn}
                  >
                    <Text style={styles.scheduleBtnText}>Assign →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  scroll: { paddingBottom: 24 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: Spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  navArrow: {
    fontSize: 22,
    color: Colors.tx,
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },

  calCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: Radius.sm,
    gap: 2,
    minHeight: 44,
  },
  dayCellSelected: {
    backgroundColor: Colors.bl,
  },
  dayCellToday: {
    backgroundColor: Colors.bll,
  },
  dayNum: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.medium,
    color: Colors.tx,
  },
  dayNumSelected: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  dayNumToday: {
    color: Colors.bl,
    fontWeight: FontWeight.bold,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  legend: {
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: Spacing.sm,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },

  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.tx3,
  },

  courseCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 4,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  courseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseInfo: { flex: 1, gap: 3 },
  courseType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseCenter: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  courseDates: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  courseRight: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  scheduleBtn: {
    backgroundColor: Colors.bll,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  scheduleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },
});
