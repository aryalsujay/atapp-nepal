import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AvailabilityState } from '@/types';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

interface AvailabilityCalendarProps {
  availability: AvailabilityState[];
  editable?: boolean;
  onToggle?: (index: number) => void;
  style?: ViewStyle;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  editable = false,
  onToggle,
  style,
}) => {
  const { t } = useTranslation();

  const getCellStyle = (state: AvailabilityState) => {
    if (state === 1) return { bg: Colors.fo, text: Colors.white };
    if (state === 'f') return { bg: Colors.gdl, text: Colors.gd };
    return { bg: Colors.cr3, text: Colors.tx3 };
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {availability.map((state, idx) => {
          const cs = getCellStyle(state);
          const label = t(`months.${MONTH_KEYS[idx]}`);
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => editable && onToggle?.(idx)}
              activeOpacity={editable ? 0.7 : 1}
              style={[styles.cell, { backgroundColor: cs.bg }]}
            >
              <Text style={[styles.cellText, { color: cs.text }]}>{label}</Text>
              {state === 'f' && <Text style={styles.festIcon}>✦</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.fo }]} />
          <Text style={styles.legendText}>{t('onboarding.teacher.step4.available')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.gd }]} />
          <Text style={styles.legendText}>{t('onboarding.teacher.step4.festival')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.cr3 }]} />
          <Text style={styles.legendText}>{t('onboarding.teacher.step4.unavailable')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: '14%',
    minWidth: 44,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  cellText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  festIcon: {
    fontSize: 7,
    color: Colors.gd,
    marginTop: 1,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
});
