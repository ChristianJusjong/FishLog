import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

import { API_URL } from '@/config/api';

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
    markAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    markAllText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.primary,
      fontWeight: '600',
    },
    filterContainer: {
      flexDirection: 'row',
      padding: SPACING.md,
      backgroundColor: colors.surface,
      gap: SPACING.sm,
    },
    filterButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.backgroundLight,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      ...TYPOGRAPHY.styles.button,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    notificationCard: {
      backgroundColor: colors.surface,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      ...SHADOWS.sm,
    },
    notificationCardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    notificationContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: 4,
    },
    notificationTitle: {
      ...TYPOGRAPHY.styles.h3,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    notificationMessage: {
      ...TYPOGRAPHY.styles.body,
      marginBottom: 4,
    },
    notificationTime: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textTertiary,
      fontSize: 11,
    },
    deleteButton: {
      padding: SPACING.xs,
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

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const url = filter === 'unread'
        ? `${API_URL}/notifications?unreadOnly=true`
        : `${API_URL}/notifications`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data);

        switch (notification.type) {
          case 'challenge_invite':
            router.push(`/challenge/${data.challengeId}`);
            break;
          case 'new_message':
            router.push('/messages');
            break;
          case 'personal_best':
            router.push('/statistics');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse notification data:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      challenge_invite: 'trophy',
      new_message: 'chatbubble',
      personal_best: 'ribbon',
      friend_request: 'person-add',
      event_reminder: 'calendar',
      badge_earned: 'medal',
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type: string) => {
    const notificationColors: { [key: string]: string } = {
      challenge_invite: colors.accent,
      new_message: colors.primary,
      personal_best: '#F59E0B',
      friend_request: colors.success,
      event_reminder: colors.info,
      badge_earned: '#8B5CF6',
    };
    return notificationColors[type] || colors.primary;
  };

  const formatTime = (dateString: string) => {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark || '#D4880F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="notifications" size={40} color={colors.primary} />
          </LinearGradient>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
          <Text style={styles.loadingText}>Indlæser notifikationer...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifikationer</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
              <Text style={styles.markAllText}>Markér alle som læst</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Alle ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterButtonText, filter === 'unread' && styles.filterButtonTextActive]}>
              Ulæste ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Ingen notifikationer</Text>
              <Text style={styles.emptySubtext}>
                Du vil modtage notifikationer her når noget sker
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${getNotificationColor(notification.type)}20` },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={24}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.headerRow}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      'Slet notifikation',
                      'Er du sikker på at du vil slette denne notifikation?',
                      [
                        { text: 'Annuller', style: 'cancel' },
                        { text: 'Slet', style: 'destructive', onPress: () => deleteNotification(notification.id) },
                      ]
                    );
                  }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
