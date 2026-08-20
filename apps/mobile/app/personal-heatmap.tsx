import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { API_URL } from '@/config/api';
import PageLayout from '../components/PageLayout';
import FishSpeciesIcon from '../components/FishSpeciesIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CatchPoint {
  id: string;
  species: string;
  weightKg?: number;
  lengthCm?: number;
  latitude: number;
  longitude: number;
  createdAt: string;
}

// Sample GPS session trails to display glowing heatmaps
const DEFAULT_GPS_TRACKS = [
  // Isefjorden kyststrækning
  [
    { latitude: 55.723, longitude: 11.821 },
    { latitude: 55.725, longitude: 11.826 },
    { latitude: 55.729, longitude: 11.831 },
    { latitude: 55.733, longitude: 11.837 },
    { latitude: 55.738, longitude: 11.841 },
  ],
  // Stevns Klint rev
  [
    { latitude: 55.281, longitude: 12.441 },
    { latitude: 55.284, longitude: 12.446 },
    { latitude: 55.289, longitude: 12.451 },
    { latitude: 55.293, longitude: 12.454 },
  ],
  // Roskilde Fjord
  [
    { latitude: 55.801, longitude: 12.045 },
    { latitude: 55.806, longitude: 12.051 },
    { latitude: 55.812, longitude: 12.058 },
  ],
];

export default function PersonalHeatmapScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [catches, setCatches] = useState<CatchPoint[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sea_trout' | 'pike_perch'>('all');
  const [selectedCatch, setSelectedCatch] = useState<CatchPoint | null>(null);

  useEffect(() => {
    fetchMyCatches();
  }, []);

  const fetchMyCatches = async () => {
    try {
      setLoading(true);
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/catches`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const validCatches = data
          .filter((c: any) => c.latitude && c.longitude)
          .map((c: any) => ({
            id: c.id,
            species: c.species || 'Fisk',
            weightKg: c.weightKg,
            lengthCm: c.lengthCm,
            latitude: c.latitude,
            longitude: c.longitude,
            createdAt: c.createdAt,
          }));
        setCatches(validCatches);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCatches = useMemo(() => {
    if (selectedFilter === 'sea_trout') {
      return catches.filter((c) => c.species.toLowerCase().includes('havørred') || c.species.toLowerCase().includes('laks'));
    }
    if (selectedFilter === 'pike_perch') {
      return catches.filter((c) => c.species.toLowerCase().includes('gedde') || c.species.toLowerCase().includes('aborre') || c.species.toLowerCase().includes('sandart'));
    }
    return catches;
  }, [catches, selectedFilter]);

  const handleShareHeatmap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Del Fiske-Heatmap 🗺️',
      'Dit personlige kyst-heatmap kan eksporteres som et 9:16 billede til Instagram, Facebook eller dine fiskekammerater.',
      [{ text: 'Kanon!', style: 'default' }]
    );
  };

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isDark ? '#05111D' : '#F8FAFC' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flame" size={18} color="#00D4B2" />
              <Text style={[styles.title, { color: colors.text }]}>Mit Fiske-Heatmap</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              The Glowing Trail – Strava for lystfiskere
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: 'rgba(0, 212, 178, 0.15)' }]}
            onPress={handleShareHeatmap}
          >
            <Ionicons name="share-social" size={18} color="#00D4B2" />
          </TouchableOpacity>
        </View>

        {/* Lifetime Telemetry Bar (Strava Style) */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? '#0A1E34' : '#FFFFFF' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#00D4B2' }]}>{catches.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Logget Fisk</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F5A623' }]}>38.4 km</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kyst Udforsket</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>24.5 t</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fisketid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>6</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Spots</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Alle Ture & Fangster' },
            { id: 'sea_trout', label: '🌊 Kyst & Havørred' },
            { id: 'pike_perch', label: '🐊 Gedde & Aborre' },
          ].map((f) => {
            const isSelected = selectedFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? '#00D4B2' : isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderColor: isSelected ? '#00D4B2' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedFilter(f.id as any);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#071524' : colors.text,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Glowing Satellite Heatmap View */}
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            mapType={isDark ? 'hybrid' : 'standard'}
            initialRegion={{
              latitude: 55.8,
              longitude: 11.5,
              latitudeDelta: 2.2,
              longitudeDelta: 2.5,
            }}
          >
            {/* Glowing GPS Session Trails */}
            {DEFAULT_GPS_TRACKS.map((track, i) => (
              <Polyline
                key={`track-${i}`}
                coordinates={track}
                strokeColor="#00D4B2"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            ))}

            {/* Glowing Aura Rings on Catches */}
            {filteredCatches.map((c) => (
              <Circle
                key={`aura-${c.id}`}
                center={{ latitude: c.latitude, longitude: c.longitude }}
                radius={800}
                fillColor="rgba(0, 212, 178, 0.25)"
                strokeColor="#00D4B2"
                strokeWidth={1}
              />
            ))}

            {/* Catch Markers */}
            {filteredCatches.map((c) => (
              <Marker
                key={c.id}
                coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedCatch(c);
                }}
              >
                <View style={styles.catchMarker}>
                  <Ionicons name="fish" size={14} color="#071524" />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Floating Spot Info Banner */}
          {selectedCatch && (
            <View style={[styles.selectedCard, { backgroundColor: isDark ? '#0A1E34' : '#FFFFFF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="trophy" size={20} color="#F5A623" />
                  <View>
                    <Text style={[styles.selectedTitle, { color: colors.text }]}>{selectedCatch.species}</Text>
                    <Text style={[styles.selectedDate, { color: colors.textSecondary }]}>
                      {new Date(selectedCatch.createdAt).toLocaleDateString('da-DK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => setSelectedCatch(null)} style={styles.closeCatchBtn}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                {selectedCatch.lengthCm && (
                  <Text style={[styles.metricChip, { color: colors.text }]}>
                    📏 {selectedCatch.lengthCm} cm
                  </Text>
                )}
                {selectedCatch.weightKg && (
                  <Text style={[styles.metricChip, { color: colors.text }]}>
                    ⚖️ {selectedCatch.weightKg} kg
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  catchMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D4B2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#00D4B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 178, 0.3)',
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  selectedDate: {
    fontSize: 11,
  },
  closeCatchBtn: {
    padding: 4,
  },
  metricChip: {
    fontSize: 12,
    fontWeight: '700',
  },
});
