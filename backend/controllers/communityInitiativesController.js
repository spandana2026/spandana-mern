import { CommunityInitiative } from '../models/CommunityInitiative.js';

export async function listPublic(_req, res) {
  const all = (await CommunityInitiative.getAll({ published: true })).sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(all);
}
export async function listAdmin(_req, res) {
  const all = (await CommunityInitiative.getAll()).sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(all);
}
export async function create(req, res) {
  const item = await CommunityInitiative.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await CommunityInitiative.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Initiative not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await CommunityInitiative.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Initiative not found' });
  res.json({ success: true });
}
