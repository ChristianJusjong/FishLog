import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('===== INDEX SCREEN MOUNTED =====');

    if (!loading) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});

        if (user) {
          console.log('===== USER LOGGED IN, NAVIGATING TO FEED =====');
          router.replace('/feed');
        } else {
          console.log('===== NO USER, NAVIGATING TO LOGIN =====');
          router.replace('/login');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="fish" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Hook</Text>
      <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
      <Text style={styles.text}>Indlæser...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS['2xl'],
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  loader: {
    marginBottom: SPACING.md,
  },
  text: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
  },
});
