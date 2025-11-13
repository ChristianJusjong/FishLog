import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { BUTTON_STYLES, INPUT_STYLE, LABEL_STYLE } from '@/constants/theme';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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

      await login(accessToken, refreshToken, user);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Oprettelse fejlede', error.response?.data?.error || 'Kunne ikke oprette konto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.logoContainer}>
                <Ionicons name="fish" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Opret konto</Text>
              <Text style={styles.subtitle}>Kom i gang med Hook</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fulde navn</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dit fulde navn"
                    placeholderTextColor={COLORS.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="din@email.dk"
                    placeholderTextColor={COLORS.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adgangskode</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 tegn"
                    placeholderTextColor={COLORS.textTertiary}
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
                      color={COLORS.iconDefault}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bekræft adgangskode</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Gentag adgangskode"
                    placeholderTextColor={COLORS.textTertiary}
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
                      color={COLORS.iconDefault}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Opret konto</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, loading && styles.buttonDisabled]}
                onPress={() => router.back()}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Har allerede en konto? Log ind</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.info}>
              Ved at oprette en konto accepterer du vores vilkår og betingelser
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
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
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: SPACING.sm,
    zIndex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  primaryButton: {
    ...BUTTON_STYLES.accent.container,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    minHeight: 52,
    ...SHADOWS.md,
  },
  primaryButtonText: {
    ...BUTTON_STYLES.accent.text,
  },
  secondaryButton: {
    ...BUTTON_STYLES.ghost.container,
    marginTop: SPACING.md,
    minHeight: 52,
  },
  secondaryButtonText: {
    ...BUTTON_STYLES.ghost.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  info: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
});
