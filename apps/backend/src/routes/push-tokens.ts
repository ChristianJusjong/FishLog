import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth.js';
import { pushNotificationService } from '../services/push-notifications.js';

export async function pushTokenRoutes(fastify: FastifyInstance) {
  // Register push token
  fastify.post('/push-tokens', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { token, device } = request.body as { token: string; device?: string };

      if (!token) {
        return reply.status(400).send({ error: 'token is required' });
      }

      const pushToken = await pushNotificationService.registerToken(userId, token, device);

      return reply.send({
        success: true,
        pushToken,
      });
    } catch (error: any) {
      fastify.log.error('Error registering push token:', error);
      return reply.status(400).send({ error: error.message || 'Failed to register push token' });
    }
  });

  // Unregister push token
  fastify.delete('/push-tokens/:token', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { token } = request.params as { token: string };

      await pushNotificationService.unregisterToken(token);

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Error unregistering push token:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
