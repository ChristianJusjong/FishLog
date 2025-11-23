import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

interface SendMessageBody {
  receiverId: string;
  text: string;
  imageUrl?: string;
}

export async function messagesRoutes(fastify: FastifyInstance) {
  // Get conversations (list of people you've messaged with)
  fastify.get('/messages/conversations', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      // Get all unique conversation partners
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        distinct: ['senderId', 'receiverId'],
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      // Extract unique user IDs
      const userIds = new Set<string>();
      messages.forEach(msg => {
        if (msg.senderId !== userId) userIds.add(msg.senderId);
        if (msg.receiverId !== userId) userIds.add(msg.receiverId);
      });

      // Get user details and last message for each conversation
      const conversations = await Promise.all(
        Array.from(userIds).map(async (partnerId) => {
          const partner = await prisma.user.findUnique({
            where: { id: partnerId },
            select: {
              id: true,
              name: true,
              avatar: true
            }
          });

          const lastMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          const unreadCount = await prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: userId,
              isRead: false
            }
          });

          return {
            partner,
            lastMessage,
            unreadCount
          };
        })
      );

      // Sort by last message time
      conversations.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt.getTime() || 0;
        const timeB = b.lastMessage?.createdAt.getTime() || 0;
        return timeB - timeA;
      });

      reply.code(200).send(conversations);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente samtaler' });
    }
  });

  // Get messages with a specific user
  fastify.get<{ Params: { userId: string } }>('/messages/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const currentUserId = (request.user as any).userId;
      const { userId: otherUserId } = request.params;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          receiver: {
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
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      reply.code(200).send(messages);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente beskeder' });
    }
  });

  // Send a message
  fastify.post<{ Body: SendMessageBody }>('/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const senderId = (request.user as any).userId;
      const { receiverId, text, imageUrl } = request.body;

      if (!receiverId || (!text && !imageUrl)) {
        return reply.code(400).send({ error: 'Modtager og besked tekst/billede er påkrævet' });
      }

      // Verify receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!receiver) {
        return reply.code(404).send({ error: 'Modtager ikke fundet' });
      }

      // Verify they are friends
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: senderId, accepterId: receiverId, status: 'accepted' },
            { requesterId: receiverId, accepterId: senderId, status: 'accepted' }
          ]
        }
      });

      if (!friendship) {
        return reply.code(403).send({ error: 'Du kan kun sende beskeder til venner' });
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          text,
          imageUrl
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'new_message',
          title: 'Ny besked',
          message: `${(message.sender as any).name} sendte dig en besked`,
          data: JSON.stringify({ messageId: message.id, senderId })
        }
      });

      reply.code(201).send(message);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke sende besked' });
    }
  });

  // Delete a message (sender only)
  fastify.delete<{ Params: { messageId: string } }>('/messages/:messageId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { messageId } = request.params;

      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        return reply.code(404).send({ error: 'Besked ikke fundet' });
      }

      if (message.senderId !== userId) {
        return reply.code(403).send({ error: 'Kun afsenderen kan slette denne besked' });
      }

      await prisma.message.delete({
        where: { id: messageId }
      });

      reply.code(200).send({ message: 'Besked slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette besked' });
    }
  });

  // Mark message as read
  fastify.patch<{ Params: { messageId: string } }>('/messages/:messageId/read', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { messageId } = request.params;

      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        return reply.code(404).send({ error: 'Besked ikke fundet' });
      }

      if (message.receiverId !== userId) {
        return reply.code(403).send({ error: 'Kun modtageren kan markere som læst' });
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true }
      });

      reply.code(200).send(updatedMessage);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere besked' });
    }
  });

  // Get unread message count
  fastify.get('/messages/unread/count', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });

      reply.code(200).send({ count });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente ulæste beskeder' });
    }
  });
}
