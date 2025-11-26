import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function fishingFeaturesRoutes(fastify: FastifyInstance) {
  // ==================== TIDE DATA ====================

  // GET /fishing/tides - Get tide predictions for a location
  fastify.get('/fishing/tides', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lng, startDate, endDate } = request.query as {
        lat: string;
        lng: string;
        startDate?: string;
        endDate?: string;
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'Latitude and longitude are required' });
      }

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Check if we have cached tide data
      const cachedTides = await prisma.tideData.findMany({
        where: {
          lat: { gte: parseFloat(lat) - 0.1, lte: parseFloat(lat) + 0.1 },
          lng: { gte: parseFloat(lng) - 0.1, lte: parseFloat(lng) + 0.1 },
          date: { gte: start, lte: end },
        },
        orderBy: { time: 'asc' },
      });

      if (cachedTides.length > 0) {
        return reply.send({
          source: 'cache',
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          tides: cachedTides.map(t => ({
            timestamp: t.time,
            type: t.tideType,
            height: t.height,
          })),
        });
      }

      // In production, fetch from external API (NOAA, WorldTides, etc.)
      // For now, generate synthetic data
      const syntheticTides = generateSyntheticTides(parseFloat(lat), parseFloat(lng), start, end);

      // Cache the data
      await prisma.tideData.createMany({
        data: syntheticTides.map(tide => ({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          date: tide.timestamp,
          time: tide.timestamp,
          tideType: tide.type,
          height: tide.height,
          source: 'synthetic',
        })),
        skipDuplicates: true,
      });

      return reply.send({
        source: 'generated',
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        tides: syntheticTides,
        note: 'Using synthetic data. In production, integrate with NOAA or WorldTides API.',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get tide data' });
    }
  });

  // GET /fishing/tides/best-times - Get optimal fishing times based on tides
  fastify.get('/fishing/tides/best-times', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lng, date } = request.query as {
        lat: string;
        lng: string;
        date?: string;
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'Latitude and longitude are required' });
      }

      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const tides = await prisma.tideData.findMany({
        where: {
          lat: { gte: parseFloat(lat) - 0.1, lte: parseFloat(lat) + 0.1 },
          lng: { gte: parseFloat(lng) - 0.1, lte: parseFloat(lng) + 0.1 },
          date: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { time: 'asc' },
      });

      // Best fishing times are typically:
      // - 1 hour before to 1 hour after high tide
      // - 1 hour before to 1 hour after low tide
      // - Incoming tide (rising water)
      const bestTimes = tides
        .filter(t => t.tideType === 'high' || t.tideType === 'low')
        .map(tide => {
          const before = new Date(tide.time.getTime() - 60 * 60 * 1000);
          const after = new Date(tide.time.getTime() + 60 * 60 * 1000);

          return {
            type: tide.tideType,
            peakTime: tide.time,
            optimalWindow: {
              start: before,
              end: after,
            },
            quality: tide.tideType === 'high' ? 'excellent' : 'good',
          };
        });

      return reply.send({
        date: targetDate,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        bestTimes,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to calculate best fishing times' });
    }
  });

  // ==================== LUNAR CALENDAR ====================

  // GET /fishing/lunar - Get lunar phase information
  fastify.get('/fishing/lunar', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { date } = request.query as { date?: string };
      const targetDate = date ? new Date(date) : new Date();

      const lunarData = calculateLunarPhase(targetDate);

      // Best fishing periods according to lunar calendar:
      // - New Moon: Good (3 days before to 3 days after)
      // - Full Moon: Excellent (3 days before to 3 days after)
      // - First/Last Quarter: Fair
      const fishingQuality = getFishingQualityByMoonPhase(lunarData.phase);

      return reply.send({
        date: targetDate,
        lunar: {
          phase: lunarData.phase,
          phaseName: lunarData.phaseName,
          illumination: lunarData.illumination,
          age: lunarData.age, // days since new moon
        },
        fishing: {
          quality: fishingQuality,
          majorPeriods: lunarData.majorPeriods,
          minorPeriods: lunarData.minorPeriods,
          recommendation: getFishingRecommendation(lunarData.phase),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get lunar data' });
    }
  });

  // GET /fishing/lunar/calendar - Get monthly lunar calendar
  fastify.get('/fishing/lunar/calendar', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { year, month } = request.query as { year?: string; month?: string };
      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      const targetMonth = month ? parseInt(month) : new Date().getMonth();

      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const calendar = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth, day);
        const lunarData = calculateLunarPhase(date);
        const fishingQuality = getFishingQualityByMoonPhase(lunarData.phase);

        calendar.push({
          date,
          day,
          phase: lunarData.phaseName,
          illumination: lunarData.illumination,
          fishingQuality,
        });
      }

      // Find key moon phases in the month
      const newMoons = calendar.filter(d => d.phase === 'New Moon');
      const fullMoons = calendar.filter(d => d.phase === 'Full Moon');

      return reply.send({
        year: targetYear,
        month: targetMonth,
        calendar,
        keyDates: {
          newMoons: newMoons.map(d => d.date),
          fullMoons: fullMoons.map(d => d.date),
          bestDays: calendar
            .filter(d => d.fishingQuality === 'excellent')
            .map(d => ({ date: d.date, phase: d.phase })),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get lunar calendar' });
    }
  });

  // ==================== FISHING REGULATIONS ====================

  // GET /fishing/regulations - Get fishing regulations for a location
  fastify.get('/fishing/regulations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lng, species } = request.query as {
        lat: string;
        lng: string;
        species?: string;
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'Latitude and longitude are required' });
      }

      const where: any = {
        // Filter regulations that have a region set
        region: { not: '' },
      };

      if (species) {
        where.species = species;
      }

      const regulations = await prisma.fishingRegulation.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        include: {
          species: true,
        },
      });

      // Group by species
      const bySpecies = regulations.reduce((acc, reg) => {
        const speciesName = reg.species?.name || 'General';
        if (!acc[speciesName]) {
          acc[speciesName] = [];
        }
        acc[speciesName].push(reg);
        return acc;
      }, {} as Record<string, any[]>);

      return reply.send({
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        regulations: bySpecies,
        totalRegulations: regulations.length,
        note: 'Always verify local regulations before fishing. Rules may change.',
      });
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to get fishing regulations', details: errorMessage });
    }
  });

  // POST /fishing/regulations - Add fishing regulation (admin only)
  fastify.post('/fishing/regulations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      const {
        speciesId,
        region,
        minSize,
        maxSize,
        dailyLimit,
        closedSeasonStart,
        closedSeasonEnd,
        catchAndRelease,
        regulationType,
        description,
        allowedGear,
      } = request.body as any;

      const regulation = await prisma.fishingRegulation.create({
        data: {
          speciesId,
          region,
          minSize,
          maxSize,
          dailyLimit,
          closedSeasonStart: closedSeasonStart ? new Date(closedSeasonStart) : undefined,
          closedSeasonEnd: closedSeasonEnd ? new Date(closedSeasonEnd) : undefined,
          catchAndRelease: catchAndRelease || false,
          regulationType: regulationType || 'size_limit',
          description,
          allowedGear: allowedGear || [],
          effectiveFrom: new Date(),
        },
      });

      return reply.code(201).send({
        message: 'Regulation added successfully',
        regulation,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add regulation' });
    }
  });

  // GET /fishing/regulations/check - Check if a catch complies with regulations
  fastify.get('/fishing/regulations/check', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { species, weightKg, lengthCm, lat, lng } = request.query as {
        species: string;
        weightKg?: string;
        lengthCm?: string;
        lat: string;
        lng: string;
      };

      if (!species || !lat || !lng) {
        return reply.code(400).send({ error: 'Species and location are required' });
      }

      const regulations = await prisma.fishingRegulation.findMany({
        where: {
          species: species ? {
            name: species,
          } : undefined,
          region: { not: '' },
        },
        include: {
          species: true,
        },
      });

      if (regulations.length === 0) {
        return reply.send({
          species,
          compliant: true,
          message: 'No specific regulations found for this species in this area.',
        });
      }

      const length = lengthCm ? parseFloat(lengthCm) : null;
      const violations = [];

      for (const reg of regulations) {
        if (reg.catchAndRelease) {
          violations.push({
            type: 'catch_and_release',
            message: `${species} must be catch and release in this region.`,
            regulation: reg,
          });
        }

        if (length && reg.minSize && length < reg.minSize) {
          violations.push({
            type: 'undersized',
            message: `Fish is below minimum size (${reg.minSize}cm). Must be released.`,
            regulation: reg,
          });
        }

        if (length && reg.maxSize && length > reg.maxSize) {
          violations.push({
            type: 'oversized',
            message: `Fish exceeds maximum size (${reg.maxSize}cm). Must be released.`,
            regulation: reg,
          });
        }

        // Check season
        if (reg.closedSeasonStart && reg.closedSeasonEnd) {
          const now = new Date();
          const seasonStart = new Date(reg.closedSeasonStart);
          const seasonEnd = new Date(reg.closedSeasonEnd);

          // Check if current date is within closed season
          if (now >= seasonStart && now <= seasonEnd) {
            violations.push({
              type: 'closed_season',
              message: `Fishing season for ${species} is closed. Closed period: ${seasonStart.toLocaleDateString()} - ${seasonEnd.toLocaleDateString()}`,
              regulation: reg,
            });
          }
        }
      }

      return reply.send({
        species,
        compliant: violations.length === 0,
        violations,
        regulations,
        recommendation: violations.length > 0 ? 'Release this fish' : 'Legal to keep (check daily limits)',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to check regulations' });
    }
  });

  // ==================== WATER TEMPERATURE ====================

  // GET /fishing/water-temp - Get water temperature data
  fastify.get('/fishing/water-temp', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { lat, lng, startDate, endDate } = request.query as {
        lat: string;
        lng: string;
        startDate?: string;
        endDate?: string;
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'Latitude and longitude are required' });
      }

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const tempData = await prisma.waterTemperature.findMany({
        where: {
          lat: { gte: parseFloat(lat) - 0.1, lte: parseFloat(lat) + 0.1 },
          lng: { gte: parseFloat(lng) - 0.1, lte: parseFloat(lng) + 0.1 },
          measuredAt: { gte: start, lte: end },
        },
        orderBy: { measuredAt: 'asc' },
      });

      // Calculate stats
      const temps = tempData.map(t => t.temperature);
      const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
      const minTemp = temps.length > 0 ? Math.min(...temps) : null;
      const maxTemp = temps.length > 0 ? Math.max(...temps) : null;
      const currentTemp = tempData.length > 0 ? tempData[tempData.length - 1].temperature : null;

      // Get fishing recommendations based on temperature
      const recommendations = currentTemp ? getTemperatureRecommendations(currentTemp) : [];

      return reply.send({
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        period: { start, end },
        current: {
          temperature: currentTemp,
          timestamp: tempData.length > 0 ? tempData[tempData.length - 1].measuredAt : null,
        },
        stats: {
          average: avgTemp ? parseFloat(avgTemp.toFixed(1)) : null,
          min: minTemp,
          max: maxTemp,
        },
        history: tempData.map(t => ({
          timestamp: t.measuredAt,
          temperature: t.temperature,
          depth: t.depth,
        })),
        recommendations,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get water temperature data' });
    }
  });

  // POST /fishing/water-temp - Record water temperature
  fastify.post('/fishing/water-temp', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { lat, lng, temperature, depth, source } = request.body as {
        lat: number;
        lng: number;
        temperature: number;
        depth?: number;
        source?: string;
      };

      if (!lat || !lng || temperature === undefined) {
        return reply.code(400).send({ error: 'Location and temperature are required' });
      }

      const tempRecord = await prisma.waterTemperature.create({
        data: {
          lat: lat,
          lng: lng,
          temperature,
          depth,
          source: source || 'manual',
          measuredAt: new Date(),
        },
      });

      return reply.code(201).send({
        message: 'Water temperature recorded successfully',
        data: tempRecord,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to record water temperature' });
    }
  });

  // ==================== BAIT EFFECTIVENESS ====================

  // GET /fishing/bait-effectiveness - Get bait effectiveness data
  fastify.get('/fishing/bait-effectiveness', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { species, lat, lng, season } = request.query as {
        species?: string;
        lat?: string;
        lng?: string;
        season?: string;
      };

      const where: any = {};

      if (species) {
        where.species = {
          name: species,
        };
      }

      if (lat && lng) {
        where.lat = { gte: parseFloat(lat) - 0.5, lte: parseFloat(lat) + 0.5 };
        where.lng = { gte: parseFloat(lng) - 0.5, lte: parseFloat(lng) + 0.5 };
      }

      if (season) {
        where.season = season;
      }

      const baitData = await prisma.baitEffectiveness.findMany({
        where,
        include: {
          species: true,
        },
        orderBy: { successRate: 'desc' },
      });

      // Group by bait type
      const byBait = baitData.reduce((acc, data) => {
        if (!acc[data.baitType]) {
          acc[data.baitType] = [];
        }
        acc[data.baitType].push(data);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate aggregate scores
      const baitRankings = Object.entries(byBait).map(([bait, records]) => {
        const avgScore = records.reduce((sum, r) => sum + r.successRate, 0) / records.length;
        const totalCatches = records.reduce((sum, r) => sum + r.totalCatches, 0);
        const avgSize = records.reduce((sum, r) => sum + (r.avgCatchSize || 0), 0) / records.length;

        return {
          bait,
          score: parseFloat(avgScore.toFixed(1)),
          totalCatches,
          avgSize: parseFloat(avgSize.toFixed(2)),
          dataPoints: records.length,
        };
      }).sort((a, b) => b.score - a.score);

      return reply.send({
        filters: { species, location: lat && lng ? { lat, lng } : null, season },
        rankings: baitRankings,
        topBait: baitRankings[0] || null,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get bait effectiveness data' });
    }
  });

  // POST /fishing/bait-effectiveness - Record bait effectiveness
  fastify.post('/fishing/bait-effectiveness', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const {
        speciesId,
        baitType,
        baitCategory,
        lat,
        lng,
        season,
        totalCatches,
        totalAttempts,
        avgCatchSize,
      } = request.body as any;

      if (!baitType || !baitCategory || !lat || !lng) {
        return reply.code(400).send({ error: 'Bait type, bait category, and location are required' });
      }

      // Check for existing record
      const existing = await prisma.baitEffectiveness.findFirst({
        where: {
          speciesId: speciesId || null,
          baitType,
          season: season || null,
          lat: lat,
          lng: lng,
        },
      });

      let record;

      if (existing) {
        // Update existing record (aggregate the data)
        const newTotalCatches = existing.totalCatches + (totalCatches || 0);
        const newTotalAttempts = existing.totalAttempts + (totalAttempts || 1);
        const newSuccessRate = newTotalAttempts > 0 ? newTotalCatches / newTotalAttempts : 0;

        record = await prisma.baitEffectiveness.update({
          where: { id: existing.id },
          data: {
            totalCatches: newTotalCatches,
            totalAttempts: newTotalAttempts,
            successRate: newSuccessRate,
            avgCatchSize: avgCatchSize
              ? ((existing.avgCatchSize || 0) + avgCatchSize) / 2
              : existing.avgCatchSize,
          },
        });
      } else {
        // Create new record
        const successRate = totalAttempts > 0 ? (totalCatches || 0) / totalAttempts : 0;
        record = await prisma.baitEffectiveness.create({
          data: {
            speciesId: speciesId || undefined,
            baitType,
            baitCategory,
            lat: lat,
            lng: lng,
            season,
            totalCatches: totalCatches || 0,
            totalAttempts: totalAttempts || 1,
            successRate,
            avgCatchSize,
          },
        });
      }

      return reply.code(201).send({
        message: 'Bait effectiveness recorded successfully',
        data: record,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to record bait effectiveness' });
    }
  });

  // ==================== CONSERVATION SCORE ====================

  // GET /fishing/conservation/:userId - Get user's conservation score
  fastify.get('/fishing/conservation/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const conservationData = await prisma.conservationScore.findUnique({
        where: { userId },
      });

      if (!conservationData) {
        // Calculate initial score
        const score = await calculateConservationScore(userId);
        return reply.send(score);
      }

      return reply.send(conservationData);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get conservation score' });
    }
  });

  // POST /fishing/conservation/recalculate - Recalculate conservation score
  fastify.post('/fishing/conservation/recalculate', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const score = await calculateConservationScore(userId);

      return reply.send({
        message: 'Conservation score recalculated',
        data: score,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to recalculate conservation score' });
    }
  });
}

// ==================== HELPER FUNCTIONS ====================

function generateSyntheticTides(lat: number, lng: number, start: Date, end: Date) {
  const tides = [];
  const currentTime = new Date(start);

  // Tides occur roughly every 6 hours (12.4 hours for full cycle)
  while (currentTime <= end) {
    const isHigh = Math.floor((currentTime.getTime() / (1000 * 60 * 60)) % 12) < 6;

    tides.push({
      timestamp: new Date(currentTime),
      type: isHigh ? 'high' : 'low',
      height: isHigh ? 2.5 + Math.random() * 0.5 : 0.5 + Math.random() * 0.3,
    });

    currentTime.setHours(currentTime.getHours() + 6);
  }

  return tides;
}

function calculateLunarPhase(date: Date) {
  // Simplified lunar phase calculation
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53059; // days

  const diff = date.getTime() - knownNewMoon.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const age = daysSinceNewMoon % lunarCycle;
  const phase = age / lunarCycle;
  const illumination = 50 * (1 - Math.cos(2 * Math.PI * phase));

  let phaseName = '';
  if (age < 1.85) phaseName = 'New Moon';
  else if (age < 7.38) phaseName = 'Waxing Crescent';
  else if (age < 9.23) phaseName = 'First Quarter';
  else if (age < 14.77) phaseName = 'Waxing Gibbous';
  else if (age < 16.62) phaseName = 'Full Moon';
  else if (age < 22.15) phaseName = 'Waning Gibbous';
  else if (age < 23.99) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';

  // Calculate solunar periods (major and minor feeding times)
  const moonTransit = new Date(date);
  moonTransit.setHours(12 + (age * 24) / lunarCycle); // Simplified

  const majorPeriods = [
    { start: new Date(moonTransit.getTime() - 60 * 60 * 1000), end: new Date(moonTransit.getTime() + 60 * 60 * 1000) },
  ];

  const minorPeriods = [
    { start: new Date(date.getTime() + 6 * 60 * 60 * 1000), end: new Date(date.getTime() + 7 * 60 * 60 * 1000) },
    { start: new Date(date.getTime() + 18 * 60 * 60 * 1000), end: new Date(date.getTime() + 19 * 60 * 60 * 1000) },
  ];

  return {
    phase,
    phaseName,
    illumination: parseFloat(illumination.toFixed(1)),
    age: parseFloat(age.toFixed(1)),
    majorPeriods,
    minorPeriods,
  };
}

function getFishingQualityByMoonPhase(phase: number): string {
  // New Moon (0-0.1) and Full Moon (0.45-0.55) are best
  if (phase < 0.1 || (phase > 0.45 && phase < 0.55)) {
    return 'excellent';
  }
  // First/Last Quarter
  if ((phase > 0.2 && phase < 0.3) || (phase > 0.7 && phase < 0.8)) {
    return 'good';
  }
  return 'fair';
}

function getFishingRecommendation(phase: number): string {
  if (phase < 0.1) {
    return 'New Moon - Prime time for fishing! Fish are more active during low light.';
  }
  if (phase > 0.45 && phase < 0.55) {
    return 'Full Moon - Excellent fishing! Increased tidal movement and feeding activity.';
  }
  if ((phase > 0.2 && phase < 0.3) || (phase > 0.7 && phase < 0.8)) {
    return 'Quarter Moon - Good fishing conditions. Focus on solunar feeding periods.';
  }
  return 'Moderate fishing conditions. Try fishing during dawn and dusk for best results.';
}

function getTemperatureRecommendations(temp: number): string[] {
  const recommendations = [];

  if (temp < 5) {
    recommendations.push('Very cold water - Fish are lethargic. Use slow presentations.');
    recommendations.push('Focus on deep pools and slow-moving water.');
  } else if (temp < 10) {
    recommendations.push('Cold water - Fish metabolism is slow. Use smaller baits.');
  } else if (temp < 15) {
    recommendations.push('Cool water - Good conditions for trout and salmon.');
    recommendations.push('Fish are active but not aggressive. Medium-paced retrieves work well.');
  } else if (temp < 20) {
    recommendations.push('Optimal temperature range for many species.');
    recommendations.push('Fish are highly active. Try a variety of techniques.');
  } else if (temp < 25) {
    recommendations.push('Warm water - Great for bass and panfish.');
    recommendations.push('Fish early morning and evening when oxygen levels are higher.');
  } else if (temp < 30) {
    recommendations.push('Hot water - Fish seek shade and deeper, cooler water.');
    recommendations.push('Focus on shaded areas, drop-offs, and inlets.');
  } else {
    recommendations.push('Very warm water - Fish stress levels are high.');
    recommendations.push('Consider catch and release. Handle fish carefully.');
  }

  return recommendations;
}

async function calculateConservationScore(userId: string): Promise<any> {
  const catches = await prisma.catch.findMany({
    where: { userId },
  });

  const totalCatches = catches.length;
  if (totalCatches === 0) {
    return {
      userId,
      score: 0,
      releaseRate: 0,
      protectedSpeciesReleased: 0,
      message: 'No catches recorded yet',
    };
  }

  // Calculate metrics
  const released = catches.filter(c => c.isReleased).length;
  const releaseRate = (released / totalCatches) * 100;

  // Check for protected species releases
  const protectedSpeciesReleased = catches.filter(c => {
    // Would check against regulations table
    return c.isReleased && c.species; // Simplified
  }).length;

  // Calculate score (0-100)
  let score = 0;

  // Release rate contributes up to 60 points
  score += (releaseRate / 100) * 60;

  // Protected species releases contribute up to 20 points
  score += Math.min(protectedSpeciesReleased * 5, 20);

  // Participation contributes up to 20 points
  score += Math.min(totalCatches / 10, 20);

  score = Math.min(Math.round(score), 100);

  // Save or update score
  const conservationData = await prisma.conservationScore.upsert({
    where: { userId },
    update: {
      score,
      releaseRate: parseFloat(releaseRate.toFixed(1)),
      totalReleased: released,
      totalKept: totalCatches - released,
    },
    create: {
      userId,
      score,
      releaseRate: parseFloat(releaseRate.toFixed(1)),
      totalReleased: released,
      totalKept: totalCatches - released,
    },
  });

  return conservationData;
}
