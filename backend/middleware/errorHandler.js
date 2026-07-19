/**
 * errorHandler — global Express error handler.
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 * Fix #7 companion: catches everything asyncHandler passes via next(err).
 */
export function errorHandler(err, req, res, _next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[error] ${req.id} ${status} ${req.method} ${req.path}:`, message);
    if (status === 500) console.error(err.stack);
  }

  res.status(status).json({
    error:     message,
    requestId: req.id,
    ...(process.env.NODE_ENV !== 'production' && status === 500 ? { stack: err.stack } : {}),
  });
}
