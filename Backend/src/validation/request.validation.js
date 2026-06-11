import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const createRequestSchema = z.object({
  body: z.object({
    postId:     objectId,
    receiverId: objectId,
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const acceptRejectRequestSchema = z.object({
  body: z.object({
    postId:         objectId,
    requesterId:    objectId,
    notificationId: objectId,
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const cancelRequestSchema = z.object({
  body:   z.object({ postId: objectId }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const userIdParamSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({ userId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});
