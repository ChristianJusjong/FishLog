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
          where: { id: request.user?.userId || '' },
          select: { groqApiKey: true },
        });

        const userApiKey = user?.groqApiKey || undefined;

        // Parse timestamp to get season and time of day
        const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const season = getSeason(timestamp);
        const timeOfDay = getTimeOfDay(timestamp);

        // Build context for AI with location, weather, and water conditions
        let context = `Du er en erfaren dansk fiskeriekspert med omfattende viden om fiskeri i Danmark.

Jeg planlægger at fiske efter ${payload.species}.

Baseret på LOKATION, VEJR, VANDFORHOLD og din VIDEN OM FARVANDET i dette område, skal du give mig professionelle anbefalinger.

LOKATION:
Placering: ${payload.latitude} nord, ${payload.longitude} øst
Tidspunkt: ${timeOfDay}
Sæson: ${season}
`;

        // Add weather conditions if available
        if (payload.air_temp !== undefined || payload.wind_speed !== undefined ||
            payload.cloud_cover !== undefined || payload.precipitation !== undefined ||
            payload.pressure !== undefined) {
          context += `\nVEJRFORHOLD:\n`;
          if (payload.air_temp !== undefined) context += `- Lufttemperatur: ${payload.air_temp}°C\n`;
          if (payload.wind_speed !== undefined) context += `- Vindhastighed: ${payload.wind_speed} m/s\n`;
          if (payload.cloud_cover !== undefined) context += `- Skydække: ${payload.cloud_cover}%\n`;
          if (payload.precipitation !== undefined) context += `- Nedbør: ${payload.precipitation}mm\n`;
          if (payload.pressure !== undefined) context += `- Lufttryk: ${payload.pressure} hPa\n`;
        }

        // Add water conditions if available
        if (payload.water_temp !== undefined || payload.depth !== undefined || payload.bottom_type) {
          context += `\nVANDFORHOLD:\n`;
          if (payload.water_temp !== undefined) context += `- Vandtemperatur: ${payload.water_temp}°C\n`;
          if (payload.depth !== undefined) context += `- Dybde: ${payload.depth}m\n`;
          if (payload.bottom_type) context += `- Bundtype: ${payload.bottom_type}\n`;
        }

        context += `\nVIGTIGT: Brug data fra fishbase.se og din viden om danske farvande til at give nøjagtige anbefalinger. Kombinér lokationen, vejrforholdene, vandforholdene og din viden om farvandet i dette område til at give de bedst mulige råd.

Giv konkrete og anvendelige anbefalinger om:
1. Er dette område egnet til ${payload.species}? (brug fishbase.se og din viden om danske farvande)
2. Hvilke andre fiskearter findes typisk på denne lokation?
3. ${payload.species} - biologisk adfærd, foretrukne levesteder, og aktivitetsmønstre (brug fishbase.se data)
4. Bedste tidspunkt på ${timeOfDay} at fiske (baseret på artens naturlige adfærd)
5. Agn - både naturligt agn og kunstige lokkemidler der virker godt for denne art og lokation
6. Fiskeudstyr - stang, hjul, line (konkrete specifikationer for denne art)
7. Fisketeknik og indspilningsmetode der passer til lokationen og arten
8. Hvor i området man skal fiske (dybde, strukturer, hotspots baseret på artens levested)
9. Sæsonmæssige noter for ${season} - hvordan påvirker det fiskeriet?
10. Ekstra tips og tricks baseret på denne specifikke lokation og fiskeart

Vær meget konkret og specifik. Basér dine anbefalinger på biologisk korrekt information fra fishbase.se og din ekspertviden om danske fiskevande. Giv praktiske råd til netop denne lokation.`;

        const groq = getGroqClient(userApiKey);
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: context,
            },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.8,
          max_tokens: 2500,
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
          where: { id: request.user?.userId || '' },
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

        let completion;
        try {
          completion = await groq.chat.completions.create({
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
        } catch (groqError: any) {
          fastify.log.error(groqError, 'Groq API error');

          // Check if it's a Groq service error (500, 502, 503, 504)
          if (groqError.status >= 500 && groqError.status < 600) {
            // Provide fallback advice when Groq is down
            const fallbackAdvice = `🎣 AI-tjenesten er midlertidigt utilgængelig, men her er nogle generelle fiskeråd:\n\n` +
              `📍 **Baseret på din placering og vejrforhold:**\n\n` +
              `🌡️ Temperatur: ${weather.temperature}°C\n` +
              `💨 Vind: ${weather.windSpeed} m/s\n\n` +
              `**Generelle råd:**\n` +
              `• Fisk ofte bedst i skumringen - tidlig morgen eller sen eftermiddag\n` +
              `• Ved temperatur under 10°C: Fisk dybere og brug langsommere teknikker\n` +
              `• Ved temperatur 10-20°C: Prøv midtvands med varierede agn\n` +
              `• Ved temperatur over 20°C: Fisk i skyggefulde områder\n` +
              `• Ved vindstyrke under 5 m/s: Godt til fluefiskeri\n` +
              `• Ved vindstyrke 5-10 m/s: Brug tungere agn og fisk læsiden\n` +
              `• Ved vindstyrke over 10 m/s: Overvej at finde mere beskyttede steder\n\n` +
              (nearbyCatchStats && nearbyCatchStats.totalCatches > 0
                ? `📊 **Lokale data viser:**\n` +
                  `• ${nearbyCatchStats.totalCatches} tidligere fangster i området\n` +
                  (nearbyCatchStats.commonSpecies.length > 0
                    ? `• Almindelige arter: ${nearbyCatchStats.commonSpecies.join(', ')}\n`
                    : '') +
                  `• Gennemsnitlig vægt: ${Math.round(nearbyCatchStats.avgWeight)}g\n\n`
                : '') +
              `💡 Tip: Prøv AI-guiden igen om lidt for mere personlige råd!`;

            return { advice: fallbackAdvice, isFallback: true };
          }

          // Check for rate limit errors
          if (groqError.status === 429) {
            return {
              advice: '⏳ Der er for mange forespørgsler lige nu. Prøv venligst igen om et øjeblik.',
              isFallback: true
            };
          }

          // Check for authentication errors
          if (groqError.status === 401 || groqError.status === 403) {
            return {
              advice: '🔑 AI API-nøglen er ugyldig eller mangler. Kontakt support for hjælp.',
              isFallback: true
            };
          }

          // Re-throw for other errors to be caught by outer catch
          throw groqError;
        }

        const advice = completion.choices[0]?.message?.content || 'Ingen råd tilgængelige.';

        return { advice, isFallback: false };
      } catch (error) {
        fastify.log.error(error, 'Unexpected error in fishing advice endpoint');
        reply.code(500);
        return {
          advice: '❌ Der opstod en uventet fejl. Prøv venligst igen senere.\n\n' +
                  '💡 I mellemtiden kan du:\n' +
                  '• Tjekke tidligere fangster i området\n' +
                  '• Se på vejrudsigten for de kommende dage\n' +
                  '• Dele dine fangster med venner',
          error: 'Failed to generate fishing advice',
          message: error instanceof Error ? error.message : 'Unknown error',
          isFallback: true
        };
      }
    }
  );

  // Identify fish species from image using AI vision
  fastify.post(
    '/ai/identify-species',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['imageUrl'],
          properties: {
            imageUrl: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { imageUrl } = request.body as { imageUrl: string };

        fastify.log.info('Identifying fish species from image');

        // Get user's Groq API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user?.userId || '' },
          select: { groqApiKey: true },
        });

        const userApiKey = user?.groqApiKey || undefined;

        const groq = getGroqClient(userApiKey);

        // Build vision prompt for species identification
        const visionPrompt = `Analyser dette billede af en fisk og identificer arten.

VIGTIGE INSTRUKTIONER:
1. Identificer fiskens art baseret på:
   - Kropsform og proportioner
   - Finneplacement og størrelse
   - Farvemønster og markeringer
   - Skæltype
   - Hovedets form
   - Mundens placering

2. Almindelige danske fiskearter:
   Gedde, Aborre, Sandart, Ørred, Karpe, Brasen, Helt, Havørred, Torsk, Makrel, Flynder, Skrubbe

3. Svar KUN med det danske artsnavn (f.eks. "Gedde")
4. Hvis usikker, tilføj "?" efter navnet
5. Hvis ikke en fisk eller dårlig kvalitet, svar: "Kunne ikke identificere"

Artsnavn:`;

        // Use Groq's model
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: visionPrompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          temperature: 0.2,
          max_tokens: 30,
        });

        const identifiedSpecies = completion.choices[0]?.message?.content?.trim() || 'Kunne ikke identificere';

        // Clean up the response - remove quotes, extra whitespace
        const cleanedSpecies = identifiedSpecies
          .replace(/["""]/g, '')
          .replace(/^(Artsnavn:|Art:)\s*/i, '')
          .trim();

        return {
          species: cleanedSpecies,
          confidence: cleanedSpecies.includes('?') ? 'low' : 'high',
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to identify species',
          message: error instanceof Error ? error.message : 'Unknown error',
          species: null,
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
