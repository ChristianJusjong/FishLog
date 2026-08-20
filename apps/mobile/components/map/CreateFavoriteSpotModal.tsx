import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type CreateFavoriteSpotModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  savingFavorite: boolean;
  favoriteName: string;
  setFavoriteName: (v: string) => void;
  favoriteFishSpecies: string;
  setFavoriteFishSpecies: (v: string) => void;
  favoriteBottomType: string;
  setFavoriteBottomType: (v: string) => void;
  favoriteDepth: string;
  setFavoriteDepth: (v: string) => void;
  favoritePrivacy: 'public' | 'groups' | 'friends' | 'private';
  setFavoritePrivacy: (v: 'public' | 'groups' | 'friends' | 'private') => void;
  favoriteParkingLat: string;
  setFavoriteParkingLat: (v: string) => void;
  favoriteParkingLng: string;
  setFavoriteParkingLng: (v: string) => void;
  favoriteNotes: string;
  setFavoriteNotes: (v: string) => void;
};

export default function CreateFavoriteSpotModal({
  visible,
  onClose,
  onSave,
  savingFavorite,
  favoriteName,
  setFavoriteName,
  favoriteFishSpecies,
  setFavoriteFishSpecies,
  favoriteBottomType,
  setFavoriteBottomType,
  favoriteDepth,
  setFavoriteDepth,
  favoritePrivacy,
  setFavoritePrivacy,
  favoriteParkingLat,
  setFavoriteParkingLat,
  favoriteParkingLng,
  setFavoriteParkingLng,
  favoriteNotes,
  setFavoriteNotes,
}: CreateFavoriteSpotModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="heart" size={24} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Gem Favoritsted</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>* Navn på stedet</Text>
            <TextInput
              style={styles.textInput}
              placeholder="F.eks. Hemmelig Kystplads"
              value={favoriteName}
              onChangeText={setFavoriteName}
            />

            <Text style={styles.inputLabel}>Fiskearter (komma-separeret)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="F.eks. Havørred, Hornfisk"
              value={favoriteFishSpecies}
              onChangeText={setFavoriteFishSpecies}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Bundforhold</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="F.eks. Sand/Tang"
                  value={favoriteBottomType}
                  onChangeText={setFavoriteBottomType}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Dybde (m)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="F.eks. 2.5"
                  keyboardType="numeric"
                  value={favoriteDepth}
                  onChangeText={setFavoriteDepth}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Privatlivsindstilling</Text>
            <View style={styles.privacyButtons}>
              <TouchableOpacity
                style={[styles.privacyButton, favoritePrivacy === 'private' && styles.privacyButtonActive]}
                onPress={() => setFavoritePrivacy('private')}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={favoritePrivacy === 'private' ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[styles.privacyButtonText, favoritePrivacy === 'private' && styles.privacyButtonTextActive]}
                >
                  Kun mig
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.privacyButton, favoritePrivacy === 'friends' && styles.privacyButtonActive]}
                onPress={() => setFavoritePrivacy('friends')}
              >
                <Ionicons
                  name="people"
                  size={16}
                  color={favoritePrivacy === 'friends' ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[styles.privacyButtonText, favoritePrivacy === 'friends' && styles.privacyButtonTextActive]}
                >
                  Venner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.privacyButton, favoritePrivacy === 'groups' && styles.privacyButtonActive]}
                onPress={() => setFavoritePrivacy('groups')}
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={favoritePrivacy === 'groups' ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[styles.privacyButtonText, favoritePrivacy === 'groups' && styles.privacyButtonTextActive]}
                >
                  Småbådsklub
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.privacyButton, favoritePrivacy === 'public' && styles.privacyButtonActive]}
                onPress={() => setFavoritePrivacy('public')}
              >
                <Ionicons
                  name="globe"
                  size={16}
                  color={favoritePrivacy === 'public' ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[styles.privacyButtonText, favoritePrivacy === 'public' && styles.privacyButtonTextActive]}
                >
                  Offentlig
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 5 }}>Parkering</Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Breddegrad (Lat)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="F.eks. 56.1234"
                  keyboardType="numeric"
                  value={favoriteParkingLat}
                  onChangeText={setFavoriteParkingLat}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Længdegrad (Lng)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="F.eks. 10.1234"
                  keyboardType="numeric"
                  value={favoriteParkingLng}
                  onChangeText={setFavoriteParkingLng}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Noter / Bemærkninger</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Skriv dine personlige noter her..."
              multiline
              numberOfLines={4}
              value={favoriteNotes}
              onChangeText={setFavoriteNotes}
            />

            <TouchableOpacity style={styles.saveFavoriteButton} onPress={onSave} disabled={savingFavorite}>
              {savingFavorite ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveFavoriteButtonText}>Gem Sted</Text>
                </>
              )}
            </TouchableOpacity>

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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  privacyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF', // Standard fallback, handled by theme dynamically
    backgroundColor: '#FFFFFF',
  },
  privacyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  privacyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  privacyButtonTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 10,
  },
  saveFavoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
