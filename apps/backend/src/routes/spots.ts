/**
 * Spots API Routes - DEPRECATED
 *
 * All spots functionality has been merged into Hot Spots.
 * These routes provide backward compatibility by redirecting to the Hot Spots API.
 * New features should use /hot-spots endpoints.
 */

import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';

export async function spotsRoutes(fastify: FastifyInstance) {
  // Add deprecation header to all spots responses
  const addDeprecationHeader = (reply: any) => {
    reply.header('X-Deprecated', 'Use /hot-spots endpoints instead');
    reply.header('X-Redirect-To', '/hot-spots');
  };

  // Get heatmap data -> redirects to hot-spots heatmap
  fastify.get('/spots/heatmap', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const query = request.query as { species?: string; season?: string; gridSize?: string };
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    return reply.redirect(307, `/hot-spots/heatmap${queryString ? '?' + queryString : ''}`);
  });

  // Get top spots -> redirects to hot-spots top
  fastify.get('/spots/top', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const query = request.query as { species?: string; limit?: string };
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    return reply.redirect(307, `/hot-spots/top${queryString ? '?' + queryString : ''}`);
  });

  // Get area stats -> redirects to hot-spots area-stats
  fastify.get('/spots/area-stats', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const query = request.query as { lat?: string; lng?: string; radius?: string };
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    return reply.redirect(307, `/hot-spots/area-stats${queryString ? '?' + queryString : ''}`);
  });

  // Deprecation notice endpoint
  fastify.get('/spots/deprecation-notice', async (request, reply) => {
    return {
      deprecated: true,
      message: 'The /spots API is deprecated. Please use /hot-spots API instead.',
      migration: {
        '/spots/heatmap': '/hot-spots/heatmap',
        '/spots/top': '/hot-spots/top',
        '/spots/area-stats': '/hot-spots/area-stats',
      },
      documentation: 'Hot Spots API provides all spots functionality plus my-favorites, discover, leaderboard, and detailed location stats.'
    };
  });
}
