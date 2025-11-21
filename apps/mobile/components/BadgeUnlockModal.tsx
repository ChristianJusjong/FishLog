import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

interface BadgeUnlockModalProps {
  visible: boolean;
  badge: {
    icon: string;
    name: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  } | null;
  onClose: () => void;
}

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  legendary: '#FF6B35',
};

const TIER_GLOW = {
  bronze: 'rgba(205, 127, 50, 0.3)',
  silver: 'rgba(192, 192, 192, 0.3)',
  gold: 'rgba(255, 215, 0, 0.4)',
  platinum: 'rgba(229, 228, 226, 0.4)',
  legendary: 'rgba(255, 107, 53, 0.5)',
};

export default function BadgeUnlockModal({ visible, badge, onClose }: BadgeUnlockModalProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);

      // Start animations
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();

      // Trigger confetti for legendary badges
      if (badge.tier === 'legendary' && confettiRef.current) {
        setTimeout(() => confettiRef.current?.start(), 300);
      }
    }
  }, [visible, badge]);

  if (!badge) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const tierColor = TIER_COLORS[badge.tier];
  const tierGlow = TIER_GLOW[badge.tier];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Badge Icon with Glow */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ rotate }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: tierGlow,
                  opacity: glowOpacity,
                },
              ]}
            />
            <View
              style={[
                styles.badgeCircle,
                {
                  borderColor: tierColor,
                  backgroundColor: isDark ? colors.background : COLORS.white,
                },
              ]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
            </View>
          </Animated.View>

          {/* Badge Info */}
          <View style={styles.info}>
            <Text style={[styles.unlockText, { color: colors.textSecondary }]}>
              Badge Unlocked!
            </Text>
            <Text style={[styles.badgeName, { color: colors.text }]}>
              {badge.name}
            </Text>
            <Text style={[styles.badgeDescription, { color: colors.textSecondary }]}>
              {badge.description}
            </Text>

            {/* Tier Badge */}
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: tierColor },
              ]}
            >
              <Text style={styles.tierText}>
                {badge.tier.toUpperCase()}
              </Text>
              {badge.tier === 'legendary' && (
                <Ionicons name="star" size={14} color={COLORS.white} />
              )}
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Fantastisk!</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Confetti for legendary badges */}
        {badge.tier === 'legendary' && (
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: width / 2, y: height / 3 }}
            autoStart={false}
            fadeOut
          />
        )}
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: width * 0.85,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  badgeContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  badgeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  badgeIcon: {
    fontSize: 64,
  },
  info: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  badgeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  tierText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
