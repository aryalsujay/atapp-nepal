import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontSize } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.icon}>
      {/* Search icon — simple magnifier representation */}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.tx3}
      style={styles.input}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cr2,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 18,
    marginVertical: 8,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    padding: 0,
  },
});
