// Eliminates try/catch boilerplate from async controllers.
// Any thrown error is forwarded to Express's global error handler via next(err).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
