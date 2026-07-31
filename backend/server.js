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
import { Settings } from './models/Settings.js';
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting: scoped to /api only, so static assets (JS/CSS/images) and
// the SPA page itself are never rate-limited — only writes/reads against
// the actual API count toward the budget. Also raised from 500 to 2000 per
// window since a single page load can legitimately fire many API calls
// (settings, posts, listings, ads, etc. all load in parallel).
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 2000, standardHeaders: true, legacyHeaders: false });

// Fix #13: request ID on every request
app.use(requestId);

// Serve uploaded files
app.use('/api/v1/uploads', express.static(env.UPLOADS_DIR));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, db: env.MONGO_URI ? 'mongodb' : 'json-fallback', uptime: process.uptime() });
});

// Fix #19: all routes versioned under /api/v1
app.use('/api/v1', apiLimiter, v1Routes);

// Legacy compatibility alias — a large part of the frontend (older pages,
// admin tabs) calls /api/... directly instead of /api/v1/.... Rather than
// track down every call site, also serve the same v1 router at /api so
// both forms work.
app.use('/api', apiLimiter, v1Routes);

// Fix: serve the built React frontend (frontend/dist) from this same Node
// process when it's present, so the whole app can be deployed as a single
// Node.js app (e.g. on Hostinger's Node.js Web Apps hosting, which deploys
// one GitHub-connected app per website). Local dev is unaffected — Vite's
// own dev server keeps handling the frontend there and frontend/dist won't
// exist until `npm run build` has been run.
import fs from 'fs';
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }));
}

// Cache the built index.html template in memory (it's a static file — only
// the settings injected into it change per-request) so we're not re-reading
// it from disk on every request.
let indexHtmlTemplate = null;
function getIndexHtmlTemplate(indexHtmlPath) {
  if (indexHtmlTemplate === null) {
    indexHtmlTemplate = fs.readFileSync(indexHtmlPath, 'utf8');
  }
  return indexHtmlTemplate;
}

app.use(async (req, res, next) => {
  // Anything under /api/* that reached here is a genuinely unmatched API route.
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route not found. See /api/v1/docs for available routes.' });
  }
  // Everything else falls back to the SPA's index.html (client-side routing),
  // if a build is present. Otherwise fall through to the JSON 404 below.
  const indexHtml = path.join(frontendDist, 'index.html');
  if (!fs.existsSync(indexHtml)) return next();

  try {
    // Fix: the navbar (and other components) used to fetch /api/settings
    // client-side after mount, which meant on a brand-new device (nothing
    // cached yet) hidden admin links/pages briefly flashed visible before
    // the fetch resolved. Since this route already renders the HTML for
    // every request, embed the current live settings directly into the
    // page so the client has correct data from the very first paint —
    // no separate round trip needed just to know what's hidden.
    const settings = await Settings.getLive();
    const json = JSON.stringify(settings).replace(/</g, '\\u003c'); // prevent </script> breakout
    const html = getIndexHtmlTemplate(indexHtml).replace(
      '</head>',
      `<script>window.__SITE_SETTINGS__=${json};</script></head>`
    );
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    // Never let a settings-fetch failure break the page — fall back to the
    // plain static file, same as before this change.
    return res.sendFile(indexHtml);
  }
});

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