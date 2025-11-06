import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import WeatherLocationCard from '../components/WeatherLocationCard';
import BottomNavigation from '../components/BottomNavigation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.backgroundLight }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Profile Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Fangster</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Venner</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.primaryButtonIcon}>✏️</Text>
            <Text style={styles.primaryButtonText}>Rediger Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/friends')}
          >
            <Text style={styles.secondaryButtonIcon}>👥</Text>
            <Text style={styles.secondaryButtonText}>Venner</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Indstillinger</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifikationer</Text>
              <Text style={styles.settingValue}>Aktiveret</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌍</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Synlighed</Text>
              <Text style={styles.settingValue}>Privat</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔐</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Login metode</Text>
              <Text style={styles.settingValue}>{user.provider}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Ud</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING.md,
    borderWidth: 4,
    borderColor: COLORS.primary,
    ...SHADOWS.lg,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: 48,
    color: COLORS.white,
  },
  userName: {
    ...TYPOGRAPHY.styles.h1,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.styles.h1,
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  secondaryButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingValue: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  settingArrow: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  logoutButtonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  versionText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
