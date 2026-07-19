import { Team } from '../models/Team.js';
import { Settings } from '../models/Settings.js';

export async function listAll(_req, res) {
  res.json(await Team.getAll());
}

// Fix: frontend team-portal.tsx called GET /api/team/resources, which had
// no matching backend route at all (instant 404 -> forced logout).
// Resources are managed by the admin as part of the Settings CMS
// (see admin/tabs/TeamTab.tsx -> updateSettings(["teamResources"], ...)),
// so we simply read them back out of the published (live) settings.
export async function getResources(_req, res) {
  const settings = await Settings.getLive();
  res.json(Array.isArray(settings.teamResources) ? settings.teamResources : []);
}
export async function create(req, res) {
  const member = await Team.create(req.body);
  res.status(201).json(member);
}
export async function update(req, res) {
  const member = await Team.update(req.params.id, req.body);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
}
export async function remove(req, res) {
  const ok = await Team.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true });
}
