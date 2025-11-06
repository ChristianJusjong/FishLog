import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

export default function DraftsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchDrafts();
    }, [])
  );

  const fetchDrafts = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/catches/drafts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error('Fetch drafts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    Alert.alert(
      'Slet kladde',
      'Er du sikker på at du vil slette denne kladde?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              await fetch(`${API_URL}/catches/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              fetchDrafts();
            } catch (error) {
              Alert.alert('Fejl', 'Kunne ikke slette kladde');
            }
          },
        },
      ]
    );
  };

  const renderDraft = ({ item }: any) => (
    <TouchableOpacity
      style={styles.draftCard}
      onPress={() => router.push({
        pathname: '/catch-form',
        params: { catchId: item.id }
      })}
    >
      {item.photoUrl && (
        <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} />
      )}
      <View style={styles.draftContent}>
        <View style={styles.draftHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Ufuldstændig</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('da-DK')}
          </Text>
        </View>
        <Text style={styles.species}>
          {item.species || 'Ingen art valgt'}
        </Text>
        {item.latitude && item.longitude && (
          <Text style={styles.gps}>
            📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteDraft(item.id);
        }}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Tilbage</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💾 Kladder</Text>
        <View style={{ width: 80 }} />
      </View>

      {drafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>Ingen kladder</Text>
          <Text style={styles.emptyText}>
            Dine ufuldstændige fangster vil vises her
          </Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderDraft}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  backButton: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.primary,
    width: 80,
  },
  title: {
    ...TYPOGRAPHY.styles.h2,
    textAlign: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  draftCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  thumbnail: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.border,
  },
  draftContent: {
    flex: 1,
    padding: SPACING.sm,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.styles.small,
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  date: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  species: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  gps: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.styles.h2,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
