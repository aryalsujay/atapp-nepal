/**
 * `<DashedDivider />` — horizontal dashed line for in-card separators.
 *
 * Why a custom component instead of `borderTopWidth: 1, borderStyle: 'dashed'`:
 * RN renders a top-only dashed border as a solid line (or nothing) on web +
 * iOS. The outer-overflow-hidden + inner-fully-bordered View trick below
 * renders a clean dashed line on every platform.
 *
 * Adopted by both spec 06 (course detail "AT Pair" → "Looking for") and
 * spec 08 (applications card "🛬 arrival · View Brief" footer).
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/theme/colors';

interface DashedDividerProps {
  /** Vertical margin above + below the line. Defaults to 12. */
  marginVertical?: number;
  /** Override the dash colour. Defaults to `Colors.bd`. */
  color?: string;
}

export function DashedDivider({ marginVertical = 12, color = Colors.bd }: DashedDividerProps) {
  return (
    <View style={[styles.outer, { marginVertical }]}>
      <View style={[styles.inner, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    height: 1,
    overflow: 'hidden',
  },
  inner: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
});
