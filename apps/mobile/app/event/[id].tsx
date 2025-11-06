import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://fishlog-production.up.railway.app';

type Contest = {
  id: string;
  rule: string;
  speciesFilter?: string;
};

type Participant = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
};

type Event = {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  venue?: string;
  owner: {
    id: string;
    name: string;
  };
  contests: Contest[];
  participants: Participant[];
  isParticipating: boolean;
  participantCount: number;
};

type LeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  details: string;
  catchCount: number;
};

type Leaderboard = {
  contest: Contest;
  leaderboard: LeaderboardEntry[];
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const fetchEvent = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente event');
        router.back();
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      Alert.alert('Fejl', 'Kunne ikke hente event');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/events/${id}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboards(data.leaderboards);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchLeaderboard();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!event) return;

    setJoining(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const method = event.isParticipating ? 'DELETE' : 'POST';

      const response = await fetch(`${API_URL}/events/${id}/join`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        Alert.alert(
          'Succes',
          event.isParticipating ? 'Du er nu frammeldt' : 'Du er nu tilmeldt!',
        );
        fetchEvent();
        if (!event.isParticipating) {
          fetchLeaderboard();
        }
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke ændre tilmelding');
      }
    } catch (error) {
      console.error('Failed to join/leave event:', error);
      Alert.alert('Fejl', 'Kunne ikke ændre tilmelding');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRuleLabel = (rule: string) => {
    switch (rule) {
      case 'biggest_single':
        return 'Største fisk';
      case 'biggest_total':
        return 'Samlet vægt';
      case 'most_catches':
        return 'Flest fangster';
      default:
        return rule;
    }
  };

  const getEventStatus = (startAt: string, endAt: string) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (now < start) return { label: 'Kommende', color: '#007AFF' };
    if (now >= start && now <= end) return { label: 'I gang', color: '#28a745' };
    return { label: 'Afsluttet', color: '#6c757d' };
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const status = getEventStatus(event.startAt, event.endAt);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
          </View>

          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>📅 Start: {formatDate(event.startAt)}</Text>
            <Text style={styles.infoText}>🏁 Slut: {formatDate(event.endAt)}</Text>
            {event.venue && (
              <Text style={styles.infoText}>📍 Sted: {event.venue}</Text>
            )}
            <Text style={styles.infoText}>
              👤 Arrangør: {event.owner.name}
            </Text>
            <Text style={styles.infoText}>
              👥 {event.participantCount} deltagere
            </Text>
          </View>
        </View>

        {event.contests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konkurrencer</Text>
            {event.contests.map((contest) => (
              <View key={contest.id} style={styles.contestCard}>
                <Text style={styles.contestRule}>{getRuleLabel(contest.rule)}</Text>
                {contest.speciesFilter && (
                  <Text style={styles.contestFilter}>
                    🐟 {contest.speciesFilter}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {showLeaderboard && leaderboards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            {leaderboards.map((lb, index) => (
              <View key={index} style={styles.leaderboardSection}>
                <Text style={styles.leaderboardTitle}>
                  {getRuleLabel(lb.contest.rule)}
                  {lb.contest.speciesFilter && ` - ${lb.contest.speciesFilter}`}
                </Text>

                {lb.leaderboard.length === 0 ? (
                  <Text style={styles.emptyText}>Ingen fangster endnu</Text>
                ) : (
                  lb.leaderboard.map((entry) => (
                    <View key={entry.rank} style={styles.leaderboardEntry}>
                      <View style={styles.leaderboardLeft}>
                        <Text style={styles.rank}>#{entry.rank}</Text>
                        <Text style={styles.userName}>{entry.user.name}</Text>
                      </View>
                      <View style={styles.leaderboardRight}>
                        <Text style={styles.score}>{entry.details}</Text>
                        <Text style={styles.catchCount}>
                          {entry.catchCount} fangst{entry.catchCount !== 1 ? 'er' : ''}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deltagere</Text>
          {event.participants.map((participant) => (
            <View key={participant.id} style={styles.participantCard}>
              <Text style={styles.participantName}>
                {participant.user.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.joinButton,
            event.isParticipating && styles.leaveButton,
            joining && styles.disabledButton,
          ]}
          onPress={handleJoinLeave}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.joinButtonText}>
              {event.isParticipating ? 'Frameld' : 'Tilmeld'}
            </Text>
          )}
        </TouchableOpacity>

        {event.contests.length > 0 && (
          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Text style={styles.leaderboardButtonText}>
              {showLeaderboard ? 'Skjul' : 'Vis'} Leaderboard
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoSection: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contestCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contestRule: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contestFilter: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 40,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  catchCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  participantCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaderboardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
