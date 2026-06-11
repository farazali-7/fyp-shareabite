import rateLimit from 'express-rate-limit';

const make = (max, windowMs, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

// Login, register, check-user, check-contact: 5 per minute
export const authLimiter = make(
  5,
  60_000,
  'Too many attempts. Please wait 1 minute and try again.'
);

// Password reset issue + submit: 3 per 15 minutes
export const resetLimiter = make(
  3,
  15 * 60_000,
  'Too many reset attempts. Please wait 15 minutes and try again.'
);
