import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BadgeRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  rule: string;
  ruleData?: any;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Define all badge rules
export const BADGE_RULES: BadgeRule[] = [
  {
    id: 'first_catch',
    name: 'Første Fangst',
    description: 'Din allerførste fangst nogensinde! 🎣',
    icon: '🎣',
    rule: 'first_catch',
    tier: 'bronze',
  },
  {
    id: 'beginner',
    name: 'Begynder',
    description: 'Du har fanget 10 fisk - godt gået!',
    icon: '🌟',
    rule: 'catch_count',
    ruleData: { count: 10 },
    tier: 'bronze',
  },
  {
    id: 'experienced',
    name: 'Erfaren',
    description: 'Wow! 50 fangster - du er en erfaren fisker',
    icon: '⭐',
    rule: 'catch_count',
    ruleData: { count: 50 },
    tier: 'silver',
  },
  {
    id: 'master',
    name: 'Mester',
    description: 'Fantastisk! 100 fangster - du er en sand mester',
    icon: '🏆',
    rule: 'catch_count',
    ruleData: { count: 100 },
    tier: 'gold',
  },
  {
    id: 'big_fish',
    name: 'Stor Fisk',
    description: 'Du fangede en fisk over 5kg!',
    icon: '🐋',
    rule: 'biggest_fish',
    ruleData: { weight: 5 },
    tier: 'silver',
  },
  {
    id: 'huge_fish',
    name: 'Kæmpe Fisk',
    description: 'Utroligt! En fisk over 10kg!',
    icon: '🦈',
    rule: 'biggest_fish',
    ruleData: { weight: 10 },
    tier: 'gold',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Du har 5+ venner - fiskeri er sjovere sammen!',
    icon: '👥',
    rule: 'friend_count',
    ruleData: { count: 5 },
    tier: 'bronze',
  },
  {
    id: 'active',
    name: 'Aktiv',
    description: 'Du har fisket 7 dage i træk!',
    icon: '💪',
    rule: 'active_streak',
    ruleData: { days: 7 },
    tier: 'silver',
  },
  {
    id: 'varied',
    name: 'Varieret',
    description: 'Du har fanget 5+ forskellige arter!',
    icon: '🎨',
    rule: 'species_variety',
    ruleData: { count: 5 },
    tier: 'silver',
  },
  {
    id: 'contest_winner',
    name: 'Konkurrence Vinder',
    description: 'Du vandt en fiskekonkurrence! 🥇',
    icon: '🥇',
    rule: 'contest_winner',
    tier: 'platinum',
  },
];

export class BadgeService {
  /**
   * Initialize badges in database (seed)
   */
  async seedBadges() {
    for (const badgeRule of BADGE_RULES) {
      await prisma.badge.upsert({
        where: { name: badgeRule.name },
        update: {
          description: badgeRule.description,
          icon: badgeRule.icon,
          rule: badgeRule.rule,
          ruleData: badgeRule.ruleData ? JSON.stringify(badgeRule.ruleData) : null,
          tier: badgeRule.tier,
        },
        create: {
          name: badgeRule.name,
          description: badgeRule.description,
          icon: badgeRule.icon,
          rule: badgeRule.rule,
          ruleData: badgeRule.ruleData ? JSON.stringify(badgeRule.ruleData) : null,
          tier: badgeRule.tier,
        },
      });
    }
  }

  /**
   * Check and award badges for a user after a catch
   */
  async checkAndAwardBadges(userId: string, catchData?: any) {
    const newlyEarnedBadges = [];

    // Get all badges
    const allBadges = await prisma.badge.findMany();

    // Get user's current badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      let shouldAward = false;
      let progress = 0;

      switch (badge.rule) {
        case 'first_catch':
          shouldAward = await this.checkFirstCatch(userId);
          break;

        case 'catch_count':
          const countResult = await this.checkCatchCount(userId, badge);
          shouldAward = countResult.shouldAward;
          progress = countResult.progress;
          break;

        case 'biggest_fish':
          shouldAward = await this.checkBiggestFish(userId, badge);
          break;

        case 'friend_count':
          const friendResult = await this.checkFriendCount(userId, badge);
          shouldAward = friendResult.shouldAward;
          progress = friendResult.progress;
          break;

        case 'active_streak':
          const streakResult = await this.checkActiveStreak(userId, badge);
          shouldAward = streakResult.shouldAward;
          progress = streakResult.progress;
          break;

        case 'species_variety':
          const varietyResult = await this.checkSpeciesVariety(userId, badge);
          shouldAward = varietyResult.shouldAward;
          progress = varietyResult.progress;
          break;

        case 'contest_winner':
          // This is awarded manually when user wins a contest
          // Not auto-checked here
          break;
      }

      if (shouldAward) {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            progress,
          },
          include: {
            badge: true,
          },
        });
        newlyEarnedBadges.push(userBadge);
      }
    }

    return newlyEarnedBadges;
  }

  /**
   * Award contest winner badge manually
   */
  async awardContestWinnerBadge(userId: string) {
    const badge = await prisma.badge.findFirst({
      where: { rule: 'contest_winner' },
    });

    if (!badge) {
      throw new Error('Contest winner badge not found');
    }

    // Check if already earned
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) {
      return null; // Already has the badge
    }

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
      include: {
        badge: true,
      },
    });

    return userBadge;
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    return await prisma.badge.findMany({
      orderBy: [{ tier: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Get user's earned badges with progress
   */
  async getUserBadges(userId: string) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Also get all badges to show locked ones
    const allBadges = await this.getAllBadges();

    // Calculate progress for locked badges
    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
    const lockedBadges = [];

    for (const badge of allBadges) {
      if (!earnedBadgeIds.has(badge.id)) {
        const progress = await this.getBadgeProgress(userId, badge);
        lockedBadges.push({
          badge,
          progress,
          locked: true,
        });
      }
    }

    return {
      earned: userBadges.map((ub) => ({
        badge: ub.badge,
        earnedAt: ub.earnedAt,
        progress: ub.progress,
        locked: false,
      })),
      locked: lockedBadges,
    };
  }

  /**
   * Get progress for a specific badge
   */
  private async getBadgeProgress(userId: string, badge: any) {
    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    switch (badge.rule) {
      case 'first_catch':
        const catchCount = await prisma.catch.count({ where: { userId } });
        return catchCount > 0 ? 100 : 0;

      case 'catch_count':
        const count = await prisma.catch.count({ where: { userId } });
        const target = ruleData?.count || 1;
        return Math.min(100, Math.floor((count / target) * 100));

      case 'biggest_fish':
        const biggestCatch = await prisma.catch.findFirst({
          where: { userId, weightKg: { not: null } },
          orderBy: { weightKg: 'desc' },
        });
        const targetWeight = ruleData?.weight || 5;
        if (!biggestCatch?.weightKg) return 0;
        return Math.min(100, Math.floor((biggestCatch.weightKg / targetWeight) * 100));

      case 'friend_count':
        const friendCount = await prisma.friendship.count({
          where: {
            OR: [
              { requesterId: userId, status: 'accepted' },
              { accepterId: userId, status: 'accepted' },
            ],
          },
        });
        const targetFriends = ruleData?.count || 5;
        return Math.min(100, Math.floor((friendCount / targetFriends) * 100));

      case 'active_streak':
        const streak = await this.calculateActiveStreak(userId);
        const targetDays = ruleData?.days || 7;
        return Math.min(100, Math.floor((streak / targetDays) * 100));

      case 'species_variety':
        const species = await prisma.catch.findMany({
          where: { userId },
          select: { species: true },
          distinct: ['species'],
        });
        const targetSpecies = ruleData?.count || 5;
        return Math.min(100, Math.floor((species.length / targetSpecies) * 100));

      default:
        return 0;
    }
  }

  // ============================================
  // Badge Rule Checkers
  // ============================================

  private async checkFirstCatch(userId: string) {
    const catchCount = await prisma.catch.count({
      where: { userId },
    });
    return catchCount >= 1;
  }

  private async checkCatchCount(userId: string, badge: any) {
    const count = await prisma.catch.count({
      where: { userId },
    });

    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    const targetCount = ruleData?.count || 10;
    return {
      shouldAward: count >= targetCount,
      progress: Math.min(100, Math.floor((count / targetCount) * 100)),
    };
  }

  private async checkBiggestFish(userId: string, badge: any) {
    const biggestCatch = await prisma.catch.findFirst({
      where: {
        userId,
        weightKg: { not: null },
      },
      orderBy: {
        weightKg: 'desc',
      },
    });

    if (!biggestCatch || !biggestCatch.weightKg) {
      return false;
    }

    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    const targetWeight = ruleData?.weight || 5;
    return biggestCatch.weightKg >= targetWeight;
  }

  private async checkFriendCount(userId: string, badge: any) {
    const friendCount = await prisma.friendship.count({
      where: {
        OR: [
          { requesterId: userId, status: 'accepted' },
          { accepterId: userId, status: 'accepted' },
        ],
      },
    });

    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    const targetCount = ruleData?.count || 5;
    return {
      shouldAward: friendCount >= targetCount,
      progress: Math.min(100, Math.floor((friendCount / targetCount) * 100)),
    };
  }

  private async checkActiveStreak(userId: string, badge: any) {
    const streak = await this.calculateActiveStreak(userId);

    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    const targetDays = ruleData?.days || 7;
    return {
      shouldAward: streak >= targetDays,
      progress: Math.min(100, Math.floor((streak / targetDays) * 100)),
    };
  }

  private async calculateActiveStreak(userId: string) {
    // Get all catches ordered by date descending
    const catches = await prisma.catch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (catches.length === 0) {
      return 0;
    }

    let streak = 1;
    let currentDate = new Date(catches[0].createdAt);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < catches.length; i++) {
      const catchDate = new Date(catches[i].createdAt);
      catchDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - catchDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        streak++;
        currentDate = catchDate;
      } else if (daysDiff > 1) {
        // Streak broken
        break;
      }
      // If daysDiff === 0, it's the same day, continue
    }

    return streak;
  }

  private async checkSpeciesVariety(userId: string, badge: any) {
    const uniqueSpecies = await prisma.catch.findMany({
      where: { userId },
      select: { species: true },
      distinct: ['species'],
    });

    let ruleData;
    if (badge.ruleData) {
      try {
        ruleData = JSON.parse(badge.ruleData);
      } catch (e) {
        ruleData = {};
      }
    }

    const targetCount = ruleData?.count || 5;
    return {
      shouldAward: uniqueSpecies.length >= targetCount,
      progress: Math.min(100, Math.floor((uniqueSpecies.length / targetCount) * 100)),
    };
  }
}

export const badgeService = new BadgeService();
