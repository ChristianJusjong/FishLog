import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageLayout from '../components/PageLayout';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import * as Location from 'expo-location';
import {
  findNearestFishingLocation,
  findLocationsInRadius,
  getWaterTypeColor,
  getWaterTypeLabel,
  getSpeciesName,
  type FishingLocation,
} from '../data/fishingLocations';

interface HotSpot {
  latitude: number;
  longitude: number;
  totalAnglers: number;
  totalCatches: number;
  totalScore: number;
  lastActivity: Date;
  topAnglers: Array<{
    userId: string;
    userName: string;
    catchCount: number;
    totalScore: number;
  }>;
  fishSpecies: string[];
  distance?: number;
  userRank?: number | null;
  userStats?: {
    userId: string;
    userName: string;
    catchCount: number;
    totalScore: number;
  } | null;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      padding: SPACING.lg,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h1,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    headerSubtitle: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    filterButtonTextActive: {
      color: colors.white,
    },
    scrollContent: {
      padding: SPACING.lg,
      paddingBottom: 100,
    },
    hotSpotCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.md,
    },
    cardTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
      flex: 1,
    },
    distanceBadge: {
      backgroundColor: colors.primaryLight + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    distanceText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: SPACING.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    userRankBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '20',
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      marginBottom: SPACING.md,
    },
    userRankText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.success,
      fontWeight: '600',
      marginLeft: SPACING.sm,
    },
    topAnglersContainer: {
      marginBottom: SPACING.md,
    },
    topAnglerTitle: {
      ...TYPOGRAPHY.styles.body,
      color: colors.text,
      fontWeight: '600',
      marginBottom: SPACING.sm,
    },
    anglerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.xs,
    },
    anglerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    anglerRank: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      width: 24,
      fontWeight: '600',
    },
    anglerName: {
      ...TYPOGRAPHY.styles.body,
      color: colors.text,
      flex: 1,
    },
    anglerScore: {
      ...TYPOGRAPHY.styles.body,
      color: colors.primary,
      fontWeight: '600',
    },
    speciesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginBottom: SPACING.md,
    },
    speciesBadge: {
      backgroundColor: colors.backgroundLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    speciesText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    viewDetailsButton: {
      backgroundColor: colors.primary,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
    },
    viewDetailsButtonText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.white,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING['2xl'],
    },
    emptyIcon: {
      marginBottom: SPACING.lg,
    },
    emptyTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
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
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
    // Known spots styles
    sectionTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      marginBottom: SPACING.md,
    },
    knownSpotCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderLeftWidth: 4,
      ...SHADOWS.sm,
    },
    knownSpotHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    knownSpotName: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginLeft: SPACING.xs,
    },
    knownSpotDistance: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    knownSpotDescription: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    knownSpotInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    knownSpotBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    knownSpotBadgeText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    knownSpeciesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    knownSpeciesChip: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    knownSpeciesText: {
      ...TYPOGRAPHY.styles.small,
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
    nearestLocationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight + '30',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
      marginBottom: SPACING.sm,
    },
    nearestLocationText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.primary,
      marginLeft: 4,
    },
  });
};

export default function HotSpotsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState<'auto' | 'manual'>('auto');
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to log in to view hot spots',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
      return;
    }
    initializeAndFetch();
  }, [filter, user]);

  const initializeAndFetch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      await fetchHotSpots();
    } catch (error) {
      console.error('Error initializing:', error);
      await fetchHotSpots();
    }
  };

  const fetchHotSpots = async () => {
    try {
      if (!refreshing) setLoading(true);

      const nearParam = userLocation
        ? `&near=${userLocation.latitude},${userLocation.longitude}`
        : '';

      const { data } = await api.get(`/hot-spots/discover?${nearParam}`);
      setHotSpots(data.hotSpots || []);
    } catch (error) {
      console.error('Failed to fetch hot spots:', error);
      Alert.alert('Fejl', 'Kunne ikke hente hot spots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHotSpots();
  };

  // Get nearby known fishing spots
  const nearbyKnownSpots = useMemo(() => {
    if (!userLocation) return [];
    return findLocationsInRadius(userLocation.latitude, userLocation.longitude, 50).slice(0, 5);
  }, [userLocation]);

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getLocationName = (lat: number, lng: number) => {
    // Try to match to a known fishing location
    const nearest = findNearestFishingLocation(lat, lng, 5); // Within 5km
    if (nearest) {
      return nearest.location.name;
    }
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  const getNearestKnownLocation = (lat: number, lng: number) => {
    return findNearestFishingLocation(lat, lng, 10); // Within 10km
  };

  const renderHotSpotCard = (spot: HotSpot, index: number) => {
    const nearestKnown = getNearestKnownLocation(spot.latitude, spot.longitude);

    return (
    <View key={index} style={styles.hotSpotCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {nearestKnown ? nearestKnown.location.name : `Hot Spot #${index + 1}`}
        </Text>
        {spot.distance && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {formatDistance(spot.distance)}
            </Text>
          </View>
        )}
      </View>

      {nearestKnown && (
        <View style={styles.nearestLocationBadge}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getWaterTypeColor(nearestKnown.location.waterType) }} />
          <Text style={styles.nearestLocationText}>
            {getWaterTypeLabel(nearestKnown.location.waterType)} • {nearestKnown.distance.toFixed(1)} km væk
          </Text>
        </View>
      )}

      {!nearestKnown && (
        <Text style={{ ...TYPOGRAPHY.styles.caption, color: colors.textSecondary, marginBottom: SPACING.md }}>
          {getLocationName(spot.latitude, spot.longitude)}
        </Text>
      )}

      {spot.userRank && (
        <View style={styles.userRankBadge}>
          <Ionicons name="trophy" size={20} color={colors.success} />
          <Text style={styles.userRankText}>
            Du er #{spot.userRank} på dette spot!
          </Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{spot.totalAnglers}</Text>
          <Text style={styles.statLabel}>Fiskere</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{spot.totalCatches}</Text>
          <Text style={styles.statLabel}>Fangster</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{spot.totalScore}</Text>
          <Text style={styles.statLabel}>Point</Text>
        </View>
      </View>

      {spot.topAnglers.length > 0 && (
        <View style={styles.topAnglersContainer}>
          <Text style={styles.topAnglerTitle}>🏆 Top Fiskere</Text>
          {spot.topAnglers.slice(0, 3).map((angler, i) => (
            <View key={i} style={styles.anglerRow}>
              <View style={styles.anglerLeft}>
                <Text style={styles.anglerRank}>#{i + 1}</Text>
                <Text style={styles.anglerName}>{angler.userName}</Text>
              </View>
              <Text style={styles.anglerScore}>{angler.totalScore}p</Text>
            </View>
          ))}
        </View>
      )}

      {spot.fishSpecies.length > 0 && (
        <View style={styles.speciesContainer}>
          {spot.fishSpecies.slice(0, 5).map((species, i) => (
            <View key={i} style={styles.speciesBadge}>
              <Text style={styles.speciesText}>{species}</Text>
            </View>
          ))}
          {spot.fishSpecies.length > 5 && (
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesText}>+{spot.fishSpecies.length - 5}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => router.push(`/hot-spot-detail?lat=${spot.latitude}&lng=${spot.longitude}` as any)}
      >
        <Text style={styles.viewDetailsButtonText}>Se Detaljer & Leaderboards</Text>
      </TouchableOpacity>
    </View>
    );
  };

  const renderKnownSpotCard = (item: { location: FishingLocation; distance: number }) => (
    <View
      key={item.location.name}
      style={[styles.knownSpotCard, { borderLeftColor: getWaterTypeColor(item.location.waterType) }]}
    >
      <View style={styles.knownSpotHeader}>
        <Ionicons name="location" size={18} color={getWaterTypeColor(item.location.waterType)} />
        <Text style={styles.knownSpotName}>{item.location.name}</Text>
        <Text style={styles.knownSpotDistance}>{item.distance.toFixed(1)} km</Text>
      </View>

      <Text style={styles.knownSpotDescription}>{item.location.description}</Text>

      <View style={styles.knownSpotInfo}>
        <View style={styles.knownSpotBadge}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getWaterTypeColor(item.location.waterType) }} />
          <Text style={styles.knownSpotBadgeText}>{getWaterTypeLabel(item.location.waterType)}</Text>
        </View>
        {item.location.depth && (
          <View style={styles.knownSpotBadge}>
            <Ionicons name="water" size={12} color={colors.textSecondary} />
            <Text style={styles.knownSpotBadgeText}>{item.location.depth}</Text>
          </View>
        )}
        {item.location.regulations && (
          <View style={styles.knownSpotBadge}>
            <Ionicons name="alert-circle" size={12} color={colors.warning} />
            <Text style={[styles.knownSpotBadgeText, { color: colors.warning }]}>{item.location.regulations}</Text>
          </View>
        )}
      </View>

      <View style={styles.knownSpeciesContainer}>
        {item.location.species.slice(0, 5).map((speciesId) => (
          <View key={speciesId} style={styles.knownSpeciesChip}>
            <Text style={styles.knownSpeciesText}>{getSpeciesName(speciesId)}</Text>
          </View>
        ))}
        {item.location.species.length > 5 && (
          <View style={[styles.knownSpeciesChip, { backgroundColor: colors.border }]}>
            <Text style={[styles.knownSpeciesText, { color: colors.textSecondary }]}>
              +{item.location.species.length - 5}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <PageLayout>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark || '#D4880F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="flame" size={40} color={colors.primary} />
          </LinearGradient>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
          <Text style={styles.loadingText}>Indlæser hot spots...</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 Hot Spots</Text>
          <Text style={styles.headerSubtitle}>
            Populære fiskesteder baseret på fællesskabets aktivitet
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {hotSpots.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🔥 Populære Steder</Text>
              {hotSpots.map((spot, index) => renderHotSpotCard(spot, index))}
            </>
          )}

          {hotSpots.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="flame-outline"
                size={60}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>Ingen hot spots endnu</Text>
              <Text style={styles.emptyText}>
                Hot spots opdages automatisk når flere fiskere fanger på samme steder
              </Text>
            </View>
          )}

          {nearbyKnownSpots.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, hotSpots.length > 0 && { marginTop: SPACING.xl }]}>
                Kendte Fiskepladser i Nærheden
              </Text>
              {nearbyKnownSpots.map(renderKnownSpotCard)}
            </>
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
}
