import { z } from 'zod';
import { FastifyReply } from 'fastify';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const uuidSchema = z.string().uuid('Invalid ID format');
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Auth schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Catch schemas
export const createCatchSchema = z.object({
  species: z.string().min(1, 'Species is required'),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.string().optional(),
  notes: z.string().max(1000).optional(),
  image: z.string().optional(),
  weather: z.string().optional(),
  waterTemp: z.number().optional(),
  method: z.string().optional(),
  bait: z.string().optional(),
  isPublic: z.boolean().default(true),
  caughtAt: z.string().datetime().optional(),
});

// User profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  groqApiKey: z.string().optional(),
});

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxParticipants: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): 
  { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.errors.map(e => e.message).join(', ');
  return { success: false, error: errorMessage };
}

// Fastify plugin-style validation helper
export function validate<T>(schema: z.ZodSchema<T>, body: unknown, reply: FastifyReply): T | null {
  const result = validateBody(schema, body);
  if (!result.success) {
    reply.code(400).send({ error: result.error });
    return null;
  }
  return result.data;
}

export { z };
