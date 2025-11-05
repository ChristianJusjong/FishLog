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
    if (probability >= 0.7) return '#28a745';
    if (probability >= 0.5) return '#ffc107';
    if (probability >= 0.3) return '#fd7e14';
    return '#dc3545';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#6c757d';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Fiskeguide</Text>
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
          <Text style={styles.getAdviceButtonText}>🎯 Få AI Råd</Text>
        )}
      </TouchableOpacity>

      {recommendations && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Anbefalinger</Text>

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
            <Text style={styles.resultCardTitle}>🌤️ Forhold</Text>
            <Text style={styles.insight}>{recommendations.weather_impact}</Text>
            <Text style={styles.insight}>{recommendations.seasonal_notes}</Text>
          </View>

          {/* Baits */}
          {recommendations.baits.length > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>🎣 Anbefalet Agn</Text>
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
              <Text style={styles.resultCardTitle}>🎯 Anbefalet Wobblers</Text>
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
              <Text style={styles.resultCardTitle}>⚡ Teknikker</Text>
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
              <Text style={styles.resultCardTitle}>📍 Gode Steder Tæt På</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  speciesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  speciesChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  speciesChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  speciesChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  speciesChipTextActive: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
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
    color: '#333',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationArrow: {
    fontSize: 16,
    color: '#999',
  },
  locationList: {
    marginTop: 8,
  },
  locationItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationItemActive: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007AFF',
  },
  locationItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationItemDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  getAdviceButton: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 12,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  getAdviceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    margin: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  probabilityBar: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  probabilityText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  resultHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  insight: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recommendationDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  tipsContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  tip: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  spotItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  spotDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  spotSuccess: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
  },
  spotCatches: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  spotReason: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  footer: {
    padding: 12,
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
