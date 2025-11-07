import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

const API_URL = 'https://fishlog-production.up.railway.app';

export default function LoginScreen() {
  console.log('===== LOGIN SCREEN RENDERED =====');
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fejl', 'Indtast email og adgangskode');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      await login(accessToken, refreshToken, user);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Login fejlede', error.response?.data?.error || 'Ugyldigt email eller adgangskode');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/test-login', {
        email: 'test@fishlog.app',
        name: 'Test Bruger'
      });
      const { accessToken, refreshToken, user } = response.data;

      await login(accessToken, refreshToken, user);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Login fejlede', error.response?.data?.error || 'Kunne ikke logge ind');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Opening Google OAuth');
    Linking.openURL(`${API_URL}/auth/google`);
  };

  const handleFacebookLogin = () => {
    console.log('Opening Facebook OAuth');
    Linking.openURL(`${API_URL}/auth/facebook`);
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hook 🎣</Text>
        <Text style={styles.subtitle}>Din digitale fiskebog</Text>

        {/* Email/Password Login */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Adgangskode"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log ind</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Opret konto</Text>
          </TouchableOpacity>

          {/* Test Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleTestLogin}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Login (Udvikler)</Text>
          </TouchableOpacity>
        </View>

        {/* OAuth Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>eller</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.oauthButtonText}>Log ind med Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.facebookButton]}
            onPress={handleFacebookLogin}
            disabled={loading}
          >
            <Text style={styles.oauthButtonText}>Log ind med Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 48,
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  testButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  oauthButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  testButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#999999',
    paddingHorizontal: 16,
    fontSize: 14,
  },
});
