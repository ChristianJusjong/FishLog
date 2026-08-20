import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from '../contexts/SessionContext';
import { useNavConfig } from '../contexts/NavConfigContext';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomNavigationProps {
  onMorePress?: () => void;
}

export default function BottomNavigation({ onMorePress }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors, shadows, isDark } = useTheme();
  const { isActive: hasActiveSession } = useSession();
  const { selectedRoutes, getNavItem } = useNavConfig();

  const isActive = (route: string) => pathname === route;

  const handleNavPress = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as any);
  };

  const handleMiddleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/active-session');
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onMorePress?.();
  };

  const leftRoutes = selectedRoutes.slice(0, 2);
  const rightRoutes = selectedRoutes.slice(2, 3); // 1 item on right + More menu

  // Container styling with blur and shadow
  const containerStyle = {
    backgroundColor: isDark ? '#0A1E34' : colors.surface,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={[styles.container, containerStyle, shadows.lg]}>
        {/* Left Side Custom Nav Items (Slots 1 & 2) */}
        {leftRoutes.map((route) => {
          const item = getNavItem(route);
          const active = isActive(route);

          return (
            <TouchableOpacity
              key={route}
              style={styles.navButton}
              onPress={() => handleNavPress(route)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconContainer,
                  active && { backgroundColor: colors.accent + '18' },
                ]}
              >
                <Ionicons
                  name={active ? item.iconActive : item.iconInactive}
                  size={24}
                  color={active ? colors.accent : colors.iconDefault}
                />
              </View>
              {active && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.accent },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Center HOOK Action Button */}
        <TouchableOpacity
          style={styles.centerButtonContainer}
          onPress={handleMiddleButtonPress}
          activeOpacity={0.88}
        >
          <View
            style={[
              styles.centerButtonOuter,
              { backgroundColor: isDark ? '#071524' : colors.background },
            ]}
          >
            <LinearGradient
              colors={
                hasActiveSession
                  ? [colors.success, colors.successDark || '#059669']
                  : [colors.accent, colors.accentDark || '#D4880F']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.centerButton,
                hasActiveSession && styles.centerButtonActive,
              ]}
            >
              {hasActiveSession ? (
                <Ionicons name="pulse" size={28} color={colors.white} />
              ) : (
                <Svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  {/* Hook Eyelet */}
                  <Circle
                    cx="26"
                    cy="9"
                    r="3.5"
                    stroke={colors.primary}
                    strokeWidth="3.2"
                    fill="none"
                  />
                  {/* Hook Shank & Deep Bend */}
                  <Path
                    d="M 26 12.5 L 26 27 C 26 35, 14 36.5, 13 28 L 13 18"
                    stroke={colors.primary}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Hook Barb */}
                  <Path
                    d="M 13 22 L 16.5 24.5"
                    stroke={colors.primary}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              )}
            </LinearGradient>
          </View>
          {/* Glow effect for active session */}
          {hasActiveSession && (
            <View
              style={[
                styles.glowEffect,
                {
                  shadowColor: colors.success,
                  backgroundColor: colors.success + '20',
                },
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Right Side Custom Nav Item (Slot 3) */}
        {rightRoutes.map((route) => {
          const item = getNavItem(route);
          const active = isActive(route);

          return (
            <TouchableOpacity
              key={route}
              style={styles.navButton}
              onPress={() => handleNavPress(route)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconContainer,
                  active && { backgroundColor: colors.accent + '18' },
                ]}
              >
                <Ionicons
                  name={active ? item.iconActive : item.iconInactive}
                  size={24}
                  color={active ? colors.accent : colors.iconDefault}
                />
              </View>
              {active && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.accent },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Slot 4 / More Menu Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleMenuPress}
          activeOpacity={0.75}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="menu" size={25} color={colors.iconDefault} />
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
    paddingTop: 6,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 26,
    borderWidth: 1,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 54,
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
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    position: 'relative',
  },
  centerButtonOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  glowEffect: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: -1,
  },
});
