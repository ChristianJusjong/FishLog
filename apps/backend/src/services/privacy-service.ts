/**
 * Privacy Service - Handles privacy checks for user data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check if viewer can see target user's profile
 */
export async function canViewProfile(
  viewerId: string | null,
  targetUserId: string
): Promise<boolean> {
  // Users can always view their own profile
  if (viewerId === targetUserId) {
    return true;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { profileVisibility: true },
  });

  if (!targetUser) {
    return false;
  }

  // Public profiles are visible to everyone
  if (targetUser.profileVisibility === 'public') {
    return true;
  }

  // Private profiles are not visible
  if (targetUser.profileVisibility === 'private') {
    return false;
  }

  // Friends-only profile - check if they are friends
  if (targetUser.profileVisibility === 'friends') {
    if (!viewerId) {
      return false; // Not logged in
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, accepterId: targetUserId, status: 'accepted' },
          { requesterId: targetUserId, accepterId: viewerId, status: 'accepted' },
        ],
      },
    });

    return !!friendship;
  }

  return false;
}

/**
 * Get sanitized user profile based on privacy settings
 */
export async function getSanitizedProfile(
  viewerId: string | null,
  targetUserId: string
) {
  const canView = await canViewProfile(viewerId, targetUserId);

  if (!canView) {
    // Return minimal public info
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        avatar: true,
        profileVisibility: true,
      },
    });

    return {
      ...user,
      isPrivate: true,
      message: user?.profileVisibility === 'private'
        ? 'Denne profil er privat'
        : 'Denne profil er kun synlig for venner',
    };
  }

  // Return full profile
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: viewerId === targetUserId, // Only show email to self
      avatar: true,
      profileVisibility: true,
      totalXP: true,
      level: true,
      currentLevelXP: true,
      createdAt: true,
      _count: {
        select: {
          catches: {
            where: { isDraft: false },
          },
          sentRequests: {
            where: { status: 'accepted' },
          },
          receivedRequests: {
            where: { status: 'accepted' },
          },
          badges: true,
          eventParticipants: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Calculate total friends
  const totalFriends = user._count.sentRequests + user._count.receivedRequests;

  return {
    ...user,
    isPrivate: false,
    stats: {
      catches: user._count.catches,
      friends: totalFriends,
      badges: user._count.badges,
      events: user._count.eventParticipants,
    },
  };
}

/**
 * Get user's catches with privacy check
 */
export async function getUserCatches(
  viewerId: string | null,
  targetUserId: string,
  limit: number = 20,
  offset: number = 0
) {
  const canView = await canViewProfile(viewerId, targetUserId);

  if (!canView) {
    return {
      catches: [],
      isPrivate: true,
    };
  }

  const catches = await prisma.catch.findMany({
    where: {
      userId: targetUserId,
      isDraft: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return {
    catches,
    isPrivate: false,
  };
}

/**
 * Get user's FiskeDex with privacy check
 */
export async function getUserFiskeDex(
  viewerId: string | null,
  targetUserId: string
) {
  const canView = await canViewProfile(viewerId, targetUserId);

  if (!canView) {
    return {
      species: [],
      isPrivate: true,
    };
  }

  // Get all catches and count unique species
  const catches = await prisma.catch.findMany({
    where: {
      userId: targetUserId,
      isDraft: false,
      species: { not: null },
    },
    select: {
      species: true,
      weightKg: true,
      lengthCm: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group by species and get stats
  const speciesMap = new Map<string, any>();

  for (const catch_ of catches) {
    if (!catch_.species) continue;

    if (!speciesMap.has(catch_.species)) {
      speciesMap.set(catch_.species, {
        species: catch_.species,
        count: 0,
        maxWeight: 0,
        maxLength: 0,
        firstCaught: catch_.createdAt,
        lastCaught: catch_.createdAt,
      });
    }

    const entry = speciesMap.get(catch_.species);
    entry.count++;
    if (catch_.weightKg && catch_.weightKg > entry.maxWeight) {
      entry.maxWeight = catch_.weightKg;
    }
    if (catch_.lengthCm && catch_.lengthCm > entry.maxLength) {
      entry.maxLength = catch_.lengthCm;
    }
    if (catch_.createdAt > entry.lastCaught) {
      entry.lastCaught = catch_.createdAt;
    }
  }

  const species = Array.from(speciesMap.values()).sort((a, b) => b.count - a.count);

  // Get total species count from database
  const totalSpecies = await prisma.fishSpecies.count();

  return {
    species,
    uniqueSpecies: species.length,
    totalSpecies,
    completionPercentage: (species.length / totalSpecies) * 100,
    isPrivate: false,
  };
}

export default {
  canViewProfile,
  getSanitizedProfile,
  getUserCatches,
  getUserFiskeDex,
};
