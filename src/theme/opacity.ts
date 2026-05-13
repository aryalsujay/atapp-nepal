/**
 * Centralized opacity tokens.
 *
 * Use these instead of inline numbers like `opacity: 0.6`. New opacities
 * should be added here so designers + engineers see the full palette in one
 * place.
 */

export const Opacity = {
  /** Press-state on TouchableOpacity for primary buttons (prototype `:active`) */
  pressPrimary: 0.85,
  /** Press-state on TouchableOpacity for cards / list rows */
  pressTouch: 0.7,
  /** Press-state on bottom-nav tabs (prototype `.ntab:active`) */
  pressNav: 0.62,

  /** Disabled state for buttons / inputs */
  disabled: 0.6,
  /** Loading / pending state */
  loading: 0.5,

  /** Decorative SVG overlays (lotus, mountain) */
  decorativeFaint: 0.07,
  decorativeLight: 0.09,
  decorativeMed: 0.1,
  decorativeStrong: 0.15,
  /** Static hero overlays */
  heroOverlay: 0.18,

  /** Text emphasis levels */
  textOnDarkPrimary: 1,
  textOnDarkSecondary: 0.8,
  textOnDarkTertiary: 0.6,
  textOnDarkMuted: 0.4,

  /** Card press shadow + interactive feedback */
  cardPressShadow: 0.07,
} as const;
