import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeName: string;
  badgeIcon: string; // Ionicons name
  category: 'logning' | 'fællesskab' | 'udforskning' | 'grej';
  routeTo: string;
  buttonLabel: string;
  completed: boolean;
  completedAt?: string;
  claimed: boolean;
}

export const JOURNEY_MILESTONES: Omit<JourneyMilestone, 'completed' | 'claimed'>[] = [
  {
    id: 'log_first_catch',
    title: 'Log din første fangst',
    description: 'Registrér din første fisk i Hook med art, vægt eller længde.',
    xpReward: 200,
    badgeName: 'Første Hug',
    badgeIcon: 'fish',
    category: 'logning',
    routeTo: '/catch-form?isNew=true',
    buttonLabel: 'Log fangst nu',
  },
  {
    id: 'explore_map',
    title: 'Udforsk Fiskekortet & Dybder',
    description: 'Åbn kortet, skift til dybdelaget og se lokale fredningsbælter.',
    xpReward: 100,
    badgeName: 'Kortlæseren',
    badgeIcon: 'map',
    category: 'udforskning',
    routeTo: '/map',
    buttonLabel: 'Åbn kortet',
  },
  {
    id: 'add_tackle',
    title: 'Fyld Grejboksen',
    description: 'Tilføj dit favoritblink, flue eller wobler i din digitale grejboks.',
    xpReward: 150,
    badgeName: 'Grejmester',
    badgeIcon: 'briefcase',
    category: 'grej',
    routeTo: '/tackle-box',
    buttonLabel: 'Gå til grejboks',
  },
  {
    id: 'use_ai_guide',
    title: 'Prøv Fiske-AI Taktikken',
    description: 'Få et personligt taktisk AI-råd baseret på dagens vind og vejr.',
    xpReward: 200,
    badgeName: 'AI Strateg',
    badgeIcon: 'hardware-chip',
    category: 'udforskning',
    routeTo: '/ai-guide',
    buttonLabel: 'Prøv Fiske-AI',
  },
  {
    id: 'catch_two_fish',
    title: 'Dobbelt Hug! (Fang 2 fisk)',
    description: 'Log mindst 2 fangster og bevis din konsistens som lystfisker.',
    xpReward: 250,
    badgeName: 'Storfanger',
    badgeIcon: 'flame',
    category: 'logning',
    routeTo: '/catch-form?isNew=true',
    buttonLabel: 'Log næste fisk',
  },
  {
    id: 'sunrise_fishing',
    title: 'Morgen-Hugget (Før kl. 07:00)',
    description: 'Log en aktiv fisketur eller en fangst i de tidlige morgentimer.',
    xpReward: 300,
    badgeName: 'Morgendug',
    badgeIcon: 'sunny',
    category: 'logning',
    routeTo: '/active-session',
    buttonLabel: 'Start morgentur',
  },
  {
    id: 'join_challenge',
    title: 'Deltag i en Challenge',
    description: 'Tilmeld dig en åben eller privat dyst mod andre lystfiskere.',
    xpReward: 200,
    badgeName: 'Udfordreren',
    badgeIcon: 'trophy',
    category: 'fællesskab',
    routeTo: '/challenges',
    buttonLabel: 'Find challenge',
  },
  {
    id: 'create_challenge',
    title: 'Opret din egen Challenge',
    description: 'Start en venskabelig dyst (f.eks. "Flest havørreder denne weekend").',
    xpReward: 300,
    badgeName: 'Turneringsleder',
    badgeIcon: 'ribbon',
    category: 'fællesskab',
    routeTo: '/challenges',
    buttonLabel: 'Opret challenge',
  },
  {
    id: 'learn_knot',
    title: 'Mestr et nyt Knob',
    description: 'Gennemfør en trin-for-trin guide i Knob Masterclass.',
    xpReward: 150,
    badgeName: 'Knob-Ekspert',
    badgeIcon: 'git-commit',
    category: 'grej',
    routeTo: '/knots',
    buttonLabel: 'Se knob-guide',
  },
  {
    id: 'share_story_card',
    title: 'Del et Fangstkort (Story)',
    description: 'Generér og del dit første 9:16 Story-kort med venner eller på sociale medier.',
    xpReward: 200,
    badgeName: 'Showstopper',
    badgeIcon: 'share-social',
    category: 'fællesskab',
    routeTo: '/catches',
    buttonLabel: 'Vælg fangst at dele',
  },
];

const STORAGE_KEY = '@hook_angler_journey_v1';

interface OnboardingJourneyContextType {
  milestones: JourneyMilestone[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  currentMilestone: JourneyMilestone | null;
  recentlyUnlockedMilestone: JourneyMilestone | null;
  dismissUnlockedModal: () => void;
  completeMilestone: (id: string) => Promise<boolean>;
  resetJourney: () => Promise<void>;
}

const OnboardingJourneyContext = createContext<OnboardingJourneyContextType | undefined>(undefined);

export function OnboardingJourneyProvider({ children }: { children: React.ReactNode }) {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>(() =>
    JOURNEY_MILESTONES.map((m) => ({
      ...m,
      completed: false,
      claimed: false,
    }))
  );
  const [recentlyUnlockedMilestone, setRecentlyUnlockedMilestone] = useState<JourneyMilestone | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMilestones((prev) =>
            prev.map((m) => {
              const found = parsed[m.id];
              return found
                ? { ...m, completed: found.completed, completedAt: found.completedAt, claimed: found.claimed }
                : m;
            })
          );
        }
      } catch (err) {
        console.error('Failed to load journey milestones:', err);
      }
    })();
  }, []);

  // Save progress helper
  const saveProgress = async (updatedMilestones: JourneyMilestone[]) => {
    try {
      const stateToSave: Record<string, any> = {};
      updatedMilestones.forEach((m) => {
        if (m.completed) {
          stateToSave[m.id] = {
            completed: m.completed,
            completedAt: m.completedAt,
            claimed: m.claimed,
          };
        }
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to save journey progress:', err);
    }
  };

  const completeMilestone = useCallback(
    async (id: string): Promise<boolean> => {
      let triggered = false;
      let newlyCompleted: JourneyMilestone | null = null;

      setMilestones((prev) => {
        const updated = prev.map((m) => {
          if (m.id === id && !m.completed) {
            triggered = true;
            newlyCompleted = {
              ...m,
              completed: true,
              completedAt: new Date().toISOString(),
              claimed: true,
            };
            return newlyCompleted;
          }
          return m;
        });

        if (triggered && newlyCompleted) {
          saveProgress(updated);
          setRecentlyUnlockedMilestone(newlyCompleted);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        return updated;
      });

      return triggered;
    },
    []
  );

  const dismissUnlockedModal = useCallback(() => {
    setRecentlyUnlockedMilestone(null);
  }, []);

  const resetJourney = async () => {
    const fresh = JOURNEY_MILESTONES.map((m) => ({
      ...m,
      completed: false,
      claimed: false,
    }));
    setMilestones(fresh);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Find first uncompleted milestone as the "Next Step"
  const currentMilestone = milestones.find((m) => !m.completed) || null;

  return (
    <OnboardingJourneyContext.Provider
      value={{
        milestones,
        completedCount,
        totalCount,
        progressPercent,
        currentMilestone,
        recentlyUnlockedMilestone,
        dismissUnlockedModal,
        completeMilestone,
        resetJourney,
      }}
    >
      {children}
    </OnboardingJourneyContext.Provider>
  );
}

export function useOnboardingJourney() {
  const context = useContext(OnboardingJourneyContext);
  if (!context) {
    throw new Error('useOnboardingJourney must be used within an OnboardingJourneyProvider');
  }
  return context;
}
