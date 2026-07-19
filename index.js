// Entry point for single-app hosting (e.g. Hostinger Node.js Web Apps).
// Hostinger deploys one GitHub-connected app per website and runs whatever
// "Entry file" is configured — pointing it at this file (or running
// `npm start`, which calls this file) starts the real server in backend/,
// which by now also serves the built frontend/dist as static files (see
// backend/server.js) — so frontend + backend ship as a single deployment.
import './backend/server.js';