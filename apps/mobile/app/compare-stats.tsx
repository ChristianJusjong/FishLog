import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

interface UserStats {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalCatches: number;
  uniqueSpecies: number;
  catchesThisMonth: number;
  catchesThisYear: number;
  topSpecies: { species: string; count: number }[];
  averages: {
    length: number;
    weight: number;
  };
  records: {
    biggestFish?: {
      species: string;
      lengthCm: number;
      weightKg?: number;
    } | null;
    heaviestFish?: {
      species: string;
      lengthCm?: number;
      weightKg: number;
    } | null;
  };
}

interface ComparisonData {
  currentUser: UserStats;
  friends: UserStats[];
  comparisonMetrics: {
    totalCatches: {
      currentUser: number;
      friends: { name: string; value: number }[];
      rank: number;
    };
    uniqueSpecies: {
      currentUser: number;
      friends: { name: string; value: number }[];
      rank: number;
    };
    catchesThisMonth: {
      currentUser: number;
      friends: { name: string; value: number }[];
      rank: number;
    };
    catchesThisYear: {
      currentUser: number;
      friends: { name: string; value: number }[];
      rank: number;
    };
  };
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      ...TYPOGRAPHY.styles.body,
    },
    scrollContent: {
      padding: SPACING.lg,
    },
    section: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.md,
    },
    sectionTitle: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.xs,
    },
    sectionSubtitle: {
      ...TYPOGRAPHY.styles.small,
      marginBottom: SPACING.md,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
    },
    addFriendsButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
    },
    addFriendsButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
    friendsList: {
      gap: SPACING.sm,
    },
    friendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      gap: SPACING.md,
    },
    friendAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    friendName: {
      ...TYPOGRAPHY.styles.body,
      flex: 1,
    },
    compareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    compareButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    resetButtonText: {
      ...TYPOGRAPHY.styles.button,
    },
    metricCard: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    metricTitle: {
      ...TYPOGRAPHY.styles.h3,
    },
    rankingList: {
      gap: SPACING.sm,
    },
    rankingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    currentUserItem: {
      paddingBottom: SPACING.sm,
      marginBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rankBadge: {
      ...TYPOGRAPHY.styles.h3,
      width: 40,
    },
    rankingName: {
      ...TYPOGRAPHY.styles.body,
      flex: 1,
    },
    rankingValue: {
      ...TYPOGRAPHY.styles.h3,
    },
  });
};

export default function CompareStatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only accepted friends
        const acceptedFriends = data.filter((f: any) => f.status === 'accepted').map((f: any) => ({
          id: f.friend.id,
          name: f.friend.name,
          avatar: f.friend.avatar,
        }));
        setFriends(acceptedFriends);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      Alert.alert('Fejl', 'Kunne ikke hente venner');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      if (selectedFriends.length >= 5) {
        Alert.alert('Maks 5 venner', 'Du kan sammenligne med maksimalt 5 venner ad gangen');
        return;
      }
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const compareStats = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Vælg venner', 'Vælg mindst én ven at sammenligne med');
      return;
    }

    setComparing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/statistics/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendIds: selectedFriends }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke sammenligne statistikker');
      }
    } catch (error) {
      console.error('Failed to compare stats:', error);
      Alert.alert('Fejl', 'Kunne ikke sammenligne statistikker');
    } finally {
      setComparing(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: colors.secondary };
    if (rank === 2) return { icon: '🥈', color: '#C0C0C0' };
    if (rank === 3) return { icon: '🥉', color: '#CD7F32' };
    return { icon: `#${rank}`, color: colors.textSecondary };
  };

  if (loading) {
    return (
      <PageLayout>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <WeatherLocationCard />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Indlæser venner...
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <WeatherLocationCard />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          >

        {/* Friend Selection */}
        {!comparisonData && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Vælg venner at sammenligne med
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Maks 5 venner
            </Text>

            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Du har ingen venner endnu
                </Text>
                <TouchableOpacity
                  style={[styles.addFriendsButton, { backgroundColor: colors.accent }]}
                  onPress={() => router.push('/friends')}
                >
                  <Text style={styles.addFriendsButtonText}>Tilføj Venner</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendItem,
                      { backgroundColor: colors.background },
                      selectedFriends.includes(friend.id) && {
                        backgroundColor: colors.primaryLight + '30',
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => toggleFriendSelection(friend.id)}
                  >
                    {friend.avatar ? (
                      <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    ) : (
                      <View
                        style={[styles.friendAvatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
                      >
                        <Ionicons name="person" size={20} color={colors.white} />
                      </View>
                    )}
                    <Text style={[styles.friendName, { color: colors.textPrimary }]}>
                      {friend.name}
                    </Text>
                    {selectedFriends.includes(friend.id) && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedFriends.length > 0 && (
              <TouchableOpacity
                style={[styles.compareButton, { backgroundColor: colors.accent }]}
                onPress={compareStats}
                disabled={comparing}
              >
                {comparing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="stats-chart" size={20} color={colors.white} />
                    <Text style={styles.compareButtonText}>
                      Sammenlign ({selectedFriends.length})
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Comparison Results */}
        {comparisonData && (
          <>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                setComparisonData(null);
                setSelectedFriends([]);
              }}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
              <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                Ny Sammenligning
              </Text>
            </TouchableOpacity>

            {/* Total Catches Comparison */}
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <View style={styles.metricHeader}>
                <Ionicons name="fish" size={24} color={colors.primary} />
                <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
                  Totale Fangster
                </Text>
              </View>
              <View style={styles.rankingList}>
                <View style={[styles.rankingItem, styles.currentUserItem]}>
                  <Text style={[styles.rankBadge, { color: getRankBadge(comparisonData.comparisonMetrics.totalCatches.rank).color }]}>
                    {getRankBadge(comparisonData.comparisonMetrics.totalCatches.rank).icon}
                  </Text>
                  <Text style={[styles.rankingName, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {comparisonData.currentUser.user.name} (dig)
                  </Text>
                  <Text style={[styles.rankingValue, { color: colors.accent }]}>
                    {comparisonData.comparisonMetrics.totalCatches.currentUser}
                  </Text>
                </View>
                {comparisonData.friends
                  .sort((a, b) => b.totalCatches - a.totalCatches)
                  .map((friend, index) => {
                    const rank = 1 + comparisonData.friends.filter(f => f.totalCatches > friend.totalCatches).length +
                      (comparisonData.currentUser.totalCatches > friend.totalCatches ? 1 : 0);
                    return (
                      <View key={friend.user.id} style={styles.rankingItem}>
                        <Text style={[styles.rankBadge, { color: getRankBadge(rank).color }]}>
                          {getRankBadge(rank).icon}
                        </Text>
                        <Text style={[styles.rankingName, { color: colors.textPrimary }]}>
                          {friend.user.name}
                        </Text>
                        <Text style={[styles.rankingValue, { color: colors.textSecondary }]}>
                          {friend.totalCatches}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* Unique Species */}
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <View style={styles.metricHeader}>
                <Ionicons name="color-filter" size={24} color={colors.secondary} />
                <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
                  Unikke Arter
                </Text>
              </View>
              <View style={styles.rankingList}>
                <View style={[styles.rankingItem, styles.currentUserItem]}>
                  <Text style={[styles.rankBadge, { color: getRankBadge(comparisonData.comparisonMetrics.uniqueSpecies.rank).color }]}>
                    {getRankBadge(comparisonData.comparisonMetrics.uniqueSpecies.rank).icon}
                  </Text>
                  <Text style={[styles.rankingName, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {comparisonData.currentUser.user.name} (dig)
                  </Text>
                  <Text style={[styles.rankingValue, { color: colors.accent }]}>
                    {comparisonData.comparisonMetrics.uniqueSpecies.currentUser}
                  </Text>
                </View>
                {comparisonData.friends
                  .sort((a, b) => b.uniqueSpecies - a.uniqueSpecies)
                  .map((friend) => {
                    const rank = 1 + comparisonData.friends.filter(f => f.uniqueSpecies > friend.uniqueSpecies).length +
                      (comparisonData.currentUser.uniqueSpecies > friend.uniqueSpecies ? 1 : 0);
                    return (
                      <View key={friend.user.id} style={styles.rankingItem}>
                        <Text style={[styles.rankBadge, { color: getRankBadge(rank).color }]}>
                          {getRankBadge(rank).icon}
                        </Text>
                        <Text style={[styles.rankingName, { color: colors.textPrimary }]}>
                          {friend.user.name}
                        </Text>
                        <Text style={[styles.rankingValue, { color: colors.textSecondary }]}>
                          {friend.uniqueSpecies}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* This Month */}
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <View style={styles.metricHeader}>
                <Ionicons name="calendar" size={24} color={colors.accent} />
                <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
                  Fangster Denne Måned
                </Text>
              </View>
              <View style={styles.rankingList}>
                <View style={[styles.rankingItem, styles.currentUserItem]}>
                  <Text style={[styles.rankBadge, { color: getRankBadge(comparisonData.comparisonMetrics.catchesThisMonth.rank).color }]}>
                    {getRankBadge(comparisonData.comparisonMetrics.catchesThisMonth.rank).icon}
                  </Text>
                  <Text style={[styles.rankingName, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {comparisonData.currentUser.user.name} (dig)
                  </Text>
                  <Text style={[styles.rankingValue, { color: colors.accent }]}>
                    {comparisonData.comparisonMetrics.catchesThisMonth.currentUser}
                  </Text>
                </View>
                {comparisonData.friends
                  .sort((a, b) => b.catchesThisMonth - a.catchesThisMonth)
                  .map((friend) => {
                    const rank = 1 + comparisonData.friends.filter(f => f.catchesThisMonth > friend.catchesThisMonth).length +
                      (comparisonData.currentUser.catchesThisMonth > friend.catchesThisMonth ? 1 : 0);
                    return (
                      <View key={friend.user.id} style={styles.rankingItem}>
                        <Text style={[styles.rankBadge, { color: getRankBadge(rank).color }]}>
                          {getRankBadge(rank).icon}
                        </Text>
                        <Text style={[styles.rankingName, { color: colors.textPrimary }]}>
                          {friend.user.name}
                        </Text>
                        <Text style={[styles.rankingValue, { color: colors.textSecondary }]}>
                          {friend.catchesThisMonth}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* This Year */}
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <View style={styles.metricHeader}>
                <Ionicons name="trophy" size={24} color={colors.secondary} />
                <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
                  Fangster Dette År
                </Text>
              </View>
              <View style={styles.rankingList}>
                <View style={[styles.rankingItem, styles.currentUserItem]}>
                  <Text style={[styles.rankBadge, { color: getRankBadge(comparisonData.comparisonMetrics.catchesThisYear.rank).color }]}>
                    {getRankBadge(comparisonData.comparisonMetrics.catchesThisYear.rank).icon}
                  </Text>
                  <Text style={[styles.rankingName, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {comparisonData.currentUser.user.name} (dig)
                  </Text>
                  <Text style={[styles.rankingValue, { color: colors.accent }]}>
                    {comparisonData.comparisonMetrics.catchesThisYear.currentUser}
                  </Text>
                </View>
                {comparisonData.friends
                  .sort((a, b) => b.catchesThisYear - a.catchesThisYear)
                  .map((friend) => {
                    const rank = 1 + comparisonData.friends.filter(f => f.catchesThisYear > friend.catchesThisYear).length +
                      (comparisonData.currentUser.catchesThisYear > friend.catchesThisYear ? 1 : 0);
                    return (
                      <View key={friend.user.id} style={styles.rankingItem}>
                        <Text style={[styles.rankBadge, { color: getRankBadge(rank).color }]}>
                          {getRankBadge(rank).icon}
                        </Text>
                        <Text style={[styles.rankingName, { color: colors.textPrimary }]}>
                          {friend.user.name}
                        </Text>
                        <Text style={[styles.rankingValue, { color: colors.textSecondary }]}>
                          {friend.catchesThisYear}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          </>
        )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}
