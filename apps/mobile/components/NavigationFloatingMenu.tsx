import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '@/constants/theme';

// Navigation menu for the RIGHT side of the screen
export default function NavigationFloatingMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const navigationItems = [
    { icon: 'home', label: 'Feed', route: '/feed', color: '#3B7C5F' },
    { icon: 'stats-chart', label: 'Statistik', route: '/statistics', color: '#3B82F6' },
    { icon: 'fish', label: 'Fangster', route: '/catches', color: '#10B981' },
    { icon: 'person', label: 'Profil', route: '/profile', color: '#8B5CF6' },
  ];

  const BUTTON_SIZE = 60; // Button height/width
  const GAP = 10; // Gap between buttons
  const ITEM_SPACING = BUTTON_SIZE + GAP; // Total spacing = button size + gap
  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container}>
      {/* Navigation Menu Items - only show when open */}
      {navigationItems.map((item, index) => {
        // Special adjustment for Fangster - move 5px down for better visual spacing
        const adjustment = item.route === '/catches' ? 5 : 0;
        const itemAnimation = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -((index + 1) * ITEM_SPACING + BUTTON_SIZE + GAP) + adjustment],
        });

        const active = isActive(item.route);

        return (
          <Animated.View
            key={item.route}
            style={[
              styles.menuItem,
              {
                transform: [{ translateY: itemAnimation }],
                opacity: animation,
              },
            ]}
          >
            <View style={styles.menuItemRow}>
              {/* Label to the LEFT of icon */}
              <Text style={[styles.menuLabel, { backgroundColor: colors.surface, color: colors.textPrimary }]}>
                {item.label}
              </Text>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: active ? item.color : colors.surface,
                    borderColor: item.color,
                    borderWidth: 2, // Always 2px border for consistent spacing
                  },
                ]}
                onPress={() => {
                  router.push(item.route as any);
                  toggleMenu();
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={active ? colors.white : item.color}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}

      {/* Add Catch Button - ALWAYS VISIBLE, NO TEXT, distinct color */}
      <View style={styles.catchButtonContainer}>
        <TouchableOpacity
          style={styles.catchButton}
          onPress={() => router.push('/catch-form')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Toggle Button */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: colors.primary }]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '135deg'],
                }),
              },
            ],
          }}
        >
          <Ionicons name="menu" size={28} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'flex-end',
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  menuItem: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'flex-end',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuButton: {
    width: 60, // Same size as main button
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg, // Same shadow as other buttons for consistent spacing
  },
  menuLabel: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    fontSize: 14,
    fontWeight: '600',
    ...SHADOWS.md,
  },
  catchButtonContainer: {
    position: 'absolute',
    bottom: 70, // BUTTON_SIZE + GAP (60 + 10)
    alignItems: 'flex-end',
  },
  catchButton: {
    width: 60, // Same size as main button
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35', // Distinct orange color for catch button
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});
