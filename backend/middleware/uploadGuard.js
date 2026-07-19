import fs from 'fs';

/**
 * uploadGuard — validates uploaded files by checking their magic bytes.
 * Fix #12: prevents MIME type spoofing attacks.
 * Checks the actual binary content of the file, not the Content-Type header.
 *
 * Attach after multer:
 *   router.post('/upload', upload.single('file'), uploadGuard(['image']), ctrl.upload)
 */

const SIGNATURES = {
  image: [
    { bytes: [0xFF, 0xD8, 0xFF],             label: 'JPEG' },
    { bytes: [0x89, 0x50, 0x4E, 0x47],        label: 'PNG'  },
    { bytes: [0x47, 0x49, 0x46],              label: 'GIF'  },
    { bytes: [0x52, 0x49, 0x46, 0x46],        label: 'WEBP' },
    { bytes: [0x42, 0x4D],                    label: 'BMP'  },
  ],
};

function matchesSig(buf, sig) {
  return sig.bytes.every((b, i) => buf[i] === b);
}

export function uploadGuard(allowedTypes = ['image']) {
  return (req, res, next) => {
    const files = req.files
      ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat())
      : (req.file ? [req.file] : []);

    if (files.length === 0) return next();

    for (const file of files) {
      const buf = fs.readFileSync(file.path).slice(0, 8);
      const allowed = allowedTypes.flatMap(t => SIGNATURES[t] || []);
      const valid = allowed.some(sig => matchesSig(buf, sig));
      if (!valid) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          error: `Invalid file type. File "${file.originalname}" is not a recognised ${allowedTypes.join('/')} file.`,
          requestId: req.id,
        });
      }
    }
    next();
  };
}
