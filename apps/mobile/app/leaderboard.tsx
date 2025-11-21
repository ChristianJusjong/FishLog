import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  title: string;
  value: number;
  label: string;
  catchId?: string;
}

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: Category[] = [
  { id: 'total_score', label: 'Total Score', icon: 'trophy' },
  { id: 'single_catch', label: 'Bedste Fangst', icon: 'fish' },
  { id: 'most_catches', label: 'Flest Fangster', icon: 'list' },
  { id: 'longest_fish', label: 'Længste Fisk', icon: 'resize' },
  { id: 'heaviest_fish', label: 'Tungeste Fisk', icon: 'barbell' },
];

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('total_score');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(
        `${API_URL}/leaderboard?category=${selectedCategory}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Alert.alert('Fejl', 'Kunne ikke hente leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.textSecondary;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <PageLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <WeatherLocationCard />

          {/* Title */}
          <View style={styles.header}>
            <Ionicons name="podium" size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Leaderboard
            </Text>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={18}
                    color={isSelected ? colors.white : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isSelected ? colors.white : colors.textPrimary },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Leaderboard List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.leaderboardScroll}
              contentContainerStyle={styles.leaderboardContainer}
              showsVerticalScrollIndicator={false}
            >
              {leaderboard.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="trophy-outline" size={64} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Ingen data tilgængelig
                  </Text>
                </View>
              ) : (
                leaderboard.map((entry) => (
                  <View
                    key={`${entry.userId}-${entry.rank}`}
                    style={[
                      styles.leaderboardItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: entry.rank <= 3 ? getRankColor(entry.rank) : colors.border,
                        borderWidth: entry.rank <= 3 ? 2 : 1,
                      },
                    ]}
                  >
                    {/* Rank */}
                    <View style={styles.rankContainer}>
                      <Text
                        style={[
                          styles.rankText,
                          {
                            color: getRankColor(entry.rank),
                            fontSize: entry.rank <= 3 ? 24 : 18,
                          },
                        ]}
                      >
                        {getRankEmoji(entry.rank)}
                      </Text>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                      <Text style={[styles.username, { color: colors.textPrimary }]}>
                        {entry.username}
                      </Text>
                      <Text style={[styles.userTitle, { color: colors.textSecondary }]}>
                        {entry.title}
                      </Text>
                      <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                        {entry.label}
                      </Text>
                    </View>

                    {/* Level Badge */}
                    <View style={[styles.levelBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.levelText, { color: colors.primary }]}>
                        Lvl {entry.level}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: 28,
    fontWeight: '700',
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  leaderboardScroll: {
    flex: 1,
  },
  leaderboardContainer: {
    padding: SPACING.lg,
    paddingBottom: 120, // Space for bottom navigation
    gap: SPACING.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...TYPOGRAPHY.styles.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userTitle: {
    ...TYPOGRAPHY.styles.small,
    marginBottom: 2,
  },
  valueLabel: {
    ...TYPOGRAPHY.styles.caption,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  levelText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  emptyText: {
    ...TYPOGRAPHY.styles.body,
    marginTop: SPACING.md,
  },
});
