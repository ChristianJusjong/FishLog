import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { FishingLocation, getWaterTypeColor, getSpeciesName } from '../../data/fishingLocations';
import { generateSpotTactics, SpotTactics } from '../../data/spotTacticsEngine';
import FishSpeciesIcon from '../FishSpeciesIcon';

type FishingSpotModalProps = {
  selectedFishingSpot: FishingLocation | null;
  setSelectedFishingSpot: (spot: FishingLocation | null) => void;
  onGetAIAdvice: (latitude: number, longitude: number) => void;
  currentWeather?: { temperature?: number; windSpeed?: number; windDirection?: string; pressure?: number };
};

export default function FishingSpotModal({
  selectedFishingSpot,
  setSelectedFishingSpot,
  onGetAIAdvice,
  currentWeather,
}: FishingSpotModalProps) {
  const { colors } = useTheme();

  const tactics: SpotTactics | null = selectedFishingSpot
    ? generateSpotTactics(selectedFishingSpot, currentWeather)
    : null;

  return (
    <Modal
      visible={selectedFishingSpot !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSelectedFishingSpot(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: selectedFishingSpot ? getWaterTypeColor(selectedFishingSpot.waterType) : '#666',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={
                    selectedFishingSpot?.waterType === 'ferskvand'
                      ? 'leaf'
                      : selectedFishingSpot?.waterType === 'saltvand'
                      ? 'water'
                      : 'git-merge'
                  }
                  size={22}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  {selectedFishingSpot?.name || 'Fiskeplads'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {selectedFishingSpot?.waterType === 'ferskvand'
                    ? 'Ferskvand'
                    : selectedFishingSpot?.waterType === 'saltvand'
                    ? 'Saltvand / Kyst'
                    : 'Brakvand'} • {selectedFishingSpot?.depth || 'Dybde varierer'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedFishingSpot(null)} style={styles.closeButton}>
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedFishingSpot && tactics && (
              <>
                {/* AI Tactical Card - Primary Feature */}
                <View style={styles.aiTacticsCard}>
                  <LinearGradient
                    colors={['#0A2540', '#14385C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiGradientHeader}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="sparkles" size={18} color="#00D4B2" />
                        <Text style={styles.aiCardTitle}>Hook AI Taktik & Agn-Guide</Text>
                      </View>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreBadgeText}>{tactics.overallScore}% Hugchance</Text>
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={[styles.aiCardBody, { backgroundColor: colors.backgroundLight }]}>
                    {/* Golden Hours & Season Overview */}
                    <View style={styles.tacticsRow}>
                      <Ionicons name="time" size={16} color="#F5A623" />
                      <Text style={[styles.tacticsLabel, { color: colors.text }]}>
                        Bedste tidspunkt lige nu: <Text style={{ fontWeight: '700', color: '#F5A623' }}>{tactics.goldenHour}</Text>
                      </Text>
                    </View>

                    <Text style={[styles.insightText, { color: colors.text }]}>
                      {tactics.seasonalAdvice}
                    </Text>

                    <Text style={[styles.insightText, { color: colors.textSecondary, marginTop: 4 }]}>
                      {tactics.weatherAdvice}
                    </Text>

                    {tactics.tideAdvice && (
                      <View style={styles.tideNotice}>
                        <Ionicons name="water" size={14} color="#00D4B2" />
                        <Text style={{ fontSize: 12, color: '#00D4B2', fontWeight: '600', flex: 1 }}>
                          {tactics.tideAdvice}
                        </Text>
                      </View>
                    )}

                    {/* Recommended Lures & Baits Section */}
                    <View style={{ marginTop: 14 }}>
                      <Text style={[styles.subHeaderTitle, { color: colors.text }]}>
                        🎣 Hvad du skal fiske med:
                      </Text>
                      {tactics.recommendedLures.map((lure, idx) => (
                        <View key={idx} style={[styles.lureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.lureName, { color: colors.primary }]}>{lure.name}</Text>
                            <View style={styles.lureTypeBadge}>
                              <Text style={styles.lureTypeBadgeText}>{lure.type}</Text>
                            </View>
                          </View>
                          <Text style={[styles.lureSpecs, { color: colors.textSecondary }]}>
                            Farve: <Text style={{ fontWeight: '600', color: colors.text }}>{lure.color}</Text> • Vægt: <Text style={{ fontWeight: '600', color: colors.text }}>{lure.weightSize}</Text>
                          </Text>
                          <Text style={[styles.lureReason, { color: colors.text }]}>{lure.reason}</Text>
                        </View>
                      ))}
                    </View>

                    {/* How to Fish It (Technique & Retrieval) */}
                    <View style={{ marginTop: 14 }}>
                      <Text style={[styles.subHeaderTitle, { color: colors.text }]}>
                        🎯 Hvordan du skal fiske (Metode & Taktik):
                      </Text>
                      {tactics.fishingTechniques.map((tech, idx) => (
                        <View key={idx} style={[styles.techCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.techName, { color: colors.text }]}>{tech.technique}</Text>
                          <Text style={[styles.techDetail, { color: colors.textSecondary }]}>
                            📏 Dybde: <Text style={{ color: colors.text, fontWeight: '600' }}>{tech.depthLevel}</Text>
                          </Text>
                          <Text style={[styles.techDetail, { color: colors.textSecondary }]}>
                            ⚡ Indspinning: <Text style={{ color: colors.text, fontWeight: '600' }}>{tech.retrievalSpeed}</Text>
                          </Text>
                          <View style={styles.proTipBox}>
                            <Ionicons name="bulb" size={14} color="#F5A623" />
                            <Text style={styles.proTipText}>{tech.proTip}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Description */}
                {selectedFishingSpot.description && (
                  <View style={styles.fishingSpotSection}>
                    <Text style={[styles.fishingSpotDescription, { color: colors.textSecondary }]}>
                      {selectedFishingSpot.description}
                    </Text>
                  </View>
                )}

                {/* Species Section */}
                {selectedFishingSpot.species && selectedFishingSpot.species.length > 0 && (
                  <View style={styles.fishingSpotSection}>
                    <Text style={[styles.fishingSpotSectionTitle, { color: colors.text }]}>
                      <Ionicons name="fish" size={16} color={colors.primary} /> Forekommende Arter
                    </Text>
                    <View style={styles.fishSpeciesContainer}>
                      {selectedFishingSpot.species.map((speciesId, index) => (
                        <View
                          key={index}
                          style={[
                            styles.fishSpeciesChip,
                            {
                              backgroundColor: colors.accent + '15',
                              borderColor: colors.accent + '35',
                              borderWidth: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                            },
                          ]}
                        >
                          <FishSpeciesIcon speciesId={speciesId} size={22} color={colors.accent} />
                          <Text style={[styles.fishSpeciesText, { color: colors.accent, fontWeight: '700' }]}>
                            {getSpeciesName(speciesId)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Regulations */}
                {selectedFishingSpot.regulations && (
                  <View style={styles.fishingSpotSection}>
                    <Text style={[styles.fishingSpotSectionTitle, { color: colors.warning }]}>
                      <Ionicons name="shield-checkmark" size={16} color={colors.warning} /> Regler & Fredning
                    </Text>
                    <Text style={[styles.fishingSpotRegulations, { color: colors.textSecondary }]}>
                      {selectedFishingSpot.regulations}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.fishingSpotActions}>
                  <TouchableOpacity
                    style={[styles.fishingSpotActionButton, { backgroundColor: colors.primary }]}
                    onPress={() => onGetAIAdvice(selectedFishingSpot.latitude, selectedFishingSpot.longitude)}
                  >
                    <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
                    <Text style={styles.fishingSpotActionText}>Spørg AI mere</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.fishingSpotActionButton, { backgroundColor: '#10B981' }]}
                    onPress={() => {
                      const url =
                        Platform.OS === 'ios'
                          ? `maps:?q=${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}`
                          : `geo:${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}?q=${selectedFishingSpot.latitude},${selectedFishingSpot.longitude}(${encodeURIComponent(
                              selectedFishingSpot.name
                            )})`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="navigate" size={18} color="#FFFFFF" />
                    <Text style={styles.fishingSpotActionText}>Rutevejledning</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  aiTacticsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 178, 0.3)',
  },
  aiGradientHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiCardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scoreBadge: {
    backgroundColor: 'rgba(0, 212, 178, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00D4B2',
  },
  scoreBadgeText: {
    color: '#00D4B2',
    fontSize: 11,
    fontWeight: '800',
  },
  aiCardBody: {
    padding: 14,
  },
  tacticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tacticsLabel: {
    fontSize: 13,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tideNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00D4B215',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  subHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  lureCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  lureName: {
    fontSize: 13,
    fontWeight: '700',
  },
  lureTypeBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lureTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F5A623',
  },
  lureSpecs: {
    fontSize: 12,
    marginTop: 3,
  },
  lureReason: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  techCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  techName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  techDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  proTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  proTipText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  fishingSpotSection: {
    marginBottom: 16,
  },
  fishingSpotSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  fishingSpotDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  fishSpeciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fishSpeciesChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fishSpeciesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fishingSpotRegulations: {
    fontSize: 12,
    lineHeight: 16,
  },
  fishingSpotActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  fishingSpotActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fishingSpotActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
