import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '@/constants/branding';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  color: string;
}

const menuItems: MenuItem[] = [
  { icon: 'home', label: 'Feed', route: '/feed', color: COLORS.primary },
  { icon: 'stats-chart', label: 'Statistik', route: '/statistics', color: COLORS.success },
  { icon: 'map', label: 'Kort', route: '/map', color: COLORS.warning },
  { icon: 'fish', label: 'Fangster', route: '/catches', color: COLORS.accent },
  { icon: 'calendar', label: 'Events', route: '/events', color: COLORS.info },
  { icon: 'people', label: 'Grupper', route: '/groups', color: COLORS.secondary },
  { icon: 'person', label: 'Profil', route: '/profile', color: COLORS.error },
];

function FloatingMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  // Memoize animations to prevent recreation on every render
  const animations = useMemo(
    () => menuItems.map(() => new Animated.Value(0)),
    []
  );

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.stagger(
      50,
      animations.map((anim) =>
        Animated.spring(anim, {
          toValue,
          useNativeDriver: true,
          friction: 8,
        })
      )
    ).start();
  }, [isOpen, animations]);

  const navigateTo = useCallback((route: string) => {
    router.push(route as any);
    toggleMenu();
  }, [router, toggleMenu]);

  const navigateToCamera = useCallback(() => {
    router.push('/camera-capture');
  }, [router]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
        {/* Animated Menu Items */}
        {menuItems.map((item, index) => {
          const isActive = pathname === item.route;
          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(70 * (index + 1))],
          });
          const opacity = animations[index];

          return (
            <Animated.View
              key={item.route}
              style={[
                styles.menuItemContainer,
                {
                  transform: [{ translateY }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => navigateTo(item.route)}
                activeOpacity={0.8}
              >
                <View style={styles.labelWrapper}>
                  <Text style={styles.menuLabel} numberOfLines={1}>{item.label}</Text>
                </View>
                <View
                  style={[
                    styles.menuItem,
                    { backgroundColor: item.color },
                    isActive && styles.activeMenuItem,
                  ]}
                >
                  <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB - Camera for quick catch */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: COLORS.accent }]}
          onPress={navigateToCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Menu Toggle Button */}
        <TouchableOpacity
          style={[styles.menuToggle, { backgroundColor: COLORS.primary }]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Ionicons name={isOpen ? "close" : "menu"} size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  menuItemContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  labelWrapper: {
    alignSelf: 'flex-start',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    ...SHADOWS.md,
    width: 200,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
    marginBottom: SPACING.xs,
  },
  menuToggle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  menuItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    flexShrink: 0,
  },
  activeMenuItem: {
    ...SHADOWS.lg,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});

export default React.memo(FloatingMenu);
