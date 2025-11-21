/**
 * FishLog XP & Level System
 *
 * Gamification system inspired by RPGs, Duolingo, and Fitbit
 */

export interface XPConfig {
  action: string;
  baseXP: number;
  multiplier?: (data: any) => number;
}

// XP rewards for different actions
export const XP_REWARDS: Record<string, XPConfig> = {
  // CATCHING FISH
  CATCH_FISH: {
    action: 'Fang en fisk',
    baseXP: 50,
    multiplier: (data) => {
      let multiplier = 1;

      // Size bonus
      if (data.weightKg) {
        if (data.weightKg > 10) multiplier += 2; // 10+ kg = 3x XP
        else if (data.weightKg > 5) multiplier += 1; // 5-10 kg = 2x XP
        else if (data.weightKg > 2) multiplier += 0.5; // 2-5 kg = 1.5x XP
      }

      // Rarity bonus (based on species)
      if (data.speciesRarity === 'legendary') multiplier += 4; // 5x total
      else if (data.speciesRarity === 'very_rare') multiplier += 2; // 3x total
      else if (data.speciesRarity === 'rare') multiplier += 1; // 2x total
      else if (data.speciesRarity === 'uncommon') multiplier += 0.5; // 1.5x total

      // First catch of species bonus
      if (data.isFirstOfSpecies) multiplier += 1;

      // Personal record bonus
      if (data.isPersonalRecord) multiplier += 0.5;

      return multiplier;
    },
  },

  // CATCH & RELEASE
  RELEASE_FISH: {
    action: 'Genudsat en fisk',
    baseXP: 25,
  },

  // SOCIAL ACTIONS
  POST_CATCH: {
    action: 'Del en fangst',
    baseXP: 10,
  },
  LIKE_POST: {
    action: 'Liker en post',
    baseXP: 1,
  },
  RECEIVE_LIKE: {
    action: 'Modtag et like',
    baseXP: 2,
  },
  COMMENT: {
    action: 'Kommentér',
    baseXP: 5,
  },
  RECEIVE_COMMENT: {
    action: 'Modtag en kommentar',
    baseXP: 3,
  },

  // BADGES
  EARN_BADGE_BRONZE: {
    action: 'Optjen bronze badge',
    baseXP: 50,
  },
  EARN_BADGE_SILVER: {
    action: 'Optjen sølv badge',
    baseXP: 100,
  },
  EARN_BADGE_GOLD: {
    action: 'Optjen guld badge',
    baseXP: 200,
  },
  EARN_BADGE_PLATINUM: {
    action: 'Optjen platinum badge',
    baseXP: 500,
  },
  EARN_BADGE_LEGENDARY: {
    action: 'Optjen legendary badge',
    baseXP: 1000,
  },

  // CHALLENGES & EVENTS
  JOIN_CHALLENGE: {
    action: 'Deltag i challenge',
    baseXP: 25,
  },
  COMPLETE_CHALLENGE: {
    action: 'Fuldfør challenge',
    baseXP: 200,
  },
  WIN_CHALLENGE: {
    action: 'Vind challenge',
    baseXP: 500,
    multiplier: (data) => {
      // Bonus based on participants
      if (data.participants > 100) return 3;
      if (data.participants > 50) return 2;
      if (data.participants > 10) return 1.5;
      return 1;
    },
  },

  // SESSIONS
  START_SESSION: {
    action: 'Start fiskesession',
    baseXP: 5,
  },
  END_SESSION: {
    action: 'Afslut fiskesession',
    baseXP: 20,
    multiplier: (data) => {
      // Bonus based on session length (hours)
      if (data.durationHours > 6) return 2;
      if (data.durationHours > 3) return 1.5;
      return 1;
    },
  },

  // STREAKS
  DAILY_LOGIN: {
    action: 'Dagligt login',
    baseXP: 10,
  },
  STREAK_7_DAYS: {
    action: '7 dages streak',
    baseXP: 100,
  },
  STREAK_30_DAYS: {
    action: '30 dages streak',
    baseXP: 500,
  },

  // COMMUNITY
  VALIDATE_CATCH: {
    action: 'Validér en fangst',
    baseXP: 15,
  },
  HELP_BEGINNER: {
    action: 'Hjælp en begynder',
    baseXP: 30,
  },
  CREATE_CLUB: {
    action: 'Opret en club',
    baseXP: 100,
  },

  // ACHIEVEMENTS
  LOCAL_LEGEND: {
    action: 'Bliv Local Legend',
    baseXP: 300,
  },
  SEGMENT_PR: {
    action: 'Ny segment rekord',
    baseXP: 150,
  },
  FISKEDEX_COMPLETE: {
    action: 'Fuldfør FiskeDex',
    baseXP: 2000,
  },
};

// Rank/Title system based on level
export interface Rank {
  minLevel: number;
  maxLevel: number;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export const RANKS: Rank[] = [
  {
    minLevel: 1,
    maxLevel: 9,
    title: 'Begynder',
    icon: '🎣',
    color: '#8B4513', // Brown
    description: 'Du er lige startet din fiskeeventyr!',
  },
  {
    minLevel: 10,
    maxLevel: 19,
    title: 'Fisker',
    icon: '🐟',
    color: '#CD7F32', // Bronze
    description: 'Du ved hvad du laver!',
  },
  {
    minLevel: 20,
    maxLevel: 29,
    title: 'Erfaren Fisker',
    icon: '🎯',
    color: '#C0C0C0', // Silver
    description: 'Du har fået erfaring!',
  },
  {
    minLevel: 30,
    maxLevel: 39,
    title: 'Ekspert',
    icon: '⚡',
    color: '#FFD700', // Gold
    description: 'Du ved hvordan man fanger fisk!',
  },
  {
    minLevel: 40,
    maxLevel: 49,
    title: 'Mester',
    icon: '🏆',
    color: '#E5E4E2', // Platinum
    description: 'Du er en mester fisker!',
  },
  {
    minLevel: 50,
    maxLevel: 59,
    title: 'Stormester',
    icon: '👑',
    color: '#9370DB', // Purple
    description: 'Få kan matche din kunnen!',
  },
  {
    minLevel: 60,
    maxLevel: 69,
    title: 'Champion',
    icon: '⚔️',
    color: '#FF6B35', // Orange
    description: 'Du er en sand champion!',
  },
  {
    minLevel: 70,
    maxLevel: 79,
    title: 'Elite',
    icon: '💎',
    color: '#00CED1', // Cyan
    description: 'Elite blandt fiskere!',
  },
  {
    minLevel: 80,
    maxLevel: 89,
    title: 'Legende',
    icon: '🌟',
    color: '#FF1493', // Pink
    description: 'Din legend lever videre!',
  },
  {
    minLevel: 90,
    maxLevel: 99,
    title: 'Mythisk',
    icon: '🔱',
    color: '#8A2BE2', // Blue-violet
    description: 'Mythisk fisker - er du menneske?!',
  },
  {
    minLevel: 100,
    maxLevel: 999,
    title: 'Gud',
    icon: '⚡👑',
    color: '#FFD700', // Shining gold
    description: 'Fiskegud - du har nået toppen!',
  },
];

// XP required for each level
export function getXPForLevel(level: number): number {
  if (level <= 10) return level * 100; // 100 XP per level
  if (level <= 25) return 1000 + (level - 10) * 200; // 200 XP per level
  if (level <= 50) return 4000 + (level - 25) * 500; // 500 XP per level
  if (level <= 75) return 16500 + (level - 50) * 1000; // 1000 XP per level
  if (level <= 100) return 41500 + (level - 75) * 2000; // 2000 XP per level
  return 91500 + (level - 100) * 5000; // 5000 XP per level
}

// Calculate total XP needed to reach a level
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

// Get level from total XP
export function getLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  let level = 1;
  let xpAccumulated = 0;

  while (xpAccumulated + getXPForLevel(level + 1) <= totalXP) {
    xpAccumulated += getXPForLevel(level + 1);
    level++;
  }

  const currentLevelXP = totalXP - xpAccumulated;
  const xpForNextLevel = getXPForLevel(level + 1);
  const progress = (currentLevelXP / xpForNextLevel) * 100;

  return {
    level,
    currentLevelXP,
    xpForNextLevel,
    progress,
  };
}

// Get rank for level
export function getRankForLevel(level: number): Rank {
  return RANKS.find(rank => level >= rank.minLevel && level <= rank.maxLevel) || RANKS[0];
}

// Calculate XP reward
export function calculateXP(action: string, data?: any): number {
  const config = XP_REWARDS[action];
  if (!config) return 0;

  let xp = config.baseXP;

  if (config.multiplier && data) {
    const multiplier = config.multiplier(data);
    xp = Math.round(xp * multiplier);
  }

  return xp;
}

// Level up rewards
export interface LevelReward {
  level: number;
  rewards: string[];
  xp?: number;
}

export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 5,
    rewards: ['Lås op: Profilemerke', '50 gratis XP'],
    xp: 50,
  },
  {
    level: 10,
    rewards: ['Rang: Fisker 🐟', 'Lås op: Custom profilbillede'],
  },
  {
    level: 15,
    rewards: ['100 gratis XP', 'Lås op: Farveskemaer'],
    xp: 100,
  },
  {
    level: 20,
    rewards: ['Rang: Erfaren Fisker 🎯', '200 gratis XP'],
    xp: 200,
  },
  {
    level: 25,
    rewards: ['Lås op: Premium statistik (1 måned gratis)'],
  },
  {
    level: 30,
    rewards: ['Rang: Ekspert ⚡', '300 gratis XP'],
    xp: 300,
  },
  {
    level: 40,
    rewards: ['Rang: Mester 🏆', 'Eksklusivt badge: "Mester Fisker"'],
  },
  {
    level: 50,
    rewards: ['Rang: Stormester 👑', '1000 gratis XP', 'Premium gratis i 3 måneder'],
    xp: 1000,
  },
  {
    level: 60,
    rewards: ['Rang: Champion ⚔️', 'Eksklusivt badge: "Champion"'],
  },
  {
    level: 70,
    rewards: ['Rang: Elite 💎', '2000 gratis XP'],
    xp: 2000,
  },
  {
    level: 80,
    rewards: ['Rang: Legende 🌟', 'Eksklusivt badge: "Legend"'],
  },
  {
    level: 90,
    rewards: ['Rang: Mythisk 🔱', '5000 gratis XP'],
    xp: 5000,
  },
  {
    level: 100,
    rewards: ['Rang: Gud ⚡👑', 'Livstids Premium GRATIS!', 'Eksklusivt badge: "Fiskegud"'],
  },
];

// Get reward for level
export function getRewardForLevel(level: number): LevelReward | undefined {
  return LEVEL_REWARDS.find(r => r.level === level);
}

// Daily/Weekly XP Bonuses
export const XP_BONUSES = {
  FIRST_CATCH_OF_DAY: 50,
  WEEKEND_BONUS: 1.5, // 50% more XP on weekends
  CHALLENGE_WEEK_BONUS: 2, // Double XP during challenge weeks
  PREMIUM_BONUS: 1.25, // 25% more XP for premium users
};

// Leaderboard categories
export const LEADERBOARD_TYPES = {
  TOTAL_XP: 'total_xp',
  LEVEL: 'level',
  WEEKLY_XP: 'weekly_xp',
  MONTHLY_XP: 'monthly_xp',
};

export default {
  XP_REWARDS,
  RANKS,
  getXPForLevel,
  getTotalXPForLevel,
  getLevelFromXP,
  getRankForLevel,
  calculateXP,
  LEVEL_REWARDS,
  getRewardForLevel,
  XP_BONUSES,
  LEADERBOARD_TYPES,
};
