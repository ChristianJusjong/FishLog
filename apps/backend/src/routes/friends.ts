import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function friendsRoutes(fastify: FastifyInstance) {
  // Send a friend request
  fastify.post('/friends/request', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { accepterId } = request.body as { accepterId: string };
      const requesterId = request.user!.userId;

      if (!accepterId) {
        return reply.code(400).send({ error: 'accepterId is required' });
      }

      if (requesterId === accepterId) {
        return reply.code(400).send({ error: 'Cannot send friend request to yourself' });
      }

      // Check if user exists
      const accepter = await prisma.user.findUnique({
        where: { id: accepterId }
      });

      if (!accepter) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Check if friendship already exists (in either direction)
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId, accepterId },
            { requesterId: accepterId, accepterId: requesterId }
          ]
        }
      });

      if (existingFriendship) {
        return reply.code(400).send({ error: 'Friendship request already exists' });
      }

      // Create friendship request
      const friendship = await prisma.friendship.create({
        data: {
          requesterId,
          accepterId,
          status: 'pending'
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          accepter: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return reply.code(201).send(friendship);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to send friend request' });
    }
  });

  // Accept a friend request
  fastify.post('/friends/accept', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { friendshipId } = request.body as { friendshipId: string };
      const userId = request.user!.userId;

      if (!friendshipId) {
        return reply.code(400).send({ error: 'friendshipId is required' });
      }

      // Find friendship request
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId }
      });

      if (!friendship) {
        return reply.code(404).send({ error: 'Friend request not found' });
      }

      // Check if user is the accepter
      if (friendship.accepterId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to accept this request' });
      }

      // Check if already accepted or rejected
      if (friendship.status !== 'pending') {
        return reply.code(400).send({ error: `Friend request already ${friendship.status}` });
      }

      // Update friendship status
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'accepted' },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          accepter: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return reply.send(updatedFriendship);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to accept friend request' });
    }
  });

  // Reject a friend request
  fastify.post('/friends/reject', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { friendshipId } = request.body as { friendshipId: string };
      const userId = request.user!.userId;

      if (!friendshipId) {
        return reply.code(400).send({ error: 'friendshipId is required' });
      }

      // Find friendship request
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId }
      });

      if (!friendship) {
        return reply.code(404).send({ error: 'Friend request not found' });
      }

      // Check if user is the accepter
      if (friendship.accepterId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to reject this request' });
      }

      // Check if already accepted or rejected
      if (friendship.status !== 'pending') {
        return reply.code(400).send({ error: `Friend request already ${friendship.status}` });
      }

      // Update friendship status
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'rejected' },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          accepter: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return reply.send(updatedFriendship);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to reject friend request' });
    }
  });

  // Get all friends and pending requests
  fastify.get('/friends', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all friendships where user is involved
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { accepterId: userId }
          ]
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          accepter: {
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

      // Separate into categories
      const friends = friendships
        .filter(f => f.status === 'accepted')
        .map(f => {
          const friend = f.requesterId === userId ? f.accepter : f.requester;
          return {
            friendshipId: f.id,
            friend,
            since: f.updatedAt
          };
        });

      const sentRequests = friendships
        .filter(f => f.status === 'pending' && f.requesterId === userId)
        .map(f => ({
          friendshipId: f.id,
          user: f.accepter,
          sentAt: f.createdAt
        }));

      const receivedRequests = friendships
        .filter(f => f.status === 'pending' && f.accepterId === userId)
        .map(f => ({
          friendshipId: f.id,
          user: f.requester,
          receivedAt: f.createdAt
        }));

      return reply.send({
        friends,
        sentRequests,
        receivedRequests
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch friends' });
    }
  });

  // Search users by name or email

  // Get pending friend requests (alias for frontend compatibility)
  fastify.get('/friends/requests', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get pending requests where user is the accepter
      const receivedRequests = await prisma.friendship.findMany({
        where: {
          accepterId: userId,
          status: 'pending'
        },
        include: {
          requester: {
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

      return receivedRequests.map(f => ({
        friendshipId: f.id,
        user: f.requester,
        receivedAt: f.createdAt
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch friend requests' });
    }
  });
  fastify.get('/friends/search', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { query } = request.query as { query?: string };

      if (!query || query.trim().length < 2) {
        return reply.code(400).send({ error: 'Query must be at least 2 characters' });
      }

      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: request.user!.userId } }, // Exclude current user
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        },
        take: 20
      });

      return reply.send(users);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to search users' });
    }
  });
}
