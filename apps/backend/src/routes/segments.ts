import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function segmentsRoutes(fastify: FastifyInstance) {
  // POST /segments - Create a new segment
  fastify.post('/segments', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const {
        name,
        description,
        segmentType = 'spot',
        centerLat,
        centerLng,
        radius = 100,
        bounds,
        difficulty,
        tags = []
      } = request.body as {
        name: string;
        description?: string;
        segmentType?: 'spot' | 'route' | 'zone';
        centerLat: number;
        centerLng: number;
        radius?: number;
        bounds?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        tags?: string[];
      };

      // Check for duplicate segments in the same location
      const existing = await prisma.segment.findFirst({
        where: {
          centerLat: { gte: centerLat - 0.001, lte: centerLat + 0.001 },
          centerLng: { gte: centerLng - 0.001, lte: centerLng + 0.001 },
          isActive: true,
        },
      });

      if (existing) {
        return reply.code(400).send({
          error: 'Segment already exists',
          message: 'A segment already exists at this location',
          existingSegmentId: existing.id,
        });
      }

      // Create segment
      const segment = await prisma.segment.create({
        data: {
          name,
          description,
          segmentType,
          centerLat,
          centerLng,
          radius: segmentType === 'spot' ? radius : null,
          bounds: segmentType !== 'spot' ? bounds : null,
          difficulty,
          tags,
          createdBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return reply.code(201).send({
        message: 'Segment created successfully',
        segment,
      });
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to create segment', details: errorMessage });
    }
  });

  // GET /segments/nearby - Get segments near a location
  fastify.get('/segments/nearby', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lng, radius = '50000' } = request.query as {
        lat: string;
        lng: string;
        radius?: string;
      };

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseInt(radius);
      const radiusDegrees = radiusMeters / 111000; // Approximate conversion

      // Find segments within radius
      const segments = await prisma.segment.findMany({
        where: {
          isActive: true,
          centerLat: {
            gte: latitude - radiusDegrees,
            lte: latitude + radiusDegrees,
          },
          centerLng: {
            gte: longitude - radiusDegrees,
            lte: longitude + radiusDegrees,
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          legends: {
            where: { status: 'active' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              efforts: true,
            },
          },
        },
        orderBy: { totalCatches: 'desc' },
      });

      // Calculate actual distance and filter
      const segmentsWithDistance = segments
        .map(segment => {
          const distance = calculateDistance(
            latitude,
            longitude,
            segment.centerLat,
            segment.centerLng
          );
          return { ...segment, distance: distance * 1000 }; // Convert to meters
        })
        .filter(segment => segment.distance <= radiusMeters)
        .sort((a, b) => a.distance - b.distance);

      return reply.send({
        segments: segmentsWithDistance.map(s => ({
          ...s,
          currentLegend: s.legends[0] || null,
          effortsCount: s._count.efforts,
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get nearby segments' });
    }
  });

  // GET /segments/:id - Get segment details
  fastify.get('/segments/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const segment = await prisma.segment.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          legends: {
            where: { status: 'active' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              efforts: true,
            },
          },
        },
      });

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      return reply.send({
        ...segment,
        currentLegend: segment.legends[0] || null,
        effortsCount: segment._count.efforts,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get segment' });
    }
  });

  // GET /segments/:id/leaderboard - Get segment leaderboard
  fastify.get('/segments/:id/leaderboard', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        category = 'most_catches',
        timeframe = 'all_time',
        limit = '10'
      } = request.query as {
        category?: string;
        timeframe?: string;
        limit?: string;
      };

      const limitNum = parseInt(limit);

      // Verify segment exists
      const segment = await prisma.segment.findUnique({
        where: { id },
      });

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      // Get leaderboard
      const leaderboard = await prisma.segmentLeaderboard.findMany({
        where: {
          segmentId: id,
          category,
          timeframe,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { rank: 'asc' },
        take: limitNum,
      });

      return reply.send({
        category,
        timeframe,
        leaderboard,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get leaderboard' });
    }
  });

  // GET /segments/:id/efforts - Get efforts for a segment
  fastify.get('/segments/:id/efforts', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        userId,
        page = '1',
        limit = '20'
      } = request.query as {
        userId?: string;
        page?: string;
        limit?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { segmentId: id };
      if (userId) {
        where.userId = userId;
      }

      const efforts = await prisma.segmentEffort.findMany({
        where,
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
              title: true,
              startTime: true,
            },
          },
        },
        orderBy: { effortScore: 'desc' },
        skip,
        take: limitNum,
      });

      const total = await prisma.segmentEffort.count({ where });

      return reply.send({
        efforts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get efforts' });
    }
  });

  // GET /segments/:id/legend-history - Get legend history
  fastify.get('/segments/:id/legend-history', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const legends = await prisma.localLegend.findMany({
        where: { segmentId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { achievedAt: 'desc' },
      });

      return reply.send({ legends });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get legend history' });
    }
  });

  // GET /segments/explore - Discover popular segments
  fastify.get('/segments/explore', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { page = '1', limit = '20', filter = 'popular' } = request.query as {
        page?: string;
        limit?: string;
        filter?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let orderBy: any = { totalCatches: 'desc' }; // popular

      if (filter === 'recent') {
        orderBy = { createdAt: 'desc' };
      } else if (filter === 'active') {
        orderBy = { activityCount: 'desc' };
      }

      const segments = await prisma.segment.findMany({
        where: { isActive: true },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          legends: {
            where: { status: 'active' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              efforts: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      });

      const total = await prisma.segment.count({
        where: { isActive: true },
      });

      return reply.send({
        segments: segments.map(s => ({
          ...s,
          currentLegend: s.legends[0] || null,
          effortsCount: s._count.efforts,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to explore segments' });
    }
  });

  // POST /segments/:id/efforts - Manually record a segment effort
  fastify.post('/segments/:id/efforts', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: segmentId } = request.params as { id: string };
      const {
        catchId,
        sessionId,
        catchCount = 1,
        totalWeight,
        biggestFish,
        speciesDiversity = 1,
        weatherDifficulty
      } = request.body as {
        catchId?: string;
        sessionId?: string;
        catchCount?: number;
        totalWeight?: number;
        biggestFish?: number;
        speciesDiversity?: number;
        weatherDifficulty?: number;
      };

      // Verify segment exists
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId },
      });

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      // Calculate effort score
      const effortScore = calculateEffortScore({
        catchCount,
        totalWeight: totalWeight || 0,
        biggestFish: biggestFish || 0,
        speciesDiversity,
        weatherDifficulty: weatherDifficulty || 5,
      });

      // Check for existing PR
      const userEfforts = await prisma.segmentEffort.findMany({
        where: {
          segmentId,
          userId,
        },
        orderBy: { effortScore: 'desc' },
        take: 1,
      });

      const isPR = userEfforts.length === 0 || effortScore > userEfforts[0].effortScore;

      // Create effort
      const effort = await prisma.segmentEffort.create({
        data: {
          segmentId,
          userId,
          catchId,
          sessionId,
          effortScore,
          catchCount,
          totalWeight,
          biggestFish,
          speciesDiversity,
          weatherDifficulty,
          isPR,
        },
      });

      // Update segment stats
      await prisma.segment.update({
        where: { id: segmentId },
        data: {
          activityCount: { increment: 1 },
          totalCatches: { increment: catchCount },
        },
      });

      // Update leaderboards
      await updateSegmentLeaderboards(segmentId);

      // Check local legend status
      await checkLocalLegendStatus(segmentId, userId);

      return reply.code(201).send({
        message: 'Effort recorded successfully',
        effort,
        isPR,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to record effort' });
    }
  });

  // PATCH /segments/:id - Update segment
  fastify.patch('/segments/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const updates = request.body as {
        name?: string;
        description?: string;
        difficulty?: string;
        tags?: string[];
      };

      // Verify ownership or admin
      const segment = await prisma.segment.findUnique({
        where: { id },
      });

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      if (segment.createdBy !== userId) {
        // TODO: Check if user is admin
        return reply.code(403).send({ error: 'Not authorized' });
      }

      // Update segment
      const updatedSegment = await prisma.segment.update({
        where: { id },
        data: updates,
      });

      return reply.send({
        message: 'Segment updated successfully',
        segment: updatedSegment,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update segment' });
    }
  });

  // DELETE /segments/:id - Deactivate segment
  fastify.delete('/segments/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      // Verify ownership or admin
      const segment = await prisma.segment.findUnique({
        where: { id },
      });

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      if (segment.createdBy !== userId) {
        // TODO: Check if user is admin
        return reply.code(403).send({ error: 'Not authorized' });
      }

      // Deactivate instead of delete
      await prisma.segment.update({
        where: { id },
        data: { isActive: false },
      });

      return reply.send({ message: 'Segment deactivated successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to deactivate segment' });
    }
  });
}

// Utility Functions

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

function calculateEffortScore(data: {
  catchCount: number;
  totalWeight: number;
  biggestFish: number;
  speciesDiversity: number;
  weatherDifficulty: number;
}): number {
  // Scoring algorithm
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

async function updateSegmentLeaderboards(segmentId: string) {
  const categories = ['most_catches', 'biggest_fish', 'total_weight', 'species_diversity'];
  const timeframes = ['all_time', 'year', 'month', 'week'];

  for (const category of categories) {
    for (const timeframe of timeframes) {
      const startDate = getStartDateForTimeframe(timeframe);

      // Calculate rankings
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

async function checkLocalLegendStatus(segmentId: string, userId: string) {
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
      // Check if user has most efforts
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

      // TODO: Send notification to dethroned legend
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

async function createLocalLegend(segmentId: string, userId: string, effortCount: number) {
  await prisma.localLegend.create({
    data: {
      segmentId,
      userId,
      status: 'active',
      effortCount,
    },
  });

  // TODO: Send notification to new legend
}
