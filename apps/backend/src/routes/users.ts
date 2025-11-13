import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function userRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get('/users/me', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          groqApiKey: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch user profile' });
    }
  });

  // Update current user profile
  fastify.patch('/users/me', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { name, avatar, groqApiKey } = request.body as {
        name?: string;
        avatar?: string;
        groqApiKey?: string;
      };

      fastify.log.info({
        userId: request.user.userId,
        name,
        avatar: avatar ? 'present' : 'not present',
        groqApiKey: groqApiKey ? 'present' : 'not present',
      }, 'Update profile request');

      // Build update data object
      const updateData: { name?: string; avatar?: string | null; groqApiKey?: string | null } = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (avatar !== undefined) {
        // Allow setting avatar to null or empty string to remove it
        updateData.avatar = avatar || null;
      }

      if (groqApiKey !== undefined) {
        // Allow setting groqApiKey to null or empty string to remove it
        updateData.groqApiKey = groqApiKey || null;
      }

      const user = await prisma.user.update({
        where: { id: request.user.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          groqApiKey: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      fastify.log.info({ userId: user.id }, 'Profile updated successfully');

      return user;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to update profile');
      return reply.code(500).send({ error: 'Failed to update user profile' });
    }
  });
}
