import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

interface CreateSpotBody {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  fishSpecies?: string;
  bottomType?: string;
  depth?: number;
  parkingLatitude?: number;
  parkingLongitude?: number;
  privacy?: string; // 'public', 'groups', 'friends', 'private'
  notes?: string;
  rating?: number;
}

interface UpdateSpotBody {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  fishSpecies?: string;
  bottomType?: string;
  depth?: number;
  parkingLatitude?: number;
  parkingLongitude?: number;
  privacy?: string;
  notes?: string;
  rating?: number;
}

export async function favoriteSpotRoutes(fastify: FastifyInstance) {
  // Get all favorite spots for the logged-in user
  fastify.get('/favorite-spots', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      const spots = await prisma.favoriteSpot.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      // Get catch count for each spot
      const spotsWithCounts = await Promise.all(spots.map(async (spot) => {
        const catchCount = await prisma.catch.count({
          where: {
            userId,
            latitude: {
              gte: spot.latitude - 0.01,
              lte: spot.latitude + 0.01
            },
            longitude: {
              gte: spot.longitude - 0.01,
              lte: spot.longitude + 0.01
            },
            isDraft: false
          }
        });

        return {
          ...spot,
          catchCount
        };
      }));

      reply.code(200).send(spotsWithCounts);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente favoritsteder' });
    }
  });

  // Get a single favorite spot
  fastify.get('/favorite-spots/:id', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const spot = await prisma.favoriteSpot.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!spot) {
        return reply.code(404).send({ error: 'Fiskested ikke fundet' });
      }

      // Get catches near this spot
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          latitude: {
            gte: spot.latitude - 0.01,
            lte: spot.latitude + 0.01
          },
          longitude: {
            gte: spot.longitude - 0.01,
            lte: spot.longitude + 0.01
          },
          isDraft: false
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
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      reply.code(200).send({
        ...spot,
        catches
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente fiskested' });
    }
  });

  // Create a new favorite spot
  fastify.post('/favorite-spots', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest<{ Body: CreateSpotBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const {
        name,
        description,
        latitude,
        longitude,
        fishSpecies,
        bottomType,
        depth,
        parkingLatitude,
        parkingLongitude,
        privacy,
        notes,
        rating
      } = request.body;

      if (!name || latitude === undefined || longitude === undefined) {
        return reply.code(400).send({ error: 'Navn, latitude og longitude er påkrævet' });
      }

      const spot = await prisma.favoriteSpot.create({
        data: {
          userId,
          name,
          description,
          latitude,
          longitude,
          fishSpecies,
          bottomType,
          depth,
          parkingLatitude,
          parkingLongitude,
          privacy: privacy || 'private',
          notes,
          rating
        }
      });

      reply.code(201).send(spot);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke oprette fiskested' });
    }
  });

  // Update a favorite spot
  fastify.put('/favorite-spots/:id', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateSpotBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      // Verify ownership
      const existingSpot = await prisma.favoriteSpot.findFirst({
        where: { id, userId }
      });

      if (!existingSpot) {
        return reply.code(404).send({ error: 'Fiskested ikke fundet' });
      }

      const updatedSpot = await prisma.favoriteSpot.update({
        where: { id },
        data: request.body
      });

      reply.code(200).send(updatedSpot);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere fiskested' });
    }
  });

  // Delete a favorite spot
  fastify.delete('/favorite-spots/:id', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      // Verify ownership
      const existingSpot = await prisma.favoriteSpot.findFirst({
        where: { id, userId }
      });

      if (!existingSpot) {
        return reply.code(404).send({ error: 'Fiskested ikke fundet' });
      }

      await prisma.favoriteSpot.delete({
        where: { id }
      });

      reply.code(200).send({ message: 'Fiskested slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette fiskested' });
    }
  });

  // Get public favorite spots nearby (for discovery)
  fastify.get('/favorite-spots/nearby/:lat/:lng', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest<{ Params: { lat: string; lng: string }; Querystring: { radius?: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const lat = parseFloat(request.params.lat);
      const lng = parseFloat(request.params.lng);
      const radius = parseFloat(request.query.radius || '0.1'); // Default 0.1 degrees (~11km)

      const spots = await prisma.favoriteSpot.findMany({
        where: {
          privacy: 'public',
          userId: { not: userId }, // Exclude own spots
          latitude: {
            gte: lat - radius,
            lte: lat + radius
          },
          longitude: {
            gte: lng - radius,
            lte: lng + radius
          }
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
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      reply.code(200).send(spots);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente fiskesteder i nærheden' });
    }
  });
}
