import { fileToUrl } from '../services/uploadService.js';

export async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: fileToUrl(req.file.filename) });
}
