import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

// Coerce the quantity string from multipart form-data to a number
const positiveNumber = z.coerce
  .number({ invalid_type_error: 'quantity must be a number' })
  .positive('quantity must be greater than 0')
  .max(100_000, 'quantity is unreasonably large');

const futureDateString = z
  .string()
  .refine((v) => !isNaN(new Date(v).getTime()), { message: 'Invalid date format' })
  .refine((v) => new Date(v) > new Date(), { message: 'bestBefore must be a future date' });

export const createPostSchema = z.object({
  body: z.object({
    foodType:     z.string().min(2, 'foodType must be at least 2 characters').max(100),
    quantity:     positiveNumber,
    quantityUnit: z.string().min(1).max(50).optional(),
    bestBefore:   futureDateString,
    description:  z.string().max(500).optional(),
    area:         z.string().max(100).optional(),
    latitude:     z.string().max(30).optional(),
    longitude:    z.string().max(30).optional(),
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const updatePostSchema = z.object({
  body: z.object({
    foodType:     z.string().min(2).max(100).optional(),
    quantity:     positiveNumber.optional(),
    quantityUnit: z.string().min(1).max(50).optional(),
    bestBefore:   z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), { message: 'Invalid date format' })
      .optional(),
    description:  z.string().max(500).optional(),
    area:         z.string().max(100).optional(),
  }),
  params: z.object({ postId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

export const postIdParamSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({ postId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});
