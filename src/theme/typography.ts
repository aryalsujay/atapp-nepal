import { Colors } from './colors';

export const FontFamily = {
  sans: 'PlusJakartaSans',
  sansRegular: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
  devanagari: 'NotoSansDevanagari',
  devanagariBold: 'NotoSansDevanagari_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  smPlus: 13,
  md: 14,
  mdPlus: 15,
  base: 16,
  lg: 17,
  xl: 18,
  xxl: 20,
  h3: 22,
  h2: 24,
  h1: 28,
  hero: 32,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.1,
  snug: 1.2,
  normal: 1.3,
  relaxed: 1.45,
  loose: 1.6,
} as const;

// Semantic text styles (use with StyleSheet or inline)
export const TextStyles = {
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    lineHeight: FontSize.hero * 1.1,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  body: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.normal,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.45,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.tx3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.tx2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  buttonPrimary: {
    fontSize: FontSize.mdPlus,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  buttonSecondary: {
    fontSize: FontSize.mdPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
} as const;
