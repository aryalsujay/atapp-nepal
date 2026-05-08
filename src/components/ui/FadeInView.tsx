import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  slideUp?: boolean;
}

/** Card/screen entry animation: fade in + slight slide up (matches prototype cardUp animation) */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 300,
  style,
  slideUp = true,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideUp ? 12 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

/** Staggered list: wraps each child with increasing delay */
export const StaggeredList: React.FC<{
  children: React.ReactNode[];
  baseDelay?: number;
  stagger?: number;
}> = ({ children, baseDelay = 80, stagger = 60 }) => (
  <>
    {children.map((child, i) => (
      <FadeInView key={i} delay={baseDelay + i * stagger}>
        {child}
      </FadeInView>
    ))}
  </>
);
