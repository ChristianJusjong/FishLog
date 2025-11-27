import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { signupSchema, loginSchema, refreshTokenSchema, validate } from '../lib/validation';
import bcrypt from 'bcrypt';
import crypto from 'crypto';


// OAuth Configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v12.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v12.0/oauth/access_token';

// Temporary auth code store (codes expire after 5 minutes)
// This allows secure OAuth token exchange via POST instead of URL params
const authCodeStore = new Map<string, { userId: string; expiresAt: number }>();
const AUTH_CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateAuthCode(userId: string): string {
  const code = crypto.randomBytes(32).toString('hex');
  authCodeStore.set(code, {
    userId,
    expiresAt: Date.now() + AUTH_CODE_EXPIRY_MS,
  });
  cleanupExpiredCodes();
  return code;
}

function consumeAuthCode(code: string): string | null {
  const entry = authCodeStore.get(code);
  if (!entry) return null;
  authCodeStore.delete(code);
  if (Date.now() > entry.expiresAt) return null;
  return entry.userId;
}

function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [code, entry] of authCodeStore.entries()) {
    if (now > entry.expiresAt) {
      authCodeStore.delete(code);
    }
  }
}

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

      // Generate short-lived auth code instead of sending tokens in URL
      const authCode = generateAuthCode(user.id);

      // Redirect to frontend with auth code (not tokens!)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(
        `${frontendUrl}/auth/callback?code=${authCode}&provider=google`
      );
    } catch (error) {
      fastify.log.error(error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
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

      // Generate short-lived auth code instead of sending tokens in URL
      const authCode = generateAuthCode(user.id);

      // Redirect to frontend with auth code (not tokens!)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(
        `${frontendUrl}/auth/callback?code=${authCode}&provider=facebook`
      );
    } catch (error) {
      fastify.log.error(error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
      return reply.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
    }
  });

  // Exchange auth code for tokens (secure POST endpoint)
  fastify.post('/auth/exchange', async (request, reply) => {
    try {
      const { code } = request.body as { code?: string };

      if (!code) {
        return reply.code(400).send({ error: 'Authorization code required' });
      }

      // Consume the auth code (one-time use)
      const userId = consumeAuthCode(code);

      if (!userId) {
        return reply.code(401).send({ error: 'Invalid or expired authorization code' });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
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
      fastify.log.error(error, 'Token exchange error');
      return reply.code(500).send({ error: 'Token exchange failed' });
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
        id: user.id,
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
      // Validate input with Zod
      const validData = validate(signupSchema, request.body, reply);
      if (!validData) return;

      const { email, password, name } = validData;

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
      fastify.log.error(error, 'Signup error');
      return reply.code(500).send({
        error: 'Signup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // EMAIL/PASSWORD LOGIN ENDPOINT
  fastify.post('/auth/login', async (request, reply) => {
    try {
      // Validate input with Zod
      const validData = validate(loginSchema, request.body, reply);
      if (!validData) return;

      const { email, password } = validData;

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
      fastify.log.error(error, 'Login error');
      return reply.code(500).send({
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Facebook Data Deletion Callback (required by Facebook)
  // This endpoint handles user data deletion requests from Facebook
  fastify.post('/auth/facebook/deletion', async (request, reply) => {
    try {
      const { signed_request } = request.body as { signed_request?: string };

      if (!signed_request) {
        return reply.code(400).send({ error: 'Missing signed_request' });
      }

      // Parse the signed request from Facebook
      const [encodedSig, payload] = signed_request.split('.');
      const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      const userId = data.user_id;

      if (userId) {
        // Find and delete user by Facebook provider ID
        const user = await prisma.user.findFirst({
          where: {
            provider: 'facebook',
            providerId: userId
          }
        });

        if (user) {
          // Delete user and all associated data
          await prisma.user.delete({
            where: { id: user.id }
          });
        }
      }

      // Facebook expects a specific response format
      const confirmationCode = crypto.randomBytes(16).toString('hex');
      const statusUrl = `https://fishlog-production.up.railway.app/auth/facebook/deletion-status?code=${confirmationCode}`;

      return {
        url: statusUrl,
        confirmation_code: confirmationCode
      };
    } catch (error) {
      fastify.log.error(error, 'Facebook deletion error');
      return reply.code(500).send({ error: 'Deletion request failed' });
    }
  });

  // Facebook Data Deletion Status (for user to check deletion status)
  fastify.get('/auth/facebook/deletion-status', async (request, reply) => {
    return {
      status: 'completed',
      message: 'Your data has been deleted from Hook/FishLog'
    };
  });

}
