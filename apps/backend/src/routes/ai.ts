import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function aiRoutes(fastify: FastifyInstance) {
  // Get AI fishing recommendations
  fastify.post(
    '/ai/recommendations',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['species', 'latitude', 'longitude'],
          properties: {
            species: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timestamp: { type: 'string' },
            water_temp: { type: 'number' },
            wind_speed: { type: 'number' },
            depth: { type: 'number' },
            bottom_type: { type: 'string' },
            air_temp: { type: 'number' },
            cloud_cover: { type: 'number' },
            precipitation: { type: 'number' },
            pressure: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const payload = request.body as {
          species: string;
          latitude: number;
          longitude: number;
          timestamp?: string;
          water_temp?: number;
          wind_speed?: number;
          depth?: number;
          bottom_type?: string;
          air_temp?: number;
          cloud_cover?: number;
          precipitation?: number;
          pressure?: number;
        };

        fastify.log.info(`Fetching AI recommendations for ${payload.species}`);

        // Call AI service
        const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v1/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            timestamp: payload.timestamp || new Date().toISOString(),
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          fastify.log.error(`AI service error: ${errorText}`);
          reply.code(503);
          return {
            error: 'AI service unavailable',
            details: errorText,
          };
        }

        const recommendations = await aiResponse.json();
        return recommendations;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to get AI recommendations',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Health check for AI service
  fastify.get(
    '/ai/health',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const healthResponse = await fetch(`${AI_SERVICE_URL}/api/v1/health`);

        if (!healthResponse.ok) {
          reply.code(503);
          return {
            status: 'unhealthy',
            ai_service: 'unavailable',
          };
        }

        const healthData = await healthResponse.json();
        return {
          status: 'healthy',
          ai_service: healthData,
        };
      } catch (error) {
        reply.code(503);
        return {
          status: 'unhealthy',
          ai_service: 'unreachable',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
