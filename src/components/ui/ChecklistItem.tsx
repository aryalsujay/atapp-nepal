import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Spacing } from '@/theme/spacing';

interface ChecklistItemProps {
  label: string;
  sublabel?: string;
  passed: boolean;
  style?: ViewStyle;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, sublabel, passed, style }) => (
  <View style={[styles.row, style]}>
    <View style={[styles.icon, passed ? styles.iconOk : styles.iconFail]}>
      <Text style={[styles.iconText, { color: passed ? Colors.fo : Colors.ur }]}>
        {passed ? '✓' : '✗'}
      </Text>
    </View>
    <View style={styles.content}>
      <Text style={styles.label}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    alignItems: 'flex-start',
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconOk: {
    backgroundColor: Colors.fol,
  },
  iconFail: {
    backgroundColor: Colors.url,
  },
  iconText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
  },
  sublabel: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
});
