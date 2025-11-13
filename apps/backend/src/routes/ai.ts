import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

function getGroqClient(userApiKey?: string): Groq {
  const apiKey = userApiKey || GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is required. Please add your Groq API key in your profile settings.');
  }
  return new Groq({ apiKey });
}

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

  // Get AI fishing advice for a specific location using Groq
  fastify.post(
    '/ai/fishing-advice',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['location', 'weather'],
          properties: {
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            weather: {
              type: 'object',
              properties: {
                temperature: { type: 'number' },
                windSpeed: { type: 'number' },
                weatherCode: { type: 'number' },
              },
            },
            nearbyCatchStats: {
              type: 'object',
              nullable: true,
              properties: {
                totalCatches: { type: 'number' },
                commonSpecies: { type: 'array', items: { type: 'string' } },
                avgWeight: { type: 'number' },
              },
            },
            season: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { location, weather, nearbyCatchStats, season } = request.body as {
          location: { latitude: number; longitude: number };
          weather: { temperature: number; windSpeed: number; weatherCode: number };
          nearbyCatchStats?: { totalCatches: number; commonSpecies: string[]; avgWeight: number } | null;
          season: string;
        };

        // Get user's Groq API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
          select: { groqApiKey: true },
        });

        const userApiKey = user?.groqApiKey || undefined;

        // Build context for AI
        let context = `Du er en dansk fiskeriekspert. Giv konkrete råd på dansk baseret på følgende information:\n\n`;
        context += `Placering: ${location.latitude}, ${location.longitude}\n`;
        context += `Vejr: ${weather.temperature}°C, vind ${weather.windSpeed} m/s\n`;
        context += `Sæson: ${season}\n`;

        if (nearbyCatchStats && nearbyCatchStats.totalCatches > 0) {
          context += `\nLokale fangstdata:\n`;
          context += `- ${nearbyCatchStats.totalCatches} tidligere fangster i området\n`;
          if (nearbyCatchStats.commonSpecies.length > 0) {
            context += `- Almindelige arter: ${nearbyCatchStats.commonSpecies.join(', ')}\n`;
          }
          context += `- Gennemsnitlig vægt: ${Math.round(nearbyCatchStats.avgWeight)}g\n`;
        }

        context += `\nGiv praktiske råd om:\n1. Bedste tid på dagen\n2. Valg af agn og teknik\n3. Hvor dybt at fiske\n4. Forventede fiskearter\n`;

        const groq = getGroqClient(userApiKey);
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: context,
            },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 800,
        });

        const advice = completion.choices[0]?.message?.content || 'Ingen råd tilgængelige.';

        return { advice };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to generate fishing advice',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Health check for Groq service
  fastify.get(
    '/ai/health',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        // Check if Groq API key is configured
        if (!GROQ_API_KEY) {
          reply.code(503);
          return {
            status: 'unhealthy',
            ai_service: 'Groq API key not configured',
          };
        }

        // Try a simple API call to verify connectivity
        const groq = getGroqClient();
        await groq.models.list();

        return {
          status: 'healthy',
          ai_service: 'Groq',
          model: 'llama-3.3-70b-versatile',
        };
      } catch (error) {
        reply.code(503);
        return {
          status: 'unhealthy',
          ai_service: 'Groq unreachable',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
