import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SwipeableScreen from '../components/SwipeableScreen';
import WeatherLocationCard from '../components/WeatherLocationCard';
import BottomNavigation from '../components/BottomNavigation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, BUTTON_STYLES, AVATAR_STYLES, CARD_STYLE } from '@/constants/theme';
import i18n from '../i18n';
import { logger } from '../utils/logger';

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

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
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="person" size={48} color={COLORS.primary} />
        </View>
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
        <Text style={styles.loadingText}>Indlæser profil...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SwipeableScreen currentScreen="/profile">
      <View style={styles.safeArea}>
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
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color={COLORS.white} />
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>

        {/* Profile Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="fish" size={24} color={COLORS.primary} style={styles.statIcon} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{i18n.t('profile.catches')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color={COLORS.accent} style={styles.statIcon} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{i18n.t('profile.friends')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={COLORS.secondary} style={styles.statIcon} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{i18n.t('navigation.events')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/edit-profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>{i18n.t('profile.editProfile')}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/friends')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color={COLORS.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>{i18n.t('profile.friends')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/groups')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-circle-outline" size={20} color={COLORS.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>{i18n.t('profile.groups')}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.settings')}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{i18n.t('profile.appSettings')}</Text>
              <Text style={styles.settingValue}>{i18n.t('profile.themeLanguageEtc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{i18n.t('profile.notifications')}</Text>
              <Text style={styles.settingValue}>{i18n.t('profile.enabled')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="eye-outline" size={24} color={COLORS.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{i18n.t('profile.visibility')}</Text>
              <Text style={styles.settingValue}>{i18n.t('profile.private')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.textPrimary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{i18n.t('profile.loginMethod')}</Text>
              <Text style={styles.settingValue}>{user.provider}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>{i18n.t('auth.logOut')}</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>{i18n.t('profile.version')} 1.0.0</Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
      </View>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loader: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
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
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
  },
  statsCard: {
    ...CARD_STYLE,
    flexDirection: 'row',
    marginBottom: SPACING.lg,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  primaryButton: {
    ...BUTTON_STYLES.accent.container,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  primaryButtonText: {
    ...BUTTON_STYLES.accent.text,
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
    ...BUTTON_STYLES.outline.container,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    ...BUTTON_STYLES.outline.text,
  },
  settingsSection: {
    ...CARD_STYLE,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingValue: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    ...BUTTON_STYLES.primary.container,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    minHeight: 52,
  },
  logoutButtonText: {
    ...BUTTON_STYLES.primary.text,
  },
  versionText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
