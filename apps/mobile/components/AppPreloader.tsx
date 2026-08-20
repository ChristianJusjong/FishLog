import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Logo } from './Logo';
import { ALL_FISHING_LOCATIONS } from '../data/fishingLocations';
import { api } from '../lib/api';

import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRELOAD_STEPS = [
  'Forbinder til Hook High-Speed Engine...',
  'Forbereder 100+ fiskepladser & fredningszoner...',
  'Indlæser digital grejboks & personlige fangster...',
  'Opvarmer Fiske-AI & vejrprognoser...',
  'Klar til hug! 🎣',
];

interface AppPreloaderProps {
  onComplete: () => void;
}

export default function AppPreloader({ onComplete }: AppPreloaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Subtle breathing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Parallel Background Warmup & Image Prefetching
    const runWarmup = async () => {
      try {
        // Warm up location database in memory
        const _locCount = ALL_FISHING_LOCATIONS.length;

        // Warm up and prefetch feed catches and photos in memory
        const response = await api.get('/catches?limit=10').catch(() => null);
        if (response?.data?.catches) {
          response.data.catches.forEach((c: any) => {
            if (c.photoUrl) {
              ExpoImage.prefetch(c.photoUrl).catch(() => {});
            }
          });
        }
        api.get('/sessions/live-friends').catch(() => {});
      } catch {
        // Non-blocking warmup
      }
    };
    runWarmup();

    // Progress Bar Animation across 5 steps (~2.6 seconds total)
    const durationPerStep = 550;

    const animateSteps = (index: number) => {
      if (index >= PRELOAD_STEPS.length) {
        // Complete & smooth fade out
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
        return;
      }

      setStepIndex(index);

      // Animate progress to target percentage
      const targetProgress = (index + 1) / PRELOAD_STEPS.length;
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: durationPerStep,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        animateSteps(index + 1);
      });
    };

    animateSteps(0);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="auto"
    >
      <LinearGradient
        colors={['#030D18', '#071524', '#0A2540']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Radiant Glow Behind Logo */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowAnim,
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0.4, 0.9],
                  outputRange: [0.95, 1.15],
                }),
              },
            ],
          },
        ]}
      />

      {/* Main Logo & Branding */}
      <View style={styles.centerContent}>
        <Logo size={110} variant="gold" layout="icon" />

        <View style={styles.brandingTextContainer}>
          <Text style={styles.appName}>HOOK</Text>
          <Text style={styles.tagline}>PRECISION ANGLING & FISH LOG</Text>
        </View>

        {/* Progress Bar Container */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]}>
            <LinearGradient
              colors={['#00D4B2', '#F5A623', '#FFD93D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Loading Step Label */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>
            {PRELOAD_STEPS[stepIndex] || PRELOAD_STEPS[0]}
          </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Danmarks Ultimative Digitale Fiskebog</Text>
        <Text style={styles.footerSubtext}>100% Offline Robust • M2-Tidevand • AI Taktik</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071524',
  },
  glowCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 212, 178, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
  },
  centerContent: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.82,
  },
  brandingTextContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D4B2',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepContainer: {
    marginTop: 14,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  footerSubtext: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(0, 212, 178, 0.6)',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
