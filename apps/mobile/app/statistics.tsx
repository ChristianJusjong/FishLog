import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { API_URL } from '../config/api';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

const screenWidth = Dimensions.get('window').width;

interface SpeciesData {
  species: string;
  count: number;
}

interface Record {
  species: string;
  lengthCm?: number;
  weightKg?: number;
  date: string;
}

interface Overview {
  totalCatches: number;
  speciesBreakdown: SpeciesData[];
  records: {
    biggest: Record | null;
    heaviest: Record | null;
  };
  averages: {
    length: number;
    weight: number;
  };
}

interface TimelineData {
  period: string;
  daily: { date: string; count: number }[];
  monthly: { month: string; count: number }[];
  totalInPeriod: number;
}

interface PersonalBest {
  id: string;
  species: string;
  category: string;
  value: number;
  unit: string;
  date: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface StreaksData {
  currentStreak: number;
  longestStreak: number;
  totalFishingDays: number;
  achievements: Achievement[];
  stats: {
    totalAchievements: number;
    unlockedAchievements: number;
    completionRate: number;
  };
}

interface PatternsData {
  bestTimes: { hour: number; count: number; timeRange: string; percentage: number }[];
  bestBaits: { bait: string; count: number; percentage: number }[];
  bestTechniques: { technique: string; count: number; percentage: number }[];
  seasonalPatterns: { month: string; count: number; uniqueSpecies: number; percentage: number }[];
  locationHotspots: { latitude: number; longitude: number; count: number; percentage: number }[];
  insights: string[];
  totalAnalyzed: number;
}

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
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
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
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    scrollContent: {
      padding: SPACING.lg,
      paddingBottom: 100,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      ...SHADOWS.md,
    },
    statValue: {
      fontSize: 32,
      fontWeight: '700',
      marginTop: SPACING.sm,
    },
    statLabel: {
      fontSize: 12,
      marginTop: SPACING.xs,
    },
    compareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
      gap: SPACING.sm,
      ...SHADOWS.sm,
    },
    compareButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
    section: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    recordCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
    },
    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    recordTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    recordSpecies: {
      fontSize: 18,
      fontWeight: '700',
      marginVertical: SPACING.xs,
    },
    recordValue: {
      fontSize: 24,
      fontWeight: '700',
    },
    recordDetail: {
      fontSize: 14,
      marginTop: SPACING.xs,
    },
    recordDate: {
      fontSize: 12,
      marginTop: SPACING.xs,
    },
    periodSelector: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    periodButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    periodButtonActive: {
      borderWidth: 0,
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    chart: {
      marginVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
    },
    emptyChart: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },
    speciesList: {
      marginTop: SPACING.md,
    },
    speciesItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
    },
    speciesColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: SPACING.sm,
    },
    speciesName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    speciesCount: {
      fontSize: 14,
    },
    categorySelector: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    categoryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
    },
    categoryButtonActive: {
      borderWidth: 0,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    bestsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    bestCard: {
      width: '48%',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
    },
    bestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    bestSpecies: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    bestValue: {
      fontSize: 20,
      fontWeight: '700',
      marginVertical: SPACING.xs,
    },
    bestDate: {
      fontSize: 11,
    },
    emptyBests: {
      width: '100%',
      padding: SPACING.xl,
      alignItems: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    streaksGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    streakCard: {
      flex: 1,
      minWidth: '30%',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      ...SHADOWS.md,
    },
    streakValue: {
      fontSize: 32,
      fontWeight: '700',
      marginTop: SPACING.sm,
    },
    streakLabel: {
      fontSize: 12,
      marginTop: SPACING.xs,
      textAlign: 'center',
    },
    achievementStats: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    achievementStatsText: {
      fontSize: 14,
      fontWeight: '600',
    },
    achievementCompletion: {
      fontSize: 14,
      fontWeight: '700',
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
    },
    achievementCard: {
      width: '48%',
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      ...SHADOWS.sm,
    },
    achievementCardLocked: {
      opacity: 0.6,
    },
    achievementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.sm,
    },
    achievementIcon: {
      fontSize: 32,
    },
    unlockedBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    achievementName: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    achievementDescription: {
      fontSize: 12,
      marginBottom: SPACING.sm,
      lineHeight: 16,
    },
    progressContainer: {
      marginTop: SPACING.xs,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: SPACING.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontSize: 10,
      textAlign: 'center',
    },
    insightCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    patternItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    patternItemLeft: {
      flex: 1,
    },
    patternItemTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: SPACING.xs,
    },
    patternItemCount: {
      fontSize: 12,
    },
    percentageBadge: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      marginLeft: SPACING.md,
    },
    percentageText: {
      fontSize: 14,
      fontWeight: '700',
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginTop: SPACING.md,
      ...SHADOWS.sm,
    },
    summaryText: {
      fontSize: 13,
      fontStyle: 'italic',
    },
  });
};

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'statistics' | 'streaks' | 'patterns'>('statistics');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [bestsCategory, setBestsCategory] = useState<'length' | 'weight'>('length');
  const [streaksData, setStreaksData] = useState<StreaksData | null>(null);
  const [patternsData, setPatternsData] = useState<PatternsData | null>(null);

  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchStatistics();
      fetchPersonalBests();
    } else if (activeTab === 'streaks') {
      fetchStreaks();
    } else {
      fetchPatterns();
    }
  }, [selectedPeriod, activeTab]);

  const fetchStatistics = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Fetch overview
      const overviewRes = await fetch(`${API_URL}/statistics/overview`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      // Fetch timeline
      const timelineRes = await fetch(`${API_URL}/statistics/timeline?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (overviewRes.ok && timelineRes.ok) {
        const overviewData = await overviewRes.json();
        const timelineData = await timelineRes.json();
        setOverview(overviewData);
        setTimeline(timelineData);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPersonalBests = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/personal-bests`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPersonalBests(data);
      }
    } catch (error) {
      console.error('Failed to fetch personal bests:', error);
    }
  };

  const fetchStreaks = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/statistics/streaks`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStreaksData(data);
      }
    } catch (error) {
      console.error('Failed to fetch streaks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPatterns = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/statistics/patterns`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPatternsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'statistics') {
      fetchStatistics();
      fetchPersonalBests();
    } else if (activeTab === 'streaks') {
      fetchStreaks();
    } else {
      fetchPatterns();
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Indlæser statistik...</Text>
      </View>
    );
  }

  if (activeTab === 'statistics' && (!overview || !timeline)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Ingen data tilgængelig</Text>
      </View>
    );
  }

  // Prepare chart data
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(232, 119, 61, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: RADIUS.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.accent,
    },
  };

  // Timeline chart data
  const timelineChartData = {
    labels: selectedPeriod === 'week'
      ? timeline.daily.slice(-7).map(d => new Date(d.date).getDate().toString())
      : timeline.monthly.slice(-6).map(m => m.month.split('-')[1]),
    datasets: [{
      data: selectedPeriod === 'week'
        ? timeline.daily.slice(-7).map(d => d.count)
        : timeline.monthly.slice(-6).map(m => m.count),
    }],
  };

  // Species pie chart data
  const pieChartData = overview.speciesBreakdown.slice(0, 5).map((item, index) => ({
    name: item.species,
    population: item.count,
    color: [
      colors.accent,    // warm orange
      colors.primary,   // deep forest green
      '#10B981',        // green
      '#F59E0B',        // amber
      '#8B5CF6',        // purple
    ][index] || '#6B7280',
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <PageLayout>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <WeatherLocationCard showLocation={true} showWeather={true} />

        {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'statistics' && styles.tabActive,
            { borderBottomColor: colors.accent },
          ]}
          onPress={() => setActiveTab('statistics')}
        >
          <Ionicons
            name="bar-chart"
            size={18}
            color={activeTab === 'statistics' ? colors.accent : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'statistics' ? colors.accent : colors.textSecondary },
          ]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'streaks' && styles.tabActive,
            { borderBottomColor: colors.accent },
          ]}
          onPress={() => setActiveTab('streaks')}
        >
          <Ionicons
            name="flame"
            size={18}
            color={activeTab === 'streaks' ? colors.accent : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'streaks' ? colors.accent : colors.textSecondary },
          ]}>
            Streaks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'patterns' && styles.tabActive,
            { borderBottomColor: colors.accent },
          ]}
          onPress={() => setActiveTab('patterns')}
        >
          <Ionicons
            name="analytics"
            size={18}
            color={activeTab === 'patterns' ? colors.accent : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'patterns' ? colors.accent : colors.textSecondary },
          ]}>
            Mønstre
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'statistics' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="fish" size={32} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{overview.totalCatches}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fangster</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="color-filter" size={32} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{overview.speciesBreakdown.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Arter</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="resize" size={32} color="#10B981" />
            <Text style={[styles.statValue, { color: colors.text }]}>{overview.averages.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gns. cm</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="scale" size={32} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(overview.averages.weight * 1000)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gns. g</Text>
          </View>
        </View>

        {/* Personal Records */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personlige Rekorder</Text>
          </View>

          {overview.records.biggest && (
            <View style={[styles.recordCard, { backgroundColor: colors.background }]}>
              <View style={styles.recordHeader}>
                <Ionicons name="resize-outline" size={20} color={colors.primary} />
                <Text style={[styles.recordTitle, { color: colors.text }]}>Største Fisk</Text>
              </View>
              <Text style={[styles.recordSpecies, { color: colors.text }]}>{overview.records.biggest.species}</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>{overview.records.biggest.lengthCm} cm</Text>
              {overview.records.biggest.weightKg && (
                <Text style={[styles.recordDetail, { color: colors.textSecondary }]}>
                  {Math.round(overview.records.biggest.weightKg * 1000)} g
                </Text>
              )}
              <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                {new Date(overview.records.biggest.date).toLocaleDateString('da-DK')}
              </Text>
            </View>
          )}

          {overview.records.heaviest && (
            <View style={[styles.recordCard, { backgroundColor: colors.background }]}>
              <View style={styles.recordHeader}>
                <Ionicons name="scale-outline" size={20} color={colors.accent} />
                <Text style={[styles.recordTitle, { color: colors.text }]}>Tungeste Fisk</Text>
              </View>
              <Text style={[styles.recordSpecies, { color: colors.text }]}>{overview.records.heaviest.species}</Text>
              <Text style={[styles.recordValue, { color: colors.accent }]}>
                {Math.round(overview.records.heaviest.weightKg! * 1000)} g
              </Text>
              {overview.records.heaviest.lengthCm && (
                <Text style={[styles.recordDetail, { color: colors.textSecondary }]}>
                  {overview.records.heaviest.lengthCm} cm
                </Text>
              )}
              <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                {new Date(overview.records.heaviest.date).toLocaleDateString('da-DK')}
              </Text>
            </View>
          )}
        </View>

        {/* Personal Bests by Species */}
        {personalBests.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mine Rekorder pr. Art</Text>
            </View>

            <View style={styles.categorySelector}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  bestsCategory === 'length' && styles.categoryButtonActive,
                  { borderColor: colors.border },
                  bestsCategory === 'length' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setBestsCategory('length')}
              >
                <Ionicons
                  name="resize"
                  size={18}
                  color={bestsCategory === 'length' ? colors.white : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryButtonText,
                  { color: bestsCategory === 'length' ? colors.white : colors.textSecondary },
                ]}>
                  Længde
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  bestsCategory === 'weight' && styles.categoryButtonActive,
                  { borderColor: colors.border },
                  bestsCategory === 'weight' && { backgroundColor: colors.accent },
                ]}
                onPress={() => setBestsCategory('weight')}
              >
                <Ionicons
                  name="scale"
                  size={18}
                  color={bestsCategory === 'weight' ? colors.white : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryButtonText,
                  { color: bestsCategory === 'weight' ? colors.white : colors.textSecondary },
                ]}>
                  Vægt
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bestsGrid}>
              {personalBests
                .filter(pb => pb.category === bestsCategory)
                .map((pb) => (
                  <View key={pb.id} style={[styles.bestCard, { backgroundColor: colors.background }]}>
                    <View style={styles.bestHeader}>
                      <Ionicons
                        name={bestsCategory === 'length' ? 'resize' : 'scale'}
                        size={20}
                        color={bestsCategory === 'length' ? colors.primary : colors.accent}
                      />
                      <Text style={[styles.bestSpecies, { color: colors.text }]} numberOfLines={1}>
                        {pb.species}
                      </Text>
                    </View>
                    <Text style={[
                      styles.bestValue,
                      { color: bestsCategory === 'length' ? colors.primary : colors.accent }
                    ]}>
                      {bestsCategory === 'length' ? `${pb.value} ${pb.unit}` : `${Math.round(pb.value * 1000)} g`}
                    </Text>
                    <Text style={[styles.bestDate, { color: colors.textSecondary }]}>
                      {new Date(pb.date).toLocaleDateString('da-DK')}
                    </Text>
                  </View>
                ))}
              {personalBests.filter(pb => pb.category === bestsCategory).length === 0 && (
                <View style={styles.emptyBests}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Ingen rekorder i denne kategori
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Timeline Chart */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fangster Over Tid</Text>
          </View>

          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive,
                { borderColor: colors.border },
                selectedPeriod === 'week' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === 'week' ? colors.white : colors.textSecondary },
              ]}>
                Uge
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
                { borderColor: colors.border },
                selectedPeriod === 'month' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === 'month' ? colors.white : colors.textSecondary },
              ]}>
                Måned
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'year' && styles.periodButtonActive,
                { borderColor: colors.border },
                selectedPeriod === 'year' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setSelectedPeriod('year')}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === 'year' ? colors.white : colors.textSecondary },
              ]}>
                År
              </Text>
            </TouchableOpacity>
          </View>

          {timelineChartData.datasets[0].data.length > 0 ? (
            <LineChart
              data={timelineChartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ingen data for denne periode
              </Text>
            </View>
          )}
        </View>

        {/* Species Breakdown */}
        {pieChartData.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Arter Fordeling</Text>
            </View>

            <PieChart
              data={pieChartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />

            <View style={styles.speciesList}>
              {overview.speciesBreakdown.slice(0, 5).map((item, index) => (
                <View key={item.species} style={styles.speciesItem}>
                  <View style={[styles.speciesColor, { backgroundColor: pieChartData[index]?.color }]} />
                  <Text style={[styles.speciesName, { color: colors.text }]}>{item.species}</Text>
                  <Text style={[styles.speciesCount, { color: colors.textSecondary }]}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </ScrollView>
      ) : activeTab === 'streaks' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Streaks Section */}
          {streaksData && (
            <>
              <View style={styles.streaksGrid}>
                <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="flame" size={32} color="#F59E0B" />
                  <Text style={[styles.streakValue, { color: colors.text }]}>{streaksData.currentStreak}</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Nuværende Streak</Text>
                </View>

                <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="trophy" size={32} color={colors.accent} />
                  <Text style={[styles.streakValue, { color: colors.text }]}>{streaksData.longestStreak}</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Længste Streak</Text>
                </View>

                <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="calendar" size={32} color={colors.primary} />
                  <Text style={[styles.streakValue, { color: colors.text }]}>{streaksData.totalFishingDays}</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Fiskedage</Text>
                </View>
              </View>

              {/* Achievements Section */}
              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="ribbon" size={24} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
                </View>

                <View style={[styles.achievementStats, { backgroundColor: colors.background }]}>
                  <Text style={[styles.achievementStatsText, { color: colors.text }]}>
                    {streaksData.stats.unlockedAchievements} / {streaksData.stats.totalAchievements} Unlocked
                  </Text>
                  <Text style={[styles.achievementCompletion, { color: colors.accent }]}>
                    {streaksData.stats.completionRate}% Complete
                  </Text>
                </View>

                <View style={styles.achievementsGrid}>
                  {streaksData.achievements.map((achievement) => (
                    <View
                      key={achievement.id}
                      style={[
                        styles.achievementCard,
                        { backgroundColor: colors.background },
                        !achievement.unlocked && styles.achievementCardLocked,
                      ]}
                    >
                      <View style={styles.achievementHeader}>
                        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                        {achievement.unlocked && (
                          <View style={[styles.unlockedBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.achievementName, { color: colors.text }]}>
                        {achievement.name}
                      </Text>
                      <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                        {achievement.description}
                      </Text>
                      {!achievement.unlocked && (
                        <View style={styles.progressContainer}>
                          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  backgroundColor: colors.accent,
                                  width: `${(achievement.progress / achievement.target) * 100}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {achievement.progress} / {achievement.target}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      ) : activeTab === 'patterns' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {patternsData && (
            <>
              {/* Insights Section */}
              {patternsData.insights.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Indsigter</Text>
                  </View>
                  {patternsData.insights.map((insight, index) => (
                    <View key={index} style={[styles.insightCard, { backgroundColor: colors.background }]}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Best Times */}
              {patternsData.bestTimes.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="time" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bedste Tidspunkter</Text>
                  </View>
                  {patternsData.bestTimes.map((time, index) => (
                    <View key={index} style={[styles.patternItem, { backgroundColor: colors.background }]}>
                      <View style={styles.patternItemLeft}>
                        <Text style={[styles.patternItemTitle, { color: colors.text }]}>{time.timeRange}</Text>
                        <Text style={[styles.patternItemCount, { color: colors.textSecondary }]}>
                          {time.count} fangster
                        </Text>
                      </View>
                      <View style={[styles.percentageBadge, { backgroundColor: colors.primaryLight + '30' }]}>
                        <Text style={[styles.percentageText, { color: colors.primary }]}>{time.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Best Baits */}
              {patternsData.bestBaits.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bug" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Mest Effektive Agn</Text>
                  </View>
                  {patternsData.bestBaits.map((bait, index) => (
                    <View key={index} style={[styles.patternItem, { backgroundColor: colors.background }]}>
                      <View style={styles.patternItemLeft}>
                        <Text style={[styles.patternItemTitle, { color: colors.text }]}>{bait.bait}</Text>
                        <Text style={[styles.patternItemCount, { color: colors.textSecondary }]}>
                          {bait.count} fangster
                        </Text>
                      </View>
                      <View style={[styles.percentageBadge, { backgroundColor: colors.primaryLight + '30' }]}>
                        <Text style={[styles.percentageText, { color: colors.primary }]}>{bait.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Best Techniques */}
              {patternsData.bestTechniques.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="settings" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Mest Effektive Teknikker</Text>
                  </View>
                  {patternsData.bestTechniques.map((technique, index) => (
                    <View key={index} style={[styles.patternItem, { backgroundColor: colors.background }]}>
                      <View style={styles.patternItemLeft}>
                        <Text style={[styles.patternItemTitle, { color: colors.text }]}>{technique.technique}</Text>
                        <Text style={[styles.patternItemCount, { color: colors.textSecondary }]}>
                          {technique.count} fangster
                        </Text>
                      </View>
                      <View style={[styles.percentageBadge, { backgroundColor: colors.primaryLight + '30' }]}>
                        <Text style={[styles.percentageText, { color: colors.primary }]}>{technique.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Seasonal Patterns */}
              {patternsData.seasonalPatterns.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="calendar" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Sæsonmønstre</Text>
                  </View>
                  {patternsData.seasonalPatterns.map((pattern, index) => (
                    <View key={index} style={[styles.patternItem, { backgroundColor: colors.background }]}>
                      <View style={styles.patternItemLeft}>
                        <Text style={[styles.patternItemTitle, { color: colors.text }]}>
                          {pattern.month.charAt(0).toUpperCase() + pattern.month.slice(1)}
                        </Text>
                        <Text style={[styles.patternItemCount, { color: colors.textSecondary }]}>
                          {pattern.count} fangster · {pattern.uniqueSpecies} arter
                        </Text>
                      </View>
                      <View style={[styles.percentageBadge, { backgroundColor: colors.primaryLight + '30' }]}>
                        <Text style={[styles.percentageText, { color: colors.primary }]}>{pattern.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Location Hotspots */}
              {patternsData.locationHotspots.length > 0 && (
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={24} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Lokationer</Text>
                  </View>
                  {patternsData.locationHotspots.map((location, index) => (
                    <View key={index} style={[styles.patternItem, { backgroundColor: colors.background }]}>
                      <View style={styles.patternItemLeft}>
                        <Text style={[styles.patternItemTitle, { color: colors.text }]}>
                          {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                        </Text>
                        <Text style={[styles.patternItemCount, { color: colors.textSecondary }]}>
                          {location.count} fangster
                        </Text>
                      </View>
                      <View style={[styles.percentageBadge, { backgroundColor: colors.primaryLight + '30' }]}>
                        <Text style={[styles.percentageText, { color: colors.primary }]}>{location.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="information-circle" size={20} color={colors.textSecondary} />
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  Analyse baseret på {patternsData.totalAnalyzed} fangster
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      ) : null}
      </View>
    </PageLayout>
  );
}
