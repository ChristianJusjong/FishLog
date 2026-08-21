import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavConfig } from '@/contexts/NavConfigContext';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';
import OfflineCacheManager from '../components/OfflineCacheManager';
import {
  isBiometricSupported,
  isBiometricsEnabledByUser,
  setBiometricsEnabledByUser,
  getBiometricTypeName,
  authenticateWithBiometrics,
} from '../services/biometricAuth';
import i18n from '../i18n';
import { API_URL } from '@/config/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const { setIsModalOpen } = useNavConfig();
  const styles = useStyles();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState('');
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometri');

  useEffect(() => {
    loadSavedApiKey();
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const supported = await isBiometricSupported();
    setBiometricsAvailable(supported);
    if (supported) {
      const enabled = await isBiometricsEnabledByUser();
      setBiometricsEnabled(enabled);
      const name = await getBiometricTypeName();
      setBiometricName(name);
    }
  };

  const handleToggleBiometrics = async (val: boolean) => {
    if (val) {
      const success = await authenticateWithBiometrics('Bekræft for at aktivere hurtig-login');
      if (success) {
        setBiometricsEnabled(true);
        await setBiometricsEnabledByUser(true);
      }
    } else {
      setBiometricsEnabled(false);
      await setBiometricsEnabledByUser(false);
    }
  };

  const loadSavedApiKey = async () => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const key = userData.geminiApiKey || userData.groqApiKey;
        if (key) {
          setSavedKey(key);
          setGeminiApiKey(key);
        }
        if (userData.profileVisibility) {
          setProfileVisibility(userData.profileVisibility);
        }
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const openGeminiConsole = async () => {
    const url = 'https://aistudio.google.com/app/apikey';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        if (Platform.OS === 'web') {
          alert(`Kunne ikke åbne URL: ${url}`);
        } else {
          Alert.alert('Fejl', `Kunne ikke åbne URL: ${url}`);
        }
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!geminiApiKey.trim()) {
      if (Platform.OS === 'web') {
        alert('Indtast venligst en API key');
      } else {
        Alert.alert('Fejl', 'Indtast venligst en API key');
      }
      return;
    }

    setLoading(true);
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geminiApiKey: geminiApiKey.trim(),
          groqApiKey: geminiApiKey.trim(),
        }),
      });

      if (response.ok) {
        setSavedKey(geminiApiKey.trim());
        if (Platform.OS === 'web') {
          alert(i18n.t('settings.apiKeySaved'));
        } else {
          Alert.alert('Succes', i18n.t('settings.apiKeySaved'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));

        // Check if it's an auth error
        if (response.status === 401) {
          if (Platform.OS === 'web') {
            alert('Din session er udløbet. Log venligst ud og ind igen.');
          } else {
            Alert.alert(
              'Session udløbet',
              'Din session er udløbet. Log venligst ud og ind igen for at fortsætte.',
              [
                { text: 'OK', onPress: () => router.push('/profile') }
              ]
            );
          }
        } else {
          if (Platform.OS === 'web') {
            alert(errorData.error || i18n.t('settings.apiKeyError'));
          } else {
            Alert.alert('Fejl', errorData.error || i18n.t('settings.apiKeyError'));
          }
        }
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
      if (Platform.OS === 'web') {
        alert(i18n.t('settings.apiKeyError'));
      } else {
        Alert.alert('Fejl', i18n.t('settings.apiKeyError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileVisibilityChange = async (newVisibility: string) => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileVisibility: newVisibility,
        }),
      });

      if (response.ok) {
        setProfileVisibility(newVisibility);
        if (Platform.OS === 'web') {
          alert('Privatlivsindstillinger opdateret');
        } else {
          Alert.alert('Succes', 'Privatlivsindstillinger opdateret');
        }
      }
    } catch (error) {
      console.error('Failed to update privacy:', error);
      if (Platform.OS === 'web') {
        alert('Kunne ikke opdatere privatlivsindstillinger');
      } else {
        Alert.alert('Fejl', 'Kunne ikke opdatere privatlivsindstillinger');
      }
    }
  };

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          <WeatherLocationCard />
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Google Gemini API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.geminiApiKey')}</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Indtast din Google Gemini API key for at aktivere AI-funktioner som intelligent fiskeanbefalinger, artsidentifikation og analyser.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={geminiApiKey}
              onChangeText={setGeminiApiKey}
              placeholder={i18n.t('settings.geminiApiKeyPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {savedKey && (
            <View style={styles.savedKeyIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.savedKeyText}>API key gemt</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSaveApiKey}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.saveButtonWrapper, loading && styles.saveButtonDisabled]}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark || '#D4880F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <Ionicons name="save" size={20} color={colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>
                {loading ? 'Gemmer...' : i18n.t('settings.saveApiKey')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <TouchableOpacity style={styles.infoCard} onPress={openGeminiConsole} activeOpacity={0.7}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={styles.infoTitle}>Sådan får du en Google Gemini API key</Text>
            <Ionicons name="open-outline" size={20} color={colors.accent} style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={styles.infoText}>
            1. Gå til https://aistudio.google.com/app/apikey{'\n'}
            2. Log ind med din Google konto{'\n'}
            3. Klik "Create API key"{'\n'}
            4. Vælg eller opret et Google Cloud projekt{'\n'}
            5. Kopier nøglen og indsæt den her
          </Text>
          <View style={styles.clickHintContainer}>
            <Ionicons name="hand-left" size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.clickHintText}>Tryk her for at åbne Google AI Studio</Text>
          </View>
        </TouchableOpacity>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Privatliv</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Vælg hvem der kan se din profil, fangster og FiskeDex.
          </Text>

          <TouchableOpacity
            style={[styles.visibilityOption, profileVisibility === 'public' && styles.visibilityOptionActive]}
            onPress={() => handleProfileVisibilityChange('public')}
          >
            <View style={styles.visibilityContent}>
              <Ionicons
                name="globe-outline"
                size={24}
                color={profileVisibility === 'public' ? colors.primary : colors.textSecondary}
                style={{ marginRight: SPACING.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.visibilityTitle, profileVisibility === 'public' && styles.visibilityTitleActive]}>
                  Offentlig
                </Text>
                <Text style={styles.visibilityDescription}>
                  Alle kan se din profil og fangster
                </Text>
              </View>
              {profileVisibility === 'public' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.visibilityOption, profileVisibility === 'friends' && styles.visibilityOptionActive]}
            onPress={() => handleProfileVisibilityChange('friends')}
          >
            <View style={styles.visibilityContent}>
              <Ionicons
                name="people-outline"
                size={24}
                color={profileVisibility === 'friends' ? colors.primary : colors.textSecondary}
                style={{ marginRight: SPACING.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.visibilityTitle, profileVisibility === 'friends' && styles.visibilityTitleActive]}>
                  Kun venner
                </Text>
                <Text style={styles.visibilityDescription}>
                  Kun dine venner kan se din profil
                </Text>
              </View>
              {profileVisibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.visibilityOption, profileVisibility === 'private' && styles.visibilityOptionActive]}
            onPress={() => handleProfileVisibilityChange('private')}
          >
            <View style={styles.visibilityContent}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={profileVisibility === 'private' ? colors.primary : colors.textSecondary}
                style={{ marginRight: SPACING.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.visibilityTitle, profileVisibility === 'private' && styles.visibilityTitleActive]}>
                  Privat
                </Text>
                <Text style={styles.visibilityDescription}>
                  Kun du kan se din profil
                </Text>
              </View>
              {profileVisibility === 'private' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{i18n.t('settings.theme')}</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {isDark ? 'Mørk tilstand aktiveret - skånsomt for øjnene om natten' : 'Lys tilstand aktiveret - optimal læsbarhed om dagen'}
          </Text>
          <View style={styles.themeToggleContainer}>
            <View style={styles.themeOption}>
              <Ionicons name="sunny" size={20} color={!isDark ? colors.accent : colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.themeOptionText, { color: !isDark ? colors.textPrimary : colors.textSecondary }]}>Lys tilstand</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={Platform.OS === 'android' ? colors.white : undefined}
              ios_backgroundColor={colors.border}
            />
            <View style={styles.themeOption}>
              <Ionicons name="moon" size={20} color={isDark ? colors.accent : colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.themeOptionText, { color: isDark ? colors.textPrimary : colors.textSecondary }]}>Mørk tilstand</Text>
            </View>
          </View>
        </View>

        {/* Biometrics Login Section */}
        {biometricsAvailable && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="finger-print" size={24} color="#00D4B2" style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hurtig-Login ({biometricName})</Text>
            </View>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Lås appen op lynhurtigt med {biometricName} ved kysten.
            </Text>
            <View style={[styles.menuItem, { backgroundColor: colors.surface, justifyContent: 'space-between', paddingVertical: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="shield-checkmark" size={20} color="#00D4B2" />
                <Text style={[styles.menuItemText, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Aktiver {biometricName}
                </Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: colors.border, true: '#00D4B2' }}
                thumbColor={Platform.OS === 'android' ? colors.white : undefined}
              />
            </View>
          </View>
        )}

        {/* Offline Maps & Cache Manager */}
        <View style={styles.section}>
          <OfflineCacheManager />
        </View>

        {/* Navigation Bar Customization Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={24} color={colors.accent} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Menulinje & Genveje</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Vælg hvilke 4 genveje du vil have vist i bundbaren (Kort, AI Guide, Hot Spots, Fangster, Venner mv.).
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.accent + '30', borderWidth: 1 }]}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="options" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.accent, fontWeight: '700' }]}>
                Tilpas Bundmenuen
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Privacy & Safety Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Privatliv & Sikkerhed</Text>
          </View>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/blocked-muted-users')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="ban" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Blokerede & Lydløse Brugere</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Language Section (placeholder for future) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.language')}</Text>
          </View>
          <Text style={styles.comingSoonText}>Dansk (standard)</Text>
        </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: colors.textPrimary,
  },
  sectionDescription: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.styles.body,
    color: colors.textPrimary,
    paddingVertical: SPACING.md,
  },
  savedKeyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  savedKeyText: {
    ...TYPOGRAPHY.styles.small,
    color: colors.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  saveButtonWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  saveButton: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: colors.white,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  infoCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    backgroundColor: colors.accent + '10',
    borderColor: colors.accent + '30',
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  infoText: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  clickHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: colors.accent + '20',
  },
  clickHintText: {
    ...TYPOGRAPHY.styles.small,
    color: colors.accent,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  comingSoonText: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOptionText: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  visibilityOption: {
    backgroundColor: colors.backgroundLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  visibilityOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  visibilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityTitle: {
    ...TYPOGRAPHY.styles.h4,
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
  },
  visibilityTitleActive: {
    color: colors.primary,
  },
  visibilityDescription: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  });
};
