// Fix #17: validate env FIRST before anything else
import { validateEnv, env } from './config/env.js';
validateEnv();

import express      from 'express';
import cors         from 'cors';
import helmet       from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path          from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import v1Routes      from './routes/v1/index.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Fix #18: Full CSP via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Fix #13: request ID on every request
app.use(requestId);

// Serve uploaded files
app.use('/api/v1/uploads', express.static(env.UPLOADS_DIR));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, db: env.MONGO_URI ? 'mongodb' : 'json-fallback', uptime: process.uptime() });
});

// Fix #19: all routes versioned under /api/v1
app.use('/api/v1', v1Routes);

// Legacy compatibility alias — a large part of the frontend (older pages,
// admin tabs) calls /api/... directly instead of /api/v1/.... Rather than
// track down every call site, also serve the same v1 router at /api so
// both forms work.
app.use('/api', v1Routes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found. See /api/v1/docs for available routes.' }));
app.use(errorHandler);

async function start() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    console.info(`[server] http://localhost:${env.PORT}  (db: ${env.MONGO_URI ? 'MongoDB' : 'JSON fallback'})`);
    console.info(`[docs]   http://localhost:${env.PORT}/api/v1/docs`);
  });

  // Fix #14: graceful shutdown — finish in-flight requests before exiting
  function shutdown(signal) {
    console.info(`[server] ${signal} received — shutting down gracefully`);
    server.close(() => {
      console.info('[server] All connections closed. Exiting.');
      process.exit(0);
    });
    // Force exit after 10s if connections hang
    setTimeout(() => { console.error('[server] Forced shutdown after timeout'); process.exit(1); }, 10000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (err) => { console.error('[server] Uncaught exception:', err); shutdown('uncaughtException'); });
  process.on('unhandledRejection', (err) => { console.error('[server] Unhandled rejection:', err); });
}

start();
