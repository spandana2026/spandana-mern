// Handles saving uploaded files to disk (via multer) and turning a saved
// filename into the public URL the frontend uses to load it. Files are saved
// to env.UPLOADS_DIR and served statically by server.js at /api/v1/uploads
// (see app.use('/api/v1/uploads', express.static(env.UPLOADS_DIR))).
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';

if (!fs.existsSync(env.UPLOADS_DIR)) {
  fs.mkdirSync(env.UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ZIP_SIZE  = 50 * 1024 * 1024; // 50 MB

const upload    = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });
const zipUpload = multer({ storage, limits: { fileSize: MAX_ZIP_SIZE } });

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 20);
export const uploadZipSingle = zipUpload.single('file');

export function fileToUrl(filename) {
  return `/api/v1/uploads/${filename}`;
}

export const uploadService = { fileToUrl };