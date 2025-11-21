import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function speciesRoutes(fastify: FastifyInstance) {
  // Get all species
  fastify.get('/species', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const species = await prisma.species.findMany({
        select: {
          id: true,
          name: true,
          scientificName: true,
          rarity: true,
        },
        orderBy: {
          name: 'asc'
        }
      });

      return species;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch species' });
    }
  });
}
