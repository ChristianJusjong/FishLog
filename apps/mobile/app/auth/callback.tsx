import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

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
    errorText: {
      marginTop: 20,
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });
};

export default function AuthCallback() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error from OAuth provider
        if (params.error) {
          console.error('OAuth error:', params.error);
          setErrorMessage('Authentication failed. Please try again.');
          setTimeout(() => router.replace('/login'), 2000);
          return;
        }

        // New secure flow: exchange auth code for tokens via POST
        if (params.code) {
          const { data } = await api.post('/auth/exchange', {
            code: params.code as string,
          });

          if (data.accessToken && data.refreshToken) {
            await login(data.accessToken, data.refreshToken);
            router.replace('/feed');
            return;
          }
        }

        // Legacy flow: direct tokens in URL (for backwards compatibility)
        if (params.accessToken && params.refreshToken) {
          await login(params.accessToken as string, params.refreshToken as string);
          router.replace('/feed');
          return;
        }

        // No valid auth data
        console.error('No valid auth data received');
        setErrorMessage('Invalid authentication response.');
        setTimeout(() => router.replace('/login'), 2000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setErrorMessage('Authentication failed. Please try again.');
        setTimeout(() => router.replace('/login'), 2000);
      }
    };

    handleCallback();
  }, [params, login, router]);

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.text}>Logger ind...</Text>
        </>
      )}
    </View>
  );
}
