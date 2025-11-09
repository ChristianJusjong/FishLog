import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function groupsRoutes(fastify: FastifyInstance) {
  // Get my groups
  fastify.get('/groups/my-groups', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = request.user.userId;

      const memberships = await prisma.groupMembership.findMany({
        where: {
          userId,
          status: 'APPROVED'
        },
        include: {
          group: {
            include: {
              _count: {
                select: { members: true }
              }
            }
          }
        }
      });

      const groups = memberships.map(m => ({
        id: m.group.id,
        name: m.group.name,
        description: m.group.description,
        logoUrl: m.group.logoUrl,
        isPrivate: m.group.isPrivate,
        memberCount: m.group._count.members,
        isMember: true,
        isPending: false,
        role: m.role
      }));

      return groups;
    } catch (error) {
      fastify.log.error(error, 'Error fetching my groups');
      return reply.code(500).send({ error: 'Failed to fetch groups' });
    }
  });

  // Get available groups (not member of)
  fastify.get('/groups/available', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = request.user.userId;

      // Get all groups where user is not a member or has pending request
      const groups = await prisma.group.findMany({
        include: {
          _count: {
            select: { members: true }
          },
          members: {
            where: { userId }
          }
        }
      });

      const availableGroups = groups
        .filter(g => g.members.length === 0 || g.members[0].status === 'PENDING')
        .map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          logoUrl: g.logoUrl,
          isPrivate: g.isPrivate,
          memberCount: g._count.members,
          isMember: false,
          isPending: g.members.length > 0 && g.members[0].status === 'PENDING'
        }));

      return availableGroups;
    } catch (error) {
      fastify.log.error(error, 'Error fetching available groups');
      return reply.code(500).send({ error: 'Failed to fetch available groups' });
    }
  });

  // Get group details
  fastify.get('/groups/:groupId', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId } = request.params as { groupId: string };
      const userId = request.user.userId;

      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              members: true,
              posts: true
            }
          }
        }
      });

      if (!group) {
        return reply.code(404).send({ error: 'Group not found' });
      }

      const userMembership = group.members.find(m => m.userId === userId);
      const isMember = userMembership?.status === 'APPROVED';
      const isPending = userMembership?.status === 'PENDING';

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        logoUrl: group.logoUrl,
        isPrivate: group.isPrivate,
        memberCount: group._count.members,
        postCount: group._count.posts,
        isMember,
        isPending,
        role: userMembership?.role,
        members: group.members
          .filter(m => m.status === 'APPROVED')
          .map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
            joinedAt: m.createdAt
          }))
      };
    } catch (error) {
      fastify.log.error(error, 'Error fetching group');
      return reply.code(500).send({ error: 'Failed to fetch group' });
    }
  });

  // Create group
  fastify.post('/groups', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = request.user.userId;
      const { name, description, isPrivate, logoUrl } = request.body as {
        name: string;
        description?: string;
        isPrivate?: boolean;
        logoUrl?: string;
      };

      if (!name) {
        return reply.code(400).send({ error: 'Group name is required' });
      }

      const group = await prisma.group.create({
        data: {
          name,
          description: description || null,
          logoUrl: logoUrl || null,
          isPrivate: isPrivate || false,
          members: {
            create: {
              userId,
              role: 'ADMIN',
              status: 'APPROVED'
            }
          }
        },
        include: {
          _count: {
            select: { members: true }
          }
        }
      });

      return reply.code(201).send({
        id: group.id,
        name: group.name,
        description: group.description,
        logoUrl: group.logoUrl,
        isPrivate: group.isPrivate,
        memberCount: group._count.members
      });
    } catch (error) {
      fastify.log.error(error, 'Error creating group');
      return reply.code(500).send({ error: 'Failed to create group' });
    }
  });

  // Join public group
  fastify.post('/groups/:groupId/join', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId } = request.params as { groupId: string };
      const userId = request.user.userId;

      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        return reply.code(404).send({ error: 'Group not found' });
      }

      if (group.isPrivate) {
        return reply.code(400).send({ error: 'Cannot join private group directly. Request membership instead.' });
      }

      // Check if already member
      const existing = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (existing) {
        return reply.code(400).send({ error: 'Already a member' });
      }

      await prisma.groupMembership.create({
        data: {
          groupId,
          userId,
          role: 'MEMBER',
          status: 'APPROVED'
        }
      });

      return { message: 'Successfully joined group' };
    } catch (error) {
      fastify.log.error(error, 'Error joining group');
      return reply.code(500).send({ error: 'Failed to join group' });
    }
  });

  // Request membership (for private groups)
  fastify.post('/groups/:groupId/request', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId } = request.params as { groupId: string };
      const userId = request.user.userId;

      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        return reply.code(404).send({ error: 'Group not found' });
      }

      // Check if already member or has pending request
      const existing = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (existing) {
        if (existing.status === 'APPROVED') {
          return reply.code(400).send({ error: 'Already a member' });
        } else {
          return reply.code(400).send({ error: 'Request already pending' });
        }
      }

      await prisma.groupMembership.create({
        data: {
          groupId,
          userId,
          role: 'MEMBER',
          status: 'PENDING'
        }
      });

      return { message: 'Membership request sent' };
    } catch (error) {
      fastify.log.error(error, 'Error requesting membership');
      return reply.code(500).send({ error: 'Failed to request membership' });
    }
  });

  // Get group posts/feed
  fastify.get('/groups/:groupId/posts', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId } = request.params as { groupId: string };
      const userId = request.user.userId;

      // Check if user is a member
      const membership = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (!membership || membership.status !== 'APPROVED') {
        return reply.code(403).send({ error: 'You must be a member to view group posts' });
      }

      const posts = await prisma.groupPost.findMany({
        where: { groupId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
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
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: { userId }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedPosts = posts.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: post.user,
        catch: post.catch,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLikedByMe: post.likes.length > 0
      }));

      return formattedPosts;
    } catch (error) {
      fastify.log.error(error, 'Error fetching group posts');
      return reply.code(500).send({ error: 'Failed to fetch group posts' });
    }
  });

  // Create group post
  fastify.post('/groups/:groupId/posts', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId } = request.params as { groupId: string };
      const userId = request.user.userId;
      const { content, catchId } = request.body as { content?: string; catchId?: string };

      // Check if user is a member
      const membership = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (!membership || membership.status !== 'APPROVED') {
        return reply.code(403).send({ error: 'You must be a member to post in this group' });
      }

      const post = await prisma.groupPost.create({
        data: {
          groupId,
          userId,
          content,
          catchId: catchId || null
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

      return reply.code(201).send(post);
    } catch (error) {
      fastify.log.error(error, 'Error creating group post');
      return reply.code(500).send({ error: 'Failed to create post' });
    }
  });

  // Approve membership request (admin only)
  fastify.post('/groups/:groupId/members/:targetUserId/approve', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { groupId, targetUserId } = request.params as { groupId: string; targetUserId: string };
      const adminUserId = request.user.userId;

      // Check if requester is admin
      const adminMembership = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: adminUserId
          }
        }
      });

      if (!adminMembership || adminMembership.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Only admins can approve members' });
      }

      // Approve the membership
      await prisma.groupMembership.update({
        where: {
          groupId_userId: {
            groupId,
            userId: targetUserId
          }
        },
        data: {
          status: 'APPROVED'
        }
      });

      return { message: 'Member approved' };
    } catch (error) {
      fastify.log.error(error, 'Error approving member');
      return reply.code(500).send({ error: 'Failed to approve member' });
    }
  });
}
