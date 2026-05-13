import { Colors } from './colors';

/**
 * Font family names — must match exactly the names registered by `useFonts()`
 * in `app/_layout.tsx`. The `@expo-google-fonts/*` packages register fonts
 * using the import name as the font-family string.
 */
export const FontFamily = {
  // Plus Jakarta Sans — primary Latin face
  sans: 'PlusJakartaSans_400Regular',
  sansRegular: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',

  // Noto Sans Devanagari — Nepali face
  devanagari: 'NotoSansDevanagari_400Regular',
  devanagariMedium: 'NotoSansDevanagari_500Medium',
  devanagariSemiBold: 'NotoSansDevanagari_600SemiBold',
  devanagariBold: 'NotoSansDevanagari_700Bold',
} as const;

/**
 * Font size scale.
 *
 * The Dhamma AT app ships with a slightly larger baseline than the prototype
 * (which used 11–14 px body text). Real users include older teachers and
 * users reading Devanagari, where 11–14 px is too tight. We bumped the
 * scale by ~+2 px across the board (decided 2026-05-13).
 *
 * Inline literals in screens that match this scale should reference the
 * token; one-off oddball sizes (e.g., 12.5 px for role tabs) stay as
 * literals — document them in the screen spec instead.
 */
export const FontSize = {
  xs: 13, // was 11 — uppercase labels, notice body
  sm: 14, // was 12 — chip text, section header, footer
  smPlus: 15, // was 13 — body small, link text
  md: 16, // was 14 — input text, card body
  mdPlus: 17, // was 15 — primary CTA, large body
  base: 18, // was 16 — section emojis, accents
  lg: 19, // was 17 — section title
  xl: 20, // was 18 — card title
  xxl: 22, // was 20 — stat numbers
  h3: 24, // was 22
  h2: 26, // was 24
  h1: 30, // was 28 — login title
  hero: 34, // was 32 — extra large headings
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
