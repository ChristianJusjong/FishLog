import { FastifyInstance } from 'fastify';
import { badgeService } from '../services/badgeService.js';
import { authenticate } from '../middleware/auth.js';

export async function badgeRoutes(fastify: FastifyInstance) {
  // Get all available badges
  fastify.get(
    '/badges',
    {
      preHandler: authenticate,
      schema: {
        description: 'Get all available badges',
        tags: ['badges'],
        response: {
          200: {
            type: 'object',
            properties: {
              badges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    rule: { type: 'string' },
                    ruleData: { type: ['string', 'null'] },
                    tier: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const badges = await badgeService.getAllBadges();
      return { badges };
    }
  );

  // Get current user's earned badges
  fastify.get(
    '/users/me/badges',
    {
      preHandler: authenticate,
      schema: {
        description: 'Get current user earned badges with progress',
        tags: ['badges'],
        response: {
          200: {
            type: 'object',
            properties: {
              earned: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    badge: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        icon: { type: 'string' },
                        rule: { type: 'string' },
                        tier: { type: 'string' },
                      },
                    },
                    earnedAt: { type: 'string' },
                    progress: { type: ['number', 'null'] },
                    locked: { type: 'boolean' },
                  },
                },
              },
              locked: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    badge: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        icon: { type: 'string' },
                        rule: { type: 'string' },
                        tier: { type: 'string' },
                      },
                    },
                    progress: { type: 'number' },
                    locked: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id || request.user?.userId || '';
      const badges = await badgeService.getUserBadges(userId);
      return badges;
    }
  );

  // Get specific badge details
  fastify.get(
    '/badges/:id',
    {
      preHandler: authenticate,
      schema: {
        description: 'Get specific badge details',
        tags: ['badges'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              badge: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  icon: { type: 'string' },
                  rule: { type: 'string' },
                  ruleData: { type: ['string', 'null'] },
                  tier: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const badge = await badgeService.getBadgeById(id);

      if (!badge) {
        return reply.code(404).send({ error: 'Badge not found' });
      }

      return { badge };
    }
  );

  // Seed badges (admin/setup endpoint)
  fastify.post(
    '/badges/seed',
    {
      preHandler: authenticate,
      schema: {
        description: 'Seed initial badges (admin only)',
        tags: ['badges'],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      await badgeService.seedBadges();
      return { message: 'Badges seeded successfully' };
    }
  );

  // Manual badge award (for contest winners, etc.)
  fastify.post(
    '/users/:userId/badges/:badgeRule',
    {
      preHandler: authenticate,
      schema: {
        description: 'Manually award a badge to a user',
        tags: ['badges'],
        params: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            badgeRule: { type: 'string' },
          },
          required: ['userId', 'badgeRule'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              badge: {
                type: ['object', 'null'],
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId, badgeRule } = request.params as {
        userId: string;
        badgeRule: string;
      };

      // Only allow awarding contest_winner badge manually for now
      if (badgeRule !== 'contest_winner') {
        return reply.code(400).send({
          error: 'Only contest_winner badge can be manually awarded',
        });
      }

      const badge = await badgeService.awardContestWinnerBadge(userId);

      if (!badge) {
        return { message: 'User already has this badge', badge: null };
      }

      return { message: 'Badge awarded successfully', badge };
    }
  );
}
