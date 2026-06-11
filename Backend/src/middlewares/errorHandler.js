import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { ValidationError } from '../errors/ValidationError.js';
import { AuthError } from '../errors/AuthError.js';

// Map specific known error types to operational AppErrors with clean messages.

const handleCastError = (err) =>
  new AppError(`Invalid value for '${err.path}': ${err.value}`, 400, 'INVALID_ID');

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`${field} is already in use`, 409, 'CONFLICT');
};

const handleMongoValidation = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new ValidationError(messages.join('. '));
};

const handleJWT = () =>
  new AuthError('Invalid token. Please log in again.', 'TOKEN_INVALID');

const handleJWTExpired = () =>
  new AuthError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');

const handleMulter = (err) =>
  new AppError(err.message, 400, 'VALIDATION_ERROR');

const send = (err, res) => {
  const isDev = process.env.NODE_ENV === 'development';

  if (err.isOperational) {
    const body = { success: false, message: err.message, code: err.code };
    if (err.errors?.length) body.errors = err.errors;
    if (isDev) body.stack = err.stack;
    return res.status(err.statusCode).json(body);
  }

  // Programming error — never leak internals in production.
  console.error('UNCAUGHT ERROR:', err);
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Something went wrong. Please try again later.',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || 'error';

  let error = err;

  if (err instanceof mongoose.Error.CastError)       error = handleCastError(err);
  else if (err.code === 11000)                        error = handleDuplicateKey(err);
  else if (err instanceof mongoose.Error.ValidationError) error = handleMongoValidation(err);
  else if (err.name === 'JsonWebTokenError')          error = handleJWT();
  else if (err.name === 'TokenExpiredError')          error = handleJWTExpired();
  else if (err.name === 'MulterError')               error = handleMulter(err);

  send(error, res);
};

export default errorHandler;
