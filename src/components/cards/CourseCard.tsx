import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Course } from '@/types';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { MatchBadge, Chip, ProgressMeter } from '../ui/Badge';
import { useTranslation } from 'react-i18next';

// Course type → emoji
const TYPE_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  '45-Day': '🌲',
  '60-Day': '🏔️',
  '3-Day': '🌸',
  '1-Day': '☸️',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🧒',
  Executive: '💼',
};

// Course type → short label
const TYPE_SHORT: Record<string, string> = {
  '10-Day': '10-Day',
  '20-Day': '20-Day',
  '30-Day': '30-Day',
  '1-Day': '1-Day',
  'Satipatthana Sutta': 'Satipatthana',
  "Children's Anapana": "Children's",
  'Teen Course': 'Teen',
  Executive: 'Executive',
};

interface CourseCardProps {
  course: Course;
  isApplied?: boolean;
  isAssigned?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isApplied,
  isAssigned,
  onPress,
  style,
}) => {
  const { t } = useTranslation();
  const emoji = TYPE_EMOJI[course.type] ?? '🧘';
  const matchScore = course.match ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.card, style]}>
      {/* Top row: type + match */}
      <View style={styles.topRow}>
        <View style={styles.typeRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Chip
            label={TYPE_SHORT[course.type] ?? course.type}
            variant="orange"
            style={styles.typeChip}
          />
          {isApplied && !isAssigned && (
            <Chip label={t('courses.applied')} variant="gold" style={styles.statusChip} />
          )}
          {isAssigned && (
            <Chip label={t('courses.assigned')} variant="green" style={styles.statusChip} />
          )}
        </View>
        {matchScore > 0 && <MatchBadge score={matchScore} />}
      </View>

      {/* Center name */}
      <Text style={styles.center}>{course.center}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>📅 {course.dates}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>
          {course.flag ?? '🇳🇵'} {course.city.split(',')[0]}
        </Text>
      </View>

      {/* Languages */}
      <View style={styles.langRow}>
        {course.languages.map((lang) => (
          <Chip
            key={lang}
            label={
              lang === 'ne' ? 'Nepali' : lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang
            }
            variant="blue"
            style={styles.langChip}
          />
        ))}
        {course.genderRequired !== 'Any' && (
          <Chip label={`${course.genderRequired} AT`} variant="gray" style={styles.langChip} />
        )}
      </View>

      {/* Match meter */}
      {matchScore > 0 && <ProgressMeter value={matchScore} height={4} style={styles.meter} />}
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
    ...Shadows.card,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  emoji: {
    fontSize: 16,
  },
  typeChip: {
    marginRight: 2,
  },
  statusChip: {},
  center: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    fontWeight: FontWeight.medium,
  },
  metaDot: {
    color: Colors.tx3,
    fontSize: FontSize.sm,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  langChip: {},
  meter: {
    marginTop: 2,
  },
});
