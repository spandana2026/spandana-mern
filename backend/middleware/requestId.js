import { randomUUID } from 'crypto';

/**
 * requestId — attaches a UUID to every request.
 * Fix #13: enables log tracing — every log line can include req.id
 * so a developer can follow a single request through all log entries.
 */
export function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}
