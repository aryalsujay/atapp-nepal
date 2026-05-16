/**
 * TravelCard — three stat tiles (distance · travel hours · altitude) above a
 * transport-mode label and prose line. Empty/zero values are still shown so
 * the prototype's three-tile layout is preserved.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';

interface Props {
  distanceKm?: number;
  travelHrs?: number;
  altitude?: number;
  transport?: string;
  labels: {
    distance: string;
    hrsShort: string;
    altitude: string;
    kmShort: string;
    mAlt: string;
    transportLabel: string;
  };
}

export const TravelCard: React.FC<Props> = ({
  distanceKm,
  travelHrs,
  altitude,
  transport,
  labels,
}) => (
  <View style={styles.card}>
    <View style={styles.travelStatRow}>
      <StatTile value={`${distanceKm ?? 0} ${labels.kmShort}`} label={labels.distance} />
      <StatTile value={`~${travelHrs ?? 0}`} label={labels.hrsShort} />
      <StatTile value={`${altitude ?? 0} ${labels.mAlt}`} label={labels.altitude} />
    </View>
    <Text style={styles.transportLabel}>{labels.transportLabel}</Text>
    <Text style={styles.transportProse}>{transport}</Text>
  </View>
);

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.travelStatTile}>
      <Text style={styles.travelStatValue}>{value}</Text>
      <Text style={styles.travelStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  travelStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  travelStatTile: {
    flex: 1,
    backgroundColor: Colors.cr,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  travelStatValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.tx,
  },
  travelStatLabel: {
    fontSize: 9.5,
    color: Colors.tx3,
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  transportLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    marginBottom: 5,
  },
  transportProse: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 19,
  },
});
