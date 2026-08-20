import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import * as ImagePicker from 'expo-image-picker';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: SPACING.lg,
      backgroundColor: colors.backgroundLight,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: SPACING.lg,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
      fontSize: 32,
      marginTop: SPACING['2xl'],
      marginBottom: SPACING.lg,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.md,
      marginBottom: SPACING.lg,
    },
    formGroup: {
      marginBottom: SPACING.lg,
    },
    label: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    hint: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textTertiary,
      marginTop: SPACING.xs,
    },
    disabledText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textSecondary,
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
    },
    saveButton: {
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.glow,
    },
    saveButtonGradient: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
    },
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.glow,
    },
    cancelButton: {
      backgroundColor: colors.gray600,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
      ...SHADOWS.sm,
    },
    disabledButton: {
      opacity: 0.6,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
      textAlign: 'center',
    },
    avatarPreview: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: SPACING.md,
      alignSelf: 'center',
      borderWidth: 3,
      borderColor: colors.primary,
    },
    uploadButton: {
      backgroundColor: colors.primary,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    uploadButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
    },
    removeButton: {
      backgroundColor: colors.error,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
    },
    removeButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
};

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || user?.groqApiKey || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if any changes have been made
  const hasChanges = name !== (user?.name || '') || avatar !== (user?.avatar || '') || geminiApiKey !== (user?.geminiApiKey || user?.groqApiKey || '');

  const handleImageUpload = async () => {
    if (Platform.OS === 'web') {
      try {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (!file) {
            return;
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            Alert.alert('Fejl', 'Kun billedfiler er tilladt');
            return;
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            Alert.alert('Fejl', 'Billedet er for stort. Max 5MB.');
            return;
          }

          setUploadingImage(true);
          try {
            const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload to backend
            const response = await fetch(`${API_URL}/upload/image`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              setAvatar(data.url);
              Alert.alert('Succes', 'Billede uploadet!');
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Upload failed:', response.status, errorData);
              Alert.alert('Fejl', errorData.error || `HTTP ${response.status}: Kunne ikke uploade billede`);
            }
          } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
            Alert.alert('Fejl', `Kunne ikke uploade billede: ${errorMessage}`);
          } finally {
            setUploadingImage(false);
          }
        };

        input.click();
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Fejl', 'Kunne ikke uploade billede');
      }
    } else {
      // Mobile: Give user choice between Camera and Gallery
      Alert.alert(
        'Vælg profilbillede',
        'Vil du tage et nyt foto eller vælge fra dit galleri?',
        [
          {
            text: '📸 Tag Foto',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Kamera tilladelse', 'Giv venligst tilladelse til kameraet');
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.6,
                  base64: true,
                });
                if (!result.canceled && result.assets[0]) {
                  setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
                }
              } catch (error) {
                console.error('Camera avatar error:', error);
                Alert.alert('Fejl', 'Kunne ikke åbne kamera');
              }
            },
          },
          {
            text: '🖼️ Vælg fra Galleri',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit billedbibliotek.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.6,
                  base64: true,
                });
                if (!result.canceled && result.assets[0]) {
                  setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
                }
              } catch (error) {
                console.error('Gallery avatar error:', error);
                Alert.alert('Fejl', 'Kunne ikke vælge billede');
              }
            },
          },
          { text: 'Annuller', style: 'cancel' },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fejl', 'Navn er påkrævet');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({
        name,
        avatar: avatar || '',
        geminiApiKey: geminiApiKey || '',
        groqApiKey: geminiApiKey || '',
      });
      await refreshUser();
      Alert.alert('Succes', 'Profil opdateret!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Fejl', 'Kunne ikke opdatere profil. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }} edges={['top']}>
        <LinearGradient
          colors={[colors.accent, colors.accentDark || '#D4880F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Ionicons name="person" size={40} color={colors.primary} />
        </LinearGradient>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundLight }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Rediger Profil</Text>

      <View style={styles.card}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Navn *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Dit navn"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Profilbillede</Text>

          {avatar && (
            <Image
              source={{ uri: avatar }}
              style={styles.avatarPreview}
            />
          )}

          <TouchableOpacity
            style={[styles.uploadButton, uploadingImage && styles.disabledButton]}
            onPress={handleImageUpload}
            disabled={uploadingImage || loading}
          >
            {uploadingImage ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.uploadButtonText}>
                📷 {avatar ? 'Skift billede' : 'Upload billede'}
              </Text>
            )}
          </TouchableOpacity>

          {avatar && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setAvatar('')}
              disabled={loading || uploadingImage}
            >
              <Text style={styles.removeButtonText}>🗑️ Fjern billede</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>Valgfri: Upload et profilbillede (max 5MB)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.disabledText}>{user.email}</Text>
          <Text style={styles.hint}>Email kan ikke ændres</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Google Gemini API Key</Text>
          <TextInput
            style={styles.input}
            value={geminiApiKey}
            onChangeText={setGeminiApiKey}
            placeholder="AIzaSy..."
            secureTextEntry
            editable={!loading}
          />
          <Text style={styles.hint}>
            Valgfri: Tilføj din egen Google Gemini API key for AI-funktioner.{'\n'}
            Få din gratis API key på: https://aistudio.google.com/app/apikey
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, (loading || !hasChanges) && styles.disabledButton]}
        onPress={handleSave}
        disabled={loading || !hasChanges}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.accent, colors.accentDark || '#D4880F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primary }]}>💾 Gem Ændringer</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Luk</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
