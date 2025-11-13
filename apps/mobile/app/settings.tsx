import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, BUTTON_STYLES, CARD_STYLE } from '@/constants/theme';
import i18n from '../i18n';

const API_URL = 'https://fishlog-production.up.railway.app';

export default function SettingsScreen() {
  const router = useRouter();
  const [groqApiKey, setGroqApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    loadSavedApiKey();
  }, []);

  const loadSavedApiKey = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.groqApiKey) {
          setSavedKey(userData.groqApiKey);
          setGroqApiKey(userData.groqApiKey);
        }
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!groqApiKey.trim()) {
      if (Platform.OS === 'web') {
        alert('Indtast venligst en API key');
      } else {
        Alert.alert('Fejl', 'Indtast venligst en API key');
      }
      return;
    }

    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groqApiKey: groqApiKey.trim(),
        }),
      });

      if (response.ok) {
        setSavedKey(groqApiKey.trim());
        if (Platform.OS === 'web') {
          alert(i18n.t('settings.apiKeySaved'));
        } else {
          Alert.alert('Succes', i18n.t('settings.apiKeySaved'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(errorData.error || i18n.t('settings.apiKeyError'));
        } else {
          Alert.alert('Fejl', errorData.error || i18n.t('settings.apiKeyError'));
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Groq API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key" size={24} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.groqApiKey')}</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Indtast din Groq API key for at aktivere AI-funktioner som intelligent fiskeanbefalinger og analyser.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={groqApiKey}
              onChangeText={setGroqApiKey}
              placeholder={i18n.t('settings.groqApiKeyPlaceholder')}
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {savedKey && (
            <View style={styles.savedKeyIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginRight: 6 }} />
              <Text style={styles.savedKeyText}>API key gemt</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveApiKey}
            disabled={loading}
          >
            <Ionicons name="save" size={20} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Gemmer...' : i18n.t('settings.saveApiKey')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.accent} style={{ marginBottom: 8 }} />
          <Text style={styles.infoTitle}>Sådan får du en Groq API key</Text>
          <Text style={styles.infoText}>
            1. Gå til https://console.groq.com{'\n'}
            2. Opret en gratis konto{'\n'}
            3. Gå til "API Keys" i menuen{'\n'}
            4. Klik "Create API Key"{'\n'}
            5. Kopier nøglen og indsæt den her
          </Text>
        </View>

        {/* Theme Section (placeholder for future) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.theme')}</Text>
          </View>
          <Text style={styles.comingSoonText}>Kommer snart...</Text>
        </View>

        {/* Language Section (placeholder for future) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={24} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.language')}</Text>
          </View>
          <Text style={styles.comingSoonText}>Dansk (standard)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    ...CARD_STYLE,
    marginBottom: SPACING.lg,
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
    color: COLORS.textPrimary,
  },
  sectionDescription: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  savedKeyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  savedKeyText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  saveButton: {
    ...BUTTON_STYLES.accent.container,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...BUTTON_STYLES.accent.text,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  infoCard: {
    ...CARD_STYLE,
    backgroundColor: COLORS.accent + '10',
    borderColor: COLORS.accent + '30',
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  comingSoonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
});
