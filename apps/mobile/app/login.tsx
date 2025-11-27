import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS } from '@/constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fejl', 'Indtast email og adgangskode');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      await login(accessToken, refreshToken);
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

      await login(accessToken, refreshToken);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Login fejlede', error.response?.data?.error || 'Kunne ikke logge ind');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Linking.openURL(`${API_URL}/auth/google`);
  };

  const handleFacebookLogin = () => {
    Linking.openURL(`${API_URL}/auth/facebook`);
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Ocean Gradient Background */}
      <LinearGradient
        colors={['#0A2540', '#1A3A5C', '#1E4976']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Premium Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#F5A623', '#FFD93D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="fish" size={40} color="#0A2540" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Hook</Text>
              <Text style={styles.subtitle}>Din digitale fiskebog</Text>
            </View>

            {/* Premium Form Card */}
            <View style={styles.formCard}>
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textTertiary }]}>EMAIL</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.gray50, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.iconDefault} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="din@email.dk"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textTertiary }]}>ADGANGSKODE</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.gray50, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.iconDefault} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.iconDefault}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Login Button with Golden Gradient */}
                <TouchableOpacity
                  onPress={handleEmailLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={[styles.primaryButtonWrapper, loading && styles.buttonDisabled]}
                >
                  <LinearGradient
                    colors={['#F5A623', '#D4880F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#0A2540" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Log ind</Text>
                        <Ionicons name="arrow-forward" size={20} color="#0A2540" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Secondary Button */}
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Opret ny konto</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>eller</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthContainer}>
                <TouchableOpacity
                  style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text style={[styles.oauthButtonText, { color: colors.text }]}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleFacebookLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  <Text style={[styles.oauthButtonText, { color: colors.text }]}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Test Login */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="code-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.testButtonText}>Test Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['2xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoContainer: {
    marginBottom: SPACING.lg,
    ...SHADOWS.glow,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: RADIUS['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    ...SHADOWS.xl,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: SPACING.md,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  primaryButtonWrapper: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.base,
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2540',
    letterSpacing: 0.25,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    paddingHorizontal: SPACING.base,
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  oauthButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  testButtonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
});
