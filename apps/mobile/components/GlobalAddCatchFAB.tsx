import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { COLORS, SHADOWS } from '@/constants/branding';

/**
 * Global Persistent Add Catch FAB
 * Always visible and accessible from every screen (except capture/form flows)
 * Center-positioned above bottom navigation for maximum accessibility
 */
export default function GlobalAddCatchFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Routes where FAB should be hidden
  const hiddenRoutes = [
    '/camera-capture',
    '/catch-form',
    '/add-catch',
    '/edit-catch',
    '/login',
    '/signup',
    '/index',
    '/auth/callback',
  ];

  // Check if FAB should be visible - with null safety
  const shouldShow = pathname && !hiddenRoutes.some(route => pathname.startsWith(route));

  // Fade in animation when component mounts or visibility changes
  useEffect(() => {
    if (shouldShow) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldShow, pathname]);

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
    // Navigate directly to camera capture
    router.push('/camera-capture');
  };

  // Hook Icon Component - Same as BottomNavigation
  const HookIcon = ({ color }: { color: string }) => (
    <Svg width="50" height="50" viewBox="0 0 48 48" fill="none">
      <G>
        {/* Hook curve (J-shape) */}
        <Path
          d="M 24 8 L 24 24 Q 24 32, 18 32 Q 14 32, 14 28 Q 14 24, 18 24"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Hook point */}
        <Path
          d="M 18 24 L 16 22"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hook eye (top loop) */}
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

  if (!shouldShow) return null;

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          bottom: insets.bottom + 5, // Positioned within nav bar
          opacity: fadeAnim,
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
  },
  fab: {
    width: 100, // Double size (was 70)
    height: 100, // Double size (was 70)
    borderRadius: 50, // Half of width/height
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
    // Extra shadow for prominence
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
