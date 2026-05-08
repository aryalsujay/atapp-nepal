import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Spacing } from '../../theme/spacing';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  onBack?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  onAction,
  onBack,
  style,
}) => (
  <View style={[styles.container, style]}>
    {onBack && (
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>
    )}
    <Text style={[styles.title, onBack && { flex: 1 }]}>{title}</Text>
    {action && onAction && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.action}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: 14,
    paddingBottom: 10,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  action: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.sf,
  },
  backBtn: {
    marginRight: 6,
    padding: 2,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.tx2,
    lineHeight: 28,
    fontWeight: FontWeight.bold,
  },
});
