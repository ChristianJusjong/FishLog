import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../contexts/AuthContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.background,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: RADIUS['2xl'],
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: SPACING.lg,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      color: colors.primary,
      marginBottom: SPACING.xl,
    },
    loader: {
      marginBottom: SPACING.md,
    },
    text: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
  });
};

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const styles = useStyles();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});

        if (user) {
          router.replace('/feed');
        } else {
          router.replace('/login');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="fish" size={64} color={styles.title.color} />
      </View>
      <Text style={styles.title}>Hook</Text>
      <ActivityIndicator size="large" color={styles.title.color} style={styles.loader} />
      <Text style={styles.text}>Indlæser...</Text>
    </View>
  );
}
