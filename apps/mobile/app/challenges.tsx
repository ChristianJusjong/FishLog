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
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, FAB_STYLE, FAB } from '@/constants/theme';
import { API_URL } from '../config/api';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

type ChallengeType = 'most_catches' | 'biggest_fish' | 'total_weight' | 'most_species';

interface Participant {
  id: string;
  userId: string;
  score: number;
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: ChallengeType;
  species?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  prize?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: Participant[];
}

const CHALLENGE_TYPES = [
  { value: 'most_catches', label: 'Flest Fangster', icon: 'fish' as const },
  { value: 'biggest_fish', label: 'Største Fisk', icon: 'resize' as const },
  { value: 'total_weight', label: 'Total Vægt', icon: 'scale' as const },
  { value: 'most_species', label: 'Flest Arter', icon: 'color-filter' as const },
];

interface Group {
  id: string;
  name: string;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: 16,
    },
    container: {
      flexGrow: 1,
      padding: SPACING.lg,
      paddingBottom: 160, // Space for bottom nav + FAB
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: '700',
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
    },
    emptyCard: {
      padding: SPACING.xl,
      borderRadius: RADIUS.xl,
      alignItems: 'center',
      ...SHADOWS.sm,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.full,
      ...SHADOWS.sm,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    challengeCard: {
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    challengeHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.md,
      marginBottom: SPACING.sm,
    },
    typeIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    challengeTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    challengeType: {
      fontSize: 14,
    },
    deleteButton: {
      padding: SPACING.xs,
    },
    challengeDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: SPACING.md,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    userRankContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    userRankText: {
      fontSize: 14,
      fontWeight: '600',
    },
    leaderboardToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
    },
    leaderboardToggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    leaderboard: {
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      marginTop: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    emptyLeaderboard: {
      textAlign: 'center',
      padding: SPACING.lg,
      fontSize: 14,
    },
    leaderboardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    rankBadge: {
      width: 32,
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    rankNumber: {
      fontSize: 14,
      fontWeight: '600',
    },
    participantName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
    },
    participantScore: {
      fontSize: 16,
      fontWeight: '700',
    },
    joinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
      ...SHADOWS.sm,
    },
    joinButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      maxHeight: '90%',
      ...SHADOWS.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    modalContent: {
      padding: SPACING.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: SPACING.xs,
      marginTop: SPACING.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      marginBottom: SPACING.sm,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    typeOption: {
      flex: 1,
      minWidth: '45%',
      borderWidth: 2,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center',
      gap: SPACING.xs,
    },
    typeLabel: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    createButton: {
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl,
      ...SHADOWS.sm,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    targetAudienceContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    groupsScroll: {
      flex: 1,
    },
    audienceOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1.5,
      marginRight: SPACING.sm,
    },
    audienceLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    friendsScroll: {
      marginBottom: SPACING.md,
    },
    friendChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      marginRight: SPACING.xs,
      maxWidth: 150,
    },
    friendName: {
      fontSize: 13,
      fontWeight: '500',
    },
    templatesScroll: {
      marginBottom: SPACING.md,
    },
    templateCard: {
      width: 120,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      marginRight: SPACING.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    templateIcon: {
      fontSize: 32,
      marginBottom: SPACING.xs,
    },
    templateName: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: SPACING.xs,
    },
    templateDuration: {
      fontSize: 11,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      marginVertical: SPACING.md,
    },
  });
};

export default function ChallengesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Create challenge form
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'most_catches' as ChallengeType,
    species: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isPublic: true,
    prize: '',
    groupId: '',
  });

  useEffect(() => {
    fetchChallenges();
    getCurrentUserId();
    fetchMyGroups();
    fetchMyFriends();
    fetchTemplates();
  }, []);

  // Check if we should open the create modal automatically
  useEffect(() => {
    if (params.openCreate === 'true') {
      setShowCreateModal(true);
      // Clear the parameter to avoid reopening on subsequent navigations
      router.setParams({ openCreate: undefined });
    }
  }, [params.openCreate]);

  const getCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error('Failed to get user ID:', error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/my-groups`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setMyGroups(data);
        } else {
          console.error('Groups data is not an array:', data);
          setMyGroups([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setMyGroups([]);
    }
  };

  const fetchMyFriends = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_URL}/friends`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Check if data is an array
        if (Array.isArray(data) && data.length > 0) {
          // Extract friend user data from the friends array
          const friendsList = data.map((friendship: any) => {
            const friend = friendship.friend.id === userId ? friendship.user : friendship.friend;
            return {
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
            };
          });
          setMyFriends(friendsList);
        } else {
          setMyFriends([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      setMyFriends([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenge-templates`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const applyTemplate = (template: any) => {
    setSelectedTemplate(template.id);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + template.duration);

    setNewChallenge({
      ...newChallenge,
      title: template.name,
      description: template.description || '',
      type: template.type as ChallengeType,
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  const fetchChallenges = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenges`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente udfordringer');
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      Alert.alert('Fejl', 'Kunne ikke hente udfordringer');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChallenges();
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Du er nu tilmeldt udfordringen!');
        fetchChallenges();
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke tilmelde udfordring');
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
      Alert.alert('Fejl', 'Kunne ikke tilmelde udfordring');
    }
  };

  const createChallenge = async () => {
    if (!newChallenge.title || !newChallenge.type) {
      Alert.alert('Fejl', 'Titel og type er påkrævet');
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Prepare challenge data - remove groupId if empty, add participantIds
      const challengeData = {
        ...newChallenge,
        groupId: newChallenge.groupId || undefined,
        participantIds: selectedFriends.length > 0 ? selectedFriends : undefined,
      };

      const response = await fetch(`${API_URL}/challenges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeData),
      });

      if (response.ok) {
        const createdChallenge = await response.json();

        if (selectedFriends.length > 0) {
          Alert.alert(
            'Success!',
            `Udfordring oprettet og ${selectedFriends.length} ven${selectedFriends.length > 1 ? 'ner' : ''} er blevet inviteret!`
          );
        } else {
          Alert.alert('Success', 'Udfordring oprettet!');
        }

        setShowCreateModal(false);
        setNewChallenge({
          title: '',
          description: '',
          type: 'most_catches',
          species: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPublic: true,
          prize: '',
          groupId: '',
        });
        setSelectedFriends([]);
        setSelectedTemplate(null);
        fetchChallenges();
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke oprette udfordring');
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette udfordring');
    }
  };

  const deleteChallenge = async (challengeId: string, title: string) => {
    Alert.alert(
      'Slet udfordring',
      `Er du sikker på at du vil slette "${title}"?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Udfordring slettet');
                fetchChallenges();
              } else {
                Alert.alert('Fejl', 'Kunne ikke slette udfordring');
              }
            } catch (error) {
              console.error('Failed to delete challenge:', error);
              Alert.alert('Fejl', 'Kunne ikke slette udfordring');
            }
          },
        },
      ]
    );
  };

  const getChallengeTypeInfo = (type: ChallengeType) => {
    return CHALLENGE_TYPES.find(t => t.value === type);
  };

  const isParticipating = (challenge: Challenge) => {
    return challenge.participants.some(p => p.userId === currentUserId);
  };

  const getUserRank = (challenge: Challenge) => {
    const participant = challenge.participants.find(p => p.userId === currentUserId);
    return participant?.rank;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="trophy" size={48} color={colors.primary} />
        </View>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Indlæser udfordringer...
        </Text>
      </View>
    );
  }

  return (
    <PageLayout>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <WeatherLocationCard />

          <Text style={[styles.pageTitle, { color: colors.text }]}>Udfordringer</Text>

          <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {challenges.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="trophy-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Ingen aktive udfordringer
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tryk på plus-knappen nedenfor for at oprette din første udfordring!
            </Text>
          </View>
        ) : (
          challenges.map((challenge) => {
            const typeInfo = getChallengeTypeInfo(challenge.type);
            const participating = isParticipating(challenge);
            const userRank = getUserRank(challenge);
            const isExpanded = expandedChallenge === challenge.id;
            const isOwner = challenge.ownerId === currentUserId;
            const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.challengeCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/challenge/${challenge.id}`)}
                activeOpacity={0.7}
              >
                {/* Header */}
                <View style={styles.challengeHeader}>
                  <View style={[styles.typeIconContainer, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name={typeInfo?.icon || 'trophy'} size={24} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
                    <Text style={[styles.challengeType, { color: colors.textSecondary }]}>
                      {typeInfo?.label}
                      {challenge.species && ` - ${challenge.species}`}
                    </Text>
                  </View>
                  {isOwner && (
                    <TouchableOpacity
                      onPress={() => deleteChallenge(challenge.id, challenge.title)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Description */}
                {challenge.description && (
                  <Text style={[styles.challengeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {challenge.description}
                  </Text>
                )}

                {/* Info Badges */}
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      {daysLeft} dage tilbage
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="people-outline" size={14} color={colors.accent} />
                    <Text style={[styles.badgeText, { color: colors.accent }]}>
                      {challenge.participants.length} deltagere
                    </Text>
                  </View>
                  {challenge.prize && (
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="gift-outline" size={14} color="#F59E0B" />
                      <Text style={[styles.badgeText, { color: '#F59E0B' }]}>
                        Præmie
                      </Text>
                    </View>
                  )}
                </View>

                {/* User Rank (if participating) */}
                {participating && userRank && (
                  <View style={[styles.userRankContainer, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="ribbon" size={20} color={colors.accent} />
                    <Text style={[styles.userRankText, { color: colors.accent }]}>
                      Du er #{userRank} på ranglisten
                    </Text>
                  </View>
                )}

                {/* Leaderboard Toggle */}
                <TouchableOpacity
                  style={styles.leaderboardToggle}
                  onPress={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
                >
                  <Text style={[styles.leaderboardToggleText, { color: colors.primary }]}>
                    {isExpanded ? 'Skjul rangliste' : 'Vis rangliste'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {/* Leaderboard */}
                {isExpanded && (
                  <View style={[styles.leaderboard, { backgroundColor: colors.background }]}>
                    {challenge.participants.length === 0 ? (
                      <Text style={[styles.emptyLeaderboard, { color: colors.textSecondary }]}>
                        Ingen deltagere endnu
                      </Text>
                    ) : (
                      challenge.participants.map((participant, index) => (
                        <View
                          key={participant.id}
                          style={[
                            styles.leaderboardRow,
                            index < challenge.participants.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                          ]}
                        >
                          <View style={styles.rankBadge}>
                            {participant.rank <= 3 ? (
                              <Ionicons
                                name="trophy"
                                size={20}
                                color={participant.rank === 1 ? '#F59E0B' : participant.rank === 2 ? '#9CA3AF' : '#CD7F32'}
                              />
                            ) : (
                              <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>
                                #{participant.rank}
                              </Text>
                            )}
                          </View>
                          <Text style={[styles.participantName, { color: colors.text }]}>
                            {participant.user.name}
                            {participant.userId === currentUserId && ' (dig)'}
                          </Text>
                          <Text style={[styles.participantScore, { color: colors.accent }]}>
                            {participant.score}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {/* Action Button */}
                {!participating && (
                  <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: colors.accent }]}
                    onPress={() => joinChallenge(challenge.id)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                    <Text style={[styles.joinButtonText, { color: colors.white }]}>
                      Deltag i udfordring
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={[FAB_STYLE, { backgroundColor: colors.accent }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={FAB.ICON_SIZE} color={colors.white} />
      </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateModal(false);
          setSelectedFriends([]);
          setSelectedTemplate(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Opret Udfordring</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setSelectedFriends([]);
                setSelectedTemplate(null);
              }}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Challenge Templates */}
              {templates.length > 0 && (
                <>
                  <Text style={[styles.label, { color: colors.text }]}>Hurtig Start - Vælg Skabelon</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.templatesScroll}
                  >
                    {templates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={[
                          styles.templateCard,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          selectedTemplate === template.id && { backgroundColor: colors.accentLight, borderColor: colors.accent }
                        ]}
                        onPress={() => applyTemplate(template)}
                      >
                        <Text style={styles.templateIcon}>{template.icon || '🎯'}</Text>
                        <Text style={[
                          styles.templateName,
                          { color: selectedTemplate === template.id ? colors.accent : colors.text }
                        ]}>
                          {template.name}
                        </Text>
                        <Text style={[
                          styles.templateDuration,
                          { color: colors.textSecondary }
                        ]} numberOfLines={1}>
                          {template.duration} dag{template.duration !== 1 ? 'e' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </>
              )}

              <Text style={[styles.label, { color: colors.text }]}>Titel *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="F.eks. Weekend Gedde Challenge"
                placeholderTextColor={colors.textTertiary}
                value={newChallenge.title}
                onChangeText={(text) => setNewChallenge({ ...newChallenge, title: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Beskrivelse</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Beskriv udfordringen..."
                placeholderTextColor={colors.textTertiary}
                value={newChallenge.description}
                onChangeText={(text) => setNewChallenge({ ...newChallenge, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.label, { color: colors.text }]}>Type *</Text>
              <View style={styles.typeGrid}>
                {CHALLENGE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      { borderColor: colors.border },
                      newChallenge.type === type.value && { backgroundColor: colors.accentLight, borderColor: colors.accent }
                    ]}
                    onPress={() => setNewChallenge({ ...newChallenge, type: type.value as ChallengeType })}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={newChallenge.type === type.value ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[
                      styles.typeLabel,
                      { color: newChallenge.type === type.value ? colors.accent : colors.textSecondary }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Art (valgfri)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="F.eks. Gedde"
                placeholderTextColor={colors.textTertiary}
                value={newChallenge.species}
                onChangeText={(text) => setNewChallenge({ ...newChallenge, species: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Præmie (valgfri)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="F.eks. Middag på restaurant"
                placeholderTextColor={colors.textTertiary}
                value={newChallenge.prize}
                onChangeText={(text) => setNewChallenge({ ...newChallenge, prize: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Målgruppe</Text>
              <View style={styles.targetAudienceContainer}>
                <TouchableOpacity
                  style={[
                    styles.audienceOption,
                    { borderColor: colors.border },
                    !newChallenge.groupId && selectedFriends.length === 0 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    setNewChallenge({ ...newChallenge, groupId: '', isPublic: true });
                    setSelectedFriends([]);
                  }}
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={!newChallenge.groupId && selectedFriends.length === 0 ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.audienceLabel,
                    { color: !newChallenge.groupId && selectedFriends.length === 0 ? colors.primary : colors.textSecondary }
                  ]}>
                    Offentlig
                  </Text>
                </TouchableOpacity>

                {myGroups.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.groupsScroll}
                  >
                    {myGroups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.audienceOption,
                          { borderColor: colors.border },
                          newChallenge.groupId === group.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                        ]}
                        onPress={() => {
                          setNewChallenge({ ...newChallenge, groupId: group.id, isPublic: false });
                          setSelectedFriends([]);
                        }}
                      >
                        <Ionicons
                          name="people"
                          size={20}
                          color={newChallenge.groupId === group.id ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[
                          styles.audienceLabel,
                          { color: newChallenge.groupId === group.id ? colors.primary : colors.textSecondary }
                        ]} numberOfLines={1}>
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {myFriends.length > 0 && (
                <>
                  <Text style={[styles.label, { color: colors.text }]}>Eller vælg venner</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.friendsScroll}
                  >
                    {myFriends.map((friend) => {
                      const isSelected = selectedFriends.includes(friend.id);
                      return (
                        <TouchableOpacity
                          key={friend.id}
                          style={[
                            styles.friendChip,
                            { borderColor: colors.border },
                            isSelected && { backgroundColor: colors.accentLight, borderColor: colors.accent }
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                            } else {
                              setSelectedFriends([...selectedFriends, friend.id]);
                              setNewChallenge({ ...newChallenge, groupId: '', isPublic: false });
                            }
                          }}
                        >
                          <Ionicons
                            name={isSelected ? "checkmark-circle" : "person-outline"}
                            size={18}
                            color={isSelected ? colors.accent : colors.textSecondary}
                          />
                          <Text style={[
                            styles.friendName,
                            { color: isSelected ? colors.accent : colors.text }
                          ]} numberOfLines={1}>
                            {friend.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.accent }]}
                onPress={createChallenge}
              >
                <Text style={[styles.createButtonText, { color: colors.white }]}>
                  Opret Udfordring
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}