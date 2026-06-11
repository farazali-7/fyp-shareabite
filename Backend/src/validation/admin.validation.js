import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const getLicensesSchema = z.object({
  body:   z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    status: z.enum(['pending', 'approved', 'rejected'], {
      errorMap: () => ({ message: "status must be 'pending', 'approved', or 'rejected'" }),
    }),
  }).passthrough(),
});

export const approveLicenseSchema = z.object({
  body:   z.object({ adminNote: z.string().max(500).optional() }),
  params: z.object({ userId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});

export const rejectLicenseSchema = z.object({
  body:   z.object({ reason: z.string().max(500).optional() }),
  params: z.object({ userId: objectId }).passthrough(),
  query:  z.object({}).passthrough(),
});
