import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherLocationCard from '../components/WeatherLocationCard';
import BottomNavigation from '../components/BottomNavigation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

interface FeedCatch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user: User;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  comments: Comment[];
}

export default function FeedScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'catches' | 'events'>('catches');
  const [catches, setCatches] = useState<FeedCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [locations, setLocations] = useState<{ [key: string]: string }>({});

  useFocusEffect(
    React.useCallback(() => {
      fetchFeed();
    }, [])
  );

  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=da`,
        {
          headers: {
            'User-Agent': 'FishLog App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        // Try to get city name (multiple possible fields)
        const city = address.city || address.town || address.village || address.municipality;
        const country = address.country;

        if (city && country) {
          return `${city}, ${country}`;
        } else if (city) {
          return city;
        } else if (country) {
          return country;
        }
      }
    } catch (error) {
      console.error('Failed to get location name:', error);
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const fetchFeed = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/feed`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatches(data);

        // Fetch location names for catches with coordinates
        const locationPromises: { [key: string]: Promise<string> } = {};
        data.forEach((catch_: FeedCatch) => {
          if (catch_.latitude && catch_.longitude) {
            locationPromises[catch_.id] = getLocationName(catch_.latitude, catch_.longitude);
          }
        });

        const locationResults: { [key: string]: string } = {};
        for (const [id, promise] of Object.entries(locationPromises)) {
          locationResults[id] = await promise;
        }
        setLocations(locationResults);
      } else {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}`;

        console.error('Feed fetch failed:', response.status, errorData);

        if (Platform.OS === 'web') {
          alert(`Fejl: Kunne ikke hente feed\n${errorMessage}`);
        } else {
          Alert.alert('Fejl', `Kunne ikke hente feed\n\n${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      console.error('Feed fetch error:', error);

      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Netværksfejl', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (catchId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const catch_ = catches.find(c => c.id === catchId);

      if (!catch_) return;

      const method = catch_.isLikedByMe ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/catches/${catchId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Update local state
        setCatches(prevCatches =>
          prevCatches.map(c =>
            c.id === catchId
              ? {
                  ...c,
                  isLikedByMe: !c.isLikedByMe,
                  likesCount: c.isLikedByMe ? c.likesCount - 1 : c.likesCount + 1
                }
              : c
          )
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  const addComment = async (catchId: string) => {
    const text = commentText[catchId]?.trim();

    if (!text) {
      if (Platform.OS === 'web') {
        alert('Kommentar kan ikke være tom');
      } else {
        Alert.alert('Fejl', 'Kommentar kan ikke være tom');
      }
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const newComment = await response.json();

        // Update local state
        setCatches(prevCatches =>
          prevCatches.map(c =>
            c.id === catchId
              ? {
                  ...c,
                  comments: [...c.comments, newComment],
                  commentsCount: c.commentsCount + 1
                }
              : c
          )
        );

        // Clear comment input
        setCommentText(prev => ({ ...prev, [catchId]: '' }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  const toggleShowComments = (catchId: string) => {
    setShowComments(prev => ({ ...prev, [catchId]: !prev[catchId] }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Indlæser feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'catches' && styles.activeTab]}
            onPress={() => setActiveTab('catches')}
            accessible={true}
            accessibilityLabel="Vis fangster feed"
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'catches' }}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabEmoji}>🐟</Text>
              <Text style={[styles.tabText, activeTab === 'catches' && styles.activeTabText]}>
                Fangster
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
            accessible={true}
            accessibilityLabel="Vis events feed"
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'events' }}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabEmoji}>🏆</Text>
              <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
                Events
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={true}
        >
      {activeTab === 'catches' ? (
        catches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emoji}>👥</Text>
            <Text style={styles.emptyText}>Ingen fangster i feed</Text>
            <Text style={styles.emptySubtext}>Tilføj venner for at se deres fangster</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
          {catches.map((catch_) => (
            <TouchableOpacity
              key={catch_.id}
              style={styles.catchCard}
              onPress={() => router.push(`/catch-detail?id=${catch_.id}`)}
              activeOpacity={0.9}
            >
              {/* User info */}
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  {catch_.user.avatar && (
                    <Image source={{ uri: catch_.user.avatar }} style={styles.userAvatar} />
                  )}
                  <Text style={styles.userName}>{catch_.user.name}</Text>
                </View>
                <Text style={styles.catchDate}>
                  {new Date(catch_.createdAt).toLocaleDateString('da-DK')}
                </Text>
              </View>

              {/* Catch photo */}
              {catch_.photoUrl && (
                <Image
                  source={{ uri: catch_.photoUrl }}
                  style={styles.catchImage}
                  resizeMode="contain"
                />
              )}

              {/* Catch details */}
              <View style={styles.catchContent}>
                <Text style={styles.catchSpecies}>{catch_.species}</Text>

                <View style={styles.catchDetails}>
                  {catch_.lengthCm && (
                    <Text style={styles.catchDetail}>📏 {catch_.lengthCm} cm</Text>
                  )}
                  {catch_.weightKg && (
                    <Text style={styles.catchDetail}>⚖️ {Math.round(catch_.weightKg * 1000)} g</Text>
                  )}
                </View>

                {catch_.bait && (
                  <Text style={styles.catchInfo}>🪱 Agn: {catch_.bait}</Text>
                )}
                {catch_.technique && (
                  <Text style={styles.catchInfo}>🎯 Teknik: {catch_.technique}</Text>
                )}
                {catch_.notes && (
                  <Text style={styles.catchNotes}>{catch_.notes}</Text>
                )}
                {catch_.latitude && catch_.longitude && (
                  <Text style={styles.catchInfo}>
                    📍 {locations[catch_.id] || 'Henter sted...'}
                  </Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleLike(catch_.id)}
                  accessible={true}
                  accessibilityLabel={catch_.isLikedByMe ? `Fjern like. ${catch_.likesCount} likes` : `Like fangst. ${catch_.likesCount} likes`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: catch_.isLikedByMe }}
                >
                  <Text style={styles.actionIcon}>{catch_.isLikedByMe ? '❤️' : '🤍'}</Text>
                  <Text style={styles.actionText}>{catch_.likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleShowComments(catch_.id)}
                  accessible={true}
                  accessibilityLabel={`Vis kommentarer. ${catch_.commentsCount} kommentarer`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showComments[catch_.id] }}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>{catch_.commentsCount}</Text>
                </TouchableOpacity>
              </View>

              {/* Comments section */}
              {showComments[catch_.id] && (
                <View style={styles.commentsSection}>
                  {catch_.comments.map((comment) => (
                    <View key={comment.id} style={styles.comment}>
                      <Text style={styles.commentUser}>{comment.user.name}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('da-DK')}
                      </Text>
                    </View>
                  ))}

                  {/* Add comment input */}
                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Skriv en kommentar..."
                      placeholderTextColor={COLORS.textTertiary}
                      value={commentText[catch_.id] || ''}
                      onChangeText={(text) => setCommentText(prev => ({ ...prev, [catch_.id]: text }))}
                      multiline
                      accessible={true}
                      accessibilityLabel="Kommentar felt"
                      accessibilityHint="Skriv din kommentar her"
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => addComment(catch_.id)}
                      accessible={true}
                      accessibilityLabel="Send kommentar"
                      accessibilityRole="button"
                    >
                      <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
          </View>
        )
      ) : (
        // Events tab content
        <View style={styles.eventsContainer}>
          <TouchableOpacity
            style={styles.eventsNavigateButton}
            onPress={() => router.push('/events')}
          >
            <Text style={styles.eventsNavigateIcon}>🏆</Text>
            <Text style={styles.eventsNavigateText}>Se alle events</Text>
            <Text style={styles.eventsNavigateArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  container: {
    flexGrow: 1,
    padding: SPACING.md,
    paddingBottom: 80, // Extra padding for bottom navigation
    backgroundColor: COLORS.backgroundLight, // Light Grey (#F0F2F5)
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  feedList: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  catchCard: {
    backgroundColor: COLORS.surface, // White
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  catchDate: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  catchImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.backgroundLight,
  },
  catchContent: {
    padding: SPACING.md,
  },
  catchSpecies: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  catchDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  catchDetail: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  catchInfo: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  catchNotes: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    minHeight: 44, // Accessibility: Minimum touch target
    minWidth: 60,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  commentsSection: {
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  comment: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  commentText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  commentDate: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  locationContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.secondary + '20', // Secondary color with transparency
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  locationLabel: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  locationCoordinates: {
    fontSize: 13,
    color: COLORS.secondaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minHeight: 48,
    backgroundColor: COLORS.surface,
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  eventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  eventsNavigateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl * 2,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  eventsNavigateIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  eventsNavigateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textInverse,
    marginRight: SPACING.md,
  },
  eventsNavigateArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
