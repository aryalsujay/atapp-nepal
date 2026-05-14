/**
 * LotusGlyph — stylized 8-petal lotus SVG used as a decorative icon inside
 * cards and tiles across the teacher flow.
 *
 * Direct port of the prototype's `Icons.Lotus` (`app.html:105–118`):
 *  - 4 outer petals (rotation 0°, 45°, 90°, 135°)  — long, faint
 *  - 4 inner petals (rotation 22.5°, 67.5°, 112.5°, 157.5°) — short, denser
 *  - solid core circle + white highlight
 *
 * `color` controls the petal fill; the core inherits it at full opacity.
 * `opacity` scales all three layers proportionally (use ≈0.3 for very subtle
 * tile decorations).
 */

import React from 'react';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';

import { Colors } from '@/theme/colors';

interface Props {
  size?: number;
  color?: string;
  opacity?: number;
}

export function LotusGlyph({ size = 32, color = Colors.sf, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <G>
        {[0, 45, 90, 135].map((r) => (
          <Ellipse
            key={`o-${r}`}
            cx={16}
            cy={16}
            rx={4.5}
            ry={11}
            fill={color}
            opacity={opacity * 0.35}
            transform={`rotate(${r} 16 16)`}
          />
        ))}
        {[22.5, 67.5, 112.5, 157.5].map((r) => (
          <Ellipse
            key={`i-${r}`}
            cx={16}
            cy={16}
            rx={3}
            ry={8}
            fill={color}
            opacity={opacity * 0.6}
            transform={`rotate(${r} 16 16)`}
          />
        ))}
        <Circle cx={16} cy={16} r={5} fill={color} opacity={opacity} />
        <Circle cx={16} cy={16} r={2.5} fill="rgba(255,255,255,0.35)" />
      </G>
    </Svg>
  );
}
