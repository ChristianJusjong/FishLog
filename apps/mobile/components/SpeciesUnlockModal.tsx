import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from '@/constants/branding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpeciesUnlockModalProps {
  visible: boolean;
  speciesName: string;
  rarity?: string;
  xpEarned?: number;
  onClose: () => void;
}

export default function SpeciesUnlockModal({
  visible,
  speciesName,
  rarity = 'Ny Art',
  xpEarned = 150,
  onClose,
}: SpeciesUnlockModalProps) {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ConfettiCannon
          count={80}
          origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
          fallSpeed={3000}
          fadeOut={true}
          autoStart={true}
        />

        <View style={styles.card}>
          <LinearGradient
            colors={['#0A2540', '#14385C']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glow Trophy / Fish Badge */}
            <View style={styles.trophyContainer}>
              <LinearGradient
                colors={['#F5A623', '#D4880F']}
                style={styles.trophyBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={44} color="#0A2540" />
              </LinearGradient>
            </View>

            <Text style={styles.unlockTitle}>NY ART OPLÅST I FISKEDEX!</Text>

            <Text style={styles.speciesName}>{speciesName}</Text>

            <View style={styles.rarityBadge}>
              <Ionicons name="ribbon" size={16} color="#F5A623" />
              <Text style={styles.rarityText}>{rarity}</Text>
            </View>

            <View style={styles.xpBox}>
              <Ionicons name="flash" size={20} color="#00D4B2" />
              <Text style={styles.xpText}>+{xpEarned} XP BONUS</Text>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={onClose} activeOpacity={0.85}>
              <LinearGradient
                colors={['#F5A623', '#D4880F']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Fedt! Gem i FiskeDex</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(245, 166, 35, 0.5)',
    ...SHADOWS.glow,
  },
  cardGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: SPACING.md,
  },
  trophyBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  unlockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5A623',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  speciesName: {
    ...TYPOGRAPHY.styles.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    marginBottom: SPACING.lg,
  },
  rarityText: {
    color: '#F5A623',
    fontWeight: '700',
    fontSize: 13,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 178, 0.3)',
    marginBottom: SPACING.xl,
  },
  xpText: {
    color: '#00D4B2',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  continueButton: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0A2540',
    fontWeight: '800',
    fontSize: 16,
  },
});
