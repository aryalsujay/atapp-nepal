import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Circle, Polygon, Path } from 'react-native-svg';

interface LotusHeroProps {
  color?: string;
  opacity?: number;
  size?: number;
  right?: number;
  bottom?: number;
}

/**
 * Decorative lotus flower positioned at bottom-right of hero sections.
 * Defaults match the generic prototype hero (`right:-40, bottom:-30`).
 * Login hero overrides to `right:-50, bottom:-50` per prototype `app.html:905`.
 */
export const LotusHero: React.FC<LotusHeroProps> = ({
  color = 'white',
  opacity = 0.1,
  size = 220,
  right = -40,
  bottom = -30,
}) => {
  const cx = size * 0.65;
  const cy = size * 0.65;

  const outerPetals = [0, 45, 90, 135];
  const innerPetals = [22.5, 67.5, 112.5, 157.5];

  return (
    <View
      style={{
        position: 'absolute',
        right,
        bottom,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {outerPetals.map((r) => (
          <Ellipse
            key={`o${r}`}
            cx={cx}
            cy={cy}
            rx={size * 0.18}
            ry={size * 0.48}
            fill={color}
            fillOpacity={opacity}
            transform={`rotate(${r} ${cx} ${cy})`}
          />
        ))}
        {innerPetals.map((r) => (
          <Ellipse
            key={`i${r}`}
            cx={cx}
            cy={cy}
            rx={size * 0.12}
            ry={size * 0.34}
            fill={color}
            fillOpacity={opacity * 1.4}
            transform={`rotate(${r} ${cx} ${cy})`}
          />
        ))}
        <Circle cx={cx} cy={cy} r={size * 0.18} fill={color} fillOpacity={opacity * 1.8} />
        <Circle cx={cx} cy={cy} r={size * 0.09} fill="rgba(255,255,255,0.2)" />
      </Svg>
    </View>
  );
};

/** Mountain silhouette decorative element at bottom of hero sections */
export const MountainSilhouette: React.FC<{ color?: string }> = ({
  color = 'rgba(255,255,255,0.09)',
}) => (
  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} pointerEvents="none">
    <Svg width="100%" height={90} viewBox="0 0 390 90" preserveAspectRatio="none">
      <Polygon
        points="0,90 55,32 110,60 165,18 225,52 285,24 340,48 390,33 390,90"
        fill={color}
        fillOpacity={0.5}
      />
      <Polygon
        points="0,90 35,52 90,72 150,38 215,68 270,42 330,58 390,44 390,90"
        fill={color}
        fillOpacity={0.7}
      />
      {/* Snow caps */}
      <Polygon points="160,18 165,10 170,18" fill={color} fillOpacity={0.9} />
      <Polygon points="280,24 285,16 290,24" fill={color} fillOpacity={0.9} />
      <Polygon points="50,32 55,24 60,32" fill={color} fillOpacity={0.85} />
    </Svg>
  </View>
);

/**
 * Stylised seated meditation figure — head + halo, shoulders, body, two
 * arms folded into mudra. Decorative only; used in the teacher-profile
 * hero (`app.html:183`). Positioned absolutely inside the hero by default
 * (right:-10, bottom:-10) matching the prototype's `<svg style="…">`.
 */
export const MeditationFigure: React.FC<{
  size?: number;
  color?: string;
  right?: number;
  bottom?: number;
}> = ({ size = 130, color = 'rgba(255,255,255,0.13)', right = -10, bottom = -10 }) => (
  <View style={{ position: 'absolute', right, bottom, pointerEvents: 'none' }} pointerEvents="none">
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Halo ring */}
      <Circle cx={50} cy={22} r={19} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
      {/* Head */}
      <Circle cx={50} cy={22} r={12} fill={color} />
      {/* Shoulders */}
      <Path d="M35 46 C35 38 42 34 50 34 C58 34 65 38 65 46" fill={color} />
      {/* Body (lap + crossed legs silhouette) */}
      <Path
        d="M24 68 C27 52 38 48 50 48 C62 48 73 52 76 68 L76 74 C72 70 62 67 50 67 C38 67 28 70 24 74 Z"
        fill={color}
      />
      {/* Left arm */}
      <Path
        d="M36 51 C28 56 25 63 27 68"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Right arm */}
      <Path
        d="M64 51 C72 56 75 63 73 68"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  </View>
);

/**
 * Small standalone lotus emblem — kept as `LotusGlyph` to avoid colliding with
 * `LotusIcon` in `TabIcons.tsx` which is the nav-bar variant. Use this where
 * you want a decorative lotus inside a card / button.
 */
export const LotusGlyph: React.FC<{ size?: number; color?: string; opacity?: number }> = ({
  size = 32,
  color = '#D4760E',
  opacity = 1,
}) => {
  const rotations = [0, 45, 90, 135];
  const innerRotations = [22.5, 67.5, 112.5, 157.5];
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {rotations.map((r) => (
        <Ellipse
          key={`o${r}`}
          cx="16"
          cy="16"
          rx="4.5"
          ry="11"
          fill={color}
          fillOpacity={opacity * 0.35}
          transform={`rotate(${r} 16 16)`}
        />
      ))}
      {innerRotations.map((r) => (
        <Ellipse
          key={`i${r}`}
          cx="16"
          cy="16"
          rx="3"
          ry="8"
          fill={color}
          fillOpacity={opacity * 0.6}
          transform={`rotate(${r} 16 16)`}
        />
      ))}
      <Circle cx="16" cy="16" r="5" fill={color} fillOpacity={opacity} />
      <Circle cx="16" cy="16" r="2.5" fill="rgba(255,255,255,0.35)" />
    </Svg>
  );
};
