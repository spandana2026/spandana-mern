import { Story } from '../models/Story.js';

export async function listPublic(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Story.getAll({ published: true });
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function listAdmin(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Story.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function getOne(req, res) {
  const item = await Story.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Story not found' });
  res.json(item);
}
export async function create(req, res) {
  const item = await Story.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await Story.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Story not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await Story.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Story not found' });
  res.json({ success: true });
}
