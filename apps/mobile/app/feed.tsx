import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, TextInput, Platform, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherLocationCard from '../components/WeatherLocationCard';
import PageLayout from '../components/PageLayout';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, FAB_STYLE, FAB } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useWebSocket } from '@/contexts/WebSocketContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

interface FeedCatch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user: User;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  comments: Comment[];
}

interface Message {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  isRead: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const { connected, addEventListener } = useWebSocket();
  const [activeTab, setActiveTab] = useState<'catches' | 'messages'>('catches');
  const [catches, setCatches] = useState<FeedCatch[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [locations, setLocations] = useState<{ [key: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'catches') {
        fetchFeed();
      } else {
        fetchConversations();
        fetchFriends();
      }
    }, [activeTab])
  );

  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=da`,
        {
          headers: {
            'User-Agent': 'FishLog App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        // Try to get city name (multiple possible fields)
        const city = address.city || address.town || address.village || address.municipality;
        const country = address.country;

        if (city && country) {
          return `${city}, ${country}`;
        } else if (city) {
          return city;
        } else if (country) {
          return country;
        }
      }
    } catch (error) {
      console.error('Failed to get location name:', error);
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
      year: 'numeric',
    });
  };

  const fetchFeed = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/feed`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatches(data);

        // Fetch location names for catches with coordinates
        const locationPromises: { [key: string]: Promise<string> } = {};
        data.forEach((catch_: FeedCatch) => {
          if (catch_.latitude && catch_.longitude) {
            locationPromises[catch_.id] = getLocationName(catch_.latitude, catch_.longitude);
          }
        });

        const locationResults: { [key: string]: string } = {};
        for (const [id, promise] of Object.entries(locationPromises)) {
          locationResults[id] = await promise;
        }
        setLocations(locationResults);
      } else {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}`;

        console.error('Feed fetch failed:', response.status, errorData);

        if (Platform.OS === 'web') {
          alert(`Fejl: Kunne ikke hente feed\n${errorMessage}`);
        } else {
          Alert.alert('Fejl', `Kunne ikke hente feed\n\n${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      console.error('Feed fetch error:', error);

      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Netværksfejl', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConversations = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        console.error('Conversations fetch failed:', response.status, errorData);

        if (Platform.OS === 'web') {
          alert(`Fejl: Kunne ikke hente beskeder\n${errorMessage}`);
        } else {
          Alert.alert('Fejl', `Kunne ikke hente beskeder\n\n${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      console.error('Conversations fetch error:', error);

      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Netværksfejl', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFriends = async () => {
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
        if (Array.isArray(data) && data.length > 0) {
          const friendsList = data.map((friendship: any) => {
            const friend = friendship.friend.id === userId ? friendship.user : friendship.friend;
            return {
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
            };
          });
          setFriends(friendsList);
        }
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'catches') {
      await fetchFeed(true);
    } else {
      await fetchConversations(true);
    }
  };

  // WebSocket real-time updates
  useEffect(() => {
    if (!connected) return;

    // Listen for new catches in feed
    const unsubscribeNewCatch = addEventListener('new_catch', (data) => {
      console.log('New catch received:', data);
      setCatches((prevCatches) => [data.catch, ...prevCatches]);
    });

    // Listen for new likes
    const unsubscribeNewLike = addEventListener('new_like', (data) => {
      console.log('New like received:', data);
      setCatches((prevCatches) =>
        prevCatches.map((c) =>
          c.id === data.catchId
            ? { ...c, likesCount: c.likesCount + 1 }
            : c
        )
      );
    });

    // Listen for new comments
    const unsubscribeNewComment = addEventListener('new_comment', (data) => {
      console.log('New comment received:', data);
      setCatches((prevCatches) =>
        prevCatches.map((c) =>
          c.id === data.catchId
            ? {
                ...c,
                commentsCount: c.commentsCount + 1,
                comments: [...(c.comments || []), data.comment],
              }
            : c
        )
      );
    });

    // Listen for new messages
    const unsubscribeNewMessage = addEventListener('new_message', (data) => {
      console.log('New message received:', data);
      // Refresh conversations when a new message arrives
      if (activeTab === 'messages') {
        fetchConversations(true);
      }
    });

    // Cleanup event listeners on unmount
    return () => {
      unsubscribeNewCatch();
      unsubscribeNewLike();
      unsubscribeNewComment();
      unsubscribeNewMessage();
    };
  }, [connected, activeTab, addEventListener]);

  const toggleLike = async (catchId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const catch_ = catches.find(c => c.id === catchId);

      if (!catch_) return;

      const method = catch_.isLikedByMe ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/catches/${catchId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Update local state
        setCatches(prevCatches =>
          prevCatches.map(c =>
            c.id === catchId
              ? {
                  ...c,
                  isLikedByMe: !c.isLikedByMe,
                  likesCount: c.isLikedByMe ? c.likesCount - 1 : c.likesCount + 1
                }
              : c
          )
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  const addComment = async (catchId: string) => {
    const text = commentText[catchId]?.trim();

    if (!text) {
      if (Platform.OS === 'web') {
        alert('Kommentar kan ikke være tom');
      } else {
        Alert.alert('Fejl', 'Kommentar kan ikke være tom');
      }
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const newComment = await response.json();

        // Update local state
        setCatches(prevCatches =>
          prevCatches.map(c =>
            c.id === catchId
              ? {
                  ...c,
                  comments: [...c.comments, newComment],
                  commentsCount: c.commentsCount + 1
                }
              : c
          )
        );

        // Clear comment input
        setCommentText(prev => ({ ...prev, [catchId]: '' }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  const toggleShowComments = (catchId: string) => {
    setShowComments(prev => ({ ...prev, [catchId]: !prev[catchId] }));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight + '20' }]}>
          <Ionicons name="fish" size={48} color={colors.primary} />
        </View>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Indlæser feed...</Text>
      </View>
    );
  }

  return (
    <PageLayout>
      <View style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]}>
        {/* Weather & Location Card */}
        <WeatherLocationCard showLocation={true} showWeather={true} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'catches' && styles.activeTab]}
            onPress={() => setActiveTab('catches')}
            accessible={true}
            accessibilityLabel="Vis fangster feed"
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'catches' }}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabEmoji}>🐟</Text>
              <Text style={[styles.tabText, activeTab === 'catches' && styles.activeTabText]}>
                Fangster
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
            accessible={true}
            accessibilityLabel="Vis beskeder"
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'messages' }}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabEmoji}>💬</Text>
              <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
                Beskeder
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: colors.backgroundLight }]}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
      {activeTab === 'catches' ? (
        catches.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.gray100 }]}>
              <Ionicons name="fish-outline" size={64} color={colors.iconDefault} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>Ingen fangster i feed</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tilføj venner for at se deres fangster</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
          {catches.map((catch_) => (
            <TouchableOpacity
              key={catch_.id}
              style={[styles.catchCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/catch-detail?id=${catch_.id}`)}
              activeOpacity={0.9}
            >
              {/* User info */}
              <View style={styles.userHeader}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => router.push(`/user-profile?userId=${catch_.user.id}`)}
                  activeOpacity={0.7}
                >
                  {catch_.user.avatar ? (
                    <Image source={{ uri: catch_.user.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatarPlaceholder, { backgroundColor: colors.primaryLight + '20' }]}>
                      <Ionicons name="person" size={20} color={colors.primary} />
                    </View>
                  )}
                  <Text style={[styles.userName, { color: colors.text }]}>{catch_.user.name}</Text>
                </TouchableOpacity>
                <Text style={[styles.catchDate, { color: colors.textSecondary }]}>
                  {new Date(catch_.createdAt).toLocaleDateString('da-DK')}
                </Text>
              </View>

              {/* Catch photo */}
              {catch_.photoUrl && (
                <Image
                  source={{ uri: catch_.photoUrl }}
                  style={[styles.catchImage, { backgroundColor: colors.backgroundLight }]}
                  resizeMode="contain"
                />
              )}

              {/* Catch details */}
              <View style={styles.catchContent}>
                <Text style={[styles.catchSpecies, { color: colors.text }]}>{catch_.species}</Text>

                <View style={styles.catchDetails}>
                  {catch_.lengthCm && (
                    <View style={[styles.catchDetailBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                      <Ionicons name="resize-outline" size={16} color={colors.primary} />
                      <Text style={[styles.catchDetailText, { color: colors.primary }]}>{catch_.lengthCm} cm</Text>
                    </View>
                  )}
                  {catch_.weightKg && (
                    <View style={[styles.catchDetailBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                      <Ionicons name="scale-outline" size={16} color={colors.primary} />
                      <Text style={[styles.catchDetailText, { color: colors.primary }]}>{Math.round(catch_.weightKg * 1000)} g</Text>
                    </View>
                  )}
                </View>

                {catch_.bait && (
                  <View style={styles.catchInfoRow}>
                    <Ionicons name="bug-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>Agn: {catch_.bait}</Text>
                  </View>
                )}
                {catch_.technique && (
                  <View style={styles.catchInfoRow}>
                    <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>Teknik: {catch_.technique}</Text>
                  </View>
                )}
                {catch_.notes && (
                  <Text style={[styles.catchNotes, { color: colors.text, backgroundColor: colors.backgroundLight }]}>{catch_.notes}</Text>
                )}
                {catch_.latitude && catch_.longitude && (
                  <View style={styles.catchInfoRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>
                      {locations[catch_.id] || 'Henter sted...'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.backgroundLight }]}
                  onPress={() => toggleLike(catch_.id)}
                  accessible={true}
                  accessibilityLabel={catch_.isLikedByMe ? `Fjern like. ${catch_.likesCount} likes` : `Like fangst. ${catch_.likesCount} likes`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: catch_.isLikedByMe }}
                >
                  <Ionicons
                    name={catch_.isLikedByMe ? "heart" : "heart-outline"}
                    size={22}
                    color={catch_.isLikedByMe ? colors.error : colors.iconDefault}
                  />
                  <Text style={[styles.actionText, { color: catch_.isLikedByMe ? colors.text : colors.textSecondary }]}>
                    {catch_.likesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.backgroundLight }]}
                  onPress={() => toggleShowComments(catch_.id)}
                  accessible={true}
                  accessibilityLabel={`Vis kommentarer. ${catch_.commentsCount} kommentarer`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showComments[catch_.id] }}
                >
                  <Ionicons
                    name={showComments[catch_.id] ? "chatbubble" : "chatbubble-outline"}
                    size={22}
                    color={showComments[catch_.id] ? colors.accent : colors.iconDefault}
                  />
                  <Text style={[styles.actionText, { color: showComments[catch_.id] ? colors.text : colors.textSecondary }]}>
                    {catch_.commentsCount}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments section */}
              {showComments[catch_.id] && (
                <View style={[styles.commentsSection, { backgroundColor: colors.backgroundLight }]}>
                  {catch_.comments.map((comment) => (
                    <View key={comment.id} style={[styles.comment, { backgroundColor: colors.surface }]}>
                      <TouchableOpacity onPress={() => router.push(`/user-profile?userId=${comment.userId}`)}>
                        <Text style={[styles.commentUser, { color: colors.text }]}>{comment.user.name}</Text>
                      </TouchableOpacity>
                      <Text style={[styles.commentText, { color: colors.text }]}>{comment.text}</Text>
                      <Text style={[styles.commentDate, { color: colors.textTertiary }]}>
                        {new Date(comment.createdAt).toLocaleDateString('da-DK')}
                      </Text>
                    </View>
                  ))}

                  {/* Add comment input */}
                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.text }]}
                      placeholder="Skriv en kommentar..."
                      placeholderTextColor={colors.textTertiary}
                      value={commentText[catch_.id] || ''}
                      onChangeText={(text) => setCommentText(prev => ({ ...prev, [catch_.id]: text }))}
                      multiline
                      accessible={true}
                      accessibilityLabel="Kommentar felt"
                      accessibilityHint="Skriv din kommentar her"
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.accent }]}
                      onPress={() => addComment(catch_.id)}
                      accessible={true}
                      accessibilityLabel="Send kommentar"
                      accessibilityRole="button"
                    >
                      <Text style={[styles.sendButtonText, { color: colors.textInverse }]}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
          </View>
        )
      ) : (
        // Messages tab content
        conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.iconDefault} />
            </View>
            <Text style={styles.emptyText}>Ingen beskeder</Text>
            <Text style={styles.emptySubtext}>Start en samtale med dine venner</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.userId}
                style={[styles.conversationCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/messages?userId=${conversation.userId}`)}
                activeOpacity={0.9}
              >
                <View style={styles.conversationHeader}>
                  {conversation.userAvatar ? (
                    <Image source={{ uri: conversation.userAvatar }} style={styles.conversationAvatar} />
                  ) : (
                    <View style={styles.conversationAvatarPlaceholder}>
                      <Ionicons name="person" size={24} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationTopRow}>
                      <Text style={styles.conversationName}>{conversation.userName}</Text>
                      <Text style={styles.conversationTime}>{formatDate(conversation.lastMessageAt)}</Text>
                    </View>
                    <View style={styles.conversationBottomRow}>
                      <Text
                        style={[styles.conversationMessage, conversation.unreadCount > 0 && styles.conversationMessageUnread]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )
      )}
      </ScrollView>

      {/* Floating Action Button - only show on messages tab */}
      {activeTab === 'messages' && (
        <TouchableOpacity
          style={[FAB_STYLE, { backgroundColor: colors.primary }, styles.fab]}
          onPress={() => setShowNewMessageModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={FAB.ICON_SIZE} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* New Message Modal */}
      <Modal
        visible={showNewMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ny Besked</Text>
              <TouchableOpacity onPress={() => setShowNewMessageModal(false)}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {friends.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Ingen venner</Text>
                </View>
              ) : (
                friends.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.friendItem}
                    onPress={() => {
                      setShowNewMessageModal(false);
                      router.push(`/chat/${friend.id}`);
                    }}
                  >
                    {friend.avatar ? (
                      <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    ) : (
                      <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                        <Ionicons name="person" size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </PageLayout>
  );
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: SPACING.md,
      paddingBottom: 80, // Extra padding for bottom navigation
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    loader: {
      marginBottom: SPACING.md,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS['2xl'],
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.styles.h2,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  feedList: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  catchCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  catchDate: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  catchImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.backgroundLight,
  },
  catchContent: {
    padding: SPACING.md,
  },
  catchSpecies: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  catchDetails: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  catchDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  catchDetailText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: colors.primary,
  },
  catchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  catchInfo: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
    flex: 1,
  },
  catchNotes: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: RADIUS.md,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
    minWidth: 64,
    borderRadius: RADIUS.full,
    backgroundColor: colors.backgroundLight,
  },
  actionText: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: colors.text,
  },
  commentsSection: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: colors.backgroundLight,
  },
  comment: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  commentText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  commentDate: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  locationContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: colors.secondary + '20', // Secondary color with transparency
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  locationLabel: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: SPACING.xs,
  },
  locationCoordinates: {
    fontSize: 13,
    color: colors.secondaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minHeight: 48,
    backgroundColor: colors.surface,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  createEventButton: {
    backgroundColor: colors.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  createEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  eventStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  eventStatusText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  eventDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    backgroundColor: colors.backgroundLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventDetailText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.backgroundLight,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  eventOrganizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventOrganizerText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  eventParticipantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventParticipantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventParticipantsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  eventParticipatingBadge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventParticipatingText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  conversationCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
  },
  conversationAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  conversationTime: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  conversationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  conversationMessageUnread: {
    fontWeight: '600',
    color: colors.text,
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: RADIUS.full,
    minWidth: 22,
    height: 22,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
    ...SHADOWS.lg,
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
    ...TYPOGRAPHY.styles.h2,
  },
  modalContent: {
    padding: SPACING.md,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    ...TYPOGRAPHY.styles.h3,
    flex: 1,
  },
  fab: {
    zIndex: 999,
  },
  });
};
