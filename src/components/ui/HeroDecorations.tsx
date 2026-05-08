import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Circle, Polygon } from 'react-native-svg';

interface LotusHeroProps {
  color?: string;
  opacity?: number;
  size?: number;
}

/** Decorative lotus flower positioned at bottom-right of hero sections */
export const LotusHero: React.FC<LotusHeroProps> = ({
  color = 'white',
  opacity = 0.1,
  size = 220,
}) => {
  const cx = size * 0.65;
  const cy = size * 0.65;

  const outerPetals = [0, 45, 90, 135];
  const innerPetals = [22.5, 67.5, 112.5, 157.5];

  return (
    <View
      style={{
        position: 'absolute',
        right: -40,
        bottom: -30,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
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
  <View
    style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
    pointerEvents="none"
  >
    <Svg
      width="100%"
      height={90}
      viewBox="0 0 390 90"
      preserveAspectRatio="none"
    >
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

/** Small lotus icon for use inside cards and buttons */
export const LotusIcon: React.FC<{ size?: number; color?: string; opacity?: number }> = ({
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
