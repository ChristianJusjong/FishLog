import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useDynamicStyles } from '@/contexts/ThemeContext';

interface Rank {
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  rank: Rank;
  rewards?: string[];
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function LevelUpModal({
  visible,
  newLevel,
  rank,
  rewards = [],
  onClose,
}: LevelUpModalProps) {
  const styles = useDynamicStyles(createStyles);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger confetti
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={90} style={styles.blurContainer}>
        <View style={styles.container}>
          {/* Confetti */}
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: width / 2, y: height / 2 }}
            autoStart={false}
            fadeOut
          />

          {/* Main Card */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Level Up Header */}
            <View style={styles.header}>
              <Text style={styles.levelUpText}>🎉 LEVEL UP! 🎉</Text>
            </View>

            {/* Level Display */}
            <Animated.View
              style={[
                styles.levelCircle,
                {
                  backgroundColor: rank.color,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </Animated.View>

            {/* Rank Info */}
            <Animated.View
              style={[
                styles.rankContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.rankIcon}>{rank.icon}</Text>
              <Text style={styles.rankTitle}>{rank.title}</Text>
              <Text style={styles.rankDescription}>{rank.description}</Text>
            </Animated.View>

            {/* Rewards */}
            {rewards.length > 0 && (
              <Animated.View
                style={[
                  styles.rewardsContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.rewardsTitle}>🎁 Belønninger:</Text>
                {rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardItem}>
                    <Text style={styles.rewardBullet}>•</Text>
                    <Text style={styles.rewardText}>{reward}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fortsæt</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    blurContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: theme.background,
      borderRadius: 24,
      padding: 32,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 2,
      borderColor: theme.primary + '40',
    },
    header: {
      marginBottom: 24,
    },
    levelUpText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
    },
    levelCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    levelNumber: {
      fontSize: 56,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    rankContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    rankIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    rankTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    rankDescription: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    rewardsContainer: {
      width: '100%',
      backgroundColor: theme.primary + '15',
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    rewardsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    rewardItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    rewardBullet: {
      fontSize: 16,
      color: theme.primary,
      marginRight: 8,
      fontWeight: 'bold',
    },
    rewardText: {
      fontSize: 15,
      color: theme.text,
      flex: 1,
    },
    closeButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
