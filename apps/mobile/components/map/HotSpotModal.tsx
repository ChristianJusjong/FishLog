import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { HotSpot } from '../../hooks/useMapData';

type HotSpotModalProps = {
  selectedHotSpot: HotSpot | null;
  setSelectedHotSpot: (spot: HotSpot | null) => void;
};

export default function HotSpotModal({ selectedHotSpot, setSelectedHotSpot }: HotSpotModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={selectedHotSpot !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSelectedHotSpot(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginRight: 8 }}>🔥</Text>
              <Text style={styles.modalTitle}>Hot Spot</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedHotSpot(null)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedHotSpot && (
              <>
                <View style={styles.hotSpotStatsContainer}>
                  <View style={styles.hotSpotStat}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                    <Text style={[styles.hotSpotStatValue, { color: colors.primary }]}>{selectedHotSpot.totalAnglers}</Text>
                    <Text style={styles.hotSpotStatLabel}>Anglere</Text>
                  </View>
                  <View style={styles.hotSpotStat}>
                    <Ionicons name="fish" size={24} color={colors.primary} />
                    <Text style={[styles.hotSpotStatValue, { color: colors.primary }]}>{selectedHotSpot.totalCatches}</Text>
                    <Text style={styles.hotSpotStatLabel}>Fangster</Text>
                  </View>
                  <View style={styles.hotSpotStat}>
                    <Ionicons name="trophy" size={24} color={colors.primary} />
                    <Text style={[styles.hotSpotStatValue, { color: colors.primary }]}>{selectedHotSpot.totalScore}</Text>
                    <Text style={styles.hotSpotStatLabel}>Score</Text>
                  </View>
                </View>

                {selectedHotSpot.fishSpecies && selectedHotSpot.fishSpecies.length > 0 && (
                  <View style={styles.hotSpotSection}>
                    <Text style={styles.hotSpotSectionTitle}>Fiskearter</Text>
                    <View style={styles.fishSpeciesContainer}>
                      {selectedHotSpot.fishSpecies.map((species, index) => (
                        <View key={index} style={[styles.fishSpeciesChip, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.fishSpeciesText, { color: colors.primary }]}>{species}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedHotSpot.topAnglers && selectedHotSpot.topAnglers.length > 0 && (
                  <View style={styles.hotSpotSection}>
                    <Text style={styles.hotSpotSectionTitle}>Top 3 Anglere</Text>
                    {selectedHotSpot.topAnglers.map((angler, index) => (
                      <View key={index} style={[styles.topAnglerItem, { borderLeftColor: colors.primary }]}>
                        <View style={[styles.topAnglerRank, { backgroundColor: colors.primary }]}>
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
                  style={[styles.viewLeaderboardButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setSelectedHotSpot(null);
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fishSpeciesText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topAnglerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  topAnglerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topAnglerRankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topAnglerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  topAnglerStats: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  viewLeaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 40,
  },
  viewLeaderboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
