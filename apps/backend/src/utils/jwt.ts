import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Check for required environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('⚠️  SECURITY WARNING: JWT secrets not found in environment variables!');
  console.error('⚠️  Using temporary fallback secrets - NOT SECURE FOR PRODUCTION');
  console.error('⚠️  Set JWT_SECRET and JWT_REFRESH_SECRET in Railway dashboard');
}

const JWT_SECRET: string = process.env.JWT_SECRET || '2d969f68686cf8066b74b3a034609731972d0e6b13f5721e98aeb2b63abf7f08e6e861fc26b7f42d26c5bd27b762d15cced3b2ebc315d03f26727f9c1f1251af';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '6fb0f03a877c72ae70b448e691c53a54e60a16a8bb2327f3edbb511004a5f534d0f3886c7221e8d46eff32765fff8ba102a598b3721d9ac5e94c2b2afbced678';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Extended to 24 hours for better UX
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'; // Extended to 30 days

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function generateTokenPair(payload: TokenPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}
