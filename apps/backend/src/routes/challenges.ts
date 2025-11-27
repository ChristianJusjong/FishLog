import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth';


interface CreateChallengeBody {
  groupId?: string;
  title: string;
  description?: string;
  type: string; // 'most_catches', 'biggest_fish', 'total_weight', 'most_species'
  species?: string;
  startDate: string;
  endDate: string;
  isPublic?: boolean;
  prize?: string;
  participantIds?: string[]; // User IDs to invite to the challenge
}

interface JoinChallengeBody {
  challengeId: string;
}

export async function challengesRoutes(fastify: FastifyInstance) {
  // Get all active challenges
  fastify.get('/challenges', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const now = new Date();

      const challenges = await prisma.challenge.findMany({
        where: {
          OR: [
            { isPublic: true },
            { ownerId: userId },
            {
              participants: {
                some: { userId }
              }
            }
          ],
          endDate: {
            gte: now
          }
        },
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
            },
            orderBy: {
              score: 'desc'
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      reply.code(200).send(challenges);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente udfordringer' });
    }
  });

  // Get a specific challenge with leaderboard
  fastify.get('/challenges/:id', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params;

      const challenge = await prisma.challenge.findUnique({
        where: { id },
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
            },
            orderBy: {
              score: 'desc'
            }
          }
        }
      });

      if (!challenge) {
        return reply.code(404).send({ error: 'Udfordring ikke fundet' });
      }

      reply.code(200).send(challenge);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke hente udfordring' });
    }
  });

  // Create a new challenge
  fastify.post('/challenges', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const {
        groupId,
        title,
        description,
        type,
        species,
        startDate,
        endDate,
        isPublic,
        prize,
        participantIds
      } = request.body;

      if (!title || !type || !startDate || !endDate) {
        return reply.code(400).send({
          error: 'Titel, type, startdato og slutdato er påkrævet'
        });
      }

      const challenge = await prisma.challenge.create({
        data: {
          ownerId: userId,
          groupId,
          title,
          description,
          type,
          species,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isPublic: isPublic || false,
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
          .filter((id: string) => id !== userId) // Don't add creator twice
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

  // Join a challenge
  fastify.post('/challenges/:id/join', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id: challengeId } = request.params;

      // Check if challenge exists and is active
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        return reply.code(404).send({ error: 'Udfordring ikke fundet' });
      }

      if (new Date() > challenge.endDate) {
        return reply.code(400).send({ error: 'Denne udfordring er afsluttet' });
      }

      // Check if already participating
      const existing = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        }
      });

      if (existing) {
        return reply.code(400).send({ error: 'Du deltager allerede i denne udfordring' });
      }

      const participant = await prisma.challengeParticipant.create({
        data: {
          challengeId,
          userId,
          score: 0
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

      reply.code(201).send(participant);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke deltage i udfordring' });
    }
  });

  // Update challenge scores (called when a catch is created/updated)
  fastify.post('/challenges/update-scores', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { catchId } = request.body;

      // Get the catch
      const catch_ = await prisma.catch.findUnique({
        where: { id: catchId }
      });

      if (!catch_ || catch_.userId !== userId) {
        return reply.code(404).send({ error: 'Fangst ikke fundet' });
      }

      const catchDate = catch_.createdAt;

      // Find all active challenges the user is participating in
      const participations = await prisma.challengeParticipant.findMany({
        where: {
          userId,
          challenge: {
            startDate: { lte: catchDate },
            endDate: { gte: catchDate }
          }
        },
        include: {
          challenge: true
        }
      });

      // Update scores for each challenge
      for (const participation of participations) {
        const challenge = participation.challenge;

        // Skip if species doesn't match
        if (challenge.species && catch_.species !== challenge.species) {
          continue;
        }

        // Calculate score based on challenge type
        let newScore = participation.score;

        switch (challenge.type) {
          case 'most_catches':
            // Count catches in the challenge period
            const catchCount = await prisma.catch.count({
              where: {
                userId,
                createdAt: {
                  gte: challenge.startDate,
                  lte: challenge.endDate
                },
                isDraft: false,
                ...(challenge.species && { species: challenge.species })
              }
            });
            newScore = catchCount;
            break;

          case 'biggest_fish':
            // Find biggest fish
            const biggestFish = await prisma.catch.findFirst({
              where: {
                userId,
                createdAt: {
                  gte: challenge.startDate,
                  lte: challenge.endDate
                },
                isDraft: false,
                lengthCm: { not: null },
                ...(challenge.species && { species: challenge.species })
              },
              orderBy: { lengthCm: 'desc' }
            });
            newScore = biggestFish?.lengthCm || 0;
            break;

          case 'total_weight':
            // Sum all weights
            const catches = await prisma.catch.findMany({
              where: {
                userId,
                createdAt: {
                  gte: challenge.startDate,
                  lte: challenge.endDate
                },
                isDraft: false,
                weightKg: { not: null },
                ...(challenge.species && { species: challenge.species })
              }
            });
            newScore = catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
            break;

          case 'most_species':
            // Count distinct species
            const distinctSpecies = await prisma.catch.findMany({
              where: {
                userId,
                createdAt: {
                  gte: challenge.startDate,
                  lte: challenge.endDate
                },
                isDraft: false,
                species: { not: null }
              },
              distinct: ['species']
            });
            newScore = distinctSpecies.length;
            break;
        }

        // Update score
        await prisma.challengeParticipant.update({
          where: {
            challengeId_userId: {
              challengeId: challenge.id,
              userId
            }
          },
          data: { score: newScore }
        });
      }

      // Update rankings
      for (const participation of participations) {
        await updateChallengeRankings(participation.challenge.id);
      }

      reply.code(200).send({ message: 'Scores opdateret' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke opdatere scores' });
    }
  });

  // Delete a challenge (owner only)
  fastify.delete('/challenges/:id', {
    preHandler: authenticateToken
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const challenge = await prisma.challenge.findUnique({
        where: { id }
      });

      if (!challenge) {
        return reply.code(404).send({ error: 'Udfordring ikke fundet' });
      }

      if (challenge.ownerId !== userId) {
        return reply.code(403).send({ error: 'Kun ejeren kan slette denne udfordring' });
      }

      await prisma.challenge.delete({
        where: { id }
      });

      reply.code(200).send({ message: 'Udfordring slettet' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Kunne ikke slette udfordring' });
    }
  });
}

// Helper function to update rankings
async function updateChallengeRankings(challengeId: string) {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: { score: 'desc' }
  });

  for (let i = 0; i < participants.length; i++) {
    await prisma.challengeParticipant.update({
      where: { id: participants[i].id },
      data: { rank: i + 1 }
    });
  }
}
