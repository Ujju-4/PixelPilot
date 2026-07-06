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
  if (ACCEPTED_MIME_TYPES.has(file.mimetype) || ACCEPTED_EXTENSIONS.has(ext)) {
    callback(null, true);
  } else {
    callback(
      badRequest(
        `Unsupported file type "${file.mimetype || ext}". Accepted: PNG, JPG, JPEG, WEBP, AVIF, HEIC.`,
      ),
    );
  }
};

export const uploadBatchImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxUploadSizeBytes, files: 20 },
}).array('images', 20);
