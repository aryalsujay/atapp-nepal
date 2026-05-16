/**
 * StepDownAction — bottom action for the Course Brief screen. Renders either
 * the outline "step down" CTA or a green "sent" confirmation badge once the
 * withdrawal request has been submitted.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/colors';

interface Props {
  sent: boolean;
  onPress: () => void;
  labels: {
    cta: string;
    sent: string;
  };
}

export const StepDownAction: React.FC<Props> = ({ sent, onPress, labels }) => (
  <View style={styles.stepDownWrap}>
    {sent ? (
      <View style={styles.sentBadge}>
        <Text style={styles.sentBadgeText}>✓ {labels.sent}</Text>
      </View>
    ) : (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.outlineBtn}>
        <Text style={styles.outlineBtnText}>{labels.cta}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  stepDownWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
  },
  sentBadge: {
    backgroundColor: Colors.fol,
    borderWidth: 1,
    borderColor: Colors.fom,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sentBadgeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.fo,
  },
});
