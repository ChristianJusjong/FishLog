import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

type Event = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  venue?: string;
  owner: {
    id: string;
    name: string;
  };
  isParticipating: boolean;
  participantCount: number;
};

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'ongoing' | 'past' | 'all'>('upcoming');

  const fetchEvents = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const url = filter === 'all' ? `${API_URL}/events` : `${API_URL}/events?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente events');
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      Alert.alert('Fejl', 'Kunne ikke hente events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatus = (startAt: string, endAt: string) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (now < start) return { label: 'Kommende', color: COLORS.info };
    if (now >= start && now <= end) return { label: 'I gang', color: COLORS.success };
    return { label: 'Afsluttet', color: COLORS.textSecondary };
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundLight }} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundLight }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-event')}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.createButtonText}>Opret Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={filter === 'upcoming' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.filterButtonTextActive]}>
            Kommende
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ongoing' && styles.filterButtonActive]}
          onPress={() => setFilter('ongoing')}
        >
          <Ionicons
            name="play-circle-outline"
            size={16}
            color={filter === 'ongoing' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.filterButtonText, filter === 'ongoing' && styles.filterButtonTextActive]}>
            I gang
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
          onPress={() => setFilter('past')}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={filter === 'past' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.filterButtonText, filter === 'past' && styles.filterButtonTextActive]}>
            Afsluttede
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={filter === 'all' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Alle
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>Ingen events fundet</Text>
            <Text style={styles.emptySubtext}>
              Opret dit første event eller vent på at andre opretter events
            </Text>
          </View>
        ) : (
          events.map((event) => {
            const status = getEventStatus(event.startAt, event.endAt);
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                    <Text style={styles.statusText}>{status.label}</Text>
                  </View>
                </View>

                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventDetailText}>{formatDate(event.startAt)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="flag" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventDetailText}>{formatDate(event.endAt)}</Text>
                  </View>
                  {event.venue && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.eventDetailText}>{event.venue}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.eventFooter}>
                  <View style={styles.organizerRow}>
                    <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.organizerText}>Arrangør: {event.owner.name}</Text>
                  </View>
                  <View style={styles.participantsContainer}>
                    <View style={styles.participantsRow}>
                      <Ionicons name="people" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.participantsText}>{event.participantCount} deltagere</Text>
                    </View>
                    {event.isParticipating && (
                      <View style={styles.participatingBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.participatingText}>Tilmeldt</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  createButtonText: {
    ...TYPOGRAPHY.styles.button,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    ...TYPOGRAPHY.styles.h2,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    ...TYPOGRAPHY.styles.small,
    marginBottom: SPACING.md,
  },
  eventDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventDetailText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  organizerText: {
    ...TYPOGRAPHY.styles.small,
  },
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  participantsText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
  },
  participatingBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participatingText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
    marginTop: SPACING['2xl'],
  },
  emptyText: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.styles.small,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
