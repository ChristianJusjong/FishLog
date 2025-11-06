import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
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
import { initializeDatabase } from './utils/init-db';
import 'dotenv/config';

const prisma = new PrismaClient();
const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB limit for JSON bodies (to support base64 images)
});

// CORS configuration
fastify.register(cors, {
  origin: true, // Allow all origins in development
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
