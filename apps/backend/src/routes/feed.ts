import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function feedRoutes(fastify: FastifyInstance) {
  // Get feed with catches from friends
  fastify.get<{
    Querystring: { page?: number; limit?: number; }
  }>('/feed', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const page = request.query.page || 1;
      const limit = Math.min(request.query.limit || 20, 50); // Max 50 items per page
      const skip = (page - 1) * limit;

      // Get all accepted friendships where user is involved
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'accepted' },
            { accepterId: userId, status: 'accepted' }
          ]
        }
      });

      // Extract friend IDs
      const friendIds = friendships.map(f =>
        f.requesterId === userId ? f.accepterId : f.requesterId
      );

      fastify.log.info(`User ${userId} has ${friendIds.length} friends`);

      // If no friends, return empty array (not an error)
      if (friendIds.length === 0) {
        return { catches: [], page, limit, hasMore: false };
      }

      // Get catches from friends with visibility 'public' or 'friends'
      const catches = await prisma.catch.findMany({
        where: {
          userId: { in: friendIds },
          visibility: { in: ['public', 'friends'] },
          isDraft: false
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1, // Fetch one extra to check if there are more
        skip
      });

      const hasMore = catches.length > limit;
      const paginatedCatches = hasMore ? catches.slice(0, limit) : catches;

      // Batch fetch location data for all catches in a single query
      const catchIds = paginatedCatches.map(c => c.id);
      let locationMap = new Map<string, { latitude: number; longitude: number }>();

      if (catchIds.length > 0) {
        try {
          // Batch fetch locations - checks both PostGIS column and regular lat/lng columns
          const locations = await prisma.$queryRaw<Array<{ id: string; latitude: number; longitude: number }>>`
            SELECT
              id,
              COALESCE(latitude, ST_Y(location::geometry)) as latitude,
              COALESCE(longitude, ST_X(location::geometry)) as longitude
            FROM catches
            WHERE id = ANY(${catchIds}::text[])
              AND (latitude IS NOT NULL OR location IS NOT NULL)
          `;

          locationMap = new Map(locations.map(l => [l.id, { latitude: l.latitude, longitude: l.longitude }]));
        } catch (locationError) {
          fastify.log.warn({ err: locationError }, 'Failed to batch fetch locations');
        }
      }

      // Get user's likes in batch
      const userLikes = await prisma.like.findMany({
        where: {
          userId,
          catchId: { in: catchIds }
        },
        select: { catchId: true }
      });
      const likedCatchIds = new Set(userLikes.map(l => l.catchId));

      // Map catches with location and like data
      const catchesWithData = paginatedCatches.map(catch_ => {
        const location = locationMap.get(catch_.id);

        return {
          ...catch_,
          latitude: location?.latitude,
          longitude: location?.longitude,
          likesCount: catch_._count.likes,
          commentsCount: catch_._count.comments,
          isLikedByMe: likedCatchIds.has(catch_.id),
          _count: undefined
        };
      });

      return {
        catches: catchesWithData,
        page,
        limit,
        hasMore
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch feed' });
    }
  });
}
