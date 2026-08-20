import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../contexts/OfflineContext';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/branding';

export default function OfflineBanner() {
  const { isOnline, syncStatus } = useOffline();

  if (isOnline && syncStatus !== 'syncing') {
    return null;
  }

  const isSyncing = syncStatus === 'syncing';

  return (
    <View style={[styles.container, isSyncing ? styles.syncingContainer : styles.offlineContainer]}>
      <Ionicons
        name={isSyncing ? 'sync-outline' : 'cloud-offline-outline'}
        size={16}
        color={COLORS.white}
        style={styles.icon}
      />
      <Text style={styles.text}>
        {isSyncing
          ? 'Synkroniserer dine seneste fangster...'
          : 'Du er offline – dine fangster gemmes lokalt'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.base,
    zIndex: 9990,
  },
  offlineContainer: {
    backgroundColor: COLORS.warningDark,
  },
  syncingContainer: {
    backgroundColor: COLORS.secondary,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
});
