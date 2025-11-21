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
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 2 * SPACING.lg;

// ============ Analytics Interfaces ============
interface AnalyticsData {
  overview: {
    catches: {
      total: number;
      totalWeight: number;
      avgWeight: number;
      biggestCatch: number;
      uniqueSpecies: number;
      releaseRate: number;
    };
    sessions: {
      total: number;
      totalFishingTime: number;
      totalDistance: number;
      catchRate: number;
    };
    insights: {
      bestHour: number;
      bestDay: number;
      topSpecies: Array<{ species: string; count: number }>;
    };
  };
  timeSeries: {
    interval: string;
    data: Array<{ date: string; count: number; weight: number }>;
    trend: {
      direction: string;
      percentage: number;
    };
  };
  goals: Array<{
    id: string;
    goalType: string;
    targetValue: number;
    currentValue: number;
    progress: number;
    targetDate: string;
  }>;
}

// ============ Predictions Interfaces ============
interface PredictionFactors {
  timeOfDay: { hour: number; successRate: number; avgCatches: number }[];
  seasonality: { month: number; successRate: number; avgCatches: number }[];
  weather: { conditions: string; avgCatches: number }[];
  moonPhase: { phase: string; avgCatches: number }[];
  topLocations: { lat: number; lng: number; catchCount: number }[];
  topSpecies: { species: string; bestTime: string; bestMonth: number }[];
}

interface Prediction {
  confidence: number;
  recommendation: string;
  bestTimeToday: { hour: number; description: string };
  bestDaysThisWeek: string[];
  topSpeciesPredictions: { species: string; likelihood: number }[];
  factors: PredictionFactors;
  aiInsights: string[];
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    activeTabText: {
      color: colors.primary,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    // Analytics styles
    section: {
      backgroundColor: colors.surface,
      marginTop: SPACING.sm,
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
    },
    sectionAction: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -SPACING.sm,
    },
    statBox: {
      width: '50%',
      padding: SPACING.sm,
      marginBottom: SPACING.md,
    },
    statCard: {
      backgroundColor: colors.background,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
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
      textAlign: 'center',
    },
    chartContainer: {
      alignItems: 'center',
      marginVertical: SPACING.md,
    },
    insightCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    insightIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    insightText: {
      flex: 1,
    },
    insightTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    insightSubtitle: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    goalCard: {
      backgroundColor: colors.background,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    goalTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      color: colors.text,
    },
    goalProgress: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: RADIUS.full,
      overflow: 'hidden',
      marginBottom: SPACING.xs,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: RADIUS.full,
    },
    goalMeta: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.success + '20',
      marginTop: SPACING.sm,
    },
    trendText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.success,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: SPACING.xs,
    },
    periodSelector: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    periodButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
    },
    periodButtonTextActive: {
      color: '#FFFFFF',
    },
    // Predictions styles
    content: {
      padding: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    confidenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    confidenceCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    confidenceScore: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    confidenceLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    confidenceInfo: {
      flex: 1,
    },
    confidenceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    confidenceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    recommendationText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    timeContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    timeHour: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
    },
    timeDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dayChip: {
      backgroundColor: colors.primaryLight,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    dayText: {
      color: colors.primary,
      fontWeight: '600',
    },
    speciesItem: {
      marginBottom: 12,
    },
    speciesName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    likelihoodContainer: {
      height: 24,
      backgroundColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    likelihoodBar: {
      height: '100%',
      backgroundColor: colors.secondary,
      borderRadius: 12,
    },
    likelihoodText: {
      position: 'absolute',
      right: 8,
      top: 2,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    predictionInsightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    predictionInsightText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      lineHeight: 20,
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statItemLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    statItemValue: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
};

export default function Analytics() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [activeTab, setActiveTab] = useState<'analytics' | 'predictions'>('analytics');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Predictions state
  const [predictions, setPredictions] = useState<Prediction | null>(null);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else {
      fetchPredictions();
    }
  }, [period, activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();

      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const [overviewRes, timeSeriesRes, goalsRes] = await Promise.all([
        api.get(`/premium/analytics/overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/premium/analytics/time-series?interval=${period === 'week' ? 'day' : period === 'month' ? 'week' : 'month'}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get('/premium/analytics/goals'),
      ]);

      setAnalytics({
        overview: overviewRes.data,
        timeSeries: timeSeriesRes.data,
        goals: goalsRes.data.goals || [],
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Kunne ikke hente analyser');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/predictions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPredictions(response.data.predictions);
      }
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
      setError(err.response?.data?.error || 'Kunne ikke hente forudsigelser');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else {
      fetchPredictions();
    }
  };

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(${hexToRgb(colors.primary)}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fill: colors.textSecondary,
    },
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      total_catches: 'Total fangster',
      species_diversity: 'Artsdiversitet',
      total_weight: 'Total vægt',
      biggest_fish: 'Største fisk',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return '#10b981';
    if (confidence >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'December'
    ];
    return months[month];
  };

  if (loading) {
    return (
      <PageLayout>
        <View style={styles.container}>
          <WeatherLocationCard />

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
              onPress={() => setActiveTab('analytics')}
            >
              <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
                Analyse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'predictions' && styles.activeTab]}
              onPress={() => setActiveTab('predictions')}
            >
              <Text style={[styles.tabText, activeTab === 'predictions' && styles.activeTabText]}>
                Forudsigelser
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {activeTab === 'analytics' ? 'Indlæser analyser...' : 'Analyserer dine fangstmønstre...'}
            </Text>
          </View>
        </View>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <View style={styles.container}>
          <WeatherLocationCard />

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
              onPress={() => setActiveTab('analytics')}
            >
              <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
                Analyse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'predictions' && styles.activeTab]}
              onPress={() => setActiveTab('predictions')}
            >
              <Text style={[styles.tabText, activeTab === 'predictions' && styles.activeTabText]}>
                Forudsigelser
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loader}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={activeTab === 'analytics' ? fetchAnalytics : fetchPredictions}
            >
              <Text style={styles.retryButtonText}>Prøv igen</Text>
            </Pressable>
          </View>
        </View>
      </PageLayout>
    );
  }

  const hasTimeSeriesData = analytics && analytics.timeSeries.data.length > 0;
  const timeSeriesData = hasTimeSeriesData ? {
    labels: analytics!.timeSeries.data.slice(-7).map(d => formatDate(d.date)),
    datasets: [
      {
        data: analytics!.timeSeries.data.slice(-7).map(d => d.count || 0),
      },
    ],
  } : {
    labels: ['', '', '', '', '', '', ''],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  };

  const speciesData = analytics && analytics.overview.insights.topSpecies.slice(0, 5).map((species, index) => ({
    name: species.species,
    population: species.count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index],
    legendFontColor: colors.text,
    legendFontSize: 12,
  })) || [];

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          <WeatherLocationCard />

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analyse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'predictions' && styles.activeTab]}
          onPress={() => setActiveTab('predictions')}
        >
          <Text style={[styles.tabText, activeTab === 'predictions' && styles.activeTabText]}>
            Forudsigelser
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Period Selector */}
          <View style={styles.section}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
                onPress={() => setPeriod('week')}
              >
                <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
                  Uge
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
                onPress={() => setPeriod('month')}
              >
                <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
                  Måned
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
                onPress={() => setPeriod('year')}
              >
                <Text style={[styles.periodButtonText, period === 'year' && styles.periodButtonTextActive]}>
                  År
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Overview Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Oversigt</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analytics.overview.catches.total}</Text>
                  <Text style={styles.statLabel}>Fangster</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{(analytics.overview.catches.totalWeight || 0).toFixed(1)}kg</Text>
                  <Text style={styles.statLabel}>Total vægt</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analytics.overview.catches.uniqueSpecies}</Text>
                  <Text style={styles.statLabel}>Arter</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{(analytics.overview.catches.releaseRate || 0).toFixed(0)}%</Text>
                  <Text style={styles.statLabel}>Genudsatte</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analytics.overview.sessions.total}</Text>
                  <Text style={styles.statLabel}>Fisketure</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analytics.overview.sessions.catchRate || 0}</Text>
                  <Text style={styles.statLabel}>Fangster/time</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Trend Chart */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trend</Text>
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={timeSeriesData}
                width={CHART_WIDTH}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  borderRadius: RADIUS.lg,
                }}
              />
            </View>
            {analytics.timeSeries.trend.direction !== 'stable' && (
              <View style={[styles.trendBadge, analytics.timeSeries.trend.direction === 'decreasing' && { backgroundColor: colors.error + '20' }]}>
                <Ionicons
                  name={analytics.timeSeries.trend.direction === 'increasing' ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={analytics.timeSeries.trend.direction === 'increasing' ? colors.success : colors.error}
                />
                <Text style={[styles.trendText, analytics.timeSeries.trend.direction === 'decreasing' && { color: colors.error }]}>
                  {analytics.timeSeries.trend.direction === 'increasing' ? '+' : '-'}{analytics.timeSeries.trend.percentage || 0}%
                </Text>
              </View>
            )}
          </View>

          {/* Species Breakdown */}
          {speciesData.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top arter</Text>
              </View>
              <View style={styles.chartContainer}>
                <PieChart
                  data={speciesData}
                  width={CHART_WIDTH}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                />
              </View>
            </View>
          )}

          {/* Insights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Indsigter</Text>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Bedste tidspunkt</Text>
                <Text style={styles.insightSubtitle}>
                  Kl. {analytics.overview.insights.bestHour}:00 er din mest produktive time
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Bedste dag</Text>
                <Text style={styles.insightSubtitle}>
                  {['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][analytics.overview.insights.bestDay]} er din mest succesfulde dag
                </Text>
              </View>
            </View>
            {analytics.overview.insights.topSpecies[0] && (
              <View style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Ionicons name="fish" size={20} color={colors.primary} />
                </View>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Favoritart</Text>
                  <Text style={styles.insightSubtitle}>
                    {analytics.overview.insights.topSpecies[0].species} med {analytics.overview.insights.topSpecies[0].count} fangster
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Goals */}
          {analytics.goals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mål</Text>
                <TouchableOpacity onPress={() => router.push('/goals')}>
                  <Text style={styles.sectionAction}>Se alle</Text>
                </TouchableOpacity>
              </View>
              {analytics.goals.slice(0, 3).map(goal => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{getGoalTypeLabel(goal.goalType)}</Text>
                    <Text style={styles.goalProgress}>{(goal.progress || 0).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(goal.progress || 0, 100)}%` }]} />
                  </View>
                  <Text style={styles.goalMeta}>
                    {goal.currentValue || 0} / {goal.targetValue || 0} • Deadline: {formatDate(goal.targetDate)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && predictions && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Confidence Score */}
          <View style={styles.card}>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceCircle}>
                <Text
                  style={[
                    styles.confidenceScore,
                    { color: getConfidenceColor(predictions.confidence) },
                  ]}
                >
                  {predictions.confidence}%
                </Text>
                <Text style={styles.confidenceLabel}>Tillid</Text>
              </View>
              <View style={styles.confidenceInfo}>
                <Text style={styles.confidenceTitle}>Forudsigelseskvalitet</Text>
                <Text style={styles.confidenceDescription}>
                  {predictions.confidence >= 70
                    ? 'Høj tillid baseret på dine historiske data'
                    : predictions.confidence >= 40
                    ? 'Moderat tillid - log flere fangster for bedre forudsigelser'
                    : 'Lav tillid - fortsæt med at logge dine fangster'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={colors.secondary} />
              <Text style={styles.cardTitle}>Anbefaling</Text>
            </View>
            <Text style={styles.recommendationText}>{predictions.recommendation}</Text>
          </View>

          {/* Best Time Today */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Bedste tid i dag</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeHour}>{predictions.bestTimeToday.hour}:00</Text>
              <Text style={styles.timeDescription}>
                {predictions.bestTimeToday.description}
              </Text>
            </View>
          </View>

          {/* Best Days This Week */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color={colors.success} />
              <Text style={styles.cardTitle}>Bedste dage denne uge</Text>
            </View>
            <View style={styles.daysContainer}>
              {predictions.bestDaysThisWeek.map((day, index) => (
                <View key={index} style={styles.dayChip}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Species Predictions */}
          {predictions.topSpeciesPredictions.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="fish" size={24} color={colors.secondary} />
                <Text style={styles.cardTitle}>Top arter at fange</Text>
              </View>
              {predictions.topSpeciesPredictions.map((sp, index) => (
                <View key={index} style={styles.speciesItem}>
                  <Text style={styles.speciesName}>{sp.species}</Text>
                  <View style={styles.likelihoodContainer}>
                    <View
                      style={[
                        styles.likelihoodBar,
                        { width: `${sp.likelihood}%` },
                      ]}
                    />
                    <Text style={styles.likelihoodText}>{sp.likelihood}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* AI Insights */}
          {predictions.aiInsights.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={24} color={colors.secondary} />
                <Text style={styles.cardTitle}>AI Indsigter</Text>
              </View>
              {predictions.aiInsights.map((insight, index) => (
                <View key={index} style={styles.predictionInsightItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.predictionInsightText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Time of Day Stats */}
          {predictions.factors.timeOfDay.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sunny" size={24} color={colors.secondary} />
                <Text style={styles.cardTitle}>Bedste tidspunkter</Text>
              </View>
              {predictions.factors.timeOfDay.slice(0, 5).map((time, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statItemLabel}>{time.hour}:00</Text>
                  <Text style={styles.statItemValue}>
                    {time.avgCatches} fangster ({time.successRate.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Seasonality */}
          {predictions.factors.seasonality.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="leaf" size={24} color={colors.success} />
                <Text style={styles.cardTitle}>Bedste måneder</Text>
              </View>
              {predictions.factors.seasonality.slice(0, 3).map((season, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statItemLabel}>{getMonthName(season.month)}</Text>
                  <Text style={styles.statItemValue}>
                    {season.avgCatches} fangster ({season.successRate.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Weather */}
          {predictions.factors.weather.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="cloud" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Bedste vejrforhold</Text>
              </View>
              {predictions.factors.weather.map((w, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statItemLabel}>{w.conditions}</Text>
                  <Text style={styles.statItemValue}>{w.avgCatches} fangster</Text>
                </View>
              ))}
            </View>
          )}

          {/* Moon Phase */}
          {predictions.factors.moonPhase.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="moon" size={24} color={colors.accent} />
                <Text style={styles.cardTitle}>Bedste månefaser</Text>
              </View>
              {predictions.factors.moonPhase.map((moon, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statItemLabel}>{moon.phase}</Text>
                  <Text style={styles.statItemValue}>{moon.avgCatches} fangster</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}
