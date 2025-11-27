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
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import PageLayout from '../components/PageLayout';
import WeatherLocationCard from '../components/WeatherLocationCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    list: {
      padding: SPACING.md,
      paddingBottom: 120,
    },
    draftCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.md,
    },
    thumbnail: {
      width: 100,
      height: 100,
      backgroundColor: colors.border,
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
      backgroundColor: colors.accent,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    badgeText: {
      ...TYPOGRAPHY.styles.small,
      fontSize: 10,
      color: colors.white,
      fontWeight: '600',
    },
    date: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    species: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600',
      marginBottom: SPACING.xs,
    },
    gps: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
};

export default function DraftsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
             {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
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
      <PageLayout>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <WeatherLocationCard />
            <View style={styles.loadingContainer}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark || '#D4880F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Ionicons name="document-text" size={40} color={colors.primary} />
              </LinearGradient>
              <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
              <Text style={styles.loadingText}>Indlæser kladder...</Text>
            </View>
          </View>
        </SafeAreaView>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          <WeatherLocationCard />
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
        </View>
      </SafeAreaView>
    </PageLayout>
  );
}
