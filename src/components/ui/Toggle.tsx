import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
  activeColor?: string;
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onToggle,
  activeColor = Colors.fo,
  style,
}) => {
  const translateX = useRef(new Animated.Value(value ? 18 : 2)).current;
  const bgColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: value ? 18 : 2,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(bgColor, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const interpolatedBg = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.cr3, activeColor],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85} style={style}>
      <Animated.View style={[styles.track, { backgroundColor: interpolatedBg }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
