import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URL } from '../../config/api';
import { logger } from '../../utils/logger';
import PageLayout from '../../components/PageLayout';
import WeatherLocationCard from '../../components/WeatherLocationCard';

type GroupDetails = {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  isMember: boolean;
  isPending: boolean;
  role?: 'ADMIN' | 'MEMBER';
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
    joinedAt: string;
  }>;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
};

type Message = {
  id: string;
  message?: string;
  imageUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  catch?: {
    id: string;
    species: string;
    photoUrl?: string;
  };
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      ...SHADOWS.sm,
    },
    backButton: {
      padding: SPACING.xs,
      minWidth: 40,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: 12,
      marginTop: 2,
    },
    settingsButton: {
      padding: SPACING.xs,
      minWidth: 40,
      alignItems: 'flex-end',
    },
    groupInfoCard: {
      marginBottom: SPACING.sm,
      overflow: 'hidden',
      ...SHADOWS.sm,
    },
    groupInfoAccent: {
      height: 3,
      width: '100%',
    },
    groupInfoContent: {
      padding: SPACING.sm,
      paddingVertical: SPACING.md,
      alignItems: 'center',
    },
    logoContainer: {
      position: 'relative',
      marginBottom: SPACING.sm,
    },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    logoPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.white,
      ...SHADOWS.sm,
    },
    groupName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: SPACING.xs,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    groupDescription: {
      fontSize: 13,
      textAlign: 'center',
      marginBottom: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      lineHeight: 18,
    },
    statsRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
      width: '100%',
      justifyContent: 'center',
    },
    statCard: {
      flex: 1,
      maxWidth: 100,
      alignItems: 'center',
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: SPACING.xs,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginTop: 2,
    },
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      ...SHADOWS.sm,
    },
    adminBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.white,
    },
    actionButtonsContainer: {
      width: '100%',
      marginTop: SPACING.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      ...SHADOWS.sm,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.sm,
      ...SHADOWS.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabIconContainer: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
    },
    activeTabText: {
      fontWeight: '700',
    },
    contentContainer: {
      padding: SPACING.md,
    },
    createPostCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      ...SHADOWS.lg,
    },
    postInput: {
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      fontSize: 15,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: SPACING.md,
    },
    postButton: {
      flexDirection: 'row',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.full,
      alignSelf: 'flex-end',
      alignItems: 'center',
      ...SHADOWS.md,
    },
    postButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    postCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      ...SHADOWS.lg,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    postUserInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    postAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    postAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    postUserName: {
      fontSize: 15,
      fontWeight: '700',
    },
    postDate: {
      fontSize: 12,
      marginTop: 2,
    },
    postContent: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: SPACING.md,
    },
    postFooter: {
      flexDirection: 'row',
      gap: SPACING.lg,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.backgroundLight,
    },
    postAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    postStatText: {
      fontSize: 13,
      fontWeight: '500',
    },
    chatContainer: {
      padding: SPACING.md,
      paddingBottom: 200, // Space for chat input + bottom nav (increased)
      flexGrow: 1,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: SPACING.md,
      gap: SPACING.sm,
      alignItems: 'flex-end',
    },
    myMessageRow: {
      flexDirection: 'row-reverse',
    },
    messageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    messageAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageBubble: {
      maxWidth: '70%',
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      ...SHADOWS.sm,
    },
    messageSender: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 21,
      marginBottom: SPACING.xs,
    },
    messageTime: {
      fontSize: 11,
      fontWeight: '500',
      alignSelf: 'flex-end',
    },
    chatInputContainer: {
      position: 'absolute',
      bottom: 120, // Position 120px from bottom, above navigation bar
      left: 0,
      right: 0,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderTopWidth: 2,
      ...SHADOWS.lg,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      marginTop: SPACING.md,
      ...SHADOWS.sm,
    },
    leaveButtonText: {
      fontSize: 15,
      fontWeight: '700',
    },
    chatInputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: SPACING.sm,
    },
    messageInput: {
      flex: 1,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      borderColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.md,
      fontSize: 16,
      maxHeight: 120,
      minHeight: 56,
      lineHeight: 24,
      textAlignVertical: 'center',
      ...SHADOWS.sm,
    },
    sendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      minWidth: 80,
      ...SHADOWS.md,
    },
    sendButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      ...SHADOWS.lg,
    },
    memberAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    memberAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberInfo: {
      flex: 1,
      marginLeft: SPACING.md,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    memberRoleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    memberRole: {
      fontSize: 13,
      fontWeight: '500',
    },
    memberAdminBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING['2xl'],
      borderRadius: RADIUS.xl,
      marginHorizontal: SPACING.md,
      ...SHADOWS.lg,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    emptyText: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: SPACING.xs,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 500,
      borderRadius: RADIUS.xl,
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
      fontSize: 18,
      fontWeight: '700',
    },
    modalContent: {
      padding: SPACING.lg,
    },
    settingSection: {
      marginBottom: SPACING.xl,
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: SPACING.sm,
    },
    settingInput: {
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: 15,
      marginBottom: SPACING.md,
    },
    settingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      ...SHADOWS.sm,
    },
    settingButtonText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
};

export default function GroupDetailScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat' | 'members'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [posting, setPosting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchGroupDetails();
    getCurrentUserId();
  }, [id]);

  useEffect(() => {
    if (group?.isMember) {
      if (activeTab === 'posts') {
        fetchPosts();
      } else if (activeTab === 'chat') {
        fetchMessages();
      }
    }
  }, [activeTab, group]);

  const getCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      logger.error('Failed to get current user ID:', error);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente gruppe detaljer');
      }
    } catch (error) {
      logger.error('Failed to fetch group details:', error);
      Alert.alert('Fejl', 'Kunne ikke hente gruppe detaljer');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}/posts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      logger.error('Failed to fetch posts:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}/messages`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      logger.error('Failed to fetch messages:', error);
    }
  };

  const createPost = async () => {
    if (!newPostText.trim()) {
      Alert.alert('Fejl', 'Skriv noget i dit opslag');
      return;
    }

    setPosting(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPostText }),
      });

      if (response.ok) {
        setNewPostText('');
        fetchPosts();
      } else {
        Alert.alert('Fejl', 'Kunne ikke oprette opslag');
      }
    } catch (error) {
      logger.error('Failed to create post:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette opslag');
    } finally {
      setPosting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessageText.trim()) {
      logger.warn('Send message called with empty text');
      return;
    }

    logger.info('Sending message:', newMessageText);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessageText }),
      });

      logger.info('Send message response status:', response.status);
      if (response.ok) {
        logger.info('Message sent successfully');
        setNewMessageText('');
        fetchMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Failed to send message:', errorData);
        Alert.alert('Fejl', 'Kunne ikke sende besked');
      }
    } catch (error) {
      logger.error('Failed to send message:', error);
      Alert.alert('Fejl', 'Kunne ikke sende besked');
    }
  };

  const uploadLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dine billeder');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Upload logo implementation
      Alert.alert('Info', 'Logo upload kommer snart');
    }
  };

  const leaveGroup = async () => {
    Alert.alert(
      'Forlad gruppe',
      'Er du sikker på, at du vil forlade denne gruppe?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Forlad',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_URL}/groups/${id}/leave`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Du har forladt gruppen');
                router.back();
              } else {
                Alert.alert('Fejl', 'Kunne ikke forlade gruppen');
              }
            } catch (error) {
              logger.error('Failed to leave group:', error);
              Alert.alert('Fejl', 'Kunne ikke forlade gruppen');
            }
          },
        },
      ]
    );
  };

  const updateGroupName = async () => {
    if (!editedGroupName.trim()) {
      Alert.alert('Fejl', 'Gruppenavn kan ikke være tomt');
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/groups/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedGroupName }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Gruppenavn opdateret');
        setShowSettings(false);
        fetchGroupDetails();
      } else {
        Alert.alert('Fejl', 'Kunne ikke opdatere gruppenavn');
      }
    } catch (error) {
      logger.error('Failed to update group name:', error);
      Alert.alert('Fejl', 'Kunne ikke opdatere gruppenavn');
    }
  };

  const deleteGroup = async () => {
    Alert.alert(
      'Slet gruppe',
      'Er du sikker på, at du vil slette denne gruppe? Dette kan ikke fortrydes.',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_URL}/groups/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Gruppen er blevet slettet');
                router.back();
              } else {
                Alert.alert('Fejl', 'Kunne ikke slette gruppen');
              }
            } catch (error) {
              logger.error('Failed to delete group:', error);
              Alert.alert('Fejl', 'Kunne ikke slette gruppen');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
  };

  if (loading) {
    return (
      <PageLayout>
        <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundLight }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundLight }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>Gruppe ikke fundet</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.backgroundLight }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <WeatherLocationCard />

        {/* Group Info Card */}
      <View style={[styles.groupInfoCard, { backgroundColor: colors.white }]}>
        <View style={[styles.groupInfoAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.groupInfoContent}>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={group.role === 'ADMIN' ? uploadLogo : undefined}
            disabled={group.role !== 'ADMIN'}
          >
            {group.logoUrl ? (
              <Image source={{ uri: group.logoUrl }} style={styles.logo} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="people" size={28} color={colors.primary} />
              </View>
            )}
            {group.role === 'ADMIN' && (
              <View style={[styles.editIconContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={12} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
          {group.description && (
            <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
              {group.description}
            </Text>
          )}

          {group.role === 'ADMIN' && (
            <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
              <Ionicons name="star" size={14} color={colors.white} />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {group.role === 'ADMIN' ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowSettings(true)}
              >
                <Ionicons name="settings-outline" size={18} color={colors.white} />
                <Text style={[styles.actionButtonText, { color: colors.white }]}>Indstillinger</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={leaveGroup}
              >
                <Ionicons name="exit-outline" size={18} color={colors.white} />
                <Text style={[styles.actionButtonText, { color: colors.white }]}>Forlad gruppe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <View style={[styles.tabIconContainer, activeTab === 'posts' && { backgroundColor: colors.primary + '15' }]}>
            <Ionicons
              name={activeTab === 'posts' ? "newspaper" : "newspaper-outline"}
              size={20}
              color={activeTab === 'posts' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'posts' ? colors.primary : colors.textSecondary },
              activeTab === 'posts' && styles.activeTabText,
            ]}
          >
            Forum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <View style={[styles.tabIconContainer, activeTab === 'chat' && { backgroundColor: colors.primary + '15' }]}>
            <Ionicons
              name={activeTab === 'chat' ? "chatbubbles" : "chatbubbles-outline"}
              size={20}
              color={activeTab === 'chat' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'chat' ? colors.primary : colors.textSecondary },
              activeTab === 'chat' && styles.activeTabText,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <View style={[styles.tabIconContainer, activeTab === 'members' && { backgroundColor: colors.primary + '15' }]}>
            <Ionicons
              name={activeTab === 'members' ? "people" : "people-outline"}
              size={20}
              color={activeTab === 'members' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'members' ? colors.primary : colors.textSecondary },
              activeTab === 'members' && styles.activeTabText,
            ]}
          >
            Medlemmer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content - Conditional rendering based on active tab */}
      {activeTab === 'chat' ? (
        // Chat uses FlatList for scrolling
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={[styles.emptyState, { backgroundColor: colors.white, marginTop: SPACING['2xl'] }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ingen beskeder endnu</Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                  Start en samtale med gruppen
                </Text>
              </View>
            }
            renderItem={({ item: msg }) => {
              const isMyMessage = msg.sender.id === currentUserId;
              return (
                <View style={[styles.messageRow, isMyMessage && styles.myMessageRow]}>
                  {!isMyMessage && (
                    <>
                      {msg.sender.avatar ? (
                        <Image source={{ uri: msg.sender.avatar }} style={styles.messageAvatar} />
                      ) : (
                        <View style={[styles.messageAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name="person" size={16} color={colors.primary} />
                        </View>
                      )}
                    </>
                  )}
                  <View style={[
                    styles.messageBubble,
                    isMyMessage
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.white }
                  ]}>
                    {!isMyMessage && (
                      <Text style={[styles.messageSender, { color: colors.primary }]}>
                        {msg.sender.name}
                      </Text>
                    )}
                    {msg.message && (
                      <Text style={[
                        styles.messageText,
                        { color: isMyMessage ? colors.white : colors.text }
                      ]}>
                        {msg.message}
                      </Text>
                    )}
                    <Text style={[
                      styles.messageTime,
                      { color: isMyMessage ? colors.white + 'CC' : colors.textTertiary }
                    ]}>
                      {new Date(msg.createdAt).toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  {isMyMessage && (
                    <>
                      {msg.sender.avatar ? (
                        <Image source={{ uri: msg.sender.avatar }} style={styles.messageAvatar} />
                      ) : (
                        <View style={[styles.messageAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name="person" size={16} color={colors.primary} />
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            }}
          />

          {/* Chat Input */}
          {group?.isMember && (
            <View style={[styles.chatInputContainer, { backgroundColor: colors.white, borderTopColor: colors.border }]}>
              <View style={styles.chatInputWrapper}>
                <TextInput
                  style={[styles.messageInput, { color: colors.text, backgroundColor: colors.white }]}
                  placeholder="Skriv en besked..."
                  placeholderTextColor={colors.textTertiary}
                  value={newMessageText}
                  onChangeText={setNewMessageText}
                  maxLength={500}
                  multiline
                  returnKeyType="send"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    if (newMessageText.trim()) {
                      sendMessage();
                    }
                  }}
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.primary }]}
                  onPress={sendMessage}
                  disabled={!newMessageText.trim()}
                >
                  <Ionicons name="send" size={18} color={colors.white} />
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        // Posts and Members use ScrollView
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.contentContainer}>
            {activeTab === 'posts' && (
              <View>
                {/* Create Post */}
                <View style={[styles.createPostCard, { backgroundColor: colors.white }]}>
                  <TextInput
                    style={[styles.postInput, { color: colors.text, backgroundColor: colors.backgroundLight }]}
                    placeholder="Skriv et opslag..."
                    placeholderTextColor={colors.textTertiary}
                    value={newPostText}
                    onChangeText={setNewPostText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.postButton, { backgroundColor: colors.primary }]}
                    onPress={createPost}
                    disabled={posting || !newPostText.trim()}
                  >
                    {posting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color={colors.white} />
                        <Text style={styles.postButtonText}>Opslå</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Posts List */}
                {posts.map((post) => (
                  <View key={post.id} style={[styles.postCard, { backgroundColor: colors.white }]}>
                    <View style={styles.postHeader}>
                      <View style={styles.postUserInfo}>
                        {post.user.avatar ? (
                          <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
                        ) : (
                          <View style={[styles.postAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="person" size={16} color={colors.primary} />
                          </View>
                        )}
                        <View>
                          <Text style={[styles.postUserName, { color: colors.text }]}>{post.user.name}</Text>
                          <Text style={[styles.postDate, { color: colors.textSecondary }]}>
                            {new Date(post.createdAt).toLocaleDateString('da-DK', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
                    <View style={styles.postFooter}>
                      <TouchableOpacity style={styles.postAction}>
                        <Ionicons name={post.isLikedByMe ? "heart" : "heart-outline"} size={18} color={post.isLikedByMe ? colors.error : colors.textSecondary} />
                        <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
                          {post.likesCount}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.postAction}>
                        <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
                          {post.commentsCount}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {posts.length === 0 && (
                  <View style={[styles.emptyState, { backgroundColor: colors.white }]}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '10' }]}>
                      <Ionicons name="newspaper-outline" size={40} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ingen opslag endnu</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                      Vær den første til at dele noget med gruppen
                    </Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'members' && (
              <View>
                {group.members.map((member) => (
                  <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.white }]}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="person" size={24} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                      <View style={styles.memberRoleContainer}>
                        <Ionicons
                          name={member.role === 'ADMIN' ? "star" : "person-outline"}
                          size={12}
                          color={member.role === 'ADMIN' ? colors.accent : colors.textTertiary}
                        />
                        <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
                          {member.role === 'ADMIN' ? 'Administrator' : 'Medlem'}
                        </Text>
                      </View>
                    </View>
                    {member.role === 'ADMIN' && (
                      <View style={[styles.memberAdminBadge, { backgroundColor: colors.accent }]}>
                        <Ionicons name="star" size={12} color={colors.white} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Gruppe indstillinger</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Change Group Name */}
              <View style={styles.settingSection}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Gruppenavn</Text>
                <TextInput
                  style={[styles.settingInput, { color: colors.text, backgroundColor: colors.backgroundLight, borderColor: colors.border }]}
                  placeholder={group?.name}
                  placeholderTextColor={colors.textTertiary}
                  value={editedGroupName}
                  onChangeText={setEditedGroupName}
                />
                <TouchableOpacity
                  style={[styles.settingButton, { backgroundColor: colors.primary }]}
                  onPress={updateGroupName}
                  disabled={!editedGroupName.trim()}
                >
                  <Text style={[styles.settingButtonText, { color: colors.white }]}>Opdater navn</Text>
                </TouchableOpacity>
              </View>

              {/* Change Group Photo */}
              <View style={styles.settingSection}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Gruppe billede</Text>
                <TouchableOpacity
                  style={[styles.settingButton, { backgroundColor: colors.primary }]}
                  onPress={uploadLogo}
                >
                  <Ionicons name="camera" size={18} color={colors.white} />
                  <Text style={[styles.settingButtonText, { color: colors.white }]}>Skift billede</Text>
                </TouchableOpacity>
              </View>

              {/* Delete Group */}
              <View style={styles.settingSection}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Farlig zone</Text>
                <TouchableOpacity
                  style={[styles.settingButton, { backgroundColor: colors.error }]}
                  onPress={deleteGroup}
                >
                  <Ionicons name="trash" size={18} color={colors.white} />
                  <Text style={[styles.settingButtonText, { color: colors.white }]}>Slet gruppe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </PageLayout>
  );
}

