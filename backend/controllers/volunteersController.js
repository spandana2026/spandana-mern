import { Volunteer } from '../models/Volunteer.js';
import { sendVolunteerAlert } from '../services/emailService.js';

export async function submit(req, res) {
  const doc = await Volunteer.create(req.body);
  sendVolunteerAlert(req.body).catch(() => {});  // fire-and-forget
  res.status(201).json({ success: true, id: doc.id || doc._id });
}
export async function listAll(req, res) {
  const { skip, limit } = req.pagination;
  const all   = await Volunteer.getAll();
  const total = all.length;
  res.json(all.slice(skip, skip + limit));
}
export async function remove(req, res) {
  const ok = await Volunteer.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Application not found' });
  res.json({ success: true });
}
