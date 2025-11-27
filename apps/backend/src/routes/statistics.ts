import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function statisticsRoutes(fastify: FastifyInstance) {
  // Get user statistics overview
  fastify.get('/statistics/overview', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Use database aggregations for better performance
      const [totalCatches, avgStats, biggestFish, heaviestFish, speciesBreakdown] = await Promise.all([
        // Total count
        prisma.catch.count({
          where: { userId, isDraft: false }
        }),

        // Average stats using aggregation
        prisma.catch.aggregate({
          where: { userId, isDraft: false },
          _avg: {
            lengthCm: true,
            weightKg: true
          }
        }),

        // Biggest fish
        prisma.catch.findFirst({
          where: { userId, isDraft: false, lengthCm: { not: null } },
          orderBy: { lengthCm: 'desc' },
          select: { species: true, lengthCm: true, weightKg: true, createdAt: true }
        }),

        // Heaviest fish
        prisma.catch.findFirst({
          where: { userId, isDraft: false, weightKg: { not: null } },
          orderBy: { weightKg: 'desc' },
          select: { species: true, lengthCm: true, weightKg: true, createdAt: true }
        }),

        // Species breakdown using groupBy
        prisma.catch.groupBy({
          by: ['species'],
          where: { userId, isDraft: false, species: { not: null } },
          _count: { species: true },
          orderBy: { _count: { species: 'desc' } },
          take: 20 // Limit to top 20 species
        })
      ]);

      // Species-specific records (load only for top 10 species)
      const topSpecies = speciesBreakdown.slice(0, 10).map(s => s.species!);
      const speciesRecordsData = await Promise.all(
        topSpecies.map(async (species) => {
          const [biggest, heaviest, count] = await Promise.all([
            prisma.catch.findFirst({
              where: { userId, isDraft: false, species, lengthCm: { not: null } },
              orderBy: { lengthCm: 'desc' },
              select: { lengthCm: true, weightKg: true, createdAt: true }
            }),
            prisma.catch.findFirst({
              where: { userId, isDraft: false, species, weightKg: { not: null } },
              orderBy: { weightKg: 'desc' },
              select: { lengthCm: true, weightKg: true, createdAt: true }
            }),
            prisma.catch.count({
              where: { userId, isDraft: false, species }
            })
          ]);

          return { species, biggest, heaviest, count };
        })
      );

      const speciesRecords = speciesRecordsData.reduce((acc, { species, biggest, heaviest, count }) => {
        acc[species] = { biggest, heaviest, count };
        return acc;
      }, {} as any);

      return {
        totalCatches,
        speciesBreakdown: speciesBreakdown.map(s => ({
          species: s.species,
          count: s._count.species
        })),
        records: {
          biggest: biggestFish,
          heaviest: heaviestFish
        },
        speciesRecords,
        averages: {
          length: Math.round((avgStats._avg.lengthCm || 0) * 10) / 10,
          weight: Math.round((avgStats._avg.weightKg || 0) * 1000) / 1000,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch statistics' };
    }
  });

  // Get multi-year historical trends
  fastify.get('/statistics/multi-year-trends', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all catches
      const allCatches = await prisma.catch.findMany({
        where: { userId, isDraft: false },
        select: {
          id: true,
          species: true,
          lengthCm: true,
          weightKg: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (allCatches.length === 0) {
        return {
          years: [],
          yearlyData: {},
          trends: {
            totalGrowth: 0,
            speciesDiversity: 0,
            averageSizeGrowth: 0,
            mostActiveMonth: '',
            consistencyScore: 0,
          },
          insights: [],
          totalYears: 0,
          overallStats: {
            totalCatches: 0,
            totalSpecies: 0,
            firstCatch: null,
            latestCatch: null,
          },
        };
      }

      // Group by year
      const yearlyStats: { [year: string]: any } = {};

      allCatches.forEach(c => {
        const year = new Date(c.createdAt).getFullYear().toString();

        if (!yearlyStats[year]) {
          yearlyStats[year] = {
            year,
            totalCatches: 0,
            species: new Set(),
            lengthSum: 0,
            lengthCount: 0,
            weightSum: 0,
            weightCount: 0,
            monthlyData: {} as { [month: string]: number },
          };
        }

        yearlyStats[year].totalCatches++;
        if (c.species) yearlyStats[year].species.add(c.species);
        if (c.lengthCm) {
          yearlyStats[year].lengthSum += c.lengthCm;
          yearlyStats[year].lengthCount++;
        }
        if (c.weightKg) {
          yearlyStats[year].weightSum += c.weightKg;
          yearlyStats[year].weightCount++;
        }

        // Monthly breakdown
        const month = new Date(c.createdAt).getMonth() + 1;
        yearlyStats[year].monthlyData[month] = (yearlyStats[year].monthlyData[month] || 0) + 1;
      });

      // Get species count per year for top species
      const speciesByYear: { [year: string]: { [species: string]: number } } = {};
      allCatches.forEach(c => {
        if (c.species) {
          const year = new Date(c.createdAt).getFullYear().toString();
          if (!speciesByYear[year]) speciesByYear[year] = {};
          speciesByYear[year][c.species] = (speciesByYear[year][c.species] || 0) + 1;
        }
      });

      // Convert to object format with year keys (not array)
      const yearlyDataObj: { [year: string]: any } = {};
      Object.keys(yearlyStats).forEach(year => {
        const data = yearlyStats[year];

        // Find top species for this year
        const topSpeciesEntry = speciesByYear[year]
          ? Object.entries(speciesByYear[year]).sort((a, b) => b[1] - a[1])[0]
          : null;

        // Convert monthly data to object with month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        const monthlyDistribution: { [month: string]: number } = {};
        for (let i = 1; i <= 12; i++) {
          monthlyDistribution[monthNames[i - 1]] = data.monthlyData[i] || 0;
        }

        yearlyDataObj[year] = {
          year,
          totalCatches: data.totalCatches,
          uniqueSpecies: data.species.size,
          averageLength: data.lengthCount > 0 ? Math.round((data.lengthSum / data.lengthCount) * 10) / 10 : 0,
          averageWeight: data.weightCount > 0 ? Math.round((data.weightSum / data.weightCount) * 1000) / 1000 : 0,
          topSpecies: topSpeciesEntry ? {
            species: topSpeciesEntry[0],
            count: topSpeciesEntry[1],
          } : null,
          monthlyDistribution,
        };
      });

      // Get sorted years array
      const years = Object.keys(yearlyDataObj).sort((a, b) => parseInt(a) - parseInt(b));

      // Calculate trends using the object format
      const firstYear = years.length > 0 ? yearlyDataObj[years[0]] : null;
      const lastYear = years.length > 0 ? yearlyDataObj[years[years.length - 1]] : null;

      const totalGrowth = firstYear && lastYear
        ? ((lastYear.totalCatches - firstYear.totalCatches) / firstYear.totalCatches) * 100
        : 0;

      const speciesDiversity = firstYear && lastYear
        ? lastYear.uniqueSpecies - firstYear.uniqueSpecies
        : 0;

      const averageSizeGrowth = firstYear && lastYear && firstYear.averageLength > 0
        ? ((lastYear.averageLength - firstYear.averageLength) / firstYear.averageLength) * 100
        : 0;

      // Find most active month across all years
      const monthTotals: { [month: string]: number } = {};
      Object.values(yearlyDataObj).forEach((yearData: any) => {
        Object.entries(yearData.monthlyDistribution).forEach(([month, count]) => {
          monthTotals[month] = (monthTotals[month] || 0) + (count as number);
        });
      });
      const mostActiveMonth = Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      // Find consistency score (percentage of years with similar catch counts)
      let consistencyScore = 0;
      if (years.length > 1) {
        const avgCatches = Object.values(yearlyDataObj).reduce((sum: number, y: any) => sum + y.totalCatches, 0) / years.length;
        const consistentYears = Object.values(yearlyDataObj).filter((y: any) =>
          Math.abs(y.totalCatches - avgCatches) < avgCatches * 0.3
        ).length;
        consistencyScore = Math.round((consistentYears / years.length) * 100);
      }

      // Generate insights
      const insights: string[] = [];

      if (years.length > 1) {
        const bestYear = Object.values(yearlyDataObj).reduce((max: any, curr: any) =>
          curr.totalCatches > max.totalCatches ? curr : max
        );
        insights.push(`${bestYear.year} var dit bedste år med ${bestYear.totalCatches} fangster`);

        if (totalGrowth > 0) {
          insights.push(`Du har øget dine fangster med ${Math.round(totalGrowth)}% siden ${firstYear.year}`);
        } else if (totalGrowth < 0) {
          insights.push(`Dine fangster er faldet ${Math.round(Math.abs(totalGrowth))}% siden ${firstYear.year}`);
        }

        if (speciesDiversity > 0) {
          insights.push(`Du har opdaget ${speciesDiversity} nye arter siden ${firstYear.year}`);
        }

        if (averageSizeGrowth > 5) {
          insights.push(`Dine fangsters gennemsnitsstørrelse er steget ${Math.round(averageSizeGrowth)}%`);
        }

        // Find consistency
        if (consistencyScore > 70) {
          insights.push('Du har været meget konsistent gennem årene');
        }
      }

      return {
        years,
        yearlyData: yearlyDataObj,
        trends: {
          totalGrowth: Math.round(totalGrowth * 10) / 10,
          speciesDiversity,
          averageSizeGrowth: Math.round(averageSizeGrowth * 10) / 10,
          mostActiveMonth,
          consistencyScore,
        },
        insights,
        totalYears: years.length,
        overallStats: {
          totalCatches: allCatches.length,
          totalSpecies: new Set(allCatches.filter(c => c.species).map(c => c.species)).size,
          firstCatch: allCatches[0]?.createdAt,
          latestCatch: allCatches[allCatches.length - 1]?.createdAt,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch multi-year trends' };
    }
  });

  // Get catches over time (for graphs)
  fastify.get('/statistics/timeline', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { period = 'year' } = request.query as { period?: 'week' | 'month' | 'year' | 'all' };

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          id: true,
          species: true,
          createdAt: true,
          weightKg: true,
          lengthCm: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by date
      const timeline: { [key: string]: number } = {};
      catches.forEach(c => {
        const date = c.createdAt.toISOString().split('T')[0];
        timeline[date] = (timeline[date] || 0) + 1;
      });

      const timelineData = Object.entries(timeline)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by month for longer periods
      const monthlyData: { [key: string]: number } = {};
      catches.forEach(c => {
        const month = c.createdAt.toISOString().substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      const monthlyTimeline = Object.entries(monthlyData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        period,
        daily: timelineData,
        monthly: monthlyTimeline,
        totalInPeriod: catches.length,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch timeline data' };
    }
  });

  // Get catches by time of day
  fastify.get('/statistics/time-analysis', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
        },
        select: {
          createdAt: true,
        },
      });

      // Group by hour
      const hourlyData: { [key: number]: number } = {};
      catches.forEach(c => {
        const hour = c.createdAt.getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });

      const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyData[hour] || 0,
      }));

      // Find best time
      const bestHour = timeDistribution.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      );

      return {
        distribution: timeDistribution,
        bestTime: {
          hour: bestHour.hour,
          count: bestHour.count,
          label: `${bestHour.hour}:00-${bestHour.hour + 1}:00`,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch time analysis' };
    }
  });

  // Get location-based statistics
  fastify.get('/statistics/locations', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          latitude: true,
          longitude: true,
          species: true,
        },
      });

      // Group by approximate location (rounded to 2 decimals for privacy/grouping)
      const locationGroups: { [key: string]: any } = {};
      catches.forEach(c => {
        if (c.latitude && c.longitude) {
          const key = `${c.latitude.toFixed(2)},${c.longitude.toFixed(2)}`;
          if (!locationGroups[key]) {
            locationGroups[key] = {
              lat: c.latitude,
              lng: c.longitude,
              count: 0,
              species: new Set(),
            };
          }
          locationGroups[key].count++;
          if (c.species) locationGroups[key].species.add(c.species);
        }
      });

      const locations = Object.values(locationGroups)
        .map((loc: any) => ({
          latitude: loc.lat,
          longitude: loc.lng,
          catchCount: loc.count,
          speciesCount: loc.species.size,
          species: Array.from(loc.species),
        }))
        .sort((a, b) => b.catchCount - a.catchCount);

      return {
        totalLocations: locations.length,
        topLocations: locations.slice(0, 10),
        allLocations: locations,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch location statistics' };
    }
  });

  // Get species-specific statistics
  fastify.get('/statistics/species/:species', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { species } = request.params as { species: string };

      const catches = await prisma.catch.findMany({
        where: {
          userId,
          species: species,
          isDraft: false,
        },
        select: {
          id: true,
          lengthCm: true,
          weightKg: true,
          createdAt: true,
          bait: true,
          technique: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCatches = catches.length;

      // Calculate averages
      const catchesWithLength = catches.filter(c => c.lengthCm);
      const catchesWithWeight = catches.filter(c => c.weightKg);

      const averageLength = catchesWithLength.length > 0
        ? catchesWithLength.reduce((sum, c) => sum + (c.lengthCm || 0), 0) / catchesWithLength.length
        : 0;

      const averageWeight = catchesWithWeight.length > 0
        ? catchesWithWeight.reduce((sum, c) => sum + (c.weightKg || 0), 0) / catchesWithWeight.length
        : 0;

      // Find best
      const biggest = catches.reduce((max, c) =>
        (c.lengthCm && (!max.lengthCm || c.lengthCm > max.lengthCm)) ? c : max
      , {} as any);

      const heaviest = catches.reduce((max, c) =>
        (c.weightKg && (!max.weightKg || c.weightKg > max.weightKg)) ? c : max
      , {} as any);

      // Most successful bait/technique
      const baitCount: { [key: string]: number } = {};
      const techniqueCount: { [key: string]: number } = {};

      catches.forEach(c => {
        if (c.bait) baitCount[c.bait] = (baitCount[c.bait] || 0) + 1;
        if (c.technique) techniqueCount[c.technique] = (techniqueCount[c.technique] || 0) + 1;
      });

      const bestBait = Object.entries(baitCount).sort((a, b) => b[1] - a[1])[0];
      const bestTechnique = Object.entries(techniqueCount).sort((a, b) => b[1] - a[1])[0];

      return {
        species,
        totalCatches,
        averages: {
          length: Math.round(averageLength * 10) / 10,
          weight: Math.round(averageWeight * 1000) / 1000,
        },
        records: {
          biggest: biggest.lengthCm ? {
            lengthCm: biggest.lengthCm,
            weightKg: biggest.weightKg,
            date: biggest.createdAt,
          } : null,
          heaviest: heaviest.weightKg ? {
            lengthCm: heaviest.lengthCm,
            weightKg: heaviest.weightKg,
            date: heaviest.createdAt,
          } : null,
        },
        mostSuccessful: {
          bait: bestBait ? { name: bestBait[0], count: bestBait[1] } : null,
          technique: bestTechnique ? { name: bestTechnique[0], count: bestTechnique[1] } : null,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch species statistics' };
    }
  });

  // Get streaks and achievements
  fastify.get('/statistics/streaks', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all catches ordered by date
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
        },
        select: {
          createdAt: true,
          species: true,
          lengthCm: true,
          weightKg: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Group catches by day
      const catchesByDay = new Map<string, number>();
      catches.forEach(c => {
        const date = new Date(c.createdAt);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0];
        catchesByDay.set(dateKey, (catchesByDay.get(dateKey) || 0) + 1);
      });

      // Sort dates
      const sortedDates = Array.from(catchesByDay.keys()).sort().reverse();

      // Calculate current streak
      let checkDate = new Date(today);
      for (let i = 0; i < sortedDates.length; i++) {
        const dateKey = checkDate.toISOString().split('T')[0];
        if (catchesByDay.has(dateKey)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          // Check yesterday if today has no catches
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayKey = checkDate.toISOString().split('T')[0];
          if (catchesByDay.has(yesterdayKey)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Calculate longest streak
      if (sortedDates.length > 0) {
        tempStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const current = new Date(sortedDates[i]);
          const next = new Date(sortedDates[i + 1]);
          const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Get unique species count
      const uniqueSpecies = new Set(catches.map(c => c.species).filter(Boolean));

      // Define achievements
      const achievements = [
        {
          id: 'first_catch',
          name: 'Første Fangst',
          description: 'Fang din første fisk',
          icon: '🎣',
          unlocked: catches.length >= 1,
          progress: Math.min(catches.length, 1),
          target: 1,
        },
        {
          id: 'ten_catches',
          name: '10 Fangster',
          description: 'Fang 10 fisk',
          icon: '🐟',
          unlocked: catches.length >= 10,
          progress: Math.min(catches.length, 10),
          target: 10,
        },
        {
          id: 'fifty_catches',
          name: '50 Fangster',
          description: 'Fang 50 fisk',
          icon: '🎯',
          unlocked: catches.length >= 50,
          progress: Math.min(catches.length, 50),
          target: 50,
        },
        {
          id: 'hundred_catches',
          name: '100 Fangster',
          description: 'Fang 100 fisk',
          icon: '💯',
          unlocked: catches.length >= 100,
          progress: Math.min(catches.length, 100),
          target: 100,
        },
        {
          id: 'species_explorer',
          name: 'Arter Opdagelsesrejsende',
          description: 'Fang 5 forskellige arter',
          icon: '🔍',
          unlocked: uniqueSpecies.size >= 5,
          progress: Math.min(uniqueSpecies.size, 5),
          target: 5,
        },
        {
          id: 'species_master',
          name: 'Arter Mester',
          description: 'Fang 10 forskellige arter',
          icon: '👑',
          unlocked: uniqueSpecies.size >= 10,
          progress: Math.min(uniqueSpecies.size, 10),
          target: 10,
        },
        {
          id: 'week_warrior',
          name: 'Uge Kriger',
          description: 'Fisk 7 dage i træk',
          icon: '🔥',
          unlocked: longestStreak >= 7,
          progress: Math.min(longestStreak, 7),
          target: 7,
        },
        {
          id: 'month_master',
          name: 'Måned Mester',
          description: 'Fisk 30 dage i træk',
          icon: '⭐',
          unlocked: longestStreak >= 30,
          progress: Math.min(longestStreak, 30),
          target: 30,
        },
        {
          id: 'big_catch',
          name: 'Stor Fangst',
          description: 'Fang en fisk over 50cm',
          icon: '📏',
          unlocked: catches.some(c => c.lengthCm && c.lengthCm >= 50),
          progress: catches.some(c => c.lengthCm && c.lengthCm >= 50) ? 1 : 0,
          target: 1,
        },
        {
          id: 'heavy_catch',
          name: 'Tung Fangst',
          description: 'Fang en fisk over 5kg',
          icon: '⚖️',
          unlocked: catches.some(c => c.weightKg && c.weightKg >= 5),
          progress: catches.some(c => c.weightKg && c.weightKg >= 5) ? 1 : 0,
          target: 1,
        },
      ];

      const unlockedCount = achievements.filter(a => a.unlocked).length;
      const completionRate = (unlockedCount / achievements.length) * 100;

      return {
        currentStreak,
        longestStreak,
        totalFishingDays: catchesByDay.size,
        achievements,
        stats: {
          totalAchievements: achievements.length,
          unlockedAchievements: unlockedCount,
          completionRate: Math.round(completionRate),
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch streaks and achievements' };
    }
  });

  // Compare statistics with friends
  fastify.post('/statistics/compare', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { friendIds } = request.body as { friendIds: string[] };

      if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
        reply.code(400);
        return { error: 'Invalid friend IDs provided' };
      }

      // Verify friendships
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, accepterId: { in: friendIds }, status: 'accepted' },
            { accepterId: userId, requesterId: { in: friendIds }, status: 'accepted' },
          ],
        },
      });

      const validFriendIds = new Set<string>();
      friendships.forEach(f => {
        if (f.requesterId === userId) validFriendIds.add(f.accepterId);
        if (f.accepterId === userId) validFriendIds.add(f.requesterId);
      });

      if (validFriendIds.size === 0) {
        reply.code(403);
        return { error: 'No valid friendships found' };
      }

      // Function to get user stats
      const getUserStats = async (uid: string) => {
        const catches = await prisma.catch.findMany({
          where: { userId: uid, isDraft: false },
          select: {
            id: true,
            species: true,
            lengthCm: true,
            weightKg: true,
            createdAt: true,
          },
        });

        const user = await prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, name: true, avatar: true },
        });

        // Total catches
        const totalCatches = catches.length;

        // Species breakdown
        const speciesCount: { [key: string]: number } = {};
        catches.forEach(c => {
          if (c.species) {
            speciesCount[c.species] = (speciesCount[c.species] || 0) + 1;
          }
        });

        const topSpecies = Object.entries(speciesCount)
          .map(([species, count]) => ({ species, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Averages
        const catchesWithLength = catches.filter(c => c.lengthCm);
        const catchesWithWeight = catches.filter(c => c.weightKg);

        const avgLength = catchesWithLength.length > 0
          ? catchesWithLength.reduce((sum, c) => sum + (c.lengthCm || 0), 0) / catchesWithLength.length
          : 0;

        const avgWeight = catchesWithWeight.length > 0
          ? catchesWithWeight.reduce((sum, c) => sum + (c.weightKg || 0), 0) / catchesWithWeight.length
          : 0;

        // Records
        const biggestFish = catches.reduce((max, c) =>
          (c.lengthCm && (!max.lengthCm || c.lengthCm > max.lengthCm)) ? c : max
        , {} as any);

        const heaviestFish = catches.reduce((max, c) =>
          (c.weightKg && (!max.weightKg || c.weightKg > max.weightKg)) ? c : max
        , {} as any);

        // Unique species count
        const uniqueSpecies = new Set(catches.map(c => c.species).filter(Boolean)).size;

        // Catches this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const catchesThisMonth = catches.filter(c => new Date(c.createdAt) >= startOfMonth).length;

        // Catches this year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const catchesThisYear = catches.filter(c => new Date(c.createdAt) >= startOfYear).length;

        return {
          user,
          totalCatches,
          uniqueSpecies,
          catchesThisMonth,
          catchesThisYear,
          topSpecies,
          averages: {
            length: Math.round(avgLength * 10) / 10,
            weight: Math.round(avgWeight * 1000) / 1000,
          },
          records: {
            biggestFish: biggestFish.lengthCm ? {
              species: biggestFish.species,
              lengthCm: biggestFish.lengthCm,
              weightKg: biggestFish.weightKg,
            } : null,
            heaviestFish: heaviestFish.weightKg ? {
              species: heaviestFish.species,
              lengthCm: heaviestFish.lengthCm,
              weightKg: heaviestFish.weightKg,
            } : null,
          },
        };
      };

      // Get stats for current user and friends
      const [currentUserStats, ...friendsStats] = await Promise.all([
        getUserStats(userId),
        ...Array.from(validFriendIds).map(fid => getUserStats(fid)),
      ]);

      return {
        currentUser: currentUserStats,
        friends: friendsStats,
        comparisonMetrics: {
          totalCatches: {
            currentUser: currentUserStats.totalCatches,
            friends: friendsStats.map(f => ({ name: f.user!.name, value: f.totalCatches })),
            rank: 1 + friendsStats.filter(f => f.totalCatches > currentUserStats.totalCatches).length,
          },
          uniqueSpecies: {
            currentUser: currentUserStats.uniqueSpecies,
            friends: friendsStats.map(f => ({ name: f.user!.name, value: f.uniqueSpecies })),
            rank: 1 + friendsStats.filter(f => f.uniqueSpecies > currentUserStats.uniqueSpecies).length,
          },
          catchesThisMonth: {
            currentUser: currentUserStats.catchesThisMonth,
            friends: friendsStats.map(f => ({ name: f.user!.name, value: f.catchesThisMonth })),
            rank: 1 + friendsStats.filter(f => f.catchesThisMonth > currentUserStats.catchesThisMonth).length,
          },
          catchesThisYear: {
            currentUser: currentUserStats.catchesThisYear,
            friends: friendsStats.map(f => ({ name: f.user!.name, value: f.catchesThisYear })),
            rank: 1 + friendsStats.filter(f => f.catchesThisYear > currentUserStats.catchesThisYear).length,
          },
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to compare statistics' };
    }
  });

  // Catch Patterns Analysis
  fastify.get('/statistics/patterns', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    const userId = request.user!.userId;

    const catches = await prisma.catch.findMany({
      where: { userId, isDraft: false },
      select: {
        createdAt: true,
        species: true,
        bait: true,
        technique: true,
        latitude: true,
        longitude: true,
        lengthCm: true,
        weightKg: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (catches.length === 0) {
      return {
        bestTimes: [],
        bestBaits: [],
        bestTechniques: [],
        seasonalPatterns: [],
        locationHotspots: [],
        insights: [],
      };
    }

    // Analyze best times (hour of day)
    const hourCounts = new Map<number, number>();
    catches.forEach(c => {
      const hour = new Date(c.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const bestTimes = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({
        hour,
        count,
        timeRange: `${hour}:00-${hour + 1}:00`,
        percentage: Math.round((count / catches.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze best baits
    const baitCounts = new Map<string, number>();
    catches.forEach(c => {
      if (c.bait) {
        baitCounts.set(c.bait, (baitCounts.get(c.bait) || 0) + 1);
      }
    });

    const bestBaits = Array.from(baitCounts.entries())
      .map(([bait, count]) => ({
        bait,
        count,
        percentage: Math.round((count / catches.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze best techniques
    const techniqueCounts = new Map<string, number>();
    catches.forEach(c => {
      if (c.technique) {
        techniqueCounts.set(c.technique, (techniqueCounts.get(c.technique) || 0) + 1);
      }
    });

    const bestTechniques = Array.from(techniqueCounts.entries())
      .map(([technique, count]) => ({
        technique,
        count,
        percentage: Math.round((count / catches.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze seasonal patterns (monthly)
    const monthCounts = new Map<string, { count: number; species: Set<string> }>();
    catches.forEach(c => {
      const month = new Date(c.createdAt).toLocaleDateString('da-DK', { month: 'long' });
      if (!monthCounts.has(month)) {
        monthCounts.set(month, { count: 0, species: new Set() });
      }
      const data = monthCounts.get(month)!;
      data.count += 1;
      if (c.species) data.species.add(c.species);
    });

    const monthOrder = [
      'januar', 'februar', 'marts', 'april', 'maj', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'december'
    ];

    const seasonalPatterns = Array.from(monthCounts.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        uniqueSpecies: data.species.size,
        percentage: Math.round((data.count / catches.length) * 100),
      }))
      .sort((a, b) => monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase()));

    // Analyze location hotspots (group by approximate location)
    const locationCounts = new Map<string, { count: number; lat: number; lng: number }>();
    catches.forEach(c => {
      if (c.latitude && c.longitude) {
        // Round to 2 decimals to group nearby locations
        const lat = Math.round(c.latitude * 100) / 100;
        const lng = Math.round(c.longitude * 100) / 100;
        const key = `${lat},${lng}`;
        if (!locationCounts.has(key)) {
          locationCounts.set(key, { count: 0, lat, lng });
        }
        locationCounts.get(key)!.count += 1;
      }
    });

    const locationHotspots = Array.from(locationCounts.entries())
      .map(([_, data]) => ({
        latitude: data.lat,
        longitude: data.lng,
        count: data.count,
        percentage: Math.round((data.count / catches.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate insights
    const insights: string[] = [];

    if (bestTimes.length > 0) {
      const topTime = bestTimes[0];
      insights.push(`Du fanger flest fisk mellem kl. ${topTime.timeRange} (${topTime.percentage}% af fangster)`);
    }

    if (bestBaits.length > 0) {
      const topBait = bestBaits[0];
      insights.push(`${topBait.bait} er dit mest succesfulde agn (${topBait.percentage}% af fangster)`);
    }

    if (bestTechniques.length > 0) {
      const topTechnique = bestTechniques[0];
      insights.push(`${topTechnique.technique} er din mest effektive teknik (${topTechnique.percentage}% af fangster)`);
    }

    if (seasonalPatterns.length > 0) {
      const topMonth = [...seasonalPatterns].sort((a, b) => b.count - a.count)[0];
      insights.push(`${topMonth.month} er din mest produktive måned med ${topMonth.count} fangster`);
    }

    const avgLength = catches.filter(c => c.lengthCm).reduce((sum, c) => sum + (c.lengthCm || 0), 0) / catches.filter(c => c.lengthCm).length;
    if (avgLength > 0) {
      insights.push(`Din gennemsnitlige fanget fisk er ${Math.round(avgLength)} cm lang`);
    }

    return {
      bestTimes,
      bestBaits,
      bestTechniques,
      seasonalPatterns,
      locationHotspots,
      insights,
      totalAnalyzed: catches.length,
    };
  });

  // Weather Analytics - Analyze catches by weather conditions
  fastify.get('/statistics/weather-analytics', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all catches with weather data
      const catchesWithWeather = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
          weatherData: { isNot: null },
        },
        include: {
          weatherData: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (catchesWithWeather.length === 0) {
        return {
          success: true,
          hasData: false,
          message: 'Ingen fangster med vejrdata fundet',
          totalCatchesAnalyzed: 0,
          windDirection: { best: null, data: [] },
          moonPhase: { best: null, data: [] },
          conditions: { best: null, data: [] },
          temperature: { best: null, data: [] },
          pressure: { best: null, data: [] },
          tideState: { best: null, data: [] },
          insights: [],
        };
      }

      // Helper to calculate success metrics
      const analyzeCategory = <T extends string>(
        getter: (w: any) => T | null | undefined,
        labelMap?: Record<string, string>
      ) => {
        const counts = new Map<string, { count: number; totalWeight: number; totalLength: number }>();

        catchesWithWeather.forEach(c => {
          const value = getter(c.weatherData);
          if (value) {
            if (!counts.has(value)) {
              counts.set(value, { count: 0, totalWeight: 0, totalLength: 0 });
            }
            const data = counts.get(value)!;
            data.count += 1;
            if (c.weightKg) data.totalWeight += c.weightKg;
            if (c.lengthCm) data.totalLength += c.lengthCm;
          }
        });

        const results = Array.from(counts.entries())
          .map(([value, data]) => ({
            value,
            label: labelMap?.[value] || value,
            count: data.count,
            percentage: Math.round((data.count / catchesWithWeather.length) * 100),
            avgWeight: data.totalWeight > 0 ? Math.round((data.totalWeight / data.count) * 100) / 100 : null,
            avgLength: data.totalLength > 0 ? Math.round((data.totalLength / data.count) * 10) / 10 : null,
          }))
          .sort((a, b) => b.count - a.count);

        return {
          best: results[0] || null,
          data: results,
        };
      };

      // Wind direction analysis
      const windDirectionLabels: Record<string, string> = {
        'N': 'Nord',
        'NE': 'Nordøst',
        'E': 'Øst',
        'SE': 'Sydøst',
        'S': 'Syd',
        'SW': 'Sydvest',
        'W': 'Vest',
        'NW': 'Nordvest',
      };
      const windDirection = analyzeCategory(w => w?.windDirection, windDirectionLabels);

      // Moon phase analysis
      const moonPhaseLabels: Record<string, string> = {
        'new': 'Nymåne',
        'waxing_crescent': 'Tiltagende månesegl',
        'first_quarter': 'Første kvarter',
        'waxing_gibbous': 'Tiltagende måne',
        'full': 'Fuldmåne',
        'waning_gibbous': 'Aftagende måne',
        'last_quarter': 'Sidste kvarter',
        'waning_crescent': 'Aftagende månesegl',
      };
      const moonPhase = analyzeCategory(w => w?.moonPhase, moonPhaseLabels);

      // Weather conditions analysis
      const conditionsLabels: Record<string, string> = {
        'clear': 'Klart vejr',
        'sunny': 'Sol',
        'partly_cloudy': 'Delvist skyet',
        'cloudy': 'Overskyet',
        'overcast': 'Gråvejr',
        'rainy': 'Regn',
        'drizzle': 'Støvregn',
        'stormy': 'Storm',
        'foggy': 'Tåge',
        'snowy': 'Sne',
      };
      const conditions = analyzeCategory(w => w?.conditions, conditionsLabels);

      // Tide state analysis
      const tideStateLabels: Record<string, string> = {
        'high': 'Højvande',
        'low': 'Lavvande',
        'rising': 'Stigende',
        'falling': 'Faldende',
      };
      const tideState = analyzeCategory(w => w?.tideState, tideStateLabels);

      // Temperature range analysis
      const temperatureRanges = new Map<string, { count: number; min: number; max: number; totalWeight: number; totalLength: number }>();
      const tempRangeLabels: Record<string, string> = {
        'freezing': 'Under 0°C',
        'cold': '0-5°C',
        'cool': '5-10°C',
        'mild': '10-15°C',
        'warm': '15-20°C',
        'hot': '20-25°C',
        'very_hot': 'Over 25°C',
      };

      catchesWithWeather.forEach(c => {
        const temp = c.weatherData?.temperature;
        if (temp !== null && temp !== undefined) {
          let range: string;
          if (temp < 0) range = 'freezing';
          else if (temp < 5) range = 'cold';
          else if (temp < 10) range = 'cool';
          else if (temp < 15) range = 'mild';
          else if (temp < 20) range = 'warm';
          else if (temp < 25) range = 'hot';
          else range = 'very_hot';

          if (!temperatureRanges.has(range)) {
            temperatureRanges.set(range, { count: 0, min: temp, max: temp, totalWeight: 0, totalLength: 0 });
          }
          const data = temperatureRanges.get(range)!;
          data.count += 1;
          data.min = Math.min(data.min, temp);
          data.max = Math.max(data.max, temp);
          if (c.weightKg) data.totalWeight += c.weightKg;
          if (c.lengthCm) data.totalLength += c.lengthCm;
        }
      });

      const temperatureResults = Array.from(temperatureRanges.entries())
        .map(([range, data]) => ({
          value: range,
          label: tempRangeLabels[range],
          count: data.count,
          percentage: Math.round((data.count / catchesWithWeather.length) * 100),
          tempRange: `${Math.round(data.min)}°C - ${Math.round(data.max)}°C`,
          avgWeight: data.totalWeight > 0 ? Math.round((data.totalWeight / data.count) * 100) / 100 : null,
          avgLength: data.totalLength > 0 ? Math.round((data.totalLength / data.count) * 10) / 10 : null,
        }))
        .sort((a, b) => b.count - a.count);

      const temperature = {
        best: temperatureResults[0] || null,
        data: temperatureResults,
      };

      // Pressure range analysis
      const pressureRanges = new Map<string, { count: number; min: number; max: number; totalWeight: number; totalLength: number }>();
      const pressureRangeLabels: Record<string, string> = {
        'very_low': 'Meget lavt (<1000 hPa)',
        'low': 'Lavt (1000-1010 hPa)',
        'normal': 'Normalt (1010-1020 hPa)',
        'high': 'Højt (1020-1030 hPa)',
        'very_high': 'Meget højt (>1030 hPa)',
      };

      catchesWithWeather.forEach(c => {
        const pressure = c.weatherData?.pressure;
        if (pressure !== null && pressure !== undefined) {
          let range: string;
          if (pressure < 1000) range = 'very_low';
          else if (pressure < 1010) range = 'low';
          else if (pressure < 1020) range = 'normal';
          else if (pressure < 1030) range = 'high';
          else range = 'very_high';

          if (!pressureRanges.has(range)) {
            pressureRanges.set(range, { count: 0, min: pressure, max: pressure, totalWeight: 0, totalLength: 0 });
          }
          const data = pressureRanges.get(range)!;
          data.count += 1;
          data.min = Math.min(data.min, pressure);
          data.max = Math.max(data.max, pressure);
          if (c.weightKg) data.totalWeight += c.weightKg;
          if (c.lengthCm) data.totalLength += c.lengthCm;
        }
      });

      const pressureResults = Array.from(pressureRanges.entries())
        .map(([range, data]) => ({
          value: range,
          label: pressureRangeLabels[range],
          count: data.count,
          percentage: Math.round((data.count / catchesWithWeather.length) * 100),
          pressureRange: `${Math.round(data.min)}-${Math.round(data.max)} hPa`,
          avgWeight: data.totalWeight > 0 ? Math.round((data.totalWeight / data.count) * 100) / 100 : null,
          avgLength: data.totalLength > 0 ? Math.round((data.totalLength / data.count) * 10) / 10 : null,
        }))
        .sort((a, b) => b.count - a.count);

      const pressure = {
        best: pressureResults[0] || null,
        data: pressureResults,
      };

      // Generate insights
      const insights: string[] = [];

      if (windDirection.best) {
        insights.push(`Du fanger flest fisk med ${windDirection.best.label.toLowerCase()} vind (${windDirection.best.percentage}% af fangster)`);
      }

      if (moonPhase.best) {
        insights.push(`${moonPhase.best.label} er din bedste månefase med ${moonPhase.best.count} fangster`);
      }

      if (conditions.best) {
        insights.push(`${conditions.best.label} giver dig de bedste resultater (${conditions.best.percentage}% af fangster)`);
      }

      if (temperature.best) {
        insights.push(`Du fanger mest ved ${temperature.best.label.toLowerCase()} (${temperature.best.percentage}% af fangster)`);
      }

      if (pressure.best) {
        const pressureLabel = pressure.best.label.toLowerCase().replace('(', '').replace(')', '');
        insights.push(`${pressureLabel} lufttryk er optimalt for dine fangster`);
      }

      if (tideState.best && tideState.data.length > 1) {
        insights.push(`${tideState.best.label} tidevand giver ${tideState.best.percentage}% af dine fangster`);
      }

      // Find if bigger fish are caught under specific conditions
      const windWithBiggestFish = windDirection.data.filter(d => d.avgLength).sort((a, b) => (b.avgLength || 0) - (a.avgLength || 0))[0];
      if (windWithBiggestFish && windWithBiggestFish.avgLength && windDirection.best && windWithBiggestFish.value !== windDirection.best.value) {
        insights.push(`Tip: Med ${windDirectionLabels[windWithBiggestFish.value] || windWithBiggestFish.value} vind fanger du de største fisk (gns. ${windWithBiggestFish.avgLength} cm)`);
      }

      return {
        success: true,
        hasData: true,
        totalCatchesAnalyzed: catchesWithWeather.length,
        windDirection,
        moonPhase,
        conditions,
        temperature,
        pressure,
        tideState,
        insights,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch weather analytics' };
    }
  });
}
