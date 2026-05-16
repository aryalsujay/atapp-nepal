/**
 * Confidence pill used in the admin auto-schedule draft cards.
 * 3-tier badge: ✓ High (forest), ⚠ Review (saffron), ✗ None (urgent).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import type { ScheduleConfidence } from '@/data';

const BORDER: Record<ScheduleConfidence, string> = {
  high: Colors.fo,
  review: Colors.sf,
  none: Colors.ur,
};
const BG: Record<ScheduleConfidence, string> = {
  high: Colors.fol,
  review: Colors.sfl,
  none: Colors.url,
};
const LABEL: Record<ScheduleConfidence, string> = {
  high: '✓ High',
  review: '⚠ Review',
  none: '✗ None',
};

export const ConfidencePill: React.FC<{ conf: ScheduleConfidence }> = ({ conf }) => (
  <View style={[styles.pill, { backgroundColor: BG[conf] }]}>
    <Text style={[styles.text, { color: BORDER[conf] }]}>{LABEL[conf]}</Text>
  </View>
);

export const confidenceBorderColor = (conf: ScheduleConfidence): string => BORDER[conf];

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
