import { Testimonial } from '../models/Testimonial.js';

export async function listPublic(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Testimonial.getAll({ published: true });
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function listAdmin(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Testimonial.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function getOne(req, res) {
  const item = await Testimonial.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Testimonial not found' });
  res.json(item);
}
export async function create(req, res) {
  const item = await Testimonial.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await Testimonial.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Testimonial not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await Testimonial.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Testimonial not found' });
  res.json({ success: true });
}
