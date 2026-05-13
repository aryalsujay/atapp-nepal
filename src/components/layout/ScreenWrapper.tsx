import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { Colors } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  bg?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  style,
  contentStyle,
  bg = Colors.cr,
}) => {
  const insets = useSafeAreaInsets();

  if (!scrollable) {
    return (
      <View style={[styles.base, { backgroundColor: bg, paddingBottom: insets.bottom }, style]}>
        <StatusBar barStyle="dark-content" backgroundColor={bg} />
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[{ paddingBottom: insets.bottom + 20 }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
