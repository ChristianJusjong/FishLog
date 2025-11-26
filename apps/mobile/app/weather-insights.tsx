import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';
import PageLayout from '../components/PageLayout';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

// Import fishing gear data for weather-based recommendations
import {
  LURE_TYPES,
  TECHNIQUES,
  type LureType,
  type TechniqueType,
} from '../data/fishingGear';

interface WeatherCategory {
  best: {
    value: string;
    label: string;
    count: number;
    percentage: number;
    avgWeight?: number | null;
    avgLength?: number | null;
  } | null;
  data: Array<{
    value: string;
    label: string;
    count: number;
    percentage: number;
    avgWeight?: number | null;
    avgLength?: number | null;
    tempRange?: string;
    pressureRange?: string;
  }>;
}

interface WeatherAnalytics {
  success: boolean;
  hasData: boolean;
  message?: string;
  totalCatchesAnalyzed: number;
  windDirection: WeatherCategory;
  moonPhase: WeatherCategory;
  conditions: WeatherCategory;
  temperature: WeatherCategory;
  pressure: WeatherCategory;
  tideState: WeatherCategory;
  insights: string[];
}

export default function WeatherInsightsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<WeatherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Generate gear recommendations based on weather analytics
  const weatherGearTips = React.useMemo(() => {
    if (!analytics?.hasData) return null;

    const tips: { icon: string; title: string; lures: string[]; techniques: string[]; reason: string }[] = [];

    // Wind-based recommendations
    if (analytics.windDirection?.best) {
      const windLabel = analytics.windDirection.best.label.toLowerCase();
      if (windLabel.includes('vest') || windLabel.includes('syd')) {
        tips.push({
          icon: 'compass',
          title: 'Ved vestenvind',
          lures: ['Tung blink', 'Jig', 'Pilk'],
          techniques: ['Bundmedefiskeri', 'Trolling'],
          reason: 'Fiskene søger læ - fisk ved strukturer og dybere vand',
        });
      }
    }

    // Conditions-based recommendations
    if (analytics.conditions?.best) {
      const condLabel = analytics.conditions.best.label.toLowerCase();
      if (condLabel.includes('skyet') || condLabel.includes('overskyet')) {
        tips.push({
          icon: 'cloud',
          title: 'I overskyet vejr',
          lures: ['Spinner', 'Crankbait', 'Wobbler'],
          techniques: ['Spinnefiskeri', 'Drop Shot'],
          reason: 'Fiskene er mere aktive og jager i hele vandsøjlen',
        });
      } else if (condLabel.includes('klart') || condLabel.includes('sol')) {
        tips.push({
          icon: 'sunny',
          title: 'Ved klart vejr',
          lures: ['Naturlige farver', 'Softbait', 'Finesse jig'],
          techniques: ['Flådfiskeri', 'Medefiskeri'],
          reason: 'Fiskene er forsigtige - brug diskrete metoder',
        });
      }
    }

    // Temperature-based recommendations
    if (analytics.temperature?.best) {
      const tempLabel = analytics.temperature.best.label.toLowerCase();
      if (tempLabel.includes('kold') || tempLabel.includes('< 10')) {
        tips.push({
          icon: 'thermometer',
          title: 'I koldt vand',
          lures: ['Slow-sink wobbler', 'Softbait', 'Små jigs'],
          techniques: ['Langsom indspinning', 'Jigging'],
          reason: 'Fiskene er langsomme - reducer hastigheden',
        });
      } else if (tempLabel.includes('varm') || tempLabel.includes('> 20')) {
        tips.push({
          icon: 'thermometer',
          title: 'I varmt vand',
          lures: ['Topwater', 'Popper', 'Hurtig spinner'],
          techniques: ['Topwater fiskeri', 'Hurtig spinnefiskeri'],
          reason: 'Fiskene er aktive - brug aggressive præsentationer',
        });
      }
    }

    // Pressure-based recommendations
    if (analytics.pressure?.best) {
      const pressLabel = analytics.pressure.best.label.toLowerCase();
      if (pressLabel.includes('faldende')) {
        tips.push({
          icon: 'speedometer',
          title: 'Ved faldende tryk',
          lures: ['Wobbler', 'Spinner', 'Jerkbait'],
          techniques: ['Aggressiv spinnefiskeri', 'Jigging'],
          reason: 'Fiskene forbereder sig på vejrskift - øget aktivitet',
        });
      }
    }

    return tips.length > 0 ? tips : null;
  }, [analytics]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await api.get('/statistics/weather-analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAnalytics(response.data);
      } else {
        setError(response.data.error || 'Kunne ikke hente vejrdata');
      }
    } catch (err: any) {
      console.error('Error fetching weather analytics:', err);
      setError(err.response?.data?.error || 'Kunne ikke hente vejranalyse');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getWeatherIcon = (category: string): string => {
    switch (category) {
      case 'windDirection': return 'compass';
      case 'moonPhase': return 'moon';
      case 'conditions': return 'cloud';
      case 'temperature': return 'thermometer';
      case 'pressure': return 'speedometer';
      case 'tideState': return 'water';
      default: return 'analytics';
    }
  };

  const getCategoryTitle = (category: string): string => {
    switch (category) {
      case 'windDirection': return 'Vindretning';
      case 'moonPhase': return 'Månefase';
      case 'conditions': return 'Vejrforhold';
      case 'temperature': return 'Temperatur';
      case 'pressure': return 'Lufttryk';
      case 'tideState': return 'Tidevand';
      default: return category;
    }
  };

  const renderCategoryCard = (
    categoryKey: string,
    category: WeatherCategory,
    iconColor: string
  ) => {
    if (!category.best && category.data.length === 0) return null;

    const isExpanded = expandedSection === categoryKey;

    return (
      <TouchableOpacity
        key={categoryKey}
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => toggleSection(categoryKey)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={getWeatherIcon(categoryKey) as any} size={24} color={iconColor} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {getCategoryTitle(categoryKey)}
            </Text>
            {category.best && (
              <Text style={[styles.bestValue, { color: iconColor }]}>
                {category.best.label}
              </Text>
            )}
          </View>
          <View style={styles.cardStats}>
            {category.best && (
              <>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {category.best.percentage}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  af fangster
                </Text>
              </>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {isExpanded && category.data.length > 0 && (
          <View style={styles.expandedContent}>
            {category.data.map((item, index) => (
              <View
                key={item.value}
                style={[
                  styles.dataRow,
                  index === 0 && { backgroundColor: iconColor + '10', borderRadius: RADIUS.md },
                ]}
              >
                <View style={styles.dataRowLeft}>
                  <Text style={[styles.dataLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {(item.tempRange || item.pressureRange) && (
                    <Text style={[styles.dataSubLabel, { color: colors.textSecondary }]}>
                      {item.tempRange || item.pressureRange}
                    </Text>
                  )}
                </View>
                <View style={styles.dataRowRight}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: index === 0 ? iconColor : colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dataCount, { color: colors.textSecondary }]}>
                    {item.count} ({item.percentage}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Analyserer dine vejrdata...
          </Text>
        </View>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchAnalytics}
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Prøv igen</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (!analytics?.hasData) {
    return (
      <PageLayout>
        <View style={styles.centered}>
          <Ionicons name="cloud-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Ingen vejrdata endnu
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Start med at registrere fangster med vejrdata for at se dine vejrindsigter.
          </Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="partly-sunny" size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Vejr Indsigter</Text>
        </View>

        {/* Stats overview */}
        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.overviewTitle, { color: colors.text }]}>
            Baseret på {analytics.totalCatchesAnalyzed} fangster
          </Text>
          <Text style={[styles.overviewSubtitle, { color: colors.textSecondary }]}>
            Se hvilke vejrforhold der giver dig de bedste resultater
          </Text>
        </View>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <View style={[styles.insightsCard, { backgroundColor: colors.primary + '10' }]}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb" size={24} color={colors.accent} />
              <Text style={[styles.insightsTitle, { color: colors.text }]}>
                Dine Indsigter
              </Text>
            </View>
            {analytics.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Weather-Based Gear Tips */}
        {weatherGearTips && weatherGearTips.length > 0 && (
          <View style={styles.gearTipsCard}>
            <View style={styles.gearTipsHeader}>
              <Ionicons name="construct" size={24} color={colors.accent} />
              <Text style={[styles.gearTipsTitle, { color: colors.text }]}>
                Udstyr baseret på dit vejr
              </Text>
            </View>
            {weatherGearTips.map((tip, index) => (
              <View key={index} style={styles.gearTipItem}>
                <View style={styles.gearTipHeader}>
                  <Ionicons name={tip.icon as any} size={18} color={colors.primary} />
                  <Text style={[styles.gearTipTitle, { color: colors.text }]}>
                    {tip.title}
                  </Text>
                </View>
                <Text style={styles.gearTipReason}>{tip.reason}</Text>

                <View style={styles.gearTipSection}>
                  <Text style={styles.gearTipLabel}>Anbefalet kunstagn:</Text>
                  <View style={styles.gearChipRow}>
                    {tip.lures.map((lure, lureIdx) => (
                      <View key={lureIdx} style={styles.gearChip}>
                        <Text style={styles.gearChipText}>{lure}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.gearTipSection}>
                  <Text style={styles.gearTipLabel}>Anbefalet teknik:</Text>
                  <View style={styles.gearChipRow}>
                    {tip.techniques.map((tech, techIdx) => (
                      <View key={techIdx} style={[styles.gearChip, styles.techniqueChip]}>
                        <Text style={[styles.gearChipText, styles.techniqueChipText]}>{tech}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Category cards */}
        {renderCategoryCard('windDirection', analytics.windDirection, colors.primary)}
        {renderCategoryCard('moonPhase', analytics.moonPhase, '#9333EA')}
        {renderCategoryCard('conditions', analytics.conditions, '#F59E0B')}
        {renderCategoryCard('temperature', analytics.temperature, '#EF4444')}
        {renderCategoryCard('pressure', analytics.pressure, '#06B6D4')}
        {renderCategoryCard('tideState', analytics.tideState, colors.secondary)}
      </ScrollView>
    </PageLayout>
  );
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xxl,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.md,
    },
    errorText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.md,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: SPACING.lg,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
    },
    retryButtonText: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    emptyTitle: {
      ...TYPOGRAPHY.styles.h3,
      marginTop: SPACING.md,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      marginTop: SPACING.sm,
      textAlign: 'center',
      maxWidth: 280,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.lg,
      gap: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
    },
    overviewCard: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.md,
    },
    overviewTitle: {
      ...TYPOGRAPHY.styles.h3,
      marginBottom: SPACING.xs,
    },
    overviewSubtitle: {
      ...TYPOGRAPHY.styles.body,
    },
    insightsCard: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
    },
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    insightsTitle: {
      ...TYPOGRAPHY.styles.h3,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    insightText: {
      ...TYPOGRAPHY.styles.body,
      flex: 1,
      lineHeight: 22,
    },
    card: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    cardTitleContainer: {
      flex: 1,
    },
    cardTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    bestValue: {
      ...TYPOGRAPHY.styles.h3,
      marginTop: 2,
    },
    cardStats: {
      alignItems: 'flex-end',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    statLabel: {
      ...TYPOGRAPHY.styles.small,
    },
    expandedContent: {
      marginTop: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: SPACING.md,
    },
    dataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    dataRowLeft: {
      flex: 1,
      marginRight: SPACING.md,
    },
    dataLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '500',
    },
    dataSubLabel: {
      ...TYPOGRAPHY.styles.small,
      marginTop: 2,
    },
    dataRowRight: {
      alignItems: 'flex-end',
      minWidth: 100,
    },
    progressBarContainer: {
      width: 80,
      height: 6,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.full,
      marginBottom: 4,
    },
    progressBar: {
      height: '100%',
      borderRadius: RADIUS.full,
    },
    dataCount: {
      ...TYPOGRAPHY.styles.small,
    },
    gearTipsCard: {
      backgroundColor: colors.surface,
      margin: SPACING.md,
      marginHorizontal: 0,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      ...SHADOWS.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    gearTipsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    gearTipsTitle: {
      ...TYPOGRAPHY.styles.h3,
    },
    gearTipItem: {
      backgroundColor: colors.backgroundLight,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    gearTipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    gearTipTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
    },
    gearTipReason: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: SPACING.sm,
    },
    gearTipSection: {
      marginTop: SPACING.xs,
    },
    gearTipLabel: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    gearChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    gearChip: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    gearChipText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.primary,
    },
    techniqueChip: {
      backgroundColor: colors.accent + '15',
    },
    techniqueChipText: {
      color: colors.accent,
    },
  });
};
