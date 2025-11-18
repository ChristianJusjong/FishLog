import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function statisticsRoutes(fastify: FastifyInstance) {
  // Get user statistics overview
  fastify.get('/statistics/overview', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all catches for the user (excluding drafts)
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
        },
        select: {
          id: true,
          species: true,
          lengthCm: true,
          weightKg: true,
          createdAt: true,
          latitude: true,
          longitude: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Total catches
      const totalCatches = catches.length;

      // Species breakdown
      const speciesCount: { [key: string]: number } = {};
      catches.forEach(c => {
        if (c.species) {
          speciesCount[c.species] = (speciesCount[c.species] || 0) + 1;
        }
      });

      const speciesBreakdown = Object.entries(speciesCount)
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count);

      // Personal records
      const records = {
        biggestFish: catches.reduce((max, c) =>
          (c.lengthCm && (!max.lengthCm || c.lengthCm > max.lengthCm)) ? c : max
        , {} as any),
        heaviestFish: catches.reduce((max, c) =>
          (c.weightKg && (!max.weightKg || c.weightKg > max.weightKg)) ? c : max
        , {} as any),
      };

      // Species-specific records
      const speciesRecords: any = {};
      Object.keys(speciesCount).forEach(species => {
        const speciesCatches = catches.filter(c => c.species === species);
        speciesRecords[species] = {
          biggest: speciesCatches.reduce((max, c) =>
            (c.lengthCm && (!max.lengthCm || c.lengthCm > max.lengthCm)) ? c : max
          , {} as any),
          heaviest: speciesCatches.reduce((max, c) =>
            (c.weightKg && (!max.weightKg || c.weightKg > max.weightKg)) ? c : max
          , {} as any),
          count: speciesCatches.length,
        };
      });

      // Average stats
      const catchesWithLength = catches.filter(c => c.lengthCm);
      const catchesWithWeight = catches.filter(c => c.weightKg);

      const averageLength = catchesWithLength.length > 0
        ? catchesWithLength.reduce((sum, c) => sum + (c.lengthCm || 0), 0) / catchesWithLength.length
        : 0;

      const averageWeight = catchesWithWeight.length > 0
        ? catchesWithWeight.reduce((sum, c) => sum + (c.weightKg || 0), 0) / catchesWithWeight.length
        : 0;

      return {
        totalCatches,
        speciesBreakdown,
        records: {
          biggest: records.biggestFish.lengthCm ? {
            species: records.biggestFish.species,
            lengthCm: records.biggestFish.lengthCm,
            weightKg: records.biggestFish.weightKg,
            date: records.biggestFish.createdAt,
          } : null,
          heaviest: records.heaviestFish.weightKg ? {
            species: records.heaviestFish.species,
            lengthCm: records.heaviestFish.lengthCm,
            weightKg: records.heaviestFish.weightKg,
            date: records.heaviestFish.createdAt,
          } : null,
        },
        speciesRecords,
        averages: {
          length: Math.round(averageLength * 10) / 10,
          weight: Math.round(averageWeight * 1000) / 1000,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch statistics' };
    }
  });

  // Get catches over time (for graphs)
  fastify.get('/statistics/timeline', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { period = 'year' } = request.query as { period?: 'week' | 'month' | 'year' | 'all' };

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          id: true,
          species: true,
          createdAt: true,
          weightKg: true,
          lengthCm: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by date
      const timeline: { [key: string]: number } = {};
      catches.forEach(c => {
        const date = c.createdAt.toISOString().split('T')[0];
        timeline[date] = (timeline[date] || 0) + 1;
      });

      const timelineData = Object.entries(timeline)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by month for longer periods
      const monthlyData: { [key: string]: number } = {};
      catches.forEach(c => {
        const month = c.createdAt.toISOString().substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      const monthlyTimeline = Object.entries(monthlyData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        period,
        daily: timelineData,
        monthly: monthlyTimeline,
        totalInPeriod: catches.length,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch timeline data' };
    }
  });

  // Get catches by time of day
  fastify.get('/statistics/time-analysis', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
        },
        select: {
          createdAt: true,
        },
      });

      // Group by hour
      const hourlyData: { [key: number]: number } = {};
      catches.forEach(c => {
        const hour = c.createdAt.getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });

      const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyData[hour] || 0,
      }));

      // Find best time
      const bestHour = timeDistribution.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      );

      return {
        distribution: timeDistribution,
        bestTime: {
          hour: bestHour.hour,
          count: bestHour.count,
          label: `${bestHour.hour}:00-${bestHour.hour + 1}:00`,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch time analysis' };
    }
  });

  // Get location-based statistics
  fastify.get('/statistics/locations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          latitude: true,
          longitude: true,
          species: true,
        },
      });

      // Group by approximate location (rounded to 2 decimals for privacy/grouping)
      const locationGroups: { [key: string]: any } = {};
      catches.forEach(c => {
        if (c.latitude && c.longitude) {
          const key = `${c.latitude.toFixed(2)},${c.longitude.toFixed(2)}`;
          if (!locationGroups[key]) {
            locationGroups[key] = {
              lat: c.latitude,
              lng: c.longitude,
              count: 0,
              species: new Set(),
            };
          }
          locationGroups[key].count++;
          if (c.species) locationGroups[key].species.add(c.species);
        }
      });

      const locations = Object.values(locationGroups)
        .map((loc: any) => ({
          latitude: loc.lat,
          longitude: loc.lng,
          catchCount: loc.count,
          speciesCount: loc.species.size,
          species: Array.from(loc.species),
        }))
        .sort((a, b) => b.catchCount - a.catchCount);

      return {
        totalLocations: locations.length,
        topLocations: locations.slice(0, 10),
        allLocations: locations,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch location statistics' };
    }
  });

  // Get species-specific statistics
  fastify.get('/statistics/species/:species', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { species } = request.params as { species: string };

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          species: species,
          isDraft: false,
        },
        select: {
          id: true,
          lengthCm: true,
          weightKg: true,
          createdAt: true,
          bait: true,
          technique: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCatches = catches.length;

      // Calculate averages
      const catchesWithLength = catches.filter(c => c.lengthCm);
      const catchesWithWeight = catches.filter(c => c.weightKg);

      const averageLength = catchesWithLength.length > 0
        ? catchesWithLength.reduce((sum, c) => sum + (c.lengthCm || 0), 0) / catchesWithLength.length
        : 0;

      const averageWeight = catchesWithWeight.length > 0
        ? catchesWithWeight.reduce((sum, c) => sum + (c.weightKg || 0), 0) / catchesWithWeight.length
        : 0;

      // Find best
      const biggest = catches.reduce((max, c) =>
        (c.lengthCm && (!max.lengthCm || c.lengthCm > max.lengthCm)) ? c : max
      , {} as any);

      const heaviest = catches.reduce((max, c) =>
        (c.weightKg && (!max.weightKg || c.weightKg > max.weightKg)) ? c : max
      , {} as any);

      // Most successful bait/technique
      const baitCount: { [key: string]: number } = {};
      const techniqueCount: { [key: string]: number } = {};

      catches.forEach(c => {
        if (c.bait) baitCount[c.bait] = (baitCount[c.bait] || 0) + 1;
        if (c.technique) techniqueCount[c.technique] = (techniqueCount[c.technique] || 0) + 1;
      });

      const bestBait = Object.entries(baitCount).sort((a, b) => b[1] - a[1])[0];
      const bestTechnique = Object.entries(techniqueCount).sort((a, b) => b[1] - a[1])[0];

      return {
        species,
        totalCatches,
        averages: {
          length: Math.round(averageLength * 10) / 10,
          weight: Math.round(averageWeight * 1000) / 1000,
        },
        records: {
          biggest: biggest.lengthCm ? {
            lengthCm: biggest.lengthCm,
            weightKg: biggest.weightKg,
            date: biggest.createdAt,
          } : null,
          heaviest: heaviest.weightKg ? {
            lengthCm: heaviest.lengthCm,
            weightKg: heaviest.weightKg,
            date: heaviest.createdAt,
          } : null,
        },
        mostSuccessful: {
          bait: bestBait ? { name: bestBait[0], count: bestBait[1] } : null,
          technique: bestTechnique ? { name: bestTechnique[0], count: bestTechnique[1] } : null,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch species statistics' };
    }
  });
}
