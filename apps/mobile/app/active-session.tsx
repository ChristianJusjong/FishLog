import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import * as Haptics from 'expo-haptics';
import PageLayout from '../components/PageLayout';
import SlideToConfirm from '../components/SlideToConfirm';
import VoiceCatchModal from '../components/VoiceCatchModal';
import { ParsedVoiceCatch } from '../lib/voiceCatchParser';
import { useSession } from '../contexts/SessionContext';
import { useTheme } from '../contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../lib/api';
import { findLocationsInRadius, getWaterTypeLabel, FishingLocation } from '../data/fishingLocations';
import { checkNearbyProtectedZone } from '../data/fishingRegulations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SESSION_TYPES: Record<string, { label: string; icon: string }> = {
  shore: { label: 'Kyst', icon: 'fish' },
  wade: { label: 'Vadning', icon: 'water' },
  boat: { label: 'Båd', icon: 'boat' },
  kayak: { label: 'Kajak', icon: 'boat' },
  ice: { label: 'Is', icon: 'snow' },
};

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { colors, theme, setThemeMode, isNightVision } = useTheme();
  const styles = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);

  const { session, isActive, startSession, endSession, addStrike, refreshSession, loading } = useSession();

  const [currentPage, setCurrentPage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [oledSaverMode, setOledSaverMode] = useState(false);
  const [currentSpeedKnots, setCurrentSpeedKnots] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [heading, setHeading] = useState(0);
  const [selectedSessionType, setSelectedSessionType] = useState<'shore' | 'boat' | 'kayak' | 'ice' | 'wade'>('shore');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<FishingLocation | null>(null);

  // Find nearby known fishing spots within 25km
  const nearbyKnownSpots = useMemo(() => {
    if (!userLocation) return [];
    return findLocationsInRadius(userLocation.latitude, userLocation.longitude, 25).slice(0, 10);
  }, [userLocation]);

  // Realtime geofence check for Danish river mouth protected zones
  const nearbyProtectedZone = useMemo(() => {
    if (!userLocation) return null;
    return checkNearbyProtectedZone(userLocation.latitude, userLocation.longitude, 1200);
  }, [userLocation]);

  // Update elapsed time every second
  useEffect(() => {
    if (!isActive || !session?.startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.startTime!);
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, session?.startTime]);

  // Real-time speed and location watcher
  useEffect(() => {
    if (!isActive) return;
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 3 },
          (loc) => {
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            const speedMps = Math.max(0, loc.coords.speed || 0);
            setCurrentSpeedKnots(+(speedMps * 1.94384).toFixed(1));
            setCurrentSpeedKmh(+(speedMps * 3.6).toFixed(1));
            if (loc.coords.heading !== null && loc.coords.heading >= 0) {
              setHeading(Math.round(loc.coords.heading));
            }
          }
        );
      } catch (err) {
        console.error('Speed watcher error:', err);
      }
    })();
    return () => {
      subscription?.remove();
    };
  }, [isActive]);

  // Refresh session data periodically
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  // Hide system navigation bar when focused, restore when leaving
  useFocusEffect(
    React.useCallback(() => {
      // Hide navigation bar on mount
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('overlay-swipe');
      }
      StatusBar.setHidden(true, 'slide');

      // Restore navigation bar on unmount
      return () => {
        if (Platform.OS === 'android') {
          NavigationBar.setVisibilityAsync('visible');
        }
        StatusBar.setHidden(false, 'slide');
      };
    }, [])
  );

  // Show start modal if no active session
  useEffect(() => {
    if (!isActive) {
      setShowStartModal(true);
    }
  }, [isActive]);

  const handleApplyVoiceCatch = (data: ParsedVoiceCatch) => {
    router.push({
      pathname: '/catch-form',
      params: {
        species: data.species || '',
        length: data.lengthCm ? String(data.lengthCm) : '',
        weight: data.weightKg ? String(data.weightKg) : '',
        bait: data.bait || '',
        released: data.released !== undefined ? String(data.released) : '',
        notes: data.notes || '',
      },
    });
  };

  const handleStartSession = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await startSession(selectedSessionType);
      setShowStartModal(false);
    } catch (error: any) {
      Alert.alert('Fejl', error.message || 'Kunne ikke starte session');
    }
  };

  const handleEndSession = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      await endSession();
      setShowEndModal(false);
      router.replace('/feed');
    } catch (error: any) {
      Alert.alert('Fejl', error.message || 'Kunne ikke afslutte session');
    }
  };

  const handleAddStrike = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      await addStrike();
      Alert.alert('Hug registreret!', `Du har nu ${(session?.strikes || 0) + 1} hug i denne session`);
    } catch (error: any) {
      Alert.alert('Fejl', error.message || 'Kunne ikke registrere hug');
    }
  };

  const handleRegisterCatch = () => {
    router.push('/camera-capture');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const scrollToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
  };

  const fetchAiAdvice = async () => {
    if (!userLocation) return;

    setLoadingAi(true);
    try {
      const { data } = await api.post('/ai/fishing-advice', {
        location: userLocation,
        session: {
          type: session?.sessionType,
          duration: elapsedTime,
          strikes: session?.strikes,
          catches: session?.catches,
        },
      });

      setAiAdvice(data.advice || 'Ingen råd tilgængelige');
    } catch (error) {
      console.error('Failed to fetch AI advice:', error);
      setAiAdvice('Kunne ikke hente AI-råd. Prøv igen senere.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Load AI advice when page 2 (AI Guide) becomes visible
  useEffect(() => {
    if (currentPage === 2 && !aiAdvice && userLocation) {
      fetchAiAdvice();
    }
  }, [currentPage, userLocation]);

  if (!isActive || !session) {
    return (
      <PageLayout showBottomNav={false}>
        <View style={styles.container}>
          <Modal visible={showStartModal} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Start Fisketur</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Vælg type af fisketur
                </Text>

                <View style={styles.sessionTypeGrid}>
                  {Object.entries(SESSION_TYPES).map(([key, { label, icon }]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sessionTypeButton,
                        {
                          backgroundColor: selectedSessionType === key ? colors.primary : colors.surface,
                          borderColor: selectedSessionType === key ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedSessionType(key as any)}
                    >
                      <Ionicons
                        name={icon as any}
                        size={32}
                        color={selectedSessionType === key ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.sessionTypeLabel,
                          {
                            color: selectedSessionType === key ? colors.white : colors.text,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartSession}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.accent, colors.accentDark || '#D4880F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <Ionicons name="play" size={24} color={colors.primary} />
                    <Text style={[styles.startButtonText, { color: colors.primary }]}>
                      {loading ? 'Starter...' : 'Start Session'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Annuller
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBottomNav={false}>
      <View style={[styles.container, oledSaverMode && { backgroundColor: '#000000' }]}>
        {/* Header with session stats */}
        <View style={[styles.header, { backgroundColor: oledSaverMode ? '#0A0A0A' : colors.surface, borderBottomColor: oledSaverMode ? '#222222' : colors.border }]}>
          <View style={styles.headerTop}>
            <View style={styles.sessionInfo}>
              <Ionicons name={SESSION_TYPES[session.sessionType].icon as any} size={20} color={oledSaverMode ? '#00D4B2' : colors.primary} />
              <Text style={[styles.sessionTypeText, { color: oledSaverMode ? '#FFFFFF' : colors.text }]}>
                {SESSION_TYPES[session.sessionType].label}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {/* Voice-Log Quick Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setShowVoiceModal(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0, 212, 178, 0.15)',
                  borderWidth: 1,
                  borderColor: '#00D4B2',
                }}
              >
                <Ionicons name="mic" size={13} color="#00D4B2" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#00D4B2' }}>Tale-Log</Text>
              </TouchableOpacity>

              {/* Night-Vision Stealth Toggle */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setThemeMode(isNightVision ? 'dark' : 'nightVision');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: isNightVision ? '#EF444425' : colors.backgroundLight,
                  borderWidth: 1,
                  borderColor: isNightVision ? '#EF4444' : colors.border,
                }}
              >
                <Ionicons name="eye" size={13} color={isNightVision ? '#EF4444' : colors.textSecondary} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: isNightVision ? '#EF4444' : colors.textSecondary }}>
                  {isNightVision ? 'Nat-Rødlys' : 'Natsyn'}
                </Text>
              </TouchableOpacity>

              {/* OLED / Battery Saver */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setOledSaverMode(!oledSaverMode);
                }}
                style={{
                  padding: 6,
                  borderRadius: 12,
                  backgroundColor: oledSaverMode ? '#00D4B220' : colors.backgroundLight,
                  borderWidth: 1,
                  borderColor: oledSaverMode ? '#00D4B2' : colors.border,
                }}
              >
                <Ionicons name={oledSaverMode ? 'battery-charging' : 'battery-half'} size={14} color={oledSaverMode ? '#00D4B2' : colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowEndModal(true)} style={styles.endButton}>
                <Ionicons name="stop-circle-outline" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hug:</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>{session.strikes}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fangster:</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{session.catches}</Text>
            </View>
          </View>

          {/* Live Strava-like Friends Sharing Beacon */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#00D4B215',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            marginTop: 8,
            gap: 6,
          }}>
            <Ionicons name="radio" size={14} color="#00D4B2" />
            <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600', flex: 1 }}>
              Live session aktiv – position & hug deles i realtid med venner
            </Text>
          </View>
        </View>

        {/* Page indicator */}
        <View style={styles.pageIndicator}>
          {[0, 1, 2].map((page) => (
            <TouchableOpacity key={page} onPress={() => scrollToPage(page)} style={styles.dotContainer}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: currentPage === page ? colors.primary : colors.border,
                    width: currentPage === page ? 24 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Swipeable pages */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {/* Page 1: Dashboard */}
          <ScrollView style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.pageContent}>
              {/* Geofence Protected River Mouth Warning */}
              {nearbyProtectedZone && (
                <View style={{
                  backgroundColor: nearbyProtectedZone.isInside ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)',
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <Ionicons name={nearbyProtectedZone.isInside ? 'ban' : 'warning'} size={24} color="#FFFFFF" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                      {nearbyProtectedZone.isInside ? '🚨 DU ER I ET FREDNINGSBÆLTE!' : `⚠️ FREDNINGSZONE: ${nearbyProtectedZone.distanceMeters}m`}
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 1 }}>
                      {nearbyProtectedZone.zone.name} ({nearbyProtectedZone.zone.periodText})
                    </Text>
                  </View>
                </View>
              )}

              {/* Trolling & Drift Velocity Cockpit HUD */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: '#00D4B2', borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="speedometer" size={20} color="#00D4B2" />
                    <Text style={[styles.cardTitle, { color: colors.text, fontWeight: '800' }]}>
                      Båddrift & Trolling Cockpit
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: currentSpeedKnots >= 1.6 && currentSpeedKnots <= 2.6 ? '#10B98120' : '#00D4B220',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: currentSpeedKnots >= 1.6 && currentSpeedKnots <= 2.6 ? '#10B981' : '#00D4B2',
                    }}>
                      {currentSpeedKnots >= 1.6 && currentSpeedKnots <= 2.6 ? '🎯 Optimal dørgefart' :
                       currentSpeedKnots > 2.6 ? '⚡ Høj fart' : '⚓ Drivende'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 8 }}>
                  {/* Knots */}
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 34, fontWeight: '900', color: '#00D4B2', letterSpacing: -1 }}>
                      {currentSpeedKnots.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
                      Knob (kn)
                    </Text>
                  </View>

                  <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />

                  {/* Km/h */}
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>
                      {currentSpeedKmh.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                      km/t
                    </Text>
                  </View>

                  <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />

                  {/* Heading */}
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Ionicons name="compass" size={16} color={colors.accent} />
                      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.accent }}>
                        {heading}°
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                      Kurs
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="time" size={24} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Tid</Text>
                </View>
                <Text style={[styles.bigValue, { color: colors.primary }]}>{formatTime(elapsedTime)}</Text>
              </View>

              <View style={styles.cardRow}>
                <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="flash" size={20} color={colors.accent} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Hug</Text>
                  </View>
                  <Text style={[styles.mediumValue, { color: colors.accent }]}>{session.strikes}</Text>
                </View>

                <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="fish" size={20} color={colors.success} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Fangster</Text>
                  </View>
                  <Text style={[styles.mediumValue, { color: colors.success }]}>{session.catches}</Text>
                </View>
              </View>

              {session.weatherData && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Vejrforhold</Text>

                  <View style={styles.cardRow}>
                    {session.weatherData.temperature !== undefined && (
                      <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="thermometer" size={20} color={colors.primary} />
                          <Text style={[styles.cardTitle, { color: colors.text }]}>Lufttemp</Text>
                        </View>
                        <Text style={[styles.mediumValue, { color: colors.text }]}>
                          {session.weatherData.temperature.toFixed(1)}°C
                        </Text>
                      </View>
                    )}

                    {session.weatherData.waterTemperature !== undefined && (
                      <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="water" size={20} color={colors.primary} />
                          <Text style={[styles.cardTitle, { color: colors.text }]}>Vandtemp</Text>
                        </View>
                        <Text style={[styles.mediumValue, { color: colors.text }]}>
                          {session.weatherData.waterTemperature.toFixed(1)}°C
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardRow}>
                    {session.weatherData.windSpeed !== undefined && (
                      <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="cloud" size={20} color={colors.primary} />
                          <Text style={[styles.cardTitle, { color: colors.text }]}>Vind</Text>
                        </View>
                        <Text style={[styles.mediumValue, { color: colors.text }]}>
                          {session.weatherData.windSpeed.toFixed(1)} m/s
                        </Text>
                        {session.weatherData.windDirection && (
                          <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                            {session.weatherData.windDirection}
                          </Text>
                        )}
                      </View>
                    )}

                    {session.weatherData.pressure !== undefined && (
                      <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="speedometer" size={20} color={colors.primary} />
                          <Text style={[styles.cardTitle, { color: colors.text }]}>Barometer</Text>
                        </View>
                        <Text style={[styles.mediumValue, { color: colors.text }]}>
                          {session.weatherData.pressure.toFixed(0)} hPa
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Page 2: Map */}
          <ScrollView style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.pageContent}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Kort & Fiskepladser</Text>

              <View style={styles.mapContainer}>
                {userLocation ? (
                  <MapView
                    ref={mapRef}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    style={styles.map}
                    initialRegion={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }}
                    showsUserLocation
                  >
                    {session.route.length > 1 && (
                      <Polyline
                        coordinates={session.route.map((point) => ({
                          latitude: point.lat,
                          longitude: point.lng,
                        }))}
                        strokeColor={colors.accent}
                        strokeWidth={4}
                      />
                    )}

                    {session.route.length > 0 && (
                      <Marker
                        coordinate={{
                          latitude: session.route[0].lat,
                          longitude: session.route[0].lng,
                        }}
                        title="Start"
                        pinColor="green"
                      />
                    )}

                    {/* Known fishing spot markers */}
                    {nearbyKnownSpots.map(({ location, distance }) => (
                      <Marker
                        key={location.name}
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        title={location.name}
                        description={`${distance.toFixed(1)} km - ${getWaterTypeLabel(location.waterType)}`}
                        pinColor={colors.primary}
                        onPress={() => setSelectedSpot(location)}
                      />
                    ))}
                  </MapView>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Ionicons name="map" size={64} color={colors.textTertiary} />
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                      Henter placering...
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="navigate" size={20} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Route Info</Text>
                </View>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Punkter: {session.route.length}
                </Text>
              </View>

              {/* Selected spot info */}
              {selectedSpot && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{selectedSpot.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedSpot(null)} style={{ marginLeft: 'auto' }}>
                      <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.spotInfoRow}>
                    <Text style={[styles.spotInfoLabel, { color: colors.textSecondary }]}>Type:</Text>
                    <Text style={[styles.spotInfoValue, { color: colors.text }]}>
                      {getWaterTypeLabel(selectedSpot.waterType)}
                    </Text>
                  </View>
                  {selectedSpot.depth && (
                    <View style={styles.spotInfoRow}>
                      <Text style={[styles.spotInfoLabel, { color: colors.textSecondary }]}>Dybde:</Text>
                      <Text style={[styles.spotInfoValue, { color: colors.text }]}>{selectedSpot.depth}</Text>
                    </View>
                  )}
                  {selectedSpot.species.length > 0 && (
                    <View style={styles.spotSpeciesContainer}>
                      <Text style={[styles.spotInfoLabel, { color: colors.textSecondary }]}>Arter:</Text>
                      <View style={styles.spotSpeciesList}>
                        {selectedSpot.species.slice(0, 5).map((species) => (
                          <View key={species} style={[styles.spotSpeciesTag, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.spotSpeciesText, { color: colors.primary }]}>{species}</Text>
                          </View>
                        ))}
                        {selectedSpot.species.length > 5 && (
                          <Text style={[styles.spotMoreSpecies, { color: colors.textSecondary }]}>
                            +{selectedSpot.species.length - 5}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {selectedSpot.regulations && (
                    <View style={[styles.regulationsBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
                      <Ionicons name="warning" size={14} color={colors.warning} />
                      <Text style={[styles.regulationsText, { color: colors.warning }]}>
                        {selectedSpot.regulations}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Nearby spots list */}
              {nearbyKnownSpots.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="fish" size={20} color={colors.accent} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Fiskepladser i Nærheden ({nearbyKnownSpots.length})
                    </Text>
                  </View>
                  {nearbyKnownSpots.slice(0, 5).map(({ location, distance }) => (
                    <TouchableOpacity
                      key={location.name}
                      style={[
                        styles.nearbySpotItem,
                        selectedSpot?.name === location.name && { backgroundColor: colors.primary + '10' },
                      ]}
                      onPress={() => {
                        setSelectedSpot(location);
                        mapRef.current?.animateToRegion({
                          latitude: location.latitude,
                          longitude: location.longitude,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }, 500);
                      }}
                    >
                      <View style={styles.nearbySpotInfo}>
                        <Text style={[styles.nearbySpotName, { color: colors.text }]}>{location.name}</Text>
                        <Text style={[styles.nearbySpotMeta, { color: colors.textSecondary }]}>
                          {getWaterTypeLabel(location.waterType)} • {location.species.slice(0, 3).join(', ')}
                          {location.species.length > 3 ? '...' : ''}
                        </Text>
                      </View>
                      <View style={styles.nearbySpotDistance}>
                        <Text style={[styles.distanceValue, { color: colors.primary }]}>{distance.toFixed(1)}</Text>
                        <Text style={[styles.distanceUnit, { color: colors.textSecondary }]}>km</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Page 3: AI Guide */}
          <ScrollView style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.pageContent}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>AI Fiskeguide</Text>

              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="hardware-chip" size={24} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Råd baseret på din session</Text>
                </View>

                {loadingAi ? (
                  <View style={styles.loadingContainer}>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>Henter råd...</Text>
                  </View>
                ) : aiAdvice ? (
                  <Text style={[styles.adviceText, { color: colors.text }]}>{aiAdvice}</Text>
                ) : (
                  <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                    onPress={fetchAiAdvice}
                  >
                    <Ionicons name="refresh" size={20} color={colors.white} />
                    <Text style={[styles.refreshButtonText, { color: colors.white }]}>Hent Råd</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </ScrollView>

        {/* Action buttons - fixed at bottom, split left and right */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButtonLeft, { backgroundColor: colors.accent }]}
            onPress={handleAddStrike}
          >
            <Ionicons name="flash" size={28} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Registrer Hug</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonRight, { backgroundColor: colors.success }]}
            onPress={handleRegisterCatch}
          >
            <Ionicons name="camera" size={36} color={colors.white} />
            <Text style={[styles.actionButtonTextLarge, { color: colors.white }]}>Registrer Fangst</Text>
          </TouchableOpacity>
        </View>

        {/* End session modal */}
        <Modal visible={showEndModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Afslut Session</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Er du sikker på at du vil afslutte din fisketur?
              </Text>

              <View style={[styles.summaryCard, { backgroundColor: colors.backgroundLight }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Varighed:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Hug:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{session.strikes}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Fangster:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{session.catches}</Text>
                </View>
              </View>

              <SlideToConfirm
                onConfirm={handleEndSession}
                text="Slide for at stoppe session"
                confirmThreshold={0.8}
              />

              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEndModal(false)}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuller</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Voice Catch Modal */}
        <VoiceCatchModal
          visible={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onApplyParsedData={handleApplyVoiceCatch}
        />
      </View>
    </PageLayout>
  );
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: SPACING.lg,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sessionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    sessionTypeText: {
      ...TYPOGRAPHY.styles.h3,
    },
    endButton: {
      padding: SPACING.sm,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.small,
    },
    statValue: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: 'bold',
    },
    statDivider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border,
    },
    pageIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      gap: SPACING.sm,
    },
    dotContainer: {
      padding: SPACING.xs,
    },
    dot: {
      height: 8,
      borderRadius: RADIUS.full,
    },
    scrollView: {
      flex: 1,
    },
    page: {
      flex: 1,
    },
    pageContent: {
      padding: SPACING.lg,
      paddingBottom: 120, // Space for action buttons
    },
    pageTitle: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.lg,
    },
    card: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    cardRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    halfCard: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    cardTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    bigValue: {
      ...TYPOGRAPHY.styles.h1,
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: SPACING.md,
    },
    mediumValue: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: SPACING.sm,
    },
    smallText: {
      ...TYPOGRAPHY.styles.small,
      textAlign: 'center',
    },
    sectionTitle: {
      ...TYPOGRAPHY.styles.h3,
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
    },
    infoText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.xs,
    },
    mapContainer: {
      height: 400,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    map: {
      flex: 1,
    },
    mapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
    },
    placeholderText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.md,
    },
    adviceText: {
      ...TYPOGRAPHY.styles.body,
      lineHeight: 24,
      marginTop: SPACING.md,
    },
    loadingContainer: {
      padding: SPACING.lg,
      alignItems: 'center',
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.md,
    },
    refreshButtonText: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    actionButtonsContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 2,
      zIndex: 10,
    },
    actionButtonLeft: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      ...SHADOWS.lg,
    },
    actionButtonRight: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      ...SHADOWS.lg,
    },
    actionButtonText: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: 'bold',
    },
    actionButtonTextLarge: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      padding: SPACING.xl,
      width: '100%',
      maxWidth: 400,
      ...SHADOWS.xl,
    },
    modalTitle: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    modalSubtitle: {
      ...TYPOGRAPHY.styles.body,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    sessionTypeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    sessionTypeButton: {
      flex: 1,
      minWidth: '45%',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      alignItems: 'center',
      gap: SPACING.sm,
    },
    sessionTypeLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    startButton: {
      borderRadius: RADIUS.full,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.glow,
    },
    startButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      padding: SPACING.lg,
      borderRadius: RADIUS.full,
    },
    startButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cancelButton: {
      padding: SPACING.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...TYPOGRAPHY.styles.body,
    },
    summaryCard: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      gap: SPACING.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      ...TYPOGRAPHY.styles.body,
    },
    summaryValue: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: 'bold',
    },
    // Known fishing spot styles
    spotInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    spotInfoLabel: {
      ...TYPOGRAPHY.styles.small,
    },
    spotInfoValue: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '500',
    },
    spotSpeciesContainer: {
      marginTop: SPACING.sm,
    },
    spotSpeciesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    spotSpeciesTag: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    spotSpeciesText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '500',
    },
    spotMoreSpecies: {
      ...TYPOGRAPHY.styles.small,
      alignSelf: 'center',
      marginLeft: SPACING.xs,
    },
    regulationsBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.xs,
      marginTop: SPACING.md,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
    },
    regulationsText: {
      ...TYPOGRAPHY.styles.small,
      flex: 1,
    },
    nearbySpotItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.md,
      marginTop: SPACING.xs,
    },
    nearbySpotInfo: {
      flex: 1,
      marginRight: SPACING.md,
    },
    nearbySpotName: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    nearbySpotMeta: {
      ...TYPOGRAPHY.styles.small,
      marginTop: 2,
    },
    nearbySpotDistance: {
      alignItems: 'center',
    },
    distanceValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    distanceUnit: {
      ...TYPOGRAPHY.styles.small,
    },
  });
};
