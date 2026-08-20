import { prisma } from '../lib/prisma';

export interface WeatherTelemetryInput {
  catchId: string;
  species?: string;
  weightKg?: number | null;
  lengthCm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  waterTemp?: number | null;
  caughtAt?: Date;
  technique?: string | null;
  bait?: string | null;
}

export interface WeatherTelemetryResult {
  airTemp: number | null;
  waterTemp: number | null;
  pressureHpa: number | null;
  windSpeedMps: number | null;
  windDirection: string | null;
  windDegree: number | null;
  weatherCondition: string | null;
  cloudCover: number | null;
  humidity: number | null;
  moonPhase: string;
  moonIllumination: number;
  timeOfDay: string;
  season: string;
}

/**
 * Calculates Moon Phase and Illumination % from a Date
 */
export function calculateMoonPhase(date: Date = new Date()): { phase: string; illumination: number } {
  // Known reference new moon: January 11, 2024 at 11:57 UTC
  const referenceNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;

  const diffMs = date.getTime() - referenceNewMoon;
  const cycleFraction = ((diffMs % synodicMonthMs) + synodicMonthMs) % synodicMonthMs / synodicMonthMs;
  const phaseDays = cycleFraction * 29.53058867;

  // Illumination calculation (0% at new, 100% at full)
  const illumination = Math.round(0.5 * (1 - Math.cos(2 * Math.PI * cycleFraction)) * 100);

  let phase = 'new';
  if (phaseDays < 1.845) {
    phase = 'new';
  } else if (phaseDays < 5.536) {
    phase = 'waxing_crescent';
  } else if (phaseDays < 9.228) {
    phase = 'first_quarter';
  } else if (phaseDays < 12.919) {
    phase = 'waxing_gibbous';
  } else if (phaseDays < 16.61) {
    phase = 'full';
  } else if (phaseDays < 20.302) {
    phase = 'waning_gibbous';
  } else if (phaseDays < 23.993) {
    phase = 'last_quarter';
  } else if (phaseDays < 27.684) {
    phase = 'waning_crescent';
  } else {
    phase = 'new';
  }

  return { phase, illumination };
}

/**
 * Converts degree (0-360) to 16-point compass direction
 */
export function degreesToCardinal(degree: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}

/**
 * Maps WMO Weather Code to standardized condition string
 */
export function mapWmoCode(code: number): string {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 2) return 'partly_cloudy';
  if (code === 3) return 'overcast';
  if (code >= 45 && code <= 48) return 'foggy';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain_showers';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'cloudy';
}

/**
 * Calculates Time of Day and Season
 */
export function getTimeOfDayAndSeason(date: Date = new Date()): { timeOfDay: string; season: string } {
  const hours = date.getHours();
  const month = date.getMonth(); // 0-11

  // Time of Day
  let timeOfDay = 'midday';
  if (hours >= 4 && hours < 7) timeOfDay = 'dawn';
  else if (hours >= 7 && hours < 11) timeOfDay = 'morning';
  else if (hours >= 11 && hours < 15) timeOfDay = 'midday';
  else if (hours >= 15 && hours < 18) timeOfDay = 'afternoon';
  else if (hours >= 18 && hours < 22) timeOfDay = 'dusk';
  else timeOfDay = 'night';

  // Season (Northern Hemisphere)
  let season = 'spring';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';

  return { timeOfDay, season };
}

export class WeatherTelemetryService {
  /**
   * Fetches real-time weather & marine data from Open-Meteo API
   */
  public async fetchWeatherData(lat: number, lng: number): Promise<Partial<WeatherTelemetryResult>> {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover&wind_speed_unit=ms`;

      const response = await fetch(weatherUrl);
      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      const current = data.current || {};

      const airTemp = current.temperature_2m ?? null;
      const pressureHpa = current.surface_pressure ?? null;
      const windSpeedMps = current.wind_speed_10m ?? null;
      const windDegree = current.wind_direction_10m ?? null;
      const windDirection = windDegree !== null ? degreesToCardinal(windDegree) : null;
      const weatherCondition = current.weather_code !== undefined ? mapWmoCode(current.weather_code) : null;
      const cloudCover = current.cloud_cover ?? null;
      const humidity = current.relative_humidity_2m ?? null;

      // Attempt Marine API for sea water temperature (best effort)
      let waterTemp: number | null = null;
      try {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=sea_water_temperature`;
        const marineRes = await fetch(marineUrl);
        if (marineRes.ok) {
          const marineData = await marineRes.json();
          if (marineData.current?.sea_water_temperature !== undefined) {
            waterTemp = marineData.current.sea_water_temperature;
          }
        }
      } catch {
        // Fallback: estimate water temp ~ air temp damped
        if (airTemp !== null) {
          waterTemp = Math.round((airTemp * 0.7 + 4) * 10) / 10;
        }
      }

      return {
        airTemp,
        waterTemp,
        pressureHpa,
        windSpeedMps,
        windDegree,
        windDirection,
        weatherCondition,
        cloudCover,
        humidity,
      };
    } catch (error) {
      console.error('Failed to fetch Open-Meteo weather data:', error);
      return {};
    }
  }

  /**
   * Enriches a Catch with comprehensive weather telemetry and stores in both
   * WeatherData and the dedicated AiCatchTelemetry database dataset.
   */
  public async enrichCatchTelemetry(input: WeatherTelemetryInput): Promise<void> {
    const { catchId, latitude, longitude, waterTemp: userWaterTemp, caughtAt = new Date(), species, weightKg, lengthCm, technique, bait } = input;

    if (!latitude || !longitude) {
      return;
    }

    const { phase: moonPhase, illumination: moonIllumination } = calculateMoonPhase(caughtAt);
    const { timeOfDay, season } = getTimeOfDayAndSeason(caughtAt);

    // Fetch API weather metrics
    const apiWeather = await this.fetchWeatherData(latitude, longitude);

    const airTemp = apiWeather.airTemp ?? null;
    const finalWaterTemp = userWaterTemp ?? apiWeather.waterTemp ?? (airTemp ? Math.round((airTemp * 0.7 + 4) * 10) / 10 : null);
    const pressureHpa = apiWeather.pressureHpa ?? 1013.25;
    const windSpeedMps = apiWeather.windSpeedMps ?? null;
    const windDegree = apiWeather.windDegree ?? null;
    const windDirection = apiWeather.windDirection ?? (windDegree !== null ? degreesToCardinal(windDegree) : 'V');
    const weatherCondition = apiWeather.weatherCondition ?? 'partly_cloudy';
    const cloudCover = apiWeather.cloudCover ?? 50;
    const humidity = apiWeather.humidity ?? 70;

    // 1. Upsert into standard WeatherData
    try {
      await prisma.weatherData.upsert({
        where: { catchId },
        update: {
          temperature: airTemp,
          waterTemperature: finalWaterTemp,
          pressure: pressureHpa,
          windSpeed: windSpeedMps ? windSpeedMps * 3.6 : null, // km/h for legacy
          windDirection,
          windDegree,
          humidity,
          cloudCover,
          conditions: weatherCondition,
          moonPhase,
        },
        create: {
          catchId,
          temperature: airTemp,
          waterTemperature: finalWaterTemp,
          pressure: pressureHpa,
          windSpeed: windSpeedMps ? windSpeedMps * 3.6 : null,
          windDirection,
          windDegree,
          humidity,
          cloudCover,
          conditions: weatherCondition,
          moonPhase,
        },
      });
    } catch (e) {
      console.error('Failed to upsert WeatherData:', e);
    }

    // 2. Upsert into dedicated AiCatchTelemetry Foundation Dataset
    if (species) {
      try {
        const metadataJson = JSON.stringify({
          source: 'open-meteo',
          rawApi: apiWeather,
          timestamp: caughtAt.toISOString(),
          calculated: {
            moonIllumination,
            timeOfDay,
            season,
          },
        });

        await prisma.aiCatchTelemetry.upsert({
          where: { catchId },
          update: {
            species,
            weightKg,
            lengthCm,
            latitude,
            longitude,
            waterTemp: finalWaterTemp,
            airTemp,
            pressureHpa,
            windSpeedMps,
            windDirection,
            windDegree,
            weatherCondition,
            cloudCover,
            humidity,
            moonPhase,
            moonIllumination,
            timeOfDay,
            season,
            technique,
            bait,
            caughtAt,
            metadata: metadataJson,
          },
          create: {
            catchId,
            species,
            weightKg,
            lengthCm,
            latitude,
            longitude,
            waterTemp: finalWaterTemp,
            airTemp,
            pressureHpa,
            windSpeedMps,
            windDirection,
            windDegree,
            weatherCondition,
            cloudCover,
            humidity,
            moonPhase,
            moonIllumination,
            timeOfDay,
            season,
            technique,
            bait,
            caughtAt,
            metadata: metadataJson,
          },
        });
      } catch (e) {
        console.error('Failed to upsert AiCatchTelemetry dataset:', e);
      }
    }
  }

  /**
   * Retrieves statistical empirical baseline for a species from the telemetry dataset
   * to supercharge Google Gemini AI's prompt reasoning.
   */
  public async getSpeciesTelemetryStats(speciesName: string) {
    try {
      const records = await prisma.aiCatchTelemetry.findMany({
        where: {
          species: {
            contains: speciesName,
            mode: 'insensitive',
          },
        },
        orderBy: { caughtAt: 'desc' },
        take: 100,
      });

      if (records.length === 0) {
        return null;
      }

      const total = records.length;
      const validPressures = records.map(r => r.pressureHpa).filter((p): p is number => p !== null && p > 900);
      const avgPressure = validPressures.length > 0 ? Math.round(validPressures.reduce((a, b) => a + b, 0) / validPressures.length) : null;

      const validWaterTemps = records.map(r => r.waterTemp).filter((w): w is number => w !== null);
      const avgWaterTemp = validWaterTemps.length > 0 ? Math.round((validWaterTemps.reduce((a, b) => a + b, 0) / validWaterTemps.length) * 10) / 10 : null;

      const validAirTemps = records.map(r => r.airTemp).filter((a): a is number => a !== null);
      const avgAirTemp = validAirTemps.length > 0 ? Math.round((validAirTemps.reduce((a, b) => a + b, 0) / validAirTemps.length) * 10) / 10 : null;

      // Top times of day
      const timesCount: Record<string, number> = {};
      records.forEach(r => {
        if (r.timeOfDay) timesCount[r.timeOfDay] = (timesCount[r.timeOfDay] || 0) + 1;
      });
      const bestTimeOfDay = Object.entries(timesCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning';

      // Top techniques
      const techCount: Record<string, number> = {};
      records.forEach(r => {
        if (r.technique) techCount[r.technique] = (techCount[r.technique] || 0) + 1;
      });
      const bestTechnique = Object.entries(techCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        sampleSize: total,
        avgPressure,
        avgWaterTemp,
        avgAirTemp,
        bestTimeOfDay,
        bestTechnique,
      };
    } catch {
      return null;
    }
  }
}

export const weatherTelemetryService = new WeatherTelemetryService();
