import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { badgeService } from '../services/badgeService.js';
import { awardCatchXP } from '../services/xp-service.js';
import { startCatchSchema, updateCatchSchema, safeValidate } from '../utils/validation';


export async function catchesRoutes(fastify: FastifyInstance) {
  // Start a new catch with photo and GPS only (camera-first flow)
  fastify.post('/catches/start', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      // Validate input
      const validation = safeValidate(startCatchSchema, request.body);
      if (!validation.success) {
        const errors = validation.errors;
        return reply.code(400).send({ error: 'Validation failed', details: errors });
      }

      const { photoUrl, latitude, longitude, exifData, photoHash } = validation.data;

      const catch_ = await prisma.catch.create({
        data: {
          userId: request.user!.userId,
          photoUrl,
          latitude,
          longitude,
          exifData: exifData ? JSON.stringify(exifData) : null,
          photoHash: photoHash || null,
          isDraft: true,
          visibility: 'private',
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

      return reply.code(201).send(catch_);
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to start catch', details: errorMessage });
    }
  });

  // Create a new catch (legacy endpoint - kept for compatibility)
  fastify.post('/catches', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const {
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        latitude,
        longitude,
        photoUrl,
        visibility,
        isDraft
      } = request.body as {
        species?: string;
        lengthCm?: number;
        weightKg?: number;
        bait?: string;
        rig?: string;
        technique?: string;
        notes?: string;
        latitude?: number;
        longitude?: number;
        photoUrl?: string;
        visibility?: string;
        isDraft?: boolean;
      };

      // For draft catches, species is optional
      // For completed catches, species is required
      if (!isDraft && !species) {
        return reply.code(400).send({ error: 'Species is required for completed catches' });
      }

      const catchData: any = {
        userId: request.user!.userId,
        species,
        lengthCm,
        weightKg,
        bait,
        rig,
        technique,
        notes,
        photoUrl,
        latitude,
        longitude,
        visibility: visibility || 'private',
        isDraft: isDraft !== undefined ? isDraft : false,
      };

      // Create catch with Prisma
      const catch_ = await prisma.catch.create({
        data: catchData,
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

      // Check and award badges
      const newBadges = await badgeService.checkAndAwardBadges(request.user!.userId, catch_);

      return reply.code(201).send({
        catch: catch_,
        badges: newBadges.length > 0 ? newBadges : undefined
      });
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to create catch', details: errorMessage });
    }
  });

  // Get catches for current user or specific user
  fastify.get('/catches', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { userId, includeDrafts } = request.query as { userId?: string; includeDrafts?: string };

      const targetUserId = userId === 'me' || !userId ? request.user!.userId : userId;

      const catches = await prisma.catch.findMany({
        where: {
          userId: targetUserId,
          // Exclude drafts by default unless specifically requested
          ...(includeDrafts !== 'true' && { isDraft: false }),
        },
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
          createdAt: 'desc'
        }
      });

      // Return catches with latitude/longitude from the regular columns
      return catches;
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to fetch catches', details: errorMessage });
    }
  });

  // Get single catch
  fastify.get('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id },
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

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Return catch with latitude/longitude from the regular columns
      return catch_;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch catch' });
    }
  });

  // Update catch (excluding locked fields: photo, GPS)
  fastify.put('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Validate input
      const validation = safeValidate(updateCatchSchema, request.body);
      if (!validation.success) {
        const errors = validation.errors;
        return reply.code(400).send({ error: 'Validation failed', details: errors });
      }

      const {
        species,
        lengthCm,
        weightKg,
        bait,
        lure,
        rig,
        technique,
        notes,
        visibility
      } = validation.data;

      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      if (catch_.userId !== request.user!.userId) {
        return reply.code(403).send({ error: 'Not authorized to update this catch' });
      }

      // Only allow updating these fields - photoUrl, latitude, longitude are LOCKED
      const updateData: any = {
        species,
        lengthCm,
        weightKg,
        bait,
        lure,
        rig,
        technique,
        notes,
        visibility,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Update catch
      const updatedCatch = await prisma.catch.update({
        where: { id },
        data: updateData,
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

      return updatedCatch;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update catch' });
    }
  });

  // Complete a draft catch (mark as finished)
  fastify.patch('/catches/:id/complete', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      if (catch_.userId !== request.user!.userId) {
        return reply.code(403).send({ error: 'Not authorized to update this catch' });
      }

      // Validate species is filled before completing
      if (!catch_.species) {
        return reply.code(400).send({ error: 'Species is required to complete catch' });
      }

      // Mark as complete
      const completedCatch = await prisma.catch.update({
        where: { id },
        data: { isDraft: false },
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

      // Check and award badges for completed catch
      const newBadges = await badgeService.checkAndAwardBadges(request.user!.userId, completedCatch);

      // Award XP for the catch
      const xpResult = await awardCatchXP(request.user!.userId, {
        species: completedCatch.species,
        weightKg: completedCatch.weightKg,
        released: completedCatch.isReleased || false,
      });

      // Update or create FiskeDex entry
      let fiskedexUnlock = null;
      if (completedCatch.species) {
        try {
          // Find the species in the database
          const speciesRecord = await prisma.species.findUnique({
            where: { name: completedCatch.species }
          });

          if (speciesRecord) {
            // Check if user already has this species
            const existingEntry = await prisma.fiskeDexEntry.findUnique({
              where: {
                userId_speciesId: {
                  userId: request.user!.userId,
                  speciesId: speciesRecord.id
                }
              }
            });

            if (!existingEntry) {
              // First time catching this species - unlock it!
              fiskedexUnlock = await prisma.fiskeDexEntry.create({
                data: {
                  userId: request.user!.userId,
                  speciesId: speciesRecord.id,
                  unlockPhotoUrl: completedCatch.photoUrl,
                  firstCaughtAt: completedCatch.createdAt,
                  catchCount: 1,
                  largestLengthCm: completedCatch.lengthCm,
                  heaviestWeightKg: completedCatch.weightKg,
                },
                include: {
                  species: true
                }
              });
            } else {
              // Update existing entry with new stats
              await prisma.fiskeDexEntry.update({
                where: { id: existingEntry.id },
                data: {
                  catchCount: { increment: 1 },
                  largestLengthCm: completedCatch.lengthCm && (!existingEntry.largestLengthCm || completedCatch.lengthCm > existingEntry.largestLengthCm)
                    ? completedCatch.lengthCm
                    : existingEntry.largestLengthCm,
                  heaviestWeightKg: completedCatch.weightKg && (!existingEntry.heaviestWeightKg || completedCatch.weightKg > existingEntry.heaviestWeightKg)
                    ? completedCatch.weightKg
                    : existingEntry.heaviestWeightKg,
                }
              });
            }
          }
        } catch (error) {
          fastify.log.error(error);
          // Don't fail the whole request if FiskeDex update fails
        }
      }

      return reply.send({
        catch: completedCatch,
        badges: newBadges.length > 0 ? newBadges : undefined,
        xp: xpResult,
        fiskedexUnlock: fiskedexUnlock ? {
          species: fiskedexUnlock.species.name,
          rarity: fiskedexUnlock.species.rarity,
          description: fiskedexUnlock.species.description,
        } : undefined,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to complete catch' });
    }
  });

  // Get draft catches for current user
  fastify.get('/catches/drafts', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const drafts = await prisma.catch.findMany({
        where: {
          userId: request.user!.userId,
          isDraft: true
        },
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
          createdAt: 'desc'
        }
      });

      return drafts;
    } catch (error) {
      fastify.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ error: 'Failed to fetch drafts', details: errorMessage });
    }
  });

  // Delete catch
  fastify.delete('/catches/:id', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      if (catch_.userId !== request.user!.userId) {
        return reply.code(403).send({ error: 'Not authorized to delete this catch' });
      }

      await prisma.catch.delete({
        where: { id }
      });

      return { message: 'Catch deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete catch' });
    }
  });

  // Like a catch
  fastify.post('/catches/:id/like', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.userId;

      // Check if catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      if (existingLike) {
        return reply.code(400).send({ error: 'Already liked this catch' });
      }

      // Create like
      const like = await prisma.like.create({
        data: {
          userId,
          catchId: id
        }
      });

      return reply.code(201).send(like);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to like catch' });
    }
  });

  // Unlike a catch
  fastify.delete('/catches/:id/like', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.userId;

      // Find and delete like
      const like = await prisma.like.findUnique({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      if (!like) {
        return reply.code(404).send({ error: 'Like not found' });
      }

      await prisma.like.delete({
        where: {
          userId_catchId: {
            userId,
            catchId: id
          }
        }
      });

      return { message: 'Like removed successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to unlike catch' });
    }
  });

  // Add comment to catch
  fastify.post('/catches/:id/comments', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { text } = request.body as { text: string };
      const userId = request.user!.userId;

      if (!text || text.trim().length === 0) {
        return reply.code(400).send({ error: 'Comment text is required' });
      }

      // Check if catch exists
      const catch_ = await prisma.catch.findUnique({
        where: { id }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          userId,
          catchId: id,
          text: text.trim()
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

      return reply.code(201).send(comment);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add comment' });
    }
  });

  // Delete comment
  fastify.delete('/catches/:catchId/comments/:commentId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { commentId } = request.params as { commentId: string };
      const userId = request.user!.userId;

      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (comment.userId !== userId) {
        return reply.code(403).send({ error: 'Not authorized to delete this comment' });
      }

      await prisma.comment.delete({
        where: { id: commentId }
      });

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete comment' });
    }
  });

  // Get catch metadata (EXIF, GPS, hash)
  fastify.get('/catches/:id/metadata', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const catch_ = await prisma.catch.findUnique({
        where: { id },
        select: {
          id: true,
          photoUrl: true,
          photoHash: true,
          exifData: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      if (!catch_) {
        return reply.code(404).send({ error: 'Catch not found' });
      }

      // Parse EXIF data from JSON string
      let exifData = null;
      if (catch_.exifData) {
        try {
          exifData = JSON.parse(catch_.exifData);
        } catch (e) {
          console.error('Failed to parse EXIF data:', e);
        }
      }

      return {
        catchId: catch_.id,
        user: catch_.user,
        metadata: {
          photoUrl: catch_.photoUrl,
          photoHash: catch_.photoHash,
          exif: exifData,
          gps: {
            claimed: {
              latitude: catch_.latitude,
              longitude: catch_.longitude,
            },
            exif: exifData?.gps || null,
          },
          timestamp: {
            claimed: catch_.createdAt,
            exif: exifData?.timestamp || null,
          },
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch metadata' });
    }
  });

  // Get FiskeDex - user's species collection
  fastify.get('/catches/fiskedex', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Get all species from the database
      const allSpecies = await prisma.species.findMany({
        select: {
          id: true,
          name: true,
          scientificName: true,
          description: true,
          rarity: true,
          habitat: true,
          minLegalSize: true,
          imageUrl: true,
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Get user's FiskeDex entries
      const userEntries = await prisma.fiskeDexEntry.findMany({
        where: {
          userId
        },
        include: {
          species: true
        }
      });

      // Create a map of speciesId to entry for quick lookup
      const entriesMap = new Map();
      userEntries.forEach(entry => {
        entriesMap.set(entry.speciesId, entry);
      });

      // Build the FiskeDex response
      const fiskedex = allSpecies.map(species => {
        const entry = entriesMap.get(species.id);

        return {
          id: species.id,
          name: species.name,
          scientificName: species.scientificName,
          description: species.description,
          rarity: species.rarity || 'common',
          habitat: species.habitat,
          minLegalSize: species.minLegalSize,
          imageUrl: species.imageUrl,
          caught: !!entry,
          // User-specific stats (only if caught)
          count: entry?.catchCount || 0,
          firstCaught: entry?.firstCaughtAt || null,
          largestLength: entry?.largestLengthCm || null,
          heaviestWeight: entry?.heaviestWeightKg || null,
          photo: entry?.unlockPhotoUrl || null,
        };
      });

      // Calculate overall stats
      const totalSpecies = allSpecies.length;
      const caughtSpecies = fiskedex.filter(s => s.caught).length;
      const completionRate = totalSpecies > 0 ? (caughtSpecies / totalSpecies) * 100 : 0;

      // Count by rarity
      const rarityStats = {
        common: { total: 0, caught: 0 },
        uncommon: { total: 0, caught: 0 },
        rare: { total: 0, caught: 0 },
        very_rare: { total: 0, caught: 0 },
        legendary: { total: 0, caught: 0 },
      };

      fiskedex.forEach(species => {
        const rarity = species.rarity as keyof typeof rarityStats;
        if (rarityStats[rarity]) {
          rarityStats[rarity].total++;
          if (species.caught) {
            rarityStats[rarity].caught++;
          }
        }
      });

      return {
        species: fiskedex,
        stats: {
          totalSpecies,
          caughtSpecies,
          completionRate: Math.round(completionRate),
          totalCatches: userEntries.reduce((sum, entry) => sum + entry.catchCount, 0),
          byRarity: rarityStats,
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch FiskeDex' });
    }
  });
}
