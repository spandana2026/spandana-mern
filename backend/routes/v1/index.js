import { Router }  from 'express';
import auth         from './auth.js';
import settings     from './settings.js';
import events       from './events.js';
import volunteers   from './volunteers.js';
import blog         from './blog.js';
import team         from './team.js';
import gallery      from './gallery.js';
import programs     from './programs.js';
import newsletter   from './newsletter.js';
import contact      from './contact.js';
import testimonials from './testimonials.js';
import values       from './values.js';
import stories      from './stories.js';
import upload       from './upload.js';
import communityInitiatives from './communityInitiatives.js';
import gameListings from './gameListings.js';
import coloring     from './coloring.js';
import mongoose     from 'mongoose';
import { isDbConnected } from '../../config/db.js';
import { env } from '../../config/env.js';

const router = Router();

// Fix: Dashboard tab status endpoint (used by pages/admin/tabs/DashboardTab.tsx)
router.get('/status', (_req, res) => {
  const connected = isDbConnected();
  res.json({
    status: 'ok',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    storage: {
      mongo: {
        configured: !!env.MONGO_URI,
        connected,
        mode: connected ? 'mongodb' : 'json-fallback',
        readyState: mongoose.connection.readyState,
      },
    },
  });
});

// Fix #22: API documentation endpoint — lists all available routes
router.get('/docs', (_req, res) => {
  res.json({
    version: 'v1',
    baseUrl: '/api/v1',
    authentication: 'Bearer token via Authorization header. Get token from POST /api/v1/auth/admin/login',
    pagination: 'All list endpoints accept ?page=1&limit=20',
    endpoints: [
      { method: 'GET',    path: '/settings',                    auth: false, description: 'Live site settings' },
      { method: 'GET',    path: '/admin/settings/draft',        auth: true,  description: 'Draft settings' },
      { method: 'PUT',    path: '/admin/settings',              auth: true,  description: 'Save settings draft' },
      { method: 'POST',   path: '/admin/settings/publish',      auth: true,  description: 'Publish draft to live' },
      { method: 'GET',    path: '/events',                      auth: false, description: 'List events (paginated)' },
      { method: 'GET',    path: '/events/:id',                  auth: false, description: 'Get event by ID' },
      { method: 'POST',   path: '/admin/events',                auth: true,  description: 'Create event' },
      { method: 'PUT',    path: '/admin/events/:id',            auth: true,  description: 'Update event' },
      { method: 'DELETE', path: '/admin/events/:id',            auth: true,  description: 'Delete event' },
      { method: 'GET',    path: '/blog',                        auth: false, description: 'List blog posts (paginated)' },
      { method: 'POST',   path: '/volunteers',                  auth: false, description: 'Submit volunteer application' },
      { method: 'GET',    path: '/admin/volunteers',            auth: true,  description: 'List volunteer applications (paginated)' },
      { method: 'GET',    path: '/gallery',                     auth: false, description: 'List gallery items (paginated)' },
      { method: 'POST',   path: '/admin/gallery/bulk',          auth: true,  description: 'Bulk upload images' },
      { method: 'GET',    path: '/programs',                    auth: false, description: 'List health programs (paginated)' },
      { method: 'POST',   path: '/newsletter/subscribe',        auth: false, description: 'Subscribe to newsletter' },
      { method: 'POST',   path: '/newsletter/unsubscribe',      auth: false, description: 'Unsubscribe from newsletter' },
      { method: 'POST',   path: '/contact',                     auth: false, description: 'Submit contact form' },
      { method: 'POST',   path: '/auth/admin/login',            auth: false, description: 'Admin login — returns token' },
      { method: 'POST',   path: '/auth/team/login',             auth: false, description: 'Team member login' },
      { method: 'GET',    path: '/admin/team',                  auth: true,  description: 'List team members' },
      { method: 'GET',    path: '/testimonials',                auth: false, description: 'List testimonials (paginated)' },
      { method: 'GET',    path: '/values',                      auth: false, description: 'List values (paginated)' },
      { method: 'GET',    path: '/stories',                     auth: false, description: 'List stories (paginated)' },
      { method: 'GET',    path: '/team/resources',              auth: true,  description: 'List team portal resources (team-member token)' },
      { method: 'GET',    path: '/visitor-count',                auth: false, description: 'Get live visitor counter' },
      { method: 'POST',   path: '/visitor-count/increment',      auth: false, description: 'Increment live visitor counter' },
      { method: 'POST',   path: '/coloring/generate',            auth: false, description: 'Generate a colouring-page SVG from a text prompt' },
      { method: 'POST',   path: '/newsletter/sync-to-sheet',     auth: true,  description: 'Sync subscribers to a configured Google Sheets webhook' },
    ],
  });
});

router.use(auth);
router.use(settings);
router.use(events);
router.use(volunteers);
router.use(blog);
router.use(team);
router.use(gallery);
router.use(programs);
router.use(newsletter);
router.use(contact);
router.use(testimonials);
router.use(values);
router.use(stories);
router.use(upload);
router.use(communityInitiatives);
router.use(gameListings);
router.use(coloring);

export default router;
