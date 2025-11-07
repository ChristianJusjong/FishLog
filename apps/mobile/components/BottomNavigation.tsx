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

  // Minimalist design - focus on usability

  // Fish Hook Icon Component - Simple and clean
  const HookIcon = ({ color }: { color: string }) => (
    <Svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Feed */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/feed') && styles.activeNavButton]}
        onPress={() => router.push('/feed')}
      >
        <View style={isActive('/feed') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={isActive('/feed') ? 'home' : 'home-outline'}
            size={26}
            color={isActive('/feed') ? COLORS.accent : COLORS.iconDefault}
          />
        </View>
      </TouchableOpacity>

      {/* Map */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/map') && styles.activeNavButton]}
        onPress={() => router.push('/map')}
      >
        <View style={isActive('/map') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={isActive('/map') ? 'map' : 'map-outline'}
            size={26}
            color={isActive('/map') ? COLORS.accent : COLORS.iconDefault}
          />
        </View>
      </TouchableOpacity>

      {/* Add Catch - Simple Floating Button - Goes directly to camera */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/camera-capture')}
        activeOpacity={0.8}
      >
        <HookIcon color={COLORS.white} />
      </TouchableOpacity>

      {/* Catches */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/catches') && styles.activeNavButton]}
        onPress={() => router.push('/catches')}
      >
        <View style={isActive('/catches') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={isActive('/catches') ? 'fish' : 'fish-outline'}
            size={26}
            color={isActive('/catches') ? COLORS.accent : COLORS.iconDefault}
          />
        </View>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/profile') && styles.activeNavButton]}
        onPress={() => router.push('/profile')}
      >
        <View style={isActive('/profile') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={isActive('/profile') ? 'person' : 'person-outline'}
            size={26}
            color={isActive('/profile') ? COLORS.accent : COLORS.iconDefault}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.sm,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    minWidth: 60,
    minHeight: 50,
  },
  activeNavButton: {
    // Minimal scale for subtle feedback
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    backgroundColor: COLORS.accent + '10',
    borderRadius: 24,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    ...SHADOWS.md,
  },
});
