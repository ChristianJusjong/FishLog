import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth';


interface CreateTemplateBody {
  name: string;
  description?: string;
  type: string;
  duration: number;
  isPublic?: boolean;
  icon?: string;
}

export async function challengeTemplatesRoutes(fastify: FastifyInstance) {
  // Get all public challenge templates
  fastify.get('/challenge-templates', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templates = await prisma.challengeTemplate.findMany({
        where: { isPublic: true },
        orderBy: { name: 'asc' }
      });

      reply.code(200).send(templates);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente skabeloner' });
    }
  });

  // Get a specific template
  fastify.get('/challenge-templates/:id', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params;

      const template = await prisma.challengeTemplate.findUnique({
        where: { id }
      });

      if (!template) {
        return reply.code(404).send({ error: 'Skabelon ikke fundet' });
      }

      reply.code(200).send(template);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente skabelon' });
    }
  });

  // Create a challenge from a template
  fastify.post('/challenge-templates/:id/create', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id: templateId } = request.params;
      const { title, species, groupId, prize, participantIds } = request.body;

      // Get template
      const template = await prisma.challengeTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        return reply.code(404).send({ error: 'Skabelon ikke fundet' });
      }

      // Calculate dates
      const now = new Date();
      const startDate = now;
      const endDate = new Date(now.getTime() + template.duration * 24 * 60 * 60 * 1000);

      // Create challenge
      const challenge = await prisma.challenge.create({
        data: {
          ownerId: userId,
          groupId,
          title: title || template.name,
          description: template.description,
          type: template.type,
          species,
          startDate,
          endDate,
          isPublic: false,
          prize
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      // Auto-join the creator
      await prisma.challengeParticipant.create({
        data: {
          challengeId: challenge.id,
          userId,
          score: 0
        }
      });

      // Invite specified participants
      if (participantIds && participantIds.length > 0) {
        const participantsToCreate = participantIds
          .filter((id: string) => id !== userId)
          .map((id: string) => ({
            challengeId: challenge.id,
            userId: id,
            score: 0
          }));

        if (participantsToCreate.length > 0) {
          await prisma.challengeParticipant.createMany({
            data: participantsToCreate,
            skipDuplicates: true
          });

          // Create notifications for invited participants
          for (const participantId of participantIds) {
            if (participantId !== userId) {
              await prisma.notification.create({
                data: {
                  userId: participantId,
                  type: 'challenge_invite',
                  title: 'Invitation til udfordring',
                  message: `Du er blevet inviteret til udfordringen "${challenge.title}"`,
                  data: JSON.stringify({ challengeId: challenge.id })
                }
              });
            }
          }
        }
      }

      // Fetch the updated challenge with participants
      const updatedChallenge = await prisma.challenge.findUnique({
        where: { id: challenge.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      reply.code(201).send(updatedChallenge);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke oprette udfordring' });
    }
  });

  // Create a new template (admin only - can be extended later)
  fastify.post('/challenge-templates', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { name, description, type, duration, isPublic, icon } = request.body;

      if (!name || !type || !duration) {
        return reply.code(400).send({ error: 'Navn, type og varighed er påkrævet' });
      }

      const template = await prisma.challengeTemplate.create({
        data: {
          name,
          description,
          type,
          duration,
          isPublic: isPublic !== false,
          icon
        }
      });

      reply.code(201).send(template);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke oprette skabelon' });
    }
  });

  // Delete a template (admin only - can be extended later)
  fastify.delete('/challenge-templates/:id', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params;

      await prisma.challengeTemplate.delete({
        where: { id }
      });

      reply.code(200).send({ message: 'Skabelon slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette skabelon' });
    }
  });
}

// Seed some default templates
export async function seedChallengeTemplates() {
  const defaultTemplates = [
    {
      name: 'Weekend Warrior',
      description: 'Hvem kan fange flest fisk i en weekend?',
      type: 'most_catches',
      duration: 2,
      icon: '🎯',
      isPublic: true
    },
    {
      name: 'Ugens Kæmpe',
      description: 'Fang den største fisk denne uge',
      type: 'biggest_fish',
      duration: 7,
      icon: '🐋',
      isPublic: true
    },
    {
      name: 'Måneds Master',
      description: 'Hvem kan fange mest samlet vægt på en måned?',
      type: 'total_weight',
      duration: 30,
      icon: '⚖️',
      isPublic: true
    },
    {
      name: 'Artssamler',
      description: 'Fang flest forskellige arter i en uge',
      type: 'most_species',
      duration: 7,
      icon: '🐠',
      isPublic: true
    },
    {
      name: 'Hurtig Draw',
      description: 'Mest intens 24-timers udfordring',
      type: 'most_catches',
      duration: 1,
      icon: '⚡',
      isPublic: true
    }
  ];

  for (const template of defaultTemplates) {
    const existing = await prisma.challengeTemplate.findFirst({
      where: { name: template.name }
    });

    if (!existing) {
      await prisma.challengeTemplate.create({
        data: template
      });
    }
  }
}
