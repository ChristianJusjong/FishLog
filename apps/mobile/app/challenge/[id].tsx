import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../../contexts/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

type Participant = {
  id: string;
  score: number;
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
};

type Challenge = {
  id: string;
  title: string;
  description?: string;
  type: string;
  species?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  prize?: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: Participant[];
};

type GalleryPhoto = {
  id: string;
  photoUrl: string;
  species: string;
  userName: string;
  date: string;
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...SHADOWS.sm,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h2,
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: colors.surface,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    infoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.md,
    },
    challengeTitle: {
      ...TYPOGRAPHY.styles.h1,
      flex: 1,
      marginRight: SPACING.sm,
    },
    statusBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    statusText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '600',
    },
    description: {
      ...TYPOGRAPHY.styles.body,
      marginBottom: SPACING.md,
    },
    detailsGrid: {
      gap: SPACING.sm,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    detailText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      padding: SPACING.sm,
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.backgroundLight,
    },
    activeTab: {
      backgroundColor: colors.primaryLight,
    },
    tabText: {
      ...TYPOGRAPHY.styles.button,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: '600',
    },
    leaderboardContainer: {
      padding: SPACING.md,
      gap: SPACING.sm,
    },
    leaderboardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      ...SHADOWS.sm,
    },
    rankContainer: {
      width: 50,
      alignItems: 'center',
    },
    rankText: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textSecondary,
    },
    participantInfo: {
      flex: 1,
    },
    participantName: {
      ...TYPOGRAPHY.styles.h3,
    },
    participantScore: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    chatContainer: {
      padding: SPACING.md,
      gap: SPACING.sm,
      paddingBottom: SPACING.xl,
    },
    commentBubble: {
      maxWidth: '80%',
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.sm,
      ...SHADOWS.sm,
    },
    ownCommentBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
    },
    otherCommentBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
    },
    commentAuthor: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.primary,
    },
    commentText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.text,
    },
    commentTime: {
      ...TYPOGRAPHY.styles.small,
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: SPACING.sm,
    },
    input: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      ...TYPOGRAPHY.styles.body,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.md,
    },
    sendButtonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING['2xl'],
      marginTop: SPACING['2xl'],
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.styles.small,
      textAlign: 'center',
      paddingHorizontal: SPACING.xl,
    },
    galleryContainer: {
      padding: SPACING.md,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    photoCard: {
      width: '48%',
      aspectRatio: 1,
      borderRadius: RADIUS.md,
      overflow: 'hidden',
      ...SHADOWS.md,
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: SPACING.xs,
    },
    photoSpecies: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    photoUser: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 10,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalClose: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
    },
    modalImage: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height * 0.8,
    },
  });
};

export default function ChallengeDetailScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'chat' | 'gallery'>('leaderboard');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadUserId();
    fetchChallenge();
    fetchComments();
    if (activeTab === 'gallery') {
      fetchPhotos();
    }
  }, [id, activeTab]);

  const loadUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) setCurrentUserId(userId);
  };

  const fetchChallenge = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenges/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenge(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente udfordring');
        router.back();
      }
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
      Alert.alert('Fejl', 'Kunne ikke hente udfordring');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComments = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenges/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/catches?challengeId=${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const catches = await response.json();
        const galleryPhotos: GalleryPhoto[] = catches
          .filter((catch_: any) => catch_.photoUrl)
          .map((catch_: any) => ({
            id: catch_.id,
            photoUrl: catch_.photoUrl,
            species: catch_.species,
            userName: catch_.user.name,
            date: catch_.createdAt,
          }));
        setPhotos(galleryPhotos);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChallenge();
    fetchComments();
    if (activeTab === 'gallery') {
      fetchPhotos();
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/challenges/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
        // Scroll to bottom after sending
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Fejl', 'Kunne ikke sende kommentar');
      }
    } catch (error) {
      console.error('Failed to send comment:', error);
      Alert.alert('Fejl', 'Kunne ikke sende kommentar');
    } finally {
      setSending(false);
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      most_catches: 'Flest fangster',
      biggest_fish: 'Største fisk',
      total_weight: 'Samlet vægt',
      most_species: 'Flest arter',
    };
    return types[type] || type;
  };

  const getStatusColor = () => {
    if (!challenge) return colors.textSecondary;
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) return colors.info;
    if (now >= start && now <= end) return colors.success;
    return colors.textSecondary;
  };

  const getStatusLabel = () => {
    if (!challenge) return '';
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) return 'Kommende';
    if (now >= start && now <= end) return 'I gang';
    return 'Afsluttet';
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

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d siden`;
    if (hours > 0) return `${hours}t siden`;
    if (minutes > 0) return `${minutes}m siden`;
    return 'Lige nu';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundLight }} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundLight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{challenge.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {/* Challenge Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusLabel()}</Text>
              </View>
            </View>

            {challenge.description && (
              <Text style={styles.description}>{challenge.description}</Text>
            )}

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="trophy" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{getChallengeTypeLabel(challenge.type)}</Text>
              </View>
              {challenge.species && (
                <View style={styles.detailItem}>
                  <Ionicons name="fish" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{challenge.species}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{formatDate(challenge.startDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="flag" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{formatDate(challenge.endDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="person" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>Arrangør: {challenge.owner.name}</Text>
              </View>
              {challenge.prize && (
                <View style={styles.detailItem}>
                  <Ionicons name="gift" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{challenge.prize}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Ionicons
                name="podium"
                size={20}
                color={activeTab === 'leaderboard' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
                Leaderboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
              onPress={() => setActiveTab('chat')}
            >
              <Ionicons
                name="chatbubbles"
                size={20}
                color={activeTab === 'chat' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
                Chat ({comments.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
              onPress={() => setActiveTab('gallery')}
            >
              <Ionicons
                name="images"
                size={20}
                color={activeTab === 'gallery' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
                Galleri ({photos.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'leaderboard' ? (
            <View style={styles.leaderboardContainer}>
              {challenge.participants.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Ingen deltagere endnu</Text>
                </View>
              ) : (
                challenge.participants.map((participant, index) => (
                  <View key={participant.id} style={styles.leaderboardItem}>
                    <View style={styles.rankContainer}>
                      {index < 3 ? (
                        <Ionicons
                          name="trophy"
                          size={24}
                          color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                        />
                      ) : (
                        <Text style={styles.rankText}>#{participant.rank || index + 1}</Text>
                      )}
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.user.name}</Text>
                      <Text style={styles.participantScore}>Score: {participant.score}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : activeTab === 'chat' ? (
            <View style={styles.chatContainer}>
              {comments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Ingen beskeder endnu</Text>
                  <Text style={styles.emptySubtext}>Vær den første til at skrive!</Text>
                </View>
              ) : (
                comments.map((comment) => {
                  const isOwnComment = comment.user.id === currentUserId;
                  return (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentBubble,
                        isOwnComment ? styles.ownCommentBubble : styles.otherCommentBubble,
                      ]}
                    >
                      {!isOwnComment && (
                        <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                      )}
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTime}>{formatCommentTime(comment.createdAt)}</Text>
                    </View>
                  );
                })
              )}
            </View>
          ) : (
            <View style={styles.galleryContainer}>
              {photos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Ingen billeder endnu</Text>
                  <Text style={styles.emptySubtext}>Upload fangster med billeder til denne udfordring!</Text>
                </View>
              ) : (
                <View style={styles.photoGrid}>
                  {photos.map((photo) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.photoCard}
                      onPress={() => setSelectedPhoto(photo.photoUrl)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: photo.photoUrl }} style={styles.photoImage} resizeMode="cover" />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoSpecies} numberOfLines={1}>{photo.species}</Text>
                        <Text style={styles.photoUser} numberOfLines={1}>{photo.userName}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        {activeTab === 'chat' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Skriv en besked..."
              placeholderTextColor={colors.textTertiary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newComment.trim() || sending) && styles.sendButtonDisabled]}
              onPress={sendComment}
              disabled={!newComment.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Photo Viewer Modal */}
        <Modal
          visible={selectedPhoto !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedPhoto(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={40} color={colors.white} />
            </TouchableOpacity>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

