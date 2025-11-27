import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import MapView, { Marker, Circle, Polygon, PROVIDER_GOOGLE, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, SHADOWS } from '@/constants/branding';
import { api } from '../lib/api';
import {
  ALL_FISHING_LOCATIONS,
  FishingLocation,
  findNearestFishingLocation,
  getWaterTypeColor,
  getSpeciesById,
  getSpeciesName,
} from '../data/fishingLocations';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

type Species = {
  id: string;
  name: string;
  scientificName: string | null;
  rarity: string | null;
};

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

type HotSpot = {
  latitude: number;
  longitude: number;
  totalAnglers: number;
  totalCatches: number;
  totalScore: number;
  topAnglers: Array<{ name: string; score: number; catches: number }>;
  fishSpecies: string[];
  userRank?: number;
  userStats?: { catches: number; score: number };
};

type FavoriteSpot = {
  latitude: number;
  longitude: number;
  visitCount: number;
  catchCount: number;
  totalScore: number;
  biggestFish?: { species: string; weight: number };
  longestFish?: { species: string; length: number };
  fishSpecies: string[];
  recentCatches: Array<{ species: string; weight: number; date: string }>;
};

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const mapRef = useRef<MapView>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [topSpots, setTopSpots] = useState<TopSpot[]>([]);
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [favoriteSpots, setFavoriteSpots] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDepthChart, setShowDepthChart] = useState(false);
  const [showHotSpots, setShowHotSpots] = useState(true);
  const [showFavoriteSpots, setShowFavoriteSpots] = useState(true);
  const [showFishingSpots, setShowFishingSpots] = useState(true);
  const [selectedFishingSpot, setSelectedFishingSpot] = useState<FishingLocation | null>(null);
  const [nearestFishingSpot, setNearestFishingSpot] = useState<{ location: FishingLocation; distance: number } | null>(null);

  // Accordion states for filter sections
  const [expandedSpecies, setExpandedSpecies] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState(false);
  const [expandedBaseMap, setExpandedBaseMap] = useState(true);
  const [expandedDataLayers, setExpandedDataLayers] = useState(false);
  const [baseMap, setBaseMap] = useState<'arcgis-ocean' | 'arcgis-topo' | 'arcgis-imagery' | 'arcgis-streets' | 'standard' | 'satellite'>('standard');

  // ArcGIS Feature Layers
  const [showFredningsbaelter, setShowFredningsbaelter] = useState(false); // Fredningsbælter (LBST)
  const [fredningsbaelterPolygons, setFredningsbaelterPolygons] = useState<any[]>([]); // Fetched polygons
  const [loadingFredningsbaelter, setLoadingFredningsbaelter] = useState(false);
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

  // Hot Spot and Favorite Spot modals
  const [selectedHotSpot, setSelectedHotSpot] = useState<HotSpot | null>(null);
  const [selectedFavoriteSpot, setSelectedFavoriteSpot] = useState<FavoriteSpot | null>(null);

  const fetchSpecies = async () => {
    try {
      const { data } = await api.get('/species');
      setAllSpecies(data);
    } catch (error) {
      console.error('Failed to fetch species:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
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
      const params = new URLSearchParams();
      params.append('gridSize', '0.02');

      // Add multiple species as query parameters
      if (selectedSpecies.length > 0) {
        selectedSpecies.forEach(species => {
          params.append('species', species);
        });
      }

      if (selectedSeason) {
        params.append('season', selectedSeason);
      }

      const url = `${API_URL}/spots/heatmap?${params.toString()}`;

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
      const params = new URLSearchParams();
      params.append('limit', '20');

      // Add multiple species as query parameters
      if (selectedSpecies.length > 0) {
        selectedSpecies.forEach(species => {
          params.append('species', species);
        });
      }

      const url = `${API_URL}/spots/top?${params.toString()}`;

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

  const fetchHotSpots = async () => {
    try {
      if (!userLocation) return;

      const { data } = await api.get(
        `/hot-spots/discover?near=${userLocation.latitude},${userLocation.longitude}`
      );

      if (data.hotSpots) {
        setHotSpots(data.hotSpots);
      }
    } catch (error) {
      console.error('Hot spots fetch error:', error);
    }
  };

  const fetchFavoriteSpots = async () => {
    try {
      const { data } = await api.get('/hot-spots/my-favorites');

      if (data.favoriteSpots) {
        setFavoriteSpots(data.favoriteSpots);
      }
    } catch (error) {
      console.error('Favorite spots fetch error:', error);
    }
  };

  const fetchFredningsbaelter = async () => {
    try {
      setLoadingFredningsbaelter(true);
      const url = 'https://services-eu1.arcgis.com/c3o7qz6F0HswtuVz/arcgis/rest/services/Fredningsbælter/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Transform ArcGIS features to polygon coordinates
        const polygons = data.features.map((feature: any, index: number) => {
          if (feature.geometry && feature.geometry.rings) {
            return {
              id: index,
              coordinates: feature.geometry.rings[0].map((coord: number[]) => ({
                latitude: coord[1],
                longitude: coord[0],
              })),
              attributes: feature.attributes,
            };
          }
          return null;
        }).filter(Boolean);

        setFredningsbaelterPolygons(polygons);
      }
    } catch (error) {
      console.error('Fredningsbælter fetch error:', error);
    } finally {
      setLoadingFredningsbaelter(false);
    }
  };

  useEffect(() => {
    getUserLocation();
    fetchSpecies();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchHeatmapData(),
        fetchTopSpots(),
        fetchHotSpots(),
        fetchFavoriteSpots(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [selectedSpecies, selectedSeason]);

  // Fetch hot spots when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchHotSpots();
    }
  }, [userLocation]);

  // Fetch fredningsbælter when layer is enabled
  useEffect(() => {
    if (showFredningsbaelter && fredningsbaelterPolygons.length === 0) {
      fetchFredningsbaelter();
    }
  }, [showFredningsbaelter]);

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

  const getFredningsColor = (attributes: any) => {
    const periodeTyp = attributes.PeriodeTyp;
    const fredningsp = attributes.FREDNINGSP?.toLowerCase() || '';

    // Helårsfredning (year-round closure) = RØD
    if (periodeTyp === 'H' || fredningsp.includes('helår')) {
      return { fill: 'rgba(255, 0, 0, 0.5)', stroke: '#FF0000' };
    }
    // Redskabsbegrænsning = GUL
    if (fredningsp.includes('redskab') || fredningsp.includes('garn') || fredningsp.includes('trawl') || fredningsp.includes('snøre')) {
      return { fill: 'rgba(255, 255, 0, 0.5)', stroke: '#FFD700' };
    }
    // Sæsonfredning (seasonal closure) = BLÅ
    if (periodeTyp === 'S' || fredningsp.includes('sæson')) {
      return { fill: 'rgba(0, 100, 255, 0.4)', stroke: '#0064FF' };
    }
    // Special fredning eller andre = BLÅ
    return { fill: 'rgba(0, 150, 255, 0.4)', stroke: '#0096FF' };
  };

  // Filter polygons to only show those in the current viewport
  const getVisiblePolygons = () => {
    if (!showFredningsbaelter || fredningsbaelterPolygons.length === 0) {
      return [];
    }

    // Add buffer to viewport for smoother experience
    const buffer = 0.5; // degrees
    const minLat = region.latitude - (region.latitudeDelta / 2) - buffer;
    const maxLat = region.latitude + (region.latitudeDelta / 2) + buffer;
    const minLng = region.longitude - (region.longitudeDelta / 2) - buffer;
    const maxLng = region.longitude + (region.longitudeDelta / 2) + buffer;

    const visiblePolygons = fredningsbaelterPolygons.filter((polygon: any) => {
      // Check if any coordinate of the polygon is within the viewport
      return polygon.coordinates.some((coord: any) =>
        coord.latitude >= minLat &&
        coord.latitude <= maxLat &&
        coord.longitude >= minLng &&
        coord.longitude <= maxLng
      );
    });

    // Limit to 50 polygons for performance
    const limitedPolygons = visiblePolygons.slice(0, 50);

    if (visiblePolygons.length > 0) {
    }

    return limitedPolygons;
  };

  // Check if a point is inside a polygon (simple ray casting algorithm)
  const isPointInPolygon = (point: { latitude: number; longitude: number }, polygon: any[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude;
      const yi = polygon[i].longitude;
      const xj = polygon[j].latitude;
      const yj = polygon[j].longitude;

      const intersect = ((yi > point.longitude) !== (yj > point.longitude)) &&
        (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Find protection zone at clicked location
  const findFredningAtLocation = (latitude: number, longitude: number) => {
    const visiblePolygons = getVisiblePolygons();
    for (const polygon of visiblePolygons) {
      if (isPointInPolygon({ latitude, longitude }, polygon.coordinates)) {
        return polygon.attributes;
      }
    }
    return null;
  };

  const formatFredningsInfo = (attributes: any) => {
    const navn = attributes.NAVN || 'Fredningsbælte';
    const fredningsp = attributes.FREDNINGSP || 'Ikke angivet';
    const periodeTyp = attributes.PeriodeTyp;
    const beskrivels = attributes.Beskrivels || '';
    const lovgrundla = attributes.LOVGRUNDLA || '';
    const bemarkning = attributes.BEMARKNING || '';

    // Detaljeret type beskrivelse med nye farver
    let typeInfo = '';
    let farvekode = '';

    if (periodeTyp === 'H' || fredningsp.toLowerCase().includes('helår')) {
      typeInfo = '🔴 **HELÅRSFREDNING**\nALLE former for fiskeri er forbudt hele året.';
      farvekode = 'Rød';
    } else if (fredningsp.toLowerCase().includes('redskab') || fredningsp.toLowerCase().includes('garn') || fredningsp.toLowerCase().includes('trawl') || fredningsp.toLowerCase().includes('snøre')) {
      typeInfo = '🟡 **REDSKABSBEGRÆNSNING**\nBestemte redskaber er forbudt (f.eks. garn, trawl, snøre).\nAndre fiskerimetoder kan være tilladt.';
      farvekode = 'Gul';
    } else if (periodeTyp === 'S' || fredningsp.toLowerCase().includes('sæson')) {
      typeInfo = '🔵 **SÆSONFREDNING**\nFiskeri er forbudt i bestemte perioder af året.';
      farvekode = 'Blå';
    } else {
      typeInfo = '🔵 **SPECIEL FREDNING**\nSpecifikke begrænsninger gælder i området.';
      farvekode = 'Blå';
    }

    return `⚠️ **FREDNINGSZONE** (${farvekode})\n\n**${navn}**\n\n${typeInfo}\n\n**Type:** ${fredningsp}\n\n${beskrivels ? `**Beskrivelse:** ${beskrivels}\n\n` : ''}${lovgrundla ? `**Lovgrundlag:** ${lovgrundla}\n\n` : ''}${bemarkning ? `**Bemærkning:** ${bemarkning}\n` : ''}`;
  };

  const handleLongPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
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
        }
      } catch (nameError) {
        console.error('Failed to fetch water name:', nameError);
      }

      // Try to fetch depth from EMODnet REST API
      try {
        const depthUrl = `https://rest.emodnet-bathymetry.eu/depth_sample?geom=POINT(${longitude}%20${latitude})&crs=4326`;
        const depthResponse = await fetch(depthUrl);
        if (depthResponse.ok) {
          const depthText = await depthResponse.text();
          try {
            const depthData = JSON.parse(depthText);
            // Convert meters to centimeters
            depth = depthData.avg !== undefined ? Math.round(depthData.avg * 100) : null;
          } catch (parseError) {
            console.error('Failed to parse depth JSON:', parseError);
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

    // Find nearest fishing spot from the database
    const nearest = findNearestFishingLocation(latitude, longitude, 50);
    setNearestFishingSpot(nearest);

    // Check if clicked inside a protection zone
    const fredningsZone = showFredningsbaelter ? findFredningAtLocation(latitude, longitude) : null;
    const fredningsInfo = fredningsZone ? formatFredningsInfo(fredningsZone) : '';

    // Show zone info and nearest spot immediately
    let initialInfo = '';
    if (fredningsInfo) {
      initialInfo = fredningsInfo + '\n\n---\n\n';
    }
    if (nearest) {
      initialInfo += `Nærmeste fiskeplads: ${nearest.location.name} (${nearest.distance.toFixed(1)} km)\n`;
      initialInfo += `🌊 ${nearest.location.waterType === 'ferskvand' ? 'Ferskvand' : nearest.location.waterType === 'saltvand' ? 'Saltvand' : 'Brakvand'}\n`;
      initialInfo += `🐟 Arter: ${nearest.location.species.slice(0, 5).map(id => getSpeciesName(id)).join(', ')}${nearest.location.species.length > 5 ? '...' : ''}\n\n`;
    }
    initialInfo += '*Henter fiskerådgivning...*';
    setAiAdvice(initialInfo);

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

      // Prepare context for AI with ArcGIS map data and fishing location data
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
        // Include nearest fishing location data for AI context
        nearestFishingSpot: nearest ? {
          name: nearest.location.name,
          distance: nearest.distance,
          waterType: nearest.location.waterType,
          species: nearest.location.species.map(id => getSpeciesName(id)),
          depth: nearest.location.depth,
          regulations: nearest.location.regulations,
          description: nearest.location.description,
        } : null,
        season: new Date().getMonth() < 3 ? 'vinter' :
                new Date().getMonth() < 6 ? 'forår' :
                new Date().getMonth() < 9 ? 'sommer' : 'efterår',
        mapLayers: {
          baseMap: baseMap,
          heatmap: showHeatmap,
          hotspots: showHotSpots,
          depthChart: showDepthChart,
          fredningsbaelter: showFredningsbaelter,
          fishingSpots: showFishingSpots
        },
        arcgisData: {
          mapType: baseMap.includes('arcgis') ? baseMap.replace('arcgis-', '') : 'standard',
          oceanBasemap: baseMap === 'arcgis-ocean',
          topographicMap: baseMap === 'arcgis-topo',
          imageryAvailable: baseMap === 'arcgis-imagery',
          depthDataVisible: showDepthChart,
          protectedZonesVisible: showFredningsbaelter
        }
      };

      // Call AI service through backend using api client (handles token refresh)
      const { data } = await api.post('/ai/fishing-advice', context);
      // Combine protection zone info with AI advice
      let finalAdvice = '';
      if (fredningsInfo) {
        finalAdvice = fredningsInfo + '\n\n---\n\n';
      }

      // Handle both successful AI responses and fallback advice
      if (data.advice) {
        finalAdvice += data.advice;
      } else {
        finalAdvice += 'Ingen råd tilgængelige på nuværende tidspunkt.';
      }

      setAiAdvice(finalAdvice);
    } catch (error: any) {
      console.error('Failed to get AI advice:', error);

      // Combine protection zone info with error message
      let finalAdvice = '';
      if (fredningsInfo) {
        finalAdvice = fredningsInfo + '\n\n---\n\n';
      }

      // Check if error response contains fallback advice
      if (error.response?.data?.advice) {
        finalAdvice += error.response.data.advice;
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Ukendt fejl';
        finalAdvice +=
          `❌ Kunne ikke hente AI-rådgivning.\n\n` +
          `Fejl: ${errorMessage}\n\n` +
          `💡 Prøv at:\n` +
          `• Tjekke din internetforbindelse\n` +
          `• Opdatere appen\n` +
          `• Prøve igen om lidt`;
      }

      setAiAdvice(finalAdvice);
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
    <PageLayout>
      <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
        {/* Weather & Location Card */}
        <WeatherLocationCard showLocation={true} showWeather={true} />

      {/* Map Container - Render First */}
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
            mapType={baseMap.startsWith('arcgis') ? 'none' : (baseMap as 'standard' | 'satellite' | 'none')}
          >
            {/* ========== BASE MAPS ========== */}

            {/* ArcGIS Ocean Basemap */}
            {baseMap === 'arcgis-ocean' && (
              <>
                <UrlTile
                  urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                  maximumZ={16}
                  zIndex={0}
                />
                <UrlTile
                  urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
                  maximumZ={16}
                  zIndex={1}
                />
              </>
            )}

            {/* ArcGIS Topographic Map */}
            {baseMap === 'arcgis-topo' && (
              <UrlTile
                urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                maximumZ={19}
                zIndex={0}
              />
            )}

            {/* ArcGIS World Imagery */}
            {baseMap === 'arcgis-imagery' && (
              <>
                <UrlTile
                  urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maximumZ={19}
                  zIndex={0}
                />
                <UrlTile
                  urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  maximumZ={19}
                  zIndex={1}
                  opacity={0.8}
                />
              </>
            )}

            {/* ArcGIS Street Map */}
            {baseMap === 'arcgis-streets' && (
              <UrlTile
                urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                maximumZ={19}
                zIndex={0}
              />
            )}

            {/* Standard satellite with labels */}
            {baseMap === 'satellite' && (
              <UrlTile
                urlTemplate="https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
                maximumZ={18}
                zIndex={200}
                opacity={0.9}
              />
            )}

            {/* ========== FEATURE LAYERS (Overlays) ========== */}

            {/* Fredningsbælter - Danish fishing protection zones from LBST */}
            {/* Only render polygons visible in current viewport for better performance */}
            {/* Polygons are non-tappable to allow map clicks - polygon detection happens in handleMapPress */}
            {getVisiblePolygons().map((polygon: any) => {
              const colors = getFredningsColor(polygon.attributes);
              return (
                <Polygon
                  key={`fredning-${polygon.id}`}
                  coordinates={polygon.coordinates}
                  strokeColor={colors.stroke}
                  fillColor={colors.fill}
                  strokeWidth={2}
                  tappable={false}
                />
              );
            })}

            {/* Water Depth Chart - Shows water areas with depth colors */}
            {showDepthChart && (() => {
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
            {showHotSpots &&
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

            {/* Hot Spots markers */}
            {showHotSpots &&
              hotSpots.map((spot, index) => (
                <Marker
                  key={`hotspot-${index}`}
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                  title={`Hot Spot - ${spot.totalCatches} fangster`}
                  description={`${spot.totalAnglers} anglere | Score: ${spot.totalScore}`}
                  onPress={() => setSelectedHotSpot(spot)}
                >
                  <Text style={{ fontSize: 28 }}>🔥</Text>
                </Marker>
              ))}

            {/* Favorite Spots markers */}
            {showFavoriteSpots &&
              favoriteSpots.map((spot, index) => (
                <Marker
                  key={`favorite-${index}`}
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                  title={`Favoritsted - ${spot.catchCount} fangster`}
                  description={`${spot.visitCount} besøg | Score: ${spot.totalScore}`}
                  onPress={() => setSelectedFavoriteSpot(spot)}
                >
                  <Text style={{ fontSize: 28 }}>⭐</Text>
                </Marker>
              ))}

            {/* Fishing Spots from Database */}
            {showFishingSpots &&
              ALL_FISHING_LOCATIONS.map((spot, index) => (
                <Marker
                  key={`fishingspot-${index}`}
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                  title={spot.name}
                  description={`${spot.waterType === 'ferskvand' ? 'Ferskvand' : spot.waterType === 'saltvand' ? 'Saltvand' : 'Brakvand'} • ${spot.depth || 'Ukendt dybde'}`}
                  onPress={() => setSelectedFishingSpot(spot)}
                >
                  <View style={{
                    backgroundColor: getWaterTypeColor(spot.waterType),
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                    <Ionicons
                      name={spot.waterType === 'ferskvand' ? 'leaf' : spot.waterType === 'saltvand' ? 'water' : 'git-merge'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                </Marker>
              ))}

            {/* User's current location */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Din placering"
                description="Du er her"
              >
                <Ionicons name="location" size={32} color={colors.accent} />
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

      {/* Filter Dropdown Button - Top Right - Rendered AFTER map */}
      <TouchableOpacity
        style={[styles.filterDropdownButton, { top: insets.top + 80 }]}
        onPress={() => setShowFilters(!showFilters)}
        activeOpacity={0.9}
      >
        <Ionicons name="options" size={20} color={colors.white} style={{ marginRight: 6 }} />
        <Text style={styles.filterDropdownText}>Filter</Text>
        <Ionicons
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.white}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* Center on User Location Button - Rendered AFTER map */}
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

      {/* Filters Container - Rendered AFTER map */}
      {showFilters && (
        <View style={[styles.filtersContainer, { top: insets.top + 120 }]}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          >
          {/* Accordion Section: Fish Species */}
          <View style={styles.accordionSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowSpeciesModal(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="fish" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.accordionTitle}>Fiskeart</Text>
                {selectedSpecies.length > 0 && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{selectedSpecies.length} arter valgt</Text>
                  </View>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Accordion Section: Season */}
          <View style={styles.accordionSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExpandedSeason(!expandedSeason)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.accordionTitle}>Sæson</Text>
                {selectedSeason && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                      {SEASONS.find(s => s.value === selectedSeason)?.label}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons
                name={expandedSeason ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedSeason && (
              <View style={styles.accordionContent}>
                <View style={styles.chipContainer}>
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
              </View>
            )}
          </View>

          {/* Accordion Section: Base Map */}
          <View style={styles.accordionSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExpandedBaseMap(!expandedBaseMap)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="map" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.accordionTitle}>Grundkort</Text>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>
                    {baseMap === 'arcgis-ocean' ? 'Ocean' :
                     baseMap === 'arcgis-topo' ? 'Topo' :
                     baseMap === 'arcgis-imagery' ? 'ArcGIS Sat' :
                     baseMap === 'arcgis-streets' ? 'Veje' :
                     baseMap === 'satellite' ? 'Google Sat' : 'Standard'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={expandedBaseMap ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedBaseMap && (
              <View style={styles.accordionContent}>
                <View style={styles.chipContainer}>
                  {[
                    { value: 'standard', label: 'Standard', icon: 'map-outline', provider: 'Google' },
                    { value: 'satellite', label: 'Google Sat', icon: 'logo-google', provider: 'Google' },
                    { value: 'arcgis-ocean', label: 'Ocean', icon: 'water', provider: 'ArcGIS' },
                    { value: 'arcgis-topo', label: 'Topo', icon: 'map', provider: 'ArcGIS' },
                    { value: 'arcgis-imagery', label: 'ArcGIS Sat', icon: 'globe', provider: 'ArcGIS' },
                    { value: 'arcgis-streets', label: 'Veje', icon: 'car', provider: 'ArcGIS' },
                  ].map((map) => (
                    <TouchableOpacity
                      key={map.value}
                      style={[
                        styles.toggleButton,
                        baseMap === map.value && styles.toggleButtonActive,
                      ]}
                      onPress={() => setBaseMap(map.value as any)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name={map.icon as any}
                          size={16}
                          color={baseMap === map.value ? 'white' : '#666'}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[
                          styles.toggleButtonText,
                          baseMap === map.value && styles.toggleButtonTextActive
                        ]}>
                          {map.label}
                        </Text>
                      </View>
                      <Text style={[
                        styles.providerBadge,
                        baseMap === map.value && styles.providerBadgeActive
                      ]}>
                        {map.provider}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Accordion Section: Data Layers */}
          <View style={styles.accordionSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExpandedDataLayers(!expandedDataLayers)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="layers" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.accordionTitle}>Lag</Text>
                {(showHeatmap || showDepthChart || showFredningsbaelter || showHotSpots || showFavoriteSpots) && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.selectedBadgeText}>
                      {[showHeatmap, showDepthChart, showFredningsbaelter, showHotSpots, showFavoriteSpots].filter(Boolean).length}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons
                name={expandedDataLayers ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedDataLayers && (
              <View style={styles.accordionContent}>
                <View style={styles.chipContainer}>
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
                    style={[styles.toggleButton, showDepthChart && styles.toggleButtonActive]}
                    onPress={() => setShowDepthChart(!showDepthChart)}
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

                  <TouchableOpacity
                    style={[styles.toggleButton, showFredningsbaelter && styles.toggleButtonActive]}
                    onPress={() => setShowFredningsbaelter(!showFredningsbaelter)}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={showFredningsbaelter ? 'white' : '#666'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.toggleButtonText, showFredningsbaelter && styles.toggleButtonTextActive]}>
                      Fredningsbælter
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleButton, showHotSpots && styles.toggleButtonActive]}
                    onPress={() => setShowHotSpots(!showHotSpots)}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>🔥</Text>
                    <Text style={[styles.toggleButtonText, showHotSpots && styles.toggleButtonTextActive]}>
                      Hot Spots
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleButton, showFavoriteSpots && styles.toggleButtonActive]}
                    onPress={() => setShowFavoriteSpots(!showFavoriteSpots)}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>⭐</Text>
                    <Text style={[styles.toggleButtonText, showFavoriteSpots && styles.toggleButtonTextActive]}>
                      Favoritsteder
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleButton, showFishingSpots && styles.toggleButtonActive]}
                    onPress={() => setShowFishingSpots(!showFishingSpots)}
                  >
                    <Ionicons
                      name="fish"
                      size={16}
                      color={showFishingSpots ? 'white' : '#666'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.toggleButtonText, showFishingSpots && styles.toggleButtonTextActive]}>
                      Fiskepladser
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          </ScrollView>
        </View>
      )}

      {/* Depth Info Card - Rendered AFTER map */}
      {depthInfo && (
        <View style={styles.depthInfoCard}>
          <View style={styles.depthInfoHeader}>
            <Ionicons name="water" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.depthInfoTitle}>{depthInfo.waterName}</Text>
            <TouchableOpacity onPress={() => setDepthInfo(null)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {loadingDepthInfo ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
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
                   {depthInfo.coords.latitude.toFixed(4)}°N, {depthInfo.coords.longitude.toFixed(4)}°Ø
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
                <Ionicons name="fish" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>AI Fiskeguide</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={openSaveFavoriteModal}
                  style={styles.favoriteHeaderButton}
                >
                  <Ionicons name="heart" size={18} color="#FFFFFF" />
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
                      color={favoritePrivacy === option.value ? '#FFFFFF' : colors.primary}
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
                  style={[styles.modalButton, { backgroundColor: colors.primary, flex: 1 }]}
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

      {/* Hot Spot Modal */}
      <Modal
        visible={selectedHotSpot !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedHotSpot(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginRight: 8 }}>🔥</Text>
                <Text style={styles.modalTitle}>Hot Spot</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedHotSpot(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedHotSpot && (
                <>
                  <View style={styles.hotSpotStatsContainer}>
                    <View style={styles.hotSpotStat}>
                      <Ionicons name="people" size={24} color={colors.primary} />
                      <Text style={styles.hotSpotStatValue}>{selectedHotSpot.totalAnglers}</Text>
                      <Text style={styles.hotSpotStatLabel}>Anglere</Text>
                    </View>
                    <View style={styles.hotSpotStat}>
                      <Ionicons name="fish" size={24} color={colors.primary} />
                      <Text style={styles.hotSpotStatValue}>{selectedHotSpot.totalCatches}</Text>
                      <Text style={styles.hotSpotStatLabel}>Fangster</Text>
                    </View>
                    <View style={styles.hotSpotStat}>
                      <Ionicons name="trophy" size={24} color={colors.primary} />
                      <Text style={styles.hotSpotStatValue}>{selectedHotSpot.totalScore}</Text>
                      <Text style={styles.hotSpotStatLabel}>Score</Text>
                    </View>
                  </View>

                  {selectedHotSpot.fishSpecies && selectedHotSpot.fishSpecies.length > 0 && (
                    <View style={styles.hotSpotSection}>
                      <Text style={styles.hotSpotSectionTitle}>Fiskearter</Text>
                      <View style={styles.fishSpeciesContainer}>
                        {selectedHotSpot.fishSpecies.map((species, index) => (
                          <View key={index} style={styles.fishSpeciesChip}>
                            <Text style={styles.fishSpeciesText}>{species}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedHotSpot.topAnglers && selectedHotSpot.topAnglers.length > 0 && (
                    <View style={styles.hotSpotSection}>
                      <Text style={styles.hotSpotSectionTitle}>Top 3 Anglere</Text>
                      {selectedHotSpot.topAnglers.map((angler, index) => (
                        <View key={index} style={styles.topAnglerItem}>
                          <View style={styles.topAnglerRank}>
                            <Text style={styles.topAnglerRankText}>{index + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.topAnglerName}>{angler.name}</Text>
                            <Text style={styles.topAnglerStats}>
                              {angler.catches} fangster • {angler.score} point
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.viewLeaderboardButton}
                    onPress={() => {
                      setSelectedHotSpot(null);
                      // Navigate to detail page - you can implement this later
                      Alert.alert('Leaderboard', 'Navigering til fuld leaderboard kommer snart!');
                    }}
                  >
                    <Ionicons name="list" size={24} color="#FFFFFF" />
                    <Text style={styles.viewLeaderboardButtonText}>Se Fuld Leaderboard</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Species Selection Modal */}
      <Modal
        visible={showSpeciesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSpeciesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="fish" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Vælg fiskearter</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSpeciesModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => setSelectedSpecies(allSpecies.map(s => s.name))}
              >
                <Text style={styles.modalButtonText}>Vælg alle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc', flex: 1 }]}
                onPress={() => setSelectedSpecies([])}
              >
                <Text style={styles.modalButtonText}>Fravælg alle</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {allSpecies.map((species) => {
                const isSelected = selectedSpecies.includes(species.name);
                return (
                  <TouchableOpacity
                    key={species.id}
                    style={styles.speciesCheckboxItem}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedSpecies(selectedSpecies.filter(s => s !== species.name));
                      } else {
                        setSelectedSpecies([...selectedSpecies, species.name]);
                      }
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.speciesName}>{species.name}</Text>
                      {species.scientificName && (
                        <Text style={styles.speciesScientific}>{species.scientificName}</Text>
                      )}
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isSelected ? colors.primary : '#ccc'}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ padding: 20 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowSpeciesModal(false)}
              >
                <Text style={styles.modalButtonText}>Anvend filter ({selectedSpecies.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Favorite Spot Modal */}
      <Modal
        visible={selectedFavoriteSpot !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedFavoriteSpot(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginRight: 8 }}>⭐</Text>
                <Text style={styles.modalTitle}>Favoritsted</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFavoriteSpot(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedFavoriteSpot && (
                <>
                  <View style={styles.favoriteSpotStatsContainer}>
                    <View style={styles.favoriteSpotStat}>
                      <Ionicons name="calendar" size={24} color={colors.primary} />
                      <Text style={styles.favoriteSpotStatValue}>{selectedFavoriteSpot.visitCount}</Text>
                      <Text style={styles.favoriteSpotStatLabel}>Besøg</Text>
                    </View>
                    <View style={styles.favoriteSpotStat}>
                      <Ionicons name="fish" size={24} color={colors.primary} />
                      <Text style={styles.favoriteSpotStatValue}>{selectedFavoriteSpot.catchCount}</Text>
                      <Text style={styles.favoriteSpotStatLabel}>Fangster</Text>
                    </View>
                    <View style={styles.favoriteSpotStat}>
                      <Ionicons name="trophy" size={24} color={colors.primary} />
                      <Text style={styles.favoriteSpotStatValue}>{selectedFavoriteSpot.totalScore}</Text>
                      <Text style={styles.favoriteSpotStatLabel}>Score</Text>
                    </View>
                  </View>

                  {(selectedFavoriteSpot.biggestFish || selectedFavoriteSpot.longestFish) && (
                    <View style={styles.favoriteSpotSection}>
                      <Text style={styles.favoriteSpotSectionTitle}>Personlige Rekorder</Text>
                      {selectedFavoriteSpot.biggestFish && (
                        <View style={styles.recordItem}>
                          <Ionicons name="barbell" size={20} color={colors.accent} />
                          <Text style={styles.recordText}>
                            Tungeste: {selectedFavoriteSpot.biggestFish.species} - {selectedFavoriteSpot.biggestFish.weight}g
                          </Text>
                        </View>
                      )}
                      {selectedFavoriteSpot.longestFish && (
                        <View style={styles.recordItem}>
                          <Ionicons name="resize" size={20} color={colors.accent} />
                          <Text style={styles.recordText}>
                            Længste: {selectedFavoriteSpot.longestFish.species} - {selectedFavoriteSpot.longestFish.length}cm
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {selectedFavoriteSpot.fishSpecies && selectedFavoriteSpot.fishSpecies.length > 0 && (
                    <View style={styles.favoriteSpotSection}>
                      <Text style={styles.favoriteSpotSectionTitle}>Fiskearter</Text>
                      <View style={styles.fishSpeciesContainer}>
                        {selectedFavoriteSpot.fishSpecies.map((species, index) => (
                          <View key={index} style={styles.fishSpeciesChip}>
                            <Text style={styles.fishSpeciesText}>{species}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedFavoriteSpot.recentCatches && selectedFavoriteSpot.recentCatches.length > 0 && (
                    <View style={styles.favoriteSpotSection}>
                      <Text style={styles.favoriteSpotSectionTitle}>Seneste Fangster</Text>
                      {selectedFavoriteSpot.recentCatches.map((catchItem, index) => (
                        <View key={index} style={styles.recentCatchItem}>
                          <Ionicons name="fish" size={20} color={colors.primary} />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.recentCatchSpecies}>{catchItem.species}</Text>
                            <Text style={styles.recentCatchDetails}>
                              {catchItem.weight}g • {new Date(catchItem.date).toLocaleDateString('da-DK')}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fishing Spot Details Modal */}
      <Modal
        visible={selectedFishingSpot !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedFishingSpot(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedFishingSpot ? getWaterTypeColor(selectedFishingSpot.waterType) : '#666',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}>
                  <Ionicons
                    name={
                      selectedFishingSpot?.waterType === 'ferskvand' ? 'leaf' :
                      selectedFishingSpot?.waterType === 'saltvand' ? 'water' : 'git-merge'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.modalTitle}>{selectedFishingSpot?.name || 'Fiskeplads'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFishingSpot(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedFishingSpot && (
                <>
                  {/* Water Type Badge */}
                  <View style={styles.fishingSpotBadgeRow}>
                    <View style={[styles.fishingSpotBadge, { backgroundColor: getWaterTypeColor(selectedFishingSpot.waterType) }]}>
                      <Text style={styles.fishingSpotBadgeText}>
                        {selectedFishingSpot.waterType === 'ferskvand' ? 'Ferskvand' :
                         selectedFishingSpot.waterType === 'saltvand' ? 'Saltvand' : 'Brakvand'}
                      </Text>
                    </View>
                    {selectedFishingSpot.depth && (
                      <View style={[styles.fishingSpotBadge, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.fishingSpotBadgeText}>{selectedFishingSpot.depth}</Text>
                      </View>
                    )}
                  </View>

                  {/* Description */}
                  {selectedFishingSpot.description && (
                    <View style={styles.fishingSpotSection}>
                      <Text style={styles.fishingSpotDescription}>{selectedFishingSpot.description}</Text>
                    </View>
                  )}

                  {/* Species Section */}
                  {selectedFishingSpot.species && selectedFishingSpot.species.length > 0 && (
                    <View style={styles.fishingSpotSection}>
                      <Text style={styles.fishingSpotSectionTitle}>
                        <Ionicons name="fish" size={16} color={colors.primary} /> Fiskearter
                      </Text>
                      <View style={styles.fishSpeciesContainer}>
                        {selectedFishingSpot.species.map((speciesId, index) => (
                          <View key={index} style={styles.fishSpeciesChip}>
                            <Text style={styles.fishSpeciesText}>{getSpeciesName(speciesId)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Regulations */}
                  {selectedFishingSpot.regulations && (
                    <View style={styles.fishingSpotSection}>
                      <Text style={styles.fishingSpotSectionTitle}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.warning} /> Regler & Information
                      </Text>
                      <Text style={styles.fishingSpotRegulations}>{selectedFishingSpot.regulations}</Text>
                    </View>
                  )}

                  {/* Coordinates */}
                  <View style={styles.fishingSpotSection}>
                    <Text style={styles.fishingSpotSectionTitle}>
                      <Ionicons name="location" size={16} color={colors.primary} /> Koordinater
                    </Text>
                    <Text style={styles.fishingSpotCoords}>
                      {selectedFishingSpot.latitude.toFixed(4)}°N, {selectedFishingSpot.longitude.toFixed(4)}°Ø
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.fishingSpotActions}>
                    <TouchableOpacity
                      style={[styles.fishingSpotActionButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setSelectedFishingSpot(null);
                        setSelectedLocation({
                          latitude: selectedFishingSpot.latitude,
                          longitude: selectedFishingSpot.longitude,
                        });
                        setLoadingAiAdvice(true);
                        // Trigger AI advice for this location
                        const event = {
                          nativeEvent: {
                            coordinate: {
                              latitude: selectedFishingSpot.latitude,
                              longitude: selectedFishingSpot.longitude,
                            },
                          },
                        };
                        handleMapPress(event);
                      }}
                    >
                      <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                      <Text style={styles.fishingSpotActionText}>Få AI Rådgivning</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.fishingSpotActionButton, { backgroundColor: '#22C55E' }]}
                      onPress={() => {
                        // Open in maps app
                        const url = Platform.OS === 'ios'
                          ? `maps:?q=${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}`
                          : `geo:${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}?q=${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}(${encodeURIComponent(selectedFishingSpot.name)})`;
                        Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="navigate" size={20} color="#FFFFFF" />
                      <Text style={styles.fishingSpotActionText}>Navigation</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </PageLayout>
  );
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
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
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 3000,
  },
  filterDropdownButton: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    ...SHADOWS.md,
    zIndex: 3002,
    elevation: 15,
  },
  filterDropdownText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    position: 'absolute',
    right: 16,
    left: 16,
    backgroundColor: colors.surface,
    maxHeight: '65%',
    borderRadius: 12,
    ...SHADOWS.lg,
    zIndex: 3001,
    elevation: 14,
  },
  filterCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  quickToggles: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  accordionSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accordionContent: {
    backgroundColor: '#f9f9f9',
    padding: 12,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    color: colors.white,
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
    color: colors.white,
  },
  providerBadge: {
    fontSize: 9,
    color: '#999',
    fontWeight: '500',
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  providerBadgeActive: {
    color: 'rgba(255, 255, 255, 0.7)',
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 3000,
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
    color: colors.primary,
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
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  privacyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privacyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  favoriteHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  // Hot Spot Modal Styles
  hotSpotStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  hotSpotStat: {
    alignItems: 'center',
  },
  hotSpotStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  hotSpotStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hotSpotSection: {
    marginBottom: 20,
  },
  hotSpotSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fishSpeciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fishSpeciesChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fishSpeciesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  topAnglerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  topAnglerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topAnglerRankText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topAnglerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topAnglerStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  viewLeaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  viewLeaderboardButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Favorite Spot Modal Styles
  favoriteSpotStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  favoriteSpotStat: {
    alignItems: 'center',
  },
  favoriteSpotStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  favoriteSpotStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  favoriteSpotSection: {
    marginBottom: 20,
  },
  favoriteSpotSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  recentCatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentCatchSpecies: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recentCatchDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // Species Modal Styles
  speciesCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  speciesScientific: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Fishing Spot Modal Styles
  fishingSpotBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  fishingSpotBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fishingSpotBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fishingSpotSection: {
    marginBottom: 20,
  },
  fishingSpotDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  fishingSpotSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  fishingSpotRegulations: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  fishingSpotCoords: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  fishingSpotActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  fishingSpotActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  fishingSpotActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  });
};
