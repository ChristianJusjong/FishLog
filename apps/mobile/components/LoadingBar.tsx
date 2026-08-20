import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface LoadingBarProps {
  progress?: number; // 0 to 1 (or 0 to 100). If omitted, runs in continuous indeterminate mode
  height?: number;
  width?: number | `${number}%` | '100%';
  colors?: string[];
  trackColor?: string;
  borderRadius?: number;
  label?: string;
  showPercentage?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

/**
 * Hook App - Modern Animated Loading Bar
 * Supports both continuous shimmering indeterminate mode and determinate progress (0-100%).
 */
export function LoadingBar({
  progress,
  height = 4,
  width = '100%',
  colors = ['#00D4B2', '#FFB800', '#F97316'],
  trackColor,
  borderRadius,
  label,
  showPercentage = false,
  glow = true,
  style,
}: LoadingBarProps) {
  const isDeterminate = typeof progress === 'number' && progress >= 0;
  const normalizedProgress = isDeterminate ? Math.min(1, progress > 1 ? progress / 100 : progress) : 0;
  const radius = borderRadius !== undefined ? borderRadius : Math.round(height / 2);

  // Indeterminate shimmer animation value
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDeterminate) {
      const loop = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1400,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isDeterminate, animatedValue]);

  // Interpolate position for shimmer wave
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 350],
  });

  return (
    <View style={[styles.wrapper, { width }, style]}>
      {(label || (isDeterminate && showPercentage)) && (
        <View style={styles.labelContainer}>
          {label ? <Text style={styles.labelText}>{label}</Text> : <View />}
          {isDeterminate && showPercentage && (
            <Text style={styles.percentageText}>{Math.round(normalizedProgress * 100)}%</Text>
          )}
        </View>
      )}

      {/* Track Background */}
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: radius,
            backgroundColor: trackColor || 'rgba(10, 37, 64, 0.08)',
          },
        ]}
      >
        {isDeterminate ? (
          /* Determinate Progress Fill */
          <View
            style={[
              styles.determinateFill,
              {
                width: `${normalizedProgress * 100}%`,
                height,
                borderRadius: radius,
              },
            ]}
          >
            <LinearGradient
              colors={colors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            />
          </View>
        ) : (
          /* Indeterminate Animated Shimmer */
          <Animated.View
            style={[
              styles.indeterminateFill,
              {
                height,
                borderRadius: radius,
                transform: [{ translateX }],
              },
              glow ? styles.glowShadow : undefined,
            ]}
          >
            <LinearGradient
              colors={['transparent', ...colors, 'transparent'] as unknown as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2540',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  determinateFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  indeterminateFill: {
    width: 200,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  glowShadow: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});

export default LoadingBar;
