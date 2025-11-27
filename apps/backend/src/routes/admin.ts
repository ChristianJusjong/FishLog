import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';


// Admin middleware - checks if user has admin role
// TODO: Add admin role to User model and check here
// For now, we'll allow authenticated users to access admin routes
const requireAdmin = async (request: any, reply: any) => {
  // In production, check if user has admin role:
  // const user = await prisma.user.findUnique({ where: { id: request.user.userId }});
  // if (!user || user.role !== 'admin') {
  //   return reply.code(403).send({ error: 'Admin access required' });
  // }
};

export async function adminRoutes(fastify: FastifyInstance) {
  // GET /admin/contest-catches?contestId=xyz
  // Get all catches for a contest with metadata for validation
  fastify.get('/admin/contest-catches', {
    preHandler: [authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { contestId } = request.query as { contestId?: string };

      if (!contestId) {
        return reply.code(400).send({ error: 'contestId query parameter is required' });
      }

      // Verify contest exists
      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
          event: true
        }
      });

      if (!contest) {
        return reply.code(404).send({ error: 'Contest not found' });
      }

      // Get all participants of the event
      const participants = await prisma.eventParticipant.findMany({
        where: { eventId: contest.eventId },
        select: { userId: true }
      });

      const participantIds = participants.map(p => p.userId);

      // Get catches from participants within the event timeframe
      const catches = await prisma.catch.findMany({
        where: {
          userId: { in: participantIds },
          isDraft: false,
          createdAt: {
            gte: contest.event.startAt,
            lte: contest.event.endAt
          },
          // Filter by species if contest has species filter
          ...(contest.speciesFilter && { species: contest.speciesFilter })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          validations: {
            orderBy: {
              validatedAt: 'desc'
            },
            take: 1,
            include: {
              validator: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          likes: {
            select: {
              id: true,
              userId: true
            }
          },
          comments: {
            select: {
              id: true,
              userId: true,
              text: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Fetch location data for each catch
      const catchesWithMetadata = await Promise.all(
        catches.map(async (catch_) => {
          const locationResult = await prisma.$queryRaw<Array<{latitude: number, longitude: number}>>`
            SELECT ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
            FROM catches
            WHERE id = ${catch_.id} AND location IS NOT NULL
          `;

          const latestValidation = catch_.validations[0] || null;

          // Parse EXIF data
          let exifData = null;
          if (catch_.exifData) {
            try {
              exifData = JSON.parse(catch_.exifData);
            } catch (e) {
              console.error('Failed to parse EXIF data:', e);
            }
          }

          return {
            id: catch_.id,
            user: catch_.user,
            species: catch_.species,
            lengthCm: catch_.lengthCm,
            weightKg: catch_.weightKg,
            bait: catch_.bait,
            lure: catch_.lure,
            rig: catch_.rig,
            technique: catch_.technique,
            notes: catch_.notes,
            photoUrl: catch_.photoUrl,
            latitude: locationResult[0]?.latitude || catch_.latitude,
            longitude: locationResult[0]?.longitude || catch_.longitude,
            createdAt: catch_.createdAt,
            updatedAt: catch_.updatedAt,
            // Metadata for validation
            metadata: {
              likeCount: catch_.likes.length,
              commentCount: catch_.comments.length,
              photoMetadata: {
                url: catch_.photoUrl,
                hash: catch_.photoHash,
                exif: exifData,
                gps: {
                  claimed: {
                    latitude: catch_.latitude,
                    longitude: catch_.longitude
                  },
                  exif: exifData?.gps || null
                },
                timestamp: {
                  claimed: catch_.createdAt,
                  exif: exifData?.timestamp || null
                },
                device: exifData?.device || null,
                camera: exifData?.camera || null,
                dimensions: exifData?.dimensions || null
              }
            },
            // Validation status
            validation: latestValidation ? {
              status: latestValidation.status,
              reason: latestValidation.reason,
              validatedAt: latestValidation.validatedAt,
              validatedBy: latestValidation.validator
            } : null
          };
        })
      );

      return {
        contest: {
          id: contest.id,
          eventId: contest.eventId,
          rule: contest.rule,
          speciesFilter: contest.speciesFilter,
          event: {
            title: contest.event.title,
            startAt: contest.event.startAt,
            endAt: contest.event.endAt
          }
        },
        catches: catchesWithMetadata,
        total: catchesWithMetadata.length
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch contest catches' });
    }
  });

  // POST /admin/contest-catches/:id/validate
  // Validate a catch (approve or reject)
  fastify.post('/admin/contest-catches/:id/validate', {
    preHandler: [authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, reason } = request.body as {
        status: 'approved' | 'rejected';
        reason?: string
      };

      // Validate input
      if (!status || !['approved', 'rejected'].includes(status)) {
        return reply.code(400).send({
          error: 'Invalid status. Must be "approved" or "rejected"'
        });
      }

      if (status === 'rejected' && !reason) {
        return reply.code(400).send({
          error: 'Reason is required when rejecting a catch'
        });
      }

      // Verify catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Create validation record
      const validation = await prisma.catchValidation.create({
        data: {
          catchId: id,
          validatorId: request.user!.userId,
          status,
          reason: reason || null
        },
        include: {
          validator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          catch: {
            select: {
              id: true,
              species: true,
              weightKg: true,
              lengthCm: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return reply.code(201).send({
        message: `Catch ${status} successfully`,
        validation: {
          id: validation.id,
          status: validation.status,
          reason: validation.reason,
          validatedAt: validation.validatedAt,
          validator: validation.validator,
          catch: validation.catch
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to validate catch' });
    }
  });

  // GET /admin/contest-catches/:id/validation-history
  // Get validation history for a catch
  fastify.get('/admin/contest-catches/:id/validation-history', {
    preHandler: [authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const validations = await prisma.catchValidation.findMany({
        where: { catchId: id },
        include: {
          validator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          validatedAt: 'desc'
        }
      });

      return {
        catchId: id,
        validations
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch validation history' });
    }
  });
}
