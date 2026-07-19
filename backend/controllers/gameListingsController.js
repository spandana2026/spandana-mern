import fs   from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import AdmZip from 'adm-zip';
import { GameListing } from '../models/GameListing.js';
import { env } from '../config/env.js';

export async function listPublic(_req, res) {
  const all = (await GameListing.getAll({ published: true })).sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(all);
}
export async function listAdmin(_req, res) {
  const all = (await GameListing.getAll()).sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(all);
}
export async function create(req, res) {
  const item = await GameListing.create(req.body);
  res.status(201).json(item);
}
export async function update(req, res) {
  const item = await GameListing.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Game not found' });
  res.json(item);
}
export async function remove(req, res) {
  const ok = await GameListing.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Game not found' });
  res.json({ success: true });
}

// Extracts an uploaded .zip of a browser game and returns a URL to its
// entry point (index.html), found at the top level or one folder deep.
export async function uploadZip(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (path.extname(req.file.originalname).toLowerCase() !== '.zip') {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Only .zip files are supported.' });
  }

  const id       = randomUUID();
  const destDir  = path.join(env.UPLOADS_DIR, 'games', id);

  try {
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(destDir, true);
    fs.unlinkSync(req.file.path);

    const findIndex = (dir, depth = 0) => {
      if (depth > 2) return null;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const direct = entries.find(e => e.isFile() && e.name.toLowerCase() === 'index.html');
      if (direct) return path.join(dir, direct.name);
      for (const e of entries) {
        if (e.isDirectory()) {
          const found = findIndex(path.join(dir, e.name), depth + 1);
          if (found) return found;
        }
      }
      return null;
    };

    const indexPath = findIndex(destDir);
    if (!indexPath) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return res.status(400).json({ error: 'No index.html found in the uploaded zip.' });
    }

    const relPath = path.relative(env.UPLOADS_DIR, indexPath).split(path.sep).join('/');
    res.json({ url: `/api/v1/uploads/${relPath}` });
  } catch (err) {
    fs.rmSync(destDir, { recursive: true, force: true });
    res.status(500).json({ error: 'Failed to extract zip: ' + err.message });
  }
}
