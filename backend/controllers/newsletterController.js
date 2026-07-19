import { Newsletter } from '../models/Newsletter.js';
import { sendNewsletterAlert } from '../services/emailService.js';
import { env } from '../config/env.js';

export async function subscribe(req, res) {
  const { email } = req.body;
  const existing = await Newsletter.getAll(r => r.email === email && r.active !== false);
  if (existing.length > 0) return res.status(409).json({ error: 'Already subscribed' });
  await Newsletter.create({ email });
  const total = (await Newsletter.getAll()).length;
  sendNewsletterAlert(email, total).catch(() => {});
  res.status(201).json({ success: true });
}
export async function unsubscribe(req, res) {
  const { email } = req.body;
  const list = await Newsletter.getAll(r => r.email === email);
  if (list.length === 0) return res.status(404).json({ error: 'Email not found' });
  await Newsletter.update(list[0].id || list[0]._id, { active: false });
  res.json({ success: true });
}
export async function listAll(req, res) {
  const all = await Newsletter.getAll();
  const subscribers = all
    .filter(r => (typeof r === 'string' ? true : r.active !== false))
    .map(r => (typeof r === 'string' ? r : r.email))
    .filter(Boolean);
  res.json({ subscribers });
}
export async function syncToSheet(_req, res) {
  // Fix: this was hardcoded to always fail with a bare 501. Real Google
  // Sheets sync needs credentials (a service account or an Apps Script Web
  // App URL) that only the site owner can provide — there's none in this
  // project's .env. Rather than fake success, this now does a real sync
  // whenever GOOGLE_SHEETS_WEBHOOK_URL is configured (a free, no-code Google
  // Apps Script "Web App" that appends rows to a Sheet — see DEPLOYMENT.md),
  // and otherwise returns a clear, actionable message. The admin UI already
  // has a working "Download CSV" button as an immediate alternative either way.
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return res.status(200).json({
      success: false,
      error: 'Google Sheets sync isn\'t configured yet. Set GOOGLE_SHEETS_WEBHOOK_URL in the backend .env, or use "Download CSV" for now.',
    });
  }

  const all = await Newsletter.getAll();
  const subscribers = all
    .filter((r) => (typeof r === 'string' ? true : r.active !== false))
    .map((r) => (typeof r === 'string' ? r : r.email))
    .filter(Boolean);

  try {
    const resp = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribers }),
    });
    if (!resp.ok) throw new Error(`Webhook responded with ${resp.status}`);
    res.json({ success: true, synced: subscribers.length });
  } catch (err) {
    res.status(502).json({ success: false, error: `Could not reach the Google Sheets webhook: ${err.message}` });
  }
}
