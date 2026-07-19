import { BlogPost } from '../models/BlogPost.js';

export async function listPublic(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await BlogPost.getAll({ published: true });
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function listAdmin(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await BlogPost.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function getOne(req, res) {
  const item = await BlogPost.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Blog post not found' });
  res.json(item);
}
export async function create(req, res) {
  const item = await BlogPost.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await BlogPost.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Blog post not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await BlogPost.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Blog post not found' });
  res.json({ success: true });
}
