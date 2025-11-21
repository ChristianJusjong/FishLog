import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../../../contexts/ThemeContext';
import { StyleSheet } from 'react-native';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  details: string;
  catchCount: number;
  bestCatch?: {
    id: string;
    species?: string;
    weightKg?: number;
    lengthCm?: number;
    photoUrl?: string;
    createdAt: string;
    validatedAt?: string;
  };
}

interface Contest {
  id: string;
  rule: string;
  speciesFilter?: string;
}

interface Event {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
}

interface LiveUpdate {
  type: string;
  timestamp: string;
  catch: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    species?: string;
    weightKg?: number;
    lengthCm?: number;
    photoUrl?: string;
    createdAt: string;
  };
  validatedBy: string;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h2,
    marginBottom: 2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  contestInfo: {
    backgroundColor: colors.primary,
    padding: SPACING.lg,
    alignItems: 'center' as const,
  },
  contestRule: {
    ...TYPOGRAPHY.styles.h3,
    color: colors.white,
    marginBottom: SPACING.xs,
  },
  contestSpecies: {
    ...TYPOGRAPHY.styles.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: SPACING.xl,
    marginTop: SPACING.sm,
  },
  statBox: {
    alignItems: 'center' as const,
  },
  statNumber: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: 32,
    color: colors.white,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.small,
    color: colors.white,
    opacity: 0.8,
  },
  liveUpdateBanner: {
    backgroundColor: colors.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
  },
  liveIndicator: {
    ...TYPOGRAPHY.styles.body,
    color: colors.white,
    fontWeight: '700' as const,
  },
  liveUpdateText: {
    ...TYPOGRAPHY.styles.body,
    color: colors.white,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  leaderboardContainer: {
    padding: SPACING.md,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: SPACING.xl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.styles.h3,
    color: colors.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textTertiary,
  },
  leaderboardCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...SHADOWS.sm,
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...SHADOWS.md,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: SPACING.md,
  },
  rankText: {
    ...TYPOGRAPHY.styles.h3,
    fontSize: 20,
    color: colors.textPrimary,
  },
  topThreeRank: {
    fontSize: 24,
  },
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: SPACING.sm,
  },
  avatarText: {
    ...TYPOGRAPHY.styles.body,
    color: colors.white,
    fontWeight: '600' as const,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '600' as const,
    marginBottom: 2,
    color: colors.textPrimary,
  },
  userStats: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'flex-end' as const,
  },
  scoreDetails: {
    ...TYPOGRAPHY.styles.h3,
    color: colors.primary,
  },
  bestCatchSpecies: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  recentUpdatesContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    marginBottom: SPACING.md,
    color: colors.textPrimary,
  },
  updateCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  updateHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.xs,
  },
  updateAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  updateInfo: {
    flex: 1,
  },
  updateUserName: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  updateTime: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  approvedBadge: {
    ...TYPOGRAPHY.styles.small,
    color: colors.success,
    fontWeight: '600' as const,
  },
  updateCatchInfo: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
  },
    });
};

export default function ContestLeaderboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAuthHeader } = useAuth();
  const router = useRouter();
  const styles = useStyles();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contest, setContest] = useState<Contest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalApprovedCatches, setTotalApprovedCatches] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toISOString());
  const [newUpdateAnimation] = useState(new Animated.Value(0));

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.86.236:3000';

  const fetchLeaderboard = async () => {
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/contests/${id}/leaderboard`, {
        headers: authHeader,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setContest(data.contest);
      setEvent(data.event);
      setTotalParticipants(data.totalParticipants);
      setTotalApprovedCatches(data.totalApprovedCatches);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(
        `${API_URL}/contests/${id}/live-updates?since=${lastUpdateTime}`,
        { headers: authHeader }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live updates');
      }

      const data = await response.json();
      if (data.updates.length > 0) {
        setLiveUpdates((prev) => [...data.updates, ...prev].slice(0, 5)); // Keep only latest 5
        setLastUpdateTime(data.timestamp);

        // Trigger animation for new update
        Animated.sequence([
          Animated.timing(newUpdateAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(newUpdateAnimation, {
            toValue: 0,
            duration: 300,
            delay: 2000,
            useNativeDriver: true,
          }),
        ]).start();

        // Refresh leaderboard when new catches are approved
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error fetching live updates:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);

  // Poll for live updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveUpdates();
    }, 10000);

    return () => clearInterval(interval);
  }, [id, lastUpdateTime]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
    fetchLiveUpdates();
  }, [id]);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getRuleLabel = (rule: string) => {
    switch (rule) {
      case 'biggest_single':
        return 'Største Fangst';
      case 'biggest_total':
        return 'Højeste Total Vægt';
      case 'most_catches':
        return 'Flest Fangster';
      default:
        return rule;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
          <Text style={styles.headerSubtitle}>{event?.title}</Text>
        </View>
      </View>

      {/* Contest Info */}
      <View style={styles.contestInfo}>
        <Text style={styles.contestRule}>{getRuleLabel(contest?.rule || '')}</Text>
        {contest?.speciesFilter && (
          <Text style={styles.contestSpecies}>Art: {contest.speciesFilter}</Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalParticipants}</Text>
            <Text style={styles.statLabel}>Deltagere</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalApprovedCatches}</Text>
            <Text style={styles.statLabel}>Godkendte</Text>
          </View>
        </View>
      </View>

      {/* Live Updates Banner */}
      {liveUpdates.length > 0 && (
        <Animated.View
          style={[
            styles.liveUpdateBanner,
            {
              opacity: newUpdateAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
              transform: [
                {
                  scale: newUpdateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.liveIndicator}>🔴 LIVE</Text>
          <Text style={styles.liveUpdateText}>
            {liveUpdates[0].catch.user.name} fangede {liveUpdates[0].catch.species}
          </Text>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          {leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🐟</Text>
              <Text style={styles.emptyText}>Ingen godkendte fangster endnu</Text>
              <Text style={styles.emptySubtext}>
                Vær den første til at fange noget!
              </Text>
            </View>
          ) : (
            leaderboard.map((entry) => (
              <View
                key={entry.user.id}
                style={[
                  styles.leaderboardCard,
                  entry.rank <= 3 && styles.topThreeCard,
                ]}
              >
                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                  <Text style={[styles.rankText, entry.rank <= 3 && styles.topThreeRank]}>
                    {getRankEmoji(entry.rank)}
                  </Text>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  {entry.user.avatar ? (
                    <Image source={{ uri: entry.user.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {entry.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{entry.user.name}</Text>
                    <Text style={styles.userStats}>
                      {entry.catchCount} fangst{entry.catchCount !== 1 ? 'er' : ''}
                    </Text>
                  </View>
                </View>

                {/* Score */}
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreDetails}>{entry.details}</Text>
                  {entry.bestCatch && (
                    <Text style={styles.bestCatchSpecies}>{entry.bestCatch.species}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Updates */}
        {liveUpdates.length > 0 && (
          <View style={styles.recentUpdatesContainer}>
            <Text style={styles.sectionTitle}>Seneste Godkendelser</Text>
            {liveUpdates.map((update, index) => (
              <View key={`${update.catch.id}-${index}`} style={styles.updateCard}>
                <View style={styles.updateHeader}>
                  {update.catch.user.avatar ? (
                    <Image
                      source={{ uri: update.catch.user.avatar }}
                      style={styles.updateAvatar}
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, styles.updateAvatar]}>
                      <Text style={styles.avatarText}>
                        {update.catch.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.updateInfo}>
                    <Text style={styles.updateUserName}>{update.catch.user.name}</Text>
                    <Text style={styles.updateTime}>
                      {new Date(update.timestamp).toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.approvedBadge}>✓ Godkendt</Text>
                </View>
                <Text style={styles.updateCatchInfo}>
                  {update.catch.species} • {((update.catch.weightKg || 0) * 1000).toFixed(0)}g
                  {update.catch.lengthCm && ` • ${update.catch.lengthCm}cm`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
