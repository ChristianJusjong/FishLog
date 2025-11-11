/**
 * API Version 1 Routes
 * All v1 endpoints are registered here
 */

import { FastifyInstance } from 'fastify';
import { authRoutes } from '../auth';
import { userRoutes } from '../users';
import { catchesRoutes } from '../catches';
import { friendsRoutes } from '../friends';
import { feedRoutes } from '../feed';
import { uploadRoutes } from '../upload';
import { eventsRoutes } from '../events';
import { spotsRoutes } from '../spots';
import { aiRoutes } from '../ai';
import { badgeRoutes } from '../badges';
import { adminRoutes } from '../admin';
import { clubsRoutes } from '../clubs';
import { groupsRoutes } from '../groups';

/**
 * Register all V1 API routes
 */
export async function registerV1Routes(fastify: FastifyInstance) {
  // Register all v1 routes
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(catchesRoutes);
  await fastify.register(friendsRoutes);
  await fastify.register(feedRoutes);
  await fastify.register(uploadRoutes);
  await fastify.register(eventsRoutes);
  await fastify.register(spotsRoutes);
  await fastify.register(aiRoutes);
  await fastify.register(badgeRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(clubsRoutes);
  await fastify.register(groupsRoutes);
}
