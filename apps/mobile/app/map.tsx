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
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import FloatingMenu from '../components/FloatingMenu';
import MapFloatingMenu from '../components/MapFloatingMenu';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { SPACING, COLORS } from '@/constants/branding';
import { api } from '../lib/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

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
  const [showDepthChart, setShowDepthChart] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('satellite');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);
  const [depthInfo, setDepthInfo] = useState<{ depth: number | null; waterName: string | null; coords: { latitude: number; longitude: number } } | null>(null);
  const [loadingDepthInfo, setLoadingDepthInfo] = useState(false);
  const [region, setRegion] = useState({
    latitude: 56.26, // Denmark center
    longitude: 9.5,
    latitudeDelta: 0.4, // ~20km radius (0.4 degrees ≈ 44km height)
    longitudeDelta: 0.4,
  });

  // Favorite location state
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteFishSpecies, setFavoriteFishSpecies] = useState('');
  const [favoriteBottomType, setFavoriteBottomType] = useState('');
  const [favoriteDepth, setFavoriteDepth] = useState('');
  const [favoritePrivacy, setFavoritePrivacy] = useState<'public' | 'groups' | 'friends' | 'private'>('private');
  const [favoriteParkingLat, setFavoriteParkingLat] = useState('');
  const [favoriteParkingLng, setFavoriteParkingLng] = useState('');
  const [favoriteNotes, setFavoriteNotes] = useState('');
  const [savingFavorite, setSavingFavorite] = useState(false);

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

  const handleLongPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('Long press detected at:', latitude, longitude);
    setLoadingDepthInfo(true);
    setDepthInfo(null);

    let depth: number | null = null;
    let waterName = 'Ukendt farvand';

    try {
      // Fetch water body name from OpenStreetMap Nominatim
      try {
        const nameResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`
        );
        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          waterName = nameData.address?.water || nameData.address?.bay || nameData.address?.lake ||
                      nameData.address?.river || nameData.name || nameData.display_name?.split(',')[0] || 'Ukendt farvand';
          console.log('Water name:', waterName);
        }
      } catch (nameError) {
        console.error('Failed to fetch water name:', nameError);
      }

      // Try to fetch depth from EMODnet REST API
      try {
        const depthUrl = `https://rest.emodnet-bathymetry.eu/depth_sample?geom=POINT(${longitude}%20${latitude})&crs=4326`;
        console.log('Fetching depth from:', depthUrl);
        const depthResponse = await fetch(depthUrl);
        console.log('Depth response status:', depthResponse.status);

        if (depthResponse.ok) {
          const depthText = await depthResponse.text();
          console.log('Depth response text:', depthText.substring(0, 200));

          try {
            const depthData = JSON.parse(depthText);
            // Convert meters to centimeters
            depth = depthData.avg !== undefined ? Math.round(depthData.avg * 100) : null;
            console.log('Parsed depth (cm):', depth);
          } catch (parseError) {
            console.error('Failed to parse depth JSON:', parseError);
            console.log('Response was:', depthText);
          }
        } else {
          console.error('Depth API returned error:', depthResponse.status);
        }
      } catch (depthError) {
        console.error('Failed to fetch depth:', depthError);
      }

      setDepthInfo({ depth, waterName, coords: { latitude, longitude } });
    } catch (error) {
      console.error('Failed to fetch depth info:', error);
      setDepthInfo({
        depth: null,
        waterName: 'Kunne ikke hente information',
        coords: { latitude, longitude }
      });
    } finally {
      setLoadingDepthInfo(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setLoadingAiAdvice(true);
    setAiAdvice('');

    try {

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
          windSpeed: Math.round(weatherData.current.wind_speed_10m / 3.6), // Convert km/h to m/s
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

      // Call AI service through backend using api client (handles token refresh)
      const { data } = await api.post('/ai/fishing-advice', context);
      console.log('AI advice response:', data);

      // Handle both successful AI responses and fallback advice
      if (data.advice) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice('Ingen råd tilgængelige på nuværende tidspunkt.');
      }
    } catch (error: any) {
      console.error('Failed to get AI advice:', error);

      // Check if error response contains fallback advice
      if (error.response?.data?.advice) {
        setAiAdvice(error.response.data.advice);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Ukendt fejl';
        setAiAdvice(
          `❌ Kunne ikke hente AI-rådgivning.\n\n` +
          `Fejl: ${errorMessage}\n\n` +
          `💡 Prøv at:\n` +
          `• Tjekke din internetforbindelse\n` +
          `• Opdatere appen\n` +
          `• Prøve igen om lidt`
        );
      }
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  const openSaveFavoriteModal = () => {
    if (!selectedLocation) {
      Alert.alert('Fejl', 'Vælg venligst en lokation på kortet først');
      return;
    }
    setShowFavoriteModal(true);
  };

  const saveFavoriteLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Fejl', 'Ingen lokation valgt');
      return;
    }

    if (!favoriteName.trim()) {
      Alert.alert('Fejl', 'Indtast venligst et navn til stedet');
      return;
    }

    setSavingFavorite(true);

    try {
      const payload = {
        name: favoriteName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        fishSpecies: favoriteFishSpecies || undefined,
        bottomType: favoriteBottomType || undefined,
        depth: favoriteDepth ? parseFloat(favoriteDepth) : undefined,
        privacy: favoritePrivacy,
        parkingLatitude: favoriteParkingLat ? parseFloat(favoriteParkingLat) : undefined,
        parkingLongitude: favoriteParkingLng ? parseFloat(favoriteParkingLng) : undefined,
        notes: favoriteNotes || undefined,
      };

      await api.post('/favorite-spots', payload);

      Alert.alert('Succes', 'Favoritsted gemt!');

      // Reset form
      setShowFavoriteModal(false);
      setFavoriteName('');
      setFavoriteFishSpecies('');
      setFavoriteBottomType('');
      setFavoriteDepth('');
      setFavoritePrivacy('private');
      setFavoriteParkingLat('');
      setFavoriteParkingLng('');
      setFavoriteNotes('');
    } catch (error: any) {
      console.error('Failed to save favorite location:', error);
      Alert.alert(
        'Fejl',
        error.response?.data?.error || 'Kunne ikke gemme favoritsted'
      );
    } finally {
      setSavingFavorite(false);
    }
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      });
    }
  };

  const maxIntensity = Math.max(...heatmapData.map(p => p.intensity), 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      {/* Map Floating Menu */}
      <MapFloatingMenu
        onFilterPress={() => setShowFilters(!showFilters)}
        showFilter={showFilters}
        onSaveFavorite={openSaveFavoriteModal}
      />

      {/* Center on User Location Button */}
      {userLocation && (
        <TouchableOpacity
          style={[
            styles.locationButton,
            { bottom: insets.bottom + 20 + 68 } // Above filter button
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

            <TouchableOpacity
              style={[styles.toggleButton, showDepthChart && styles.toggleButtonActive]}
              onPress={() => {
                console.log('Depth chart toggle pressed, current state:', showDepthChart);
                setShowDepthChart(!showDepthChart);
                console.log('Depth chart new state:', !showDepthChart);
              }}
            >
              <Ionicons
                name="water-outline"
                size={16}
                color={showDepthChart ? 'white' : '#666'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.toggleButtonText, showDepthChart && styles.toggleButtonTextActive]}>
                Dybdekort
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
            onLongPress={handleLongPress}
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

            {/* Water Depth Chart - Shows water areas with depth colors */}
            {showDepthChart && (() => {
              console.log('Rendering water depth chart - EMODnet multicolour');
              return (
                <UrlTile
                  urlTemplate="https://tiles.emodnet-bathymetry.eu/v11/mean_multicolour/web_mercator/{z}/{x}/{y}.png"
                  maximumZ={15}
                  zIndex={100}
                  opacity={0.7}
                />
              );
            })()}

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

            {/* Depth info marker */}
            {depthInfo && (
              <Marker
                coordinate={depthInfo.coords}
                title={depthInfo.waterName || 'Vandområde'}
                description={depthInfo.depth ? `Dybde: ${depthInfo.depth}cm` : 'Dybde ikke tilgængelig'}
              >
                <Ionicons name="water" size={28} color="#0066CC" />
              </Marker>
            )}
          </MapView>
        )}
      </View>

      {/* Depth Info Card */}
      {depthInfo && (
        <View style={styles.depthInfoCard}>
          <View style={styles.depthInfoHeader}>
            <Ionicons name="water" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.depthInfoTitle}>{depthInfo.waterName}</Text>
            <TouchableOpacity onPress={() => setDepthInfo(null)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {loadingDepthInfo ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 8 }} />
          ) : (
            <>
              {depthInfo.depth !== null ? (
                <View style={styles.depthInfoContent}>
                  <Text style={styles.depthInfoLabel}>Dybde:</Text>
                  <Text style={styles.depthInfoValue}>{depthInfo.depth}cm</Text>
                </View>
              ) : (
                <Text style={styles.depthInfoNoData}>Dybdedata ikke tilgængelig for dette område</Text>
              )}
              <View style={styles.depthInfoCoords}>
                <Text style={styles.depthInfoCoordsText}>
                  📍 {depthInfo.coords.latitude.toFixed(4)}°N, {depthInfo.coords.longitude.toFixed(4)}°Ø
                </Text>
              </View>
            </>
          )}
        </View>
      )}

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={openSaveFavoriteModal}
                  style={styles.favoriteHeaderButton}
                >
                  <Ionicons name="heart" size={24} color="#FFFFFF" />
                  <Text style={styles.favoriteHeaderButtonText}>Føj til Favoritter</Text>
                </TouchableOpacity>
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
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingAiAdvice ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Analyserer fiskemuligheder...</Text>
                </View>
              ) : aiAdvice ? (
                <>
                  <Text style={styles.adviceText}>{aiAdvice}</Text>

                  {/* Save to Favorites Button */}
                  <TouchableOpacity
                    style={styles.saveFavoriteButton}
                    onPress={openSaveFavoriteModal}
                  >
                    <Ionicons name="heart" size={24} color="#FFFFFF" />
                    <Text style={styles.saveFavoriteButtonText}>Føj til Favoritter</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Favorite Location Modal */}
      <Modal
        visible={showFavoriteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFavoriteModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFavoriteModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Gem Favoritsted</Text>

              <Text style={styles.inputLabel}>Navn *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="F.eks. 'Min hemmelige plet'"
                value={favoriteName}
                onChangeText={setFavoriteName}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Fiskearter</Text>
              <TextInput
                style={styles.textInput}
                placeholder="F.eks. 'Gedde, Aborre'"
                value={favoriteFishSpecies}
                onChangeText={setFavoriteFishSpecies}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Bundforhold</Text>
              <TextInput
                style={styles.textInput}
                placeholder="F.eks. 'Sand, sten'"
                value={favoriteBottomType}
                onChangeText={setFavoriteBottomType}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Dybde (meter)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="F.eks. '5'"
                value={favoriteDepth}
                onChangeText={setFavoriteDepth}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Parkering (Koordinater)</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Breddegrad"
                  value={favoriteParkingLat}
                  onChangeText={setFavoriteParkingLat}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Længdegrad"
                  value={favoriteParkingLng}
                  onChangeText={setFavoriteParkingLng}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
              {favoriteParkingLat && favoriteParkingLng && (
                <TouchableOpacity
                  style={styles.mapsButton}
                  onPress={() => openInGoogleMaps(parseFloat(favoriteParkingLat), parseFloat(favoriteParkingLng))}
                >
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.mapsButtonText}>Kør til parkering</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Deling</Text>
              <View style={styles.privacyButtons}>
                {[
                  { value: 'public', label: 'Offentlig', icon: 'globe' },
                  { value: 'groups', label: 'Grupper', icon: 'people' },
                  { value: 'friends', label: 'Venner', icon: 'person-add' },
                  { value: 'private', label: 'Privat', icon: 'lock-closed' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.privacyButton,
                      favoritePrivacy === option.value && styles.privacyButtonActive,
                    ]}
                    onPress={() => setFavoritePrivacy(option.value as any)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={favoritePrivacy === option.value ? '#FFFFFF' : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.privacyButtonText,
                        favoritePrivacy === option.value && styles.privacyButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Noter</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Personlige noter om stedet..."
                value={favoriteNotes}
                onChangeText={setFavoriteNotes}
                multiline
                placeholderTextColor="#999"
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#ccc', flex: 1 }]}
                  onPress={() => setShowFavoriteModal(false)}
                >
                  <Text style={styles.modalButtonText}>Annuller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: COLORS.primary, flex: 1 }]}
                  onPress={saveFavoriteLocation}
                  disabled={savingFavorite}
                >
                  {savingFavorite ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>Gem</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <FloatingMenu />
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
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
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
  depthInfoCard: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  depthInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  depthInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  depthInfoContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  depthInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  depthInfoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  depthInfoNoData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  depthInfoCoords: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  depthInfoCoordsText: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  privacyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  privacyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  privacyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  privacyButtonTextActive: {
    color: '#FFFFFF',
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  mapsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  favoriteHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveFavoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  saveFavoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
