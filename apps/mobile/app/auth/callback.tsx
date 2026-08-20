import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { Logo } from '../../components/Logo';
import { LoadingBar } from '../../components/LoadingBar';

export default function AuthCallback() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error from OAuth provider
        if (params.error) {
          console.error('OAuth error:', params.error, params.error_description);
          setErrorMessage(`Autentificering fejlede: ${params.error_description || params.error}`);
          setTimeout(() => router.replace('/login'), 3500);
          return;
        }

        // Secure flow: exchange auth code for tokens via POST
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

        // Direct tokens in URL fallback
        if (params.accessToken && params.refreshToken) {
          await login(params.accessToken as string, params.refreshToken as string);
          router.replace('/feed');
          return;
        }

        // No valid auth data
        console.error('No valid auth data received in params:', params);
        setErrorMessage('Ugyldigt login svar modtaget.');
        setTimeout(() => router.replace('/login'), 3000);
      } catch (error: any) {
        console.error('Auth callback error:', error?.response?.data || error?.message || error);
        setErrorMessage(`Login fejlede: ${error?.response?.data?.error || error?.message || 'Serverfejl'}`);
        setTimeout(() => router.replace('/login'), 3500);
      }
    };

    handleCallback();
  }, [params, login, router]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#071524' : '#0A2540' }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0A2540', '#0E3860', '#071A2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.card}>
        <Logo size={72} variant="light" layout="vertical" subtitle="AUTENTIFICERING" />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <>
            <View style={styles.loaderContainer}>
              <LoadingBar
                height={4}
                width={180}
                glow={true}
                colors={['#00D4B2', '#FFB800', '#F97316']}
                trackColor="rgba(255, 255, 255, 0.15)"
              />
            </View>
            <Text style={styles.text}>Logger sikkert ind...</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
  },
  loaderContainer: {
    marginTop: 28,
    marginBottom: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  errorText: {
    marginTop: 24,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
});

