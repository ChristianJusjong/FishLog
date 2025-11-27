import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';
import {
  findNearestFishingLocation,
  getLocationsForSpecies,
  getWaterTypeLabel,
  FishingLocation
} from '../data/fishingLocations';

interface PredictionFactors {
  timeOfDay: { hour: number; successRate: number; avgCatches: number }[];
  seasonality: { month: number; successRate: number; avgCatches: number }[];
  weather: { conditions: string; avgCatches: number }[];
  moonPhase: { phase: string; avgCatches: number }[];
  topLocations: { lat: number; lng: number; catchCount: number }[];
  topSpecies: { species: string; bestTime: string; bestMonth: number }[];
}

interface Prediction {
  confidence: number;
  recommendation: string;
  bestTimeToday: { hour: number; description: string };
  bestDaysThisWeek: string[];
  topSpeciesPredictions: { species: string; likelihood: number }[];
  factors: PredictionFactors;
  aiInsights: string[];
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    content: {
      padding: 16,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    confidenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    confidenceCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    confidenceScore: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    confidenceLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    confidenceInfo: {
      flex: 1,
    },
    confidenceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    confidenceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    recommendationText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    timeContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    timeHour: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
    },
    timeDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dayChip: {
      backgroundColor: colors.primaryLight,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    dayText: {
      color: colors.primary,
      fontWeight: '600',
    },
    speciesItem: {
      marginBottom: 12,
    },
    speciesName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    likelihoodContainer: {
      height: 24,
      backgroundColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    likelihoodBar: {
      height: '100%',
      backgroundColor: colors.secondary,
      borderRadius: 12,
    },
    likelihoodText: {
      position: 'absolute',
      right: 8,
      top: 2,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      lineHeight: 20,
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    statValue: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    // Suggested locations for species
    suggestedLocations: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    suggestedLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    suggestedLocation: {
      fontSize: 13,
      color: colors.primary,
      paddingVertical: 2,
    },
    // Top locations styles
    locationItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    locationMain: {
      flex: 1,
    },
    locationName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    locationCatches: {
      fontSize: 14,
      color: colors.success,
      marginTop: 2,
    },
    locationDetails: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    locationDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    locationDetailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    locationDetailValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    locationSpecies: {
      marginTop: 8,
    },
    speciesTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    speciesTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    speciesTagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    moreSpecies: {
      fontSize: 12,
      color: colors.textSecondary,
      alignSelf: 'center',
    },
    regulationsBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 12,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    regulationsText: {
      fontSize: 13,
      flex: 1,
      lineHeight: 18,
    },
    // Weather link card styles
    weatherLinkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    weatherLinkIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    weatherLinkContent: {
      flex: 1,
    },
    weatherLinkTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    weatherLinkSubtitle: {
      fontSize: 14,
    },
  });
};

export default function PredictionsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { token } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  // Map top locations to known fishing spots
  const topLocationsWithNames = useMemo(() => {
    if (!predictions?.factors.topLocations) return [];

    return predictions.factors.topLocations.map(loc => {
      const nearestSpot = findNearestFishingLocation(loc.lat, loc.lng, 10);
      return {
        ...loc,
        knownSpot: nearestSpot?.location || null,
        distance: nearestSpot?.distance || null,
      };
    });
  }, [predictions?.factors.topLocations]);

  // Map top species to their best locations
  const speciesWithLocations = useMemo(() => {
    if (!predictions?.topSpeciesPredictions) return [];

    const speciesNameToId: Record<string, string> = {
      'Aborre': 'aborre',
      'Gedde': 'gedde',
      'Havørred': 'havorred',
      'Bækørred': 'bakorred',
      'Regnbueørred': 'regnbueorred',
      'Sandart': 'sandart',
      'Helt': 'helt',
      'Laks': 'laks',
      'Ål': 'al',
      'Karpe': 'karpe',
      'Skalle': 'skalle',
      'Brasen': 'brasen',
      'Suder': 'suder',
      'Torsk': 'torsk',
      'Makrel': 'makrel',
      'Hornfisk': 'hornfisk',
      'Havbars': 'havbars',
      'Multe': 'multe',
      'Fladfisk': 'fladfisk',
      'Sild': 'sild',
    };

    return predictions.topSpeciesPredictions.map(sp => {
      const speciesId = speciesNameToId[sp.species];
      const locations = speciesId ? getLocationsForSpecies(speciesId).slice(0, 3) : [];
      return {
        ...sp,
        suggestedLocations: locations,
      };
    });
  }, [predictions?.topSpeciesPredictions]);

  const fetchPredictions = async () => {
    try {
      setError(null);
      const response = await api.get('/predictions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPredictions(response.data.predictions);
      }
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
      setError(err.response?.data?.error || 'Kunne ikke hente forudsigelser');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPredictions();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return '#10b981';
    if (confidence >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'December'
    ];
    return months[month];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyserer dine fangstmønstre...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchPredictions}>
          <Text style={styles.retryButtonText}>Prøv igen</Text>
        </Pressable>
      </View>
    );
  }

  if (!predictions) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics" size={32} color={colors.primary} />
        <Text style={styles.title}>Fangst Forudsigelser</Text>
      </View>

      {/* Weather Insights Link */}
      <TouchableOpacity
        style={[styles.card, styles.weatherLinkCard]}
        onPress={() => router.push('/weather-insights')}
        activeOpacity={0.8}
      >
        <View style={[styles.weatherLinkIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="partly-sunny" size={28} color={colors.primary} />
        </View>
        <View style={styles.weatherLinkContent}>
          <Text style={[styles.weatherLinkTitle, { color: colors.text }]}>
            Vejr Indsigter
          </Text>
          <Text style={[styles.weatherLinkSubtitle, { color: colors.textSecondary }]}>
            Se hvilke vejrforhold der giver dig flest fangster
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Confidence Score */}
      <View style={styles.card}>
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceCircle}>
            <Text
              style={[
                styles.confidenceScore,
                { color: getConfidenceColor(predictions.confidence) },
              ]}
            >
              {predictions.confidence}%
            </Text>
            <Text style={styles.confidenceLabel}>Tillid</Text>
          </View>
          <View style={styles.confidenceInfo}>
            <Text style={styles.confidenceTitle}>Forudsigelseskvalitet</Text>
            <Text style={styles.confidenceDescription}>
              {predictions.confidence >= 70
                ? 'Høj tillid baseret på dine historiske data'
                : predictions.confidence >= 40
                ? 'Moderat tillid - log flere fangster for bedre forudsigelser'
                : 'Lav tillid - fortsæt med at logge dine fangster'}
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendation */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb" size={24} color={colors.secondary} />
          <Text style={styles.cardTitle}>Anbefaling</Text>
        </View>
        <Text style={styles.recommendationText}>{predictions.recommendation}</Text>
      </View>

      {/* Best Time Today */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Bedste tid i dag</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeHour}>{predictions.bestTimeToday.hour}:00</Text>
          <Text style={styles.timeDescription}>
            {predictions.bestTimeToday.description}
          </Text>
        </View>
      </View>

      {/* Best Days This Week */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={24} color={colors.success} />
          <Text style={styles.cardTitle}>Bedste dage denne uge</Text>
        </View>
        <View style={styles.daysContainer}>
          {predictions.bestDaysThisWeek.map((day, index) => (
            <View key={index} style={styles.dayChip}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Species Predictions with Locations */}
      {speciesWithLocations.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fish" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>Top arter at fange</Text>
          </View>
          {speciesWithLocations.map((sp, index) => (
            <View key={index} style={styles.speciesItem}>
              <Text style={styles.speciesName}>{sp.species}</Text>
              <View style={styles.likelihoodContainer}>
                <View
                  style={[
                    styles.likelihoodBar,
                    { width: `${sp.likelihood}%` },
                  ]}
                />
                <Text style={styles.likelihoodText}>{sp.likelihood}%</Text>
              </View>
              {sp.suggestedLocations.length > 0 && (
                <View style={styles.suggestedLocations}>
                  <Text style={styles.suggestedLabel}>Gode steder:</Text>
                  {sp.suggestedLocations.map((loc, locIndex) => (
                    <Text key={locIndex} style={styles.suggestedLocation}>
                      {loc.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Top Locations with Names */}
      {topLocationsWithNames.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Dine bedste fiskepladser</Text>
          </View>
          {topLocationsWithNames.map((loc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationItem}
              onPress={() => loc.knownSpot && setExpandedLocation(
                expandedLocation === loc.knownSpot.name ? null : loc.knownSpot.name
              )}
              activeOpacity={loc.knownSpot ? 0.7 : 1}
            >
              <View style={styles.locationHeader}>
                <View style={styles.locationMain}>
                  <Text style={styles.locationName}>
                    {loc.knownSpot ? loc.knownSpot.name : `${loc.lat.toFixed(4)}°, ${loc.lng.toFixed(4)}°`}
                  </Text>
                  <Text style={styles.locationCatches}>
                    {loc.catchCount} fangster
                  </Text>
                </View>
                {loc.knownSpot && (
                  <Ionicons
                    name={expandedLocation === loc.knownSpot.name ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                )}
              </View>
              {loc.knownSpot && expandedLocation === loc.knownSpot.name && (
                <View style={styles.locationDetails}>
                  <View style={styles.locationDetailRow}>
                    <Text style={styles.locationDetailLabel}>Type:</Text>
                    <Text style={styles.locationDetailValue}>
                      {getWaterTypeLabel(loc.knownSpot.waterType)}
                    </Text>
                  </View>
                  {loc.knownSpot.depth && (
                    <View style={styles.locationDetailRow}>
                      <Text style={styles.locationDetailLabel}>Dybde:</Text>
                      <Text style={styles.locationDetailValue}>{loc.knownSpot.depth}</Text>
                    </View>
                  )}
                  {loc.knownSpot.species.length > 0 && (
                    <View style={styles.locationSpecies}>
                      <Text style={styles.locationDetailLabel}>Arter:</Text>
                      <View style={styles.speciesTags}>
                        {loc.knownSpot.species.slice(0, 5).map((species, i) => (
                          <View key={i} style={[styles.speciesTag, { backgroundColor: colors.primaryLight }]}>
                            <Text style={[styles.speciesTagText, { color: colors.primary }]}>{species}</Text>
                          </View>
                        ))}
                        {loc.knownSpot.species.length > 5 && (
                          <Text style={styles.moreSpecies}>+{loc.knownSpot.species.length - 5}</Text>
                        )}
                      </View>
                    </View>
                  )}
                  {loc.knownSpot.regulations && (
                    <View style={[styles.regulationsBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
                      <Ionicons name="warning" size={14} color={colors.warning} />
                      <Text style={[styles.regulationsText, { color: colors.warning }]}>
                        {loc.knownSpot.regulations}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* AI Insights */}
      {predictions.aiInsights.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>AI Indsigter</Text>
          </View>
          {predictions.aiInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Time of Day Stats */}
      {predictions.factors.timeOfDay.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>Bedste tidspunkter</Text>
          </View>
          {predictions.factors.timeOfDay.slice(0, 5).map((time, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statLabel}>{time.hour}:00</Text>
              <Text style={styles.statValue}>
                {time.avgCatches} fangster ({time.successRate.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Seasonality */}
      {predictions.factors.seasonality.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf" size={24} color={colors.success} />
            <Text style={styles.cardTitle}>Bedste måneder</Text>
          </View>
          {predictions.factors.seasonality.slice(0, 3).map((season, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statLabel}>{getMonthName(season.month)}</Text>
              <Text style={styles.statValue}>
                {season.avgCatches} fangster ({season.successRate.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Weather */}
      {predictions.factors.weather.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Bedste vejrforhold</Text>
          </View>
          {predictions.factors.weather.map((w, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statLabel}>{w.conditions}</Text>
              <Text style={styles.statValue}>{w.avgCatches} fangster</Text>
            </View>
          ))}
        </View>
      )}

      {/* Moon Phase */}
      {predictions.factors.moonPhase.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color={colors.accent} />
            <Text style={styles.cardTitle}>Bedste månefaser</Text>
          </View>
          {predictions.factors.moonPhase.map((moon, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statLabel}>{moon.phase}</Text>
              <Text style={styles.statValue}>{moon.avgCatches} fangster</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
