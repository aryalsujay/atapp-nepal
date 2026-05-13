import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

type Variant = 'primary' | 'outline' | 'forest' | 'danger' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.sf },
    text: { color: Colors.white },
  },
  outline: {
    container: {
      backgroundColor: Colors.white,
      borderWidth: 1.5,
      borderColor: Colors.bd2,
    },
    text: { color: Colors.tx },
  },
  forest: {
    container: { backgroundColor: Colors.fo },
    text: { color: Colors.white },
  },
  danger: {
    container: {
      backgroundColor: Colors.url,
      borderWidth: 1.5,
      borderColor: Colors.ur,
    },
    text: { color: Colors.ur },
  },
  secondary: {
    container: { backgroundColor: Colors.cr2 },
    text: { color: Colors.tx2 },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Colors.sf },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: Radius.md },
    text: { fontSize: FontSize.sm },
  },
  md: {
    container: {
      paddingVertical: Layout.buttonPadV,
      paddingHorizontal: Layout.buttonPadH,
      borderRadius: Radius.lg,
    },
    text: { fontSize: FontSize.mdPlus },
  },
  lg: {
    container: {
      paddingVertical: 17,
      paddingHorizontal: 28,
      borderRadius: Radius.lg,
    },
    text: { fontSize: FontSize.base },
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const shadow = variant === 'primary' || variant === 'forest' ? Shadows.card : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.base,
        vs.container,
        ss.container,
        shadow,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text.color as string} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, vs.text, ss.text, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    marginRight: 2,
  },
  text: {
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
  },
});
