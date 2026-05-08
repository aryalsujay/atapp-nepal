import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Spacing, Layout } from '../../theme/spacing';
import { LotusHero, MountainSilhouette } from '../ui/HeroDecorations';

type GradientType = keyof typeof Gradients;

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  gradient?: GradientType;
  colors?: readonly string[];
  onBack?: () => void;
  rightAction?: React.ReactNode;
  badge?: React.ReactNode;
  style?: ViewStyle;
  children?: React.ReactNode;
  lotusColor?: string;
  lotusOpacity?: number;
  lotusSize?: number;
  showMountains?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  gradient = 'teacher',
  colors: customColors,
  onBack,
  rightAction,
  badge,
  style,
  children,
  lotusColor = 'white',
  lotusOpacity = 0.09,
  lotusSize = 230,
  showMountains = true,
}) => {
  const insets = useSafeAreaInsets();
  const gradientColors = customColors ?? (Gradients[gradient] as unknown as string[]);

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + Layout.heroPadTop / 2 }, style]}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative background elements */}
      <LotusHero color={lotusColor} opacity={lotusOpacity} size={lotusSize} />
      {showMountains && <MountainSilhouette />}

      {/* Header row */}
      {(onBack || rightAction) && (
        <View style={styles.headerRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {rightAction}
        </View>
      )}

      {/* Badge */}
      {badge && <View style={styles.badgeWrap}>{badge}</View>}

      {/* Title + subtitle */}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {/* Extra children (stats row, etc.) */}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Layout.heroPadBottom,
    flexShrink: 0,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },
  badgeWrap: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    lineHeight: FontSize.h1 * 1.15,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.smPlus * 1.45,
  },
});
