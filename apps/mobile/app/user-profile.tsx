import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useDynamicStyles } from '../contexts/ThemeContext';
import PageLayout from '../components/PageLayout';
import XPProgressBar from '../components/XPProgressBar';
import RankBadge from '../components/RankBadge';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, AVATAR_STYLES } from '@/constants/theme';
import { api } from '../lib/api';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const styles = useDynamicStyles(createStyles);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [fiskedex, setFiskedex] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catches' | 'fiskedex'>('catches');
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, catchesRes, fiskedexRes] = await Promise.all([
        api.get(`/api/users/${userId}/profile`),
        api.get(`/api/users/${userId}/catches?limit=20`),
        api.get(`/api/users/${userId}/fiskedex`),
      ]);

      setProfile(profileRes.data);
      setIsFriend(profileRes.data.isFriend || false);
      setFriendRequestSent(profileRes.data.friendRequestPending || false);

      if (!profileRes.data.isPrivate) {
        setCatches(catchesRes.data);
        setFiskedex(fiskedexRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Indlæser profil...</Text>
      </View>
    );
  }

  const sendFriendRequest = async () => {
    try {
      setSendingRequest(true);
      await api.post('/api/friends/request', {
        recipientId: userId,
      });
      setFriendRequestSent(true);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setSendingRequest(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} style={styles.errorIcon} />
        <Text style={styles.errorText}>Bruger ikke fundet</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Gå tilbage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profile.isPrivate) {
    return (
      <PageLayout>
        <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <View style={styles.privateContainer}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} style={styles.avatarIcon} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <View style={styles.lockContainer}>
            <Ionicons name="lock-closed" size={48} style={styles.lockIcon} />
            <Text style={styles.privateMessage}>{profile.message}</Text>
          </View>
        </View>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} style={styles.avatarIcon} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          {profile.xp && (
            <View style={styles.rankBadgeContainer}>
              <RankBadge rank={profile.xp.rank} level={profile.xp.level} size="medium" />
            </View>
          )}
        </View>

        {/* XP Progress */}
        {profile.xp && (
          <View style={styles.xpContainer}>
            <XPProgressBar
              level={profile.xp.level}
              currentLevelXP={profile.xp.currentLevelXP}
              xpForNextLevel={profile.xp.xpForNextLevel}
              rank={profile.xp.rank}
            />
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="fish" size={24} style={styles.statIcon} />
            <Text style={styles.statNumber}>{profile.stats?.catches || 0}</Text>
            <Text style={styles.statLabel}>Fangster</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} style={styles.statIcon} />
            <Text style={styles.statNumber}>{profile.stats?.friends || 0}</Text>
            <Text style={styles.statLabel}>Venner</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} style={styles.statIcon} />
            <Text style={styles.statNumber}>{profile.stats?.badges || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Friend Request Button */}
        {userId !== currentUser?.id && !isFriend && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.friendRequestButton, friendRequestSent && styles.friendRequestSent]}
              onPress={sendFriendRequest}
              disabled={friendRequestSent || sendingRequest}
            >
              {sendingRequest ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={friendRequestSent ? "checkmark-circle" : "person-add"}
                    size={20}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.friendRequestButtonText}>
                    {friendRequestSent ? "Anmodning sendt" : "Tilføj som ven"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Already Friends Badge */}
        {isFriend && (
          <View style={styles.friendBadgeContainer}>
            <View style={styles.friendBadge}>
              <Ionicons name="people" size={18} style={styles.friendBadgeIcon} />
              <Text style={styles.friendBadgeText}>I er venner</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'catches' && styles.activeTab]}
            onPress={() => setActiveTab('catches')}
          >
            <Text style={[styles.tabText, activeTab === 'catches' && styles.activeTabText]}>
              Fangster
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fiskedex' && styles.activeTab]}
            onPress={() => setActiveTab('fiskedex')}
          >
            <Text style={[styles.tabText, activeTab === 'fiskedex' && styles.activeTabText]}>
              FiskeDex
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'catches' ? (
          <View style={styles.catchesContainer}>
            {catches.length === 0 ? (
              <Text style={styles.emptyText}>Ingen fangster endnu</Text>
            ) : (
              catches.map((catch_) => (
                <TouchableOpacity
                  key={catch_.id}
                  style={styles.catchCard}
                  onPress={() => router.push(`/catch-detail?id=${catch_.id}`)}
                >
                  {catch_.photoUrl && (
                    <Image source={{ uri: catch_.photoUrl }} style={styles.catchImage} />
                  )}
                  <View style={styles.catchInfo}>
                    <Text style={styles.catchSpecies}>{catch_.species}</Text>
                    {catch_.weightKg && (
                      <Text style={styles.catchDetail}>{catch_.weightKg} kg</Text>
                    )}
                    {catch_.lengthCm && (
                      <Text style={styles.catchDetail}>{catch_.lengthCm} cm</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.fiskedexContainer}>
            {fiskedex && fiskedex.species.length > 0 ? (
              <>
                <View style={styles.fiskedexHeader}>
                  <Text style={styles.fiskedexTitle}>
                    {fiskedex.uniqueSpecies} / {fiskedex.totalSpecies} arter
                  </Text>
                  <Text style={styles.fiskedexProgress}>
                    {Math.round(fiskedex.completionPercentage)}% gennemført
                  </Text>
                </View>
                {fiskedex.species.map((sp: any, index: number) => (
                  <View key={index} style={styles.speciesCard}>
                    <View style={styles.speciesInfo}>
                      <Text style={styles.speciesName}>{sp.species}</Text>
                      <Text style={styles.speciesCount}>{sp.count} fanget</Text>
                    </View>
                    <View style={styles.speciesStats}>
                      {sp.maxWeight > 0 && (
                        <Text style={styles.speciesStat}>Max: {sp.maxWeight} kg</Text>
                      )}
                      {sp.maxLength > 0 && (
                        <Text style={styles.speciesStat}>{sp.maxLength} cm</Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.emptyText}>Ingen arter fanget endnu</Text>
            )}
          </View>
        )}
      </ScrollView>
      </View>
    </PageLayout>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backBtn: {
      marginRight: SPACING.md,
    },
    backIcon: {
      color: theme.text,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: theme.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: theme.textSecondary,
      marginTop: SPACING.md,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: SPACING.xl,
    },
    errorIcon: {
      color: theme.error,
      marginBottom: SPACING.md,
    },
    errorText: {
      ...TYPOGRAPHY.styles.h2,
      color: theme.text,
      marginBottom: SPACING.xl,
    },
    backButton: {
      backgroundColor: theme.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
    },
    backButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: '#FFFFFF',
    },
    privateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    lockContainer: {
      alignItems: 'center',
      marginTop: SPACING.xl,
    },
    lockIcon: {
      color: theme.textSecondary,
      marginBottom: SPACING.md,
    },
    privateMessage: {
      ...TYPOGRAPHY.styles.body,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      backgroundColor: theme.surface,
      marginBottom: SPACING.md,
    },
    avatarContainer: {
      marginBottom: SPACING.md,
    },
    avatar: {
      ...AVATAR_STYLES.xlarge,
      borderWidth: 4,
      borderColor: theme.primary,
    },
    avatarPlaceholder: {
      ...AVATAR_STYLES.xlarge,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarIcon: {
      color: '#FFFFFF',
    },
    userName: {
      ...TYPOGRAPHY.styles.h1,
      color: theme.text,
      marginBottom: SPACING.sm,
    },
    rankBadgeContainer: {
      marginTop: SPACING.sm,
    },
    xpContainer: {
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    },
    statsCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
      flexDirection: 'row',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statIcon: {
      color: theme.primary,
      marginBottom: SPACING.xs,
    },
    statNumber: {
      ...TYPOGRAPHY.styles.h1,
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      color: theme.text,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.styles.small,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.border,
      marginHorizontal: SPACING.sm,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: RADIUS.md,
    },
    activeTab: {
      backgroundColor: theme.primary,
    },
    tabText: {
      ...TYPOGRAPHY.styles.button,
      color: theme.textSecondary,
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    catchesContainer: {
      paddingHorizontal: SPACING.md,
      paddingBottom: 100,
    },
    catchCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.sm,
    },
    catchImage: {
      width: '100%',
      height: 200,
      backgroundColor: theme.border,
    },
    catchInfo: {
      padding: SPACING.md,
    },
    catchSpecies: {
      ...TYPOGRAPHY.styles.h3,
      color: theme.text,
      marginBottom: SPACING.xs,
    },
    catchDetail: {
      ...TYPOGRAPHY.styles.body,
      color: theme.textSecondary,
    },
    fiskedexContainer: {
      paddingHorizontal: SPACING.md,
      paddingBottom: 100,
    },
    fiskedexHeader: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    fiskedexTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: theme.text,
      marginBottom: SPACING.xs,
    },
    fiskedexProgress: {
      ...TYPOGRAPHY.styles.body,
      color: theme.textSecondary,
    },
    speciesCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      ...SHADOWS.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    speciesInfo: {
      flex: 1,
    },
    speciesName: {
      ...TYPOGRAPHY.styles.h4,
      color: theme.text,
      marginBottom: SPACING.xs,
    },
    speciesCount: {
      ...TYPOGRAPHY.styles.small,
      color: theme.textSecondary,
    },
    speciesStats: {
      alignItems: 'flex-end',
    },
    speciesStat: {
      ...TYPOGRAPHY.styles.small,
      color: theme.text,
    },
    actionButtonContainer: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    friendRequestButton: {
      backgroundColor: theme.primary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      ...SHADOWS.sm,
    },
    friendRequestSent: {
      backgroundColor: theme.success || '#10B981',
    },
    buttonIcon: {
      color: '#fff',
    },
    friendRequestButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: '#fff',
    },
    friendBadgeContainer: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      alignItems: 'center',
    },
    friendBadge: {
      backgroundColor: theme.primaryLight + '30',
      borderRadius: RADIUS.full,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    friendBadgeIcon: {
      color: theme.primary,
    },
    friendBadgeText: {
      ...TYPOGRAPHY.styles.small,
      color: theme.primary,
      fontWeight: '600',
    },
    emptyText: {
      ...TYPOGRAPHY.styles.body,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  });
