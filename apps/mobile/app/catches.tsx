import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, BUTTON_STYLES, CARD_STYLE, EMPTY_STATE, LOADING_CONTAINER } from '@/constants/theme';

const API_URL = 'https://fishlog-production.up.railway.app';

interface Catch {
  id: string;
  species?: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  isDraft?: boolean;
}

export default function CatchesScreen() {
  const router = useRouter();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchCatches();
    }, [])
  );

  const fetchCatches = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Ikke logget ind', 'Du skal logge ind først', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/catches?userId=me&includeDrafts=true`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatches(data);
      } else if (response.status === 401) {
        Alert.alert('Session udløbet', 'Log venligst ind igen', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente fangster');
      }
    } catch (error) {
      Alert.alert('Fejl', error instanceof Error ? error.message : 'Ukendt fejl');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <WeatherLocationCard showLocation={true} showWeather={true} />
        <View style={styles.loadingContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="fish" size={48} color={COLORS.primary} />
          </View>
          <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
          <Text style={styles.loadingText}>Indlæser fangster...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-catch')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Tilføj Fangst</Text>
        </TouchableOpacity>

        {catches.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="fish-outline" size={64} color={COLORS.iconDefault} />
            </View>
            <Text style={styles.emptyText}>Ingen fangster endnu</Text>
            <Text style={styles.emptySubtext}>Tilføj din første fangst og start din fiskebog!</Text>
          </View>
        ) : (
          <View style={styles.catchesList}>
            {catches.map((catch_) => (
              <TouchableOpacity
                key={catch_.id}
                style={styles.catchCard}
                onPress={() => {
                  if (catch_.isDraft) {
                    router.push({
                      pathname: '/catch-form',
                      params: { catchId: catch_.id, isNew: 'false' }
                    });
                  } else {
                    router.push(`/catch-detail?id=${catch_.id}`);
                  }
                }}
                activeOpacity={0.9}
              >
                {catch_.photoUrl && (
                  <Image source={{ uri: catch_.photoUrl }} style={styles.catchImage} resizeMode="cover" />
                )}

                <View style={styles.catchContent}>
                  <View style={styles.catchHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Text style={styles.catchSpecies} numberOfLines={1}>
                        {catch_.species || 'Ukompletteret fangst'}
                      </Text>
                      {catch_.isDraft && (
                        <View style={styles.draftBadge}>
                          <Text style={styles.draftBadgeText}>Kladde</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.catchDate}>
                      {new Date(catch_.createdAt).toLocaleDateString('da-DK')}
                    </Text>
                  </View>

                  {(catch_.lengthCm || catch_.weightKg) && (
                    <View style={styles.catchDetails}>
                      {catch_.lengthCm && (
                        <View style={styles.catchDetailBadge}>
                          <Ionicons name="resize-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.catchDetailText}>{catch_.lengthCm} cm</Text>
                        </View>
                      )}
                      {catch_.weightKg && (
                        <View style={styles.catchDetailBadge}>
                          <Ionicons name="scale-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.catchDetailText}>{Math.round(catch_.weightKg * 1000)} g</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {catch_.bait && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="bug-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.catchInfo}>Agn: {catch_.bait}</Text>
                    </View>
                  )}
                  {catch_.technique && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="settings-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.catchInfo}>Teknik: {catch_.technique}</Text>
                    </View>
                  )}
                  {catch_.latitude && catch_.longitude && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.catchInfo}>
                        {catch_.latitude.toFixed(4)}, {catch_.longitude.toFixed(4)}
                      </Text>
                    </View>
                  )}
                  {catch_.notes && (
                    <Text style={styles.catchNotes} numberOfLines={2}>{catch_.notes}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    ...LOADING_CONTAINER,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loader: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  addButton: {
    ...BUTTON_STYLES.primary.container,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    minHeight: 52,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  buttonText: {
    ...BUTTON_STYLES.primary.text,
  },
  emptyState: {
    ...EMPTY_STATE,
    marginTop: SPACING['2xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS['2xl'],
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  catchesList: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  catchCard: {
    ...CARD_STYLE,
    overflow: 'hidden',
    padding: 0,
  },
  catchImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.backgroundLight,
  },
  catchContent: {
    padding: SPACING.md,
  },
  catchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  catchSpecies: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  catchDate: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  catchDetails: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  catchDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  catchDetailText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  catchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  catchInfo: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
    flex: 1,
  },
  catchNotes: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
  },
  draftBadge: {
    backgroundColor: COLORS.warning || '#FFA500',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  draftBadgeText: {
    ...TYPOGRAPHY.styles.tiny,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
