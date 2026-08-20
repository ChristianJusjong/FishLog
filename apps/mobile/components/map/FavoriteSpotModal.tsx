import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FavoriteSpot } from '../../hooks/useMapData';

type FavoriteSpotModalProps = {
  selectedFavoriteSpot: FavoriteSpot | null;
  setSelectedFavoriteSpot: (spot: FavoriteSpot | null) => void;
};

export default function FavoriteSpotModal({
  selectedFavoriteSpot,
  setSelectedFavoriteSpot,
}: FavoriteSpotModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={selectedFavoriteSpot !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSelectedFavoriteSpot(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginRight: 8 }}>⭐</Text>
              <Text style={styles.modalTitle}>Favoritsted</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedFavoriteSpot(null)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedFavoriteSpot && (
              <>
                <View style={styles.favoriteSpotStatsContainer}>
                  <View style={styles.favoriteSpotStat}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                    <Text style={[styles.favoriteSpotStatValue, { color: colors.primary }]}>
                      {selectedFavoriteSpot.visitCount}
                    </Text>
                    <Text style={styles.favoriteSpotStatLabel}>Besøg</Text>
                  </View>
                  <View style={styles.favoriteSpotStat}>
                    <Ionicons name="fish" size={24} color={colors.primary} />
                    <Text style={[styles.favoriteSpotStatValue, { color: colors.primary }]}>
                      {selectedFavoriteSpot.catchCount}
                    </Text>
                    <Text style={styles.favoriteSpotStatLabel}>Fangster</Text>
                  </View>
                  <View style={styles.favoriteSpotStat}>
                    <Ionicons name="trophy" size={24} color={colors.primary} />
                    <Text style={[styles.favoriteSpotStatValue, { color: colors.primary }]}>
                      {selectedFavoriteSpot.totalScore}
                    </Text>
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
                          Tungeste: {selectedFavoriteSpot.biggestFish.species} -{' '}
                          {selectedFavoriteSpot.biggestFish.weight}g
                        </Text>
                      </View>
                    )}
                    {selectedFavoriteSpot.longestFish && (
                      <View style={styles.recordItem}>
                        <Ionicons name="resize" size={20} color={colors.accent} />
                        <Text style={styles.recordText}>
                          Længste: {selectedFavoriteSpot.longestFish.species} -{' '}
                          {selectedFavoriteSpot.longestFish.length}cm
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
                        <View key={index} style={[styles.fishSpeciesChip, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.fishSpeciesText, { color: colors.primary }]}>{species}</Text>
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
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  recordText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  recentCatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  recentCatchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentCatchDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
