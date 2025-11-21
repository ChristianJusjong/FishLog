import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SegmentDetail {
  id: string;
  name: string;
  description: string;
  segmentType: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  totalCatches: number;
  activityCount: number;
  createdBy: {
    id: string;
    name: string;
  };
  currentLegend?: {
    userId: string;
    user: {
      name: string;
      avatar: string;
    };
    effortCount: number;
    achievedAt: string;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  value: number;
  efforts: number;
  lastEffortAt: string;
  isCurrentUser: boolean;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingTop: 50,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      backgroundColor: colors.surface + 'F0',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW.medium,
    },
    mapContainer: {
      height: SCREEN_HEIGHT * 0.35,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    titleSection: {
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    segmentName: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    segmentMeta: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    description: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.sm,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      marginTop: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    legendSection: {
      margin: SPACING.lg,
      padding: SPACING.lg,
      backgroundColor: colors.warning + '15',
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      borderColor: colors.warning,
    },
    legendHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    legendIcon: {
      marginRight: SPACING.sm,
    },
    legendTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
    },
    legendUser: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
    },
    legendAvatar: {
      width: 50,
      height: 50,
      borderRadius: RADIUS.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    legendName: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    legendStats: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginTop: SPACING.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: colors.primary,
    },
    leaderboardContainer: {
      padding: SPACING.lg,
    },
    categoryButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    categoryButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
    },
    categoryButtonTextActive: {
      color: '#FFFFFF',
    },
    leaderboardEntry: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.sm,
    },
    leaderboardEntryHighlight: {
      backgroundColor: colors.primaryLight + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    rank: {
      width: 40,
      alignItems: 'center',
    },
    rankText: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
      fontWeight: 'bold',
    },
    rankMedal: {
      fontSize: 24,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    userStats: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    value: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.primary,
      fontWeight: 'bold',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    effortsSection: {
      padding: SPACING.lg,
    },
    effortCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    effortHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    effortDate: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    effortScore: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.primary,
      fontWeight: 'bold',
    },
    effortStats: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    effortStat: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
    },
    prBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      alignSelf: 'flex-start',
      marginTop: SPACING.xs,
    },
    prText: {
      ...TYPOGRAPHY.styles.caption,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
};

export default function SegmentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [segment, setSegment] = useState<SegmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'efforts'>('leaderboard');
  const [category, setCategory] = useState<string>('most_catches');
  const [timeframe, setTimeframe] = useState<string>('all_time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [efforts, setEfforts] = useState<any[]>([]);

  const categories = [
    { id: 'most_catches', label: 'Flest fangster' },
    { id: 'biggest_fish', label: 'Største fisk' },
    { id: 'total_weight', label: 'Total vægt' },
    { id: 'species_diversity', label: 'Flest arter' },
  ];

  const timeframes = [
    { id: 'all_time', label: 'Alt' },
    { id: 'year', label: 'År' },
    { id: 'month', label: 'Måned' },
    { id: 'week', label: 'Uge' },
  ];

  useEffect(() => {
    if (id) {
      fetchSegmentDetail();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (id && activeTab === 'efforts') {
      fetchEfforts();
    }
  }, [id, activeTab, category, timeframe]);

  const fetchSegmentDetail = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/segments/${id}`);
      setSegment(data.segment);
    } catch (error) {
      console.error('Failed to fetch segment detail:', error);
      Alert.alert('Fejl', 'Kunne ikke indlæse segment');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get(`/segments/${id}/leaderboard?category=${category}&timeframe=${timeframe}`);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const fetchEfforts = async () => {
    try {
      const { data } = await api.get(`/segments/${id}/efforts`);
      setEfforts(data.efforts || []);
    } catch (error) {
      console.error('Failed to fetch efforts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!segment) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: colors.textSecondary }}>Segment ikke fundet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: segment.centerLat,
              longitude: segment.centerLng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker
              coordinate={{
                latitude: segment.centerLat,
                longitude: segment.centerLng,
              }}
              title={segment.name}
            />
            <Circle
              center={{
                latitude: segment.centerLat,
                longitude: segment.centerLng,
              }}
              radius={segment.radius}
              strokeColor={colors.primary + '80'}
              fillColor={colors.primary + '20'}
              strokeWidth={2}
            />
          </MapView>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.segmentName}>{segment.name}</Text>
          <Text style={styles.segmentMeta}>
            {segment.segmentType.charAt(0).toUpperCase() + segment.segmentType.slice(1)} •
            Oprettet af {segment.createdBy.name}
          </Text>
          {segment.description && (
            <Text style={styles.description}>{segment.description}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{segment.totalCatches}</Text>
            <Text style={styles.statLabel}>Fangster</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{segment.activityCount}</Text>
            <Text style={styles.statLabel}>Aktiviteter</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(segment.radius)}m</Text>
            <Text style={styles.statLabel}>Radius</Text>
          </View>
        </View>

        {/* Local Legend */}
        {segment.currentLegend && (
          <View style={styles.legendSection}>
            <View style={styles.legendHeader}>
              <Ionicons name="trophy" size={24} color={colors.warning} style={styles.legendIcon} />
              <Text style={styles.legendTitle}>Local Legend</Text>
            </View>
            <View style={styles.legendUser}>
              <View style={styles.legendAvatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName}>{segment.currentLegend.user.name}</Text>
                <Text style={styles.legendStats}>
                  {segment.currentLegend.effortCount} indsatser • Siden {formatDate(segment.currentLegend.achievedAt)}
                </Text>
              </View>
              <Ionicons name="trophy" size={32} color={colors.warning} />
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'efforts' && styles.tabActive]}
            onPress={() => setActiveTab('efforts')}
          >
            <Text style={[styles.tabText, activeTab === 'efforts' && styles.tabTextActive]}>
              Indsatser
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardContainer}>
            <View style={styles.categoryButtons}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.categoryButtons, { marginTop: -SPACING.md }]}>
              {timeframes.map(tf => (
                <TouchableOpacity
                  key={tf.id}
                  style={[
                    styles.categoryButton,
                    timeframe === tf.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setTimeframe(tf.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      timeframe === tf.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {leaderboard.map(entry => {
              const medal = getMedalEmoji(entry.rank);
              return (
                <View
                  key={`${entry.userId}-${entry.rank}`}
                  style={[
                    styles.leaderboardEntry,
                    entry.isCurrentUser && styles.leaderboardEntryHighlight,
                  ]}
                >
                  <View style={styles.rank}>
                    {medal ? (
                      <Text style={styles.rankMedal}>{medal}</Text>
                    ) : (
                      <Text style={styles.rankText}>#{entry.rank}</Text>
                    )}
                  </View>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{entry.user.name}</Text>
                    <Text style={styles.userStats}>
                      {entry.efforts} indsatser • {formatDate(entry.lastEffortAt)}
                    </Text>
                  </View>
                  <Text style={styles.value}>{entry.value}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Efforts */}
        {activeTab === 'efforts' && (
          <View style={styles.effortsSection}>
            {efforts.map(effort => (
              <View key={effort.id} style={styles.effortCard}>
                <View style={styles.effortHeader}>
                  <Text style={styles.effortDate}>{formatDate(effort.completedAt)}</Text>
                  <Text style={styles.effortScore}>{effort.effortScore} point</Text>
                </View>
                <View style={styles.effortStats}>
                  <Text style={styles.effortStat}>{effort.catchCount} fangster</Text>
                  <Text style={styles.effortStat}>{effort.totalWeight?.toFixed(1)} kg</Text>
                  <Text style={styles.effortStat}>{effort.speciesDiversity} arter</Text>
                </View>
                {effort.isPR && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prText}>PERSONLIG REKORD</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
