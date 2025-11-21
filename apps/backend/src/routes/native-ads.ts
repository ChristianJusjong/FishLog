import { FastifyPluginAsync } from 'fastify';
import { PrismaClient, AdType, AdStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to check if user should see ads
async function shouldShowAds(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { premium: true }
  });

  // Don't show ads to premium/pro users
  if (user?.premium?.tier === 'premium' || user?.premium?.tier === 'pro') {
    return false;
  }

  return true;
}

// Helper function to check frequency capping
async function hasReachedImpressionLimit(
  userId: string,
  adId: string,
  maxImpressions: number
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const impressionCount = await prisma.adImpression.count({
    where: {
      userId,
      adId,
      timestamp: {
        gte: today
      }
    }
  });

  return impressionCount >= maxImpressions;
}

// Helper function to calculate ad score for targeting
function calculateAdScore(
  ad: any,
  userProfile: {
    catchSpecies: string[];
    region: string;
    age?: number;
    isPremium: boolean;
  }
): number {
  let score = ad.priority || 0;

  // Targeting bonus
  if (ad.targetSpecies.length > 0) {
    const matchingSpecies = ad.targetSpecies.filter((species: string) =>
      userProfile.catchSpecies.includes(species)
    );
    score += matchingSpecies.length * 10;
  }

  if (ad.targetRegions.length > 0 && ad.targetRegions.includes(userProfile.region)) {
    score += 15;
  }

  if (ad.targetAudience.length > 0) {
    if (userProfile.isPremium && ad.targetAudience.includes('premium_user')) {
      score += 20;
    }
  }

  // Age targeting
  if (userProfile.age) {
    if (ad.minAge && userProfile.age < ad.minAge) score -= 50;
    if (ad.maxAge && userProfile.age > ad.maxAge) score -= 50;
  }

  // CTR bonus (engagement-based ranking)
  if (ad.impressions > 0) {
    const ctr = ad.clicks / ad.impressions;
    score += ctr * 100;
  }

  return score;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const nativeAdsRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/ads/feed
   * Get native ads for the feed with targeting and frequency capping
   */
  fastify.get('/api/ads/feed', async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] as string;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID required' });
      }

      // Check if user should see ads
      const showAds = await shouldShowAds(userId);
      if (!showAds) {
        return { ads: [] };
      }

      // Get active feed ads
      const now = new Date();
      const activeAds = await prisma.nativeAd.findMany({
        where: {
          type: AdType.FEED_NATIVE,
          status: AdStatus.ACTIVE,
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      });

      // Filter by frequency capping
      const eligibleAds = [];
      for (const ad of activeAds) {
        if (ad.maxImpressionsPerUser) {
          const reachedLimit = await hasReachedImpressionLimit(
            userId,
            ad.id,
            ad.maxImpressionsPerUser
          );
          if (!reachedLimit) {
            eligibleAds.push(ad);
          }
        } else {
          eligibleAds.push(ad);
        }
      }

      // Get user profile for targeting
      const userCatches = await prisma.catch.findMany({
        where: { userId },
        select: { species: true },
        take: 50,
        orderBy: { createdAt: 'desc' }
      });

      const userProfile = {
        catchSpecies: [...new Set(userCatches.map(c => c.species).filter(Boolean))] as string[],
        region: 'Denmark', // Default - could be extracted from user location
        isPremium: false
      };

      // Score and rank ads
      const scoredAds = eligibleAds.map(ad => ({
        ad,
        score: calculateAdScore(ad, userProfile)
      }));

      // Sort by score and take top 3
      scoredAds.sort((a, b) => b.score - a.score);
      const topAds = scoredAds.slice(0, 3).map(item => item.ad);

      return { ads: topAds };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch ads' });
    }
  });

  /**
   * POST /api/ads/:id/impression
   * Track an ad impression
   */
  fastify.post<{ Params: { id: string }; Body: { platform?: string; screenType?: string } }>(
    '/api/ads/:id/impression',
    async (request, reply) => {
      try {
        const { id: adId } = request.params;
        const userId = request.headers['x-user-id'] as string;
        const { platform, screenType } = request.body;

        if (!userId) {
          return reply.code(401).send({ error: 'User ID required' });
        }

        // Create impression record
        await prisma.adImpression.create({
          data: {
            adId,
            userId,
            platform,
            screenType
          }
        });

        // Update ad impressions count
        await prisma.nativeAd.update({
          where: { id: adId },
          data: { impressions: { increment: 1 } }
        });

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to track impression' });
      }
    }
  );

  /**
   * POST /api/ads/:id/click
   * Track an ad click
   */
  fastify.post<{ Params: { id: string }; Body: { platform?: string; screenType?: string } }>(
    '/api/ads/:id/click',
    async (request, reply) => {
      try {
        const { id: adId } = request.params;
        const userId = request.headers['x-user-id'] as string;
        const { platform, screenType } = request.body;

        if (!userId) {
          return reply.code(401).send({ error: 'User ID required' });
        }

        // Create click record
        await prisma.adClick.create({
          data: {
            adId,
            userId,
            platform,
            screenType
          }
        });

        // Update ad clicks count
        await prisma.nativeAd.update({
          where: { id: adId },
          data: { clicks: { increment: 1 } }
        });

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to track click' });
      }
    }
  );

  /**
   * POST /api/ads/:id/conversion
   * Track an ad conversion
   */
  fastify.post<{
    Params: { id: string };
    Body: { conversionType: string; value?: number }
  }>(
    '/api/ads/:id/conversion',
    async (request, reply) => {
      try {
        const { id: adId } = request.params;
        const userId = request.headers['x-user-id'] as string;
        const { conversionType, value } = request.body;

        if (!userId) {
          return reply.code(401).send({ error: 'User ID required' });
        }

        // Create conversion record
        await prisma.adConversion.create({
          data: {
            adId,
            userId,
            conversionType,
            value: value ? parseFloat(value.toString()) : undefined
          }
        });

        // Update ad conversions count
        await prisma.nativeAd.update({
          where: { id: adId },
          data: { conversions: { increment: 1 } }
        });

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to track conversion' });
      }
    }
  );

  /**
   * GET /api/ads/sponsored-spots
   * Get sponsored fishing spots for the map
   */
  fastify.get<{ Querystring: { lat?: string; lng?: string; radius?: string } }>(
    '/api/ads/sponsored-spots',
    async (request, reply) => {
      try {
        const userId = request.headers['x-user-id'] as string;
        const { lat, lng, radius = '50000' } = request.query;

        if (!userId) {
          return reply.code(401).send({ error: 'User ID required' });
        }

        // Check if user should see ads
        const showAds = await shouldShowAds(userId);
        if (!showAds) {
          return { spots: [] };
        }

        if (!lat || !lng) {
          return reply.code(400).send({ error: 'Location required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const searchRadius = parseFloat(radius);

        // Get active sponsored spots near location
        const now = new Date();
        const sponsoredSpots = await prisma.sponsoredSpot.findMany({
          where: {
            active: true,
            ad: {
              status: AdStatus.ACTIVE,
              startDate: { lte: now },
              OR: [
                { endDate: null },
                { endDate: { gte: now } }
              ]
            }
          },
          include: {
            ad: true
          },
          orderBy: {
            priority: 'desc'
          }
        });

        // Filter by distance (simple calculation)
        const nearbySpots = sponsoredSpots.filter(spot => {
          const distance = calculateDistance(
            latitude,
            longitude,
            spot.latitude,
            spot.longitude
          );
          return distance <= searchRadius / 1000; // Convert to km
        });

        return { spots: nearbySpots };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch sponsored spots' });
      }
    }
  );

  /**
   * GET /api/ads/ai-products
   * Get AI-recommended products based on user catches
   */
  fastify.get('/api/ads/ai-products', async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] as string;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID required' });
      }

      // Check if user should see ads
      const showAds = await shouldShowAds(userId);
      if (!showAds) {
        return { products: [] };
      }

      // Get user's recent catches to recommend relevant products
      const recentCatches = await prisma.catch.findMany({
        where: { userId },
        select: { species: true, technique: true },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });

      const targetSpecies = [...new Set(recentCatches.map(c => c.species).filter(Boolean))];

      // Get active AI product ads
      const now = new Date();
      const productAds = await prisma.nativeAd.findMany({
        where: {
          type: AdType.AI_PRODUCT,
          status: AdStatus.ACTIVE,
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ],
          targetSpecies: {
            hasSome: targetSpecies as string[]
          }
        },
        orderBy: {
          priority: 'desc'
        },
        take: 3
      });

      return { products: productAds };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch AI products' });
    }
  });
};
