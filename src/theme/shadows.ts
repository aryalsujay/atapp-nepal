import { Platform } from 'react-native';
import { Colors } from './colors';

/**
 * Shadows — match prototype CSS variables exactly.
 *
 * Prototype reference (`VipassanaTeacherApp/app.html` line 457):
 *   --sh:  0 2px 14px rgba(28,20,8,0.09)
 *   --shl: 0 8px 36px rgba(28,20,8,0.13)
 *
 * Plus inline button shadows:
 *   .btn.pr:     0 4px 16px rgba(212,118,14,.32)   (saffron CTA)
 *   .btn.fo-btn: 0 4px 16px rgba(61,104,71,.28)    (forest CTA)
 *
 * On iOS we map directly to {shadowColor, shadowOffset, shadowOpacity, shadowRadius}.
 * On Android we use elevation; Android can't tint the shadow base color, so the
 * warm shadow base only manifests on iOS / web.
 */

const iosShadow = (
  color: string,
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  });

export const Shadows = {
  /** Default card / active role-tab — prototype `--sh` */
  card: iosShadow(Colors.shadowBase, 2, 14, 0.09, 3),
  /** Modal / phone frame — prototype `--shl` */
  elevated: iosShadow(Colors.shadowBase, 8, 36, 0.13, 8),
  /** Modal (heavier) — slightly more emphasis than elevated */
  modal: iosShadow(Colors.shadowBase, 12, 48, 0.18, 12),
  /** Primary CTA (saffron gradient) — prototype `.btn.pr` */
  primaryCta: iosShadow('#D4760E', 4, 16, 0.32, 6),
  /** Forest CTA (approve / confirm) — prototype `.btn.fo-btn` */
  forestCta: iosShadow('#3D6847', 4, 16, 0.28, 6),
  /** Admin CTA (blue) — derived for parity with primaryCta */
  adminCta: iosShadow('#1A5C96', 4, 16, 0.28, 6),
} as const;
