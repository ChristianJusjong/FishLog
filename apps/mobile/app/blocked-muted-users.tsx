import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface BlockedUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  reason: string | null;
  blockedAt: string;
}

interface MutedUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  mutedAt: string;
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.md,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      gap: SPACING.sm,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    loadingText: {
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
      marginTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: SPACING.md,
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: SPACING.sm,
      textAlign: 'center',
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.md,
      borderRadius: RADIUS.md,
      ...SHADOWS.sm,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: SPACING.md,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 14,
      marginBottom: 4,
    },
    reason: {
      fontSize: 13,
      fontStyle: 'italic',
      marginBottom: 4,
    },
    date: {
      fontSize: 12,
    },
    actionButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.sm,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    bottomPadding: {
      height: SPACING.xl,
    },
  });
};

export default function BlockedMutedUsersScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'blocked' | 'muted'>('blocked');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'blocked') {
        await fetchBlockedUsers();
      } else {
        await fetchMutedUsers();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/blocked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blocked users');
      }

      const data = await response.json();
      setBlockedUsers(data.blockedUsers);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const fetchMutedUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/muted`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch muted users');
      }

      const data = await response.json();
      setMutedUsers(data.mutedUsers);
    } catch (error) {
      console.error('Error fetching muted users:', error);
    }
  };

  const handleUnblock = async (userId: string) => {
    Alert.alert(
      'Fjern Blokering',
      'Er du sikker på, at du vil fjerne blokeringen af denne bruger?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern Blokering',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/users/block/${userId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to unblock user');
              }

              Alert.alert('Succes', 'Bruger er ikke længere blokeret');
              fetchBlockedUsers();
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Fejl', 'Kunne ikke fjerne blokering');
            }
          },
        },
      ]
    );
  };

  const handleUnmute = async (userId: string) => {
    Alert.alert(
      'Fjern Lydløs',
      'Er du sikker på, at du vil fjerne lydløs af denne bruger?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern Lydløs',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/users/mute/${userId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to unmute user');
              }

              Alert.alert('Succes', 'Bruger er ikke længere sat på lydløs');
              fetchMutedUsers();
            } catch (error) {
              console.error('Error unmuting user:', error);
              Alert.alert('Fejl', 'Kunne ikke fjerne lydløs');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderBlockedUser = (item: BlockedUser) => (
    <View
      key={item.id}
      style={[styles.userCard, { backgroundColor: colors.surface }]}
    >
      <Image
        source={{
          uri: item.user.avatar || 'https://via.placeholder.com/100',
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {item.user.email}
        </Text>
        {item.reason && (
          <Text style={[styles.reason, { color: colors.textSecondary }]}>
            Årsag: {item.reason}
          </Text>
        )}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          Blokeret {new Date(item.blockedAt).toLocaleDateString('da-DK')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.accent }]}
        onPress={() => handleUnblock(item.user.id)}
      >
        <Text style={[styles.actionButtonText, { color: colors.white }]}>
          Fjern
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMutedUser = (item: MutedUser) => (
    <View
      key={item.id}
      style={[styles.userCard, { backgroundColor: colors.surface }]}
    >
      <Image
        source={{
          uri: item.user.avatar || 'https://via.placeholder.com/100',
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {item.user.email}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          Sat på lydløs {new Date(item.mutedAt).toLocaleDateString('da-DK')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.secondary }]}
        onPress={() => handleUnmute(item.user.id)}
      >
        <Text style={[styles.actionButtonText, { color: colors.white }]}>
          Fjern
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Blokerede & Lydløse Brugere',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'blocked' && {
              borderBottomColor: colors.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('blocked')}
        >
          <Ionicons
            name="ban"
            size={20}
            color={activeTab === 'blocked' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'blocked' ? colors.accent : colors.textSecondary,
              },
            ]}
          >
            Blokeret ({blockedUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'muted' && {
              borderBottomColor: colors.secondary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('muted')}
        >
          <Ionicons
            name="volume-mute"
            size={20}
            color={activeTab === 'muted' ? colors.secondary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'muted' ? colors.secondary : colors.textSecondary,
              },
            ]}
          >
            Lydløs ({mutedUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Indlæser...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'blocked' ? (
            blockedUsers.length > 0 ? (
              blockedUsers.map(renderBlockedUser)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="ban" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Ingen blokerede brugere
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: colors.textSecondary }]}
                >
                  Brugere du blokerer vises her
                </Text>
              </View>
            )
          ) : mutedUsers.length > 0 ? (
            mutedUsers.map(renderMutedUser)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="volume-mute"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ingen lydløse brugere
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Brugere du sætter på lydløs vises her
              </Text>
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}
