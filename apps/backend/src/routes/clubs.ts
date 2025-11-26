/**
 * Clubs API Routes - DEPRECATED
 *
 * All club functionality has been merged into Groups.
 * These routes provide backward compatibility by redirecting to the Groups API.
 * New features should use /groups endpoints.
 */

import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';

export async function clubsRoutes(fastify: FastifyInstance) {
  // Add deprecation header to all club responses
  const addDeprecationHeader = (reply: any) => {
    reply.header('X-Deprecated', 'Use /groups endpoints instead');
    reply.header('X-Redirect-To', '/groups');
  };

  // Create a new club -> redirects to create group
  fastify.post('/clubs', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    return reply.code(307).redirect('/groups');
  });

  // Get all clubs (user's clubs) -> redirects to get my groups
  fastify.get('/clubs', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    return reply.code(307).redirect('/groups/my-groups');
  });

  // Get club by ID -> redirects to get group by ID
  fastify.get('/clubs/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { id } = request.params as { id: string };
    return reply.code(307).redirect(`/groups/${id}`);
  });

  // Join a club -> redirects to join group
  fastify.post('/clubs/:id/join', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { id } = request.params as { id: string };
    return reply.code(307).redirect(`/groups/${id}/join`);
  });

  // Get club messages -> redirects to get group messages
  fastify.get('/clubs/:id/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; before?: string };
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    return reply.code(307).redirect(`/groups/${id}/messages${queryString ? '?' + queryString : ''}`);
  });

  // Send a message -> redirects to send group message
  fastify.post('/clubs/:id/messages', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { id } = request.params as { id: string };
    return reply.code(307).redirect(`/groups/${id}/messages`);
  });

  // Get new messages since timestamp (for polling) -> redirects to group poll
  fastify.get('/clubs/:id/messages/poll', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { id } = request.params as { id: string };
    const { since } = request.query as { since: string };
    return reply.code(307).redirect(`/groups/${id}/messages/poll?since=${encodeURIComponent(since)}`);
  });

  // Delete a message -> redirects to delete group message
  fastify.delete('/clubs/:clubId/messages/:messageId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    addDeprecationHeader(reply);
    const { clubId, messageId } = request.params as { clubId: string; messageId: string };
    return reply.code(307).redirect(`/groups/${clubId}/messages/${messageId}`);
  });

  // Deprecation notice endpoint
  fastify.get('/clubs/deprecation-notice', async (request, reply) => {
    return {
      deprecated: true,
      message: 'The /clubs API is deprecated. Please use /groups API instead.',
      migration: {
        '/clubs': '/groups/my-groups',
        '/clubs/:id': '/groups/:id',
        '/clubs/:id/join': '/groups/:id/join',
        '/clubs/:id/messages': '/groups/:id/messages',
        'POST /clubs': 'POST /groups',
      },
      documentation: 'Groups API provides all club functionality plus posts, membership requests, and admin features.'
    };
  });
}
