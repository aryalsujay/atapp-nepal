/**
 * 8-chip "Matching criteria" row above the draft list in auto-schedule.
 * 4 per row (width 22.7%, gap 5).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

const CRITERIA = [
  'Language',
  'Location',
  'Availability',
  'Festival blocks',
  'Rest gap',
  'Course type',
  'Gender',
  'Travel distance',
];

export const MatchingCriteriaChips: React.FC = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('admin.schedule.criteria')}</Text>
      <View style={styles.chips}>
        {CRITERIA.map((c) => (
          <View key={c} style={styles.chip}>
            <Text numberOfLines={1} style={styles.chipText}>
              {c}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx2,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    fontFamily: FontFamily.sansBold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    width: '22.7%',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.fo,
    fontFamily: FontFamily.sansSemiBold,
  },
});
