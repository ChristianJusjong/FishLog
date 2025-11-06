import { z } from 'zod';

// Catch validation schemas
export const startCatchSchema = z.object({
  photoUrl: z.string().min(1, 'Photo is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateCatchSchema = z.object({
  species: z.string().min(1).max(100).optional(),
  lengthCm: z.number().positive().max(1000).optional(),
  weightKg: z.number().positive().max(1000).optional(),
  bait: z.string().max(100).optional(),
  lure: z.string().max(100).optional(),
  rig: z.string().max(100).optional(),
  technique: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  visibility: z.enum(['private', 'friends', 'public']).optional(),
});

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// User update validation
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  avatar: z.string().optional(),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['competition', 'gathering', 'cleanup', 'workshop']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().max(200).optional(),
  maxParticipants: z.number().positive().optional(),
  requirements: z.string().max(1000).optional(),
  prizes: z.string().max(1000).optional(),
});

// Comment validation
export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// Helper function to validate and return typed data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function for safe validation with error handling
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
  return { success: false, errors };
}
