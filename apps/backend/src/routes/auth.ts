import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { signupSchema, loginSchema, refreshTokenSchema, authExchangeSchema, facebookDeletionSchema, appleNativeAuthSchema, validate } from '../lib/validation';
import bcrypt from 'bcrypt';
import crypto from 'crypto';


// OAuth Configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v12.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v12.0/oauth/access_token';
const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';

// Temporary auth code store (codes expire after 5 minutes)
// This allows secure OAuth token exchange via POST instead of URL params
const authCodeStore = new Map<string, { userId: string; expiresAt: number }>();
const AUTH_CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Store mobile redirect URIs temporarily during OAuth flow
const mobileRedirectStore = new Map<string, { redirectUri: string; expiresAt: number }>();
const MOBILE_REDIRECT_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

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
  // Also cleanup mobile redirect store
  for (const [state, entry] of mobileRedirectStore.entries()) {
    if (now > entry.expiresAt) {
      mobileRedirectStore.delete(state);
    }
  }
}

// Security: Validate Redirect URI to prevent Open Redirect attacks
function validateRedirectUri(uri: string): boolean {
  if (!uri) return false;

  try {
    const url = new URL(uri);

    // Whitelisted protocols
    const allowedProtocols = ['hook:', 'exp:', 'https:'];
    if (!allowedProtocols.includes(url.protocol)) return false;

    // Check specific domains for HTTPS
    if (url.protocol === 'https:') {
      // Allow Railway production and specific trusted domains
      const allowedDomains = [
        'fishlog-production.up.railway.app',
        'accounts.google.com',
        'www.facebook.com',
        'appleid.apple.com',
        'auth.expo.io',
      ];
      // Check if hostname ends with allowed domain (e.g., to allow subdomains if needed, strict match preferred here)
      return allowedDomains.includes(url.hostname);
    }

    // Allow custom scheme (mobile app)
    if (url.protocol === 'hook:') return true;

    // Allow Expo Go (development only - consider restricting in production)
    if (url.protocol === 'exp:') return true;

    return false;
  } catch (e) {
    return false;
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

  // Google OAuth for mobile - uses custom redirect URI
  fastify.get('/auth/google/mobile', async (request, reply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const { redirect_uri } = request.query as { redirect_uri?: string };

    if (!redirect_uri) {
      return reply.code(400).send({ error: 'redirect_uri is required' });
    }

    // Security: Validate redirect_uri
    if (!validateRedirectUri(redirect_uri)) {
      return reply.code(400).send({ error: 'Invalid redirect_uri' });
    }

    if (!clientId) {
      return reply.code(500).send({ error: 'Google OAuth not configured' });
    }

    if (!redirect_uri) {
      return reply.code(400).send({ error: 'redirect_uri is required' });
    }

    // Generate state to track this mobile OAuth flow
    const state = crypto.randomBytes(16).toString('hex');
    mobileRedirectStore.set(state, {
      redirectUri: redirect_uri,
      expiresAt: Date.now() + MOBILE_REDIRECT_EXPIRY_MS,
    });
    cleanupExpiredCodes();

    // Use backend callback URL for Google (registered in Google Console)
    const backendCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

    const authUrl = `${GOOGLE_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: backendCallbackUrl || '',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: `mobile:${state}`, // Prefix to identify mobile flow
    })}`;

    return reply.redirect(authUrl);
  });

  // Google OAuth callback
  fastify.get('/auth/google/callback', async (request, reply) => {
    try {
      const { code, state } = request.query as { code?: string; state?: string };

      if (!code) {
        return reply.code(400).send({ error: 'Authorization code missing' });
      }

      // Check if this is a mobile OAuth flow
      const isMobileFlow = state?.startsWith('mobile:');
      let mobileRedirectUri: string | null = null;

      if (isMobileFlow && state) {
        const mobileState = state.replace('mobile:', '');
        const storedData = mobileRedirectStore.get(mobileState);
        if (storedData && Date.now() < storedData.expiresAt) {
          mobileRedirectUri = storedData.redirectUri;
          mobileRedirectStore.delete(mobileState);
        }
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

      const userEmail = googleUser.email || `${googleUser.id}@google.hook.app`;
      const userName = googleUser.name || 'Google Bruger';

      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: googleUser.id,
          },
        },
      });

      if (!user && googleUser.email) {
        user = await prisma.user.findUnique({
          where: { email: googleUser.email },
        });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'google',
              providerId: googleUser.id,
              avatar: user.avatar || googleUser.picture,
            },
          });
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userName,
            avatar: googleUser.picture,
            provider: 'google',
            providerId: googleUser.id,
          },
        });
      }

      // Generate short-lived auth code instead of sending tokens in URL
      const authCode = generateAuthCode(user.id);

      // Redirect to appropriate URL based on flow type
      if (mobileRedirectUri) {
        // Mobile flow: redirect to app's custom scheme
        return reply.redirect(`${mobileRedirectUri}?code=${authCode}&provider=google`);
      } else {
        // Always redirect to app's custom scheme for mobile
        // This works with both Expo Go and standalone builds
        return reply.redirect(`hook://auth/callback?code=${authCode}&provider=google`);
      }
    } catch (error) {
      fastify.log.error(error);

      // Handle error redirect based on flow type
      const { state } = request.query as { state?: string };
      if (state?.startsWith('mobile:')) {
        const mobileState = state.replace('mobile:', '');
        const storedData = mobileRedirectStore.get(mobileState);
        if (storedData) {
          mobileRedirectStore.delete(mobileState);
          return reply.redirect(`${storedData.redirectUri}?error=authentication_failed`);
        }
      }

      return reply.redirect(`hook://auth/callback?error=authentication_failed`);
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
      scope: 'public_profile',
    })}`;

    return reply.redirect(authUrl);
  });

  // Facebook OAuth for mobile - uses custom redirect URI
  fastify.get('/auth/facebook/mobile', async (request, reply) => {
    const clientId = process.env.FACEBOOK_APP_ID;
    const { redirect_uri } = request.query as { redirect_uri?: string };

    if (!redirect_uri) {
      return reply.code(400).send({ error: 'redirect_uri is required' });
    }

    // Security: Validate redirect_uri
    if (!validateRedirectUri(redirect_uri)) {
      return reply.code(400).send({ error: 'Invalid redirect_uri' });
    }

    if (!clientId) {
      return reply.code(500).send({ error: 'Facebook OAuth not configured' });
    }

    if (!redirect_uri) {
      return reply.code(400).send({ error: 'redirect_uri is required' });
    }

    // Generate state to track this mobile OAuth flow
    const state = crypto.randomBytes(16).toString('hex');
    mobileRedirectStore.set(state, {
      redirectUri: redirect_uri,
      expiresAt: Date.now() + MOBILE_REDIRECT_EXPIRY_MS,
    });
    cleanupExpiredCodes();

    // Use backend callback URL for Facebook (registered in Facebook Console)
    const backendCallbackUrl = process.env.FACEBOOK_CALLBACK_URL;

    const authUrl = `${FACEBOOK_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: backendCallbackUrl || '',
      response_type: 'code',
      scope: 'public_profile',
      state: `mobile:${state}`, // Prefix to identify mobile flow
    })}`;

    return reply.redirect(authUrl);
  });

  // Facebook OAuth callback
  fastify.get('/auth/facebook/callback', async (request, reply) => {
    try {
      const { code, state } = request.query as { code?: string; state?: string };

      if (!code) {
        return reply.code(400).send({ error: 'Authorization code missing' });
      }

      // Check if this is a mobile OAuth flow
      const isMobileFlow = state?.startsWith('mobile:');
      let mobileRedirectUri: string | null = null;

      if (isMobileFlow && state) {
        const mobileState = state.replace('mobile:', '');
        const storedData = mobileRedirectStore.get(mobileState);
        if (storedData && Date.now() < storedData.expiresAt) {
          mobileRedirectUri = storedData.redirectUri;
          mobileRedirectStore.delete(mobileState);
        }
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

      const userEmail = facebookUser.email || `${facebookUser.id}@facebook.hook.app`;
      const userName = facebookUser.name || 'Facebook Bruger';

      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'facebook',
            providerId: facebookUser.id,
          },
        },
      });

      if (!user && facebookUser.email) {
        user = await prisma.user.findUnique({
          where: { email: facebookUser.email },
        });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'facebook',
              providerId: facebookUser.id,
              avatar: user.avatar || facebookUser.picture?.data?.url,
            },
          });
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userName,
            avatar: facebookUser.picture?.data?.url,
            provider: 'facebook',
            providerId: facebookUser.id,
          },
        });
      }

      // Generate short-lived auth code instead of sending tokens in URL
      const authCode = generateAuthCode(user.id);

      // Redirect to appropriate URL based on flow type
      if (mobileRedirectUri) {
        // Mobile flow: redirect to app's custom scheme
        return reply.redirect(`${mobileRedirectUri}?code=${authCode}&provider=facebook`);
      } else {
        // Always redirect to app's custom scheme for mobile
        return reply.redirect(`hook://auth/callback?code=${authCode}&provider=facebook`);
      }
    } catch (error) {
      fastify.log.error(error);

      // Handle error redirect based on flow type
      const { state } = request.query as { state?: string };
      if (state?.startsWith('mobile:')) {
        const mobileState = state.replace('mobile:', '');
        const storedData = mobileRedirectStore.get(mobileState);
        if (storedData) {
          mobileRedirectStore.delete(mobileState);
          return reply.redirect(`${storedData.redirectUri}?error=authentication_failed`);
        }
      }

      return reply.redirect(`hook://auth/callback?error=authentication_failed`);
    }
  });

  // Apple OAuth - Initiate login (Web / Browser flow)
  fastify.get('/auth/apple', async (request, reply) => {
    const clientId = process.env.APPLE_CLIENT_ID || process.env.APPLE_SERVICE_ID;
    const redirectUri = process.env.APPLE_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return reply.code(500).send({ error: 'Apple OAuth not configured' });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${APPLE_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post',
      state,
    })}`;

    return reply.redirect(authUrl);
  });

  // Apple OAuth for mobile - uses custom redirect URI
  fastify.get('/auth/apple/mobile', async (request, reply) => {
    const clientId = process.env.APPLE_CLIENT_ID || process.env.APPLE_SERVICE_ID;
    const { redirect_uri } = request.query as { redirect_uri?: string };

    if (!redirect_uri) {
      return reply.code(400).send({ error: 'redirect_uri is required' });
    }

    if (!validateRedirectUri(redirect_uri)) {
      return reply.code(400).send({ error: 'Invalid redirect_uri' });
    }

    if (!clientId) {
      return reply.code(500).send({ error: 'Apple OAuth not configured' });
    }

    const state = crypto.randomBytes(16).toString('hex');
    mobileRedirectStore.set(state, {
      redirectUri: redirect_uri,
      expiresAt: Date.now() + MOBILE_REDIRECT_EXPIRY_MS,
    });
    cleanupExpiredCodes();

    const backendCallbackUrl = process.env.APPLE_CALLBACK_URL;

    const authUrl = `${APPLE_AUTH_URL}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: backendCallbackUrl || '',
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post',
      state: `mobile:${state}`,
    })}`;

    return reply.redirect(authUrl);
  });

  // Helper function to handle Apple OAuth callback payloads
  const handleAppleCallback = async (request: any, reply: any) => {
    try {
      const query = (request.query || {}) as { code?: string; state?: string; id_token?: string };
      const body = (request.body || {}) as { code?: string; state?: string; id_token?: string; user?: string };

      const code = body.code || query.code;
      const state = body.state || query.state;
      const idToken = body.id_token || query.id_token;

      if (!code && !idToken) {
        return reply.code(400).send({ error: 'Authorization data missing' });
      }

      const isMobileFlow = state?.startsWith('mobile:');
      let mobileRedirectUri: string | null = null;

      if (isMobileFlow && state) {
        const mobileState = state.replace('mobile:', '');
        const storedData = mobileRedirectStore.get(mobileState);
        if (storedData && Date.now() < storedData.expiresAt) {
          mobileRedirectUri = storedData.redirectUri;
          mobileRedirectStore.delete(mobileState);
        }
      }

      let appleSub = '';
      let appleEmail = '';
      let appleName = 'Apple Bruger';

      // If Apple returned identity token in form_post, decode payload JWT
      if (idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            appleSub = payload.sub || '';
            appleEmail = payload.email || '';
          }
        } catch (e) {
          fastify.log.error(e, 'Failed to parse Apple ID token');
        }
      }

      // If user object was sent on first login: { name: { firstName, lastName }, email }
      if (body.user) {
        try {
          const parsedUser = typeof body.user === 'string' ? JSON.parse(body.user) : body.user;
          if (parsedUser.name) {
            const fullName = [parsedUser.name.firstName, parsedUser.name.lastName].filter(Boolean).join(' ');
            if (fullName) appleName = fullName;
          }
          if (parsedUser.email && !appleEmail) {
            appleEmail = parsedUser.email;
          }
        } catch (e) {
          fastify.log.error(e, 'Failed to parse Apple user data');
        }
      }

      if (!appleSub) {
        appleSub = code || crypto.randomBytes(16).toString('hex');
      }

      if (!appleEmail) {
        appleEmail = `apple_${appleSub.substring(0, 10)}@privaterelay.appleid.com`;
      }

      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'apple',
            providerId: appleSub,
          },
        },
      });

      if (!user) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: appleEmail },
        });

        if (existingEmailUser) {
          user = await prisma.user.update({
            where: { id: existingEmailUser.id },
            data: {
              provider: 'apple',
              providerId: appleSub,
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email: appleEmail,
              name: appleName,
              provider: 'apple',
              providerId: appleSub,
            },
          });
        }
      }

      const authCode = generateAuthCode(user.id);

      if (mobileRedirectUri) {
        return reply.redirect(`${mobileRedirectUri}?code=${authCode}&provider=apple`);
      } else {
        return reply.redirect(`hook://auth/callback?code=${authCode}&provider=apple`);
      }
    } catch (error) {
      fastify.log.error(error, 'Apple OAuth callback error');
      return reply.redirect(`hook://auth/callback?error=authentication_failed`);
    }
  };

  // Apple OAuth callbacks (Apple sends POST for form_post and GET for standard redirects)
  fastify.get('/auth/apple/callback', handleAppleCallback);
  fastify.post('/auth/apple/callback', handleAppleCallback);

  // Native Sign in with Apple (Direct verification endpoint for iOS / React Native apps)
  fastify.post('/auth/apple/native', async (request, reply) => {
    try {
      const validData = validate(appleNativeAuthSchema, request.body, reply);
      if (!validData) return;

      const { identityToken, user: userInfo } = validData;

      // Decode JWT identityToken from Apple
      const parts = identityToken.split('.');
      if (parts.length !== 3) {
        return reply.code(400).send({ error: 'Invalid Apple identity token format' });
      }

      const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      const appleSub = decodedPayload.sub;
      let email = decodedPayload.email || userInfo?.email;

      if (!appleSub) {
        return reply.code(400).send({ error: 'Missing subject claim in Apple token' });
      }

      if (!email) {
        email = `apple_${appleSub.substring(0, 10)}@privaterelay.appleid.com`;
      }

      let name = 'Apple Bruger';
      if (userInfo?.name) {
        const fullName = [userInfo.name.firstName, userInfo.name.lastName].filter(Boolean).join(' ');
        if (fullName) name = fullName;
      }

      let user = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: 'apple',
            providerId: appleSub,
          },
        },
      });

      if (!user) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmailUser) {
          user = await prisma.user.update({
            where: { id: existingEmailUser.id },
            data: {
              provider: 'apple',
              providerId: appleSub,
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email,
              name,
              provider: 'apple',
              providerId: appleSub,
            },
          });
        }
      }

      // Generate JWT Token Pair
      const tokens = generateTokenPair({
        id: user.id,
        userId: user.id,
        email: user.email,
      });

      // Save refresh token in DB
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return reply.send({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, 'Native Apple auth error');
      return reply.code(500).send({ error: error.message || 'Apple authentication failed' });
    }
  });

  // Exchange auth code for tokens (secure POST endpoint)
  fastify.post('/auth/exchange', async (request, reply) => {
    try {
      const validData = validate(authExchangeSchema, request.body, reply);
      if (!validData) return;

      const { code } = validData;

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
      const validData = validate(refreshTokenSchema, request.body, reply);
      if (!validData) return;

      const { refreshToken } = validData;

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
      const validData = validate(refreshTokenSchema, request.body, reply);
      if (!validData) return;

      const { refreshToken } = validData;

      // Remove refresh token from database
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });

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
      const validData = validate(facebookDeletionSchema, request.body, reply);
      if (!validData) return;

      const { signed_request } = validData;
      const appSecret = process.env.FACEBOOK_APP_SECRET;

      if (!appSecret) {
        return reply.code(500).send({ error: 'Facebook OAuth not configured' });
      }

      // Parse and verify the signed request from Facebook
      const parts = signed_request.split('.');
      if (parts.length !== 2) {
        return reply.code(400).send({ error: 'Invalid signed_request format' });
      }

      const [encodedSig, payload] = parts;

      // Verify HMAC-SHA256 signature
      const expectedSig = crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const sigBuffer = Buffer.from(encodedSig, 'utf-8');
      const expectedBuffer = Buffer.from(expectedSig, 'utf-8');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return reply.code(400).send({ error: 'Invalid signature in signed_request' });
      }

      // Base64url decode payload
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
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
