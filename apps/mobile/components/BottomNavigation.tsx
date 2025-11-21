import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '@/constants/branding';
import { useSession } from '../contexts/SessionContext';

interface BottomNavigationProps {
  onMorePress?: () => void;
}

export default function BottomNavigation({ onMorePress }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isActive: hasActiveSession } = useSession();

  const isActive = (route: string) => pathname === route;

  const handleMiddleButtonPress = () => {
    // Navigate to active session page regardless of whether there's an active session
    // The active-session page will handle showing the start modal if needed
    router.push('/active-session');
  };

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

      {/* Statistics */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/statistics') && styles.activeNavButton]}
        onPress={() => router.push('/statistics')}
      >
        <View style={isActive('/statistics') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={isActive('/statistics') ? 'stats-chart' : 'stats-chart-outline'}
            size={26}
            color={isActive('/statistics') ? COLORS.accent : COLORS.iconDefault}
          />
        </View>
      </TouchableOpacity>

      {/* Active Session - Center position */}
      <TouchableOpacity
        style={[styles.navButton, isActive('/active-session') && styles.activeNavButton]}
        onPress={handleMiddleButtonPress}
      >
        <View style={isActive('/active-session') ? styles.activeIconContainer : styles.iconContainer}>
          <Ionicons
            name={hasActiveSession ? "radio-button-on" : "play-circle"}
            size={48}
            color={hasActiveSession ? COLORS.success : COLORS.primary}
          />
        </View>
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

      {/* More - Opens Drawer */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onMorePress}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="menu"
            size={26}
            color={COLORS.iconDefault}
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
    flex: 1,
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
});
