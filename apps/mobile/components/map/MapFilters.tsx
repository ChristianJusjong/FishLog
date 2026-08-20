import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SHADOWS } from '@/constants/branding';

const SEASONS = [
  { value: '', label: 'Alle sæsoner' },
  { value: 'spring', label: 'Forår' },
  { value: 'summer', label: 'Sommer' },
  { value: 'fall', label: 'Efterår' },
  { value: 'winter', label: 'Vinter' },
];

type MapFiltersProps = {
  insets: { top: number; bottom: number; left: number; right: number };
  showFilters: boolean;
  setShowSpeciesModal: (show: boolean) => void;
  selectedSpecies: string[];
  expandedSeason: boolean;
  setExpandedSeason: (expanded: boolean) => void;
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  expandedBaseMap: boolean;
  setExpandedBaseMap: (expanded: boolean) => void;
  baseMap: string;
  setBaseMap: (map: any) => void;
  expandedDataLayers: boolean;
  setExpandedDataLayers: (expanded: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
  showDepthChart: boolean;
  setShowDepthChart: (show: boolean) => void;
  showFredningsbaelter: boolean;
  setShowFredningsbaelter: (show: boolean) => void;
  showHotSpots: boolean;
  setShowHotSpots: (show: boolean) => void;
  showFavoriteSpots: boolean;
  setShowFavoriteSpots: (show: boolean) => void;
  showFishingSpots: boolean;
  setShowFishingSpots: (show: boolean) => void;
};

function MapFiltersComponent({
  insets,
  showFilters,
  setShowSpeciesModal,
  selectedSpecies,
  expandedSeason,
  setExpandedSeason,
  selectedSeason,
  setSelectedSeason,
  expandedBaseMap,
  setExpandedBaseMap,
  baseMap,
  setBaseMap,
  expandedDataLayers,
  setExpandedDataLayers,
  showHeatmap,
  setShowHeatmap,
  showDepthChart,
  setShowDepthChart,
  showFredningsbaelter,
  setShowFredningsbaelter,
  showHotSpots,
  setShowHotSpots,
  showFavoriteSpots,
  setShowFavoriteSpots,
  showFishingSpots,
  setShowFishingSpots,
}: MapFiltersProps) {
  const { colors } = useTheme();
  
  if (!showFilters) return null;

  return (
    <View style={[styles.filtersContainer, { top: insets.top + 120, backgroundColor: colors.surface }]}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Accordion Section: Fish Species */}
        <View style={styles.accordionSection}>
          <TouchableOpacity
            style={[styles.accordionHeader, { backgroundColor: colors.surface }]}
            onPress={() => setShowSpeciesModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="fish" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.accordionTitle}>Fiskeart</Text>
              {selectedSpecies.length > 0 && (
                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectedBadgeText}>{selectedSpecies.length} arter valgt</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Accordion Section: Season */}
        <View style={styles.accordionSection}>
          <TouchableOpacity
            style={[styles.accordionHeader, { backgroundColor: colors.surface }]}
            onPress={() => setExpandedSeason(!expandedSeason)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.accordionTitle}>Sæson</Text>
              {selectedSeason && (
                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectedBadgeText}>
                    {SEASONS.find((s) => s.value === selectedSeason)?.label}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name={expandedSeason ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
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
            style={[styles.accordionHeader, { backgroundColor: colors.surface }]}
            onPress={() => setExpandedBaseMap(!expandedBaseMap)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="map" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.accordionTitle}>Grundkort</Text>
              <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.selectedBadgeText}>
                  {baseMap === 'arcgis-ocean'
                    ? 'Ocean'
                    : baseMap === 'arcgis-topo'
                    ? 'Topo'
                    : baseMap === 'arcgis-imagery'
                    ? 'ArcGIS Sat'
                    : baseMap === 'arcgis-streets'
                    ? 'Veje'
                    : baseMap === 'satellite'
                    ? 'Google Sat'
                    : 'Standard'}
                </Text>
              </View>
            </View>
            <Ionicons name={expandedBaseMap ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
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
                      <Text
                        style={[
                          styles.toggleButtonText,
                          baseMap === map.value && styles.toggleButtonTextActive,
                        ]}
                      >
                        {map.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.providerBadge,
                        baseMap === map.value && styles.providerBadgeActive,
                      ]}
                    >
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
            style={[styles.accordionHeader, { backgroundColor: colors.surface }]}
            onPress={() => setExpandedDataLayers(!expandedDataLayers)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="layers" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.accordionTitle}>Lag</Text>
              {(showHeatmap || showDepthChart || showFredningsbaelter || showHotSpots || showFavoriteSpots) && (
                <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.selectedBadgeText}>
                    {
                      [
                        showHeatmap,
                        showDepthChart,
                        showFredningsbaelter,
                        showHotSpots,
                        showFavoriteSpots,
                      ].filter(Boolean).length
                    }
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name={expandedDataLayers ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
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
                  <Text
                    style={[
                      styles.toggleButtonText,
                      showFredningsbaelter && styles.toggleButtonTextActive,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.toggleButtonText,
                      showFavoriteSpots && styles.toggleButtonTextActive,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.toggleButtonText,
                      showFishingSpots && styles.toggleButtonTextActive,
                    ]}
                  >
                    Fiskepladser
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    position: 'absolute',
    right: 16,
    left: 16,
    maxHeight: '65%',
    borderRadius: 12,
    ...SHADOWS.lg,
    zIndex: 3001,
    elevation: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    color: '#fff',
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
    color: '#fff',
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
});

export default React.memo(MapFiltersComponent);
