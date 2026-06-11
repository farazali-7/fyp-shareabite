import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const createChatSchema = z.object({
  body:   z.object({ userId: objectId }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
    chatId:  objectId,
  }),
  params: z.object({ chatId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

export const chatIdParamSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({ chatId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

export const searchUsersSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    query: z
      .string()
      .max(50, 'Search query is too long')
      // Escape regex metacharacters — prevents ReDoS on the MongoDB $regex query
      .transform((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .optional(),
  }).passthrough(),
});
