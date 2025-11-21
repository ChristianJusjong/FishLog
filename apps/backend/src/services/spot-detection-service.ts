import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fish species scoring system - points based on rarity and difficulty
const SPECIES_SCORES: { [key: string]: number } = {
  // Common species (1-5 points)
  'Aborre': 2,
  'Skalle': 1,
  'Brasen': 2,
  'Rudskalle': 1,
  'Løje': 1,

  // Uncommon species (6-15 points)
  'Gedde': 10,
  'Sandart': 12,
  'Ørred': 8,
  'Helt': 7,
  'Suder': 6,
  'Ål': 9,

  // Rare species (16-30 points)
  'Karpe': 20,
  'Malle': 18,
  'Regnbueørred': 15,
  'Havørred': 25,
  'Laks': 30,
  'Stalling': 16,

  // Very rare species (31-50 points)
  'Bækørred': 35,
  'Snæbel': 40,
  'Hork': 45,
  'Stør': 50,
};

// Default score for unknown species
const DEFAULT_SPECIES_SCORE = 5;

/**
 * Calculate score for a single catch based on species, weight, and length
 */
export function calculateCatchScore(species: string, weightKg?: number, lengthCm?: number): number {
  const baseScore = SPECIES_SCORES[species] || DEFAULT_SPECIES_SCORE;

  let sizeMultiplier = 1.0;

  // Bonus for larger fish
  if (weightKg) {
    if (weightKg > 10) sizeMultiplier += 1.0;
    else if (weightKg > 5) sizeMultiplier += 0.5;
    else if (weightKg > 2) sizeMultiplier += 0.25;
  } else if (lengthCm) {
    if (lengthCm > 80) sizeMultiplier += 1.0;
    else if (lengthCm > 50) sizeMultiplier += 0.5;
    else if (lengthCm > 30) sizeMultiplier += 0.25;
  }

  return Math.round(baseScore * sizeMultiplier);
}

/**
 * Calculate total score for a session
 */
export async function calculateSessionScore(sessionId: string): Promise<number> {
  const catches = await prisma.catch.findMany({
    where: {
      sessionId,
      isDraft: false,
    },
  });

  return catches.reduce((total, catch_) => {
    return total + calculateCatchScore(
      catch_.species || 'Unknown',
      catch_.weightKg || undefined,
      catch_.lengthCm || undefined
    );
  }, 0);
}

interface SpotLocation {
  latitude: number;
  longitude: number;
  visitCount: number;
  catchCount: number;
  totalScore: number;
  lastVisit: Date;
  fishSpecies: string[];
}

/**
 * Identify user's favorite spots based on their fishing history
 * A spot is considered favorite if visited 3+ times
 */
export async function identifyUserFavoriteSpots(
  userId: string,
  minVisits: number = 3,
  radiusMeters: number = 200
): Promise<SpotLocation[]> {
  // Get all user's catches with location
  const catches = await prisma.catch.findMany({
    where: {
      userId,
      isDraft: false,
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (catches.length === 0) return [];

  // Cluster catches by location
  const clusters: Map<string, SpotLocation> = new Map();

  for (const catch_ of catches) {
    if (!catch_.latitude || !catch_.longitude) continue;

    // Find existing cluster within radius
    let foundCluster: string | null = null;

    for (const [clusterId, cluster] of clusters.entries()) {
      const distance = calculateDistance(
        catch_.latitude,
        catch_.longitude,
        cluster.latitude,
        cluster.longitude
      );

      if (distance * 1000 <= radiusMeters) {
        foundCluster = clusterId;
        break;
      }
    }

    const score = calculateCatchScore(
      catch_.species || 'Unknown',
      catch_.weightKg || undefined,
      catch_.lengthCm || undefined
    );

    if (foundCluster) {
      const cluster = clusters.get(foundCluster)!;
      cluster.visitCount += 1;
      cluster.catchCount += 1;
      cluster.totalScore += score;
      if (catch_.createdAt > cluster.lastVisit) {
        cluster.lastVisit = catch_.createdAt;
      }
      if (catch_.species && !cluster.fishSpecies.includes(catch_.species)) {
        cluster.fishSpecies.push(catch_.species);
      }
    } else {
      const clusterId = `${catch_.latitude.toFixed(4)}_${catch_.longitude.toFixed(4)}`;
      clusters.set(clusterId, {
        latitude: catch_.latitude,
        longitude: catch_.longitude,
        visitCount: 1,
        catchCount: 1,
        totalScore: score,
        lastVisit: catch_.createdAt,
        fishSpecies: catch_.species ? [catch_.species] : [],
      });
    }
  }

  // Filter spots with minimum visits
  return Array.from(clusters.values())
    .filter(spot => spot.visitCount >= minVisits)
    .sort((a, b) => b.visitCount - a.visitCount);
}

interface HotSpot {
  latitude: number;
  longitude: number;
  totalAnglers: number;
  totalCatches: number;
  totalScore: number;
  lastActivity: Date;
  topAnglers: Array<{
    userId: string;
    userName: string;
    catchCount: number;
    totalScore: number;
  }>;
  fishSpecies: string[];
}

/**
 * Identify hot spots based on collective fishing activity
 * A spot is considered hot if visited by 5+ anglers or has 20+ catches
 */
export async function identifyHotSpots(
  minAnglers: number = 5,
  minCatches: number = 20,
  radiusMeters: number = 300
): Promise<HotSpot[]> {
  // Get all catches with location
  const catches = await prisma.catch.findMany({
    where: {
      isDraft: false,
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (catches.length === 0) return [];

  // Cluster catches by location
  const clusters: Map<string, {
    latitude: number;
    longitude: number;
    anglers: Map<string, { name: string; catchCount: number; totalScore: number }>;
    totalCatches: number;
    totalScore: number;
    lastActivity: Date;
    fishSpecies: Set<string>;
  }> = new Map();

  for (const catch_ of catches) {
    if (!catch_.latitude || !catch_.longitude) continue;

    // Find existing cluster within radius
    let foundCluster: string | null = null;

    for (const [clusterId, cluster] of clusters.entries()) {
      const distance = calculateDistance(
        catch_.latitude,
        catch_.longitude,
        cluster.latitude,
        cluster.longitude
      );

      if (distance * 1000 <= radiusMeters) {
        foundCluster = clusterId;
        break;
      }
    }

    const score = calculateCatchScore(
      catch_.species || 'Unknown',
      catch_.weightKg || undefined,
      catch_.lengthCm || undefined
    );

    if (foundCluster) {
      const cluster = clusters.get(foundCluster)!;

      // Update angler stats
      if (!cluster.anglers.has(catch_.userId)) {
        cluster.anglers.set(catch_.userId, {
          name: catch_.user.name,
          catchCount: 0,
          totalScore: 0,
        });
      }
      const anglerStats = cluster.anglers.get(catch_.userId)!;
      anglerStats.catchCount += 1;
      anglerStats.totalScore += score;

      cluster.totalCatches += 1;
      cluster.totalScore += score;
      if (catch_.createdAt > cluster.lastActivity) {
        cluster.lastActivity = catch_.createdAt;
      }
      if (catch_.species) {
        cluster.fishSpecies.add(catch_.species);
      }
    } else {
      const clusterId = `${catch_.latitude.toFixed(4)}_${catch_.longitude.toFixed(4)}`;
      const anglers = new Map<string, { name: string; catchCount: number; totalScore: number }>();
      anglers.set(catch_.userId, {
        name: catch_.user.name,
        catchCount: 1,
        totalScore: score,
      });

      clusters.set(clusterId, {
        latitude: catch_.latitude,
        longitude: catch_.longitude,
        anglers,
        totalCatches: 1,
        totalScore: score,
        lastActivity: catch_.createdAt,
        fishSpecies: new Set(catch_.species ? [catch_.species] : []),
      });
    }
  }

  // Filter and format hot spots
  const hotSpots: HotSpot[] = [];

  for (const cluster of clusters.values()) {
    const totalAnglers = cluster.anglers.size;

    if (totalAnglers >= minAnglers || cluster.totalCatches >= minCatches) {
      // Get top 5 anglers by score
      const topAnglers = Array.from(cluster.anglers.entries())
        .map(([userId, stats]) => ({
          userId,
          userName: stats.name,
          catchCount: stats.catchCount,
          totalScore: stats.totalScore,
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5);

      hotSpots.push({
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        totalAnglers,
        totalCatches: cluster.totalCatches,
        totalScore: cluster.totalScore,
        lastActivity: cluster.lastActivity,
        topAnglers,
        fishSpecies: Array.from(cluster.fishSpecies),
      });
    }
  }

  return hotSpots.sort((a, b) => b.totalScore - a.totalScore);
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  value: number;
  catchId: string;
  species: string;
  date: Date;
}

/**
 * Get leaderboard for a specific location
 */
export async function getLocationLeaderboard(
  latitude: number,
  longitude: number,
  radiusMeters: number = 300,
  category: 'biggest_fish' | 'longest_fish' | 'highest_session_score' | 'highest_total_score' = 'biggest_fish'
): Promise<LeaderboardEntry[]> {
  const radiusDegrees = radiusMeters / 111000;

  // Get catches within radius
  const catches = await prisma.catch.findMany({
    where: {
      isDraft: false,
      latitude: {
        gte: latitude - radiusDegrees,
        lte: latitude + radiusDegrees,
      },
      longitude: {
        gte: longitude - radiusDegrees,
        lte: longitude + radiusDegrees,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      session: {
        select: {
          id: true,
        },
      },
    },
  });

  // Filter by actual distance
  const nearbyCatches = catches.filter(catch_ => {
    if (!catch_.latitude || !catch_.longitude) return false;
    const distance = calculateDistance(
      latitude,
      longitude,
      catch_.latitude,
      catch_.longitude
    );
    return distance * 1000 <= radiusMeters;
  });

  let leaderboard: LeaderboardEntry[] = [];

  if (category === 'biggest_fish') {
    leaderboard = nearbyCatches
      .filter(c => c.weightKg !== null && c.weightKg > 0)
      .map(c => ({
        userId: c.user.id,
        userName: c.user.name,
        userAvatar: c.user.avatar,
        value: c.weightKg!,
        catchId: c.id,
        species: c.species || 'Unknown',
        date: c.createdAt,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  } else if (category === 'longest_fish') {
    leaderboard = nearbyCatches
      .filter(c => c.lengthCm !== null && c.lengthCm > 0)
      .map(c => ({
        userId: c.user.id,
        userName: c.user.name,
        userAvatar: c.user.avatar,
        value: c.lengthCm!,
        catchId: c.id,
        species: c.species || 'Unknown',
        date: c.createdAt,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  } else if (category === 'highest_total_score') {
    // Group by user and sum scores
    const userScores = new Map<string, {
      userName: string;
      userAvatar: string | null;
      totalScore: number;
      latestCatchId: string;
      latestSpecies: string;
      latestDate: Date;
    }>();

    for (const catch_ of nearbyCatches) {
      const score = calculateCatchScore(
        catch_.species || 'Unknown',
        catch_.weightKg || undefined,
        catch_.lengthCm || undefined
      );

      if (!userScores.has(catch_.userId)) {
        userScores.set(catch_.userId, {
          userName: catch_.user.name,
          userAvatar: catch_.user.avatar,
          totalScore: score,
          latestCatchId: catch_.id,
          latestSpecies: catch_.species || 'Unknown',
          latestDate: catch_.createdAt,
        });
      } else {
        const userScore = userScores.get(catch_.userId)!;
        userScore.totalScore += score;
        if (catch_.createdAt > userScore.latestDate) {
          userScore.latestCatchId = catch_.id;
          userScore.latestSpecies = catch_.species || 'Unknown';
          userScore.latestDate = catch_.createdAt;
        }
      }
    }

    leaderboard = Array.from(userScores.entries())
      .map(([userId, stats]) => ({
        userId,
        userName: stats.userName,
        userAvatar: stats.userAvatar,
        value: stats.totalScore,
        catchId: stats.latestCatchId,
        species: stats.latestSpecies,
        date: stats.latestDate,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  return leaderboard;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
