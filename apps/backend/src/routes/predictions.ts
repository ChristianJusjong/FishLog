import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth.js';
import { catchPredictionService } from '../services/catch-predictions.js';

export async function predictionsRoutes(fastify: FastifyInstance) {
  // Get catch predictions for current user
  fastify.get('/predictions', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Optional: User can provide their own Groq API key
      const userApiKey = request.headers['x-groq-api-key'] as string | undefined;

      const predictions = await catchPredictionService.generatePredictions(userId, userApiKey);

      return reply.send({
        success: true,
        predictions,
      });
    } catch (error: any) {
      fastify.log.error(error, 'Error generating predictions');
      return reply.status(500).send({
        error: error.message || 'Failed to generate predictions'
      });
    }
  });
}
