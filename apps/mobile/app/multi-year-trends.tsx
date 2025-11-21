import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

const { width } = Dimensions.get('window');

interface YearlyData {
  year: string;
  totalCatches: number;
  uniqueSpecies: number;
  averageLength: number;
  averageWeight: number;
  topSpecies: {
    species: string;
    count: number;
  };
  monthlyDistribution: {
    [month: string]: number;
  };
}

interface Trends {
  totalGrowth: number;
  speciesDiversity: number;
  averageSizeGrowth: number;
  mostActiveMonth: string;
  consistencyScore: number;
}

interface TrendsData {
  years: string[];
  yearlyData: { [year: string]: YearlyData };
  trends: Trends;
  insights: string[];
  totalYears: number;
  overallStats: {
    firstCatch: string;
    latestCatch: string;
    totalCatches: number;
    totalSpecies: number;
  };
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    loadingText: {
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    emptyText: {
      fontSize: 16,
    },
    card: {
      margin: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      ...SHADOWS.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    overallStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    overallStatItem: {
      alignItems: 'center',
      gap: SPACING.xs,
    },
    overallStatValue: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    overallStatLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    trendItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.md,
    },
    trendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    trendLabel: {
      fontSize: 16,
    },
    trendValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      marginVertical: SPACING.xs,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    insightIcon: {
      marginTop: 2,
    },
    insightText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
    },
    yearSelector: {
      marginTop: SPACING.md,
    },
    yearButton: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      marginRight: SPACING.sm,
    },
    yearButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    yearStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    yearStatItem: {
      width: (width - SPACING.md * 2 - SPACING.lg * 2 - SPACING.md) / 2,
      alignItems: 'center',
      padding: SPACING.md,
      gap: SPACING.xs,
    },
    yearStatValue: {
      fontSize: 20,
      fontWeight: '600',
    },
    yearStatLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    topSpeciesContainer: {
      paddingVertical: SPACING.md,
    },
    topSpeciesLabel: {
      fontSize: 12,
      marginBottom: SPACING.sm,
    },
    topSpeciesContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    topSpeciesName: {
      fontSize: 16,
      fontWeight: '600',
    },
    topSpeciesCount: {
      fontSize: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
    },
    monthlyChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 150,
      gap: 2,
    },
    monthBarContainer: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    monthBarWrapper: {
      width: '100%',
      height: 100,
      justifyContent: 'flex-end',
    },
    monthBar: {
      width: '100%',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    monthLabel: {
      fontSize: 10,
      transform: [{ rotate: '-45deg' }],
      width: 30,
    },
    monthCount: {
      fontSize: 10,
      fontWeight: '600',
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: SPACING.md,
      borderBottomWidth: 2,
      borderBottomColor: '#e0e0e0',
    },
    tableHeaderCell: {
      fontWeight: '600',
      fontSize: 14,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: SPACING.md,
    },
    tableCell: {
      fontSize: 14,
    },
    yearColumn: {
      flex: 1.5,
    },
    dataColumn: {
      flex: 1,
      textAlign: 'center',
    },
  });
};

export default function MultiYearTrendsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/statistics/multi-year-trends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }

      const data = await response.json();
      setTrendsData(data);
      if (data.years.length > 0) {
        setSelectedYear(data.years[data.years.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return { icon: 'trending-up' as const, color: '#4CAF50' };
    if (value < 0) return { icon: 'trending-down' as const, color: '#f44336' };
    return { icon: 'remove' as const, color: colors.textSecondary };
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <PageLayout>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <WeatherLocationCard />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Analyserer historik...
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </PageLayout>
    );
  }

  if (!trendsData) {
    return (
      <PageLayout>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <WeatherLocationCard />
            <View style={styles.emptyContainer}>
              <Ionicons name="stats-chart" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ingen data tilgængelig
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </PageLayout>
    );
  }

  const selectedYearData = selectedYear ? trendsData.yearlyData[selectedYear] : null;

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <WeatherLocationCard />

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
        {/* Overall Stats Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Samlet Oversigt
            </Text>
          </View>
          <View style={styles.overallStatsGrid}>
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, { color: colors.accent }]}>
                {trendsData.totalYears}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.textSecondary }]}>
                År med data
              </Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, { color: colors.accent }]}>
                {trendsData.overallStats.totalCatches}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.textSecondary }]}>
                Totale fangster
              </Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, { color: colors.accent }]}>
                {trendsData.overallStats.totalSpecies}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.textSecondary }]}>
                Unikke arter
              </Text>
            </View>
          </View>
        </View>

        {/* Trends Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tendenser</Text>
          </View>

          <View style={styles.trendItem}>
            <View style={styles.trendLeft}>
              <Ionicons
                name={getTrendIcon(trendsData.trends.totalGrowth).icon}
                size={24}
                color={getTrendIcon(trendsData.trends.totalGrowth).color}
              />
              <Text style={[styles.trendLabel, { color: colors.text }]}>
                Fangst Vækst
              </Text>
            </View>
            <Text
              style={[
                styles.trendValue,
                { color: getTrendIcon(trendsData.trends.totalGrowth).color },
              ]}
            >
              {formatPercentage(trendsData.trends.totalGrowth)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.trendItem}>
            <View style={styles.trendLeft}>
              <Ionicons
                name={getTrendIcon(trendsData.trends.speciesDiversity).icon}
                size={24}
                color={getTrendIcon(trendsData.trends.speciesDiversity).color}
              />
              <Text style={[styles.trendLabel, { color: colors.text }]}>
                Arts Diversitet
              </Text>
            </View>
            <Text
              style={[
                styles.trendValue,
                { color: getTrendIcon(trendsData.trends.speciesDiversity).color },
              ]}
            >
              {trendsData.trends.speciesDiversity > 0 ? '+' : ''}
              {trendsData.trends.speciesDiversity} arter
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.trendItem}>
            <View style={styles.trendLeft}>
              <Ionicons
                name={getTrendIcon(trendsData.trends.averageSizeGrowth).icon}
                size={24}
                color={getTrendIcon(trendsData.trends.averageSizeGrowth).color}
              />
              <Text style={[styles.trendLabel, { color: colors.text }]}>
                Gennemsnitlig Størrelse
              </Text>
            </View>
            <Text
              style={[
                styles.trendValue,
                { color: getTrendIcon(trendsData.trends.averageSizeGrowth).color },
              ]}
            >
              {formatPercentage(trendsData.trends.averageSizeGrowth)}
            </Text>
          </View>

          {trendsData.trends.mostActiveMonth && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.trendItem}>
                <View style={styles.trendLeft}>
                  <Ionicons name="flame" size={24} color={colors.secondary} />
                  <Text style={[styles.trendLabel, { color: colors.text }]}>
                    Mest Aktiv Måned
                  </Text>
                </View>
                <Text style={[styles.trendValue, { color: colors.secondary }]}>
                  {trendsData.trends.mostActiveMonth}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Insights Card */}
        {trendsData.insights.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={colors.secondary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Indsigter</Text>
            </View>
            {trendsData.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.accent}
                  style={styles.insightIcon}
                />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Year Selector */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={24} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              År for År Sammenligning
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.yearSelector}
          >
            {trendsData.years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  {
                    backgroundColor:
                      selectedYear === year ? colors.accent : colors.background,
                  },
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    {
                      color: selectedYear === year ? colors.white : colors.text,
                    },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Year Details */}
        {selectedYearData && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {selectedYear} Detaljer
              </Text>
            </View>

            <View style={styles.yearStatsGrid}>
              <View style={styles.yearStatItem}>
                <Ionicons name="fish" size={24} color={colors.accent} />
                <Text style={[styles.yearStatValue, { color: colors.text }]}>
                  {selectedYearData.totalCatches}
                </Text>
                <Text style={[styles.yearStatLabel, { color: colors.textSecondary }]}>
                  Fangster
                </Text>
              </View>

              <View style={styles.yearStatItem}>
                <Ionicons name="list" size={24} color={colors.secondary} />
                <Text style={[styles.yearStatValue, { color: colors.text }]}>
                  {selectedYearData.uniqueSpecies}
                </Text>
                <Text style={[styles.yearStatLabel, { color: colors.textSecondary }]}>
                  Arter
                </Text>
              </View>

              <View style={styles.yearStatItem}>
                <Ionicons name="resize" size={24} color="#4CAF50" />
                <Text style={[styles.yearStatValue, { color: colors.text }]}>
                  {selectedYearData.averageLength.toFixed(1)} cm
                </Text>
                <Text style={[styles.yearStatLabel, { color: colors.textSecondary }]}>
                  Gns. Længde
                </Text>
              </View>

              <View style={styles.yearStatItem}>
                <Ionicons name="speedometer" size={24} color="#FF9800" />
                <Text style={[styles.yearStatValue, { color: colors.text }]}>
                  {selectedYearData.averageWeight.toFixed(2)} kg
                </Text>
                <Text style={[styles.yearStatLabel, { color: colors.textSecondary }]}>
                  Gns. Vægt
                </Text>
              </View>
            </View>

            {selectedYearData.topSpecies && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.topSpeciesContainer}>
                  <Text style={[styles.topSpeciesLabel, { color: colors.textSecondary }]}>
                    Top Art
                  </Text>
                  <View style={styles.topSpeciesContent}>
                    <Ionicons name="trophy" size={20} color={colors.secondary} />
                    <Text style={[styles.topSpeciesName, { color: colors.text }]}>
                      {selectedYearData.topSpecies.species}
                    </Text>
                    <Text style={[styles.topSpeciesCount, { color: colors.textSecondary }]}>
                      ({selectedYearData.topSpecies.count} fangster)
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Monthly Distribution */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Månedlig Fordeling
            </Text>
            <View style={styles.monthlyChart}>
              {Object.entries(selectedYearData.monthlyDistribution).map(
                ([month, count]) => {
                  const maxCount = Math.max(
                    ...Object.values(selectedYearData.monthlyDistribution)
                  );
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <View key={month} style={styles.monthBarContainer}>
                      <View style={styles.monthBarWrapper}>
                        <View
                          style={[
                            styles.monthBar,
                            {
                              height: `${percentage}%`,
                              backgroundColor: colors.accent,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                        {month}
                      </Text>
                      <Text style={[styles.monthCount, { color: colors.text }]}>
                        {count}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        )}

        {/* Year Comparison Table */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={24} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Alle År Sammenligning
            </Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.yearColumn, { color: colors.text }]}>
              År
            </Text>
            <Text style={[styles.tableHeaderCell, styles.dataColumn, { color: colors.text }]}>
              Fangster
            </Text>
            <Text style={[styles.tableHeaderCell, styles.dataColumn, { color: colors.text }]}>
              Arter
            </Text>
            <Text style={[styles.tableHeaderCell, styles.dataColumn, { color: colors.text }]}>
              Gns. Længde
            </Text>
          </View>

          {trendsData.years.map((year, index) => {
            const yearData = trendsData.yearlyData[year];
            return (
              <View
                key={year}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.tableCell, styles.yearColumn, { color: colors.text }]}>
                  {year}
                </Text>
                <Text style={[styles.tableCell, styles.dataColumn, { color: colors.text }]}>
                  {yearData.totalCatches}
                </Text>
                <Text style={[styles.tableCell, styles.dataColumn, { color: colors.text }]}>
                  {yearData.uniqueSpecies}
                </Text>
                <Text style={[styles.tableCell, styles.dataColumn, { color: colors.text }]}>
                  {yearData.averageLength.toFixed(1)} cm
                </Text>
              </View>
            );
          })}
        </View>

          </ScrollView>
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}
