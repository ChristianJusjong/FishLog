import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import WeatherLocationCard from '../components/WeatherLocationCard';
import NavigationFloatingMenu from '../components/NavigationFloatingMenu';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedItem {
  id: string;
  type: 'catch' | 'session';
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  kudosCount: number;
  commentsCount: number;
  hasKudoed: boolean;
  // Catch-specific
  species?: string;
  weightKg?: number;
  lengthCm?: number;
  photoUrl?: string;
  location?: string;
  // Session-specific
  title?: string;
  sessionType?: string;
  duration?: number;
  totalDistance?: number;
  totalCatches?: number;
  route?: any[];
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.primary,
      marginLeft: SPACING.sm,
    },
    headerIcons: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      gap: SPACING.sm,
    },
    filterButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    weatherCard: {
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.md,
    },
    feedCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      ...SHADOW.small,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
    },
    avatar: {
      width: 44,
      height: 44,
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
    cardMeta: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    cardImage: {
      width: '100%',
      height: SCREEN_WIDTH - 2 * SPACING.lg,
      backgroundColor: colors.border,
    },
    cardContent: {
      padding: SPACING.md,
    },
    catchInfo: {
      marginBottom: SPACING.sm,
    },
    speciesText: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    detailsText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    sessionInfo: {
      marginBottom: SPACING.sm,
    },
    sessionTitle: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    sessionStats: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginTop: SPACING.sm,
    },
    sessionStat: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    sessionBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.primaryLight + '20',
      marginBottom: SPACING.sm,
    },
    sessionBadgeText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontSize: 10,
      fontWeight: '600',
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: SPACING.lg,
    },
    actionText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
      fontWeight: '600',
    },
    actionTextActive: {
      color: colors.primary,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyIcon: {
      marginBottom: SPACING.lg,
    },
    emptyTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    locationText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      marginTop: SPACING.xs,
    },
  });
};

export default function FeedEnhanced() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'catches' | 'sessions'>('all');

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      // Fetch both catches and sessions
      const [catchesRes, sessionsRes] = await Promise.all([
        api.get('/feed'),
        api.get('/sessions/feed'),
      ]);

      const catches = (catchesRes.data || []).map((item: any) => ({
        ...item,
        type: 'catch',
        kudosCount: item.kudosCount || item.likesCount || 0,
        hasKudoed: item.hasKudoed || item.isLikedByMe || false,
      }));

      const sessions = (sessionsRes.data?.sessions || []).map((item: any) => ({
        ...item,
        type: 'session',
        kudosCount: item.kudosCount || 0,
        hasKudoed: item.hasKudoed || false,
      }));

      // Combine and sort by date
      let combined = [...catches, ...sessions].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply filter
      if (filter === 'catches') {
        combined = combined.filter(item => item.type === 'catch');
      } else if (filter === 'sessions') {
        combined = combined.filter(item => item.type === 'session');
      }

      setFeedItems(combined);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      Alert.alert('Fejl', 'Kunne ikke hente feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleKudos = async (item: FeedItem) => {
    try {
      const endpoint = item.type === 'catch'
        ? `/kudos/catches/${item.id}`
        : `/kudos/sessions/${item.id}`;

      if (item.hasKudoed) {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }

      // Update local state
      setFeedItems(prev => prev.map(i =>
        i.id === item.id
          ? {
              ...i,
              hasKudoed: !i.hasKudoed,
              kudosCount: i.hasKudoed ? i.kudosCount - 1 : i.kudosCount + 1,
            }
          : i
      ));
    } catch (error) {
      console.error('Failed to toggle kudos:', error);
      Alert.alert('Fejl', 'Kunne ikke give kudos');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Lige nu';
    if (diffMins < 60) return `${diffMins}m siden`;
    if (diffHours < 24) return `${diffHours}t siden`;
    if (diffDays < 7) return `${diffDays}d siden`;

    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}t ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  const renderCatchCard = (item: FeedItem) => (
    <View style={styles.feedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.cardMeta}>
            Fangede {item.species} • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      {item.photoUrl && (
        <TouchableOpacity onPress={() => router.push(`/catch-detail?id=${item.id}`)}>
          <Image source={{ uri: item.photoUrl }} style={styles.cardImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      <View style={styles.cardContent}>
        <View style={styles.catchInfo}>
          <Text style={styles.speciesText}>{item.species}</Text>
          <Text style={styles.detailsText}>
            {item.weightKg ? `${item.weightKg} kg` : ''}{' '}
            {item.lengthCm ? `• ${item.lengthCm} cm` : ''}
          </Text>
          {item.location && (
            <Text style={styles.locationText}>
              <Ionicons name="location" size={12} /> {item.location}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleKudos(item)}
        >
          <Ionicons
            name={item.hasKudoed ? 'heart' : 'heart-outline'}
            size={22}
            color={item.hasKudoed ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionText, item.hasKudoed && styles.actionTextActive]}>
            {item.kudosCount > 0 ? item.kudosCount : 'Kudos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/catch-detail?id=${item.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>
            {item.commentsCount > 0 ? item.commentsCount : 'Kommentar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSessionCard = (item: FeedItem) => (
    <View style={styles.feedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.cardMeta}>
            Fuldførte en fisketrip • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/session-detail?id=${item.id}`)}
      >
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>
            {item.sessionType?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <View style={styles.sessionStats}>
            <Text style={styles.sessionStat}>
              <Ionicons name="time-outline" size={12} /> {formatDuration(item.duration || 0)}
            </Text>
            <Text style={styles.sessionStat}>
              <Ionicons name="navigate-outline" size={12} /> {formatDistance(item.totalDistance || 0)}
            </Text>
            <Text style={styles.sessionStat}>
              <Ionicons name="fish-outline" size={12} /> {item.totalCatches || 0} fangster
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleKudos(item)}
        >
          <Ionicons
            name={item.hasKudoed ? 'heart' : 'heart-outline'}
            size={22}
            color={item.hasKudoed ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionText, item.hasKudoed && styles.actionTextActive]}>
            {item.kudosCount > 0 ? item.kudosCount : 'Kudos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/session-detail?id=${item.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>
            {item.commentsCount > 0 ? item.commentsCount : 'Kommentar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: FeedItem }) => {
    return item.type === 'catch' ? renderCatchCard(item) : renderSessionCard(item);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fish-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Ingen aktivitet endnu</Text>
      <Text style={styles.emptyText}>
        Følg venner for at se deres fangster og fisketure her!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logo}>
            <Ionicons name="fish" size={28} color={colors.primary} />
            <Text style={styles.logoText}>Hook</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/session-tracking')}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'catches' && styles.filterButtonActive]}
            onPress={() => setFilter('catches')}
          >
            <Text style={[styles.filterButtonText, filter === 'catches' && styles.filterButtonTextActive]}>
              Fangster
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'sessions' && styles.filterButtonActive]}
            onPress={() => setFilter('sessions')}
          >
            <Text style={[styles.filterButtonText, filter === 'sessions' && styles.filterButtonTextActive]}>
              Fisketure
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        ListHeaderComponent={<View style={styles.weatherCard}><WeatherLocationCard /></View>}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchFeed(true);
            }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={feedItems.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
      />

      <NavigationFloatingMenu />
    </SafeAreaView>
  );
}
