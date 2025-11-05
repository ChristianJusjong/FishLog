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
import { Stack, useRouter } from 'expo-router';
import { api } from '../lib/api';

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

export default function BadgesScreen() {
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
        return '#999';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '🥉 Bronze';
      case 'silver':
        return '🥈 Sølv';
      case 'gold':
        return '🥇 Guld';
      case 'platinum':
        return '💎 Platin';
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

    return (
      <TouchableOpacity
        key={item.badge.id}
        style={[styles.badgeCard, isLocked && styles.badgeCardLocked]}
        onPress={() => setSelectedBadge(item)}
        activeOpacity={0.7}
      >
        <View style={styles.badgeIconContainer}>
          <Text style={[styles.badgeIcon, isLocked && styles.badgeIconLocked]}>
            {isLocked ? '🔒' : item.badge.icon}
          </Text>
        </View>

        <View style={styles.badgeInfo}>
          <Text style={[styles.badgeName, isLocked && styles.badgeNameLocked]}>
            {item.badge.name}
          </Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
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
            <Text style={styles.earnedText}>
              Opnået {new Date(item.earnedAt).toLocaleDateString('da-DK')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Badges' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Henter badges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Badges' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Opnået</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{lockedBadges.length}</Text>
            <Text style={styles.statLabel}>Låst</Text>
          </View>
          <View style={styles.statBox}>
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
            <Text style={styles.sectionTitle}>Dine Badges ({earnedBadges.length})</Text>
            <View style={styles.badgesGrid}>
              {earnedBadges.map((item) => renderBadgeCard(item))}
            </View>
          </View>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Låste Badges ({lockedBadges.length})</Text>
            <View style={styles.badgesGrid}>
              {lockedBadges.map((item) => renderBadgeCard(item))}
            </View>
          </View>
        )}

        {earnedBadges.length === 0 && lockedBadges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎣</Text>
            <Text style={styles.emptyText}>Ingen badges endnu</Text>
            <Text style={styles.emptySubtext}>
              Start med at fange nogle fisk!
            </Text>
          </View>
        )}
      </ScrollView>

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
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalIcon}>
                    {selectedBadge.locked ? '🔒' : selectedBadge.badge.icon}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedBadge.badge.name}</Text>

                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor: getTierColor(selectedBadge.badge.tier),
                        marginBottom: 16,
                      },
                    ]}
                  >
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
                      <Text style={styles.shareButtonText}>📤 Del Badge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  badgesGrid: {
    gap: 12,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIcon: {
    fontSize: 36,
  },
  badgeIconLocked: {
    fontSize: 28,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  badgeNameLocked: {
    color: '#999',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    marginLeft: 12,
    width: 80,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  earnedContainer: {
    marginLeft: 12,
  },
  earnedText: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalProgressContainer: {
    width: '100%',
    marginTop: 16,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalProgressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalEarnedContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalEarnedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  modalEarnedDate: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
