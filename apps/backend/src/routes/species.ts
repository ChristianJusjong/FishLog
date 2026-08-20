import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { cache } from '../lib/cache';

export async function speciesRoutes(fastify: FastifyInstance) {
  // Get all species with 5-minute cache
  fastify.get('/species', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const cached = cache.get<any[]>('species_all');
      if (cached) {
        return cached;
      }

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

      cache.set('species_all', species, 300); // 5 minutes
      return species;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch species' });
    }
  });
}
