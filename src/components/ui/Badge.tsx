import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, MatchColors, StatusColors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius } from '@/theme/spacing';

// ─── Status Pill (Pending / Approved / Rejected / Withdrawal Requested) ─────
interface StatusPillProps {
  status: 'pending' | 'approved' | 'rejected' | 'withdrawal_requested';
  style?: ViewStyle;
}

const WITHDRAWAL_COLORS = { bg: '#EDE9FE', text: '#7C3AED' };

export const StatusPill: React.FC<StatusPillProps> = ({ status, style }) => {
  const colors =
    status === 'withdrawal_requested'
      ? WITHDRAWAL_COLORS
      : StatusColors[status as 'pending' | 'approved' | 'rejected'];
  const labels: Record<string, string> = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    withdrawal_requested: 'STEP DOWN',
  };
  return (
    <View style={[pillStyles.base, { backgroundColor: colors.bg }, style]}>
      <Text style={[pillStyles.text, { color: colors.text }]}>
        {labels[status] ?? status.toUpperCase()}
      </Text>
    </View>
  );
};

const pillStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
  },
});

// ─── Match Score Badge ───────────────────────────────────────────────────────
interface MatchBadgeProps {
  score: number;
  style?: ViewStyle;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ score, style }) => {
  const tier = score >= 90 ? 'high' : score >= 70 ? 'mid' : 'low';
  const colors = MatchColors[tier];
  return (
    <View style={[matchStyles.base, { backgroundColor: colors.bg }, style]}>
      <Text style={[matchStyles.text, { color: colors.text }]}>{score}%</Text>
    </View>
  );
};

const matchStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});

// ─── Color Chip (language, type, area labels) ────────────────────────────────
type ChipVariant = 'orange' | 'green' | 'blue' | 'gold' | 'red' | 'gray';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const chipVariantStyles: Record<ChipVariant, { bg: string; text: string }> = {
  orange: { bg: Colors.sfl, text: Colors.sf },
  green: { bg: Colors.fol, text: Colors.fo },
  blue: { bg: Colors.bll, text: Colors.bl },
  gold: { bg: Colors.gdl, text: Colors.gd },
  red: { bg: Colors.url, text: Colors.ur },
  gray: { bg: Colors.cr2, text: Colors.tx3 },
};

export const Chip: React.FC<ChipProps> = ({ label, variant = 'gray', style, textStyle }) => {
  const cs = chipVariantStyles[variant];
  return (
    <View style={[chipStyles.base, { backgroundColor: cs.bg }, style]}>
      <Text style={[chipStyles.text, { color: cs.text }, textStyle]}>{label}</Text>
    </View>
  );
};

const chipStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});

// ─── Progress Meter ──────────────────────────────────────────────────────────
interface ProgressMeterProps {
  value: number; // 0–100
  height?: number;
  style?: ViewStyle;
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({ value, height = 5, style }) => {
  const color = value >= 90 ? Colors.fo : value >= 70 ? Colors.bl : Colors.tx3;
  return (
    <View style={[meterStyles.track, { height }, style]}>
      <View
        style={[meterStyles.fill, { width: `${Math.min(100, value)}%`, backgroundColor: color }]}
      />
    </View>
  );
};

const meterStyles = StyleSheet.create({
  track: {
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
