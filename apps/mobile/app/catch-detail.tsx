import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import MapPicker from '../components/MapPicker';
import { shareCatchToSocial, shareViaDialog } from '@/lib/socialShare';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.backgroundLight,
    },
    backButton: {
      alignSelf: 'flex-start',
      margin: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
    },
    backButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    loadingText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING['2xl'],
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.error,
      textAlign: 'center',
      marginTop: SPACING['2xl'],
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: colors.surface,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: SPACING.md,
    },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
    },
    catchDate: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    visibilityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.lg,
    },
    visibilityText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    catchImageLarge: {
      width: '100%',
      height: 400,
      maxHeight: Dimensions.get('window').height * 0.5,
      backgroundColor: colors.backgroundLight,
    },
    catchContent: {
      backgroundColor: colors.surface,
      padding: SPACING.lg,
      marginTop: 1,
    },
    catchSpecies: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING.md,
    },
    catchDetailsRow: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      ...SHADOWS.sm,
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 100,
    },
    infoValue: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.text,
      flex: 1,
    },
    notesContainer: {
      marginTop: SPACING.lg,
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.lg,
    },
    notesLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    notesText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.text,
      lineHeight: 24,
    },
    mapContainer: {
      marginTop: SPACING.lg,
    },
    mapLabel: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.md,
    },
    map: {
      width: '100%',
      height: 300,
      borderRadius: RADIUS.lg,
    },
    mapPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.lg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    mapPlaceholderText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    coordinatesText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.text,
    },
    debugText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textTertiary,
      marginBottom: SPACING.sm,
      fontFamily: 'monospace',
    },
    actionButtons: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      padding: 16,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.sm,
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    shareButton: {
      backgroundColor: colors.accent,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.glow,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
    },
    weatherContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      ...SHADOWS.sm,
    },
    weatherTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    weatherGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    weatherItem: {
      width: '48%',
      backgroundColor: colors.backgroundLight,
      padding: 12,
      borderRadius: RADIUS.md,
      alignItems: 'center',
    },
    weatherLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 2,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    weatherValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  });
};

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

interface WeatherData {
  id: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  pressure?: number;
  humidity?: number;
  conditions?: string;
  moonPhase?: string;
  tideState?: string;
}

interface Catch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user: User;
  likesCount?: number;
  commentsCount?: number;
  isLikedByMe?: boolean;
  comments?: Comment[];
  visibility?: string;
}

export default function CatchDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams();
  const catchId = params.id as string;

  const [catchData, setCatchData] = useState<Catch | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchCatchDetail();
    fetchCurrentUser();
    fetchWeatherData();
  }, [catchId]);

  const fetchCurrentUser = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchCatchDetail = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatchData(data);
      } else {
        if (Platform.OS === 'web') {
          alert('Fejl: Kunne ikke hente fangst');
        } else {
          Alert.alert('Fejl', 'Kunne ikke hente fangst');
        }
        router.back();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    setLoadingWeather(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/weather/${catchId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleShareCatch = async () => {
    if (!catchData) return;

    setSharing(true);
    try {
      await shareViaDialog(catchData.id, {
        species: catchData.species,
        lengthCm: catchData.lengthCm,
        weightKg: catchData.weightKg,
        photoUrl: catchData.photoUrl,
        date: new Date(catchData.createdAt).toLocaleDateString('da-DK'),
        userName: catchData.user.name,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Fejl', 'Kunne ikke dele fangst');
    } finally {
      setSharing(false);
    }
  };

  const deleteCatch = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Er du sikker på, at du vil slette denne fangst?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Slet fangst',
            'Er du sikker på, at du vil slette denne fangst?',
            [
              { text: 'Annuller', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Slet', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('Fangst slettet');
        } else {
          Alert.alert('Succes', 'Fangst slettet');
        }
        router.back();
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.accent, colors.accentDark || '#D4880F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Ionicons name="fish" size={40} color={colors.primary} />
        </LinearGradient>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
        <Text style={styles.loadingText}>Indlæser fangst...</Text>
      </View>
    );
  }

  if (!catchData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Fangst ikke fundet</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Tilbage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnCatch = currentUserId === catchData.user.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User info */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          {catchData.user.avatar && (
            <Image source={{ uri: catchData.user.avatar }} style={styles.userAvatar} />
          )}
          <View>
            <Text style={styles.userName}>{catchData.user.name}</Text>
            <Text style={styles.catchDate}>
              {new Date(catchData.createdAt).toLocaleDateString('da-DK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        {catchData.visibility && (
          <View style={styles.visibilityBadge}>
            <Ionicons
              name={
                catchData.visibility === 'private' ? 'lock-closed' :
                catchData.visibility === 'friends' ? 'people' :
                'globe'
              }
              size={14}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.visibilityText}>
              {catchData.visibility === 'private' && 'Privat'}
              {catchData.visibility === 'friends' && 'Venner'}
              {catchData.visibility === 'public' && 'Offentlig'}
            </Text>
          </View>
        )}
      </View>

      {/* Catch photo - full width, large */}
      {catchData.photoUrl && (
        <Image
          source={{ uri: catchData.photoUrl }}
          style={styles.catchImageLarge}
          resizeMode="contain"
        />
      )}

      {/* Catch details */}
      <View style={styles.catchContent}>
        <Text style={styles.catchSpecies}>{catchData.species}</Text>

        <View style={styles.catchDetailsRow}>
          {catchData.lengthCm && (
            <View style={styles.statBox}>
              <Ionicons name="resize" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Længde</Text>
              <Text style={styles.statValue}>{catchData.lengthCm} cm</Text>
            </View>
          )}
          {catchData.weightKg && (
            <View style={styles.statBox}>
              <Ionicons name="scale-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Vægt</Text>
              <Text style={styles.statValue}>{Math.round(catchData.weightKg * 1000)} g</Text>
            </View>
          )}
        </View>

        {/* Weather Information */}
        {weatherData && (
          <View style={styles.weatherContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="partly-sunny" size={20} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.weatherTitle}>Vejrforhold</Text>
            </View>
            <View style={styles.weatherGrid}>
              {weatherData.temperature !== undefined && (
                <View style={styles.weatherItem}>
                  <Ionicons name="thermometer" size={20} color="#F59E0B" />
                  <Text style={styles.weatherLabel}>Temperatur</Text>
                  <Text style={styles.weatherValue}>{Math.round(weatherData.temperature)}°C</Text>
                </View>
              )}
              {weatherData.windSpeed !== undefined && (
                <View style={styles.weatherItem}>
                  <Ionicons name="flag" size={20} color="#3B82F6" />
                  <Text style={styles.weatherLabel}>Vind</Text>
                  <Text style={styles.weatherValue}>
                    {Math.round(weatherData.windSpeed)} m/s {weatherData.windDirection}
                  </Text>
                </View>
              )}
              {weatherData.humidity !== undefined && (
                <View style={styles.weatherItem}>
                  <Ionicons name="water" size={20} color="#06B6D4" />
                  <Text style={styles.weatherLabel}>Fugtighed</Text>
                  <Text style={styles.weatherValue}>{weatherData.humidity}%</Text>
                </View>
              )}
              {weatherData.pressure !== undefined && (
                <View style={styles.weatherItem}>
                  <Ionicons name="speedometer" size={20} color="#8B5CF6" />
                  <Text style={styles.weatherLabel}>Tryk</Text>
                  <Text style={styles.weatherValue}>{weatherData.pressure} hPa</Text>
                </View>
              )}
              {weatherData.moonPhase && (
                <View style={styles.weatherItem}>
                  <Ionicons name="moon" size={20} color="#A855F7" />
                  <Text style={styles.weatherLabel}>Månefase</Text>
                  <Text style={styles.weatherValue}>{weatherData.moonPhase}</Text>
                </View>
              )}
              {weatherData.conditions && (
                <View style={styles.weatherItem}>
                  <Ionicons name="cloud" size={20} color="#9CA3AF" />
                  <Text style={styles.weatherLabel}>Forhold</Text>
                  <Text style={styles.weatherValue}>{weatherData.conditions}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {catchData.bait && (
          <View style={styles.infoRow}>
            <Ionicons name="bug" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>Agn:</Text>
            <Text style={styles.infoValue}>{catchData.bait}</Text>
          </View>
        )}
        {catchData.rig && (
          <View style={styles.infoRow}>
            <Ionicons name="fish-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>Forfang:</Text>
            <Text style={styles.infoValue}>{catchData.rig}</Text>
          </View>
        )}
        {catchData.technique && (
          <View style={styles.infoRow}>
            <Ionicons name="flag" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>Teknik:</Text>
            <Text style={styles.infoValue}>{catchData.technique}</Text>
          </View>
        )}

        {catchData.notes && (
          <View style={styles.notesContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="document-text" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.notesLabel}>Noter</Text>
            </View>
            <Text style={styles.notesText}>{catchData.notes}</Text>
          </View>
        )}

        {/* Map */}
        {catchData.latitude && catchData.longitude ? (
          <View style={styles.mapContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="location" size={20} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.mapLabel}>Fangststed</Text>
            </View>
            <Text style={styles.debugText}>
              Koordinater: {catchData.latitude.toFixed(6)}, {catchData.longitude.toFixed(6)}
            </Text>
            <MapPicker
              latitude={catchData.latitude}
              longitude={catchData.longitude}
              onLocationSelect={() => {}}
              readOnly={true}
            />
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="location" size={20} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.mapLabel}>Fangststed</Text>
            </View>
            <Text style={styles.debugText}>Ingen koordinater tilgængelige</Text>
          </View>
        )}
      </View>

      {/* Action buttons - only show for own catches */}
      {isOwnCatch && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={handleShareCatch}
            disabled={sharing}
          >
            <Ionicons name="share-social" size={20} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{sharing ? 'Deler...' : 'Del'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.push(`/edit-catch?id=${catchId}`)}
          >
            <Ionicons name="create" size={20} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Rediger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={deleteCatch}
          >
            <Ionicons name="trash" size={20} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Slet</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}