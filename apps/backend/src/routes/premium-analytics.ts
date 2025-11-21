import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function premiumAnalyticsRoutes(fastify: FastifyInstance) {
  // ==================== ADVANCED CATCH ANALYTICS ====================

  // GET /premium/analytics/overview - Comprehensive statistics overview
  fastify.get('/premium/analytics/overview', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      // Get all catches in date range
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          session: true,
        },
      });

      // Calculate comprehensive stats
      const totalCatches = catches.length;
      const totalWeight = catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
      const avgWeight = totalCatches > 0 ? totalWeight / totalCatches : 0;
      const biggestCatch = Math.max(...catches.map(c => c.weightKg || 0), 0);
      const uniqueSpecies = new Set(catches.map(c => c.species).filter(Boolean)).size;
      const uniqueLocations = new Set(
        catches.filter(c => c.latitude && c.longitude)
          .map(c => `${c.latitude?.toFixed(2)},${c.longitude?.toFixed(2)}`)
      ).size;

      // Session stats
      const sessions = await prisma.fishingSession.findMany({
        where: {
          userId,
          startTime: { gte: start },
          endTime: { lte: end, not: null },
        },
      });

      const totalSessions = sessions.length;
      const totalFishingTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalDistance = sessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);
      const avgCatchesPerSession = totalSessions > 0 ? totalCatches / totalSessions : 0;
      const catchRate = totalFishingTime > 0 ? (totalCatches / (totalFishingTime / 60)).toFixed(2) : 0; // catches per hour

      // Release rate
      const released = catches.filter(c => c.isReleased).length;
      const releaseRate = totalCatches > 0 ? (released / totalCatches) * 100 : 0;

      // Most productive times
      const hourDistribution = new Array(24).fill(0);
      catches.forEach(c => {
        hourDistribution[c.caughtAt.getHours()]++;
      });
      const bestHour = hourDistribution.indexOf(Math.max(...hourDistribution));

      // Day of week distribution
      const dayDistribution = new Array(7).fill(0);
      catches.forEach(c => {
        dayDistribution[c.caughtAt.getDay()]++;
      });
      const bestDay = dayDistribution.indexOf(Math.max(...dayDistribution));

      // Species breakdown
      const speciesBreakdown = catches.reduce((acc, c) => {
        if (c.species) {
          acc[c.species] = (acc[c.species] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topSpecies = Object.entries(speciesBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([species, count]) => ({ species, count }));

      return reply.send({
        period: { start, end },
        catches: {
          total: totalCatches,
          totalWeight,
          avgWeight: parseFloat(avgWeight.toFixed(2)),
          biggestCatch,
          uniqueSpecies,
          uniqueLocations,
          released,
          releaseRate: parseFloat(releaseRate.toFixed(1)),
        },
        sessions: {
          total: totalSessions,
          totalFishingTime, // minutes
          totalDistance, // km
          avgCatchesPerSession: parseFloat(avgCatchesPerSession.toFixed(2)),
          catchRate: parseFloat(catchRate as string), // catches per hour
        },
        insights: {
          bestHour,
          bestDay,
          topSpecies,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get analytics overview' });
    }
  });

  // GET /premium/analytics/time-series - Time-based trend analysis
  fastify.get('/premium/analytics/time-series', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { interval = 'week', startDate, endDate } = request.query as {
        interval?: 'day' | 'week' | 'month' | 'year';
        startDate?: string;
        endDate?: string;
      };

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group catches by time interval
      const timeSeries = groupByInterval(catches, interval);

      // Calculate trends
      const dataPoints = timeSeries.map(t => t.count);
      const trend = calculateTrend(dataPoints);

      return reply.send({
        interval,
        period: { start, end },
        data: timeSeries,
        trend: {
          direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          percentage: parseFloat((Math.abs(trend) * 100).toFixed(1)),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get time series data' });
    }
  });

  // GET /premium/analytics/species/:species - Deep dive into specific species
  fastify.get('/premium/analytics/species/:species', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { species } = request.params as { species: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          species,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          session: true,
        },
      });

      if (catches.length === 0) {
        return reply.send({
          species,
          totalCatches: 0,
          message: 'No catches found for this species',
        });
      }

      const totalCatches = catches.length;
      const weights = catches.map(c => c.weightKg || 0).filter(w => w > 0);
      const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
      const biggestCatch = Math.max(...weights, 0);
      const personalBest = await prisma.personalBest.findFirst({
        where: { userId, species },
        orderBy: { weightKg: 'desc' },
      });

      // Location analysis
      const locations = catches
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
          lat: c.latitude!,
          lng: c.longitude!,
          weight: c.weightKg || 0,
          date: c.caughtAt,
        }));

      // Best locations (cluster analysis)
      const locationClusters = clusterLocations(locations, 0.01); // ~1km radius
      const bestLocations = locationClusters
        .sort((a, b) => b.totalWeight - a.totalWeight)
        .slice(0, 5);

      // Time patterns
      const hourDistribution = new Array(24).fill(0);
      const monthDistribution = new Array(12).fill(0);
      catches.forEach(c => {
        hourDistribution[c.caughtAt.getHours()]++;
        monthDistribution[c.caughtAt.getMonth()]++;
      });

      const bestHours = hourDistribution
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const bestMonths = monthDistribution
        .map((count, month) => ({ month, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Session types
      const sessionTypes = catches.reduce((acc, c) => {
        if (c.session?.sessionType) {
          acc[c.session.sessionType] = (acc[c.session.sessionType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const bestSessionType = Object.entries(sessionTypes)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      // Bait effectiveness
      const baitStats = catches.reduce((acc, c) => {
        if (c.bait) {
          if (!acc[c.bait]) {
            acc[c.bait] = { count: 0, totalWeight: 0, avgWeight: 0 };
          }
          acc[c.bait].count++;
          acc[c.bait].totalWeight += c.weightKg || 0;
        }
        return acc;
      }, {} as Record<string, { count: number; totalWeight: number; avgWeight: number }>);

      Object.keys(baitStats).forEach(bait => {
        baitStats[bait].avgWeight = baitStats[bait].totalWeight / baitStats[bait].count;
      });

      const topBaits = Object.entries(baitStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([bait, stats]) => ({ bait, ...stats, avgWeight: parseFloat(stats.avgWeight.toFixed(2)) }));

      return reply.send({
        species,
        totalCatches,
        stats: {
          avgWeight: parseFloat(avgWeight.toFixed(2)),
          biggestCatch,
          personalBest: personalBest ? personalBest.weightKg : null,
        },
        patterns: {
          bestHours,
          bestMonths,
          bestSessionType,
        },
        locations: {
          totalUniqueSpots: locations.length,
          bestLocations,
        },
        bait: {
          topBaits,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get species analytics' });
    }
  });

  // GET /premium/analytics/heatmap - Location-based catch density
  fastify.get('/premium/analytics/heatmap', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { species, startDate, endDate, bounds } = request.query as {
        species?: string;
        startDate?: string;
        endDate?: string;
        bounds?: string; // "minLat,minLng,maxLat,maxLng"
      };

      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      const where: any = {
        userId,
        caughtAt: {
          gte: start,
          lte: end,
        },
        latitude: { not: null },
        longitude: { not: null },
      };

      if (species) {
        where.species = species;
      }

      if (bounds) {
        const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
        where.latitude = { gte: minLat, lte: maxLat };
        where.longitude = { gte: minLng, lte: maxLng };
      }

      const catches = await prisma.catch.findMany({
        where,
        select: {
          id: true,
          latitude: true,
          longitude: true,
          weightKg: true,
          species: true,
          caughtAt: true,
        },
      });

      // Create heatmap data points
      const heatmapData = catches.map(c => ({
        lat: c.latitude!,
        lng: c.longitude!,
        weight: 1, // intensity
        size: c.weightKg || 0,
        species: c.species,
        date: c.caughtAt,
      }));

      // Grid-based aggregation for performance
      const gridSize = 0.005; // ~500m
      const grid = new Map<string, { lat: number; lng: number; count: number; totalWeight: number }>();

      catches.forEach(c => {
        const gridLat = Math.round(c.latitude! / gridSize) * gridSize;
        const gridLng = Math.round(c.longitude! / gridSize) * gridSize;
        const key = `${gridLat},${gridLng}`;

        const existing = grid.get(key) || { lat: gridLat, lng: gridLng, count: 0, totalWeight: 0 };
        existing.count++;
        existing.totalWeight += c.weightKg || 0;
        grid.set(key, existing);
      });

      const aggregatedData = Array.from(grid.values()).map(cell => ({
        lat: cell.lat,
        lng: cell.lng,
        intensity: cell.count,
        avgWeight: cell.count > 0 ? cell.totalWeight / cell.count : 0,
      }));

      return reply.send({
        totalPoints: catches.length,
        heatmapData: aggregatedData,
        rawData: heatmapData.slice(0, 1000), // Limit for performance
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate heatmap data' });
    }
  });

  // GET /premium/analytics/compare - Compare performance across different periods
  fastify.get('/premium/analytics/compare', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { period1Start, period1End, period2Start, period2End } = request.query as {
        period1Start: string;
        period1End: string;
        period2Start: string;
        period2End: string;
      };

      if (!period1Start || !period1End || !period2Start || !period2End) {
        return reply.code(400).send({ error: 'All period dates are required' });
      }

      const p1Start = new Date(period1Start);
      const p1End = new Date(period1End);
      const p2Start = new Date(period2Start);
      const p2End = new Date(period2End);

      // Get catches for both periods
      const [period1Catches, period2Catches] = await Promise.all([
        prisma.catch.findMany({
          where: {
            userId,
            createdAt: { gte: p1Start, lte: p1End },
          },
        }),
        prisma.catch.findMany({
          where: {
            userId,
            createdAt: { gte: p2Start, lte: p2End },
          },
        }),
      ]);

      const calculatePeriodStats = (catches: any[]) => {
        const totalCatches = catches.length;
        const totalWeight = catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
        const avgWeight = totalCatches > 0 ? totalWeight / totalCatches : 0;
        const biggestCatch = Math.max(...catches.map(c => c.weightKg || 0), 0);
        const uniqueSpecies = new Set(catches.map(c => c.species).filter(Boolean)).size;
        const released = catches.filter(c => c.isReleased).length;
        const releaseRate = totalCatches > 0 ? (released / totalCatches) * 100 : 0;

        return {
          totalCatches,
          totalWeight: parseFloat(totalWeight.toFixed(2)),
          avgWeight: parseFloat(avgWeight.toFixed(2)),
          biggestCatch,
          uniqueSpecies,
          releaseRate: parseFloat(releaseRate.toFixed(1)),
        };
      };

      const period1Stats = calculatePeriodStats(period1Catches);
      const period2Stats = calculatePeriodStats(period2Catches);

      // Calculate differences
      const differences = {
        totalCatches: period2Stats.totalCatches - period1Stats.totalCatches,
        totalWeight: parseFloat((period2Stats.totalWeight - period1Stats.totalWeight).toFixed(2)),
        avgWeight: parseFloat((period2Stats.avgWeight - period1Stats.avgWeight).toFixed(2)),
        biggestCatch: parseFloat((period2Stats.biggestCatch - period1Stats.biggestCatch).toFixed(2)),
        uniqueSpecies: period2Stats.uniqueSpecies - period1Stats.uniqueSpecies,
        releaseRate: parseFloat((period2Stats.releaseRate - period1Stats.releaseRate).toFixed(1)),
      };

      // Calculate percentage changes
      const percentageChanges = {
        totalCatches: period1Stats.totalCatches > 0
          ? parseFloat(((differences.totalCatches / period1Stats.totalCatches) * 100).toFixed(1))
          : 0,
        avgWeight: period1Stats.avgWeight > 0
          ? parseFloat(((differences.avgWeight / period1Stats.avgWeight) * 100).toFixed(1))
          : 0,
      };

      return reply.send({
        period1: {
          start: p1Start,
          end: p1End,
          stats: period1Stats,
        },
        period2: {
          start: p2Start,
          end: p2End,
          stats: period2Stats,
        },
        comparison: {
          differences,
          percentageChanges,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to compare periods' });
    }
  });

  // GET /premium/analytics/predictions - AI-powered catch predictions
  fastify.get('/premium/analytics/predictions', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { lat, lng, species } = request.query as {
        lat?: string;
        lng?: string;
        species?: string;
      };

      // Get user's historical data
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          ...(species && { species }),
        },
        include: {
          session: true,
        },
        orderBy: { caughtAt: 'desc' },
        take: 500, // Last 500 catches for analysis
      });

      if (catches.length < 10) {
        return reply.send({
          message: 'Not enough data for predictions. Need at least 10 catches.',
          predictions: [],
        });
      }

      const currentHour = new Date().getHours();
      const currentMonth = new Date().getMonth();
      const currentDay = new Date().getDay();

      // Analyze success patterns
      const hourSuccess = new Array(24).fill(0);
      const monthSuccess = new Array(12).fill(0);
      const daySuccess = new Array(7).fill(0);

      catches.forEach(c => {
        hourSuccess[c.caughtAt.getHours()]++;
        monthSuccess[c.caughtAt.getMonth()]++;
        daySuccess[c.caughtAt.getDay()]++;
      });

      // Normalize to probabilities
      const totalCatches = catches.length;
      const hourProbability = hourSuccess.map(count => (count / totalCatches) * 100);
      const currentHourSuccess = hourProbability[currentHour];

      const predictions = {
        currentConditions: {
          hour: currentHour,
          month: currentMonth,
          day: currentDay,
          successProbability: parseFloat(currentHourSuccess.toFixed(1)),
        },
        bestTimes: {
          hours: hourProbability
            .map((prob, hour) => ({ hour, probability: parseFloat(prob.toFixed(1)) }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5),
          months: monthSuccess
            .map((count, month) => ({ month, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3),
          daysOfWeek: daySuccess
            .map((count, day) => ({ day, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3),
        },
        recommendations: generateRecommendations(currentHourSuccess, catches),
      };

      return reply.send(predictions);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate predictions' });
    }
  });

  // GET /premium/analytics/goals - Goal tracking and progress
  fastify.get('/premium/analytics/goals', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const goals = await prisma.userGoal.findMany({
        where: { userId },
        orderBy: { endDate: 'asc' },
      });

      // Calculate progress for each goal
      const goalsWithProgress = await Promise.all(
        goals.map(async (goal) => {
          let currentValue = 0;

          const startDate = goal.startDate || new Date(0);
          const now = new Date();

          switch (goal.goalType) {
            case 'total_catches':
              currentValue = await prisma.catch.count({
                where: {
                  userId,
                  createdAt: { gte: startDate, lte: now },
                },
              });
              break;
            case 'species_diversity':
              const catches = await prisma.catch.findMany({
                where: {
                  userId,
                  createdAt: { gte: startDate, lte: now },
                },
                select: { species: true },
              });
              currentValue = new Set(catches.map(c => c.species).filter(Boolean)).size;
              break;
            case 'total_weight':
              const weightCatches = await prisma.catch.findMany({
                where: {
                  userId,
                  createdAt: { gte: startDate, lte: now },
                },
                select: { weightKg: true },
              });
              currentValue = weightCatches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
              break;
            case 'biggest_fish':
              const maxWeight = await prisma.catch.findFirst({
                where: {
                  userId,
                  createdAt: { gte: startDate, lte: now },
                },
                orderBy: { weightKg: 'desc' },
                select: { weightKg: true },
              });
              currentValue = maxWeight?.weightKg || 0;
              break;
          }

          const progress = goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;
          const isCompleted = currentValue >= goal.targetValue;

          // Update goal if completed
          if (isCompleted && goal.status !== 'completed') {
            await prisma.userGoal.update({
              where: { id: goal.id },
              data: {
                status: 'completed',
                completedAt: new Date(),
              },
            });
          }

          return {
            ...goal,
            currentValue: parseFloat(currentValue.toFixed(2)),
            progress: parseFloat(progress.toFixed(1)),
            isCompleted,
          };
        })
      );

      return reply.send({
        goals: goalsWithProgress,
        summary: {
          total: goals.length,
          active: goals.filter(g => g.status === 'active').length,
          completed: goals.filter(g => g.status === 'completed').length,
          abandoned: goals.filter(g => g.status === 'abandoned').length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get goals' });
    }
  });

  // POST /premium/analytics/goals - Create a new goal
  fastify.post('/premium/analytics/goals', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { goalType, targetValue, endDate, description } = request.body as {
        goalType: string;
        targetValue: number;
        endDate: string;
        description?: string;
      };

      const validGoalTypes = ['total_catches', 'species_diversity', 'total_weight', 'biggest_fish'];
      if (!validGoalTypes.includes(goalType)) {
        return reply.code(400).send({ error: 'Invalid goal type' });
      }

      const goal = await prisma.userGoal.create({
        data: {
          userId,
          type: goalType,
          title: `${goalType} goal`,
          targetValue,
          currentValue: 0,
          endDate: new Date(endDate),
          description,
          startDate: new Date(),
          timeframe: 'custom',
          status: 'active',
        },
      });

      return reply.code(201).send({ message: 'Goal created successfully', goal });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create goal' });
    }
  });

  // PATCH /premium/analytics/goals/:id - Update goal status
  fastify.patch('/premium/analytics/goals/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const goal = await prisma.userGoal.findUnique({
        where: { id },
      });

      if (!goal || goal.userId !== userId) {
        return reply.code(404).send({ error: 'Goal not found' });
      }

      const updated = await prisma.userGoal.update({
        where: { id },
        data: {
          status,
          ...(status === 'completed' && { completedAt: new Date() }),
        },
      });

      return reply.send({ message: 'Goal updated successfully', goal: updated });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update goal' });
    }
  });
}

// ==================== HELPER FUNCTIONS ====================

function groupByInterval(catches: any[], interval: 'day' | 'week' | 'month' | 'year') {
  const groups = new Map<string, { date: string; count: number; weight: number }>();

  catches.forEach(c => {
    let key: string;
    const date = new Date(c.caughtAt);

    switch (interval) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }

    const existing = groups.get(key) || { date: key, count: 0, weight: 0 };
    existing.count++;
    existing.weight += c.weightKg || 0;
    groups.set(key, existing);
  });

  return Array.from(groups.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(g => ({
      ...g,
      weight: parseFloat(g.weight.toFixed(2)),
    }));
}

function calculateTrend(dataPoints: number[]): number {
  if (dataPoints.length < 2) return 0;

  const n = dataPoints.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = dataPoints.reduce((a, b) => a + b, 0);
  const sumXY = dataPoints.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = dataPoints.reduce((sum, _, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgY = sumY / n;

  return avgY !== 0 ? slope / avgY : 0;
}

interface Location {
  lat: number;
  lng: number;
  weight: number;
  date: Date;
}

function clusterLocations(locations: Location[], radius: number) {
  const clusters: Array<{
    centerLat: number;
    centerLng: number;
    count: number;
    totalWeight: number;
    avgWeight: number;
  }> = [];

  const visited = new Set<number>();

  locations.forEach((loc, idx) => {
    if (visited.has(idx)) return;

    const cluster = {
      centerLat: loc.lat,
      centerLng: loc.lng,
      count: 1,
      totalWeight: loc.weight,
      avgWeight: 0,
    };

    visited.add(idx);

    // Find nearby locations
    locations.forEach((other, otherIdx) => {
      if (visited.has(otherIdx)) return;

      const distance = Math.sqrt(
        Math.pow(loc.lat - other.lat, 2) + Math.pow(loc.lng - other.lng, 2)
      );

      if (distance <= radius) {
        cluster.count++;
        cluster.totalWeight += other.weight;
        visited.add(otherIdx);
      }
    });

    cluster.avgWeight = cluster.count > 0 ? cluster.totalWeight / cluster.count : 0;
    cluster.centerLat = parseFloat(cluster.centerLat.toFixed(6));
    cluster.centerLng = parseFloat(cluster.centerLng.toFixed(6));
    cluster.avgWeight = parseFloat(cluster.avgWeight.toFixed(2));

    clusters.push(cluster);
  });

  return clusters;
}

function generateRecommendations(currentSuccessRate: number, catches: any[]): string[] {
  const recommendations: string[] = [];

  if (currentSuccessRate < 30) {
    recommendations.push('Current time has lower success rate. Consider fishing during peak hours.');
  } else if (currentSuccessRate > 70) {
    recommendations.push('Excellent time to fish based on your historical data!');
  }

  // Weather-based (would integrate with weather API)
  const recentCatches = catches.slice(0, 50);
  const avgRecentWeight = recentCatches.reduce((sum, c) => sum + (c.weightKg || 0), 0) / recentCatches.length;

  if (avgRecentWeight > 1.5) {
    recommendations.push('Recent catches show good size - conditions are favorable.');
  }

  // Species diversity
  const recentSpecies = new Set(recentCatches.map(c => c.species).filter(Boolean));
  if (recentSpecies.size < 3) {
    recommendations.push('Try varying your bait or location to increase species diversity.');
  }

  return recommendations;
}
