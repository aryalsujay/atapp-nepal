/**
 * ArrivalCard — light-green inset card showing the "arrive by" date/time and
 * a short context line ("Day before course starts…"). Source data comes from
 * the Course's `arrivalDate` + `arrivalTime` fields.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';

interface Props {
  arrivalDate?: string;
  arrivalTime?: string;
  labels: {
    arriveBy: string;
    context: string;
  };
}

export const ArrivalCard: React.FC<Props> = ({ arrivalDate, arrivalTime, labels }) => (
  <View style={[styles.card, styles.arrivalCard]}>
    <Text style={styles.arrivalSublabel}>{labels.arriveBy}</Text>
    <Text style={styles.arrivalValue}>
      {arrivalDate}
      {arrivalTime ? ` · ${arrivalTime}` : ''}
    </Text>
    <Text style={styles.arrivalContext}>{labels.context}</Text>
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
  arrivalCard: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
  },
  arrivalSublabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  arrivalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.fo,
    marginTop: 3,
  },
  arrivalContext: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 4,
    lineHeight: 17,
  },
});
