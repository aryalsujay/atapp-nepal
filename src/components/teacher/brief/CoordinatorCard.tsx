/**
 * CoordinatorCard — administrator/coordinator contact card. Shows clipboard
 * emoji avatar, the coordinator name and role, and a tap-to-call phone row
 * when a phone number is present.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import type { Course } from '@/types';

interface Props {
  coordinator: Course['coordinator'];
  onCall: (phone: string) => void;
  callLabel: string;
}

export const CoordinatorCard: React.FC<Props> = ({ coordinator, onCall, callLabel }) => (
  <View style={styles.card}>
    <View style={styles.coTeacherRow}>
      <View style={styles.coordinatorAvatar}>
        <Text style={{ fontSize: 18 }}>📋</Text>
      </View>
      <View style={styles.coTeacherMid}>
        <Text style={styles.coTeacherName}>{coordinator.name}</Text>
        <Text style={styles.coTeacherSub}>{coordinator.role}</Text>
      </View>
    </View>
    {coordinator.phone ? (
      <TouchableOpacity
        onPress={() => onCall(coordinator.phone ?? '')}
        activeOpacity={0.7}
        style={styles.phoneRow}
      >
        <Text style={styles.phoneText}>📞 {coordinator.phone}</Text>
        <Text style={[styles.callLink, { color: Colors.sf }]}>{callLabel}</Text>
      </TouchableOpacity>
    ) : null}
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
  coTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coordinatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coTeacherMid: { flex: 1 },
  coTeacherName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.tx,
  },
  coTeacherSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 1,
  },
  phoneRow: {
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.cr,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneText: {
    fontSize: 12.5,
    color: Colors.tx2,
  },
  callLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
