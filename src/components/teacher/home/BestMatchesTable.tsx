/**
 * Tabular view of the home "Best Matches" section — implements
 * `specs/04-teacher-home.md` §3.5b. Mirrors `CoursesTable`: header row,
 * scrollable left columns (Match · Type · Centre · Dates · Langs · Need),
 * and a sticky `→` column on the right that is always visible.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { MatchBadge } from '@/components/ui/MatchPill';
import { langLabel } from '@/utils/eligibility';
import type { Course } from '@/types';

const TYPE_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  '45-Day': '🌲',
  '60-Day': '🏔️',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🧒',
  Executive: '💼',
  '1-Day': '☸️',
  '3-Day': '🌸',
};

function shortCenterName(name: string): string {
  return name.replace(/^(Dhamma|Dharma) /, '');
}

interface Props {
  courses: Course[];
  onRowPress: (course: Course) => void;
  labels: {
    headerMatch: string;
    headerType: string;
    headerCentre: string;
    headerDates: string;
    headerLangs: string;
    headerNeed: string;
  };
}

const COL = {
  match: 58,
  type: 92,
  centre: 130,
  dates: 100,
  langs: 76,
  need: 50,
} as const;

const STICKY_GO_WIDTH = 44;
const MIN_ROW_HEIGHT = 64;
const SCROLL_AREA_WIDTH = Object.values(COL).reduce((a, b) => a + b, 0);

export function BestMatchesTable({ courses, onRowPress, labels }: Props) {
  return (
    <View style={styles.outer}>
      <View style={styles.tableRowWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollPane}>
          <View style={{ width: SCROLL_AREA_WIDTH }}>
            <View style={styles.headerRow}>
              <HeaderCell label={labels.headerMatch} width={COL.match} />
              <HeaderCell label={labels.headerType} width={COL.type} />
              <HeaderCell label={labels.headerCentre} width={COL.centre} />
              <HeaderCell label={labels.headerDates} width={COL.dates} />
              <HeaderCell label={labels.headerLangs} width={COL.langs} />
              <HeaderCell label={labels.headerNeed} width={COL.need} align="right" last />
            </View>
            {courses.map((c, i) => (
              <ScrollRow
                key={c.id}
                course={c}
                isLast={i === courses.length - 1}
                onPress={() => onRowPress(c)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.stickyPane}>
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: STICKY_GO_WIDTH, alignItems: 'center' }]} />
          </View>
          {courses.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => onRowPress(c)}
              activeOpacity={0.75}
              style={[
                styles.row,
                styles.stickyRow,
                i === courses.length - 1 && styles.rowLast,
                { width: STICKY_GO_WIDTH },
              ]}
            >
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function HeaderCell({
  label,
  width,
  align = 'left',
  last = false,
}: {
  label: string;
  width: number;
  align?: 'left' | 'right' | 'center';
  last?: boolean;
}) {
  const justify = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  return (
    <View style={[styles.headerCell, { width, alignItems: justify }, !last && styles.cellDivider]}>
      <Text style={styles.headerText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ScrollRow({
  course,
  isLast,
  onPress,
}: {
  course: Course;
  isLast: boolean;
  onPress: () => void;
}) {
  const emoji = TYPE_EMOJI[course.type] ?? '🪷';
  const langs = (course.languages ?? []).map(langLabel).join(', ');
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.row, isLast && styles.rowLast]}>
        <View style={[styles.cell, styles.cellDivider, { width: COL.match }]}>
          <MatchBadge score={course.match ?? 0} compact />
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COL.type }]}>
          <View style={styles.typeRow}>
            <Text style={styles.typeEmoji}>{emoji}</Text>
            <View style={styles.typePill}>
              <Text style={styles.typePillText} numberOfLines={1}>
                {course.type}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COL.centre }]}>
          <Text style={styles.primaryText} numberOfLines={1}>
            {shortCenterName(course.center)}
          </Text>
          {course.city ? (
            <Text style={styles.subText} numberOfLines={1}>
              {course.city} {course.flag ?? ''}
            </Text>
          ) : null}
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COL.dates }]}>
          <Text style={styles.bodyText} numberOfLines={2}>
            {course.dates}
          </Text>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COL.langs }]}>
          <Text style={styles.bodyText} numberOfLines={2}>
            {langs || '—'}
          </Text>
        </View>
        <View style={[styles.cell, styles.cellRight, { width: COL.need }]}>
          <Text style={styles.needCount}>{course.needCount ?? 1}</Text>
          <Text style={styles.needLabel}>AT</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 18,
    marginBottom: 11,
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadows.card,
  },
  tableRowWrap: {
    flexDirection: 'row',
  },
  scrollPane: {
    flex: 1,
  },
  stickyPane: {
    width: STICKY_GO_WIDTH,
    borderLeftWidth: 1,
    borderLeftColor: Colors.bd,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cr2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    minHeight: 32,
  },
  headerCell: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  row: {
    flexDirection: 'row',
    minHeight: MIN_ROW_HEIGHT,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    alignItems: 'stretch',
  },
  stickyRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  cellDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.bd,
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeEmoji: { fontSize: 13 },
  typePill: {
    backgroundColor: Colors.sfl,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexShrink: 1,
  },
  typePillText: {
    fontSize: 10.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sfd,
  },
  primaryText: {
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx,
  },
  bodyText: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
  },
  subText: {
    fontSize: 10.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  needCount: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.sfd,
  },
  needLabel: {
    fontSize: 9,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: Colors.tx3,
    fontWeight: '600',
  },
});
