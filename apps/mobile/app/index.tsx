import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Logo } from '../components/Logo';
import { LoadingBar } from '../components/LoadingBar';
import { TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});

        if (user) {
          router.replace('/feed');
        } else {
          router.replace('/login');
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [loading, user, router]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#071524' : '#0A2540' }]}>
      <StatusBar barStyle="light-content" />

      {/* Ambient background glow */}
      <LinearGradient
        colors={['#0A2540', '#0E3860', '#071A2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerCard}>
        {/* Brand Vector Logo */}
        <Logo size={90} variant="light" layout="vertical" subtitle="SMART ANGLING APP" />

        {/* Animated Gradient Progress / Loading Bar */}
        <View style={styles.loaderContainer}>
          <LoadingBar
            height={4}
            width={180}
            glow={true}
            colors={['#00D4B2', '#FFB800', '#F97316']}
            trackColor="rgba(255, 255, 255, 0.15)"
          />
        </View>

        <Text style={styles.subtext}>Gør klar til fiskeri...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS['2xl'],
    width: '100%',
    maxWidth: 340,
  },
  loaderContainer: {
    marginTop: 36,
    marginBottom: 16,
    alignItems: 'center',
  },
  subtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

