/**
 * asyncHandler — wraps every async route handler.
 * Catches any thrown error or rejected promise and passes it to next(err).
 * This prevents Express from crashing on unhandled promise rejections.
 *
 * Usage:  router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
