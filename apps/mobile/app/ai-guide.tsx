import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "@/constants/branding";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../lib/api";
import PageLayout from "../components/PageLayout";
import WeatherLocationCard from "../components/WeatherLocationCard";

// Import from shared fishing locations database
import {
  FISH_SPECIES_DB,
  LOCATIONS_BY_REGION,
  ALL_FISHING_LOCATIONS,
  getSpeciesById,
  getSpeciesName,
  type FishSpecies,
  type FishingLocation,
  type LocationCategory,
} from "../data/fishingLocations";

// Import fishing gear database for smart recommendations
import {
  getSmartGearSuggestions,
  getLureById,
  getBaitById,
  getTechniqueById,
  SPECIES_GEAR_RECOMMENDATIONS,
} from "../data/fishingGear";

// Type alias for smart gear suggestions
type SmartGearSuggestions = ReturnType<typeof getSmartGearSuggestions>;

// Type alias for backward compatibility
type LocationSuggestion = FishingLocation;

// Flatten for easy access (using imported data)
const POPULAR_LOCATIONS: LocationSuggestion[] = ALL_FISHING_LOCATIONS;

interface BaitRecommendation {
  name: string;
  type: string;
  confidence: number;
  reason: string;
}

interface LureRecommendation {
  name: string;
  type: string;
  color: string;
  size: string;
  confidence: number;
  reason: string;
}

interface TechniqueRecommendation {
  name: string;
  description: string;
  confidence: number;
  tips: string[];
}

interface SpotRecommendation {
  latitude: number;
  longitude: number;
  distance_km: number;
  success_rate: number;
  recent_catches: number;
  reason: string;
}

interface AIRecommendations {
  species: string;
  success_probability: number;
  best_time: string;
  baits: BaitRecommendation[];
  lures: LureRecommendation[];
  techniques: TechniqueRecommendation[];
  nearby_spots: SpotRecommendation[];
  weather_impact: string;
  seasonal_notes: string;
  confidence_score: number;
  model_used: string;
}

interface WeatherForecast {
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  description: string;
  icon: string;
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
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      margin: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      ...SHADOWS.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: SPACING.md,
    },
    speciesScroll: {
      marginHorizontal: -SPACING.lg,
      paddingHorizontal: SPACING.lg,
    },
    speciesChip: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: colors.backgroundLight,
      marginRight: SPACING.sm,
      borderWidth: 2,
      borderColor: colors.border,
    },
    speciesChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    speciesChipText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    speciesChipTextActive: {
      color: colors.white,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.md,
    },
    dateButton: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.full,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    dateButtonText: {
      color: colors.white,
      fontSize: 18,
      fontWeight: "bold",
    },
    dateDisplay: {
      flex: 1,
      alignItems: "center",
    },
    dateText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    dateHint: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "capitalize",
    },
    quickDateButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    quickDateButton: {
      flex: 1,
      padding: SPACING.sm,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      alignItems: "center",
    },
    quickDateButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    locationButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    locationName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    locationDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    locationArrow: {
      fontSize: 16,
      color: colors.textTertiary,
    },
    locationList: {
      marginTop: SPACING.sm,
    },
    externalMapButton: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    externalMapContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    externalMapTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    externalMapDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    locationCategory: {
      marginBottom: SPACING.md,
    },
    locationCategoryTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: SPACING.sm,
      paddingBottom: SPACING.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    locationItem: {
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    locationItemActive: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.primary,
    },
    locationItemName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    locationItemDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    inputRow: {
      flexDirection: "row",
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    inputGroup: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: 14,
      backgroundColor: colors.surface,
      justifyContent: "center",
    },
    inputText: {
      fontSize: 14,
      color: colors.text,
    },
    getAdviceButton: {
      margin: SPACING.md,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      ...SHADOWS.glow,
    },
    getAdviceGradient: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
    },
    getAdviceButtonText: {
      color: colors.white,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
    resultsContainer: {
      margin: SPACING.md,
    },
    resultsTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    cardTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    resultCardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    probabilityBar: {
      padding: SPACING.lg,
      borderRadius: RADIUS.md,
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    probabilityText: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.white,
    },
    resultHint: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    insight: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      lineHeight: 18,
    },
    recommendationItem: {
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    recommendationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    recommendationName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    confidenceBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    confidenceText: {
      fontSize: 11,
      fontWeight: "bold",
      color: colors.white,
    },
    recommendationType: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    recommendationDetail: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    recommendationReason: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    tipsContainer: {
      marginTop: SPACING.sm,
      paddingLeft: SPACING.sm,
    },
    tip: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 3,
    },
    spotItem: {
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    spotHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    spotDistance: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    spotSuccess: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.success,
    },
    spotCatches: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    spotReason: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    footer: {
      padding: SPACING.md,
      alignItems: "center",
    },
    footerText: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    bottomSpacer: {
      height: 120,
    },
    weatherCard: {
      backgroundColor: colors.surface,
      margin: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      ...SHADOWS.md,
    },
    weatherHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    weatherTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    weatherTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    weatherMainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    weatherMainLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    weatherIconLarge: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.accent + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    weatherTempContainer: {
      alignItems: 'flex-start',
    },
    weatherTempMain: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    weatherTempRange: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    weatherDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    weatherGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    weatherGridItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      gap: SPACING.xs,
    },
    weatherGridLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    weatherGridValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    weatherLoading: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    weatherUnavailable: {
      padding: SPACING.lg,
      alignItems: 'center',
    },
    weatherUnavailableText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      maxHeight: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...TYPOGRAPHY.styles.h2,
    },
    modalBody: {
      padding: SPACING.lg,
    },
    modalLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: "600",
      marginBottom: SPACING.sm,
      marginTop: SPACING.md,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.backgroundLight,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    privacyButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
      flexWrap: "wrap",
    },
    privacyButton: {
      flex: 1,
      minWidth: "45%",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundLight,
      alignItems: "center",
    },
    privacyButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    privacyButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    privacyButtonTextActive: {
      color: colors.white,
    },
    parkingRow: {
      flexDirection: "row",
      gap: SPACING.md,
    },
    parkingInput: {
      flex: 1,
    },
    parkingInputLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    navigateButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      gap: SPACING.sm,
      marginTop: SPACING.md,
      ...SHADOWS.md,
    },
    navigateButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    modalFooter: {
      flexDirection: "row",
      padding: SPACING.lg,
      gap: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    gearCard: {
      backgroundColor: colors.surface,
      margin: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      ...SHADOWS.md,
    },
    gearHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    gearTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    gearSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    gearSection: {
      marginBottom: SPACING.md,
    },
    gearSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    gearChipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    gearChip: {
      backgroundColor: colors.accent + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.accent + '40',
    },
    gearChipText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    gearTipContainer: {
      backgroundColor: colors.backgroundLight,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
    },
    gearTip: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: SPACING.xs,
    },
    gearSeasonBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
      alignSelf: 'flex-start',
      marginBottom: SPACING.sm,
    },
    gearSeasonText: {
      fontSize: 11,
      color: colors.success,
      fontWeight: '600',
    },
    cancelButton: {
      flex: 1,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.backgroundLight,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    saveButton: {
      flex: 1,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.full,
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
  });
};

export default function AIGuideScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState("gedde");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion>(
    POPULAR_LOCATIONS[0],
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);

  // Environmental inputs
  const [waterTemp, setWaterTemp] = useState("");
  const [depth, setDepth] = useState("");
  const [bottomType, setBottomType] = useState("mixed");

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] =
    useState<AIRecommendations | null>(null);

  // Weather state
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Get selected species info
  const selectedSpecies = useMemo(() =>
    getSpeciesById(selectedSpeciesId) || FISH_SPECIES_DB[0],
    [selectedSpeciesId]
  );

  // Filter species by selected location - only show species available at the selected location
  const filteredSpeciesByLocation = useMemo(() => {
    if (!selectedLocation.species || selectedLocation.species.length === 0) {
      return FISH_SPECIES_DB;
    }
    return FISH_SPECIES_DB.filter(species =>
      selectedLocation.species.includes(species.id)
    );
  }, [selectedLocation]);

  // Group filtered species by category for display
  const filteredSpeciesByCategory = useMemo(() => ({
    ferskvand: filteredSpeciesByLocation.filter(s => s.category === 'ferskvand'),
    saltvand: filteredSpeciesByLocation.filter(s => s.category === 'saltvand'),
    begge: filteredSpeciesByLocation.filter(s => s.category === 'begge'),
  }), [filteredSpeciesByLocation]);

  // Count matching species
  const matchingSpeciesCount = filteredSpeciesByLocation.length;

  // Get smart gear suggestions based on selected species
  const gearSuggestions = useMemo(() => {
    const suggestions = getSmartGearSuggestions(selectedSpeciesId);
    // Defensive null checks to prevent length errors
    return {
      lures: suggestions?.lures || [],
      baits: suggestions?.baits || [],
      techniques: suggestions?.techniques || [],
    };
  }, [selectedSpeciesId]);

  // Get the species-specific gear recommendation for tips/season info
  const speciesGearInfo = useMemo(() => {
    return SPECIES_GEAR_RECOMMENDATIONS.find(r => r.speciesId === selectedSpeciesId);
  }, [selectedSpeciesId]);

  // Auto-select first available species when location changes and current species is not available
  useEffect(() => {
    if (!selectedLocation.species.includes(selectedSpeciesId) && filteredSpeciesByLocation.length > 0) {
      setSelectedSpeciesId(filteredSpeciesByLocation[0].id);
    }
  }, [selectedLocation, filteredSpeciesByLocation]);

  // Fetch weather forecast based on date and location
  const fetchWeatherForecast = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const { latitude, longitude } = selectedLocation;
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Calculate days from today for forecast
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Open-Meteo supports up to 16 days forecast
      if (daysDiff < 0 || daysDiff > 15) {
        setWeatherForecast(null);
        return;
      }

      // Fetch forecast from Open-Meteo
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,weather_code&hourly=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
      );

      if (response.ok) {
        const data = await response.json();

        // Get WMO weather code description
        const getWeatherDescription = (code: number): string => {
          if (code === 0) return 'Klart vejr';
          if (code === 1) return 'Hovedsageligt klart';
          if (code === 2) return 'Delvist skyet';
          if (code === 3) return 'Overskyet';
          if (code >= 45 && code <= 48) return 'Tåge';
          if (code >= 51 && code <= 55) return 'Støvregn';
          if (code >= 61 && code <= 65) return 'Regn';
          if (code >= 71 && code <= 75) return 'Sne';
          if (code >= 80 && code <= 82) return 'Regnbyger';
          if (code >= 95) return 'Tordenvejr';
          return 'Skyet';
        };

        const getWeatherIcon = (code: number): string => {
          if (code === 0) return 'sunny';
          if (code <= 3) return 'partly-sunny';
          if (code >= 45 && code <= 48) return 'cloudy';
          if (code >= 51 && code <= 67) return 'rainy';
          if (code >= 71 && code <= 77) return 'snow';
          if (code >= 80 && code <= 82) return 'rainy';
          if (code >= 95) return 'thunderstorm';
          return 'cloudy';
        };

        const daily = data.daily;
        const hourly = data.hourly;

        // Get average values for the day (around midday hours 10-14)
        const middayIndexes = [10, 11, 12, 13, 14];
        const avgTemp = middayIndexes.reduce((sum, i) => sum + (hourly.temperature_2m[i] || 0), 0) / middayIndexes.length;
        const avgHumidity = middayIndexes.reduce((sum, i) => sum + (hourly.relative_humidity_2m[i] || 0), 0) / middayIndexes.length;
        const avgPressure = middayIndexes.reduce((sum, i) => sum + (hourly.surface_pressure[i] || 0), 0) / middayIndexes.length;
        const avgCloudCover = middayIndexes.reduce((sum, i) => sum + (hourly.cloud_cover[i] || 0), 0) / middayIndexes.length;

        setWeatherForecast({
          temperature: Math.round(avgTemp),
          temperatureMin: Math.round(daily.temperature_2m_min[0]),
          temperatureMax: Math.round(daily.temperature_2m_max[0]),
          windSpeed: Math.round(daily.wind_speed_10m_max[0] / 3.6), // Convert km/h to m/s
          windDirection: daily.wind_direction_10m_dominant[0],
          pressure: Math.round(avgPressure),
          humidity: Math.round(avgHumidity),
          precipitation: daily.precipitation_sum[0],
          cloudCover: Math.round(avgCloudCover),
          description: getWeatherDescription(daily.weather_code[0]),
          icon: getWeatherIcon(daily.weather_code[0]),
        });
      }
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      setWeatherForecast(null);
    } finally {
      setWeatherLoading(false);
    }
  }, [selectedLocation, selectedDate]);

  // Fetch weather when date or location changes
  useEffect(() => {
    fetchWeatherForecast();
  }, [fetchWeatherForecast]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString();
  };

  const getRecommendations = async () => {
    setLoading(true);

    try {
      // Build comprehensive payload with all available data
      const payload = {
        species: selectedSpecies.name,
        species_info: {
          id: selectedSpecies.id,
          category: selectedSpecies.category,
          season: selectedSpecies.season,
          min_size: selectedSpecies.minSize,
        },
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        location_info: {
          name: selectedLocation.name,
          water_type: selectedLocation.waterType,
          typical_depth: selectedLocation.depth,
          regulations: selectedLocation.regulations,
          other_species: selectedLocation.species
            .filter(id => id !== selectedSpeciesId)
            .map(id => getSpeciesName(id)),
        },
        timestamp: formatDateForAPI(selectedDate),
        water_temp: waterTemp ? parseFloat(waterTemp) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        bottom_type: bottomType || undefined,
        // Include weather data if available
        ...(weatherForecast && {
          air_temp: weatherForecast.temperature,
          temp_min: weatherForecast.temperatureMin,
          temp_max: weatherForecast.temperatureMax,
          wind_speed: weatherForecast.windSpeed,
          wind_direction: weatherForecast.windDirection,
          pressure: weatherForecast.pressure,
          humidity: weatherForecast.humidity,
          precipitation: weatherForecast.precipitation,
          cloud_cover: weatherForecast.cloudCover,
          weather_description: weatherForecast.description,
        }),
      };

      const response = await api.post("/ai/recommendations", payload);
      setRecommendations(response.data);
    } catch (error: any) {
      console.error("AI recommendations error:", error);
      Alert.alert(
        "Fejl",
        error.response?.data?.error ||
          "Kunne ikke hente anbefalinger. Sørg for at AI-servicen kører.",
      );
    } finally {
      setLoading(false);
    }
  };

  const changeDateBy = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.7) return colors.success;
    if (probability >= 0.5) return "#ffc107";
    if (probability >= 0.3) return "#fd7e14";
    return colors.error;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return "#ffc107";
    return colors.textSecondary;
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        Linking.openURL(webUrl);
      }
    });
  };

  return (
    <PageLayout>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="hardware-chip" size={32} color={colors.primary} />
            <Text style={styles.title}>AI Fiskeguide</Text>
          </View>
          <Text style={styles.subtitle}>
            Få intelligente råd om hvor og hvordan du skal fiske
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Vælg fiskeart</Text>
          {/* Selected species button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 24, marginRight: SPACING.sm }}>{selectedSpecies.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{selectedSpecies.name}</Text>
                <Text style={styles.locationDescription}>
                  {selectedSpecies.category === 'ferskvand' ? 'Ferskvand' :
                   selectedSpecies.category === 'saltvand' ? 'Saltvand' : 'Fersk/Salt'} • Sæson: {selectedSpecies.season} • Min: {selectedSpecies.minSize > 0 ? `${selectedSpecies.minSize}cm` : 'Ingen'}
                </Text>
              </View>
            </View>
            <Text style={styles.locationArrow}>
              {showSpeciesPicker ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {/* Species info card */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primaryLight,
            padding: SPACING.sm,
            borderRadius: RADIUS.md,
            marginTop: SPACING.sm,
          }}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={{ marginLeft: SPACING.xs, fontSize: 12, color: colors.primary }}>
              {matchingSpeciesCount} fiskearter ved {selectedLocation.name}
            </Text>
          </View>

          {/* Species picker dropdown */}
          {showSpeciesPicker && (
            <View style={styles.locationList}>
              <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled>
                {/* Freshwater fish */}
                {filteredSpeciesByCategory.ferskvand.length > 0 && (
                  <View style={styles.locationCategory}>
                    <Text style={styles.locationCategoryTitle}>Ferskvandsfisk</Text>
                    {filteredSpeciesByCategory.ferskvand.map((species) => (
                      <TouchableOpacity
                        key={species.id}
                        style={[
                          styles.locationItem,
                          selectedSpeciesId === species.id && styles.locationItemActive,
                        ]}
                        onPress={() => {
                          setSelectedSpeciesId(species.id);
                          setShowSpeciesPicker(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, marginRight: SPACING.sm }}>{species.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.locationItemName}>{species.name}</Text>
                            <Text style={styles.locationItemDesc}>
                              Sæson: {species.season} • Min: {species.minSize > 0 ? `${species.minSize}cm` : 'Ingen'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Saltwater fish */}
                {filteredSpeciesByCategory.saltvand.length > 0 && (
                  <View style={styles.locationCategory}>
                    <Text style={styles.locationCategoryTitle}>Saltvandsfisk</Text>
                    {filteredSpeciesByCategory.saltvand.map((species) => (
                      <TouchableOpacity
                        key={species.id}
                        style={[
                          styles.locationItem,
                          selectedSpeciesId === species.id && styles.locationItemActive,
                        ]}
                        onPress={() => {
                          setSelectedSpeciesId(species.id);
                          setShowSpeciesPicker(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, marginRight: SPACING.sm }}>{species.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.locationItemName}>{species.name}</Text>
                            <Text style={styles.locationItemDesc}>
                              Sæson: {species.season} • Min: {species.minSize > 0 ? `${species.minSize}cm` : 'Ingen'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Both water types */}
                {filteredSpeciesByCategory.begge.length > 0 && (
                  <View style={styles.locationCategory}>
                    <Text style={styles.locationCategoryTitle}>Fersk- & Saltvand</Text>
                    {filteredSpeciesByCategory.begge.map((species) => (
                      <TouchableOpacity
                        key={species.id}
                        style={[
                          styles.locationItem,
                          selectedSpeciesId === species.id && styles.locationItemActive,
                        ]}
                        onPress={() => {
                          setSelectedSpeciesId(species.id);
                          setShowSpeciesPicker(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, marginRight: SPACING.sm }}>{species.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.locationItemName}>{species.name}</Text>
                            <Text style={styles.locationItemDesc}>
                              Sæson: {species.season} • Min: {species.minSize > 0 ? `${species.minSize}cm` : 'Ingen'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Vælg dato</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => changeDateBy(-1)}
            >
              <Text style={styles.dateButtonText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Text style={styles.dateHint}>
                {selectedDate.toLocaleDateString("da-DK", { weekday: "long" })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => changeDateBy(1)}
            >
              <Text style={styles.dateButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickDateButtons}>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.quickDateButtonText}>I dag</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow);
              }}
            >
              <Text style={styles.quickDateButtonText}>I morgen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const weekend = new Date();
                const daysUntilSaturday = (6 - weekend.getDay() + 7) % 7;
                weekend.setDate(weekend.getDate() + daysUntilSaturday);
                setSelectedDate(weekend);
              }}
            >
              <Text style={styles.quickDateButtonText}>Næste lørdag</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Vælg lokation</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>{selectedLocation.name}</Text>
              <Text style={styles.locationDescription}>
                {selectedLocation.waterType === 'ferskvand' ? 'Ferskvand' :
                 selectedLocation.waterType === 'saltvand' ? 'Saltvand' : 'Brakvand'} • Dybde: {selectedLocation.depth}
              </Text>
              <Text style={[styles.locationDescription, { marginTop: 2 }]}>
                {selectedLocation.regulations}
              </Text>
            </View>
            <Text style={styles.locationArrow}>
              {showLocationPicker ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {/* Show other fish species available at this location */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: SPACING.sm,
            gap: SPACING.xs,
          }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginRight: SPACING.xs }}>
              Andre arter her:
            </Text>
            {selectedLocation.species
              .filter(id => id !== selectedSpeciesId)
              .slice(0, 5)
              .map(id => {
                const sp = getSpeciesById(id);
                return sp ? (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setSelectedSpeciesId(id)}
                    style={{
                      backgroundColor: colors.backgroundLight,
                      paddingHorizontal: SPACING.xs,
                      paddingVertical: 2,
                      borderRadius: RADIUS.sm,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      {sp.icon} {sp.name}
                    </Text>
                  </TouchableOpacity>
                ) : null;
              })}
            {selectedLocation.species.length > 6 && (
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                +{selectedLocation.species.length - 6} mere
              </Text>
            )}
          </View>

          {showLocationPicker && (
            <View style={styles.locationList}>
              {/* Filter info */}
              <View style={{
                backgroundColor: colors.primaryLight,
                padding: SPACING.sm,
                borderRadius: RADIUS.md,
                marginBottom: SPACING.sm,
              }}>
                <Text style={{ fontSize: 12, color: colors.primary }}>
                  Vælg en lokation - fiskearter filtreres automatisk baseret på valgt lokation
                </Text>
              </View>

              {/* Link to external fishing map */}
              <TouchableOpacity
                style={styles.externalMapButton}
                onPress={() => Linking.openURL('https://fishingindenmark.info/fiskepladser')}
              >
                <View style={styles.externalMapContent}>
                  <Ionicons name="map" size={20} color={colors.accent} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.externalMapTitle}>Udforsk flere fiskepladser</Text>
                    <Text style={styles.externalMapDesc}>Åbn interaktivt kort på fishingindenmark.info</Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              {/* Grouped locations - all locations, no filtering */}
              <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled>
                {LOCATIONS_BY_REGION.map((category: LocationCategory) => (
                  <View key={category.region} style={styles.locationCategory}>
                    <Text style={styles.locationCategoryTitle}>
                      {category.region} ({category.locations.length})
                    </Text>
                    {category.locations.map((location: LocationSuggestion) => (
                      <TouchableOpacity
                        key={location.name}
                        style={[
                          styles.locationItem,
                          selectedLocation.name === location.name &&
                            styles.locationItemActive,
                        ]}
                        onPress={() => {
                          setSelectedLocation(location);
                          setShowLocationPicker(false);
                        }}
                      >
                        <Text style={styles.locationItemName}>{location.name}</Text>
                        <Text style={styles.locationItemDesc}>
                          {location.waterType === 'ferskvand' ? 'Ferskvand' :
                           location.waterType === 'saltvand' ? 'Saltvand' : 'Brakvand'} • Dybde: {location.depth}
                        </Text>
                        <Text style={[styles.locationItemDesc, { fontSize: 11 }]}>
                          {location.regulations}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Weather Forecast Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.weatherTitleRow}>
              <Ionicons name="cloud" size={20} color={colors.primary} />
              <Text style={styles.weatherTitle}>Vejrudsigt</Text>
            </View>
            <TouchableOpacity onPress={fetchWeatherForecast}>
              <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {weatherLoading ? (
            <View style={styles.weatherLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.weatherGridLabel, { marginTop: SPACING.sm }]}>
                Henter vejrdata...
              </Text>
            </View>
          ) : weatherForecast ? (
            <>
              <View style={styles.weatherMainRow}>
                <View style={styles.weatherMainLeft}>
                  <View style={styles.weatherIconLarge}>
                    <Ionicons
                      name={weatherForecast.icon as any}
                      size={32}
                      color={colors.white}
                    />
                  </View>
                  <View style={styles.weatherTempContainer}>
                    <Text style={styles.weatherTempMain}>
                      {weatherForecast.temperature}°C
                    </Text>
                    <Text style={styles.weatherTempRange}>
                      {weatherForecast.temperatureMin}° / {weatherForecast.temperatureMax}°
                    </Text>
                  </View>
                </View>
                <Text style={styles.weatherDescription}>
                  {weatherForecast.description}
                </Text>
              </View>

              <View style={styles.weatherGrid}>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="speedometer" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Vind</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.windSpeed} m/s</Text>
                  </View>
                </View>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="compass" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Vindretning</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.windDirection}°</Text>
                  </View>
                </View>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="water" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Luftfugtighed</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.humidity}%</Text>
                  </View>
                </View>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="thermometer" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Lufttryk</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.pressure} hPa</Text>
                  </View>
                </View>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="rainy" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Nedbør</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.precipitation} mm</Text>
                  </View>
                </View>
                <View style={styles.weatherGridItem}>
                  <Ionicons name="cloudy" size={16} color={colors.textSecondary} />
                  <View>
                    <Text style={styles.weatherGridLabel}>Skydække</Text>
                    <Text style={styles.weatherGridValue}>{weatherForecast.cloudCover}%</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.weatherUnavailable}>
              <Ionicons name="alert-circle" size={24} color={colors.textSecondary} />
              <Text style={styles.weatherUnavailableText}>
                Vejrdata ikke tilgængelig for den valgte dato.
                {"\n"}Vejrudsigt er kun tilgængelig op til 16 dage frem.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Ekstra forhold (valgfrit)</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vandtemp (°C)</Text>
              <TextInput
                style={styles.input}
                value={waterTemp}
                onChangeText={setWaterTemp}
                placeholder="15"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              {/* Wind speed removed - conversion too complex */}
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dybde (m)</Text>
              <TextInput
                style={styles.input}
                value={depth}
                onChangeText={setDepth}
                placeholder="3"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bundtype</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  const types = [
                    "sand",
                    "mud",
                    "rock",
                    "gravel",
                    "vegetation",
                    "mixed",
                  ];
                  const currentIndex = types.indexOf(bottomType);
                  const nextIndex = (currentIndex + 1) % types.length;
                  setBottomType(types[nextIndex]);
                }}
              >
                <Text style={styles.inputText}>{bottomType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recommended Gear Section */}
        {gearSuggestions && (gearSuggestions.lures.length > 0 || gearSuggestions.baits.length > 0 || gearSuggestions.techniques.length > 0) && (
          <View style={styles.gearCard}>
            <View style={styles.gearHeader}>
              <Ionicons name="construct" size={20} color={colors.primary} />
              <Text style={styles.gearTitle}>Anbefalet Udstyr til {selectedSpecies.name}</Text>
            </View>

            {speciesGearInfo?.bestSeason && (
              <View style={styles.gearSeasonBadge}>
                <Text style={styles.gearSeasonText}>Bedste sæson: {speciesGearInfo.bestSeason}</Text>
              </View>
            )}

            <Text style={styles.gearSubtitle}>
              Baseret på {gearSuggestions.lures.length} kunstagn, {gearSuggestions.baits.length} agn og {gearSuggestions.techniques.length} teknikker
            </Text>

            {/* Lures Section */}
            {gearSuggestions.lures.length > 0 && (
              <View style={styles.gearSection}>
                <Text style={styles.gearSectionTitle}>Kunstagn</Text>
                <View style={styles.gearChipContainer}>
                  {gearSuggestions.lures.slice(0, 8).map((lure) => (
                    <View key={lure.id} style={styles.gearChip}>
                      <Text style={styles.gearChipText}>{lure.name}</Text>
                    </View>
                  ))}
                  {gearSuggestions.lures.length > 8 && (
                    <View style={[styles.gearChip, { backgroundColor: colors.backgroundLight }]}>
                      <Text style={[styles.gearChipText, { color: colors.textSecondary }]}>
                        +{gearSuggestions.lures.length - 8} mere
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Baits Section */}
            {gearSuggestions.baits.length > 0 && (
              <View style={styles.gearSection}>
                <Text style={styles.gearSectionTitle}>Naturligt Agn</Text>
                <View style={styles.gearChipContainer}>
                  {gearSuggestions.baits.slice(0, 6).map((bait) => (
                    <View key={bait.id} style={[styles.gearChip, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
                      <Text style={[styles.gearChipText, { color: colors.success }]}>{bait.name}</Text>
                    </View>
                  ))}
                  {gearSuggestions.baits.length > 6 && (
                    <View style={[styles.gearChip, { backgroundColor: colors.backgroundLight }]}>
                      <Text style={[styles.gearChipText, { color: colors.textSecondary }]}>
                        +{gearSuggestions.baits.length - 6} mere
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Techniques Section */}
            {gearSuggestions.techniques.length > 0 && (
              <View style={styles.gearSection}>
                <Text style={styles.gearSectionTitle}>Teknikker</Text>
                <View style={styles.gearChipContainer}>
                  {gearSuggestions.techniques.map((technique) => (
                    <View key={technique.id} style={[styles.gearChip, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
                      <Text style={[styles.gearChipText, { color: colors.accent }]}>{technique.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {speciesGearInfo?.tips && speciesGearInfo.tips.length > 0 && (
              <View style={styles.gearTipContainer}>
                <Text style={[styles.gearSectionTitle, { marginBottom: SPACING.xs }]}>Tips</Text>
                {speciesGearInfo.tips.slice(0, 3).map((tip, index) => (
                  <Text key={index} style={styles.gearTip}>• {tip}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.getAdviceButton}
          onPress={getRecommendations}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentDark || '#D4880F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.getAdviceGradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={[styles.getAdviceButtonText, { color: colors.primary }]}>Få AI Råd</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {recommendations && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsTitleContainer}>
              <Ionicons name="stats-chart" size={24} color={colors.primary} />
              <Text style={styles.resultsTitle}>Anbefalinger</Text>
            </View>

            {/* Success Probability */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Fangst Sandsynlighed</Text>
              <View
                style={[
                  styles.probabilityBar,
                  {
                    backgroundColor: getSuccessColor(
                      recommendations.success_probability,
                    ),
                  },
                ]}
              >
                <Text style={styles.probabilityText}>
                  {(recommendations.success_probability * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={styles.resultHint}>
                Bedste tid: {recommendations.best_time}
              </Text>
            </View>

            {/* Weather & Season */}
            <View style={styles.resultCard}>
              <View style={styles.cardTitleContainer}>
                <Ionicons
                  name="partly-sunny"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.resultCardTitle}>Forhold</Text>
              </View>
              <Text style={styles.insight}>
                {recommendations.weather_impact}
              </Text>
              <Text style={styles.insight}>
                {recommendations.seasonal_notes}
              </Text>
            </View>

            {/* Baits */}
            {recommendations.baits.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="fish" size={20} color={colors.primary} />
                  <Text style={styles.resultCardTitle}>Anbefalet Agn</Text>
                </View>
                {recommendations.baits.map((bait, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationName}>{bait.name}</Text>
                      <View
                        style={[
                          styles.confidenceBadge,
                          {
                            backgroundColor: getConfidenceColor(
                              bait.confidence,
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.confidenceText}>
                          {(bait.confidence * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationType}>
                      Type: {bait.type}
                    </Text>
                    <Text style={styles.recommendationReason}>
                      {bait.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Lures */}
            {recommendations.lures.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={styles.resultCardTitle}>Anbefalet Wobblers</Text>
                </View>
                {recommendations.lures.map((lure, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationName}>{lure.name}</Text>
                      <View
                        style={[
                          styles.confidenceBadge,
                          {
                            backgroundColor: getConfidenceColor(
                              lure.confidence,
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.confidenceText}>
                          {(lure.confidence * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationDetail}>
                      Farve: {lure.color} • Størrelse: {lure.size}
                    </Text>
                    <Text style={styles.recommendationReason}>
                      {lure.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Techniques */}
            {recommendations.techniques.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="flash" size={20} color={colors.primary} />
                  <Text style={styles.resultCardTitle}>Teknikker</Text>
                </View>
                {recommendations.techniques.map((technique, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationName}>
                      {technique.name}
                    </Text>
                    <Text style={styles.recommendationReason}>
                      {technique.description}
                    </Text>
                    {technique.tips.length > 0 && (
                      <View style={styles.tipsContainer}>
                        {technique.tips.map((tip, tipIndex) => (
                          <Text key={tipIndex} style={styles.tip}>
                            • {tip}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Nearby Spots */}
            {recommendations.nearby_spots.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={styles.resultCardTitle}>Gode Steder Tæt På</Text>
                </View>
                {recommendations.nearby_spots.map((spot, index) => (
                  <View key={index} style={styles.spotItem}>
                    <View style={styles.spotHeader}>
                      <Text style={styles.spotDistance}>
                        {spot.distance_km.toFixed(1)} km væk
                      </Text>
                      <Text style={styles.spotSuccess}>
                        {(spot.success_rate * 100).toFixed(0)}% succes
                      </Text>
                    </View>
                    <Text style={styles.spotCatches}>
                      {spot.recent_catches} nylige fangster
                    </Text>
                    <Text style={styles.spotReason}>{spot.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Model: {recommendations.model_used} | Tillid:{" "}
                {(recommendations.confidence_score * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </PageLayout>
  );
}
