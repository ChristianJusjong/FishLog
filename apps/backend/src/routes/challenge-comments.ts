import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth';


interface CreateCommentBody {
  challengeId: string;
  text: string;
}

export async function challengeCommentsRoutes(fastify: FastifyInstance) {
  // Get comments for a challenge
  fastify.get('/challenges/:challengeId/comments', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { challengeId } = request.params;

      const comments = await prisma.challengeComment.findMany({
        where: { challengeId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      reply.code(200).send(comments);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente kommentarer' });
    }
  });

  // Create a comment on a challenge
  fastify.post('/challenges/:challengeId/comments', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { challengeId } = request.params;
      const { text } = request.body;

      if (!text || text.trim().length === 0) {
        return reply.code(400).send({ error: 'Kommentar tekst er påkrævet' });
      }

      // Verify the challenge exists
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        return reply.code(404).send({ error: 'Udfordring ikke fundet' });
      }

      // Verify user is a participant or owner
      const isParticipant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        }
      });

      if (!isParticipant && challenge.ownerId !== userId) {
        return reply.code(403).send({ error: 'Du skal være deltager for at kommentere' });
      }

      const comment = await prisma.challengeComment.create({
        data: {
          challengeId,
          userId,
          text
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      reply.code(201).send(comment);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke oprette kommentar' });
    }
  });

  // Delete a comment (owner only)
  fastify.delete('/challenges/:challengeId/comments/:commentId', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { commentId } = request.params;

      const comment = await prisma.challengeComment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        return reply.code(404).send({ error: 'Kommentar ikke fundet' });
      }

      if (comment.userId !== userId) {
        return reply.code(403).send({ error: 'Kun ejeren kan slette denne kommentar' });
      }

      await prisma.challengeComment.delete({
        where: { id: commentId }
      });

      reply.code(200).send({ message: 'Kommentar slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette kommentar' });
    }
  });
}
