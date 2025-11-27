import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Segment {
  id: string;
  name: string;
  segmentType: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  totalCatches: number;
  activityCount: number;
  distance: number;
  currentLegend?: {
    userId: string;
    user: {
      name: string;
      avatar: string;
    };
    effortCount: number;
  };
  personalBest?: {
    effortScore: number;
    rank: number;
  };
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: SPACING.md,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
    },
    createButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    mapContainer: {
      height: SCREEN_HEIGHT * 0.45,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    listContainer: {
      flex: 1,
    },
    viewToggle: {
      flexDirection: 'row',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: SPACING.sm,
    },
    viewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    viewButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    viewButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
      marginLeft: SPACING.xs,
    },
    viewButtonTextActive: {
      color: '#FFFFFF',
    },
    segmentCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.sm,
    },
    segmentHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: SPACING.md,
    },
    segmentIcon: {
      width: 48,
      height: 48,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    segmentInfo: {
      flex: 1,
    },
    segmentName: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    segmentMeta: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    segmentDistance: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    segmentStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    legendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.md,
      padding: SPACING.sm,
      backgroundColor: colors.warning + '20',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.warning,
    },
    legendIcon: {
      marginRight: SPACING.sm,
    },
    legendText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
      flex: 1,
    },
    personalBestBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      backgroundColor: colors.success + '20',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.success,
    },
    pbText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
      marginLeft: SPACING.sm,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyIcon: {
      marginBottom: SPACING.lg,
    },
    emptyTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    myLocationButton: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 50,
      height: 50,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.lg,
    },
  });
};

export default function Segments() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [view, setView] = useState<'map' | 'list'>('map');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationAndFetchSegments();
  }, []);

  const requestLocationAndFetchSegments = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Tilladelse nødvendig', 'Vi har brug for adgang til din placering for at finde segmenter i nærheden.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });

      await fetchNearbySegments(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Fejl', 'Kunne ikke hente din placering');
    }
  };

  const fetchNearbySegments = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/segments/nearby?lat=${lat}&lng=${lng}&radius=50000`);
      setSegments(data.segments || []);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
      Alert.alert('Fejl', 'Kunne ikke hente segmenter');
    } finally {
      setLoading(false);
    }
  };

  const centerOnMyLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      setCurrentLocation(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      await fetchNearbySegments(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getSegmentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      spot: 'location',
      route: 'git-network',
      zone: 'square-outline',
    };
    return icons[type] || 'location';
  };

  const renderSegmentCard = ({ item }: { item: Segment }) => (
    <TouchableOpacity
      style={styles.segmentCard}
      onPress={() => router.push(`/segment-detail?id=${item.id}`)}
    >
      <View style={styles.segmentHeader}>
        <View style={styles.segmentIcon}>
          <Ionicons name={getSegmentIcon(item.segmentType) as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.segmentInfo}>
          <Text style={styles.segmentName}>{item.name}</Text>
          <Text style={styles.segmentMeta}>
            {item.segmentType.charAt(0).toUpperCase() + item.segmentType.slice(1)} • {item.activityCount} aktiviteter
          </Text>
        </View>
        <Text style={styles.segmentDistance}>{formatDistance(item.distance)}</Text>
      </View>

      <View style={styles.segmentStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalCatches}</Text>
          <Text style={styles.statLabel}>Fangster</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.activityCount}</Text>
          <Text style={styles.statLabel}>Aktiviteter</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(item.radius)}</Text>
          <Text style={styles.statLabel}>Radius</Text>
        </View>
      </View>

      {item.currentLegend && (
        <View style={styles.legendBadge}>
          <Ionicons name="trophy" size={18} color={colors.warning} style={styles.legendIcon} />
          <Text style={styles.legendText}>
            Local Legend: {item.currentLegend.user.name} ({item.currentLegend.effortCount} indsatser)
          </Text>
        </View>
      )}

      {item.personalBest && (
        <View style={styles.personalBestBadge}>
          <Ionicons name="medal" size={18} color={colors.success} />
          <Text style={styles.pbText}>
            Din bedste: #{item.personalBest.rank} ({item.personalBest.effortScore} point)
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Ingen segmenter i nærheden</Text>
      <Text style={styles.emptyText}>
        Opret et nyt segment eller udforsk andre områder for at finde populære fiskesteder!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Segmenter</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-segment' as any)}
        >
          <Text style={styles.createButtonText}>Opret</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'map' && styles.viewButtonActive]}
          onPress={() => setView('map')}
        >
          <Ionicons
            name="map"
            size={18}
            color={view === 'map' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.viewButtonText, view === 'map' && styles.viewButtonTextActive]}>
            Kort
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'list' && styles.viewButtonActive]}
          onPress={() => setView('list')}
        >
          <Ionicons
            name="list"
            size={18}
            color={view === 'list' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.viewButtonText, view === 'list' && styles.viewButtonTextActive]}>
            Liste
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'map' && currentLocation && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={currentLocation}
            showsUserLocation
          >
            {segments.map(segment => (
              <React.Fragment key={segment.id}>
                <Marker
                  coordinate={{
                    latitude: segment.centerLat,
                    longitude: segment.centerLng,
                  }}
                  onPress={() => router.push(`/segment-detail?id=${segment.id}`)}
                >
                  <View style={{
                    backgroundColor: colors.primary,
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}>
                    <Ionicons name="fish" size={20} color="#FFFFFF" />
                  </View>
                </Marker>
                <Circle
                  center={{
                    latitude: segment.centerLat,
                    longitude: segment.centerLng,
                  }}
                  radius={segment.radius}
                  strokeColor={colors.primary + '80'}
                  fillColor={colors.primary + '20'}
                  strokeWidth={2}
                />
              </React.Fragment>
            ))}
          </MapView>
          <TouchableOpacity style={styles.myLocationButton} onPress={centerOnMyLocation}>
            <Ionicons name="locate" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {view === 'list' && (
        <View style={styles.listContainer}>
          <FlatList
            data={segments}
            renderItem={renderSegmentCard}
            keyExtractor={item => item.id}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={segments.length === 0 ? { flex: 1 } : { paddingVertical: SPACING.md }}
          />
        </View>
      )}
    </View>
  );
}
