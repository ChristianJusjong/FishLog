import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, EMPTY_STATE, LOADING_CONTAINER } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { exportCatchesToPDF, exportCatchesToCSV } from '@/lib/exportUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    loadingContainer: {
      ...LOADING_CONTAINER,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    loader: {
      marginBottom: SPACING.md,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: SPACING.lg,
      paddingBottom: 100,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...SHADOWS.sm,
      flexDirection: 'row',
      minHeight: 52,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      marginBottom: SPACING.lg,
    },
    buttonIcon: {
      marginRight: SPACING.xs,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
    emptyState: {
      ...EMPTY_STATE,
      marginTop: SPACING['2xl'],
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: RADIUS['2xl'],
      backgroundColor: colors.gray100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    catchesList: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
    catchCardWrapper: {
      position: 'relative',
      marginBottom: SPACING.md,
    },
    catchCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: 0,
      marginBottom: 0,
      ...SHADOWS.md,
      overflow: 'hidden',
    },
    deleteButton: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 36,
      height: 36,
      borderRadius: RADIUS.full,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.md,
      zIndex: 10,
    },
    catchImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.backgroundLight,
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
      color: colors.textPrimary,
    },
    catchDate: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
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
      backgroundColor: colors.primaryLight + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    catchDetailText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.primary,
    },
    catchInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    catchInfo: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      flex: 1,
    },
    catchNotes: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textPrimary,
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
    },
    draftBadge: {
      backgroundColor: colors.warning || '#FFA500',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.md,
    },
    draftBadgeText: {
      ...TYPOGRAPHY.styles.tiny,
      color: colors.white,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: SPACING.md,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    tabEmoji: {
      fontSize: 20,
    },
    tabText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    activeTabText: {
      color: colors.primary,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      ...TYPOGRAPHY.styles.h1,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.sm,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    filterButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: colors.white,
    },
    speciesCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.md,
    },
    speciesCardLocked: {
      opacity: 0.6,
    },
    photoContainer: {
      position: 'relative',
      width: '100%',
      height: 180,
      backgroundColor: colors.backgroundLight,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    placeholderPhoto: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.border,
    },
    placeholderEmoji: {
      fontSize: 64,
    },
    lockedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    speciesInfo: {
      padding: SPACING.md,
    },
    speciesName: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.xs,
    },
    speciesNameLocked: {
      color: colors.textTertiary,
    },
    rarityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    rarityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    rarityText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
    },
    description: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.backgroundLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    statBadgeText: {
      ...TYPOGRAPHY.styles.small,
      fontSize: 11,
      color: colors.textSecondary,
    },
    lockedText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
    exportContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surface,
    },
    exportButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      ...SHADOWS.sm,
    },
    exportButtonCSV: {
      backgroundColor: colors.success,
    },
    exportButtonDisabled: {
      opacity: 0.6,
    },
    exportButtonText: {
      ...TYPOGRAPHY.styles.body,
      fontSize: 14,
      fontWeight: '600',
      color: colors.white,
    },
  });
};

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

type Species = {
  name: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare';
  description: string;
  caught: boolean;
  count: number;
  firstCaught: string | null;
  lastCaught: string | null;
  largestLength: number | null;
  heaviestWeight: number | null;
  photo: string | null;
};

type FiskeDexData = {
  species: Species[];
  stats: {
    totalSpecies: number;
    caughtSpecies: number;
    completionRate: number;
    totalCatches: number;
  };
};

export default function CatchesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<'catches' | 'fiskedex'>('catches');
  const [catches, setCatches] = useState<Catch[]>([]);
  const [fiskedexData, setFiskedexData] = useState<FiskeDexData | null>(null);
  const [fiskedexFilter, setFiskedexFilter] = useState<'all' | 'caught' | 'uncaught'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'catches') {
        fetchCatches();
      } else {
        fetchFiskeDex();
      }
    }, [activeTab])
  );

  const fetchCatches = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Ikke logget ind', 'Du skal logge ind først', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        setLoading(false);
        setRefreshing(false);
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
      setRefreshing(false);
    }
  };

  const deleteCatch = async (catchId: string, catchSpecies: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Er du sikker på, at du vil slette ${catchSpecies || 'denne fangst'}?`)
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Slet fangst',
            `Er du sikker på, at du vil slette ${catchSpecies || 'denne fangst'}?`,
            [
              { text: 'Annuller', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Slet', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setCatches(catches.filter(c => c.id !== catchId));
        if (Platform.OS === 'web') {
          alert('Fangst slettet');
        } else {
          Alert.alert('Succes', 'Fangst slettet');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  const fetchFiskeDex = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/catches/fiskedex`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFiskedexData(result);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente FiskeDex');
      }
    } catch (error) {
      console.error('Failed to fetch FiskeDex:', error);
      Alert.alert('Fejl', 'Kunne ikke hente FiskeDex');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'catches') {
      fetchCatches();
    } else {
      fetchFiskeDex();
    }
  };

  const handleExportPDF = async () => {
    if (catches.length === 0) {
      Alert.alert('Ingen fangster', 'Du har ingen fangster at eksportere endnu');
      return;
    }

    setExporting(true);
    try {
      await exportCatchesToPDF(catches, 'Mine Fangster');
      Alert.alert('Eksporteret!', 'Dine fangster er eksporteret til PDF');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Fejl', 'Kunne ikke eksportere til PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (catches.length === 0) {
      Alert.alert('Ingen fangster', 'Du har ingen fangster at eksportere endnu');
      return;
    }

    setExporting(true);
    try {
      await exportCatchesToCSV(catches);
      Alert.alert('Eksporteret!', 'Dine fangster er eksporteret til CSV');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Fejl', 'Kunne ikke eksportere til CSV');
    } finally {
      setExporting(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#10B981'; // Green
      case 'uncommon':
        return '#3B82F6'; // Blue
      case 'rare':
        return '#A855F7'; // Purple
      default:
        return colors.textSecondary;
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Almindelig';
      case 'uncommon':
        return 'Ualmindelig';
      case 'rare':
        return 'Sjælden';
      default:
        return rarity;
    }
  };

  const filteredSpecies = fiskedexData?.species.filter(s => {
    if (fiskedexFilter === 'caught') return s.caught;
    if (fiskedexFilter === 'uncaught') return !s.caught;
    return true;
  }) || [];


  if (loading) {
    return (
      <View style={styles.safeArea}>
        <WeatherLocationCard showLocation={true} showWeather={true} />
        <View style={styles.loadingContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="fish" size={48} color={colors.primary} />
          </View>
          <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
          <Text style={styles.loadingText}>Indlæser fangster...</Text>
        </View>
      </View>
    );
  }

  return (
    <PageLayout>
      <View style={styles.safeArea}>
        <WeatherLocationCard showLocation={true} showWeather={true} />

        {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'catches' && styles.activeTab]}
          onPress={() => setActiveTab('catches')}
        >
          <View style={styles.tabContent}>
            <Text style={styles.tabEmoji}>🎣</Text>
            <Text style={[styles.tabText, activeTab === 'catches' && styles.activeTabText]}>
              Fangster
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fiskedex' && styles.activeTab]}
          onPress={() => setActiveTab('fiskedex')}
        >
          <View style={styles.tabContent}>
            <Text style={styles.tabEmoji}>🐟</Text>
            <Text style={[styles.tabText, activeTab === 'fiskedex' && styles.activeTabText]}>
              FiskeDex
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Export Buttons - Only show on Catches tab */}
      {activeTab === 'catches' && catches.length > 0 && (
        <View style={styles.exportContainer}>
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
            onPress={handleExportPDF}
            disabled={exporting}
          >
            <Ionicons name="document-text" size={16} color={colors.white} />
            <Text style={styles.exportButtonText}>
              {exporting ? 'Eksporterer...' : 'PDF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonCSV, exporting && styles.exportButtonDisabled]}
            onPress={handleExportCSV}
            disabled={exporting}
          >
            <Ionicons name="stats-chart" size={16} color={colors.white} />
            <Text style={styles.exportButtonText}>
              {exporting ? 'Eksporterer...' : 'CSV'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {activeTab === 'catches' ? (
          <>
        {catches.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="fish-outline" size={64} color={colors.iconDefault} />
            </View>
            <Text style={styles.emptyText}>Ingen fangster endnu</Text>
            <Text style={styles.emptySubtext}>Tilføj din første fangst og start din fiskebog!</Text>
          </View>
        ) : (
          <View style={styles.catchesList}>
            {catches.map((catch_) => (
              <View key={catch_.id} style={styles.catchCardWrapper}>
                <TouchableOpacity
                  style={[styles.catchCard, { backgroundColor: colors.surface }]}
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
                          <Ionicons name="resize-outline" size={14} color={colors.primary} />
                          <Text style={styles.catchDetailText}>{catch_.lengthCm} cm</Text>
                        </View>
                      )}
                      {catch_.weightKg && (
                        <View style={styles.catchDetailBadge}>
                          <Ionicons name="scale-outline" size={14} color={colors.primary} />
                          <Text style={styles.catchDetailText}>{Math.round(catch_.weightKg * 1000)} g</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {catch_.bait && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="bug-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.catchInfo}>Agn: {catch_.bait}</Text>
                    </View>
                  )}
                  {catch_.technique && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.catchInfo}>Teknik: {catch_.technique}</Text>
                    </View>
                  )}
                  {catch_.latitude && catch_.longitude && (
                    <View style={styles.catchInfoRow}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
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

                {/* Delete button overlay */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCatch(catch_.id, catch_.species || 'Ukompletteret fangst')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
          </>
        ) : (
          <>
            {/* FiskeDex Content */}
            {fiskedexData && (
              <>
                {/* Stats Card */}
                <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{fiskedexData.stats.caughtSpecies}/{fiskedexData.stats.totalSpecies}</Text>
                    <Text style={styles.statLabel}>Arter fanget</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{fiskedexData.stats.completionRate}%</Text>
                    <Text style={styles.statLabel}>Fuldført</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{fiskedexData.stats.totalCatches}</Text>
                    <Text style={styles.statLabel}>Total fangster</Text>
                  </View>
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[styles.filterButton, fiskedexFilter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFiskedexFilter('all')}
                  >
                    <Text style={[styles.filterButtonText, fiskedexFilter === 'all' && styles.filterButtonTextActive]}>
                      Alle
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, fiskedexFilter === 'caught' && styles.filterButtonActive]}
                    onPress={() => setFiskedexFilter('caught')}
                  >
                    <Text style={[styles.filterButtonText, fiskedexFilter === 'caught' && styles.filterButtonTextActive]}>
                      Fanget
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, fiskedexFilter === 'uncaught' && styles.filterButtonActive]}
                    onPress={() => setFiskedexFilter('uncaught')}
                  >
                    <Text style={[styles.filterButtonText, fiskedexFilter === 'uncaught' && styles.filterButtonTextActive]}>
                      Mangler
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Species Grid */}
                {filteredSpecies.map((species) => (
                  <TouchableOpacity
                    key={species.name}
                    style={[
                      styles.speciesCard,
                      { backgroundColor: colors.surface },
                      !species.caught && styles.speciesCardLocked
                    ]}
                    activeOpacity={species.caught ? 0.7 : 1}
                  >
                    {/* Photo or Placeholder */}
                    <View style={styles.photoContainer}>
                      {species.caught && species.photo ? (
                        <Image source={{ uri: species.photo }} style={styles.photo} />
                      ) : (
                        <View style={styles.placeholderPhoto}>
                          <Text style={styles.placeholderEmoji}>{species.caught ? species.emoji : '❓'}</Text>
                        </View>
                      )}
                      {!species.caught && (
                        <View style={styles.lockedOverlay}>
                          <Ionicons name="lock-closed" size={32} color={colors.textTertiary} />
                        </View>
                      )}
                    </View>

                    {/* Species Info */}
                    <View style={styles.speciesInfo}>
                      <Text style={[styles.speciesName, !species.caught && styles.speciesNameLocked]}>
                        {species.caught ? species.name : '???'}
                      </Text>

                      {species.caught && (
                        <>
                          <View style={styles.rarityBadge}>
                            <View style={[styles.rarityDot, { backgroundColor: getRarityColor(species.rarity) }]} />
                            <Text style={styles.rarityText}>{getRarityLabel(species.rarity)}</Text>
                          </View>
                          <Text style={styles.description} numberOfLines={2}>
                            {species.description}
                          </Text>
                          <View style={styles.statsRow}>
                            <View style={styles.statBadge}>
                              <Ionicons name="fish" size={12} color={colors.textSecondary} />
                              <Text style={styles.statBadgeText}>{species.count}x</Text>
                            </View>
                            {species.largestLength && species.largestLength > 0 && (
                              <View style={styles.statBadge}>
                                <Ionicons name="resize" size={12} color={colors.textSecondary} />
                                <Text style={styles.statBadgeText}>{species.largestLength} cm</Text>
                              </View>
                            )}
                            {species.heaviestWeight && species.heaviestWeight > 0 && (
                              <View style={styles.statBadge}>
                                <Ionicons name="scale" size={12} color={colors.textSecondary} />
                                <Text style={styles.statBadgeText}>{species.heaviestWeight} kg</Text>
                              </View>
                            )}
                          </View>
                        </>
                      )}

                      {!species.caught && (
                        <Text style={styles.lockedText}>Fang denne art for at låse op</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      </View>
    </PageLayout>
  );
}