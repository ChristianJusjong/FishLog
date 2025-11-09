import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import WeatherLocationCard from '../components/WeatherLocationCard';
import BottomNavigation from '../components/BottomNavigation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

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
      console.log('===== PROFILE USER DATA =====');
      console.log('user.name:', user.name);
      console.log('user.email:', user.email);
      console.log('user object:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundLight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundLight }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundLight }]}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: theme.accent }]} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarPlaceholderText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ minHeight: 36 }}>
            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{user.name}</Text>
          </View>
          <View style={{ minHeight: 24 }}>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>

        {/* Profile Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Fangster</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Venner</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Events</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.primaryButtonIcon}>✏️</Text>
            <Text style={[styles.primaryButtonText, { color: theme.textInverse }]}>Rediger Profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
            onPress={() => router.push('/friends')}
          >
            <Text style={styles.secondaryButtonIcon}>👥</Text>
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Venner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
            onPress={() => router.push('/groups')}
          >
            <Text style={styles.secondaryButtonIcon}>🎣</Text>
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Grupper</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={[styles.settingsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Indstillinger</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingIcon}>⚙️</Text>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>App Indstillinger</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Tema, sprog m.m.</Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Notifikationer</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Aktiveret</Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌍</Text>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Synlighed</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Privat</Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔐</Text>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Login metode</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{user.provider}</Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.error }]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Ud</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.versionText, { color: theme.textTertiary }]}>Version 1.0.0</Text>
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
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: 100,
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
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '400',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingArrow: {
    fontSize: 24,
    fontWeight: '400',
  },
  logoutButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
