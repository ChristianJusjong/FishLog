import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
    },
    text: {
      marginTop: 20,
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
};

export default function AuthCallback() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { accessToken, refreshToken } = useLocalSearchParams();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Callback received tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (accessToken && refreshToken) {
          console.log('Logging in with tokens...');
          await login(accessToken as string, refreshToken as string);
          console.log('Login successful, redirecting to feed...');
          router.replace('/feed');
        } else {
          console.error('Missing tokens');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
      }
    };

    handleCallback();
  }, [accessToken, refreshToken, login, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Logging in...</Text>
    </View>
  );
}
