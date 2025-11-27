import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { FAB_STYLE, FAB } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

import { API_URL } from '@/config/api';

type Conversation = {
  partner: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

type Friend = {
  id: string;
  name: string;
  avatar?: string;
};

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.glow,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 20,
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...SHADOWS.sm,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
    },
    scrollView: {
      flex: 1,
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
    conversationCard: {
      backgroundColor: colors.surface,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      ...SHADOWS.sm,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    avatarPlaceholder: {
      backgroundColor: colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    badgeText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    partnerName: {
      ...TYPOGRAPHY.styles.h3,
    },
    time: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textTertiary,
      fontSize: 12,
    },
    lastMessage: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    lastMessageUnread: {
      color: colors.text,
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
      color: colors.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.styles.small,
      textAlign: 'center',
      paddingHorizontal: SPACING.xl,
    },
  });
};

export default function MessagesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    loadUserId();
    fetchConversations();
    fetchFriends();
  }, []);

  const loadUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) setCurrentUserId(userId);
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

  const fetchConversations = async () => {
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
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 6) {
      return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
    }
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}t`;
    if (minutes > 0) return `${minutes}m`;
    return 'Nu';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark || '#D4880F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="chatbubbles" size={40} color={colors.primary} />
          </LinearGradient>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
          <Text style={styles.loadingText}>Indlæser beskeder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Beskeder</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Ingen beskeder</Text>
              <Text style={styles.emptySubtext}>
                Start en samtale med dine venner
              </Text>
            </View>
          ) : (
            conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.partner.id}
                style={styles.conversationCard}
                onPress={() => router.push(`/chat/${conversation.partner.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  {conversation.partner.avatar ? (
                    <Image source={{ uri: conversation.partner.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={28} color={colors.textSecondary} />
                    </View>
                  )}
                  {conversation.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.partnerName}>{conversation.partner.name}</Text>
                    {conversation.lastMessage && (
                      <Text style={styles.time}>
                        {formatTime(conversation.lastMessage.createdAt)}
                      </Text>
                    )}
                  </View>
                  {conversation.lastMessage && (
                    <Text
                      style={[
                        styles.lastMessage,
                        conversation.unreadCount > 0 && styles.lastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage.senderId === currentUserId && 'Du: '}
                      {conversation.lastMessage.text}
                    </Text>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

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
                  <View style={styles.emptyContainer}>
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

        {/* Premium FAB Button */}
        <TouchableOpacity
          style={styles.fabContainer}
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
      </SafeAreaView>
    </View>
  );
}
