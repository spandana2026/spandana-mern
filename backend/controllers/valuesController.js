import { Value } from '../models/Value.js';

export async function listPublic(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Value.getAll({ published: true });
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function listAdmin(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Value.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function getOne(req, res) {
  const item = await Value.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Value not found' });
  res.json(item);
}
export async function create(req, res) {
  const item = await Value.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await Value.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Value not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await Value.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Value not found' });
  res.json({ success: true });
}
