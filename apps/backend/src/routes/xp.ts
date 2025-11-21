/**
 * XP & Level System API Routes
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getLevelFromXP, getRankForLevel } from '../utils/xp-system.js';
import { getLeaderboard } from '../services/xp-service.js';

const prisma = new PrismaClient();

export default async function xpRoutes(fastify: FastifyInstance) {
  // Get user's XP and level data
  fastify.get('/api/xp/me', async (request, reply) => {
    const userId = (request as any).userId;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXP: true,
        level: true,
        currentLevelXP: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const levelData = getLevelFromXP(user.totalXP);
    const rank = getRankForLevel(user.level);

    return {
      totalXP: user.totalXP,
      level: user.level,
      currentLevelXP: user.currentLevelXP,
      xpForNextLevel: levelData.xpForNextLevel,
      progress: levelData.progress,
      rank,
    };
  });

  // Get another user's XP data
  fastify.get<{ Params: { userId: string } }>(
    '/api/xp/user/:userId',
    async (request, reply) => {
      const { userId } = request.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          totalXP: true,
          level: true,
          currentLevelXP: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const levelData = getLevelFromXP(user.totalXP);
      const rank = getRankForLevel(user.level);

      return {
        name: user.name,
        totalXP: user.totalXP,
        level: user.level,
        currentLevelXP: user.currentLevelXP,
        xpForNextLevel: levelData.xpForNextLevel,
        progress: levelData.progress,
        rank,
      };
    }
  );

  // Get leaderboard
  fastify.get<{
    Querystring: { type?: string; limit?: string };
  }>('/api/xp/leaderboard', async (request, reply) => {
    const { type = 'total_xp', limit = '100' } = request.query;

    const validTypes = ['total_xp', 'level', 'weekly_xp', 'monthly_xp'];
    if (!validTypes.includes(type)) {
      return reply.status(400).send({ error: 'Invalid leaderboard type' });
    }

    const leaderboard = await getLeaderboard(
      type as any,
      parseInt(limit, 10)
    );

    return {
      type,
      leaderboard,
    };
  });

  // Get XP history (recent XP gains)
  fastify.get('/api/xp/history', async (request, reply) => {
    const userId = (request as any).userId;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // For now, we don't have XP transaction history in the database
    // This would require a new table to track individual XP awards
    // Returning placeholder response
    return {
      history: [],
      message: 'XP history tracking not yet implemented',
    };
  });

  // Get rank info for a level
  fastify.get<{ Params: { level: string } }>(
    '/api/xp/rank/:level',
    async (request, reply) => {
      const { level } = request.params;
      const levelNum = parseInt(level, 10);

      if (isNaN(levelNum) || levelNum < 1) {
        return reply.status(400).send({ error: 'Invalid level' });
      }

      const rank = getRankForLevel(levelNum);

      return {
        level: levelNum,
        rank,
      };
    }
  );

  // Get user's ranking position
  fastify.get('/api/xp/my-rank', async (request, reply) => {
    const userId = (request as any).userId;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXP: true, level: true },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Calculate ranking
    const higherXPUsers = await prisma.user.count({
      where: {
        totalXP: {
          gt: user.totalXP,
        },
      },
    });

    const totalUsers = await prisma.user.count();

    return {
      rank: higherXPUsers + 1,
      totalUsers,
      percentile: ((totalUsers - higherXPUsers) / totalUsers) * 100,
    };
  });
}
