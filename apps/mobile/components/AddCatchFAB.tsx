import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { COLORS, SHADOWS } from '@/constants/branding';

/**
 * Centered Add Catch FAB
 * Positioned above bottom navigation
 * Use this component in layout groups or individual pages
 */
export default function AddCatchFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Press animations
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push('/camera-capture');
  };

  // Hook Icon Component
  const HookIcon = ({ color }: { color: string }) => (
    <Svg width="50" height="50" viewBox="0 0 48 48" fill="none">
      <G>
        <Path
          d="M 24 8 L 24 24 Q 24 32, 18 32 Q 14 32, 14 28 Q 14 24, 18 24"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M 18 24 L 16 22"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <Circle
          cx="24"
          cy="8"
          r="2.5"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </G>
    </Svg>
  );

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          bottom: insets.bottom + 5, // Positioned within nav bar
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <HookIcon color={COLORS.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 16,
    pointerEvents: 'box-none', // Allow touches through container except on button
  },
  fab: {
    width: 100, // Double size (was 70)
    height: 100, // Double size (was 70)
    borderRadius: 50, // Half of width/height
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
});
