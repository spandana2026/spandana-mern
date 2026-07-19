import crypto from 'crypto';
import bcrypt  from 'bcrypt';
import { env } from '../config/env.js';
import { Team, verifyPassword } from '../models/Team.js';

// Fix #8: Admin login — timing-safe password comparison
export async function adminLogin(req, res) {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const a    = Buffer.from(password.padEnd(env.ADMIN_PASSWORD.length));
  const b    = Buffer.from(env.ADMIN_PASSWORD);
  const same = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!same) return res.status(401).json({ error: 'Invalid password' });

  res.json({ success: true, token: env.ADMIN_PASSWORD, role: 'admin' });
}

// Team member login — bcrypt verified
export async function teamLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const member = await Team.findByUsername(username);
  if (!member) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await verifyPassword(password, member.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Return a safe token — in production replace with JWT
  const token = Buffer.from(`${username}:${member._id || member.id}`).toString('base64');
  const safeMember = { name: member.name, username, role: member.role };
  // Fix: frontend (team-portal.tsx) reads `member` from the response —
  // return both the flat fields (kept for backwards compatibility) and
  // a `member` object so the contract matches what the UI expects.
  res.json({ success: true, token, name: member.name, role: member.role, member: safeMember });
}

export async function logout(_req, res) {
  res.json({ success: true, message: 'Logged out' });
}
