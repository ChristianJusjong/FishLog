import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// OAuth Configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v12.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v12.0/oauth/access_token';

export async function authRoutes(fastify: FastifyInstance) {
  // Google OAuth - Initiate login
  fastify.get('/auth/google', async (request, reply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return reply.code(500).send({ error: 'Google OAuth not configured' });
    }

    const authUrl = `${GOOGLE_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    return reply.redirect(authUrl);
  });

  // Google OAuth callback
  fastify.get('/auth/google/callback', async (request, reply) => {
    try {
      const { code } = request.query as { code?: string };

      if (!code) {
        return reply.code(400).send({ error: 'Authorization code missing' });
      }

      // Exchange code for access token
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json() as { access_token?: string };

      if (!tokenData.access_token) {
        return reply.code(401).send({ error: 'Failed to get access token' });
      }

      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userInfoResponse.json() as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: googleUser.id,
          },
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google',
            providerId: googleUser.id,
          },
        });
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(
        `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Authentication failed' });
    }
  });

  // Facebook OAuth - Initiate login
  fastify.get('/auth/facebook', async (request, reply) => {
    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return reply.code(500).send({ error: 'Facebook OAuth not configured' });
    }

    const authUrl = `${FACEBOOK_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
    })}`;

    return reply.redirect(authUrl);
  });

  // Facebook OAuth callback
  fastify.get('/auth/facebook/callback', async (request, reply) => {
    try {
      const { code } = request.query as { code?: string };

      if (!code) {
        return reply.code(400).send({ error: 'Authorization code missing' });
      }

      // Exchange code for access token
      const tokenResponse = await fetch(
        `${FACEBOOK_TOKEN_URL}?${new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID || '',
          client_secret: process.env.FACEBOOK_APP_SECRET || '',
          redirect_uri: process.env.FACEBOOK_CALLBACK_URL || '',
          code,
        })}`
      );

      const tokenData = await tokenResponse.json() as { access_token?: string };

      if (!tokenData.access_token) {
        return reply.code(401).send({ error: 'Failed to get access token' });
      }

      // Fetch user info from Facebook
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
      );

      const facebookUser = await userInfoResponse.json() as {
        id: string;
        email: string;
        name: string;
        picture?: { data: { url: string } };
      };

      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'facebook',
            providerId: facebookUser.id,
          },
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: facebookUser.email,
            name: facebookUser.name,
            avatar: facebookUser.picture?.data?.url,
            provider: 'facebook',
            providerId: facebookUser.id,
          },
        });
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(
        `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Authentication failed' });
    }
  });

  // Refresh token endpoint
  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (!refreshToken) {
        return reply.code(400).send({ error: 'Refresh token required' });
      }

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          refreshToken,
        },
      });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Update refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(401).send({ error: 'Invalid or expired refresh token' });
    }
  });

  // Logout endpoint
  fastify.post('/auth/logout', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.user.updateMany({
          where: { refreshToken },
          data: { refreshToken: null },
        });
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Logout failed' });
    }
  });

  // SIGNUP ENDPOINT - Email/Password registration
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const { email, password, name } = request.body as {
        email?: string;
        password?: string;
        name?: string;
      };

      if (!email || !password || !name) {
        return reply.code(400).send({ error: 'Email, password, and name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.code(400).send({ error: 'Invalid email format' });
      }

      // Validate password strength
      if (password.length < 8) {
        return reply.code(400).send({ error: 'Password must be at least 8 characters' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(409).send({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          provider: 'email',
          providerId: email,
        },
      });

      // Generate JWT tokens
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Signup failed' });
    }
  });

  // EMAIL/PASSWORD LOGIN ENDPOINT
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        return reply.code(400).send({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Login failed' });
    }
  });

  // TEST LOGIN ENDPOINT - For development/testing only
  fastify.post('/auth/test-login', async (request, reply) => {
    try {
      const { email, name } = request.body as { email?: string; name?: string };

      if (!email || !name) {
        return reply.code(400).send({ error: 'Email and name required' });
      }

      // Find or create test user
      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'test',
            providerId: email,
          },
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            provider: 'test',
            providerId: email,
          },
        });
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Test login failed' });
    }
  });
}
