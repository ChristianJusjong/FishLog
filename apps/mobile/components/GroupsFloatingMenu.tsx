import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: 'create-group';
  color: string;
}

interface GroupsFloatingMenuProps {
  onCreateGroup: () => void;
}

const menuItems: MenuItem[] = [
  { icon: 'add-circle-outline', label: 'Opret Gruppe', action: 'create-group', color: '#10B981' },
];

export default function GroupsFloatingMenu({ onCreateGroup }: GroupsFloatingMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [animations] = useState(
    menuItems.map(() => new Animated.Value(0))
  );

  const toggleMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
      Animated.stagger(50, animations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        })
      )).start();
    } else {
      Animated.stagger(30, animations.slice().reverse().map(anim =>
        Animated.spring(anim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 6,
        })
      )).start(() => setIsOpen(false));
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.action === 'create-group') {
      onCreateGroup();
    }
    toggleMenu();
  };

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
        {/* Menu Items - Vertical Stack */}
        {menuItems.map((item, index) => {
          const bottom = 70 + (index * 70);

          const scale = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.menuItemContainer,
                {
                  bottom,
                  opacity: animations[index],
                  transform: [{ scale }, { translateY }],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: item.color }]}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </Animated.View>
          );
        })}

        {/* Menu Toggle Button */}
        <TouchableOpacity
          style={[styles.menuToggle, { backgroundColor: COLORS.primary }]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animations[0]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }) || '0deg',
                },
              ],
            }}
          >
            <Ionicons name="menu" size={24} color={COLORS.white} />
          </Animated.View>
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
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    left: 20,
    alignItems: 'flex-start',
    zIndex: 999,
  },
  menuItemContainer: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.sm,
    width: 250,
  },
  menuLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
    flexShrink: 1,
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
});
