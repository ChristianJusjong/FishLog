import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

interface AddWeatherDataBody {
  catchId: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  pressure?: number;
  humidity?: number;
  conditions?: string;
  moonPhase?: string;
  tideState?: string;
}

// Free weather API - you can use OpenWeatherMap or similar
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

export async function weatherRoutes(fastify: FastifyInstance) {
  // Get weather data for a catch
  // Get weather data for a catch
  fastify.get<{ Params: { catchId: string } }>('/weather/catch/:catchId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { catchId } = request.params;

      const weatherData = await prisma.weatherData.findUnique({
        where: { catchId }
      });

      if (!weatherData) {
        return reply.code(404).send({ error: 'Vejrdata ikke fundet' });
      }

      reply.code(200).send(weatherData);
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke hente vejrdata' });
    }
  });

  // Add weather data to a catch
  // Add weather data to a catch
  fastify.post<{ Params: { catchId: string }, Body: Omit<AddWeatherDataBody, 'catchId'> }>('/weather/catch/:catchId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { catchId } = request.params;
      const weatherInfo = request.body;

      // Verify catch exists and user owns it
      const catch_ = await prisma.catch.findUnique({
        where: { id: catchId }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Fangst ikke fundet' });
      }

      if (catch_.userId !== userId) {
        return reply.code(403).send({ error: 'Du kan kun tilføje vejrdata til dine egne fangster' });
      }

      // Create or update weather data
      const weatherData = await prisma.weatherData.upsert({
        where: { catchId },
        create: {
          catchId,
          ...weatherInfo
        },
        update: weatherInfo
      });

      reply.code(201).send(weatherData);
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke tilføje vejrdata' });
    }
  });

  // Fetch current weather for coordinates
  // Fetch current weather for coordinates
  fastify.get<{ Querystring: { lat: string, lon: string } }>('/weather/current', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lon } = request.query;

      if (!WEATHER_API_KEY) {
        return reply.code(503).send({ error: 'Vejr service ikke konfigureret' });
      }

      // Fetch from OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        return reply.code(500).send({ error: 'Kunne ikke hente vejrdata' });
      }

      const data = await response.json() as any;

      // Transform to our format
      const weatherData = {
        temperature: data.main?.temp,
        windSpeed: data.wind?.speed ? data.wind.speed * 3.6 : undefined, // Convert m/s to km/h
        windDirection: getWindDirection(data.wind?.deg),
        pressure: data.main?.pressure,
        humidity: data.main?.humidity,
        conditions: data.weather?.[0]?.main?.toLowerCase(),
      };

      reply.code(200).send(weatherData);
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke hente vejrdata' });
    }
  });

  // Get moon phase for a date
  // Get moon phase for a date
  fastify.get<{ Querystring: { date: string } }>('/weather/moon', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { date } = request.query;
      const targetDate = new Date(date);

      // Calculate moon phase (simplified algorithm)
      const moonPhase = calculateMoonPhase(targetDate);

      reply.code(200).send({ moonPhase, date: targetDate.toISOString() });
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke beregne månefase' });
    }
  });
}

// Helper function to convert wind degrees to direction
function getWindDirection(degrees?: number): string | undefined {
  if (degrees === undefined) return undefined;

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Simplified moon phase calculation
function calculateMoonPhase(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate days since known new moon (Jan 6, 2000)
  const knownNewMoon = new Date(2000, 0, 6);
  const diff = date.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  // Lunar cycle is ~29.53 days
  const lunarCycle = 29.53;
  const phase = (days % lunarCycle) / lunarCycle;

  if (phase < 0.0625) return 'new';
  if (phase < 0.1875) return 'waxing_crescent';
  if (phase < 0.3125) return 'first_quarter';
  if (phase < 0.4375) return 'waxing_gibbous';
  if (phase < 0.5625) return 'full';
  if (phase < 0.6875) return 'waning_gibbous';
  if (phase < 0.8125) return 'last_quarter';
  if (phase < 0.9375) return 'waning_crescent';
  return 'new';
}
