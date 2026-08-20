import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { LoadingBar } from '../components/LoadingBar';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(true);
      const redirectUrl = Linking.createURL('/auth/callback');
      const authUrl = `${API_URL}/auth/${provider}/mobile?redirect_uri=${encodeURIComponent(redirectUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const accessToken = (parsed.queryParams?.accessToken || parsed.queryParams?.token) as string;
        const refreshToken = (parsed.queryParams?.refreshToken || '') as string;
        const code = parsed.queryParams?.code as string;

        if (code) {
          const { data } = await api.post('/auth/exchange', { code });
          if (data.accessToken) {
            await login(data.accessToken, data.refreshToken || '');
            router.replace('/feed');
            return;
          }
        }

        if (accessToken) {
          await login(accessToken, refreshToken);
          router.replace('/feed');
          return;
        }
      } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
        await Linking.openURL(authUrl).catch(() => {});
      }
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      Alert.alert('Login fejlede', error?.message || `Kunne ikke åbne ${provider} login`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('google');
  const handleFacebookLogin = () => handleOAuthLogin('facebook');
  const handleAppleLogin = () => handleOAuthLogin('apple');

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Fejl', 'Udfyld alle felter');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fejl', 'Adgangskoderne matcher ikke');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Fejl', 'Adgangskoden skal være mindst 8 tegn');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { email, password, name });
      const { accessToken, refreshToken, user } = response.data;

      await login(accessToken, refreshToken);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Oprettelse fejlede', error.response?.data?.error || 'Kunne ikke oprette konto');
    } finally {
      setLoading(false);
    }
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            {/* Premium Header Section */}
            <View style={styles.headerSection}>
              <Logo size={64} variant="light" layout="vertical" subtitle="BLIV EN DEL AF FÆLLESSKABET" />
            </View>

            {/* Premium Form Card */}
            <View style={styles.formCard}>
              {loading && (
                <View style={{ marginBottom: 12 }}>
                  <LoadingBar height={3} glow={true} colors={['#00D4B2', '#FFB800', '#F97316']} />
                </View>
              )}
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textTertiary }]}>FULDE NAVN</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.gray50, borderColor: colors.border }]}>
                    <Ionicons name="person-outline" size={20} color={colors.iconDefault} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Dit fulde navn"
                      placeholderTextColor={colors.textTertiary}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>

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
                      keyboardType="email-address"
                      autoCapitalize="none"
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
                      placeholder="Min. 8 tegn"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
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

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textTertiary }]}>BEKRÆFT ADGANGSKODE</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.gray50, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.iconDefault} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Gentag adgangskode"
                      placeholderTextColor={colors.textTertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.iconDefault}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Signup Button with Golden Gradient */}
                <TouchableOpacity
                  onPress={handleSignup}
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
                        <Text style={styles.primaryButtonText}>Opret konto</Text>
                        <Ionicons name="arrow-forward" size={20} color="#0A2540" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Secondary Button */}
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  onPress={() => router.back()}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                    Har allerede en konto? Log ind
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>eller opret med</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthContainer}>
                <TouchableOpacity
                  style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleAppleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-apple" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                  <Text style={[styles.oauthButtonText, { color: colors.text }]}>Apple</Text>
                </TouchableOpacity>

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

            {/* Terms Text */}
            <Text style={styles.termsText}>
              Ved at oprette en konto accepterer du vores vilkår og betingelser
            </Text>
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['2xl'],
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: 0,
    padding: SPACING.sm,
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING['2xl'],
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
    fontSize: 32,
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
    fontSize: 14,
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
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
});
