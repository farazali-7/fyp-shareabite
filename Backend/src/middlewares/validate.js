import { z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';

// Validates req.body, req.params, and req.query against a Zod schema.
//
// Schema shape: z.object({ body?, params?, query? })
//   - body:   unknown keys are STRIPPED  (prevents mass-assignment)
//   - params: unknown keys pass through  (Express adds route params)
//   - query:  unknown keys pass through  (allow unpredicted query strings)
//
// Validated (and coerced) values replace the originals on req, so
// controllers always receive clean, type-correct data.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body:   req.body,
    params: req.params,
    query:  req.query,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field:   e.path.slice(1).join('.'), // strip leading 'body' / 'params' / 'query'
      message: e.message,
    }));
    return next(new ValidationError('Validation failed', errors));
  }

  if (result.data.body   !== undefined) req.body   = result.data.body;
  if (result.data.params !== undefined) req.params = result.data.params;
  if (result.data.query  !== undefined) req.query  = result.data.query;

  next();
};

export default validate;
