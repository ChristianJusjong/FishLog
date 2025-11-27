import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


export async function eventsRoutes(fastify: FastifyInstance) {
  // Get all events (filtered by visibility and time)
  fastify.get('/events', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { status } = request.query as { status?: 'upcoming' | 'ongoing' | 'past' };

      const now = new Date();
      let whereClause: any = {
        OR: [
          { visibility: 'public' },
          { ownerId: request.user.userId },
        ],
      };

      // Filter by status
      if (status === 'upcoming') {
        whereClause.startAt = { gt: now };
      } else if (status === 'ongoing') {
        whereClause.AND = [
          { startAt: { lte: now } },
          { endAt: { gte: now } },
        ];
      } else if (status === 'past') {
        whereClause.endAt = { lt: now };
      }

      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          contests: true,
          participants: {
            select: {
              id: true,
              userId: true,
              joinedAt: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          startAt: 'asc',
        },
      });

      // Check if current user is participating in each event
      const eventsWithParticipation = events.map(event => ({
        ...event,
        isParticipating: event.participants.some(p => p.userId === request.user!.userId),
        participantCount: event._count.participants,
      }));

      return eventsWithParticipation;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch events' });
    }
  });

  // Get single event by ID
  fastify.get('/events/:id', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          contests: true,
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        return reply.code(404).send({ error: 'Event not found' });
      }

      // Check if user has access
      if (event.visibility === 'private' && event.ownerId !== request.user.userId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const isParticipating = event.participants.some(p => p.userId === request.user!.userId);

      return {
        ...event,
        isParticipating,
        participantCount: event.participants.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch event' });
    }
  });

  // Create new event
  fastify.post('/events', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const {
        title,
        description,
        startAt,
        endAt,
        venue,
        visibility,
        contests,
      } = request.body as {
        title: string;
        description?: string;
        startAt: string;
        endAt: string;
        venue?: string;
        visibility?: 'private' | 'friends' | 'public';
        contests?: Array<{
          rule: 'biggest_total' | 'biggest_single' | 'most_catches';
          speciesFilter?: string;
        }>;
      };

      if (!title || !startAt || !endAt) {
        return reply.code(400).send({ error: 'Title, start time, and end time are required' });
      }

      const startDate = new Date(startAt);
      const endDate = new Date(endAt);

      if (startDate >= endDate) {
        return reply.code(400).send({ error: 'Start time must be before end time' });
      }

      const event = await prisma.event.create({
        data: {
          ownerId: request.user.userId,
          title,
          description,
          startAt: startDate,
          endAt: endDate,
          venue,
          visibility: visibility || 'public',
          contests: contests ? {
            create: contests,
          } : undefined,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          contests: true,
        },
      });

      return event;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create event' });
    }
  });

  // Join an event
  fastify.post('/events/:id/join', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        return reply.code(404).send({ error: 'Event not found' });
      }

      // Check if user has access
      if (event.visibility === 'private' && event.ownerId !== request.user.userId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      // Check if already participating
      const existingParticipation = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: request.user.userId,
          },
        },
      });

      if (existingParticipation) {
        return reply.code(400).send({ error: 'Already participating in this event' });
      }

      const participation = await prisma.eventParticipant.create({
        data: {
          eventId: id,
          userId: request.user.userId,
        },
      });

      return participation;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to join event' });
    }
  });

  // Leave an event
  fastify.delete('/events/:id/join', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };

      await prisma.eventParticipant.delete({
        where: {
          eventId_userId: {
            eventId: id,
            userId: request.user.userId,
          },
        },
      });

      return { message: 'Left event successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to leave event' });
    }
  });

  // Get event leaderboard (only approved catches)
  fastify.get('/events/:id/leaderboard', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          contests: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!event) {
        return reply.code(404).send({ error: 'Event not found' });
      }

      // Check if user has access
      if (event.visibility === 'private' && event.ownerId !== request.user.userId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      // Get all catches from participants during the event period
      const participantIds = event.participants.map(p => p.userId);

      const catches = await prisma.catch.findMany({
        where: {
          userId: { in: participantIds },
          isDraft: false,
          createdAt: {
            gte: event.startAt,
            lte: event.endAt,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          validations: {
            where: {
              status: 'approved'
            },
            orderBy: {
              validatedAt: 'desc'
            },
            take: 1
          }
        },
      });

      // Filter to only approved catches
      const approvedCatches = catches.filter(c => c.validations.length > 0);

      // Calculate leaderboards for each contest
      const leaderboards = event.contests.map(contest => {
        let filteredCatches = approvedCatches;

        // Filter by species if specified
        if (contest.speciesFilter) {
          filteredCatches = approvedCatches.filter(c => c.species === contest.speciesFilter);
        }

        // Group catches by user
        const userCatches = filteredCatches.reduce((acc, catch_) => {
          if (!acc[catch_.userId]) {
            acc[catch_.userId] = {
              user: catch_.user,
              catches: [],
            };
          }
          acc[catch_.userId].catches.push(catch_);
          return acc;
        }, {} as Record<string, { user: any; catches: any[] }>);

        // Calculate scores based on contest rule
        const scores = Object.entries(userCatches).map(([_userId, data]) => {
          let score = 0;
          let details = '';

          if (contest.rule === 'biggest_single') {
            const biggest = Math.max(...data.catches.map(c => c.weightKg || 0));
            score = biggest;
            details = `${(biggest * 1000).toFixed(0)}g`;
          } else if (contest.rule === 'biggest_total') {
            const total = data.catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
            score = total;
            details = `${(total * 1000).toFixed(0)}g total`;
          } else if (contest.rule === 'most_catches') {
            score = data.catches.length;
            details = `${score} fangster`;
          }

          return {
            user: data.user,
            score,
            details,
            catchCount: data.catches.length,
          };
        });

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Add rank
        const rankedScores = scores.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        return {
          contest,
          leaderboard: rankedScores.slice(0, 10), // Top 10 only
        };
      });

      return {
        event: {
          id: event.id,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
        },
        leaderboards,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get contest-specific leaderboard
  fastify.get('/contests/:id/leaderboard', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };

      const contest = await prisma.contest.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              participants: {
                select: {
                  userId: true
                }
              }
            }
          }
        }
      });

      if (!contest) {
        return reply.code(404).send({ error: 'Contest not found' });
      }

      const event = contest.event;

      // Check if user has access
      if (event.visibility === 'private' && event.ownerId !== request.user.userId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      // Get participant IDs
      const participantIds = event.participants.map(p => p.userId);

      // Get approved catches from participants during the event period
      const catches = await prisma.catch.findMany({
        where: {
          userId: { in: participantIds },
          isDraft: false,
          createdAt: {
            gte: event.startAt,
            lte: event.endAt,
          },
          ...(contest.speciesFilter && { species: contest.speciesFilter })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          validations: {
            where: {
              status: 'approved'
            },
            orderBy: {
              validatedAt: 'desc'
            },
            take: 1,
            include: {
              validator: {
                select: {
                  name: true
                }
              }
            }
          }
        },
      });

      // Filter to only approved catches
      const approvedCatches = catches.filter(c => c.validations.length > 0);

      // Group catches by user
      const userCatches = approvedCatches.reduce((acc, catch_) => {
        if (!acc[catch_.userId]) {
          acc[catch_.userId] = {
            user: catch_.user,
            catches: [],
          };
        }
        acc[catch_.userId].catches.push(catch_);
        return acc;
      }, {} as Record<string, { user: any; catches: any[] }>);

      // Calculate scores based on contest rule
      const scores = Object.entries(userCatches).map(([_userId, data]) => {
        let score = 0;
        let details = '';
        let bestCatch = null;

        if (contest.rule === 'biggest_single') {
          bestCatch = data.catches.reduce((max, c) =>
            (c.weightKg || 0) > (max.weightKg || 0) ? c : max
          , data.catches[0]);
          score = bestCatch.weightKg || 0;
          details = `${(score * 1000).toFixed(0)}g`;
        } else if (contest.rule === 'biggest_total') {
          const total = data.catches.reduce((sum, c) => sum + (c.weightKg || 0), 0);
          score = total;
          details = `${(total * 1000).toFixed(0)}g total`;
          bestCatch = data.catches[0]; // Most recent
        } else if (contest.rule === 'most_catches') {
          score = data.catches.length;
          details = `${score} fangster`;
          bestCatch = data.catches[0]; // Most recent
        }

        return {
          user: data.user,
          score,
          details,
          catchCount: data.catches.length,
          bestCatch: bestCatch ? {
            id: bestCatch.id,
            species: bestCatch.species,
            weightKg: bestCatch.weightKg,
            lengthCm: bestCatch.lengthCm,
            photoUrl: bestCatch.photoUrl,
            createdAt: bestCatch.createdAt,
            validatedAt: bestCatch.validations[0]?.validatedAt
          } : null
        };
      });

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Add rank
      const leaderboard = scores.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      return {
        contest: {
          id: contest.id,
          rule: contest.rule,
          speciesFilter: contest.speciesFilter
        },
        event: {
          id: event.id,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
        },
        leaderboard: leaderboard.slice(0, 10), // Top 10
        totalParticipants: participantIds.length,
        totalApprovedCatches: approvedCatches.length
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch contest leaderboard' });
    }
  });

  // Get live updates for contest (recent approved catches)
  fastify.get('/contests/:id/live-updates', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const { since } = request.query as { since?: string };

      const contest = await prisma.contest.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              participants: {
                select: {
                  userId: true
                }
              }
            }
          }
        }
      });

      if (!contest) {
        return reply.code(404).send({ error: 'Contest not found' });
      }

      const event = contest.event;

      // Check if user has access
      if (event.visibility === 'private' && event.ownerId !== request.user.userId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const participantIds = event.participants.map(p => p.userId);

      // Get recently approved catches
      const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

      const recentValidations = await prisma.catchValidation.findMany({
        where: {
          status: 'approved',
          validatedAt: {
            gte: sinceDate
          },
          catch: {
            userId: { in: participantIds },
            createdAt: {
              gte: event.startAt,
              lte: event.endAt,
            },
            isDraft: false,
            ...(contest.speciesFilter && { species: contest.speciesFilter })
          }
        },
        include: {
          catch: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          },
          validator: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          validatedAt: 'desc'
        },
        take: 20
      });

      const updates = recentValidations.map(validation => ({
        type: 'catch_approved',
        timestamp: validation.validatedAt,
        catch: {
          id: validation.catch.id,
          user: validation.catch.user,
          species: validation.catch.species,
          weightKg: validation.catch.weightKg,
          lengthCm: validation.catch.lengthCm,
          photoUrl: validation.catch.photoUrl,
          createdAt: validation.catch.createdAt
        },
        validatedBy: validation.validator.name
      }));

      return {
        contestId: contest.id,
        updates,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch live updates' });
    }
  });
}
