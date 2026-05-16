/**
 * StudentsCard — expected student count plus a male/female split bar where
 * each segment's flex is proportional to that gender's count. Tiny floor of
 * 0.001 keeps a zero-count side from collapsing entirely.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import type { Course } from '@/types';

interface Props {
  students: Course['students'];
  labels: {
    word: string;
    splitLabel: string;
  };
}

export const StudentsCard: React.FC<Props> = ({ students, labels }) => (
  <View style={styles.card}>
    <View style={styles.studentsTopRow}>
      <Text style={styles.studentsCount}>{students.expected}</Text>
      <Text style={styles.studentsWord}>{labels.word}</Text>
    </View>
    <Text style={styles.studentsSplitLabel}>{labels.splitLabel}</Text>
    <View style={styles.splitBar}>
      <View style={[styles.splitBarMale, { flex: Math.max(students.male, 0.001) }]}>
        <Text style={styles.splitBarText}>♂ {students.male}</Text>
      </View>
      <View style={[styles.splitBarFemale, { flex: Math.max(students.female, 0.001) }]}>
        <Text style={styles.splitBarText}>♀ {students.female}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  studentsTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
  },
  studentsCount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.tx,
  },
  studentsWord: {
    fontSize: 12,
    color: Colors.tx2,
  },
  studentsSplitLabel: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 6,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  splitBar: {
    flexDirection: 'row',
    gap: 6,
    height: 32,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.cr3,
  },
  splitBarMale: {
    backgroundColor: Colors.bl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBarFemale: {
    backgroundColor: '#C8527A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBarText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
