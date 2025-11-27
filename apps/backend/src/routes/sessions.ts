import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { detectAndRecordSegmentEfforts } from '../services/segmentService';


export async function sessionsRoutes(fastify: FastifyInstance) {
  // POST /sessions/start - Start a new fishing session
  fastify.post('/sessions/start', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { sessionType, title, description, visibility = 'friends' } = request.body as {
        sessionType: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade';
        title?: string;
        description?: string;
        visibility?: 'private' | 'friends' | 'public';
      };

      // Validate sessionType
      if (!['shore', 'boat', 'kayak', 'ice', 'wade'].includes(sessionType)) {
        return reply.code(400).send({ error: 'Invalid session type' });
      }

      // Check if user has an active session
      const activeSession = await prisma.fishingSession.findFirst({
        where: {
          userId,
          endTime: null,
        },
      });

      if (activeSession) {
        return reply.code(400).send({
          error: 'Active session exists',
          message: 'Please end your current session before starting a new one',
          sessionId: activeSession.id,
        });
      }

      // Create new session
      const session = await prisma.fishingSession.create({
        data: {
          userId,
          sessionType,
          title,
          description,
          visibility,
          startTime: new Date(),
          route: JSON.stringify([]), // Initialize empty route array
        },
      });

      return reply.code(201).send({
        message: 'Session started successfully',
        session: {
          id: session.id,
          sessionType: session.sessionType,
          title: session.title,
          startTime: session.startTime,
          visibility: session.visibility,
        },
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to start session' });
    }
  });

  // PATCH /sessions/:id/strike - Increment strike count
  fastify.patch('/sessions/:id/strike', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      // Get session and verify ownership
      const session = await prisma.fishingSession.findUnique({
        where: { id },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized' });
      }

      if (session.endTime) {
        return reply.code(400).send({ error: 'Session already ended' });
      }

      // Note: strikes are tracked client-side in SessionContext
      // This endpoint just confirms the action was received
      // We could add a strikes field to the FishingSession model if needed

      return reply.send({
        message: 'Strike recorded',
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to record strike' });
    }
  });

  // PATCH /sessions/:id/track - Add GPS point to route
  fastify.patch('/sessions/:id/track', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const locationPoint = request.body as {
        lat: number;
        lng: number;
        timestamp: string;
        speed?: number;
        altitude?: number;
      };

      // Get session and verify ownership
      const session = await prisma.fishingSession.findUnique({
        where: { id },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized' });
      }

      if (session.endTime) {
        return reply.code(400).send({ error: 'Session already ended' });
      }

      // Parse existing route with error handling
      let route = [];
      try {
        route = session.route ? JSON.parse(session.route) : [];
      } catch (parseError) {
        fastify.log.warn({ err: parseError }, 'Failed to parse route JSON, using empty array');
        route = [];
      }
      route.push(locationPoint);

      // Calculate distance if there are at least 2 points
      let totalDistance = session.totalDistance || 0;
      if (route.length >= 2) {
        const prevPoint = route[route.length - 2];
        const distance = calculateDistance(
          prevPoint.lat,
          prevPoint.lng,
          locationPoint.lat,
          locationPoint.lng
        );
        totalDistance += distance;
      }

      // Update session with new route point
      await prisma.fishingSession.update({
        where: { id },
        data: {
          route: JSON.stringify(route),
          totalDistance,
        },
      });

      return reply.send({
        message: 'Location tracked',
        totalPoints: route.length,
        totalDistance: totalDistance.toFixed(2),
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to track location' });
    }
  });

  // POST /sessions/:id/end - End fishing session
  fastify.post('/sessions/:id/end', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { weatherData } = (request.body || {}) as { weatherData?: string };

      // Get session and verify ownership
      const session = await prisma.fishingSession.findUnique({
        where: { id },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized' });
      }

      if (session.endTime) {
        return reply.code(400).send({ error: 'Session already ended' });
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60); // minutes

      // Calculate speeds from route with error handling
      let route = [];
      try {
        route = session.route ? JSON.parse(session.route) : [];
      } catch (parseError) {
        fastify.log.warn({ err: parseError }, 'Failed to parse route JSON, using empty array');
        route = [];
      }
      let maxSpeed = 0;
      let totalSpeed = 0;
      let speedCount = 0;

      route.forEach((point: any) => {
        if (point.speed) {
          maxSpeed = Math.max(maxSpeed, point.speed);
          totalSpeed += point.speed;
          speedCount++;
        }
      });

      const avgSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;

      // Find catches during this session (by timestamp overlap)
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          createdAt: {
            gte: session.startTime,
            lte: endTime,
          },
          sessionId: null, // Only link unlinked catches
        },
      });

      // Link catches to session
      if (catches.length > 0) {
        await prisma.catch.updateMany({
          where: {
            id: {
              in: catches.map(c => c.id),
            },
          },
          data: {
            sessionId: id,
          },
        });
      }

      // Calculate session stats
      const totalCatches = catches.length;
      const totalWeight = catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
      const speciesCount = new Set(catches.map(c => c.species).filter(Boolean)).size;

      // Update session
      const updatedSession = await prisma.fishingSession.update({
        where: { id },
        data: {
          endTime,
          duration,
          maxSpeed: maxSpeed > 0 ? maxSpeed : null,
          avgSpeed: avgSpeed > 0 ? avgSpeed : null,
          totalCatches,
          totalWeight: totalWeight > 0 ? totalWeight : null,
          speciesCount,
          weatherData,
        },
        include: {
          catches: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              photoUrl: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      });

      // Detect and record segment efforts
      await detectAndRecordSegmentEfforts(id, userId, updatedSession.catches);

      return reply.send({
        message: 'Session ended successfully',
        session: {
          id: updatedSession.id,
          duration: updatedSession.duration,
          totalDistance: updatedSession.totalDistance,
          totalCatches: updatedSession.totalCatches,
          totalWeight: updatedSession.totalWeight,
          speciesCount: updatedSession.speciesCount,
          catches: updatedSession.catches,
        },
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to end session' });
    }
  });

  // GET /sessions/:id - Get session details
  fastify.get('/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const session = await prisma.fishingSession.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          catches: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              photoUrl: true,
              latitude: true,
              longitude: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          kudos: {
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
          comments: {
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
          },
          _count: {
            select: {
              kudos: true,
              comments: true,
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
        // Check if users are friends
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

      // Check if current user has kudoed
      const hasUserKudoed = session.kudos.some(k => k.userId === userId);

      // Parse route if exists with error handling
      let route = [];
      try {
        route = session.route ? JSON.parse(session.route) : [];
      } catch (parseError) {
        fastify.log.warn({ err: parseError }, 'Failed to parse route JSON, using empty array');
        route = [];
      }

      return reply.send({
        ...session,
        route,
        hasUserKudoed,
        kudosCount: session._count.kudos,
        commentsCount: session._count.comments,
        topKudoers: session.kudos.slice(0, 3).map(k => k.user),
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to get session' });
    }
  });

  // GET /sessions/user/:userId - Get user's sessions
  fastify.get('/sessions/user/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const currentUserId = request.user!.userId;
      const { userId } = request.params as { userId: string };
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Check visibility permissions
      let visibilityFilter: any = { visibility: 'public' };

      if (userId === currentUserId) {
        // User viewing their own sessions - show all
        visibilityFilter = {};
      } else {
        // Check if users are friends
        const friendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { requesterId: currentUserId, accepterId: userId, status: 'accepted' },
              { requesterId: userId, accepterId: currentUserId, status: 'accepted' },
            ],
          },
        });

        if (friendship) {
          // Friends can see friends-only and public sessions
          visibilityFilter = {
            visibility: { in: ['public', 'friends'] },
          };
        }
      }

      const sessions = await prisma.fishingSession.findMany({
        where: {
          userId,
          ...visibilityFilter,
          endTime: { not: null }, // Only show completed sessions
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              kudos: true,
              comments: true,
              catches: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limitNum,
      });

      const total = await prisma.fishingSession.count({
        where: {
          userId,
          ...visibilityFilter,
          endTime: { not: null },
        },
      });

      return reply.send({
        sessions: sessions.map(s => ({
          ...s,
          route: null, // Don't send full route in list view for performance
          kudosCount: s._count.kudos,
          commentsCount: s._count.comments,
          catchesCount: s._count.catches,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to get sessions' });
    }
  });

  // GET /sessions/feed - Get sessions feed from friends
  fastify.get('/sessions/feed', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Get user's friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'accepted' },
            { accepterId: userId, status: 'accepted' },
          ],
        },
      });

      const friendIds = friendships.map(f =>
        f.requesterId === userId ? f.accepterId : f.requesterId
      );

      // Get sessions from friends and user's own public sessions
      const sessions = await prisma.fishingSession.findMany({
        where: {
          OR: [
            {
              userId: { in: friendIds },
              visibility: { in: ['public', 'friends'] },
            },
            {
              userId,
            },
          ],
          endTime: { not: null }, // Only completed sessions
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              kudos: true,
              comments: true,
              catches: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limitNum,
      });

      const total = await prisma.fishingSession.count({
        where: {
          OR: [
            {
              userId: { in: friendIds },
              visibility: { in: ['public', 'friends'] },
            },
            {
              userId,
            },
          ],
          endTime: { not: null },
        },
      });

      return reply.send({
        sessions: sessions.map(s => ({
          ...s,
          route: null, // Don't send full route in feed for performance
          kudosCount: s._count.kudos,
          commentsCount: s._count.comments,
          catchesCount: s._count.catches,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to get feed' });
    }
  });

  // GET /sessions/active - Get user's active session
  fastify.get('/sessions/active', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const activeSession = await prisma.fishingSession.findFirst({
        where: {
          userId,
          endTime: null,
        },
        include: {
          _count: {
            select: {
              catches: true,
            },
          },
        },
      });

      if (!activeSession) {
        return reply.code(404).send({ error: 'No active session' });
      }

      // Parse route with error handling
      let route = [];
      try {
        route = activeSession.route ? JSON.parse(activeSession.route) : [];
      } catch (parseError) {
        fastify.log.warn({ err: parseError }, 'Failed to parse route JSON, using empty array');
        route = [];
      }

      return reply.send({
        ...activeSession,
        route,
        catchesCount: activeSession._count.catches,
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to get active session' });
    }
  });

  // PATCH /sessions/:id - Update session details
  fastify.patch('/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const updates = request.body as {
        title?: string;
        description?: string;
        visibility?: 'private' | 'friends' | 'public';
      };

      // Get session and verify ownership
      const session = await prisma.fishingSession.findUnique({
        where: { id },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized' });
      }

      // Update session
      const updatedSession = await prisma.fishingSession.update({
        where: { id },
        data: updates,
      });

      return reply.send({
        message: 'Session updated successfully',
        session: updatedSession,
      });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to update session' });
    }
  });

  // DELETE /sessions/:id - Delete session (keeps catches)
  fastify.delete('/sessions/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      // Get session and verify ownership
      const session = await prisma.fishingSession.findUnique({
        where: { id },
      });

      if (!session) {
        return reply.code(404).send({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized' });
      }

      // Unlink catches (don't delete them)
      await prisma.catch.updateMany({
        where: { sessionId: id },
        data: { sessionId: null },
      });

      // Delete session
      await prisma.fishingSession.delete({
        where: { id },
      });

      return reply.send({ message: 'Session deleted successfully' });
    } catch (error) {
      fastify.log.error(error as any);
      return reply.code(500).send({ error: 'Failed to delete session' });
    }
  });
}

// Utility function to calculate distance between two GPS points (Haversine formula)
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
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
