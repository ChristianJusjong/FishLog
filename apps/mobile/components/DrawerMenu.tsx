import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS } from '@/constants/theme';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const DRAWER_WIDTH = Dimensions.get('window').width * 0.8;
const MAX_DRAWER_WIDTH = 320;

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(DRAWER_WIDTH)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  const menuSections: MenuSection[] = [
    {
      title: 'NAVIGATION',
      items: [
        { icon: 'map', label: 'Kort', route: '/map' },
        { icon: 'navigate', label: 'Fisketure', route: '/fisketure' },
        { icon: 'flame', label: 'Hot Spots', route: '/hot-spots' },
        { icon: 'bulb', label: 'AI Guide', route: '/ai-guide' },
      ],
    },
    {
      title: 'UDFORDRINGER',
      items: [
        { icon: 'fitness', label: 'Udfordringer', route: '/challenges' },
        { icon: 'calendar', label: 'Events', route: '/events' },
        { icon: 'ribbon', label: 'Badges', route: '/badges' },
        { icon: 'podium', label: 'Leaderboard', route: '/leaderboard' },
      ],
    },
    {
      title: 'SOCIALT',
      items: [
        { icon: 'people', label: 'Venner', route: '/friends' },
        { icon: 'people-circle', label: 'Grupper', route: '/groups' },
        { icon: 'notifications', label: 'Notifikationer', route: '/notifications' },
      ],
    },
    {
      title: 'ANALYSE',
      items: [
        { icon: 'analytics', label: 'Analyse', route: '/analytics' },
        { icon: 'git-compare', label: 'Sammenlign Stats', route: '/compare-stats' },
        { icon: 'calendar-outline', label: 'Flerårsoversigt', route: '/multi-year-trends' },
      ],
    },
    {
      title: 'MIN FISKEBOG',
      items: [
        { icon: 'document-text', label: 'Kladder', route: '/drafts' },
      ],
    },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const isActive = (route: string) => pathname === route;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.surface,
            width: Math.min(DRAWER_WIDTH, MAX_DRAWER_WIDTH),
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Premium Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight || '#1A3A5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLogo}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark || '#D4880F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoIcon}
              >
                <Ionicons name="fish" size={24} color={colors.primary} />
              </LinearGradient>
              <Text style={styles.headerTitle}>Hook</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Menu Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <TouchableOpacity
            style={[
              styles.profileSection,
              { backgroundColor: colors.primaryLight + '10' },
            ]}
            onPress={() => handleNavigate('/profile')}
          >
            <Ionicons name="person-circle" size={48} color={colors.primary} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                Min Profil
              </Text>
              <Text style={[styles.profileSubtext, { color: colors.textSecondary }]}>
                Se og rediger profil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
              {section.items.map((item, itemIndex) => {
                const active = isActive(item.route);
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      active && {
                        backgroundColor: colors.accent + '10',
                        borderLeftColor: colors.accent,
                        borderLeftWidth: 3,
                      },
                    ]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={active ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        { color: active ? colors.accent : colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Settings at bottom */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/settings')}
            >
              <Ionicons name="settings" size={22} color={colors.textSecondary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Indstillinger
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    ...TYPOGRAPHY.styles.h3,
    fontSize: 16,
    fontWeight: '600',
  },
  profileSubtext: {
    ...TYPOGRAPHY.styles.caption,
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuItemText: {
    ...TYPOGRAPHY.styles.body,
    flex: 1,
    fontSize: 15,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
