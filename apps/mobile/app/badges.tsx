import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rule: string;
  tier: string;
}

interface BadgeWithProgress {
  badge: Badge;
  earnedAt?: string;
  progress: number;
  locked: boolean;
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.xl,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.glow,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.md,
      paddingBottom: 100, // Space for bottom navigation
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.md,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      ...TYPOGRAPHY.styles.h1,
      color: colors.primary,
      marginTop: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.small,
      marginTop: SPACING.xs,
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      ...TYPOGRAPHY.styles.h2,
    },
    badgesGrid: {
      gap: SPACING.md,
    },
    badgeCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      ...SHADOWS.md,
    },
    badgeCardLocked: {
      opacity: 0.6,
    },
    badgeIconContainer: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.full,
      backgroundColor: colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    badgeIcon: {
      fontSize: 36,
    },
    badgeInfo: {
      flex: 1,
    },
    badgeName: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      marginBottom: SPACING.xs,
    },
    badgeNameLocked: {
      color: colors.textSecondary,
    },
    tierBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    tierText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.white,
    },
    progressContainer: {
      marginLeft: SPACING.md,
      width: 80,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: RADIUS.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    earnedContainer: {
      marginLeft: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    earnedText: {
      fontSize: 11,
      color: colors.success,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: SPACING['3xl'],
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h2,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.styles.small,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      minHeight: 400,
    },
    modalHeader: {
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'flex-end',
    },
    closeButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBody: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    modalIcon: {
      fontSize: 80,
      marginBottom: SPACING.md,
    },
    modalTitle: {
      ...TYPOGRAPHY.styles.h1,
      marginBottom: SPACING.md,
    },
    modalDescription: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: SPACING.xl,
    },
    modalProgressContainer: {
      width: '100%',
      marginTop: SPACING.md,
    },
    modalProgressLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      marginBottom: SPACING.sm,
    },
    modalProgressText: {
      ...TYPOGRAPHY.styles.small,
      marginTop: SPACING.sm,
      textAlign: 'center',
    },
    modalEarnedContainer: {
      marginTop: SPACING.md,
      alignItems: 'center',
    },
    modalEarnedLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      marginTop: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    modalEarnedDate: {
      ...TYPOGRAPHY.styles.body,
      color: colors.success,
      fontWeight: '600',
    },
    shareButton: {
      marginTop: SPACING.xl,
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      ...SHADOWS.md,
    },
    shareButtonText: {
      ...TYPOGRAPHY.styles.button,
    },
  });
};

export default function BadgesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeWithProgress[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeWithProgress[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await api.get('/users/me/badges');
      setEarnedBadges(response.data.earned || []);
      setLockedBadges(response.data.locked || []);
    } catch (error: any) {
      console.error('Error fetching badges:', error);
      Alert.alert('Fejl', 'Kunne ikke hente badges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBadges();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return colors.textSecondary;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'medal';
      case 'silver':
        return 'medal';
      case 'gold':
        return 'medal';
      case 'platinum':
        return 'diamond';
      default:
        return 'ribbon';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'Bronze';
      case 'silver':
        return 'Sølv';
      case 'gold':
        return 'Guld';
      case 'platinum':
        return 'Platin';
      default:
        return tier;
    }
  };

  const shareBadge = async (badge: BadgeWithProgress) => {
    try {
      await Share.share({
        message: `Jeg fik lige ${badge.badge.icon} ${badge.badge.name} badge på FishLog! ${badge.badge.description}`,
        title: `FishLog Badge: ${badge.badge.name}`,
      });
    } catch (error) {
      console.error('Error sharing badge:', error);
    }
  };

  const renderBadgeCard = (item: BadgeWithProgress) => {
    const isLocked = item.locked;
    const tierColor = getTierColor(item.badge.tier);
    const tierIcon = getTierIcon(item.badge.tier);

    return (
      <TouchableOpacity
        key={item.badge.id}
        style={[styles.badgeCard, isLocked && styles.badgeCardLocked]}
        onPress={() => setSelectedBadge(item)}
        activeOpacity={0.7}
      >
        <View style={styles.badgeIconContainer}>
          {isLocked ? (
            <Ionicons name="lock-closed" size={36} color={colors.textTertiary} />
          ) : (
            <Text style={styles.badgeIcon}>{item.badge.icon}</Text>
          )}
        </View>

        <View style={styles.badgeInfo}>
          <Text style={[styles.badgeName, isLocked && styles.badgeNameLocked]}>
            {item.badge.name}
          </Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Ionicons name={tierIcon} size={10} color={colors.white} />
            <Text style={styles.tierText}>{getTierLabel(item.badge.tier)}</Text>
          </View>
        </View>

        {isLocked && item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${item.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}

        {!isLocked && item.earnedAt && (
          <View style={styles.earnedContainer}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.earnedText}>
              {new Date(item.earnedAt).toLocaleDateString('da-DK')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={[colors.accent, colors.accentDark || '#D4880F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="ribbon" size={40} color={colors.primary} />
            </LinearGradient>
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
            <Text style={styles.loadingText}>Henter badges...</Text>
          </View>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View style={styles.container}>
        <WeatherLocationCard />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Opnået</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="lock-closed" size={32} color={colors.textSecondary} />
            <Text style={styles.statNumber}>{lockedBadges.length}</Text>
            <Text style={styles.statLabel}>Låst</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="stats-chart" size={32} color={colors.accent} />
            <Text style={styles.statNumber}>
              {Math.round(
                (earnedBadges.length /
                  (earnedBadges.length + lockedBadges.length)) *
                  100
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Dine Badges ({earnedBadges.length})</Text>
            </View>
            <View style={styles.badgesGrid}>
              {earnedBadges.map((item) => renderBadgeCard(item))}
            </View>
          </View>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
              <Text style={styles.sectionTitle}>Låste Badges ({lockedBadges.length})</Text>
            </View>
            <View style={styles.badgesGrid}>
              {lockedBadges.map((item) => renderBadgeCard(item))}
            </View>
          </View>
        )}

        {earnedBadges.length === 0 && lockedBadges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="fish-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>Ingen badges endnu</Text>
            <Text style={styles.emptySubtext}>
              Start med at fange nogle fisk!
            </Text>
          </View>
        )}
      </ScrollView>
        </SafeAreaView>
      </View>

      {/* Badge Detail Modal */}
      <Modal
        visible={selectedBadge !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedBadge(null)}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  {selectedBadge.locked ? (
                    <Ionicons name="lock-closed" size={80} color={colors.textTertiary} />
                  ) : (
                    <Text style={styles.modalIcon}>{selectedBadge.badge.icon}</Text>
                  )}
                  <Text style={styles.modalTitle}>{selectedBadge.badge.name}</Text>

                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor: getTierColor(selectedBadge.badge.tier),
                        marginBottom: SPACING.md,
                      },
                    ]}
                  >
                    <Ionicons name={getTierIcon(selectedBadge.badge.tier)} size={12} color={colors.white} />
                    <Text style={styles.tierText}>
                      {getTierLabel(selectedBadge.badge.tier)}
                    </Text>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedBadge.badge.description}
                  </Text>

                  {selectedBadge.locked && selectedBadge.progress > 0 && (
                    <View style={styles.modalProgressContainer}>
                      <Text style={styles.modalProgressLabel}>Fremskridt</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${selectedBadge.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.modalProgressText}>
                        {selectedBadge.progress}% fuldført
                      </Text>
                    </View>
                  )}

                  {!selectedBadge.locked && selectedBadge.earnedAt && (
                    <View style={styles.modalEarnedContainer}>
                      <Ionicons name="calendar" size={20} color={colors.success} />
                      <Text style={styles.modalEarnedLabel}>Opnået</Text>
                      <Text style={styles.modalEarnedDate}>
                        {new Date(selectedBadge.earnedAt).toLocaleDateString('da-DK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}

                  {!selectedBadge.locked && (
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => shareBadge(selectedBadge)}
                    >
                      <Ionicons name="share-social" size={20} color={colors.white} />
                      <Text style={styles.shareButtonText}>Del Badge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}
