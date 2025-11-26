import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from '../contexts/SessionContext';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomNavigationProps {
  onMorePress?: () => void;
}

export default function BottomNavigation({ onMorePress }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors, shadows, spacing, radius, isDark } = useTheme();
  const { isActive: hasActiveSession } = useSession();

  const isActive = (route: string) => pathname === route;

  const handleMiddleButtonPress = () => {
    router.push('/active-session');
  };

  // Dynamic styles based on theme
  const containerStyle = {
    backgroundColor: isDark ? colors.surface : colors.surface,
    borderTopColor: isDark ? colors.border : 'transparent',
  };

  return (
    <View style={[
      styles.outerContainer,
      { paddingBottom: Math.max(insets.bottom, 12) }
    ]}>
      <View style={[styles.container, containerStyle, shadows.lg]}>
        {/* Feed */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/feed')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/feed') && { backgroundColor: colors.accent + '15' }
          ]}>
            <Ionicons
              name={isActive('/feed') ? 'home' : 'home-outline'}
              size={24}
              color={isActive('/feed') ? colors.accent : colors.iconDefault}
            />
          </View>
          {isActive('/feed') && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
        </TouchableOpacity>

        {/* Statistics */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/statistics')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/statistics') && { backgroundColor: colors.accent + '15' }
          ]}>
            <Ionicons
              name={isActive('/statistics') ? 'stats-chart' : 'stats-chart-outline'}
              size={24}
              color={isActive('/statistics') ? colors.accent : colors.iconDefault}
            />
          </View>
          {isActive('/statistics') && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
        </TouchableOpacity>

        {/* Active Session - Premium Center Button */}
        <TouchableOpacity
          style={styles.centerButtonContainer}
          onPress={handleMiddleButtonPress}
          activeOpacity={0.85}
        >
          <View style={[
            styles.centerButtonOuter,
            { backgroundColor: colors.background }
          ]}>
            <LinearGradient
              colors={hasActiveSession
                ? [colors.success, colors.successDark]
                : [colors.accent, colors.accentDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.centerButton,
                hasActiveSession && styles.centerButtonActive,
              ]}
            >
              <Ionicons
                name={hasActiveSession ? 'pulse' : 'add'}
                size={hasActiveSession ? 28 : 32}
                color={hasActiveSession ? colors.white : colors.primary}
              />
            </LinearGradient>
          </View>
          {/* Glow effect for active session */}
          {hasActiveSession && (
            <View style={[styles.glowEffect, {
              shadowColor: colors.success,
              backgroundColor: colors.success + '20',
            }]} />
          )}
        </TouchableOpacity>

        {/* Catches */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/catches')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/catches') && { backgroundColor: colors.accent + '15' }
          ]}>
            <Ionicons
              name={isActive('/catches') ? 'fish' : 'fish-outline'}
              size={24}
              color={isActive('/catches') ? colors.accent : colors.iconDefault}
            />
          </View>
          {isActive('/catches') && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
        </TouchableOpacity>

        {/* More - Opens Drawer */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={onMorePress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="menu"
              size={24}
              color={colors.iconDefault}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderTopWidth: 0,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 56,
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    position: 'relative',
  },
  centerButtonOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonActive: {
    // Active animation would go here
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 0,
      },
    }),
    zIndex: -1,
  },
});
