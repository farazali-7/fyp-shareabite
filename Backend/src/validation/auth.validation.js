import { z } from 'zod';

// E.164 phone number (e.g. +923001234567)
const phone = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'Invalid phone number. Include country code (e.g. +923...)');

export const registerSchema = z.object({
  body: z.object({
    role:          z.enum(['restaurant', 'charity'], { errorMap: () => ({ message: "role must be 'restaurant' or 'charity'" }) }),
    userName:      z.string().min(2, 'Name must be at least 2 characters').max(50),
    email:         z.string().email('Invalid email address'),
    contactNumber: phone,
    password:      z.string().min(8, 'Password must be at least 8 characters').max(100),
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role:     z.enum(['restaurant', 'charity', 'admin'], { errorMap: () => ({ message: "role must be 'restaurant', 'charity', or 'admin'" }) }),
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const checkUserSchema = z.object({
  body: z.object({
    email:         z.string().email('Invalid email').optional(),
    contactNumber: phone.optional(),
  }).refine((d) => d.email || d.contactNumber, {
    message: 'Provide at least one of email or contactNumber',
    path: ['email'],
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const checkContactSchema = z.object({
  body:   z.object({ contactNumber: phone }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const issueResetTokenSchema = z.object({
  body:   z.object({ contactNumber: phone }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken:  z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
  }),
  params: z.object({}).passthrough(),
  query:  z.object({}).passthrough(),
});
