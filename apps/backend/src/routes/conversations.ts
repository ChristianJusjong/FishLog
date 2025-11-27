import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth.js';


export async function conversationsRoutes(fastify: FastifyInstance) {
  // Create new conversation (Group DM)
  fastify.post('/conversations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { participantIds, name } = request.body as {
        participantIds: string[];
        name?: string;
      };

      if (!participantIds || participantIds.length === 0) {
        return reply.status(400).send({ error: 'participantIds is required' });
      }

      // Ensure creator is included in participants
      const allParticipants = Array.from(new Set([userId, ...participantIds]));

      if (allParticipants.length < 2) {
        return reply.status(400).send({
          error: 'Conversation must have at least 2 participants',
        });
      }

      // Create conversation with participants
      const conversation = await prisma.conversation.create({
        data: {
          name,
          createdBy: userId,
          participants: {
            create: allParticipants.map((participantId) => ({
              userId: participantId,
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      return reply.send({
        success: true,
        conversation,
      });
    } catch (error) {
      fastify.log.error(error, 'Error creating conversation');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get user's conversations
  fastify.get('/conversations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Calculate unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
          const participant = conv.participants.find((p) => p.userId === userId);
          const lastReadAt = participant?.lastReadAt || new Date(0);

          const unreadCount = await prisma.conversationMessage.count({
            where: {
              conversationId: conv.id,
              createdAt: {
                gt: lastReadAt,
              },
              senderId: {
                not: userId,
              },
            },
          });

          return {
            ...conv,
            unreadCount,
            lastMessage: conv.messages[0] || null,
          };
        })
      );

      return reply.send({
        conversations: conversationsWithUnread,
        count: conversationsWithUnread.length,
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching conversations');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get conversation details with messages
  fastify.get('/conversations/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { limit = 50, offset = 0 } = request.query as {
        limit?: number;
        offset?: number;
      };

      // Check if user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId,
        },
      });

      if (!participant) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: Number(limit),
            skip: Number(offset),
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      return reply.send({
        conversation: {
          ...conversation,
          messages: conversation.messages.reverse(), // Oldest first for chat display
        },
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching conversation');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Send message to conversation
  fastify.post('/conversations/:id/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { text, imageUrl } = request.body as {
        text: string;
        imageUrl?: string;
      };

      if (!text && !imageUrl) {
        return reply.status(400).send({ error: 'text or imageUrl is required' });
      }

      // Check if user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId,
        },
      });

      if (!participant) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      // Create message and update conversation timestamp
      const message = await prisma.conversationMessage.create({
        data: {
          conversationId: id,
          senderId: userId,
          text: text || '',
          imageUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return reply.send({
        success: true,
        message,
      });
    } catch (error) {
      fastify.log.error(error, 'Error sending message');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Mark conversation as read
  fastify.patch('/conversations/:id/read', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId,
        },
      });

      if (!participant) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error, 'Error marking conversation as read');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Add participants to conversation
  fastify.post('/conversations/:id/participants', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { participantIds } = request.body as { participantIds: string[] };

      if (!participantIds || participantIds.length === 0) {
        return reply.status(400).send({ error: 'participantIds is required' });
      }

      // Check if user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId,
        },
      });

      if (!participant) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      // Add new participants
      const newParticipants = await Promise.all(
        participantIds.map(async (participantId) => {
          const existing = await prisma.conversationParticipant.findFirst({
            where: {
              conversationId: id,
              userId: participantId,
            },
          });

          if (existing) return null;

          return prisma.conversationParticipant.create({
            data: {
              conversationId: id,
              userId: participantId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          });
        })
      );

      const addedParticipants = newParticipants.filter((p) => p !== null);

      return reply.send({
        success: true,
        addedParticipants,
      });
    } catch (error) {
      fastify.log.error(error, 'Error adding participants');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Remove participant from conversation
  fastify.delete('/conversations/:id/participants/:participantId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { id, participantId } = request.params as {
        id: string;
        participantId: string;
      };

      // Check if user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId,
        },
      });

      if (!participant) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      // Only allow removing yourself or if you're the creator
      const conversation = await prisma.conversation.findUnique({
        where: { id },
      });

      if (userId !== participantId && userId !== conversation?.createdBy) {
        return reply.status(403).send({
          error: 'You can only remove yourself or you must be the creator',
        });
      }

      const targetParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId: participantId,
        },
      });

      if (!targetParticipant) {
        return reply.status(404).send({ error: 'Participant not found' });
      }

      await prisma.conversationParticipant.delete({
        where: { id: targetParticipant.id },
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error, 'Error removing participant');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
