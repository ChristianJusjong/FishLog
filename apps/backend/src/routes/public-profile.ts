/**
 * Public User Profile Routes
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getLevelFromXP, getRankForLevel } from '../utils/xp-system.js';
import {
  getSanitizedProfile,
  getUserCatches,
  getUserFiskeDex,
} from '../services/privacy-service.js';

const prisma = new PrismaClient();

export async function publicProfileRoutes(fastify: FastifyInstance) {
  // Get public user profile
  fastify.get<{ Params: { userId: string } }>(
    '/api/users/:userId/profile',
    async (request, reply) => {
      const { userId } = request.params;
      const viewerId = (request as any).userId || null;

      try {
        const profile = await getSanitizedProfile(viewerId, userId);

        if (!profile) {
          return reply.status(404).send({ error: 'User not found' });
        }

        // If private, return limited info
        if (profile.isPrivate) {
          return profile;
        }

        // Get XP and rank data
        const levelData = getLevelFromXP(profile.totalXP);
        const rank = getRankForLevel(profile.level);

        return {
          ...profile,
          xp: {
            totalXP: profile.totalXP,
            level: profile.level,
            currentLevelXP: profile.currentLevelXP,
            xpForNextLevel: levelData.xpForNextLevel,
            progress: levelData.progress,
            rank,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch profile' });
      }
    }
  );

  // Get user's catches
  fastify.get<{
    Params: { userId: string };
    Querystring: { limit?: string; offset?: string };
  }>('/api/users/:userId/catches', async (request, reply) => {
    const { userId } = request.params;
    const { limit = '20', offset = '0' } = request.query;
    const viewerId = (request as any).userId || null;

    try {
      const result = await getUserCatches(
        viewerId,
        userId,
        parseInt(limit, 10),
        parseInt(offset, 10)
      );

      if (result.isPrivate) {
        return reply.status(403).send({
          error: 'This profile is private',
          catches: [],
        });
      }

      return result.catches;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch catches' });
    }
  });

  // Get user's FiskeDex
  fastify.get<{ Params: { userId: string } }>(
    '/api/users/:userId/fiskedex',
    async (request, reply) => {
      const { userId } = request.params;
      const viewerId = (request as any).userId || null;

      try {
        const result = await getUserFiskeDex(viewerId, userId);

        if (result.isPrivate) {
          return reply.status(403).send({
            error: 'This profile is private',
            species: [],
          });
        }

        return result;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch FiskeDex' });
      }
    }
  );

  // Get user's badges
  fastify.get<{ Params: { userId: string } }>(
    '/api/users/:userId/badges',
    async (request, reply) => {
      const { userId } = request.params;
      const viewerId = (request as any).userId || null;

      try {
        // Check if viewer can see profile
        const profile = await getSanitizedProfile(viewerId, userId);

        if (!profile || profile.isPrivate) {
          return reply.status(403).send({
            error: 'This profile is private',
            badges: [],
          });
        }

        const userBadges = await prisma.userBadge.findMany({
          where: { userId },
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
        });

        return userBadges;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch badges' });
      }
    }
  );
}
