import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

interface Session {
  id: string;
  sessionType: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalDistance: number;
  totalCatches: number;
  totalWeight: number;
  speciesCount: number;
  route: any;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
    pageTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
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
    sessionCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.sm,
    },
    sessionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sessionIcon: {
      width: 48,
      height: 48,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    sessionInfo: {
      flex: 1,
    },
    sessionTitle: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    sessionDate: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    sessionStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    kudosContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    kudosButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: SPACING.lg,
    },
    kudosText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterContainer: {
      flexDirection: 'row',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: SPACING.sm,
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
  });
};

export default function Fisketure() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/sessions/user/${user?.userId}`);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'I dag';
    } else if (diffDays === 1) {
      return 'I går';
    } else if (diffDays < 7) {
      return `${diffDays} dage siden`;
    } else {
      return date.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
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

  const getSessionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      shore: 'water',
      boat: 'boat',
      kayak: 'boat',
      wade: 'walk',
      ice: 'snow',
    };
    return icons[type] || 'fish';
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/session-detail?id=${item.id}`)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionIcon}>
          <Ionicons name={getSessionIcon(item.sessionType) as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.sessionStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(item.duration || 0)}</Text>
          <Text style={styles.statLabel}>Varighed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(item.totalDistance || 0)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalCatches || 0}</Text>
          <Text style={styles.statLabel}>Fangster</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.speciesCount || 0}</Text>
          <Text style={styles.statLabel}>Arter</Text>
        </View>
      </View>

      {/* Kudos section - placeholder for Phase 9 */}
      <View style={styles.kudosContainer}>
        <TouchableOpacity style={styles.kudosButton}>
          <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.kudosText}>Kudos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.kudosButton}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.kudosText}>Kommentar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Ingen fisketure endnu</Text>
      <Text style={styles.emptyText}>
        Tryk på plus-knappen nedenfor for at starte din første fisketrip!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PageLayout>
      <SafeAreaView style={styles.container} edges={['top']}>
        <WeatherLocationCard />

        <Text style={styles.pageTitle}>Mine Fisketure</Text>

        {/* Filter options */}
        <View style={styles.filterContainer}>
        {['all', 'shore', 'boat', 'kayak'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === type && styles.filterButtonTextActive,
              ]}
            >
              {type === 'all' ? 'Alle' : type === 'shore' ? 'Kyst' : type === 'boat' ? 'Båd' : 'Kajak'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sessions.filter(s => filter === 'all' || s.sessionType === filter)}
        renderItem={renderSession}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={sessions.length === 0 ? { flex: 1 } : { paddingVertical: SPACING.md }}
      />
      </SafeAreaView>
    </PageLayout>
  );
}
