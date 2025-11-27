import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


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

// Open-Meteo API with DMI data - free, no API key required
// Perfect for Danish fishing app with accurate Nordic weather data
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

// WMO Weather codes to conditions mapping
function getWeatherCondition(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 49) return 'foggy';
  if (code <= 59) return 'drizzle';
  if (code <= 69) return 'rain';
  if (code <= 79) return 'snow';
  if (code <= 99) return 'thunderstorm';
  return 'unknown';
}

export async function weatherRoutes(fastify: FastifyInstance) {
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
  fastify.post<{ Params: { catchId: string }, Body: Omit<AddWeatherDataBody, 'catchId'> }>('/weather/catch/:catchId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { catchId } = request.params;
      const weatherInfo = request.body;

      const catchRecord = await prisma.catch.findUnique({
        where: { id: catchId }
      });

      if (!catchRecord) {
        return reply.code(404).send({ error: 'Fangst ikke fundet' });
      }

      if (catchRecord.userId !== userId) {
        return reply.code(403).send({ error: 'Du kan kun tilfoeje vejrdata til dine egne fangster' });
      }

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
      reply.code(500).send({ error: 'Kunne ikke tilfoeje vejrdata' });
    }
  });

  // Fetch current weather for coordinates using Open-Meteo DMI API
  fastify.get<{ Querystring: { lat: string, lon: string } }>('/weather/current', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lon } = request.query;

      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m',
        models: 'dmi_seamless',
        timezone: 'Europe/Copenhagen'
      });

      const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${params}`);

      if (!response.ok) {
        return reply.code(500).send({ error: 'Kunne ikke hente vejrdata fra DMI' });
      }

      const data = await response.json() as {
        current: {
          temperature_2m: number;
          relative_humidity_2m: number;
          weather_code: number;
          pressure_msl: number;
          wind_speed_10m: number;
          wind_direction_10m: number;
        }
      };

      const weatherData = {
        temperature: data.current?.temperature_2m,
        windSpeed: data.current?.wind_speed_10m,
        windDirection: getWindDirection(data.current?.wind_direction_10m),
        pressure: data.current?.pressure_msl,
        humidity: data.current?.relative_humidity_2m,
        conditions: getWeatherCondition(data.current?.weather_code || 0),
        source: 'DMI via Open-Meteo'
      };

      reply.code(200).send(weatherData);
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke hente vejrdata' });
    }
  });

  // Get weather forecast for fishing (next 7 days)
  fastify.get<{ Querystring: { lat: string, lon: string } }>('/weather/forecast', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lon } = request.query;

      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum,sunrise,sunset',
        models: 'dmi_seamless',
        timezone: 'Europe/Copenhagen',
        forecast_days: '7'
      });

      const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${params}`);

      if (!response.ok) {
        return reply.code(500).send({ error: 'Kunne ikke hente vejrudsigt' });
      }

      const data = await response.json() as {
        daily: {
          time: string[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          weather_code: number[];
          wind_speed_10m_max: number[];
          wind_direction_10m_dominant: number[];
          precipitation_sum: number[];
          sunrise: string[];
          sunset: string[];
        }
      };

      const forecast = data.daily.time.map((date, i) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        conditions: getWeatherCondition(data.daily.weather_code[i]),
        windSpeed: data.daily.wind_speed_10m_max[i],
        windDirection: getWindDirection(data.daily.wind_direction_10m_dominant[i]),
        precipitation: data.daily.precipitation_sum[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        fishingScore: calculateFishingScore(
          data.daily.weather_code[i],
          data.daily.wind_speed_10m_max[i],
          data.daily.precipitation_sum[i]
        )
      }));

      reply.code(200).send({
        forecast,
        source: 'DMI via Open-Meteo'
      });
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke hente vejrudsigt' });
    }
  });

  // Get moon phase for a date
  fastify.get<{ Querystring: { date: string } }>('/weather/moon', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { date } = request.query;
      const targetDate = new Date(date);

      const moonPhase = calculateMoonPhase(targetDate);

      reply.code(200).send({ moonPhase, date: targetDate.toISOString() });
    } catch (error) {
      request.log.error(error as any);
      reply.code(500).send({ error: 'Kunne ikke beregne maanefase' });
    }
  });
}

// Helper function to convert wind degrees to direction
function getWindDirection(degrees?: number): string | undefined {
  if (degrees === undefined) return undefined;

  const directions = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Calculate fishing score (0-100) based on weather
function calculateFishingScore(weatherCode: number, windSpeed: number, precipitation: number): number {
  let score = 70;

  if (weatherCode === 0) score += 10;
  if (weatherCode >= 1 && weatherCode <= 3) score += 15;
  if (weatherCode >= 51 && weatherCode <= 55) score += 5;
  if (weatherCode >= 61 && weatherCode <= 65) score -= 10;
  if (weatherCode >= 80 && weatherCode <= 99) score -= 30;

  if (windSpeed < 5) score -= 5;
  if (windSpeed >= 5 && windSpeed <= 20) score += 10;
  if (windSpeed > 20 && windSpeed <= 35) score -= 10;
  if (windSpeed > 35) score -= 25;

  if (precipitation > 10) score -= 15;
  if (precipitation > 0 && precipitation <= 5) score += 5;

  return Math.max(0, Math.min(100, score));
}

// Simplified moon phase calculation
function calculateMoonPhase(date: Date): string {
  const knownNewMoon = new Date(2000, 0, 6);
  const diff = date.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  const lunarCycle = 29.53;
  const phase = (days % lunarCycle) / lunarCycle;

  if (phase < 0.0625) return 'nymaane';
  if (phase < 0.1875) return 'tiltagende_segl';
  if (phase < 0.3125) return 'foerste_kvarter';
  if (phase < 0.4375) return 'tiltagende_gibbous';
  if (phase < 0.5625) return 'fuldmaane';
  if (phase < 0.6875) return 'aftagende_gibbous';
  if (phase < 0.8125) return 'sidste_kvarter';
  if (phase < 0.9375) return 'aftagende_segl';
  return 'nymaane';
}
