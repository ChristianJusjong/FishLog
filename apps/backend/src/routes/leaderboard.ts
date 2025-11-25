import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { getTitleForLevel } from '../services/title-service';

const prisma = new PrismaClient();

/**
 * Leaderboard Categories:
 * - total_score: Total accumulated score
 * - single_catch: Highest single catch score
 * - most_catches: Total number of catches
 * - longest_fish: Longest fish caught (cm)
 * - heaviest_fish: Heaviest fish caught (kg)
 */

export async function leaderboardRoutes(fastify: FastifyInstance) {
  // GET /leaderboard?category=total_score&limit=100
  fastify.get('/leaderboard', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { category = 'total_score', limit = 100 } = request.query as {
        category?: string;
        limit?: number;
      };

      const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

      let leaderboard: any[] = [];

      switch (category) {
        case 'total_score':
          // Total accumulated score from all catches
          leaderboard = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              level: true,
              totalXP: true,
              catches: {
                select: {
                  score: true,
                },
                where: {
                  isDraft: false,
                },
              },
            },
            orderBy: {
              totalXP: 'desc', // Using totalXP as proxy for total score
            },
            take: limitNum,
          });

          leaderboard = leaderboard.map((user, index) => {
            const totalScore = user.catches.reduce((sum: number, c: any) => sum + (c.score || 0), 0);
            const title = getTitleForLevel(user.level || 1);
            return {
              rank: index + 1,
              userId: user.id,
              name: user.name,
              level: user.level,
              title: `${title.emoji} ${title.name}`,
              value: totalScore,
              label: `${totalScore.toFixed(1)} point`,
            };
          });
          break;

        case 'single_catch':
          // Highest single catch score
          const topCatches = await prisma.catch.findMany({
            where: {
              score: {
                not: null,
                gt: 0,
              },
              isDraft: false,
            },
            select: {
              id: true,
              score: true,
              species: true,
              weightKg: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                },
              },
            },
            orderBy: {
              score: 'desc',
            },
            take: limitNum,
          });

          leaderboard = topCatches.map((catch_: any, index) => {
            const title = getTitleForLevel(catch_.user.level || 1);
            return {
              rank: index + 1,
              userId: catch_.user.id,
              name: catch_.user.name,
              level: catch_.user.level,
              title: `${title.emoji} ${title.name}`,
              value: catch_.score,
              label: `${catch_.score?.toFixed(1)} point (${catch_.species || 'Ukendt'}, ${catch_.weightKg}kg)`,
              catchId: catch_.id,
            };
          });
          break;

        case 'most_catches':
          // Total number of catches
          const usersWithCatchCount = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              level: true,
              _count: {
                select: {
                  catches: true,
                },
              },
            },
            where: {
              catches: {
                some: {
                  isDraft: false,
                },
              },
            },
            orderBy: {
              catches: {
                _count: 'desc',
              },
            },
            take: limitNum,
          });

          leaderboard = usersWithCatchCount.map((user: any, index) => {
            const title = getTitleForLevel(user.level || 1);
            return {
              rank: index + 1,
              userId: user.id,
              name: user.name,
              level: user.level,
              title: `${title.emoji} ${title.name}`,
              value: user._count.catches,
              label: `${user._count.catches} fangster`,
            };
          });
          break;

        case 'longest_fish':
          // Longest fish caught
          const longestCatches = await prisma.catch.findMany({
            where: {
              lengthCm: {
                not: null,
                gt: 0,
              },
              isDraft: false,
            },
            select: {
              id: true,
              lengthCm: true,
              species: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                },
              },
            },
            orderBy: {
              lengthCm: 'desc',
            },
            take: limitNum,
          });

          leaderboard = longestCatches.map((catch_: any, index) => {
            const title = getTitleForLevel(catch_.user.level || 1);
            return {
              rank: index + 1,
              userId: catch_.user.id,
              name: catch_.user.name,
              level: catch_.user.level,
              title: `${title.emoji} ${title.name}`,
              value: catch_.lengthCm,
              label: `${catch_.lengthCm} cm (${catch_.species || 'Ukendt'})`,
              catchId: catch_.id,
            };
          });
          break;

        case 'heaviest_fish':
          // Heaviest fish caught
          const heaviestCatches = await prisma.catch.findMany({
            where: {
              weightKg: {
                not: null,
                gt: 0,
              },
              isDraft: false,
            },
            select: {
              id: true,
              weightKg: true,
              species: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                },
              },
            },
            orderBy: {
              weightKg: 'desc',
            },
            take: limitNum,
          });

          leaderboard = heaviestCatches.map((catch_: any, index) => {
            const title = getTitleForLevel(catch_.user.level || 1);
            return {
              rank: index + 1,
              userId: catch_.user.id,
              name: catch_.user.name,
              level: catch_.user.level,
              title: `${title.emoji} ${title.name}`,
              value: catch_.weightKg,
              label: `${catch_.weightKg} kg (${catch_.species || 'Ukendt'})`,
              catchId: catch_.id,
            };
          });
          break;

        default:
          return reply.code(400).send({ error: 'Invalid category' });
      }

      return {
        category,
        leaderboard,
      };
    } catch (error) {
      request.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to fetch leaderboard', details: errorMessage });
    }
  });
}
