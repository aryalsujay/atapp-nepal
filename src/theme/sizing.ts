/**
 * Centralized sizing tokens for sub-component dimensions that recur across
 * screens (avatars, icons, decorative SVGs, hit-slop, etc.).
 *
 * Add a token here whenever the same numeric size appears in 2+ files.
 */

export const AvatarSize = {
  xs: 28,
  sm: 36,
  md: 40,
  lg: 46,
  xl: 58,
} as const;

export const IconSize = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  hero: 56,
} as const;

export const HitSlop = {
  /** Standard touchable expansion for small icons / links. */
  sm: { top: 6, bottom: 6, left: 6, right: 6 },
  md: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

/** Decorative SVG sizes (used by LotusHero / MountainSilhouette). */
export const DecorationSize = {
  lotusHomeHero: 240,
  lotusLoginHero: 260,
  lotusProfileHero: 230,
} as const;

/** Status pill + chip dimensions. */
export const ChipSize = {
  paddingV: 5,
  paddingH: 11,
  fontSize: 11.5,
  radius: 20,
} as const;
