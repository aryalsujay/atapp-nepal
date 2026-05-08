import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: string;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onPress,
  activeColor = Colors.sf,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.chip,
      active
        ? { backgroundColor: activeColor, borderColor: activeColor }
        : { backgroundColor: Colors.white, borderColor: Colors.bd2 },
      style,
    ]}
  >
    <Text style={[styles.label, { color: active ? Colors.white : Colors.tx2 }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  label: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },
  scroll: {
    flexShrink: 0,
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
});

// ─── Filter Row ──────────────────────────────────────────────────────────────
interface FilterRowProps {
  options: string[];
  active: string;
  onSelect: (value: string) => void;
  activeColor?: string;
  style?: ViewStyle;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  options,
  active,
  onSelect,
  activeColor,
  style,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.scroll}
  >
    <View style={[styles.row, style]}>
      {options.map((opt) => (
        <FilterChip
          key={opt}
          label={opt}
          active={active === opt}
          onPress={() => onSelect(opt)}
          activeColor={activeColor}
        />
      ))}
    </View>
  </ScrollView>
);
