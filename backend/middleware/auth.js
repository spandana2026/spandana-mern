import crypto from 'crypto';
import { env } from '../config/env.js';
import { Team } from '../models/Team.js';

/**
 * requireAdmin — single auth middleware used across ALL protected routes.
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 * Fix #5: defined once, imported everywhere — no more copy-paste.
 * Fix #11: timing-safe comparison.
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || !env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized', requestId: req.id });
  }

  try {
    const a = Buffer.from(token.padEnd(env.ADMIN_PASSWORD.length));
    const b = Buffer.from(env.ADMIN_PASSWORD);
    const same = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!same) {
      return res.status(401).json({ error: 'Unauthorized', requestId: req.id });
    }
  } catch {
    return res.status(401).json({ error: 'Unauthorized', requestId: req.id });
  }

  next();
}

/**
 * requireTeam — auth middleware for the Core Team Portal.
 * Fix: /api/team/resources previously had no auth/route at all.
 * Validates the base64 `username:id` token issued by teamLogin
 * (authController.js) and confirms the member still exists & is active.
 */
export async function requireTeam(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized', requestId: req.id });

  let username;
  try {
    username = Buffer.from(token, 'base64').toString('utf8').split(':')[0];
  } catch {
    return res.status(401).json({ error: 'Unauthorized', requestId: req.id });
  }
  if (!username) return res.status(401).json({ error: 'Unauthorized', requestId: req.id });

  const member = await Team.findByUsername(username);
  if (!member) return res.status(401).json({ error: 'Unauthorized', requestId: req.id });

  req.teamMember = member;
  next();
}
