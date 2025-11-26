import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import path from 'path';
import { PrismaClient } from '@prisma/client';
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
import 'dotenv/config';

const prisma = new PrismaClient();
const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB limit for JSON bodies (to support base64 images)
});

// Security: Helmet - adds security headers
fastify.register(helmet, {
  contentSecurityPolicy: false, // Disabled for API
  crossOriginEmbedderPolicy: false,
});

// Security: Rate limiting - prevent DDoS and brute force attacks
fastify.register(rateLimit, {
  max: 100, // Max 100 requests
  timeWindow: '15 minutes', // per 15 minutes
  cache: 10000, // Cache 10k users
  allowList: [], // No whitelist
  redis: undefined, // Use in-memory for now, switch to Redis in production for multi-server
  skipOnError: true, // Don't block on rate limiter errors
});

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
    console.log(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

start();
