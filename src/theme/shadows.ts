import { Platform } from 'react-native';

const shadow = (elevation: number, opacity: number) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {},
  });

export const Shadows = {
  card: shadow(3, 0.08),
  elevated: shadow(8, 0.12),
  modal: shadow(16, 0.2),
} as const;
