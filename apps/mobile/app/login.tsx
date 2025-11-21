import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { INPUT_STYLE, LABEL_STYLE } from '@/constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

export default function LoginScreen() {
  console.log('===== LOGIN SCREEN RENDERED =====');
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                <Ionicons name="fish" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.primary }]}>Hook</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Din digitale fiskebog</Text>
            </View>

            {/* Email/Password Login */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adgangskode</Text>
                <View style={styles.inputWrapper}>
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

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Log ind</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Opret ny konto</Text>
              </TouchableOpacity>
            </View>

            {/* OAuth Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>eller</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthContainer}>
              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }, loading && styles.buttonDisabled]}
                onPress={handleGoogleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.oauthButtonText, { color: colors.text }]}>Fortsæt med Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }, loading && styles.buttonDisabled]}
                onPress={handleFacebookLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={20} color={colors.text} />
                <Text style={[styles.oauthButtonText, { color: colors.text }]}>Fortsæt med Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Test Login Button */}
            <TouchableOpacity
              style={[styles.testButton, loading && styles.buttonDisabled]}
              onPress={handleTestLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="code-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.testButtonText, { color: colors.textSecondary }]}>Test Login (Udvikler)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: SPACING['2xl'],
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      marginBottom: SPACING.xs,
    },
    subtitle: {
      ...TYPOGRAPHY.styles.body,
    },
    formContainer: {
      width: '100%',
      maxWidth: 400,
      marginBottom: SPACING.lg,
    },
    inputGroup: {
      marginBottom: SPACING.md,
    },
    label: {
      ...LABEL_STYLE,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      ...INPUT_STYLE,
      paddingLeft: SPACING.md,
    },
    inputIcon: {
      marginRight: SPACING.sm,
    },
    input: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.base,
      paddingVertical: SPACING.xs,
    },
    eyeIcon: {
      padding: SPACING.xs,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...SHADOWS.sm,
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.md,
      minHeight: 52,
    },
    primaryButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginTop: SPACING.md,
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      marginVertical: SPACING.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
    },
    dividerText: {
      ...TYPOGRAPHY.styles.small,
      paddingHorizontal: SPACING.md,
    },
    oauthContainer: {
      width: '100%',
      maxWidth: 400,
      gap: SPACING.md,
    },
    oauthButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      minHeight: 52,
      ...SHADOWS.sm,
    },
    oauthButtonText: {
      ...TYPOGRAPHY.styles.button,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      backgroundColor: 'transparent',
      padding: SPACING.md,
      marginTop: SPACING.xl,
    },
    testButtonText: {
      ...TYPOGRAPHY.styles.small,
    },
  });
};
