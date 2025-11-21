import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

export default async function moderationRoutes(fastify: FastifyInstance) {
  // ==================== BLOCKING ====================

  // Block a user
  fastify.post('/users/block', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { blockedUserId, reason } = request.body as { blockedUserId: string; reason?: string };

      if (!blockedUserId) {
        return reply.status(400).send({ error: 'blockedUserId is required' });
      }

      if (blockedUserId === userId) {
        return reply.status(400).send({ error: 'You cannot block yourself' });
      }

      // Check if user exists
      const userToBlock = await prisma.user.findUnique({
        where: { id: blockedUserId },
      });

      if (!userToBlock) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Check if already blocked
      const existingBlock = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: blockedUserId,
          },
        },
      });

      if (existingBlock) {
        return reply.status(400).send({ error: 'User already blocked' });
      }

      // Create block
      const block = await prisma.blockedUser.create({
        data: {
          blockerId: userId,
          blockedId: blockedUserId,
          reason,
        },
      });

      // Remove any friendship if it exists
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { requesterId: userId, accepterId: blockedUserId },
            { requesterId: blockedUserId, accepterId: userId },
          ],
        },
      });

      return reply.send({
        success: true,
        message: 'User blocked successfully',
        block: {
          id: block.id,
          blockedUserId: block.blockedId,
          createdAt: block.createdAt,
        },
      });
    } catch (error) {
      fastify.log.error(error, 'Error blocking user');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Unblock a user
  fastify.delete('/users/block/:blockedUserId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { blockedUserId } = request.params as { blockedUserId: string };

      const block = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: blockedUserId,
          },
        },
      });

      if (!block) {
        return reply.status(404).send({ error: 'Block not found' });
      }

      await prisma.blockedUser.delete({
        where: {
          id: block.id,
        },
      });

      return reply.send({
        success: true,
        message: 'User unblocked successfully',
      });
    } catch (error) {
      fastify.log.error(error, 'Error unblocking user');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get list of blocked users
  fastify.get('/users/blocked', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const blocks = await prisma.blockedUser.findMany({
        where: {
          blockerId: userId,
        },
        include: {
          blocked: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to include the blocked user info directly
      const blockedUsers = blocks.map((block) => ({
        id: block.id,
        user: {
          id: block.blocked.id,
          name: block.blocked.name,
          email: block.blocked.email,
          avatar: block.blocked.avatar,
        },
        reason: block.reason,
        blockedAt: block.createdAt,
      }));

      return reply.send({
        blockedUsers,
        count: blockedUsers.length,
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching blocked users');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Check if a user is blocked
  fastify.get('/users/block/check/:targetUserId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { targetUserId } = request.params as { targetUserId: string };

      const block = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: targetUserId,
          },
        },
      });

      const blockedByThem = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: targetUserId,
            blockedId: userId,
          },
        },
      });

      return reply.send({
        isBlocked: !!block,
        isBlockedBy: !!blockedByThem,
      });
    } catch (error) {
      fastify.log.error(error, 'Error checking block status');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // ==================== MUTING ====================

  // Mute a user
  fastify.post('/users/mute', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { mutedUserId } = request.body as { mutedUserId: string };

      if (!mutedUserId) {
        return reply.status(400).send({ error: 'mutedUserId is required' });
      }

      if (mutedUserId === userId) {
        return reply.status(400).send({ error: 'You cannot mute yourself' });
      }

      // Check if user exists
      const userToMute = await prisma.user.findUnique({
        where: { id: mutedUserId },
      });

      if (!userToMute) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Check if already muted
      const existingMute = await prisma.mutedUser.findUnique({
        where: {
          muterId_mutedId: {
            muterId: userId,
            mutedId: mutedUserId,
          },
        },
      });

      if (existingMute) {
        return reply.status(400).send({ error: 'User already muted' });
      }

      // Create mute
      const mute = await prisma.mutedUser.create({
        data: {
          muterId: userId,
          mutedId: mutedUserId,
        },
      });

      return reply.send({
        success: true,
        message: 'User muted successfully',
        mute: {
          id: mute.id,
          mutedUserId: mute.mutedId,
          createdAt: mute.createdAt,
        },
      });
    } catch (error) {
      fastify.log.error(error, 'Error muting user');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Unmute a user
  fastify.delete('/users/mute/:mutedUserId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { mutedUserId } = request.params as { mutedUserId: string };

      const mute = await prisma.mutedUser.findUnique({
        where: {
          muterId_mutedId: {
            muterId: userId,
            mutedId: mutedUserId,
          },
        },
      });

      if (!mute) {
        return reply.status(404).send({ error: 'Mute not found' });
      }

      await prisma.mutedUser.delete({
        where: {
          id: mute.id,
        },
      });

      return reply.send({
        success: true,
        message: 'User unmuted successfully',
      });
    } catch (error) {
      fastify.log.error(error, 'Error unmuting user');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get list of muted users
  fastify.get('/users/muted', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const mutes = await prisma.mutedUser.findMany({
        where: {
          muterId: userId,
        },
        include: {
          muted: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to include the muted user info directly
      const mutedUsers = mutes.map((mute) => ({
        id: mute.id,
        user: {
          id: mute.muted.id,
          name: mute.muted.name,
          email: mute.muted.email,
          avatar: mute.muted.avatar,
        },
        mutedAt: mute.createdAt,
      }));

      return reply.send({
        mutedUsers,
        count: mutedUsers.length,
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching muted users');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Check if a user is muted
  fastify.get('/users/mute/check/:targetUserId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { targetUserId } = request.params as { targetUserId: string };

      const mute = await prisma.mutedUser.findUnique({
        where: {
          muterId_mutedId: {
            muterId: userId,
            mutedId: targetUserId,
          },
        },
      });

      return reply.send({
        isMuted: !!mute,
      });
    } catch (error) {
      fastify.log.error(error, 'Error checking mute status');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // ==================== CONTENT REPORTING ====================

  // Submit a content report
  fastify.post('/reports', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { contentType, contentId, category, description } = request.body as {
        contentType: string;
        contentId: string;
        category: string;
        description?: string;
      };

      if (!contentType || !contentId || !category) {
        return reply.status(400).send({
          error: 'contentType, contentId, and category are required',
        });
      }

      // Validate category
      const validCategories = ['spam', 'inappropriate', 'harassment', 'fake', 'other'];
      if (!validCategories.includes(category)) {
        return reply.status(400).send({
          error: 'Invalid category. Must be one of: ' + validCategories.join(', '),
        });
      }

      // Validate contentType
      const validContentTypes = ['catch', 'comment', 'user', 'group_post', 'club_message'];
      if (!validContentTypes.includes(contentType)) {
        return reply.status(400).send({
          error: 'Invalid contentType. Must be one of: ' + validContentTypes.join(', '),
        });
      }

      // Check if user has already reported this content
      const existingReport = await prisma.contentReport.findFirst({
        where: {
          reporterId: userId,
          contentType,
          contentId,
        },
      });

      if (existingReport) {
        return reply.status(400).send({
          error: 'You have already reported this content',
        });
      }

      // Create report
      const report = await prisma.contentReport.create({
        data: {
          reporterId: userId,
          contentType,
          contentId,
          category,
          description,
        },
      });

      return reply.send({
        success: true,
        message: 'Report submitted successfully',
        report: {
          id: report.id,
          contentType: report.contentType,
          contentId: report.contentId,
          category: report.category,
          status: report.status,
          createdAt: report.createdAt,
        },
      });
    } catch (error) {
      fastify.log.error(error, 'Error creating report');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get user's submitted reports
  fastify.get('/reports/my-reports', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const reports = await prisma.contentReport.findMany({
        where: {
          reporterId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        reports,
        count: reports.length,
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching user reports');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all reports (admin only - placeholder for now)
  fastify.get('/reports', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { status } = request.query as { status?: string };

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const reports = await prisma.contentReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        reports,
        count: reports.length,
      });
    } catch (error) {
      fastify.log.error(error, 'Error fetching reports');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update report status (admin only - placeholder for now)
  fastify.patch('/reports/:reportId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { reportId } = request.params as { reportId: string };
      const { status, resolution } = request.body as {
        status: string;
        resolution?: string;
      };

      if (!status) {
        return reply.status(400).send({ error: 'status is required' });
      }

      const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        });
      }

      const report = await prisma.contentReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      const updatedReport = await prisma.contentReport.update({
        where: { id: reportId },
        data: {
          status,
          resolution,
          reviewedBy: request.user!.userId,
          reviewedAt: new Date(),
        },
      });

      return reply.send({
        success: true,
        message: 'Report updated successfully',
        report: updatedReport,
      });
    } catch (error) {
      fastify.log.error(error, 'Error updating report');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
