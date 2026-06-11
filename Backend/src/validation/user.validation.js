import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const updateProfileSchema = z.object({
  body: z.object({
    userName:       z.string().min(2).max(50).optional(),
    operatingHours: z.string().max(100).optional(),
    cuisineType:    z.string().max(50).optional(),
  }),
  params: z.object({ id: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

// Escapes regex metacharacters to prevent ReDoS on the MongoDB query.
export const searchSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(50, 'Search query is too long')
      .transform((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  }).passthrough(),
  query: z.object({}).passthrough(),
});

export const subscribeSchema = z.object({
  // Body intentionally empty — caller identity comes from JWT, not body.
  body:   z.object({}),
  params: z.object({ targetId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

export const userIdParamSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({ id: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});
