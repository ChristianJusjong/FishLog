import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '@/constants/branding';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => pathname === route;

  // Fish Hook Icon Component
  const HookIcon = ({ color }: { color: string }) => (
    <Svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <G>
        {/* Hook curve (J-shape) */}
        <Path
          d="M 24 8 L 24 24 Q 24 32, 18 32 Q 14 32, 14 28 Q 14 24, 18 24"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Hook point */}
        <Path
          d="M 18 24 L 16 22"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hook eye (top loop) */}
        <Circle
          cx="24"
          cy="8"
          r="3"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </G>
    </Svg>
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Feed */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/feed')}
      >
        <Ionicons
          name={isActive('/feed') ? 'home' : 'home-outline'}
          size={24}
          color={isActive('/feed') ? COLORS.accent : COLORS.iconDefault}
        />
      </TouchableOpacity>

      {/* Map */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/map')}
      >
        <Ionicons
          name={isActive('/map') ? 'map' : 'map-outline'}
          size={24}
          color={isActive('/map') ? COLORS.accent : COLORS.iconDefault}
        />
      </TouchableOpacity>

      {/* Add Catch - Orange Circle with Hook */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-catch')}
      >
        <HookIcon color={COLORS.white} />
      </TouchableOpacity>

      {/* Catches */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/catches')}
      >
        <Ionicons
          name={isActive('/catches') ? 'fish' : 'fish-outline'}
          size={24}
          color={isActive('/catches') ? COLORS.accent : COLORS.iconDefault}
        />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons
          name={isActive('/profile') ? 'person' : 'person-outline'}
          size={24}
          color={isActive('/profile') ? COLORS.accent : COLORS.iconDefault}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    // paddingBottom is set dynamically using insets
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...SHADOWS.lg,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  addButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent, // Vivid Orange
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -36, // Lift the button up
    ...SHADOWS.xl,
  },
});
