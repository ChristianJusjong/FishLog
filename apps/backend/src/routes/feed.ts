import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function feedRoutes(fastify: FastifyInstance) {
  // Get feed with catches from friends
  fastify.get('/feed', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

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
        return [];
      }

      // Get catches from friends with visibility 'public' or 'friends'
      const catches = await prisma.catch.findMany({
        where: {
          userId: { in: friendIds },
          visibility: { in: ['public', 'friends'] }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          likes: {
            select: {
              id: true,
              userId: true
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Fetch location data for each catch with raw SQL
      const catchesWithLocation = await Promise.all(
        catches.map(async (catch_) => {
          let latitude = undefined;
          let longitude = undefined;

          // Try to fetch location data, but don't fail if PostGIS has issues
          try {
            const locationResult = await prisma.$queryRaw<Array<{latitude: number, longitude: number}>>`
              SELECT ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
              FROM catches
              WHERE id = ${catch_.id} AND location IS NOT NULL
            `;

            if (locationResult && locationResult.length > 0) {
              latitude = locationResult[0].latitude;
              longitude = locationResult[0].longitude;
            }
          } catch (locationError) {
            // Log the error but don't fail the entire request
            fastify.log.warn({ err: locationError }, `Failed to fetch location for catch ${catch_.id}`);
          }

          // Check if current user has liked this catch
          const isLikedByMe = catch_.likes.some(like => like.userId === userId);

          return {
            ...catch_,
            latitude,
            longitude,
            likesCount: catch_.likes.length,
            commentsCount: catch_.comments.length,
            isLikedByMe,
            // Remove the full likes array and just keep the simplified data
            likes: undefined
          };
        })
      );

      return catchesWithLocation;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch feed' });
    }
  });
}
