/**
 * Segmented control toggling between "cards" and "table" list views.
 *
 * Used on the teacher home Best Matches section (spec 04 §3.4) and on the
 * teacher Courses browse screen (spec 05 §3.2a). State is persisted per
 * screen in `settingsStore` (`coursesViewMode`, `homeMatchesViewMode`).
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';

import type { ViewMode } from '@/store/settingsStore';

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
  cardsLabel: string;
  tableLabel: string;
  compact?: boolean;
}

export function ViewToggle({ value, onChange, cardsLabel, tableLabel, compact = false }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Segment
        active={value === 'cards'}
        onPress={() => value !== 'cards' && onChange('cards')}
        glyph="▦"
        a11y={cardsLabel}
        compact={compact}
      />
      <Segment
        active={value === 'table'}
        onPress={() => value !== 'table' && onChange('table')}
        glyph="☰"
        a11y={tableLabel}
        compact={compact}
      />
    </View>
  );
}

function Segment({
  active,
  onPress,
  glyph,
  a11y,
  compact,
}: {
  active: boolean;
  onPress: () => void;
  glyph: string;
  a11y: string;
  compact: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={a11y}
      accessibilityRole="button"
      style={[styles.seg, compact && styles.segCompact, active ? styles.segOn : styles.segOff]}
    >
      <Text style={[styles.glyph, compact && styles.glyphCompact, active && styles.glyphOn]}>
        {glyph}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cr2,
    borderRadius: 20,
    padding: 3,
    height: 34,
  },
  wrapCompact: {
    height: 30,
    borderRadius: 18,
  },
  seg: {
    paddingHorizontal: 12,
    minWidth: 38,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segCompact: {
    paddingHorizontal: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 14,
  },
  segOn: {
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  segOff: {
    backgroundColor: 'transparent',
  },
  glyph: {
    fontSize: 14,
    color: Colors.tx3,
    fontWeight: '700',
  },
  glyphCompact: {
    fontSize: 13,
  },
  glyphOn: {
    color: Colors.tx,
  },
});
