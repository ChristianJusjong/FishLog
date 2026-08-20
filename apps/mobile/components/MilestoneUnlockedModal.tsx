import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useOnboardingJourney } from '../contexts/OnboardingJourneyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MilestoneUnlockedModal() {
  const { isDark } = useTheme();
  const { recentlyUnlockedMilestone, dismissUnlockedModal } = useOnboardingJourney();

  if (!recentlyUnlockedMilestone) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    dismissUnlockedModal();
  };

  return (
    <Modal
      visible={!!recentlyUnlockedMilestone}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#071A2E' : '#FFFFFF',
              borderColor: '#00D4B2',
            },
          ]}
        >
          {/* Glowing Aura Ring */}
          <LinearGradient
            colors={['#00D4B2', '#F5A623']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons
              name={(recentlyUnlockedMilestone.badgeIcon as any) || 'trophy'}
              size={38}
              color="#FFFFFF"
            />
          </LinearGradient>

          {/* Badge & Title */}
          <View style={styles.badgeTag}>
            <Text style={styles.badgeTagText}>LYSTFISKER-TROFÆ OPLÅST</Text>
          </View>

          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {recentlyUnlockedMilestone.badgeName}
          </Text>

          <Text style={[styles.desc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {recentlyUnlockedMilestone.description}
          </Text>

          {/* Reward XP Banner */}
          <View style={styles.rewardBanner}>
            <Ionicons name="sparkles" size={18} color="#F5A623" style={{ marginRight: 6 }} />
            <Text style={styles.rewardText}>+{recentlyUnlockedMilestone.xpReward} XP Mod Næste Rang</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D4B2', '#0A7B6E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Fortsæt Rejsen</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(SCREEN_WIDTH * 0.88, 360),
    borderRadius: 28,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#00D4B2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeTag: {
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D4B2',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5A623',
  },
  continueBtn: {
    width: '100%',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  continueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
