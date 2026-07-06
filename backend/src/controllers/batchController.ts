import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { NextFunction, Request, Response } from 'express';
import { analyzeImage } from '../services/imageAnalysisService';
import { buildRecommendations } from '../services/recommendationService';
import { imageStore } from '../services/imageStore';
import { historyService } from '../services/historyService';
import type { ApiResponse } from '../types/api';
import type { ImageAsset, UploadImageResponse } from '../types/image';
import { badRequest } from '../utils/errors';

const FORMAT_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
};

async function processSingleFile(file: Express.Multer.File): Promise<UploadImageResponse> {
  const buffer = fs.readFileSync(file.path);
  const metadata = await sharp(buffer).metadata();
  const detectedFormat = metadata.format ?? path.extname(file.originalname).replace('.', '').toLowerCase();

  const analysis = await analyzeImage(buffer);

  const asset: ImageAsset = {
    id: uuidv4(),
    originalName: file.originalname,
    storedFilename: path.basename(file.path),
    mimeType: FORMAT_MIME_TYPES[detectedFormat] ?? file.mimetype,
    format: detectedFormat,
    sizeBytes: file.size,
    createdAt: new Date().toISOString(),
    directory: 'uploads',
  };

  imageStore.save(asset);
  historyService.save({
    id: asset.id,
    name: asset.originalName,
    createdAt: asset.createdAt,
    uploadedAsset: asset,
    editedAssets: [],
  });

  return { asset, analysis, recommendations: buildRecommendations(analysis) };
}

export async function batchUpload(
  req: Request,
  res: Response<ApiResponse<{ results: UploadImageResponse[] }>>,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw badRequest('No image files provided. Attach files under the "images" field.');
    }

    // Process all uploads concurrently; individual failures don't abort the batch.
    const settled = await Promise.allSettled(files.map(processSingleFile));

    const results: UploadImageResponse[] = [];
    const errors: string[] = [];

    for (let i = 0; i < settled.length; i++) {
      const outcome = settled[i];
      if (outcome.status === 'fulfilled') {
        results.push(outcome.value);
      } else {
        const name = files[i].originalname;
        errors.push(`"${name}": ${outcome.reason instanceof Error ? outcome.reason.message : 'failed'}`);
        // Clean up the stored file for failed entries.
        if (fs.existsSync(files[i].path)) fs.unlinkSync(files[i].path);
      }
    }

    res.status(200).json({
      success: true,
      data: { results },
      ...(errors.length > 0 ? { warnings: errors } : {}),
    } as ApiResponse<{ results: UploadImageResponse[] }>);
  } catch (error) {
    next(error);
  }
}

export function downloadBatchZip(req: Request, res: Response, next: NextFunction): void {
  try {
    const rawIds = req.query.ids;
    if (!rawIds || typeof rawIds !== 'string') {
      throw badRequest('Provide "ids" as a comma-separated list of asset IDs.');
    }

    const ids = rawIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      throw badRequest('"ids" must contain at least one asset ID.');
    }

    const assets: ImageAsset[] = [];
    for (const id of ids) {
      const asset = imageStore.get(id);
      if (!asset) continue;
      const filePath = imageStore.resolvePath(asset);
      if (fs.existsSync(filePath)) assets.push(asset);
    }

    if (assets.length === 0) {
      throw badRequest('None of the provided asset IDs could be found on the server.');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="pixelpilot-batch-${Date.now()}.zip"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    // De-duplicate filenames within the ZIP.
    const seen = new Map<string, number>();
    for (const asset of assets) {
      const base = asset.originalName.replace(/\.[^.]+$/, '');
      const ext = `.${asset.format}`;
      const count = seen.get(asset.originalName) ?? 0;
      const zipName = count === 0 ? asset.originalName : `${base}-${count}${ext}`;
      seen.set(asset.originalName, count + 1);

      archive.file(imageStore.resolvePath(asset), { name: zipName });
    }

    archive.on('error', (err) => next(err));
    void archive.finalize();
  } catch (error) {
    next(error);
  }
}
