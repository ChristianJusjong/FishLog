/**
 * XP Service - Automatically awards XP and handles level-ups
 */

import { PrismaClient } from '@prisma/client';
import {
  calculateXP,
  getLevelFromXP,
  getRankForLevel,
  getRewardForLevel,
  XP_BONUSES,
} from '../utils/xp-system.js';

const prisma = new PrismaClient();

interface AwardXPResult {
  xpAwarded: number;
  totalXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  rank?: any;
  rewards?: string[];
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  action: string,
  data?: any
): Promise<AwardXPResult> {
  // Calculate base XP
  let xp = calculateXP(action, data);

  // Apply bonuses
  if (data?.isPremium) {
    xp = Math.round(xp * XP_BONUSES.PREMIUM_BONUS);
  }

  if (data?.isWeekend) {
    xp = Math.round(xp * XP_BONUSES.WEEKEND_BONUS);
  }

  if (data?.isChallengeWeek) {
    xp = Math.round(xp * XP_BONUSES.CHALLENGE_WEEK_BONUS);
  }

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXP: true, level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  const newTotalXP = user.totalXP + xp;

  // Calculate new level
  const levelData = getLevelFromXP(newTotalXP);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXP: newTotalXP,
      level: levelData.level,
      currentLevelXP: levelData.currentLevelXP,
    },
  });

  // Check if user leveled up
  const leveledUp = levelData.level > oldLevel;
  let rank;
  let rewards;

  if (leveledUp) {
    rank = getRankForLevel(levelData.level);
    const levelReward = getRewardForLevel(levelData.level);

    if (levelReward) {
      rewards = levelReward.rewards;

      // If level reward includes bonus XP, award it recursively
      if (levelReward.xp) {
        await awardXP(userId, 'LEVEL_BONUS', { bonusXP: levelReward.xp });
      }
    }

    // TODO: Send push notification about level-up
    // TODO: Create feed post about level-up
  }

  return {
    xpAwarded: xp,
    totalXP: newTotalXP,
    oldLevel,
    newLevel: levelData.level,
    leveledUp,
    rank: leveledUp ? rank : undefined,
    rewards: leveledUp ? rewards : undefined,
  };
}

/**
 * Award XP for catching a fish
 */
export async function awardCatchXP(userId: string, catchData: any) {
  // Determine species rarity
  const speciesRarity = await getSpeciesRarity(catchData.species);

  // Check if first of species
  const isFirstOfSpecies = await isFirstCatch(userId, catchData.species);

  // Check if personal record
  const isPersonalRecord = await isPersonalRecord(
    userId,
    catchData.species,
    catchData.weightKg
  );

  const result = await awardXP(userId, 'CATCH_FISH', {
    weightKg: catchData.weightKg,
    speciesRarity,
    isFirstOfSpecies,
    isPersonalRecord,
    isPremium: catchData.isPremium,
    isWeekend: isWeekend(),
  });

  // Award first catch of day bonus
  const isFirstToday = await isFirstCatchOfDay(userId);
  if (isFirstToday) {
    await awardXP(userId, 'DAILY_LOGIN');
  }

  // Check if released
  if (catchData.released) {
    await awardXP(userId, 'RELEASE_FISH');
  }

  return result;
}

/**
 * Award XP for social actions
 */
export async function awardSocialXP(
  userId: string,
  action: 'like' | 'comment' | 'receive_like' | 'receive_comment'
) {
  const actionMap = {
    like: 'LIKE_POST',
    comment: 'COMMENT',
    receive_like: 'RECEIVE_LIKE',
    receive_comment: 'RECEIVE_COMMENT',
  };

  return await awardXP(userId, actionMap[action]);
}

/**
 * Award XP for badge unlock
 */
export async function awardBadgeXP(userId: string, badgeTier: string) {
  const tierMap: Record<string, string> = {
    bronze: 'EARN_BADGE_BRONZE',
    silver: 'EARN_BADGE_SILVER',
    gold: 'EARN_BADGE_GOLD',
    platinum: 'EARN_BADGE_PLATINUM',
    legendary: 'EARN_BADGE_LEGENDARY',
  };

  const action = tierMap[badgeTier] || 'EARN_BADGE_BRONZE';
  return await awardXP(userId, action);
}

/**
 * Award XP for challenge completion
 */
export async function awardChallengeXP(
  userId: string,
  action: 'join' | 'complete' | 'win',
  participants?: number
) {
  const actionMap = {
    join: 'JOIN_CHALLENGE',
    complete: 'COMPLETE_CHALLENGE',
    win: 'WIN_CHALLENGE',
  };

  return await awardXP(userId, actionMap[action], { participants });
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  type: 'total_xp' | 'level' | 'weekly_xp' | 'monthly_xp',
  limit: number = 100
) {
  // For now, we'll just do total XP and level
  // Weekly and monthly would require tracking XP gains over time

  const orderBy =
    type === 'level' ? { level: 'desc' as const } : { totalXP: 'desc' as const };

  const users = await prisma.user.findMany({
    orderBy,
    take: limit,
    select: {
      id: true,
      name: true,
      totalXP: true,
      level: true,
      currentLevelXP: true,
    },
  });

  return users.map((user, index) => ({
    rank: index + 1,
    ...user,
    rankData: getRankForLevel(user.level),
  }));
}

// Helper functions

async function getSpeciesRarity(species: string) {
  const fishSpecies = await prisma.fishSpecies.findFirst({
    where: { name: species },
  });

  return fishSpecies?.rarity || 'common';
}

async function isFirstCatch(userId: string, species: string) {
  const previousCatch = await prisma.catch.findFirst({
    where: {
      userId,
      species,
    },
  });

  return !previousCatch;
}

async function isPersonalRecord(
  userId: string,
  species: string,
  weightKg?: number
) {
  if (!weightKg) return false;

  const maxCatch = await prisma.catch.findFirst({
    where: {
      userId,
      species,
    },
    orderBy: {
      weightKg: 'desc',
    },
  });

  return !maxCatch || weightKg > (maxCatch.weightKg || 0);
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

async function isFirstCatchOfDay(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const catchToday = await prisma.catch.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
      },
    },
  });

  return !catchToday;
}

export default {
  awardXP,
  awardCatchXP,
  awardSocialXP,
  awardBadgeXP,
  awardChallengeXP,
  getLeaderboard,
};
