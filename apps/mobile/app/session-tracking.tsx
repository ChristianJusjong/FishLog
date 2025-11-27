import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  altitude?: number;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    headerSubtitle: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    mapContainer: {
      height: SCREEN_HEIGHT * 0.4,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statBox: {
      alignItems: 'center',
    },
    statValue: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    controlsContainer: {
      padding: SPACING.lg,
    },
    sessionTypeContainer: {
      marginBottom: SPACING.lg,
    },
    sessionTypeLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    sessionTypes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    sessionTypeButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    sessionTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sessionTypeButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
    },
    sessionTypeButtonTextActive: {
      color: '#FFFFFF',
    },
    startButton: {
      backgroundColor: colors.success,
      paddingVertical: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    stopButton: {
      backgroundColor: colors.error,
      paddingVertical: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    pauseButton: {
      backgroundColor: colors.warning,
      paddingVertical: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
      color: '#FFFFFF',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: SPACING.lg,
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.md,
      zIndex: 1,
    },
    catchesButton: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 60,
      height: 60,
      borderRadius: RADIUS.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.lg,
      zIndex: 1,
    },
    catchCount: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: colors.error,
      borderRadius: RADIUS.full,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catchCountText: {
      ...TYPOGRAPHY.styles.caption,
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
};

export default function SessionTracking() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [sessionType, setSessionType] = useState<string>('shore');
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [catchCount, setCatchCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<Date | null>(null);

  const sessionTypes = [
    { id: 'shore', label: 'Kyst', icon: 'water' },
    { id: 'boat', label: 'Båd', icon: 'boat' },
    { id: 'kayak', label: 'Kajak', icon: 'boat' },
    { id: 'wade', label: 'Vadning', icon: 'walk' },
    { id: 'ice', label: 'Is', icon: 'snow' },
  ];

  useEffect(() => {
    requestLocationPermission();
    return () => {
      stopTracking();
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse nødvendig', 'Vi har brug for adgang til din placering for at spore din fisketrip.');
      return;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const startSession = async () => {
    try {
      const { data } = await api.post('/sessions/start', {
        sessionType,
        title: `${sessionTypes.find(t => t.id === sessionType)?.label} tur`,
        visibility: 'public',
      });

      setSessionId(data.session.id);
      setIsTracking(true);
      setIsPaused(false);
      startTime.current = new Date();

      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (location) => {
          if (!isPaused) {
            const point: RoutePoint = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: new Date().toISOString(),
              speed: location.coords.speed || undefined,
              altitude: location.coords.altitude || undefined,
            };

            setRoute(prev => [...prev, point]);
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });

            // Send to backend
            api.patch(`/sessions/${data.session.id}/track`, point).catch(err => {
              console.error('Failed to track point:', err);
            });
          }
        }
      );

      // Start duration counter
      durationInterval.current = setInterval(() => {
        if (!isPaused && startTime.current) {
          const elapsed = Math.floor((Date.now() - startTime.current.getTime()) / 1000 / 60);
          setDuration(elapsed);
        }
      }, 1000);

      Alert.alert('Session startet', 'Din fisketrip spores nu!');
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Fejl', 'Kunne ikke starte session');
    }
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
    Alert.alert(isPaused ? 'Genoptaget' : 'Pause', isPaused ? 'Session genoptaget' : 'Session sat på pause');
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const endSession = async () => {
    Alert.alert(
      'Afslut session',
      'Er du sikker på, at du vil afslutte denne fisketrip?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Afslut',
          style: 'destructive',
          onPress: async () => {
            try {
              stopTracking();

              if (sessionId) {
                await api.post(`/sessions/${sessionId}/end`);
                Alert.alert('Session afsluttet', 'Din fisketrip er gemt!', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/feed'),
                  },
                ]);
              }

              // Reset state
              setIsTracking(false);
              setSessionId(null);
              setRoute([]);
              setDuration(0);
              setDistance(0);
              setCatchCount(0);
            } catch (error) {
              console.error('Failed to end session:', error);
              Alert.alert('Fejl', 'Kunne ikke afslutte session');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}t ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  // Calculate distance from route
  useEffect(() => {
    if (route.length > 1) {
      let totalDistance = 0;
      for (let i = 1; i < route.length; i++) {
        totalDistance += calculateDistance(
          route[i - 1].lat,
          route[i - 1].lng,
          route[i].lat,
          route[i].lng
        );
      }
      setDistance(totalDistance);
    }
  }, [route]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isTracking ? 'Sporer fisketrip' : 'Start fisketrip'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isTracking
              ? isPaused
                ? 'På pause'
                : 'Aktiv'
              : 'Vælg turtype og start sporing'}
          </Text>
        </View>

        {/* Map View */}
        {currentLocation && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={currentLocation}
              showsUserLocation
              followsUserLocation={isTracking}
            >
              {route.length > 0 && (
                <Polyline
                  coordinates={route.map(p => ({
                    latitude: p.lat,
                    longitude: p.lng,
                  }))}
                  strokeColor={colors.primary}
                  strokeWidth={3}
                />
              )}
              {route.length > 0 && (
                <>
                  <Marker
                    coordinate={{
                      latitude: route[0].lat,
                      longitude: route[0].lng,
                    }}
                    title="Start"
                    pinColor="green"
                  />
                  {route.length > 1 && (
                    <Marker
                      coordinate={{
                        latitude: route[route.length - 1].lat,
                        longitude: route[route.length - 1].lng,
                      }}
                      title="Nuværende position"
                      pinColor="blue"
                    />
                  )}
                </>
              )}
            </MapView>
          </View>
        )}

        {/* Stats */}
        {isTracking && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statLabel}>Varighed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatDistance(distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{catchCount}</Text>
              <Text style={styles.statLabel}>Fangster</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!isTracking && (
            <>
              <View style={styles.sessionTypeContainer}>
                <Text style={styles.sessionTypeLabel}>Vælg turtype:</Text>
                <View style={styles.sessionTypes}>
                  {sessionTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.sessionTypeButton,
                        sessionType === type.id && styles.sessionTypeButtonActive,
                      ]}
                      onPress={() => setSessionType(type.id)}
                    >
                      <Text
                        style={[
                          styles.sessionTypeButtonText,
                          sessionType === type.id && styles.sessionTypeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={startSession}>
                <Text style={styles.buttonText}>Start fisketrip</Text>
              </TouchableOpacity>
            </>
          )}

          {isTracking && (
            <>
              <TouchableOpacity style={styles.pauseButton} onPress={pauseSession}>
                <Text style={styles.buttonText}>{isPaused ? 'Genoptag' : 'Pause'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.stopButton} onPress={endSession}>
                <Text style={styles.buttonText}>Afslut fisketrip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Quick catch button */}
      {isTracking && (
        <TouchableOpacity
          style={styles.catchesButton}
          onPress={() => router.push('/catch-form')}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
          {catchCount > 0 && (
            <View style={styles.catchCount}>
              <Text style={styles.catchCountText}>{catchCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
