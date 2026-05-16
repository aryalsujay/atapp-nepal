/**
 * SectionHeader — uppercase tracked label used between each card section on
 * the Teacher Course Brief screen. Single Text wrapper so the parent screen
 * doesn't need to repeat the same style block per section.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors } from '@/theme/colors';

export const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionHeader}>{children}</Text>
);

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
});
