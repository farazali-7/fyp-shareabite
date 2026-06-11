import { AppError } from './AppError.js';

export class AuthError extends AppError {
  constructor(message = 'Not authorized', code = 'TOKEN_INVALID') {
    super(message, 401, code);
  }
}
