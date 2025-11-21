import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import {
  identifyUserFavoriteSpots,
  identifyHotSpots,
  getLocationLeaderboard,
  calculateCatchScore,
} from '../services/spot-detection-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function hotSpotsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/hot-spots/my-favorites
   * Get automatically detected favorite spots for the current user
   */
  fastify.get('/hot-spots/my-favorites', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { minVisits = '3', radius = '200' } = request.query as {
        minVisits?: string;
        radius?: string;
      };

      const favoriteSpots = await identifyUserFavoriteSpots(
        userId,
        parseInt(minVisits),
        parseInt(radius)
      );

      // Enrich with detailed stats
      const enrichedSpots = await Promise.all(
        favoriteSpots.map(async (spot) => {
          const radiusDegrees = parseInt(radius) / 111000;

          // Get catches at this location
          const catches = await prisma.catch.findMany({
            where: {
              userId,
              isDraft: false,
              latitude: {
                gte: spot.latitude - radiusDegrees,
                lte: spot.latitude + radiusDegrees,
              },
              longitude: {
                gte: spot.longitude - radiusDegrees,
                lte: spot.longitude + radiusDegrees,
              },
            },
            include: {
              session: {
                select: {
                  id: true,
                  title: true,
                  startTime: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          // Calculate statistics
          const biggestFish = catches.reduce((max, c) => {
            return (c.weightKg || 0) > max ? (c.weightKg || 0) : max;
          }, 0);

          const longestFish = catches.reduce((max, c) => {
            return (c.lengthCm || 0) > max ? (c.lengthCm || 0) : max;
          }, 0);

          const sessions = new Set(catches.map(c => c.sessionId).filter(Boolean));

          return {
            ...spot,
            biggestFish,
            longestFish,
            sessionCount: sessions.size,
            averageScore: spot.catchCount > 0 ? Math.round(spot.totalScore / spot.catchCount) : 0,
            recentCatches: catches.slice(0, 5),
          };
        })
      );

      return reply.send({
        favoriteSpots: enrichedSpots,
        total: enrichedSpots.length,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to identify favorite spots' });
    }
  });

  /**
   * GET /api/hot-spots/discover
   * Get automatically detected hot spots based on collective activity
   */
  fastify.get('/hot-spots/discover', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const {
        minAnglers = '5',
        minCatches = '20',
        radius = '300',
        near
      } = request.query as {
        minAnglers?: string;
        minCatches?: string;
        radius?: string;
        near?: string; // "lat,lng" format
      };

      let hotSpots = await identifyHotSpots(
        parseInt(minAnglers),
        parseInt(minCatches),
        parseInt(radius)
      );

      // If near parameter provided, sort by distance
      if (near) {
        const [nearLat, nearLng] = near.split(',').map(parseFloat);
        hotSpots = hotSpots.map(spot => ({
          ...spot,
          distance: calculateDistanceInMeters(nearLat, nearLng, spot.latitude, spot.longitude),
        })).sort((a, b) => a.distance - b.distance) as any;
      }

      // Check if current user is in top anglers for each spot
      const enrichedSpots = hotSpots.map(spot => {
        const userRank = spot.topAnglers.findIndex(a => a.userId === userId);
        const userStats = spot.topAnglers.find(a => a.userId === userId);

        return {
          ...spot,
          userRank: userRank >= 0 ? userRank + 1 : null,
          userStats: userStats || null,
        };
      });

      return reply.send({
        hotSpots: enrichedSpots,
        total: enrichedSpots.length,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to identify hot spots' });
    }
  });

  /**
   * GET /api/hot-spots/leaderboard
   * Get leaderboard for a specific location
   */
  fastify.get('/hot-spots/leaderboard', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const {
        lat,
        lng,
        radius = '300',
        category = 'biggest_fish'
      } = request.query as {
        lat: string;
        lng: string;
        radius?: string;
        category?: 'biggest_fish' | 'longest_fish' | 'highest_session_score' | 'highest_total_score';
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'lat and lng are required' });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseInt(radius);

      const leaderboard = await getLocationLeaderboard(
        latitude,
        longitude,
        radiusMeters,
        category
      );

      // Find current user's position
      const userPosition = leaderboard.findIndex(entry => entry.userId === userId);
      const userEntry = leaderboard.find(entry => entry.userId === userId);

      return reply.send({
        leaderboard,
        userPosition: userPosition >= 0 ? userPosition + 1 : null,
        userEntry: userEntry || null,
        category,
        location: { latitude, longitude, radius: radiusMeters },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get leaderboard' });
    }
  });

  /**
   * GET /api/hot-spots/:lat/:lng/details
   * Get detailed statistics for a specific hot spot
   */
  fastify.get('/hot-spots/:lat/:lng/details', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { lat, lng } = request.params as { lat: string; lng: string };
      const { radius = '300' } = request.query as { radius?: string };

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseInt(radius);
      const radiusDegrees = radiusMeters / 111000;

      // Get all catches at this location
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
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate statistics
      const totalAnglers = new Set(catches.map(c => c.userId)).size;
      const totalCatches = catches.length;

      const speciesDistribution = catches.reduce((acc, c) => {
        const species = c.species || 'Unknown';
        acc[species] = (acc[species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const biggestFish = catches.reduce((max, c) => {
        return (c.weightKg || 0) > (max?.weightKg || 0) ? c : max;
      }, catches[0]);

      const longestFish = catches.reduce((max, c) => {
        return (c.lengthCm || 0) > (max?.lengthCm || 0) ? c : max;
      }, catches[0]);

      // User's stats at this location
      const userCatches = catches.filter(c => c.userId === userId);
      const userTotalScore = userCatches.reduce((sum, c) => {
        return sum + calculateCatchScore(
          c.species || 'Unknown',
          c.weightKg || undefined,
          c.lengthCm || undefined
        );
      }, 0);

      // Get all leaderboards
      const leaderboards = await Promise.all([
        getLocationLeaderboard(latitude, longitude, radiusMeters, 'biggest_fish'),
        getLocationLeaderboard(latitude, longitude, radiusMeters, 'longest_fish'),
        getLocationLeaderboard(latitude, longitude, radiusMeters, 'highest_total_score'),
      ]);

      return reply.send({
        location: { latitude, longitude, radius: radiusMeters },
        statistics: {
          totalAnglers,
          totalCatches,
          speciesDistribution,
          biggestFish: biggestFish ? {
            weight: biggestFish.weightKg,
            species: biggestFish.species,
            angler: biggestFish.user.name,
            date: biggestFish.createdAt,
          } : null,
          longestFish: longestFish ? {
            length: longestFish.lengthCm,
            species: longestFish.species,
            angler: longestFish.user.name,
            date: longestFish.createdAt,
          } : null,
        },
        userStats: {
          totalCatches: userCatches.length,
          totalScore: userTotalScore,
          biggestFish: userCatches.reduce((max, c) => (c.weightKg || 0) > max ? (c.weightKg || 0) : max, 0),
          longestFish: userCatches.reduce((max, c) => (c.lengthCm || 0) > max ? (c.lengthCm || 0) : max, 0),
        },
        leaderboards: {
          biggestFish: leaderboards[0],
          longestFish: leaderboards[1],
          highestTotalScore: leaderboards[2],
        },
        recentActivity: catches.slice(0, 10).map(c => ({
          id: c.id,
          species: c.species,
          weight: c.weightKg,
          length: c.lengthCm,
          angler: c.user.name,
          anglerAvatar: c.user.avatar,
          date: c.createdAt,
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get hot spot details' });
    }
  });
}

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
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
