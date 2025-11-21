import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

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

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...SHADOWS.sm,
    },
    backButton: {
      padding: SPACING.xs,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
      textAlign: 'center',
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      margin: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
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
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.sm,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
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
    scrollView: {
      flex: 1,
    },
    speciesGrid: {
      padding: SPACING.md,
      paddingBottom: 100,
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
  });
};

export default function FiskeDexScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [data, setData] = useState<FiskeDexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'caught' | 'uncaught'>('all');

  useEffect(() => {
    fetchFiskeDex();
  }, []);

  const fetchFiskeDex = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/catches/fiskedex`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
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
    fetchFiskeDex();
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

  const filteredSpecies = data?.species.filter(s => {
    if (filter === 'caught') return s.caught;
    if (filter === 'uncaught') return !s.caught;
    return true;
  }) || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Indlæser FiskeDex...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>🐟 FiskeDex</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stats Card */}
        {data && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{data.stats.caughtSpecies}/{data.stats.totalSpecies}</Text>
              <Text style={styles.statLabel}>Arter fanget</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{data.stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Fuldført</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{data.stats.totalCatches}</Text>
              <Text style={styles.statLabel}>Total fangster</Text>
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'caught' && styles.filterButtonActive]}
            onPress={() => setFilter('caught')}
          >
            <Text style={[styles.filterButtonText, filter === 'caught' && styles.filterButtonTextActive]}>
              Fanget
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'uncaught' && styles.filterButtonActive]}
            onPress={() => setFilter('uncaught')}
          >
            <Text style={[styles.filterButtonText, filter === 'uncaught' && styles.filterButtonTextActive]}>
              Mangler
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Species Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.speciesGrid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {filteredSpecies.map((species) => (
          <TouchableOpacity
            key={species.name}
            style={[
              styles.speciesCard,
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
      </ScrollView>
    </View>
  );
}
