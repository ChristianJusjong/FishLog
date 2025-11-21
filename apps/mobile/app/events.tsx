import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "@/constants/branding";
import { FAB_STYLE, FAB } from "@/constants/theme";
import PageLayout from "../components/PageLayout";
import WeatherLocationCard from "../components/WeatherLocationCard";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://fishlog-production.up.railway.app";

type Event = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  venue?: string;
  owner: {
    id: string;
    name: string;
  };
  isParticipating: boolean;
  participantCount: number;
};

type ChallengeType =
  | "most_catches"
  | "biggest_fish"
  | "total_weight"
  | "most_species";

interface Participant {
  id: string;
  userId: string;
  score: number;
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: ChallengeType;
  species?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  prize?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: Participant[];
}

const CHALLENGE_TYPES = [
  { value: "most_catches", label: "Flest Fangster", icon: "fish" as const },
  { value: "biggest_fish", label: "Største Fisk", icon: "resize" as const },
  { value: "total_weight", label: "Total Vægt", icon: "scale" as const },
  {
    value: "most_species",
    label: "Flest Arter",
    icon: "color-filter" as const,
  },
];

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...SHADOWS.sm,
    },
    title: {
      ...TYPOGRAPHY.styles.h1,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.md,
      gap: SPACING.xs,
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.primary,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      ...SHADOWS.sm,
    },
    createButtonText: {
      ...TYPOGRAPHY.styles.button,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    filterContainer: {
      flexDirection: "row",
      padding: SPACING.md,
      backgroundColor: colors.surface,
      gap: SPACING.sm,
    },
    filterButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.md,
      backgroundColor: colors.backgroundLight,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 4,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    eventHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },
    eventTitle: {
      ...TYPOGRAPHY.styles.h2,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
      marginLeft: SPACING.sm,
    },
    statusText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: "600",
    },
    eventDescription: {
      ...TYPOGRAPHY.styles.small,
      marginBottom: SPACING.md,
    },
    eventDetails: {
      gap: SPACING.xs,
      marginBottom: SPACING.md,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    eventDetailText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    eventFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: SPACING.md,
      gap: SPACING.sm,
    },
    organizerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    organizerText: {
      ...TYPOGRAPHY.styles.small,
    },
    participantsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    participantsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    participantsText: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: "600",
    },
    participatingBadge: {
      backgroundColor: colors.backgroundLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    participatingText: {
      color: colors.success,
      fontSize: 11,
      fontWeight: "600",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING["2xl"],
      marginTop: SPACING["2xl"],
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.styles.small,
      textAlign: "center",
      paddingHorizontal: SPACING.xl,
    },
    // Challenge-specific styles
    challengeCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    challengeHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.md,
      marginBottom: SPACING.sm,
    },
    typeIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    challengeTitle: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.xs,
    },
    challengeType: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    challengeDescription: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: SPACING.md,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    userRankContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      backgroundColor: colors.primary + "20",
      marginBottom: SPACING.sm,
    },
    userRankText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    leaderboardToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
    },
    leaderboardToggleText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    leaderboard: {
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      marginTop: SPACING.sm,
      marginBottom: SPACING.sm,
      backgroundColor: colors.backgroundLight,
    },
    emptyLeaderboard: {
      textAlign: "center",
      padding: SPACING.lg,
      fontSize: 14,
      color: colors.textSecondary,
    },
    leaderboardRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.sm,
    },
    rankBadge: {
      width: 32,
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    rankNumber: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    participantName: {
      flex: 1,
      ...TYPOGRAPHY.styles.body,
      fontWeight: "500",
    },
    participantScore: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.primary,
    },
    joinButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
      backgroundColor: colors.primary,
      ...SHADOWS.sm,
    },
    joinButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.white,
    },
  });
};

export default function EventsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "ongoing" | "past" | "all">(
    "upcoming",
  );

  // Challenge states
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(
    null,
  );
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchEvents = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const url =
        filter === "all"
          ? `${API_URL}/events`
          : `${API_URL}/events?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        Alert.alert("Fejl", "Kunne ikke hente events");
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      Alert.alert("Fejl", "Kunne ikke hente events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const getCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error("Failed to get user ID:", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      setChallengesLoading(true);
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/challenges`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      } else {
        Alert.alert("Fejl", "Kunne ikke hente udfordringer");
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      Alert.alert("Fejl", "Kunne ikke hente udfordringer");
    } finally {
      setChallengesLoading(false);
      setRefreshing(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `${API_URL}/challenges/${challengeId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        Alert.alert("Success", "Du er nu tilmeldt udfordringen!");
        fetchChallenges();
      } else {
        const error = await response.json();
        Alert.alert("Fejl", error.error || "Kunne ikke tilmelde udfordring");
      }
    } catch (error) {
      console.error("Failed to join challenge:", error);
      Alert.alert("Fejl", "Kunne ikke tilmelde udfordring");
    }
  };

  const getChallengeTypeInfo = (type: ChallengeType) => {
    return CHALLENGE_TYPES.find((t) => t.value === type);
  };

  const isParticipating = (challenge: Challenge) => {
    return challenge.participants.some((p) => p.userId === currentUserId);
  };

  const getUserRank = (challenge: Challenge) => {
    const participant = challenge.participants.find(
      (p) => p.userId === currentUserId,
    );
    return participant?.rank;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (startAt: string, endAt: string) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (now < start) return { label: "Kommende", color: colors.info };
    if (now >= start && now <= end)
      return { label: "I gang", color: colors.success };
    return { label: "Afsluttet", color: colors.textSecondary };
  };

  const handleCreateEvent = () => {
    router.push("/create-event");
  };

  const handleCreateChallenge = () => {
    router.push("/challenges?openCreate=true");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.backgroundLight }}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageLayout>
      <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
        <WeatherLocationCard showLocation={true} showWeather={true} />
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Text style={[styles.title, { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm }]}>Events</Text>

          <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "upcoming" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("upcoming")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={
                    filter === "upcoming" ? colors.white : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "upcoming" && styles.filterButtonTextActive,
                  ]}
                >
                  Kommende
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "ongoing" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("ongoing")}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={16}
                  color={
                    filter === "ongoing" ? colors.white : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "ongoing" && styles.filterButtonTextActive,
                  ]}
                >
                  I gang
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "past" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("past")}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={
                    filter === "past" ? colors.white : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "past" && styles.filterButtonTextActive,
                  ]}
                >
                  Afsluttede
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("all")}
              >
                <Ionicons
                  name="list-outline"
                  size={16}
                  color={filter === "all" ? colors.white : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "all" && styles.filterButtonTextActive,
                  ]}
                >
                  Alle
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                />
              }
            >
              {events.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={64}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.emptyText}>Ingen events fundet</Text>
                  <Text style={styles.emptySubtext}>
                    Opret dit første event eller vent på at andre opretter
                    events
                  </Text>
                </View>
              ) : (
                events.map((event) => {
                  const status = getEventStatus(event.startAt, event.endAt);
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => router.push(`/event/${event.id}`)}
                    >
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: status.color },
                          ]}
                        >
                          <Text style={styles.statusText}>{status.label}</Text>
                        </View>
                      </View>

                      {event.description && (
                        <Text style={styles.eventDescription} numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}

                      <View style={styles.eventDetails}>
                        <View style={styles.detailRow}>
                          <Ionicons
                            name="calendar"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.eventDetailText}>
                            {formatDate(event.startAt)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons
                            name="flag"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.eventDetailText}>
                            {formatDate(event.endAt)}
                          </Text>
                        </View>
                        {event.venue && (
                          <View style={styles.detailRow}>
                            <Ionicons
                              name="location"
                              size={14}
                              color={colors.textSecondary}
                            />
                            <Text style={styles.eventDetailText}>
                              {event.venue}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.eventFooter}>
                        <View style={styles.organizerRow}>
                          <Ionicons
                            name="person-outline"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.organizerText}>
                            Arrangør: {event.owner.name}
                          </Text>
                        </View>
                        <View style={styles.participantsContainer}>
                          <View style={styles.participantsRow}>
                            <Ionicons
                              name="people"
                              size={16}
                              color={colors.textSecondary}
                            />
                            <Text style={styles.participantsText}>
                              {event.participantCount} deltagere
                            </Text>
                          </View>
                          {event.isParticipating && (
                            <View style={styles.participatingBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={colors.success}
                              />
                              <Text style={styles.participatingText}>
                                Tilmeldt
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

          {/* FAB Button */}
          <TouchableOpacity
            style={[FAB_STYLE, { backgroundColor: colors.primary }]}
            onPress={handleCreateEvent}
          >
            <Ionicons name="add" size={FAB.ICON_SIZE} color={colors.white} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </PageLayout>
  );
}
