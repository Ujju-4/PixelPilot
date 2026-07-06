import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { NextFunction, Request, Response } from 'express';
import { analyzeImage } from '../services/imageAnalysisService';
import { buildRecommendations } from '../services/recommendationService';
import { imageStore } from '../services/imageStore';
import { historyService } from '../services/historyService';
import type { ApiResponse } from '../types/api';
import type { ImageAsset, UploadImageResponse } from '../types/image';
import { badRequest, notFound } from '../utils/errors';

const FORMAT_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export async function uploadImage(
  req: Request,
  res: Response<ApiResponse<UploadImageResponse>>,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      throw badRequest('No image file was provided. Attach a file under the "image" field.');
    }

    const buffer = fs.readFileSync(req.file.path);

    let analysis;
    let detectedFormat: string;
    try {
      const metadata = await sharp(buffer).metadata();
      detectedFormat = metadata.format ?? path.extname(req.file.originalname).replace('.', '').toLowerCase();
      analysis = await analyzeImage(buffer);
    } catch {
      fs.unlinkSync(req.file.path);
      throw badRequest(
        'This file could not be decoded as an image. The format may be corrupted or unsupported by the server\'s image library.',
      );
    }

    const asset: ImageAsset = {
      id: uuidv4(),
      originalName: req.file.originalname,
      storedFilename: path.basename(req.file.path),
      mimeType: FORMAT_MIME_TYPES[detectedFormat] ?? req.file.mimetype,
      format: detectedFormat,
      sizeBytes: req.file.size,
      createdAt: new Date().toISOString(),
      directory: 'uploads',
    };
    imageStore.save(asset);

    // Persist to disk-based history so the history panel survives server restarts.
    historyService.save({
      id: asset.id,
      name: asset.originalName,
      createdAt: asset.createdAt,
      uploadedAsset: asset,
      editedAssets: [],
    });

    const recommendations = buildRecommendations(analysis);

    const body: ApiResponse<UploadImageResponse> = {
      success: true,
      data: { asset, analysis, recommendations },
    };
    res.status(201).json(body);
  } catch (error) {
    next(error);
  }
}

export function getImageFile(req: Request, res: Response, next: NextFunction): void {
  try {
    const asset = imageStore.get(req.params.id);
    if (!asset) {
      throw notFound(`No image found with id "${req.params.id}"`);
    }

    const filePath = imageStore.resolvePath(asset);
    if (!fs.existsSync(filePath)) {
      throw notFound('The image file is no longer available on the server.');
    }

    res.setHeader('Content-Type', asset.mimeType);
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${asset.originalName}"`);
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
}
