import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import FishSpeciesIcon from './FishSpeciesIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.76;

export interface DailyQuest {
  id: string;
  title: string;
  subtitle: string;
  speciesId?: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  badgeName?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  tag: string;
  routeTo: string;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 'quest-sea-trout-today',
    title: 'Kystjægeren',
    subtitle: 'Log en havørred taget ved kysten',
    speciesId: 'havorred',
    targetCount: 1,
    currentCount: 0,
    xpReward: 200,
    badgeName: 'Kystkriger',
    icon: 'trophy',
    gradientColors: ['#00D4B2', '#0A7B6E'],
    tag: 'DAGENS MISSION',
    routeTo: '/catch-form?isNew=true&species=Hav%C3%B8rred',
  },
  {
    id: 'quest-photo-record',
    title: 'Fotodokumentation',
    subtitle: 'Log en fangst med foto og målebånd',
    targetCount: 1,
    currentCount: 0,
    xpReward: 150,
    badgeName: 'Fotografen',
    icon: 'camera',
    gradientColors: ['#F5A623', '#D97706'],
    tag: 'BONUS XP',
    routeTo: '/catch-form?isNew=true',
  },
  {
    id: 'quest-species-variety',
    title: 'Arts-Ekspeditionen',
    subtitle: 'Oplås en ny art i Danmarks FiskeDex',
    speciesId: 'aborre',
    targetCount: 1,
    currentCount: 0,
    xpReward: 250,
    badgeName: 'Artsjæger',
    icon: 'book',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    tag: 'FISKEDEX',
    routeTo: '/fiskedex',
  },
  {
    id: 'quest-community-challenge',
    title: 'Ugens Flest Fangster',
    subtitle: 'Deltag i den åbne ugentlige dyst',
    targetCount: 3,
    currentCount: 1,
    xpReward: 500,
    badgeName: 'Ugens Mester',
    icon: 'flame',
    gradientColors: ['#EF4444', '#B91C1C'],
    tag: 'FÆLLESSKAB',
    routeTo: '/challenges',
  },
];

export default function DailyChallengesWidget() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);

  const handleQuestPress = (quest: DailyQuest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push(quest.routeTo as any);
  };

  const handleOpenAllChallenges = () => {
    Haptics.selectionAsync().catch(() => {});
    router.push('/challenges');
  };

  return (
    <View style={styles.container}>
      {/* Header with link to all challenges */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={20} color="#F5A623" style={{ marginRight: 6 }} />
          <Text style={[styles.title, { color: colors.text }]}>Dagens Udfordringer & Quests</Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAllChallenges}
          style={styles.seeAllBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Se alle (4)</Text>
          <Ionicons name="chevron-forward" size={14} color="#00D4B2" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Quest Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={CARD_WIDTH + 14}
        decelerationRate="fast"
      >
        {quests.map((quest) => {
          const progressPercent = Math.min(100, (quest.currentCount / quest.targetCount) * 100);

          return (
            <TouchableOpacity
              key={quest.id}
              style={[
                styles.questCard,
                {
                  backgroundColor: isDark ? 'rgba(10, 30, 52, 0.75)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              onPress={() => handleQuestPress(quest)}
              activeOpacity={0.88}
            >
              {/* Top Tag & XP Badge */}
              <View style={styles.cardHeader}>
                <View style={[styles.tagBadge, { backgroundColor: quest.gradientColors[0] + '22' }]}>
                  <Text style={[styles.tagText, { color: quest.gradientColors[0] }]}>{quest.tag}</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Ionicons name="sparkles" size={12} color="#F5A623" style={{ marginRight: 3 }} />
                  <Text style={styles.xpText}>+{quest.xpReward} XP</Text>
                </View>
              </View>

              {/* Main Content Row */}
              <View style={styles.cardBody}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.questTitle, { color: colors.text }]} numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <Text style={[styles.questSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {quest.subtitle}
                  </Text>
                </View>

                {quest.speciesId ? (
                  <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F0F4F8' }]}>
                    <FishSpeciesIcon speciesId={quest.speciesId} size={32} color={quest.gradientColors[0]} />
                  </View>
                ) : (
                  <LinearGradient
                    colors={quest.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconCircleGradient}
                  >
                    <Ionicons name={quest.icon} size={20} color="#FFFFFF" />
                  </LinearGradient>
                )}
              </View>

              {/* Progress Bar & Action */}
              <View style={styles.cardFooter}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressTextRow}>
                    <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>Fremgang</Text>
                    <Text style={[styles.progressCount, { color: colors.text }]}>
                      {quest.currentCount}/{quest.targetCount}
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.max(6, progressPercent)}%`,
                          backgroundColor: quest.gradientColors[0],
                        },
                      ]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: quest.gradientColors[0] }]}
                  onPress={() => handleQuestPress(quest)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>Deltag</Text>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D4B2',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  questCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F5A623',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  questSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressContainer: {
    flex: 1,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressCount: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
