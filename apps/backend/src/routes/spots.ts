import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function spotsRoutes(fastify: FastifyInstance) {
  // Get heatmap data for fishing spots
  fastify.get('/spots/heatmap', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { species, season, gridSize = '0.01' } = request.query as {
        species?: string;
        season?: 'spring' | 'summer' | 'fall' | 'winter';
        gridSize?: string;
      };

      // Build WHERE clause for filters
      const conditions: string[] = ['latitude IS NOT NULL', 'longitude IS NOT NULL'];
      const params: any[] = [];
      let paramIndex = 1;

      if (species) {
        conditions.push(`species = $${paramIndex}`);
        params.push(species);
        paramIndex++;
      }

      if (season) {
        // Map seasons to months
        const seasonMonths: Record<string, number[]> = {
          spring: [3, 4, 5],
          summer: [6, 7, 8],
          fall: [9, 10, 11],
          winter: [12, 1, 2],
        };

        const months = seasonMonths[season];
        conditions.push(`EXTRACT(MONTH FROM "createdAt") = ANY($${paramIndex}::int[])`);
        params.push(months);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');
      const gridSizeNum = parseFloat(gridSize);

      // Snap coordinates to grid without PostGIS
      // This creates a heatmap by counting catches in each grid cell
      const heatmapQuery = `
        SELECT
          grid_lng as longitude,
          grid_lat as latitude,
          COUNT(*) as intensity,
          ARRAY_AGG(DISTINCT species) as species_list,
          AVG(COALESCE("weightKg", 0)) as avg_weight,
          COUNT(DISTINCT "userId") as unique_anglers
        FROM (
          SELECT
            FLOOR(longitude / $${paramIndex}) * $${paramIndex} as grid_lng,
            FLOOR(latitude / $${paramIndex}) * $${paramIndex} as grid_lat,
            species,
            "weightKg",
            "userId"
          FROM catches
          WHERE ${whereClause}
        ) as gridded
        GROUP BY grid_lng, grid_lat
        HAVING COUNT(*) > 0
        ORDER BY intensity DESC
        LIMIT 500
      `;

      params.push(gridSizeNum);

      const heatmapData = await prisma.$queryRawUnsafe<Array<{
        longitude: number;
        latitude: number;
        intensity: bigint;
        species_list: string[];
        avg_weight: number;
        unique_anglers: bigint;
      }>>(heatmapQuery, ...params);

      // Convert BigInt to Number for JSON serialization
      const formattedData = heatmapData.map(point => ({
        longitude: point.longitude,
        latitude: point.latitude,
        intensity: Number(point.intensity),
        species: point.species_list,
        avgWeight: point.avg_weight,
        uniqueAnglers: Number(point.unique_anglers),
      }));

      return {
        points: formattedData,
        filters: {
          species,
          season,
          gridSize: parseFloat(gridSize),
        },
        total: formattedData.length,
      };
    } catch (error) {
      fastify.log.error({ err: error }, 'Heatmap error');
      return reply.code(500).send({ error: 'Failed to generate heatmap' });
    }
  });

  // Get top fishing spots (most catches)
  fastify.get('/spots/top', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { species, limit = '10' } = request.query as {
        species?: string;
        limit?: string;
      };

      const conditions: string[] = ['latitude IS NOT NULL', 'longitude IS NOT NULL'];
      const params: any[] = [];
      let paramIndex = 1;

      if (species) {
        conditions.push(`species = $${paramIndex}`);
        params.push(species);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');

      // Find clusters of catches (hot spots) using simple grid-based clustering
      // Group catches into 0.01 degree cells (~1km) and find areas with multiple catches
      const topSpotsQuery = `
        SELECT
          AVG(longitude) as longitude,
          AVG(latitude) as latitude,
          COUNT(*) as catch_count,
          ARRAY_AGG(DISTINCT species) as species_list,
          AVG(COALESCE("weightKg", 0)) * 1000 as avg_weight_g,
          MAX(COALESCE("weightKg", 0)) * 1000 as max_weight_g
        FROM (
          SELECT
            FLOOR(longitude / 0.01) * 0.01 as grid_lng,
            FLOOR(latitude / 0.01) * 0.01 as grid_lat,
            longitude,
            latitude,
            species,
            "weightKg"
          FROM catches
          WHERE ${whereClause}
        ) as gridded
        GROUP BY grid_lng, grid_lat
        HAVING COUNT(*) >= 2
        ORDER BY catch_count DESC
        LIMIT $${paramIndex}
      `;

      params.push(parseInt(limit));

      const topSpots = await prisma.$queryRawUnsafe<Array<{
        longitude: number;
        latitude: number;
        catch_count: bigint;
        species_list: string[];
        avg_weight_g: number;
        max_weight_g: number;
      }>>(topSpotsQuery, ...params);

      const formattedSpots = topSpots.map((spot, index) => ({
        id: `spot-${index}`,
        longitude: spot.longitude,
        latitude: spot.latitude,
        catchCount: Number(spot.catch_count),
        species: spot.species_list,
        avgWeight: Math.round(spot.avg_weight_g),
        maxWeight: Math.round(spot.max_weight_g),
      }));

      return {
        spots: formattedSpots,
        filters: { species },
        total: formattedSpots.length,
      };
    } catch (error) {
      fastify.log.error({ err: error }, 'Top spots error');
      return reply.code(500).send({ error: 'Failed to get top spots' });
    }
  });

  // Get catch statistics for a specific area
  fastify.get('/spots/area-stats', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { lat, lng, radius = '1' } = request.query as {
        lat: string;
        lng: string;
        radius?: string; // radius in kilometers
      };

      if (!lat || !lng) {
        return reply.code(400).send({ error: 'Latitude and longitude are required' });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      // Get statistics for catches within radius
      // Using Haversine formula approximation: 1 degree ≈ 111km at equator
      // For simplicity, use bounding box filter
      const degreeRadius = radiusKm / 111.0;

      const statsQuery = `
        SELECT
          COUNT(*) as total_catches,
          COUNT(DISTINCT species) as unique_species,
          COUNT(DISTINCT "userId") as unique_anglers,
          AVG(COALESCE("weightKg", 0)) * 1000 as avg_weight_g,
          MAX(COALESCE("weightKg", 0)) * 1000 as max_weight_g,
          ARRAY_AGG(DISTINCT species) as species_list
        FROM catches
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND latitude BETWEEN $1 - $3 AND $1 + $3
          AND longitude BETWEEN $2 - $3 AND $2 + $3
      `;

      const stats = await prisma.$queryRawUnsafe<Array<{
        total_catches: bigint;
        unique_species: bigint;
        unique_anglers: bigint;
        avg_weight_g: number;
        max_weight_g: number;
        species_list: string[];
      }>>(statsQuery, latitude, longitude, degreeRadius);

      if (stats.length === 0 || Number(stats[0].total_catches) === 0) {
        return {
          totalCatches: 0,
          uniqueSpecies: 0,
          uniqueAnglers: 0,
          avgWeight: 0,
          maxWeight: 0,
          species: [],
        };
      }

      const stat = stats[0];

      return {
        totalCatches: Number(stat.total_catches),
        uniqueSpecies: Number(stat.unique_species),
        uniqueAnglers: Number(stat.unique_anglers),
        avgWeight: Math.round(stat.avg_weight_g),
        maxWeight: Math.round(stat.max_weight_g),
        species: stat.species_list.filter(s => s !== null),
        area: {
          latitude,
          longitude,
          radiusKm,
        },
      };
    } catch (error) {
      fastify.log.error({ err: error }, 'Area stats error');
      return reply.code(500).send({ error: 'Failed to get area statistics' });
    }
  });
}
