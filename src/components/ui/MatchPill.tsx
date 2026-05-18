/**
 * Shared `MatchBadge` + `Meter` for the teacher home + courses screens.
 *
 * Direct port of the prototype's `MB` and `Meter` components
 * (`app.html:888–889`). Tier thresholds and colors come from `MatchTiers`
 * in `src/config/match.ts` so admin-tunable changes apply everywhere.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { MatchTiers } from '@/config/match';

/** Pill displayed in the top-right of a course card. */
export function MatchBadge({
  score,
  label = 'match',
  compact = false,
}: {
  score: number;
  label?: string;
  compact?: boolean;
}) {
  const n = Math.round(score);
  const tier =
    n >= MatchTiers.high
      ? { bg: Colors.fol, fg: Colors.fo }
      : n >= MatchTiers.mid
        ? { bg: Colors.bll, fg: Colors.bl }
        : { bg: Colors.cr2, fg: Colors.tx2 };
  return (
    <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: tier.bg }]}>
      <Text style={[styles.badgeText, compact && styles.badgeTextCompact, { color: tier.fg }]}>
        {compact ? `${n}%` : `${n}% ${label}`}
      </Text>
    </View>
  );
}

/** 5 px horizontal progress bar matching the prototype `.meter` style. */
export function Meter({ score }: { score: number }) {
  const n = Math.min(100, Math.max(0, Math.round(score)));
  const fill = n >= MatchTiers.high ? Colors.fo : n >= MatchTiers.mid ? Colors.bl : Colors.tx3;
  return (
    <View style={styles.meter}>
      <View style={[styles.meterFill, { width: `${n}%`, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeCompact: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'center',
  },
  badgeTextCompact: {
    fontSize: 11,
  },
  meter: {
    height: 5,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
});
