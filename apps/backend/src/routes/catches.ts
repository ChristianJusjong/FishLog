import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { badgeService } from '../services/badgeService.js';

const prisma = new PrismaClient();

export async function catchesRoutes(fastify: FastifyInstance) {
  // Create a new catch
  fastify.post('/catches', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const {
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        latitude,
        longitude,
        photoUrl,
        visibility
      } = request.body as {
        species: string;
        lengthCm?: number;
        weightKg?: number;
        bait?: string;
        rig?: string;
        technique?: string;
        notes?: string;
        latitude?: number;
        longitude?: number;
        photoUrl?: string;
        visibility?: string;
      };

      if (!species) {
        return reply.code(400).send({ error: 'Species is required' });
      }

      const catchData: any = {
        userId: request.user!.userId,
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        photoUrl,
        visibility: visibility || 'private',
      };

      // Create catch with Prisma
      const catch_ = await prisma.catch.create({
        data: catchData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      // Update location with raw SQL if coordinates provided
      if (latitude !== undefined && longitude !== undefined) {
        await prisma.$executeRaw`
          UPDATE catches
          SET location = ST_GeogFromText(${`POINT(${longitude} ${latitude})`})
          WHERE id = ${catch_.id}
        `;
      }

      // Check and award badges
      const newBadges = await badgeService.checkAndAwardBadges(request.user!.userId, catch_);

      return reply.code(201).send({
        catch: catch_,
        badges: newBadges.length > 0 ? newBadges : undefined
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create catch' });
    }
  });

  // Get catches for current user or specific user
  fastify.get('/catches', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId } = request.query as { userId?: string };

      const targetUserId = userId === 'me' || !userId ? request.user!.userId : userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId: targetUserId
        },
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
          createdAt: 'desc'
        }
      });

      // Fetch location data for each catch with raw SQL
      const catchesWithLocation = await Promise.all(
        catches.map(async (catch_) => {
          const locationResult = await prisma.$queryRaw<Array<{latitude: number, longitude: number}>>`
            SELECT ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
            FROM catches
            WHERE id = ${catch_.id} AND location IS NOT NULL
          `;

          return {
            ...catch_,
            latitude: locationResult[0]?.latitude,
            longitude: locationResult[0]?.longitude
          };
        })
      );

      return catchesWithLocation;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch catches' });
    }
  });

  // Get single catch
  fastify.get('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Fetch location data with raw SQL
      const locationResult = await prisma.$queryRaw<Array<{latitude: number, longitude: number}>>`
        SELECT ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
        FROM catches
        WHERE id = ${id} AND location IS NOT NULL
      `;

      return {
        ...catch_,
        latitude: locationResult[0]?.latitude,
        longitude: locationResult[0]?.longitude
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch catch' });
    }
  });

  // Update catch
  fastify.put('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        latitude,
        longitude,
        photoUrl,
        visibility
      } = request.body as {
        species?: string;
        lengthCm?: number;
        weightKg?: number;
        bait?: string;
        rig?: string;
        technique?: string;
        notes?: string;
        latitude?: number;
        longitude?: number;
        photoUrl?: string;
        visibility?: string;
      };

      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      if (catch_.userId !== request.user!.userId) {
        return reply.code(403).send({ error: 'Not authorized to update this catch' });
      }

      const updateData: any = {
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        photoUrl,
        visibility,
      };

      // Update catch
      const updatedCatch = await prisma.catch.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      // Update location if coordinates provided
      if (latitude !== undefined && longitude !== undefined) {
        await prisma.$executeRaw`
          UPDATE catches
          SET location = ST_GeogFromText(${`POINT(${longitude} ${latitude})`})
          WHERE id = ${id}
        `;
      } else if (latitude === null || longitude === null) {
        // Clear location if explicitly set to null
        await prisma.$executeRaw`
          UPDATE catches
          SET location = NULL
          WHERE id = ${id}
        `;
      }

      return updatedCatch;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update catch' });
    }
  });

  // Delete catch
  fastify.delete('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      if (catch_.userId !== request.user!.userId) {
        return reply.code(403).send({ error: 'Not authorized to delete this catch' });
      }

      await prisma.catch.delete({
        where: { id }
      });

      return { message: 'Catch deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete catch' });
    }
  });

  // Like a catch
  fastify.post('/catches/:id/like', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.userId;

      // Check if catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      if (existingLike) {
        return reply.code(400).send({ error: 'Already liked this catch' });
      }

      // Create like
      const like = await prisma.like.create({
        data: {
          userId,
          catchId: id
        }
      });

      return reply.code(201).send(like);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to like catch' });
    }
  });

  // Unlike a catch
  fastify.delete('/catches/:id/like', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.userId;

      // Find and delete like
      const like = await prisma.like.findUnique({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      if (!like) {
        return reply.code(404).send({ error: 'Like not found' });
      }

      await prisma.like.delete({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      return { message: 'Like removed successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to unlike catch' });
    }
  });

  // Add comment to catch
  fastify.post('/catches/:id/comments', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { text } = request.body as { text: string };
      const userId = request.user!.userId;

      if (!text || text.trim().length === 0) {
        return reply.code(400).send({ error: 'Comment text is required' });
      }

      // Check if catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          userId,
          catchId: id,
          text: text.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return reply.code(201).send(comment);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add comment' });
    }
  });

  // Delete comment
  fastify.delete('/catches/:catchId/comments/:commentId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { commentId } = request.params as { commentId: string };
      const userId = request.user!.userId;

      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (comment.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to delete this comment' });
      }

      await prisma.comment.delete({
        where: { id: commentId }
      });

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete comment' });
    }
  });
}
