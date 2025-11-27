import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionDetail {
  id: string;
  sessionType: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  totalCatches: number;
  totalWeight: number;
  speciesCount: number;
  biggestCatch: number;
  route: any[];
  catches: any[];
  kudos: any[];
  comments: any[];
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingTop: 50,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      backgroundColor: colors.surface + 'F0',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.md,
    },
    headerActions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    mapContainer: {
      height: SCREEN_HEIGHT * 0.4,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    titleSection: {
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sessionTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    sessionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    sessionDate: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    sessionType: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      marginTop: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statBox: {
      width: '50%',
      marginBottom: SPACING.lg,
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
    },
    section: {
      marginTop: SPACING.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.lg,
    },
    sectionTitle: {
      ...TYPOGRAPHY.styles.h4,
      color: colors.text,
    },
    sectionContent: {
      padding: SPACING.lg,
      paddingTop: 0,
    },
    catchCard: {
      flexDirection: 'row',
      padding: SPACING.md,
      backgroundColor: colors.background,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.sm,
      alignItems: 'center',
    },
    catchImage: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.md,
      backgroundColor: colors.border,
      marginRight: SPACING.md,
    },
    catchInfo: {
      flex: 1,
    },
    catchSpecies: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    catchDetails: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.textSecondary,
    },
    kudosSection: {
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    kudosButtons: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    kudosButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    kudosButtonActive: {
      backgroundColor: colors.primaryLight + '20',
      borderColor: colors.primary,
    },
    kudosButtonText: {
      ...TYPOGRAPHY.styles.caption,
      color: colors.text,
      marginLeft: SPACING.xs,
      fontWeight: '600',
    },
    kudosCount: {
      marginLeft: SPACING.xs,
      color: colors.textSecondary,
    },
    commentsList: {
      marginTop: SPACING.md,
    },
    comment: {
      marginBottom: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.background,
      borderRadius: RADIUS.lg,
    },
    commentUser: {
      ...TYPOGRAPHY.styles.caption,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    commentText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.sm,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.md,
    },
  });
};

export default function SessionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasKudoed, setHasKudoed] = useState(false);
  const [kudosCount, setKudosCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSessionDetail();
    }
  }, [id]);

  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/sessions/${id}`);
      setSession(data.session);

      // Fetch kudos
      const kudosData = await api.get(`/kudos/sessions/${id}`);
      setHasKudoed(kudosData.data.hasUserKudoed);
      setKudosCount(kudosData.data.kudosCount);
    } catch (error) {
      console.error('Failed to fetch session detail:', error);
      Alert.alert('Fejl', 'Kunne ikke indlæse session');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleKudos = async () => {
    try {
      if (hasKudoed) {
        await api.delete(`/kudos/sessions/${id}`);
        setHasKudoed(false);
        setKudosCount(prev => prev - 1);
      } else {
        await api.post(`/kudos/sessions/${id}`);
        setHasKudoed(true);
        setKudosCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle kudos:', error);
      Alert.alert('Fejl', 'Kunne ikke give kudos');
    }
  };

  const shareSession = async () => {
    if (!session) return;

    try {
      await Share.share({
        message: `Tjek min fisketrip ud: ${session.title}\n\n${session.totalCatches} fangster på ${formatDuration(session.duration)}!\n\nHook - Din fiskeapp`,
      });
    } catch (error) {
      console.error('Failed to share session:', error);
    }
  };

  const deleteSession = () => {
    Alert.alert(
      'Slet session',
      'Er du sikker på, at du vil slette denne fisketrip?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/sessions/${id}`);
              Alert.alert('Slettet', 'Sessionen er blevet slettet');
              router.back();
            } catch (error) {
              console.error('Failed to delete session:', error);
              Alert.alert('Fejl', 'Kunne ikke slette session');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const formatSpeed = (kmh: number) => {
    return `${kmh.toFixed(1)} km/t`;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: colors.textSecondary }}>Session ikke fundet</Text>
      </View>
    );
  }

  const route = session.route ? (typeof session.route === 'string' ? JSON.parse(session.route) : session.route) : [];
  const isOwnSession = session.user.id === user?.userId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={shareSession}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          {isOwnSession && (
            <TouchableOpacity style={styles.actionButton} onPress={deleteSession}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Map */}
        {route.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: route[0].lat,
                longitude: route[0].lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Polyline
                coordinates={route.map((p: any) => ({
                  latitude: p.lat,
                  longitude: p.lng,
                }))}
                strokeColor={colors.primary}
                strokeWidth={3}
              />
              <Marker
                coordinate={{
                  latitude: route[0].lat,
                  longitude: route[0].lng,
                }}
                title="Start"
                pinColor="green"
              />
              {route.length > 1 && (
                <Marker
                  coordinate={{
                    latitude: route[route.length - 1].lat,
                    longitude: route[route.length - 1].lng,
                  }}
                  title="Slut"
                  pinColor="red"
                />
              )}
            </MapView>
          </View>
        )}

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionDate}>{formatDate(session.startTime)}</Text>
            <Text style={styles.sessionType}>• {session.sessionType.toUpperCase()}</Text>
          </View>
          {session.description && (
            <Text style={styles.description}>{session.description}</Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(session.duration || 0)}</Text>
            <Text style={styles.statLabel}>Varighed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDistance(session.totalDistance || 0)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{session.totalCatches || 0}</Text>
            <Text style={styles.statLabel}>Fangster</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{session.speciesCount || 0}</Text>
            <Text style={styles.statLabel}>Arter</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{session.totalWeight?.toFixed(1) || 0} kg</Text>
            <Text style={styles.statLabel}>Total vægt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatSpeed(session.avgSpeed || 0)}</Text>
            <Text style={styles.statLabel}>Gns. hastighed</Text>
          </View>
        </View>

        {/* Kudos & Comments */}
        <View style={styles.kudosSection}>
          <View style={styles.kudosButtons}>
            <TouchableOpacity
              style={[styles.kudosButton, hasKudoed && styles.kudosButtonActive]}
              onPress={toggleKudos}
            >
              <Ionicons
                name={hasKudoed ? 'heart' : 'heart-outline'}
                size={20}
                color={hasKudoed ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.kudosButtonText}>Kudos</Text>
              <Text style={styles.kudosCount}>{kudosCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.kudosButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.kudosButtonText}>Kommentar</Text>
              <Text style={styles.kudosCount}>{session.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Catches */}
        {session.catches && session.catches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fangster ({session.catches.length})</Text>
            </View>
            <View style={styles.sectionContent}>
              {session.catches.map((catch_: any, index: number) => (
                <TouchableOpacity
                  key={catch_.id}
                  style={styles.catchCard}
                  onPress={() => router.push(`/catch-detail?id=${catch_.id}`)}
                >
                  <View style={styles.catchImage}>
                    {catch_.photoUrl && (
                      <Image source={{ uri: catch_.photoUrl }} style={{ flex: 1, borderRadius: RADIUS.md }} />
                    )}
                  </View>
                  <View style={styles.catchInfo}>
                    <Text style={styles.catchSpecies}>{catch_.species || 'Ukendt art'}</Text>
                    <Text style={styles.catchDetails}>
                      {catch_.weightKg ? `${catch_.weightKg} kg` : ''}{' '}
                      {catch_.lengthCm ? `• ${catch_.lengthCm} cm` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
