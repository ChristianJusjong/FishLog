import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CatchData {
  id: string;
  latitude: number | null;
  longitude: number | null;
  weightKg: number | null;
  species: string | null;
}

/**
 * Detect and record segment efforts from a fishing session
 */
export async function detectAndRecordSegmentEfforts(
  sessionId: string,
  userId: string,
  catches: CatchData[]
): Promise<void> {
  if (catches.length === 0) return;

  // Find all active segments
  const segments = await prisma.segment.findMany({
    where: { isActive: true },
  });

  for (const segment of segments) {
    // Find catches within this segment
    const segmentCatches = catches.filter(c => {
      if (!c.latitude || !c.longitude) return false;
      return isWithinSegment(c.latitude, c.longitude, segment);
    });

    if (segmentCatches.length > 0) {
      // Calculate effort stats
      const totalWeight = segmentCatches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
      const biggestFish = Math.max(...segmentCatches.map(c => c.weightKg || 0));
      const speciesDiversity = new Set(segmentCatches.map(c => c.species).filter(Boolean)).size;

      // Calculate effort score
      const effortScore = calculateEffortScore({
        catchCount: segmentCatches.length,
        totalWeight,
        biggestFish,
        speciesDiversity,
        weatherDifficulty: 5, // Default, could be passed from session
      });

      // Check for existing PR
      const userEfforts = await prisma.segmentEffort.findMany({
        where: {
          segmentId: segment.id,
          userId,
        },
        orderBy: { effortScore: 'desc' },
        take: 1,
      });

      const isPR = userEfforts.length === 0 || effortScore > userEfforts[0].effortScore;

      // Create effort record
      await prisma.segmentEffort.create({
        data: {
          segmentId: segment.id,
          userId,
          sessionId,
          catchId: segmentCatches[0].id, // Link to first catch in segment
          effortScore,
          catchCount: segmentCatches.length,
          totalWeight,
          biggestFish,
          speciesDiversity,
          isPR,
        },
      });

      // Update segment stats
      await prisma.segment.update({
        where: { id: segment.id },
        data: {
          activityCount: { increment: 1 },
          totalCatches: { increment: segmentCatches.length },
        },
      });

      // Update leaderboards
      await updateSegmentLeaderboards(segment.id);

      // Check local legend status
      await checkLocalLegendStatus(segment.id, userId);
    }
  }
}

/**
 * Check if a location is within a segment
 */
function isWithinSegment(
  lat: number,
  lng: number,
  segment: any
): boolean {
  if (segment.segmentType === 'spot') {
    // For spot segments, check if within radius
    const distance = calculateDistance(lat, lng, segment.centerLat, segment.centerLng);
    return distance * 1000 <= (segment.radius || 100); // Convert km to meters
  }

  // For route/zone segments, would need to check against bounds
  // This would require GeoJSON parsing and point-in-polygon check
  // For now, use simple radius check from center
  const distance = calculateDistance(lat, lng, segment.centerLat, segment.centerLng);
  return distance * 1000 <= 1000; // 1km default for route/zone
}

/**
 * Calculate distance between two GPS points (Haversine formula)
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

/**
 * Calculate effort score
 */
function calculateEffortScore(data: {
  catchCount: number;
  totalWeight: number;
  biggestFish: number;
  speciesDiversity: number;
  weatherDifficulty: number;
}): number {
  let score = 0;

  // Catch count (0-30 points)
  score += Math.min(data.catchCount * 3, 30);

  // Total weight (0-25 points)
  score += Math.min(data.totalWeight * 2.5, 25);

  // Biggest fish (0-20 points)
  score += Math.min(data.biggestFish * 4, 20);

  // Species diversity (0-15 points)
  score += Math.min(data.speciesDiversity * 5, 15);

  // Weather difficulty multiplier (0.5x to 1.5x)
  const weatherMultiplier = 0.5 + (data.weatherDifficulty / 10);
  score *= weatherMultiplier;

  return Math.round(score);
}

/**
 * Update segment leaderboards
 */
async function updateSegmentLeaderboards(segmentId: string): Promise<void> {
  const categories = ['most_catches', 'biggest_fish', 'total_weight', 'species_diversity'];
  const timeframes = ['all_time', 'year', 'month', 'week'];

  for (const category of categories) {
    for (const timeframe of timeframes) {
      const startDate = getStartDateForTimeframe(timeframe);
      const rankings = await calculateRankings(segmentId, category, startDate);

      // Upsert leaderboard entries
      for (const [index, ranking] of rankings.entries()) {
        await prisma.segmentLeaderboard.upsert({
          where: {
            segmentId_userId_category_timeframe: {
              segmentId,
              userId: ranking.userId,
              category,
              timeframe,
            },
          },
          update: {
            value: ranking.value,
            rank: index + 1,
            efforts: ranking.efforts,
            lastEffortAt: ranking.lastEffortAt,
          },
          create: {
            segmentId,
            userId: ranking.userId,
            category,
            timeframe,
            value: ranking.value,
            rank: index + 1,
            efforts: ranking.efforts,
            lastEffortAt: ranking.lastEffortAt,
          },
        });
      }
    }
  }
}

function getStartDateForTimeframe(timeframe: string): Date {
  const now = new Date();

  switch (timeframe) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return weekStart;
    case 'month':
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);
      return monthStart;
    case 'year':
      const yearStart = new Date(now);
      yearStart.setFullYear(now.getFullYear() - 1);
      return yearStart;
    default: // all_time
      return new Date(0);
  }
}

async function calculateRankings(
  segmentId: string,
  category: string,
  startDate: Date
): Promise<Array<{ userId: string; value: number; efforts: number; lastEffortAt: Date }>> {
  const efforts = await prisma.segmentEffort.findMany({
    where: {
      segmentId,
      completedAt: { gte: startDate },
    },
    orderBy: { completedAt: 'desc' },
  });

  // Group by user
  const userStats = new Map<string, { total: number; count: number; lastEffortAt: Date }>();

  efforts.forEach(effort => {
    const existing = userStats.get(effort.userId) || { total: 0, count: 0, lastEffortAt: effort.completedAt };

    let value = 0;
    switch (category) {
      case 'most_catches':
        value = effort.catchCount;
        break;
      case 'biggest_fish':
        value = effort.biggestFish || 0;
        break;
      case 'total_weight':
        value = effort.totalWeight || 0;
        break;
      case 'species_diversity':
        value = effort.speciesDiversity;
        break;
    }

    userStats.set(effort.userId, {
      total: category === 'biggest_fish' ? Math.max(existing.total, value) : existing.total + value,
      count: existing.count + 1,
      lastEffortAt: effort.completedAt > existing.lastEffortAt ? effort.completedAt : existing.lastEffortAt,
    });
  });

  // Convert to array and sort
  const rankings = Array.from(userStats.entries())
    .map(([userId, stats]) => ({
      userId,
      value: stats.total,
      efforts: stats.count,
      lastEffortAt: stats.lastEffortAt,
    }))
    .sort((a, b) => b.value - a.value);

  return rankings;
}

/**
 * Check and update local legend status
 */
async function checkLocalLegendStatus(segmentId: string, userId: string): Promise<void> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Count user's efforts in past 90 days
  const userEfforts = await prisma.segmentEffort.count({
    where: {
      segmentId,
      userId,
      completedAt: { gte: ninetyDaysAgo },
    },
  });

  // Get current legend
  const currentLegend = await prisma.localLegend.findFirst({
    where: {
      segmentId,
      status: 'active',
    },
  });

  if (!currentLegend) {
    // No legend yet, check if user qualifies (need at least 3 efforts)
    if (userEfforts >= 3) {
      const topUser = await getTopUserForSegment(segmentId, ninetyDaysAgo);

      if (topUser && topUser.userId === userId) {
        await createLocalLegend(segmentId, userId, userEfforts);
      }
    }
  } else {
    // Check if challenger has more efforts
    const legendEfforts = await prisma.segmentEffort.count({
      where: {
        segmentId,
        userId: currentLegend.userId,
        completedAt: { gte: ninetyDaysAgo },
      },
    });

    if (userId !== currentLegend.userId && userEfforts > legendEfforts && userEfforts >= 3) {
      // Dethrone!
      await prisma.localLegend.update({
        where: { id: currentLegend.id },
        data: {
          status: 'dethroned',
          dethronedAt: new Date(),
        },
      });

      await createLocalLegend(segmentId, userId, userEfforts);
    }
  }
}

async function getTopUserForSegment(
  segmentId: string,
  startDate: Date
): Promise<{ userId: string; effortCount: number } | null> {
  const efforts = await prisma.segmentEffort.findMany({
    where: {
      segmentId,
      completedAt: { gte: startDate },
    },
  });

  // Count efforts per user
  const userCounts = new Map<string, number>();
  efforts.forEach(effort => {
    userCounts.set(effort.userId, (userCounts.get(effort.userId) || 0) + 1);
  });

  // Find user with most efforts
  let topUser: { userId: string; effortCount: number } | null = null;
  userCounts.forEach((count, userId) => {
    if (!topUser || count > topUser.effortCount) {
      topUser = { userId, effortCount: count };
    }
  });

  return topUser;
}

async function createLocalLegend(segmentId: string, userId: string, effortCount: number): Promise<void> {
  await prisma.localLegend.create({
    data: {
      segmentId,
      userId,
      status: 'active',
      effortCount,
    },
  });
}
