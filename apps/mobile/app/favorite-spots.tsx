import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/api';

type FavoriteSpot = {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  isPrivate: boolean;
  rating?: number;
  catchCount?: number;
  createdAt: string;
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
    },
    backButton: {
      padding: SPACING.xs,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    container: {
      flexGrow: 1,
      padding: SPACING.lg,
      paddingBottom: 120,
    },
    emptyCard: {
      padding: SPACING.xl,
      borderRadius: RADIUS.xl,
      alignItems: 'center',
      ...SHADOWS.sm,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    primaryButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.full,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    spotCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    spotHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.sm,
    },
    spotName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    spotDescription: {
      fontSize: 14,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '600',
    },
    notesContainer: {
      flexDirection: 'row',
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    notesText: {
      fontSize: 12,
      flex: 1,
    },
    spotFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    spotStats: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
    },
    spotActions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

export default function FavoriteSpotsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState<FavoriteSpot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/favorite-spots`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpots(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente favoritsteder');
      }
    } catch (error) {
      console.error('Failed to fetch favorite spots:', error);
      Alert.alert('Fejl', 'Kunne ikke hente favoritsteder');
    } finally {
      setLoading(false);
    }
  };

  const deleteSpot = async (id: string, name: string) => {
    Alert.alert(
      'Slet fiskested',
      `Er du sikker på at du vil slette "${name}"?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_URL}/favorite-spots/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });

              if (response.ok) {
                setSpots(spots.filter(s => s.id !== id));
                Alert.alert('Success', 'Fiskested slettet');
              } else {
                Alert.alert('Fejl', 'Kunne ikke slette fiskested');
              }
            } catch (error) {
              console.error('Failed to delete spot:', error);
              Alert.alert('Fejl', 'Kunne ikke slette fiskested');
            }
          },
        },
      ]
    );
  };

  const viewSpotOnMap = (spot: FavoriteSpot) => {
    // Navigate to map with this spot's coordinates
    router.push(`/map?lat=${spot.latitude}&lng=${spot.longitude}`);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Indlæser favoritsteder...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mine Favoritsteder</Text>
        <View style={{ width: 24 }} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        {spots.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Ingen favoritsteder endnu
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tryk på kortet for at gemme et sted som favorit
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/map')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                Gå til kort
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          spots.map((spot) => (
            <View key={spot.id} style={[styles.spotCard, { backgroundColor: colors.surface }]}>
              <View style={styles.spotHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.spotName, { color: colors.text }]}>{spot.name}</Text>
                  {spot.description && (
                    <Text style={[styles.spotDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {spot.description}
                    </Text>
                  )}
                </View>
                {spot.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FDB022" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{spot.rating}</Text>
                  </View>
                )}
              </View>

              {spot.notes && (
                <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {spot.notes}
                  </Text>
                </View>
              )}

              <View style={styles.spotFooter}>
                <View style={styles.spotStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="fish" size={16} color={colors.primary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                      {spot.catchCount || 0} fangster
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name={spot.isPrivate ? "lock-closed" : "globe"} size={16} color={colors.textSecondary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                      {spot.isPrivate ? 'Privat' : 'Offentlig'}
                    </Text>
                  </View>
                </View>

                <View style={styles.spotActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => viewSpotOnMap(spot)}
                  >
                    <Ionicons name="map-outline" size={16} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error }]}
                    onPress={() => deleteSpot(spot.id, spot.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
