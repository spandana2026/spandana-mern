import { Program } from '../models/Program.js';

export async function listPublic(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Program.getAll({ published: true });
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function listAdmin(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Program.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function getOne(req, res) {
  const item = await Program.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Program not found' });
  res.json(item);
}
export async function create(req, res) {
  const item = await Program.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await Program.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Program not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await Program.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Program not found' });
  res.json({ success: true });
}
