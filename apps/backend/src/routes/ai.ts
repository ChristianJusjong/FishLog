import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Helper function to get season name in Danish
function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'forår';
  if (month >= 6 && month <= 8) return 'sommer';
  if (month >= 9 && month <= 11) return 'efterår';
  return 'vinter';
}

// Helper function to get time of day in Danish
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return 'tidlig morgen';
  if (hour >= 10 && hour < 12) return 'formiddag';
  if (hour >= 12 && hour < 17) return 'eftermiddag';
  if (hour >= 17 && hour < 21) return 'aften';
  return 'nat';
}

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

        fastify.log.info(`Generating AI recommendations for ${payload.species}`);

        // Get user's Groq API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
          select: { groqApiKey: true },
        });

        const userApiKey = user?.groqApiKey || undefined;

        // Parse timestamp to get season and time of day
        const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const season = getSeason(timestamp);
        const timeOfDay = getTimeOfDay(timestamp);

        // Build comprehensive context for AI with all environmental data
        let context = `Du er en dansk fiskeriekspert. Baseret på følgende information, giv detaljerede anbefalinger om fiskeri:\n\n`;

        // Location and species
        context += `Målart: ${payload.species}\n`;
        context += `Placering: ${payload.latitude}, ${payload.longitude}\n`;
        context += `Tidspunkt: ${timeOfDay}\n`;
        context += `Sæson: ${season}\n\n`;

        // Environmental conditions
        context += `Vejrforhold:\n`;
        if (payload.air_temp !== undefined) context += `- Lufttemperatur: ${payload.air_temp}°C\n`;
        if (payload.wind_speed !== undefined) context += `- Vindhastighed: ${payload.wind_speed} m/s\n`;
        if (payload.cloud_cover !== undefined) context += `- Skydække: ${payload.cloud_cover}%\n`;
        if (payload.precipitation !== undefined) context += `- Nedbør: ${payload.precipitation}mm\n`;
        if (payload.pressure !== undefined) context += `- Lufttryk: ${payload.pressure} hPa\n`;

        context += `\nVandforhold:\n`;
        if (payload.water_temp !== undefined) context += `- Vandtemperatur: ${payload.water_temp}°C\n`;
        if (payload.depth !== undefined) context += `- Dybde: ${payload.depth}m\n`;
        if (payload.bottom_type) context += `- Bundtype: ${payload.bottom_type}\n`;

        context += `\nGiv detaljerede anbefalinger om:\n`;
        context += `1. Bedste tidspunkt på dagen at fiske\n`;
        context += `2. Agn (naturligt agn med type og årsag)\n`;
        context += `3. Lokkemidler (kunstigt med type, farve, størrelse og årsag)\n`;
        context += `4. Fiskeudstyr:\n`;
        context += `   - Fiskestang (type, længde, handling)\n`;
        context += `   - Hjul (type, størrelse)\n`;
        context += `   - Line (type, diameter/styrke)\n`;
        context += `5. Fisketeknik og indspilningsmetode\n`;
        context += `6. Anbefalet dybde at fiske på\n`;
        context += `7. Vejrets påvirkning på fiskeriet\n`;
        context += `8. Sæsonmæssige noter\n\n`;
        context += `Vær konkret og specifik i dine anbefalinger.`;

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
          max_tokens: 1500,
        });

        const aiAdvice = completion.choices[0]?.message?.content || 'Ingen anbefalinger tilgængelige.';

        // Return structured response
        return {
          species: payload.species,
          location: {
            latitude: payload.latitude,
            longitude: payload.longitude,
          },
          conditions: {
            season,
            timeOfDay,
            waterTemp: payload.water_temp,
            airTemp: payload.air_temp,
            windSpeed: payload.wind_speed,
            depth: payload.depth,
            bottomType: payload.bottom_type,
          },
          advice: aiAdvice,
          timestamp: timestamp.toISOString(),
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to generate AI recommendations',
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
