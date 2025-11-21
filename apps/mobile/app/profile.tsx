import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SwipeableScreen from '../components/SwipeableScreen';
import WeatherLocationCard from '../components/WeatherLocationCard';
import PageLayout from '../components/PageLayout';
import XPProgressBar from '../components/XPProgressBar';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, AVATAR_STYLES } from '@/constants/theme';
import { api } from '../lib/api';
import i18n from '../i18n';
import { logger } from '../utils/logger';

// Title/Rank definitions matching backend
interface Title {
  name: string;
  emoji: string;
  minLevel: number;
  maxLevel: number;
}

const TITLES: Title[] = [
  { name: 'Madding', emoji: '🪱', minLevel: 1, maxLevel: 2 },
  { name: 'Agn', emoji: '🎣', minLevel: 3, maxLevel: 5 },
  { name: 'Kystfisker', emoji: '🏖️', minLevel: 6, maxLevel: 10 },
  { name: 'Sportsfisker', emoji: '🎽', minLevel: 11, maxLevel: 15 },
  { name: 'Krogmester', emoji: '🪝', minLevel: 16, maxLevel: 20 },
  { name: 'Stangmand', emoji: '🎋', minLevel: 21, maxLevel: 25 },
  { name: 'Fiskekaptajn', emoji: '⚓', minLevel: 26, maxLevel: 30 },
  { name: 'Havets Jæger', emoji: '🏹', minLevel: 31, maxLevel: 40 },
  { name: 'Geddemester', emoji: '🐟', minLevel: 41, maxLevel: 50 },
  { name: 'Torskekong', emoji: '👑', minLevel: 51, maxLevel: 60 },
  { name: 'Ørredmagiker', emoji: '✨', minLevel: 61, maxLevel: 75 },
  { name: 'Fiskelegend', emoji: '🌟', minLevel: 76, maxLevel: 85 },
  { name: 'Havets Hersker', emoji: '🔱', minLevel: 86, maxLevel: 99 },
  { name: 'Neptun', emoji: '🧜‍♂️', minLevel: 100, maxLevel: 999 },
];

function getTitleForLevel(level: number): Title {
  const title = TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
  return title || TITLES[0];
}

function getTitleDisplay(level: number): string {
  const title = getTitleForLevel(level);
  return `${title.emoji} ${title.name}`;
}

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
  safeArea: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loader: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.styles.body,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    ...AVATAR_STYLES.xlarge,
    marginBottom: SPACING.md,
    borderWidth: 4,
    ...SHADOWS.md,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.styles.body,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: SPACING.xs,
  },
  statNumber: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.small,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...SHADOWS.sm,
    flexDirection: 'row',
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: colors.white,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: colors.primary,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: colors.textPrimary,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingValue: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...SHADOWS.sm,
    flexDirection: 'row',
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  logoutButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: colors.white,
  },
  versionText: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  titleCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    alignItems: 'center',
  },
  titleEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  titleText: {
    ...TYPOGRAPHY.styles.h2,
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
  },
  titleDescription: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgesSection: {
    marginBottom: SPACING.md,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 80,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeName: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyBadges: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SPACING.lg,
  },
  fiskedexSection: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  fiskedexItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fiskedexItemLast: {
    borderBottomWidth: 0,
  },
  fiskedexIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  fiskedexInfo: {
    flex: 1,
  },
  fiskedexSpecies: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: colors.textPrimary,
  },
  fiskedexCount: {
    ...TYPOGRAPHY.styles.small,
    color: colors.textSecondary,
  },
  emptyFiskedex: {
    ...TYPOGRAPHY.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
};

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [xpData, setXpData] = useState<any>(null);
  const [xpLoading, setXpLoading] = useState(true);
  const [catches, setCatches] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [fiskedex, setFiskedex] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  // Fetch XP data
  useEffect(() => {
    const fetchXPData = async () => {
      if (!user) return;

      try {
        setXpLoading(true);
        const response = await api.get('/api/xp/me');
        setXpData(response.data);
      } catch (error) {
        logger.error('Failed to fetch XP data:', error);
      } finally {
        setXpLoading(false);
      }
    };

    fetchXPData();
  }, [user]);

  // Fetch profile data (catches, badges, fiskedex, friends)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch catches
        const catchesResponse = await api.get('/api/catches?userId=me');
        const userCatches = catchesResponse.data || [];
        setCatches(userCatches);

        // Calculate total score from catches
        const score = userCatches.reduce((sum: number, catch_: any) => {
          return sum + (catch_.score || 0);
        }, 0);
        setTotalScore(score);

        // Fetch badges
        try {
          const badgesResponse = await api.get('/api/users/me/badges');
          setBadges(badgesResponse.data.badges || []);
        } catch (error) {
          logger.error('Failed to fetch badges:', error);
          setBadges([]);
        }

        // Fetch fiskedex
        try {
          const fiskedexResponse = await api.get('/api/catches/fiskedex');
          const caughtSpecies = fiskedexResponse.data.species?.filter((s: any) => s.caught) || [];
          setFiskedex(caughtSpecies);
        } catch (error) {
          logger.error('Failed to fetch fiskedex:', error);
          setFiskedex([]);
        }

        // Fetch friends count
        try {
          const friendsResponse = await api.get('/api/friends');
          setFriendsCount(friendsResponse.data.friends?.length || 0);
        } catch (error) {
          logger.error('Failed to fetch friends:', error);
          setFriendsCount(0);
        }

      } catch (error) {
        logger.error('Failed to fetch profile data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Debug: Log user data
  useEffect(() => {
    if (user) {
      logger.debug('===== PROFILE USER DATA =====');
      logger.debug('user.name:', user.name);
      logger.debug('user.email:', user.email);
      logger.debug('user object:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight + '20' }]}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Indlæser profil...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SwipeableScreen currentScreen="/profile">
      <PageLayout>
        <View style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]}>
          {/* Weather & Location Card */}
          <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Ionicons name="person" size={48} color={colors.white} />
            </View>
          )}
          <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>{user.email}</Text>

          {/* Level Badge with Title */}
          {!xpLoading && xpData && (
            <View style={{ marginTop: SPACING.sm }}>
              <Text style={[styles.userEmail, { color: colors.primary, fontWeight: TYPOGRAPHY.fontWeight.semibold }]}>
                {getTitleDisplay(xpData.level)}
              </Text>
            </View>
          )}
        </View>

        {/* XP Progress Bar */}
        {!xpLoading && xpData && (
          <View style={{ marginBottom: SPACING.md }}>
            <XPProgressBar
              level={xpData.level}
              currentLevelXP={xpData.currentLevelXP}
              xpForNextLevel={xpData.xpForNextLevel}
              rank={xpData.rank}
            />
          </View>
        )}

        {/* Profile Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={colors.secondary} style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{Math.round(totalScore)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Score</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="fish" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{catches.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('profile.catches')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color={colors.accent} style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{friendsCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('profile.friends')}</Text>
          </View>
        </View>

        {/* Title/Rank Card */}
        {!xpLoading && xpData && (
          <View style={[styles.titleCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.titleEmoji}>{getTitleForLevel(xpData.level).emoji}</Text>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              {getTitleForLevel(xpData.level).name}
            </Text>
            <Text style={[styles.titleDescription, { color: colors.textSecondary }]}>
              Din titel ved level {xpData.level}
            </Text>
          </View>
        )}

        {/* Badges Section */}
        <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Badges</Text>
          {badges.length > 0 ? (
            <FlatList
              horizontal
              data={badges}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.badgeItem}>
                  <View style={[styles.badgeIconContainer, { backgroundColor: colors.backgroundLight }]}>
                    <Text style={styles.badgeIcon}>{item.icon || '🏆'}</Text>
                  </View>
                  <Text style={[styles.badgeName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={[styles.emptyBadges, { color: colors.textSecondary }]}>
              Ingen badges endnu. Fang nogle fisk for at optjene badges!
            </Text>
          )}
        </View>

        {/* Fiskedex Section */}
        <View style={[styles.fiskedexSection, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.push('/fiskedex')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>FiskeDex</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          {fiskedex.length > 0 ? (
            <>
              {fiskedex.slice(0, 5).map((species, index) => (
                <View
                  key={species.id}
                  style={[
                    styles.fiskedexItem,
                    index === Math.min(4, fiskedex.length - 1) && styles.fiskedexItemLast,
                    { borderBottomColor: colors.border }
                  ]}
                >
                  <View style={[styles.fiskedexIcon, { backgroundColor: colors.backgroundLight }]}>
                    <Text style={{ fontSize: 20 }}>🐟</Text>
                  </View>
                  <View style={styles.fiskedexInfo}>
                    <Text style={[styles.fiskedexSpecies, { color: colors.textPrimary }]}>
                      {species.name}
                    </Text>
                    <Text style={[styles.fiskedexCount, { color: colors.textSecondary }]}>
                      Fanget {species.count} {species.count === 1 ? 'gang' : 'gange'}
                    </Text>
                  </View>
                </View>
              ))}
              {fiskedex.length > 5 && (
                <TouchableOpacity
                  onPress={() => router.push('/fiskedex')}
                  style={{ marginTop: SPACING.sm }}
                >
                  <Text style={[styles.titleDescription, { color: colors.primary }]}>
                    Se alle {fiskedex.length} arter →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={[styles.emptyFiskedex, { color: colors.textSecondary }]}>
              Ingen arter fanget endnu. Start med at fange nogle fisk!
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/edit-profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={colors.white} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>{i18n.t('profile.editProfile')}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/sessions')}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Fisketure</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/segments')}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Segmenter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/friends')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>{i18n.t('profile.friends')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>{i18n.t('profile.settings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{i18n.t('profile.settings')}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{i18n.t('profile.appSettings')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{i18n.t('profile.themeLanguageEtc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/analytics')}
            activeOpacity={0.7}
          >
            <Ionicons name="stats-chart-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Premium Analytics</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>Avancerede statistikker & indsigter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{i18n.t('profile.notifications')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{i18n.t('profile.enabled')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="eye-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{i18n.t('profile.visibility')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{i18n.t('profile.private')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{i18n.t('profile.loginMethod')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{user.provider}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>{i18n.t('auth.logOut')}</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>{i18n.t('profile.version')} 1.0.0</Text>
      </ScrollView>
        </View>
      </PageLayout>
    </SwipeableScreen>
  );
}
