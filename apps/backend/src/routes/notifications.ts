import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function notificationsRoutes(fastify: FastifyInstance) {
  // Get all notifications for current user
  // Get all notifications for current user
  fastify.get<{
    Querystring: { limit?: string, unreadOnly?: string }
  }>('/notifications', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const limit = parseInt(request.query.limit || '50');
      const unreadOnly = request.query.unreadOnly === 'true';

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      reply.code(200).send(notifications);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente notifikationer' });
    }
  });

  // Get unread notification count
  fastify.get('/notifications/unread/count', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      reply.code(200).send({ count });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente ulæste notifikationer' });
    }
  });

  // Mark notification as read
  // Mark notification as read
  fastify.patch<{ Params: { id: string } }>('/notifications/:id/read', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.code(404).send({ error: 'Notifikation ikke fundet' });
      }

      if (notification.userId !== userId) {
        return reply.code(403).send({ error: 'Ikke autoriseret' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      reply.code(200).send(updated);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere notifikation' });
    }
  });

  // Mark all notifications as read
  fastify.patch('/notifications/read-all', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      reply.code(200).send({ message: 'Alle notifikationer markeret som læst' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere notifikationer' });
    }
  });

  // Delete a notification
  // Delete a notification
  fastify.delete<{ Params: { id: string } }>('/notifications/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.code(404).send({ error: 'Notifikation ikke fundet' });
      }

      if (notification.userId !== userId) {
        return reply.code(403).send({ error: 'Ikke autoriseret' });
      }

      await prisma.notification.delete({
        where: { id }
      });

      reply.code(200).send({ message: 'Notifikation slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette notifikation' });
    }
  });

  // Delete all read notifications
  fastify.delete('/notifications/read', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true
        }
      });

      reply.code(200).send({ message: 'Læste notifikationer slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette notifikationer' });
    }
  });

  // Create a notification (for testing or admin)
  // Create a notification (for testing or admin)
  fastify.post<{
    Body: {
      userId: string,
      type: string,
      title: string,
      message: string,
      data?: string
    }
  }>('/notifications', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId, type, title, message, data } = request.body;

      if (!userId || !type || !title || !message) {
        return reply.code(400).send({ error: 'userId, type, title og message er påkrævet' });
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data
        }
      });

      reply.code(201).send(notification);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke oprette notifikation' });
    }
  });
}
