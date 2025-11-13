import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomNavigation from '../components/BottomNavigation';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { SPACING, COLORS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

// Danish fish species for filter
const FISH_SPECIES = [
  'Alle arter',
  'Gedde',
  'Aborre',
  'Sandart',
  'Ørred',
  'Karpe',
  'Brasen',
  'Helt',
];

const SEASONS = [
  { value: '', label: 'Alle sæsoner' },
  { value: 'spring', label: 'Forår' },
  { value: 'summer', label: 'Sommer' },
  { value: 'fall', label: 'Efterår' },
  { value: 'winter', label: 'Vinter' },
];

type HeatmapPoint = {
  longitude: number;
  latitude: number;
  intensity: number;
  species: string[];
  avgWeight: number;
  uniqueAnglers: number;
};

type TopSpot = {
  id: string;
  longitude: number;
  latitude: number;
  catchCount: number;
  species: string[];
  avgWeight: number;
  maxWeight: number;
};

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [topSpots, setTopSpots] = useState<TopSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTopSpots, setShowTopSpots] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('satellite');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);
  const [region, setRegion] = useState({
    latitude: 56.26, // Denmark center
    longitude: 9.5,
    latitudeDelta: 0.4, // ~20km radius (0.4 degrees ≈ 44km height)
    longitudeDelta: 0.4,
  });

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.4, // ~20km radius
        longitudeDelta: 0.4,
      });
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      }, 1000); // 1 second animation
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      let url = `${API_URL}/spots/heatmap?gridSize=0.02`;

      if (selectedSpecies && selectedSpecies !== 'Alle arter') {
        url += `&species=${encodeURIComponent(selectedSpecies)}`;
      }
      if (selectedSeason) {
        url += `&season=${selectedSeason}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data.points);
      } else {
        console.error('Failed to fetch heatmap');
      }
    } catch (error) {
      console.error('Heatmap fetch error:', error);
    }
  };

  const fetchTopSpots = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      let url = `${API_URL}/spots/top?limit=20`;

      if (selectedSpecies && selectedSpecies !== 'Alle arter') {
        url += `&species=${encodeURIComponent(selectedSpecies)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopSpots(data.spots);
      } else {
        console.error('Failed to fetch top spots');
      }
    } catch (error) {
      console.error('Top spots fetch error:', error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHeatmapData(), fetchTopSpots()]);
      setLoading(false);
    };

    loadData();
  }, [selectedSpecies, selectedSeason]);

  const getIntensityColor = (intensity: number, maxIntensity: number) => {
    const normalized = intensity / maxIntensity;
    if (normalized > 0.7) return 'rgba(255, 0, 0, 0.4)'; // Hot - Red
    if (normalized > 0.4) return 'rgba(255, 165, 0, 0.4)'; // Warm - Orange
    return 'rgba(255, 255, 0, 0.3)'; // Cool - Yellow
  };

  const getIntensityRadius = (intensity: number, maxIntensity: number) => {
    const normalized = intensity / maxIntensity;
    return 300 + (normalized * 700); // 300m to 1000m
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setLoadingAiAdvice(true);
    setAiAdvice('');

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Fetch weather data for the location
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      // Get nearby catch statistics
      const nearbyCatches = heatmapData.filter(point => {
        const distance = Math.sqrt(
          Math.pow(point.latitude - latitude, 2) + Math.pow(point.longitude - longitude, 2)
        );
        return distance < 0.1; // Within ~11km
      });

      // Prepare context for AI
      const context = {
        location: { latitude, longitude },
        weather: {
          temperature: Math.round(weatherData.current.temperature_2m),
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          weatherCode: weatherData.current.weather_code
        },
        nearbyCatchStats: nearbyCatches.length > 0 ? {
          totalCatches: nearbyCatches.reduce((sum, p) => sum + p.intensity, 0),
          commonSpecies: [...new Set(nearbyCatches.flatMap(p => p.species))],
          avgWeight: nearbyCatches.reduce((sum, p) => sum + p.avgWeight, 0) / nearbyCatches.length
        } : null,
        season: new Date().getMonth() < 3 ? 'vinter' :
                new Date().getMonth() < 6 ? 'forår' :
                new Date().getMonth() < 9 ? 'sommer' : 'efterår'
      };

      // Call AI service through backend
      const aiResponse = await fetch(`${API_URL}/ai/fishing-advice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        console.log('AI advice response:', data);
        setAiAdvice(data.advice);
      } else {
        const errorData = await aiResponse.json().catch(() => ({}));
        console.error('AI advice error:', aiResponse.status, errorData);
        setAiAdvice(`AI-rådgivning ikke tilgængelig. Status: ${aiResponse.status}`);
      }
    } catch (error) {
      console.error('Failed to get AI advice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      setAiAdvice(`Kunne ikke hente fiskerådgivning: ${errorMessage}`);
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  const maxIntensity = Math.max(...heatmapData.map(p => p.intensity), 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      {/* Floating Filter Button */}
      <TouchableOpacity
        style={[
          styles.floatingFilterButton,
          { bottom: 80 + Math.max(insets.bottom, 8) } // Above bottom navigation with safe area
        ]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons
          name={showFilters ? "close" : "options-outline"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Center on User Location Button */}
      {userLocation && (
        <TouchableOpacity
          style={[
            styles.locationButton,
            { bottom: 80 + Math.max(insets.bottom, 8) + 70 } // Above filter button
          ]}
          onPress={centerOnUserLocation}
        >
          <Ionicons
            name="navigate"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      )}

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Fiskeart:</Text>
              {FISH_SPECIES.map((species) => (
                <TouchableOpacity
                  key={species}
                  style={[
                    styles.filterChip,
                    selectedSpecies === species && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedSpecies(species === 'Alle arter' ? '' : species)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSpecies === species && styles.filterChipTextActive,
                    ]}
                  >
                    {species}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Sæson:</Text>
              {SEASONS.map((season) => (
                <TouchableOpacity
                  key={season.value}
                  style={[
                    styles.filterChip,
                    selectedSeason === season.value && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSeason(season.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSeason === season.value && styles.filterChipTextActive,
                    ]}
                  >
                    {season.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.toggleButtonsContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, showHeatmap && styles.toggleButtonActive]}
              onPress={() => setShowHeatmap(!showHeatmap)}
            >
              <Ionicons
                name="flame-outline"
                size={16}
                color={showHeatmap ? 'white' : '#666'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.toggleButtonText, showHeatmap && styles.toggleButtonTextActive]}>
                Heatmap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, showTopSpots && styles.toggleButtonActive]}
              onPress={() => setShowTopSpots(!showTopSpots)}
            >
              <Ionicons
                name="bonfire-outline"
                size={16}
                color={showTopSpots ? 'white' : '#666'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.toggleButtonText, showTopSpots && styles.toggleButtonTextActive]}>
                Hot Spots
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, mapType === 'satellite' && styles.toggleButtonActive]}
              onPress={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')}
            >
              <Ionicons
                name={mapType === 'satellite' ? 'satellite' : 'map-outline'}
                size={16}
                color={mapType === 'satellite' ? 'white' : '#666'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.toggleButtonText, mapType === 'satellite' && styles.toggleButtonTextActive]}>
                {mapType === 'satellite' ? 'Satellit' : 'Kort'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Indlæser fiskekort...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            mapType={mapType}
          >
            {/* Labels overlay for satellite view - modern dark labels */}
            {mapType === 'satellite' && (
              <UrlTile
                urlTemplate="https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
                maximumZ={18}
                zIndex={200}
                opacity={0.9}
              />
            )}

            {/* Heatmap circles */}
            {showHeatmap && heatmapData.map((point, index) => (
              <Circle
                key={`heat-${index}`}
                center={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                radius={getIntensityRadius(point.intensity, maxIntensity)}
                fillColor={getIntensityColor(point.intensity, maxIntensity)}
                strokeColor="transparent"
              />
            ))}

            {/* Top spots markers */}
            {showTopSpots &&
              topSpots.map((spot) => (
                <Marker
                  key={spot.id}
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                  title={`Hot Spot - ${spot.catchCount} fangster`}
                  description={`${spot.species.join(', ')}\nGns: ${spot.avgWeight}g | Max: ${spot.maxWeight}g`}
                  pinColor="red"
                />
              ))}

            {/* User's current location */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Din placering"
                description="Du er her"
              >
                <Ionicons name="location" size={32} color={COLORS.accent} />
              </Marker>
            )}

            {/* Selected location marker */}
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Valgt fiskested"
                description="Tryk for AI fiskerådgivning"
                pinColor="blue"
              />
            )}
          </MapView>
        )}
      </View>

      {/* AI Advice Modal */}
      <Modal
        visible={selectedLocation !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedLocation(null);
          setAiAdvice('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="fish" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>AI Fiskeguide</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedLocation(null);
                  setAiAdvice('');
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingAiAdvice ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Analyserer fiskemuligheder...</Text>
                </View>
              ) : aiAdvice ? (
                <Text style={styles.adviceText}>{aiAdvice}</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  floatingFilterButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
