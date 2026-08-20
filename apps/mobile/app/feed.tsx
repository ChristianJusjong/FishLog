import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput, Platform, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherLocationCard from '../components/WeatherLocationCard';
import PageLayout from '../components/PageLayout';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, FAB_STYLE, FAB, GRADIENTS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';

import { API_URL } from '@/config/api';
import CatchCard from '../components/CatchCard';
import CatchCardSkeleton from '../components/CatchCardSkeleton';
import ScreenLoading from '../components/ScreenLoading';
import { useCatchesFeed, FeedCatch } from '../hooks/useCatches';

interface User {
  id: string;
  name: string;
  avatar?: string;
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

// Location cache key
const LOCATION_CACHE_KEY = '@location_cache';

export default function FeedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const { connected, addEventListener } = useWebSocket();
  const { logout } = useAuth();
  const authErrorShown = useRef(false);
  const [activeTab, setActiveTab] = useState<'catches' | 'messages'>('catches');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('Alle');

  const SPECIES_FILTERS = ['Alle', 'Havørred', 'Gedde', 'Aborre', 'Sandart', 'Torsk', 'Laks', 'Fladfisk'];

  const {
    data: catchesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchCatches,
    isLoading: catchesLoading,
    isRefetching: catchesRefetching
  } = useCatchesFeed();

  const catches = catchesData?.pages.flatMap(p => p.catches) || [];

  const filteredCatches = useMemo(() => {
    if (selectedSpeciesFilter === 'Alle') return catches;
    return catches.filter(c => c.species?.toLowerCase().includes(selectedSpeciesFilter.toLowerCase()));
  }, [catches, selectedSpeciesFilter]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesRefreshing, setMessagesRefreshing] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'catches') {
        refetchCatches();
      } else {
        fetchConversations();
        fetchFriends();
      }
    }, [activeTab])
  );



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

  const fetchConversations = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setMessagesLoading(true);
    }
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
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
      setMessagesLoading(false);
      setMessagesRefreshing(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
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
    if (activeTab === 'catches') {
      await refetchCatches();
    } else {
      setMessagesRefreshing(true);
      await fetchConversations(true);
    }
  };

  const loadMore = () => {
    if (activeTab === 'catches' && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // WebSocket real-time updates
  useEffect(() => {
    if (!connected) return;

    // Listen for new catches in feed
    const unsubscribeNewCatch = addEventListener('new_catch', (data) => {
      refetchCatches(); // Simple: just refetch the feed query when there's an event
    });

    // Listen for new likes
    const unsubscribeNewLike = addEventListener('new_like', (data) => {
      refetchCatches();
    });

    // Listen for new comments
    const unsubscribeNewComment = addEventListener('new_comment', (data) => {
      refetchCatches();
    });

    // Listen for new messages
    const unsubscribeNewMessage = addEventListener('new_message', (data) => {
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

  const renderCatchItem = useCallback(({ item: catch_ }: { item: FeedCatch }) => (
    <CatchCard catchItem={catch_} colors={colors} styles={styles} />
  ), [colors]);

  if (catchesLoading && activeTab === 'catches') {
    return (
      <PageLayout>
        <View style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]}>
          {/* Weather & Location Card */}
          <WeatherLocationCard showLocation={true} showWeather={true} />

          {/* Tab Navigation Placeholder */}
          <View style={styles.tabContainer}>
            <View style={[styles.tab, styles.activeTab]}>
              <View style={styles.tabContent}>
                <Ionicons name="fish" size={20} color={colors.accent} style={styles.tabIcon} />
                <Text style={styles.activeTabText}>Fangster</Text>
              </View>
              <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
            </View>
            <View style={styles.tab}>
              <View style={styles.tabContent}>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.textSecondary} style={styles.tabIcon} />
                <Text style={styles.tabText}>Beskeder</Text>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: colors.backgroundLight }]}
            showsVerticalScrollIndicator={false}
          >
            <CatchCardSkeleton />
            <CatchCardSkeleton />
            <CatchCardSkeleton />
          </ScrollView>
        </View>
      </PageLayout>
    );
  }

  if (messagesLoading && activeTab === 'messages') {
    return (
      <PageLayout>
        <ScreenLoading message="Indlæser samtaler..." />
      </PageLayout>
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
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={activeTab === 'catches' ? 'fish' : 'fish-outline'}
                size={20}
                color={activeTab === 'catches' ? colors.accent : colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'catches' && styles.activeTabText]}>
                Fangster
              </Text>
            </View>
            {activeTab === 'catches' && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
            accessible={true}
            accessibilityLabel="Vis beskeder"
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'messages' }}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={activeTab === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'}
                size={20}
                color={activeTab === 'messages' ? colors.accent : colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
                Beskeder
              </Text>
            </View>
            {activeTab === 'messages' && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
          </TouchableOpacity>
        </View>

        {activeTab === 'catches' && (
          <View style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SPECIES_FILTERS.map((sp) => {
                const isSelected = selectedSpeciesFilter === sp;
                return (
                  <TouchableOpacity
                    key={sp}
                    onPress={() => setSelectedSpeciesFilter(sp)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.accent : colors.backgroundLight,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? colors.primary : colors.textSecondary,
                    }}>
                      {sp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {activeTab === 'catches' ? (
          <FlatList
            data={filteredCatches}
            renderItem={renderCatchItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.container, { backgroundColor: colors.backgroundLight }]}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={catchesRefetching}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.gray100 }]}>
                  <Ionicons name="fish-outline" size={64} color={colors.iconDefault} />
                </View>
                <Text style={[styles.emptyText, { color: colors.text }]}>Ingen fangster i feed</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tilføj venner for at se deres fangster</Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : null
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        ) : (
          <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: colors.backgroundLight }]}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={messagesRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            }
          >
            {conversations.length === 0 ? (
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
            }
          </ScrollView>
        )}

        {/* Floating Action Button - only show on messages tab */}
        {activeTab === 'messages' && (
          <TouchableOpacity
            style={[styles.fabContainer]}
            onPress={() => setShowNewMessageModal(true)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark || '#D4880F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={FAB.ICON_SIZE} color={colors.primary} />
            </LinearGradient>
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
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: RADIUS['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
      ...SHADOWS.glow,
    },
    loader: {
      marginBottom: SPACING.md,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    loadingMore: {
      padding: SPACING.lg,
      alignItems: 'center',
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
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      position: 'relative',
    },
    activeTab: {
      // active style
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    tabIcon: {
      marginRight: 4,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      left: SPACING.xl,
      right: SPACING.xl,
      height: 3,
      borderRadius: 1.5,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
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
    fabContainer: {
      position: 'absolute',
      bottom: 100,
      right: SPACING.lg,
      zIndex: 999,
      borderRadius: 30,
      ...SHADOWS.glow,
    },
    fabGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
