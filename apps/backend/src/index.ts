import { prisma } from "./lib/prisma";
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import path from 'path';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { catchesRoutes } from './routes/catches';
import { friendsRoutes } from './routes/friends';
import { feedRoutes } from './routes/feed';
import { uploadRoutes } from './routes/upload';
import { eventsRoutes } from './routes/events';
import { spotsRoutes } from './routes/spots';
import { aiRoutes } from './routes/ai';
import { badgeRoutes } from './routes/badges';
import { adminRoutes } from './routes/admin';
import { clubsRoutes } from './routes/clubs';
import { groupsRoutes } from './routes/groups';
import { statisticsRoutes } from './routes/statistics';
import { favoriteSpotRoutes } from './routes/favorite-spots';
import { challengesRoutes } from './routes/challenges';
import { challengeCommentsRoutes } from './routes/challenge-comments';
import { challengeTemplatesRoutes } from './routes/challenge-templates';
import { messagesRoutes } from './routes/messages';
import { weatherRoutes } from './routes/weather';
import { personalBestsRoutes } from './routes/personal-bests';
import { notificationsRoutes } from './routes/notifications';
import moderationRoutes from './routes/moderation';
import { conversationsRoutes } from './routes/conversations';
import { websocketRoutes } from './routes/websocket';
import { pushTokenRoutes } from './routes/push-tokens';
import { predictionsRoutes } from './routes/predictions';
import { sessionsRoutes } from './routes/sessions';
import { segmentsRoutes } from './routes/segments';
import { kudosRoutes } from './routes/kudos';
import { premiumAnalyticsRoutes } from './routes/premium-analytics';
import { fishingFeaturesRoutes } from './routes/fishing-features';
import { nativeAdsRoutes } from './routes/native-ads';
import xpRoutes from './routes/xp';
import { publicProfileRoutes } from './routes/public-profile';
import { hotSpotsRoutes } from './routes/hot-spots';
import { speciesRoutes } from './routes/species';
import { leaderboardRoutes } from './routes/leaderboard';
import { initializeDatabase } from './utils/init-db';
import { errorHandler } from './lib/errors';
import 'dotenv/config';

const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB limit for JSON bodies (to support base64 images)
});

// Global error handler
errorHandler(fastify);

// Security: Helmet - adds security headers
fastify.register(helmet, {
  contentSecurityPolicy: false, // Disabled for API
  crossOriginEmbedderPolicy: false,
});

// Security: Rate limiting - prevent DDoS and brute force attacks
fastify.register(rateLimit, {
  max: 100, // Max 100 requests
  timeWindow: '1 minute', // per minute
  cache: 10000, // Cache 10k users
  allowList: [], // No whitelist
  redis: undefined, // Use in-memory for now, switch to Redis in production for multi-server
  skipOnError: true, // Don't block on rate limiter errors
  keyGenerator: (request) => {
    // Use IP + user agent for better fingerprinting
    return request.ip + (request.headers['user-agent'] || '');
  },
});

// Stricter rate limits for auth endpoints (applied per-route in auth.ts)
export const authRateLimit = {
  max: 5, // Max 5 attempts
  timeWindow: '15 minutes', // per 15 minutes
};

// CORS configuration - restrict origins in production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://fishlog-production.up.railway.app', 'https://hook.app'] // Add your production domains
  : true; // Allow all in development

fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Multipart support for file uploads
fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Serve static files (privacy policy, etc.)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

// WebSocket support
fastify.register(websocket);

// Register routes
fastify.register(authRoutes);
fastify.register(userRoutes);
fastify.register(catchesRoutes);
fastify.register(friendsRoutes);
fastify.register(feedRoutes);
fastify.register(uploadRoutes);
fastify.register(eventsRoutes);
fastify.register(spotsRoutes);
fastify.register(aiRoutes);
fastify.register(badgeRoutes);
fastify.register(adminRoutes);
fastify.register(clubsRoutes);
fastify.register(groupsRoutes);
fastify.register(statisticsRoutes);
fastify.register(favoriteSpotRoutes);
fastify.register(challengesRoutes);
fastify.register(challengeCommentsRoutes);
fastify.register(challengeTemplatesRoutes);
fastify.register(messagesRoutes);
fastify.register(weatherRoutes);
fastify.register(personalBestsRoutes);
fastify.register(notificationsRoutes);
fastify.register(moderationRoutes);
fastify.register(conversationsRoutes);
fastify.register(websocketRoutes);
fastify.register(pushTokenRoutes);
fastify.register(predictionsRoutes);
fastify.register(sessionsRoutes);
fastify.register(segmentsRoutes);
fastify.register(kudosRoutes);
fastify.register(premiumAnalyticsRoutes);
fastify.register(fishingFeaturesRoutes);
fastify.register(nativeAdsRoutes);
fastify.register(xpRoutes);
fastify.register(publicProfileRoutes);
fastify.register(hotSpotsRoutes);
fastify.register(speciesRoutes);
fastify.register(leaderboardRoutes);

// Debug endpoint for testing Prisma queries
fastify.get('/debug/catch-test', async (request, reply) => {
  try {
    // Test 1: Simple count
    const count = await prisma.catch.count();

    // Test 2: FindMany without include
    const catchesSimple = await prisma.catch.findMany({
      take: 1,
      select: { id: true, species: true, userId: true }
    });

    // Test 3: FindMany with include
    let catchesWithUser = null;
    let includeError = null;
    try {
      catchesWithUser = await prisma.catch.findMany({
        take: 1,
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });
    } catch (e) {
      includeError = e instanceof Error ? e.message : String(e);
    }

    // Test 4: Check User model
    const userCount = await prisma.user.count();

    return {
      success: true,
      tests: {
        catchCount: count,
        simpleQuery: catchesSimple,
        withUserInclude: catchesWithUser,
        includeError,
        userCount
      }
    };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Debug endpoint for database table verification
fastify.get('/debug/database-tables', async (request, reply) => {
  try {
    // Get all table names from PostgreSQL
    const tablesResult = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const existingTables = tablesResult.map(t => t.tablename);

    // Expected tables from Prisma schema (67 tables)
    const expectedTables = [
      'locations', 'users', 'catches', 'fish', 'friendships', 'blocked_users', 'muted_users',
      'content_reports', 'likes', 'comments', 'events', 'contests', 'event_participants',
      'badges', 'user_badges', 'catch_validation', 'clubs', 'club_members', 'club_messages',
      'groups', 'group_memberships', 'group_posts', 'group_post_likes', 'group_post_comments',
      'group_messages', 'favorite_spots', 'trips', 'trip_participants', 'gear', 'species',
      'fiskedex_entries', 'fishing_licenses', 'challenges', 'challenge_participants',
      'challenge_comments', 'challenge_templates', 'streaks', 'notifications', 'push_tokens',
      'messages', 'conversations', 'conversation_participants', 'conversation_messages',
      'personal_bests', 'weather_data', 'albums', 'album_photos', 'fishing_sessions',
      'session_kudos', 'session_comments', 'segments', 'segment_efforts', 'local_legends',
      'segment_leaderboards', 'catch_kudos', 'user_goals', 'tide_data', 'water_temperatures',
      'fishing_regulations', 'bait_effectiveness', 'conservation_scores', 'premium_subscriptions',
      'native_ads', 'ad_impressions', 'ad_clicks', 'ad_conversions', 'sponsored_spots',
      '_prisma_migrations'
    ];

    // Check which tables exist
    const tableStatus: Record<string, boolean> = {};
    const missingTables: string[] = [];
    const extraTables: string[] = [];

    for (const table of expectedTables) {
      const exists = existingTables.includes(table);
      tableStatus[table] = exists;
      if (!exists && table !== '_prisma_migrations') {
        missingTables.push(table);
      }
    }

    for (const table of existingTables) {
      if (!expectedTables.includes(table) && !table.startsWith('_')) {
        extraTables.push(table);
      }
    }

    // Count rows in key tables
    const tableCounts: Record<string, number> = {};
    try {
      tableCounts.users = await prisma.user.count();
      tableCounts.catches = await prisma.catch.count();
      tableCounts.species = await prisma.species.count();
      tableCounts.badges = await prisma.badge.count();
      tableCounts.challenges = await prisma.challenge.count();
      tableCounts.events = await prisma.event.count();
      tableCounts.notifications = await prisma.notification.count();
      tableCounts.segments = await prisma.segment.count();
    } catch (e) {
      // Some counts might fail if tables don't exist
    }

    return {
      success: true,
      summary: {
        expected: expectedTables.length - 1, // Exclude _prisma_migrations
        found: existingTables.filter(t => !t.startsWith('_')).length,
        missing: missingTables.length,
        extra: extraTables.length,
        percentComplete: ((expectedTables.length - 1 - missingTables.length) / (expectedTables.length - 1) * 100).toFixed(1) + '%'
      },
      tables: existingTables.filter(t => !t.startsWith('_')),
      missingTables,
      extraTables,
      tableStatus,
      tableCounts,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    };
  } catch (error) {
    reply.code(503);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Root endpoint
fastify.get('/', async () => {
  return {
    message: 'Hook API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        google: '/auth/google',
        facebook: '/auth/facebook',
        refresh: '/auth/refresh (POST)',
        logout: '/auth/logout (POST)',
      },
      users: {
        me: '/users/me (GET/PATCH)',
      },
    }
  };
});

// Start server
const start = async () => {
  try {
    // Initialize database (enable PostGIS)
    await initializeDatabase();

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

start();
