import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { api } from '../lib/api';

const FISH_SPECIES = [
  'Gedde',
  'Aborre',
  'Sandart',
  'Ørred',
  'Karpe',
  'Brasen',
  'Helt',
];

interface LocationSuggestion {
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

const POPULAR_LOCATIONS: LocationSuggestion[] = [
  {
    name: 'Silkeborg Søerne',
    latitude: 56.17,
    longitude: 9.55,
    description: 'Populære søer med gedde, aborre og sandart',
  },
  {
    name: 'Gudenåen',
    latitude: 56.26,
    longitude: 9.5,
    description: 'Danmarks længste å - godt for ørred',
  },
  {
    name: 'Limfjorden',
    latitude: 56.85,
    longitude: 9.0,
    description: 'Saltvand med havørred og torsk',
  },
  {
    name: 'Esrum Sø',
    latitude: 56.05,
    longitude: 12.33,
    description: 'Stor sø med gedde og aborre',
  },
  {
    name: 'Mossø',
    latitude: 55.95,
    longitude: 9.75,
    description: 'Danmarks dybeste sø',
  },
];

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

export default function AIGuideScreen() {
  const router = useRouter();
  const [selectedSpecies, setSelectedSpecies] = useState('Gedde');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion>(
    POPULAR_LOCATIONS[0]
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Environmental inputs
  const [waterTemp, setWaterTemp] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [depth, setDepth] = useState('');
  const [bottomType, setBottomType] = useState('mixed');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(
    null
  );

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString();
  };

  const getRecommendations = async () => {
    setLoading(true);

    try {
      const payload = {
        species: selectedSpecies,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        timestamp: formatDateForAPI(selectedDate),
        water_temp: waterTemp ? parseFloat(waterTemp) : undefined,
        wind_speed: windSpeed ? parseFloat(windSpeed) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        bottom_type: bottomType || undefined,
      };

      console.log('Fetching AI recommendations:', payload);

      const response = await api.post('/ai/recommendations', payload);
      setRecommendations(response.data);
    } catch (error: any) {
      console.error('AI recommendations error:', error);
      Alert.alert(
        'Fejl',
        error.response?.data?.error || 'Kunne ikke hente anbefalinger. Sørg for at AI-servicen kører.'
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
    if (probability >= 0.7) return COLORS.success;
    if (probability >= 0.5) return '#ffc107';
    if (probability >= 0.3) return '#fd7e14';
    return COLORS.error;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return COLORS.success;
    if (confidence >= 0.6) return '#ffc107';
    return COLORS.textSecondary;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="hardware-chip" size={32} color={COLORS.primary} />
          <Text style={styles.title}>AI Fiskeguide</Text>
        </View>
        <Text style={styles.subtitle}>
          Få intelligente råd om hvor og hvordan du skal fiske
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Vælg fiskeart</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.speciesScroll}
        >
          {FISH_SPECIES.map((species) => (
            <TouchableOpacity
              key={species}
              style={[
                styles.speciesChip,
                selectedSpecies === species && styles.speciesChipActive,
              ]}
              onPress={() => setSelectedSpecies(species)}
            >
              <Text
                style={[
                  styles.speciesChipText,
                  selectedSpecies === species && styles.speciesChipTextActive,
                ]}
              >
                {species}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              {selectedDate.toLocaleDateString('da-DK', { weekday: 'long' })}
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
          <View>
            <Text style={styles.locationName}>{selectedLocation.name}</Text>
            <Text style={styles.locationDescription}>
              {selectedLocation.description}
            </Text>
          </View>
          <Text style={styles.locationArrow}>
            {showLocationPicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showLocationPicker && (
          <View style={styles.locationList}>
            {POPULAR_LOCATIONS.map((location) => (
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
                  {location.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>4. Forhold (valgfrit)</Text>
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
            <Text style={styles.inputLabel}>Vind (m/s)</Text>
            <TextInput
              style={styles.input}
              value={windSpeed}
              onChangeText={setWindSpeed}
              placeholder="5"
              keyboardType="decimal-pad"
            />
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
                const types = ['sand', 'mud', 'rock', 'gravel', 'vegetation', 'mixed'];
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

      <TouchableOpacity
        style={styles.getAdviceButton}
        onPress={getRecommendations}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="target" size={20} color="white" />
            <Text style={styles.getAdviceButtonText}>Få AI Råd</Text>
          </View>
        )}
      </TouchableOpacity>

      {recommendations && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsTitleContainer}>
            <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
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
                    recommendations.success_probability
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
              <Ionicons name="partly-sunny" size={20} color={COLORS.primary} />
              <Text style={styles.resultCardTitle}>Forhold</Text>
            </View>
            <Text style={styles.insight}>{recommendations.weather_impact}</Text>
            <Text style={styles.insight}>{recommendations.seasonal_notes}</Text>
          </View>

          {/* Baits */}
          {recommendations.baits.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="fish" size={20} color={COLORS.primary} />
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
                          backgroundColor: getConfidenceColor(bait.confidence),
                        },
                      ]}
                    >
                      <Text style={styles.confidenceText}>
                        {(bait.confidence * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationType}>Type: {bait.type}</Text>
                  <Text style={styles.recommendationReason}>{bait.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Lures */}
          {recommendations.lures.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="target" size={20} color={COLORS.primary} />
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
                          backgroundColor: getConfidenceColor(lure.confidence),
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
                  <Text style={styles.recommendationReason}>{lure.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Techniques */}
          {recommendations.techniques.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="flash" size={20} color={COLORS.primary} />
                <Text style={styles.resultCardTitle}>Teknikker</Text>
              </View>
              {recommendations.techniques.map((technique, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationName}>{technique.name}</Text>
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
                <Ionicons name="location" size={20} color={COLORS.primary} />
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
              Model: {recommendations.model_used} | Tillid:{' '}
              {(recommendations.confidence_score * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: 'white',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
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
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  speciesChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  speciesChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  speciesChipTextActive: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickDateButton: {
    flex: 1,
    padding: SPACING.sm,
    backgroundColor: '#f0f0f0',
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  quickDateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationArrow: {
    fontSize: 16,
    color: '#999',
  },
  locationList: {
    marginTop: SPACING.sm,
  },
  locationItem: {
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationItemActive: {
    backgroundColor: '#e7f3ff',
    borderColor: COLORS.primary,
  },
  locationItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationItemDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 14,
    color: COLORS.text,
  },
  getAdviceButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    margin: SPACING.md,
    ...SHADOWS.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  getAdviceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    margin: SPACING.md,
  },
  resultsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  probabilityBar: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  probabilityText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  resultHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  insight: {
    fontSize: 13,
    color: '#555',
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recommendationDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  tipsContainer: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  tip: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  spotItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  spotDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  spotSuccess: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  spotCatches: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  spotReason: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
  bottomSpacer: {
    height: 40,
  },
});
