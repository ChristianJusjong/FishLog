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

  // Get AI fishing advice for a specific location
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

        // Build advice based on data
        let advice = `🎣 Fiskerådgivning for denne placering:\n\n`;

        // Weather analysis
        advice += `🌡️ Vejr: ${weather.temperature}°C, vind ${weather.windSpeed} m/s\n`;
        if (weather.windSpeed < 3) {
          advice += `Lav vind - godt for lystfiskeri. Prøv overfladenær fiskeri.\n`;
        } else if (weather.windSpeed < 8) {
          advice += `Moderat vind - fisken kan være aktiv. Brug tungere udstyr.\n`;
        } else {
          advice += `Kraftig vind - søg læ og fisk dybere vand.\n`;
        }

        advice += `\n`;

        // Seasonal advice
        advice += `📅 Sæson: ${season}\n`;
        const seasonalTips: Record<string, string> = {
          'forår': 'Gode gyde-perioder. Fisk ved mudder og vegetation.',
          'sommer': 'Fisk tidligt om morgenen eller sent om aftenen. Prøv skygge.',
          'efterår': 'Aktiv fiskeri periode. God tid til store fangster.',
          'vinter': 'Langsommere aktivitet. Fisk dybt og langsomt.',
        };
        advice += `${seasonalTips[season] || 'God fiskeri!'}\\n\n`;

        // Nearby catch statistics
        if (nearbyCatchStats && nearbyCatchStats.totalCatches > 0) {
          advice += `🐟 Lokale fangster:\n`;
          advice += `Tidligere fangster i området: ${nearbyCatchStats.totalCatches}\n`;
          if (nearbyCatchStats.commonSpecies.length > 0) {
            advice += `Almindelige arter: ${nearbyCatchStats.commonSpecies.join(', ')}\n`;
          }
          advice += `Gennemsnitlig vægt: ${Math.round(nearbyCatchStats.avgWeight)}g\n\n`;
        } else {
          advice += `ℹ️ Ingen tidligere fangster registreret i dette område. Prøv forskellige teknikker!\n\n`;
        }

        // General recommendations
        advice += `💡 Anbefalinger:\n`;
        advice += `• Prøv forskellige dybder\n`;
        advice += `• Brug lokal agn og madding\n`;
        advice += `• Vær tålmodig og skift spot hvis ingen bid\n`;

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
