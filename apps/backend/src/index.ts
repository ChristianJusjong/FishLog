import { prisma } from "./lib/prisma";
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import path from 'path';
import * as fs from 'fs';
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
import { debugRoutes } from './routes/debug';
import { initializeDatabase } from './utils/init-db';
import { errorHandler } from './lib/errors';
import 'dotenv/config';

const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB limit for JSON bodies (to support base64 images)
});

// Global error handler
errorHandler(fastify);

// Security: Helmet - strict security headers
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for basic functionality
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.googleusercontent.com", "https://*.facebook.com"], // Whitelist image sources
      connectSrc: ["'self'", "https://accounts.google.com", "https://graph.facebook.com"], // Whitelist API connections
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Security: Rate limiting - prevent DDoS and brute force attacks
// TODO: Switch to Redis store for production: https://github.com/fastify/fastify-rate-limit
fastify.register(rateLimit, {
  max: 100, // Max 100 requests
  timeWindow: '1 minute', // per minute
  cache: 10000, // Cache 10k users
  allowList: [], // No whitelist
  // redis: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : undefined, // Ready for Redis upgrade
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
  ? [
      'https://fishlog-production.up.railway.app',
      'https://questline.dk',
      'https://www.questline.dk',
      'https://hookapp.dk',
      'https://www.hookapp.dk'
    ]
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
// Build copies public/ to dist/public/
const publicPath = path.join(__dirname, 'public');

if (fs.existsSync(publicPath)) {
  fastify.register(fastifyStatic, {
    root: publicPath,
    prefix: '/',
    wildcard: false,
  });
  console.log('Static files enabled from:', publicPath);

  // Dynamic root routing: Serve Hook landing on hookapp.dk and Questline Studios on questline.dk
  fastify.get('/', async (request, reply) => {
    const host = (request.headers.host || '').toLowerCase();
    if (host.includes('hookapp.dk')) {
      return reply.sendFile('hook.html');
    }
    return reply.sendFile('questline.html');
  });

  fastify.get('/hook', async (_request, reply) => {
    return reply.sendFile('hook.html');
  });

  fastify.get('/questline', async (_request, reply) => {
    return reply.sendFile('questline.html');
  });
} else {
  console.warn('Public directory not found at:', publicPath);
}

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
fastify.register(debugRoutes);

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

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { fastify };
