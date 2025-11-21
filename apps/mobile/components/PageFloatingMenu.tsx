import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '@/constants/theme';

export interface PageMenuItem {
  icon: string;
  label: string;
  route?: string;
  onPress?: () => void;
  color?: string;
}

interface PageFloatingMenuProps {
  items: PageMenuItem[];
  buttonColor?: string;
  iconColor?: string;
}

export default function PageFloatingMenu({
  items,
  buttonColor = '#F59E0B', // Orange - different from right nav (green)
  iconColor = '#FFFFFF',
}: PageFloatingMenuProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors, buttonColor);
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

  const handleItemPress = (item: PageMenuItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
    toggleMenu();
  };

  const BUTTON_SIZE = 60; // Button height/width
  const GAP = 20; // Gap between buttons (larger gap for page menu)
  const ITEM_SPACING = BUTTON_SIZE + GAP; // Total spacing = button size + gap

  return (
    <View style={styles.container}>
      {/* Menu items */}
      {items.map((item, index) => {
        // Adjustment for middle button - move 20px down for better visual spacing
        const adjustment = index === 1 ? 20 : 0;
        const itemAnimation = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -((index + 1) * ITEM_SPACING) + adjustment], // Each item spaced by button size + gap
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.menuItem,
              {
                transform: [{ translateY: itemAnimation }],
                opacity: animation,
              },
            ]}
          >
            <View style={styles.menuItemRow}>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  { backgroundColor: item.color || buttonColor },
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon as any} size={24} color={iconColor} />
              </TouchableOpacity>
              {/* Label to the RIGHT of icon */}
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          </Animated.View>
        );
      })}

      {/* Main button */}
      <TouchableOpacity
        style={styles.mainButton}
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
          <Ionicons name="grid" size={28} color={iconColor} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any, buttonColor: string) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: SPACING.lg, // LEFT side for page-specific menu
      bottom: 100, // Moved up to avoid system navigation
      zIndex: 1000,
      alignItems: 'flex-start',
    },
    menuItem: {
      position: 'absolute',
      bottom: 0,
    },
    menuItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    menuButton: {
      width: 60, // Same size as navigation buttons
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.lg,
    },
    menuLabel: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      fontSize: 14,
      fontWeight: '600',
      ...SHADOWS.md,
    },
    mainButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: buttonColor,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.lg,
    },
  });
