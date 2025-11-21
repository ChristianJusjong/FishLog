import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function kudosRoutes(fastify: FastifyInstance) {
  // ==================== CATCH KUDOS ====================

  // POST /kudos/catches/:id - Give kudos to a catch
  fastify.post('/kudos/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: catchId } = request.params as { id: string };

      // Check if catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id: catchId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Check if already kudoed
      const existing = await prisma.catchKudos.findUnique({
        where: {
          catchId_userId: {
            catchId,
            userId,
          },
        },
      });

      if (existing) {
        return reply.code(400).send({ error: 'Already gave kudos to this catch' });
      }

      // Create kudos
      await prisma.catchKudos.create({
        data: {
          catchId,
          userId,
        },
      });

      // Get updated kudos count
      const kudosCount = await prisma.catchKudos.count({
        where: { catchId },
      });

      // TODO: Send notification to catch owner (if not self-kudos)
      if (catch_.userId !== userId) {
        // await sendNotification(catch_.userId, 'kudos', `${username} gave kudos to your catch`)
      }

      return reply.send({
        message: 'Kudos given successfully',
        kudosCount,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to give kudos' });
    }
  });

  // DELETE /kudos/catches/:id - Remove kudos from a catch
  fastify.delete('/kudos/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: catchId } = request.params as { id: string };

      // Find and delete kudos
      const kudos = await prisma.catchKudos.findUnique({
        where: {
          catchId_userId: {
            catchId,
            userId,
          },
        },
      });

      if (!kudos) {
        return reply.code(404).send({ error: 'Kudos not found' });
      }

      await prisma.catchKudos.delete({
        where: { id: kudos.id },
      });

      // Get updated kudos count
      const kudosCount = await prisma.catchKudos.count({
        where: { catchId },
      });

      return reply.send({
        message: 'Kudos removed successfully',
        kudosCount,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to remove kudos' });
    }
  });

  // GET /kudos/catches/:id - Get kudos for a catch
  fastify.get('/kudos/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: catchId } = request.params as { id: string };

      const kudos = await prisma.catchKudos.findMany({
        where: { catchId },
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

      const hasUserKudoed = kudos.some(k => k.userId === userId);

      return reply.send({
        kudos,
        kudosCount: kudos.length,
        hasUserKudoed,
        topKudoers: kudos.slice(0, 3).map(k => k.user),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get kudos' });
    }
  });

  // ==================== SESSION KUDOS ====================

  // POST /kudos/sessions/:id - Give kudos to a session
  fastify.post('/kudos/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: sessionId } = request.params as { id: string };

      // Check if session exists and is accessible
      const session = await prisma.fishingSession.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      // Check visibility permissions
      if (session.visibility === 'private' && session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to view this session' });
      }

      if (session.visibility === 'friends' && session.userId !== userId) {
        const friendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { requesterId: userId, accepterId: session.userId, status: 'accepted' },
              { requesterId: session.userId, accepterId: userId, status: 'accepted' },
            ],
          },
        });

        if (!friendship) {
          return reply.code(403).send({ error: 'Not authorized to view this session' });
        }
      }

      // Check if already kudoed
      const existing = await prisma.sessionKudos.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });

      if (existing) {
        return reply.code(400).send({ error: 'Already gave kudos to this session' });
      }

      // Create kudos
      await prisma.sessionKudos.create({
        data: {
          sessionId,
          userId,
        },
      });

      // Get updated kudos count
      const kudosCount = await prisma.sessionKudos.count({
        where: { sessionId },
      });

      // TODO: Send notification to session owner (if not self-kudos)
      if (session.userId !== userId) {
        // await sendNotification(session.userId, 'kudos', `${username} gave kudos to your session`)
      }

      return reply.send({
        message: 'Kudos given successfully',
        kudosCount,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to give kudos' });
    }
  });

  // DELETE /kudos/sessions/:id - Remove kudos from a session
  fastify.delete('/kudos/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: sessionId } = request.params as { id: string };

      // Find and delete kudos
      const kudos = await prisma.sessionKudos.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });

      if (!kudos) {
        return reply.code(404).send({ error: 'Kudos not found' });
      }

      await prisma.sessionKudos.delete({
        where: { id: kudos.id },
      });

      // Get updated kudos count
      const kudosCount = await prisma.sessionKudos.count({
        where: { sessionId },
      });

      return reply.send({
        message: 'Kudos removed successfully',
        kudosCount,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to remove kudos' });
    }
  });

  // GET /kudos/sessions/:id - Get kudos for a session
  fastify.get('/kudos/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: sessionId } = request.params as { id: string };

      const kudos = await prisma.sessionKudos.findMany({
        where: { sessionId },
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

      const hasUserKudoed = kudos.some(k => k.userId === userId);

      return reply.send({
        kudos,
        kudosCount: kudos.length,
        hasUserKudoed,
        topKudoers: kudos.slice(0, 3).map(k => k.user),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get kudos' });
    }
  });

  // ==================== SESSION COMMENTS ====================

  // POST /kudos/sessions/:id/comments - Add comment to session
  fastify.post('/kudos/sessions/:id/comments', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id: sessionId } = request.params as { id: string };
      const { content } = request.body as { content: string };

      if (!content || content.trim().length === 0) {
        return reply.code(400).send({ error: 'Comment content is required' });
      }

      // Check if session exists and is accessible
      const session = await prisma.fishingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      // Check visibility permissions
      if (session.visibility === 'private' && session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to comment on this session' });
      }

      if (session.visibility === 'friends' && session.userId !== userId) {
        const friendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { requesterId: userId, accepterId: session.userId, status: 'accepted' },
              { requesterId: session.userId, accepterId: userId, status: 'accepted' },
            ],
          },
        });

        if (!friendship) {
          return reply.code(403).send({ error: 'Not authorized to comment on this session' });
        }
      }

      // Create comment
      const comment = await prisma.sessionComment.create({
        data: {
          sessionId,
          userId,
          content: content.trim(),
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
      });

      // TODO: Send notification to session owner (if not self-comment)
      if (session.userId !== userId) {
        // await sendNotification(session.userId, 'comment', `${username} commented on your session`)
      }

      return reply.code(201).send({
        message: 'Comment added successfully',
        comment,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add comment' });
    }
  });

  // GET /kudos/sessions/:id/comments - Get comments for a session
  fastify.get('/kudos/sessions/:id/comments', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id: sessionId } = request.params as { id: string };

      const comments = await prisma.sessionComment.findMany({
        where: { sessionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return reply.send({
        comments,
        commentsCount: comments.length,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get comments' });
    }
  });

  // DELETE /kudos/sessions/:sessionId/comments/:commentId - Delete a comment
  fastify.delete('/kudos/sessions/:sessionId/comments/:commentId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { sessionId, commentId } = request.params as { sessionId: string; commentId: string };

      // Find comment
      const comment = await prisma.sessionComment.findUnique({
        where: { id: commentId },
        include: {
          session: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (comment.sessionId !== sessionId) {
        return reply.code(400).send({ error: 'Comment does not belong to this session' });
      }

      // Only comment owner or session owner can delete
      if (comment.userId !== userId && comment.session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to delete this comment' });
      }

      // Delete comment
      await prisma.sessionComment.delete({
        where: { id: commentId },
      });

      return reply.send({ message: 'Comment deleted successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete comment' });
    }
  });

  // ==================== USER KUDOS STATS ====================

  // GET /kudos/users/:userId/given - Get kudos given by user
  fastify.get('/kudos/users/:userId/given', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Get catch kudos
      const catchKudos = await prisma.catchKudos.findMany({
        where: { userId },
        include: {
          catch: {
            select: {
              id: true,
              photoUrl: true,
              species: true,
              weightKg: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      });

      // Get session kudos
      const sessionKudos = await prisma.sessionKudos.findMany({
        where: { userId },
        include: {
          session: {
            select: {
              id: true,
              title: true,
              totalCatches: true,
              totalDistance: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      });

      // Combine and sort by date
      const allKudos = [
        ...catchKudos.map(k => ({ ...k, type: 'catch' })),
        ...sessionKudos.map(k => ({ ...k, type: 'session' })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const totalCatchKudos = await prisma.catchKudos.count({ where: { userId } });
      const totalSessionKudos = await prisma.sessionKudos.count({ where: { userId } });

      return reply.send({
        kudos: allKudos,
        stats: {
          totalCatchKudos,
          totalSessionKudos,
          total: totalCatchKudos + totalSessionKudos,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCatchKudos + totalSessionKudos,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get kudos' });
    }
  });

  // GET /kudos/users/:userId/received - Get kudos received by user
  fastify.get('/kudos/users/:userId/received', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      // Get kudos on user's catches
      const catchKudos = await prisma.catchKudos.count({
        where: {
          catch: {
            userId,
          },
        },
      });

      // Get kudos on user's sessions
      const sessionKudos = await prisma.sessionKudos.count({
        where: {
          session: {
            userId,
          },
        },
      });

      return reply.send({
        catchKudos,
        sessionKudos,
        total: catchKudos + sessionKudos,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get kudos stats' });
    }
  });
}
