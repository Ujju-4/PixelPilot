import path from 'path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { badRequest } from '../utils/errors';

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
]);

const ACCEPTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, config.uploadsDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    callback(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ACCEPTED_MIME_TYPES.has(file.mimetype);
  const extOk = ACCEPTED_EXTENSIONS.has(ext);

  // Some browsers/OSes send a generic mimetype for HEIC/AVIF; fall back to extension check.
  if (mimeOk || extOk) {
    callback(null, true);
    return;
  }

  callback(badRequest(`Unsupported file type "${file.mimetype || ext}". Accepted formats: PNG, JPG, JPEG, WEBP, AVIF, HEIC.`));
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxUploadSizeBytes, files: 1 },
}).single('image');
