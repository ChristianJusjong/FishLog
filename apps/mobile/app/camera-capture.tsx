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
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

export default function CameraCaptureScreen() {
  const router = useRouter();
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
      console.error('Camera error:', error);
      Alert.alert('Fejl', 'Kunne ikke åbne kamera');
      router.back();
    }
  };

  const uploadAndCreateCatch = async (imageUri: string) => {
    setLoading(true);
    setStatus('Henter GPS-koordinater...');

    try {
      // Get GPS coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setStatus('Komprimerer billede...');

      // Compress image to reduce file size (max 1024px width, 0.6 quality)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // Resize to max 1024px width, maintains aspect ratio
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // 60% quality JPEG
      );

      console.log('Compressed image:', {
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        uri: manipulatedImage.uri.substring(0, 50) + '...'
      });

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

      const sizeInKB = Math.round(base64.length / 1024);
      console.log(`Base64 image size: ${sizeInKB} KB`);

      setStatus('Opretter fangst...');

      // Create initial catch with photo and GPS
      const accessToken = await AsyncStorage.getItem('accessToken');
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
        console.error('Backend error response:', errorBody);
        throw new Error(`Failed to create catch: ${catchResponse.status} - ${errorBody}`);
      }

      const catch_ = await catchResponse.json();

      // Navigate to catch form with the catch ID
      router.replace({
        pathname: '/catch-form',
        params: { catchId: catch_.id, isNew: 'true' }
      });

    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);

      Alert.alert(
        'Fejl',
        'Kunne ikke oprette fangst. Prøv igen.',
        [
          { text: 'Annuller', onPress: () => router.back() },
          { text: 'Prøv igen', onPress: () => uploadAndCreateCatch(imageUri) },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.subtext}>Vent venligst...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📸 Tag billede af fangst</Text>
        <Text style={styles.description}>
          For at logge en fangst skal du først tage et billede. Billedet og GPS-koordinater bliver låst efter upload.
        </Text>

        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={styles.cameraButtonText}>🎣 Åbn kamera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Annuller</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📍 Vigtigt:</Text>
          <Text style={styles.infoText}>
            • Billede og GPS-koordinater kan ikke ændres efter upload{'\n'}
            • Du kan udfylde fangstdata bagefter{'\n'}
            • Gem som kladde hvis du ikke er færdig
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  cameraButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    minWidth: 200,
  },
  cameraButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    includeFontPadding: false,
  },
  infoBox: {
    marginTop: SPACING.xl * 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoTitle: {
    ...TYPOGRAPHY.styles.h3,
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtext: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
