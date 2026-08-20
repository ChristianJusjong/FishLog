import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type AIAdviceModalProps = {
  selectedLocation: { latitude: number; longitude: number } | null;
  setSelectedLocation: (location: { latitude: number; longitude: number } | null) => void;
  aiAdvice: string;
  setAiAdvice: (advice: string) => void;
  loadingAiAdvice: boolean;
  openSaveFavoriteModal: () => void;
};

export default function AIAdviceModal({
  selectedLocation,
  setSelectedLocation,
  aiAdvice,
  setAiAdvice,
  loadingAiAdvice,
  openSaveFavoriteModal,
}: AIAdviceModalProps) {
  const { colors } = useTheme();

  return (
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
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fish" size={24} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>AI Fiskeguide</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={openSaveFavoriteModal} style={styles.favoriteHeaderButton}>
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
                <TouchableOpacity style={styles.saveFavoriteButton} onPress={openSaveFavoriteModal}>
                  <Ionicons name="heart" size={24} color="#FFFFFF" />
                  <Text style={styles.saveFavoriteButtonText}>Føj til Favoritter</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
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
    marginBottom: 40,
  },
  saveFavoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
