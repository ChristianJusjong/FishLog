import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function personalBestsRoutes(fastify: FastifyInstance) {
  // Get all personal bests for a user
  // Get all personal bests for a user
  fastify.get<{ Querystring: { userId?: string } }>('/personal-bests', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const currentUserId = (request.user as any).userId;
      const { userId = currentUserId } = request.query;

      const personalBests = await prisma.personalBest.findMany({
        where: { userId },
        orderBy: [
          { species: 'asc' },
          { category: 'asc' }
        ]
      });

      reply.code(200).send(personalBests);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente personlige rekorder' });
    }
  });

  // Get personal best for specific species and category
  // Get personal best for specific species and category
  fastify.get<{
    Params: { species: string, category: string },
    Querystring: { userId?: string }
  }>('/personal-bests/:species/:category', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const currentUserId = (request.user as any).userId;
      const { species, category } = request.params;
      const { userId = currentUserId } = request.query;

      const personalBest = await prisma.personalBest.findUnique({
        where: {
          userId_species_category: {
            userId,
            species,
            category
          }
        }
      });

      if (!personalBest) {
        return reply.code(404).send({ error: 'Personlig rekord ikke fundet' });
      }

      reply.code(200).send(personalBest);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente personlig rekord' });
    }
  });

  // Check and update personal bests after a catch
  // Check and update personal bests after a catch
  fastify.post<{ Params: { catchId: string } }>('/personal-bests/check/:catchId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { catchId } = request.params;

      // Get the catch
      const catch_ = await prisma.catch.findUnique({
        where: { id: catchId }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Fangst ikke fundet' });
      }

      if (catch_.userId !== userId) {
        return reply.code(403).send({ error: 'Kun ejeren kan opdatere personlige rekorder' });
      }

      if (!catch_.species || catch_.isDraft) {
        return reply.code(400).send({ error: 'Fangst skal være fuldført og have en art' });
      }

      const updatedRecords = [];

      // Check length record
      if (catch_.lengthCm) {
        const existingLength = await prisma.personalBest.findUnique({
          where: {
            userId_species_category: {
              userId,
              species: catch_.species,
              category: 'length'
            }
          }
        });

        if (!existingLength || catch_.lengthCm > existingLength.value) {
          const record = await prisma.personalBest.upsert({
            where: {
              userId_species_category: {
                userId,
                species: catch_.species,
                category: 'length'
              }
            },
            create: {
              userId,
              species: catch_.species,
              category: 'length',
              value: catch_.lengthCm,
              unit: 'cm',
              date: catch_.createdAt
            },
            update: {
              value: catch_.lengthCm,
              date: catch_.createdAt
            }
          });

          updatedRecords.push({ ...record, isNew: !existingLength });

          // Create notification for new personal best
          await prisma.notification.create({
            data: {
              userId,
              type: 'personal_best',
              title: 'Ny personlig rekord! 🎉',
              message: `Du har sat ny rekord for ${catch_.species} længde: ${catch_.lengthCm} cm!`,
              data: JSON.stringify({
                catchId,
                species: catch_.species,
                category: 'length',
                value: catch_.lengthCm
              })
            }
          });
        }
      }

      // Check weight record
      if (catch_.weightKg) {
        const existingWeight = await prisma.personalBest.findUnique({
          where: {
            userId_species_category: {
              userId,
              species: catch_.species,
              category: 'weight'
            }
          }
        });

        if (!existingWeight || catch_.weightKg > existingWeight.value) {
          const record = await prisma.personalBest.upsert({
            where: {
              userId_species_category: {
                userId,
                species: catch_.species,
                category: 'weight'
              }
            },
            create: {
              userId,
              species: catch_.species,
              category: 'weight',
              value: catch_.weightKg,
              unit: 'kg',
              date: catch_.createdAt
            },
            update: {
              value: catch_.weightKg,
              date: catch_.createdAt
            }
          });

          updatedRecords.push({ ...record, isNew: !existingWeight });

          // Create notification for new personal best
          await prisma.notification.create({
            data: {
              userId,
              type: 'personal_best',
              title: 'Ny personlig rekord! 🎉',
              message: `Du har sat ny rekord for ${catch_.species} vægt: ${catch_.weightKg} kg!`,
              data: JSON.stringify({
                catchId,
                species: catch_.species,
                category: 'weight',
                value: catch_.weightKg
              })
            }
          });
        }
      }

      reply.code(200).send({
        message: updatedRecords.length > 0 ? 'Personlige rekorder opdateret' : 'Ingen nye rekorder',
        updatedRecords
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere personlige rekorder' });
    }
  });

  // Get leaderboard for a specific species and category
  // Get leaderboard for a specific species and category
  fastify.get<{
    Params: { species: string, category: string },
    Querystring: { limit?: string }
  }>('/personal-bests/leaderboard/:species/:category', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { species, category } = request.params;
      const limit = parseInt(request.query.limit || '10');

      const leaderboard = await prisma.personalBest.findMany({
        where: {
          species,
          category
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          value: 'desc'
        },
        take: limit
      });

      reply.code(200).send(leaderboard);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente leaderboard' });
    }
  });

  // Delete a personal best
  // Delete a personal best
  fastify.delete<{ Params: { id: string } }>('/personal-bests/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const personalBest = await prisma.personalBest.findUnique({
        where: { id }
      });

      if (!personalBest) {
        return reply.code(404).send({ error: 'Personlig rekord ikke fundet' });
      }

      if (personalBest.userId !== userId) {
        return reply.code(403).send({ error: 'Kun ejeren kan slette denne rekord' });
      }

      await prisma.personalBest.delete({
        where: { id }
      });

      reply.code(200).send({ message: 'Personlig rekord slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette personlig rekord' });
    }
  });
}
