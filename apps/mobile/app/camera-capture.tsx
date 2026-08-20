import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { TYPOGRAPHY, SPACING, RADIUS } from '@/constants/branding';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/api';
import { logger } from '../utils/logger';
import { extractCatchMetadataFromImage } from '../lib/exifExtractor';

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: SPACING.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
      marginBottom: SPACING.lg,
      textAlign: 'center',
      lineHeight: 32,
    },
    description: {
      ...TYPOGRAPHY.styles.body,
      textAlign: 'center',
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.md,
      lineHeight: 24,
    },
    cameraButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl * 2,
      borderRadius: RADIUS.full,
      marginBottom: SPACING.md,
      minWidth: 200,
    },
    cameraButtonText: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 28,
    },
    cancelButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 22,
    },
    infoBox: {
      marginTop: SPACING.xl * 2,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderLeftWidth: 4,
    },
    infoTitle: {
      ...TYPOGRAPHY.styles.h3,
      marginBottom: SPACING.sm,
      lineHeight: 24,
    },
    infoText: {
      ...TYPOGRAPHY.styles.small,
      lineHeight: 22,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.xl,
    },
    spinner: {
      marginBottom: SPACING.md,
    },
    statusText: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.md,
      textAlign: 'center',
      lineHeight: 28,
    },
    subtext: {
      ...TYPOGRAPHY.styles.body,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
};

export default function CameraCaptureScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Klar til at tage billede');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Automatically open camera when screen loads
    openCamera();
  }, []);

  const requestPermissions = async () => {
    // Request camera permission
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Kamera tilladelse påkrævet',
        'Du skal give tilladelse til kameraet for at tilføje fangster.',
        [
          { text: 'Annuller', onPress: () => router.back(), style: 'cancel' },
          { text: 'Åbn indstillinger', onPress: () => ImagePicker.requestCameraPermissionsAsync() },
        ]
      );
      return false;
    }

    // Request location permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert(
        'Placering påkrævet',
        'GPS-koordinater er nødvendige for at logge fangster.',
        [
          { text: 'Annuller', onPress: () => router.back(), style: 'cancel' },
          { text: 'Åbn indstillinger', onPress: () => Location.requestForegroundPermissionsAsync() },
        ]
      );
      return false;
    }

    return true;
  };

  const openCamera = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await uploadAndCreateCatch(result.assets[0].uri);
      } else {
        router.back();
      }
    } catch (error) {
      logger.error('Camera error:', error);
      Alert.alert('Fejl', 'Kunne ikke åbne kamera');
      router.back();
    }
  };

  const openGalleryWithExif = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage(asset.uri);
        const exifData = await extractCatchMetadataFromImage(asset);
        await uploadAndCreateCatch(asset.uri, exifData.latitude, exifData.longitude);
      }
    } catch (error) {
      logger.error('Gallery picker error:', error);
      Alert.alert('Fejl', 'Kunne ikke hente billede fra galleriet');
    }
  };

  const uploadAndCreateCatch = async (imageUri: string, exifLat?: number, exifLng?: number) => {
    setLoading(true);
    setStatus(exifLat && exifLng ? 'Bruger fotoets EXIF GPS...' : 'Henter GPS-koordinater...');

    try {
      let latitude = exifLat;
      let longitude = exifLng;

      if (latitude === undefined || longitude === undefined) {
        // Get current GPS coordinates if not in EXIF
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(() => null);

        latitude = location?.coords?.latitude || 55.6761;
        longitude = location?.coords?.longitude || 12.5683;
      }

      setStatus('Komprimerer billede...');

      // Compress image to reduce file size (max 1024px width, 0.6 quality)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // Resize to max 1024px width, maintains aspect ratio
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // 60% quality JPEG
      );

      setStatus('Uploader billede...');

      // Convert compressed image to base64
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setStatus('Opretter fangst...');

      // Create initial catch with photo and GPS
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const catchResponse = await fetch(`${API_URL}/catches/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          photoUrl: base64,
          latitude,
          longitude,
        }),
      });

      if (!catchResponse.ok) {
        const errorBody = await catchResponse.text();
        logger.error('Backend error response:', errorBody);
        throw new Error(`Failed to create catch: ${catchResponse.status} - ${errorBody}`);
      }

      const catch_ = await catchResponse.json();

      // Navigate to catch form with the catch ID
      router.replace({
        pathname: '/catch-form',
        params: { catchId: catch_.id, isNew: 'true' }
      });

    } catch (error) {
      logger.error('Upload error:', error);
      setLoading(false);

      Alert.alert(
        'Fejl',
        'Kunne ikke oprette fangst. Prøv igen.',
        [
          { text: 'Annuller', onPress: () => router.back() },
          { text: 'Prøv igen', onPress: () => uploadAndCreateCatch(imageUri, exifLat, exifLng) },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
          <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>Vent venligst...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Tag billede af fangst</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Tag et foto med kameraet nu, eller vælg et eksisterende foto fra galleriet med automatisk EXIF GPS-udfyld.
        </Text>

        <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.primary }]} onPress={openCamera}>
          <Text style={[styles.cameraButtonText, { color: colors.white }]}>📸 Åbn kamera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraButton, { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.accent, marginTop: 6 }]}
          onPress={openGalleryWithExif}
        >
          <Text style={[styles.cameraButtonText, { color: colors.accent, fontSize: 16 }]}>🖼️ Vælg fra galleri (EXIF Auto-GPS)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuller</Text>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderLeftColor: colors.accent }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Smart Auto-Udfyld:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Vælger du et billede fra galleriet, aflæses GPS-lokation og fangstdato automatisk fra billedets EXIF-data.{'\n'}
            • Billede og GPS låses automatisk til verifikation.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
