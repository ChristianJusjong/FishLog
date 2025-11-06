import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function clubsRoutes(fastify: FastifyInstance) {
  // Create a new club
  fastify.post('/clubs', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { name, description, visibility } = request.body as {
        name: string;
        description?: string;
        visibility?: 'private' | 'public';
      };

      if (!name) {
        return reply.code(400).send({ error: 'Club name is required' });
      }

      const club = await prisma.club.create({
        data: {
          name,
          description,
          ownerId: request.user!.userId,
          visibility: visibility || 'private',
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      });

      // Automatically add owner as member
      await prisma.clubMember.create({
        data: {
          clubId: club.id,
          userId: request.user!.userId,
          role: 'owner',
        }
      });

      return reply.code(201).send(club);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create club' });
    }
  });

  // Get all clubs (user's clubs)
  fastify.get('/clubs', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const memberships = await prisma.clubMember.findMany({
        where: {
          userId: request.user!.userId
        },
        include: {
          club: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              },
              _count: {
                select: {
                  members: true,
                  messages: true
                }
              }
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        }
      });

      const clubs = memberships.map(m => ({
        ...m.club,
        userRole: m.role,
        memberCount: m.club._count.members,
        messageCount: m.club._count.messages,
      }));

      return clubs;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch clubs' });
    }
  });

  // Get club by ID
  fastify.get('/clubs/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const club = await prisma.club.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              }
            }
          }
        }
      });

      if (!club) {
        return reply.code(404).send({ error: 'Club not found' });
      }

      // Check if user is a member
      const isMember = club.members.some(m => m.userId === request.user!.userId);
      if (!isMember && club.visibility === 'private') {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const userMember = club.members.find(m => m.userId === request.user!.userId);

      return {
        ...club,
        userRole: userMember?.role || null,
        isMember,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch club' });
    }
  });

  // Join a club
  fastify.post('/clubs/:id/join', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const club = await prisma.club.findUnique({
        where: { id }
      });

      if (!club) {
        return reply.code(404).send({ error: 'Club not found' });
      }

      if (club.visibility === 'private') {
        return reply.code(403).send({ error: 'Cannot join private club' });
      }

      const existingMember = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: id,
            userId: request.user!.userId,
          }
        }
      });

      if (existingMember) {
        return reply.code(400).send({ error: 'Already a member' });
      }

      const member = await prisma.clubMember.create({
        data: {
          clubId: id,
          userId: request.user!.userId,
          role: 'member',
        }
      });

      return reply.code(201).send(member);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to join club' });
    }
  });

  // Get club messages
  fastify.get('/clubs/:id/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit = '50', before } = request.query as { limit?: string; before?: string };

      // Check if user is a member
      const member = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: id,
            userId: request.user!.userId,
          }
        }
      });

      if (!member) {
        return reply.code(403).send({ error: 'Must be a club member to view messages' });
      }

      const messages = await prisma.clubMessage.findMany({
        where: {
          clubId: id,
          ...(before && { createdAt: { lt: new Date(before) } })
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          catch: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              photoUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit)
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch messages' });
    }
  });

  // Send a message
  fastify.post('/clubs/:id/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { message, imageUrl, catchId } = request.body as {
        message?: string;
        imageUrl?: string;
        catchId?: string;
      };

      // Check if user is a member
      const member = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: id,
            userId: request.user!.userId,
          }
        }
      });

      if (!member) {
        return reply.code(403).send({ error: 'Must be a club member to send messages' });
      }

      // Validate that at least one content type is provided
      if (!message && !imageUrl && !catchId) {
        return reply.code(400).send({ error: 'Message must contain text, image, or catch' });
      }

      // Validate catchId if provided
      if (catchId) {
        const catch_ = await prisma.catch.findUnique({
          where: { id: catchId }
        });

        if (!catch_) {
          return reply.code(404).send({ error: 'Catch not found' });
        }

        if (catch_.userId !== request.user!.userId) {
          return reply.code(403).send({ error: 'Can only share your own catches' });
        }
      }

      const clubMessage = await prisma.clubMessage.create({
        data: {
          clubId: id,
          senderId: request.user!.userId,
          message,
          imageUrl,
          catchId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          catch: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              photoUrl: true,
            }
          }
        }
      });

      return reply.code(201).send(clubMessage);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to send message' });
    }
  });

  // Get new messages since timestamp (for polling)
  fastify.get('/clubs/:id/messages/poll', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { since } = request.query as { since: string };

      if (!since) {
        return reply.code(400).send({ error: 'since timestamp is required' });
      }

      // Check if user is a member
      const member = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: id,
            userId: request.user!.userId,
          }
        }
      });

      if (!member) {
        return reply.code(403).send({ error: 'Must be a club member' });
      }

      const messages = await prisma.clubMessage.findMany({
        where: {
          clubId: id,
          createdAt: {
            gt: new Date(since)
          }
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          catch: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              photoUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return messages;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to poll messages' });
    }
  });

  // Delete a message (only sender or club owner/admin)
  fastify.delete('/clubs/:clubId/messages/:messageId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { clubId, messageId } = request.params as { clubId: string; messageId: string };

      const message = await prisma.clubMessage.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }

      // Check if user is sender or club admin/owner
      const member = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId,
            userId: request.user!.userId,
          }
        }
      });

      if (!member) {
        return reply.code(403).send({ error: 'Not a club member' });
      }

      const canDelete = message.senderId === request.user!.userId ||
                       member.role === 'owner' ||
                       member.role === 'admin';

      if (!canDelete) {
        return reply.code(403).send({ error: 'Not authorized to delete this message' });
      }

      await prisma.clubMessage.delete({
        where: { id: messageId }
      });

      return { message: 'Message deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete message' });
    }
  });
}
