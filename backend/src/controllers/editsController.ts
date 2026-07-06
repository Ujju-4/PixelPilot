import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { NextFunction, Request, Response } from 'express';
import {
  compressImage,
  convertFormat,
  enhanceImage,
  resizeImage,
  upscaleImage,
  type EncodedImage,
} from '../services/editPipelineService';
import { removeBackground } from '../services/backgroundRemovalService';
import { removeObject } from '../services/objectRemovalService';
import { magicExpand } from '../services/magicExpandService';
import { extractText } from '../services/ocrService';
import { readImageMetadata } from '../services/metadataService';
import { findResizePreset, RESIZE_PRESETS } from '../services/resizePresets';
import { imageStore } from '../services/imageStore';
import { config } from '../config/env';
import type { ApiResponse } from '../types/api';
import type { ImageAsset } from '../types/image';
import type {
  CompressPreviewResult,
  CompressRequestBody,
  ConvertRequestBody,
  EditResult,
  EnhanceRequestBody,
  ImageMetadataResult,
  MagicExpandRequestBody,
  OcrResult,
  OutputFormat,
  RemoveBackgroundRequestBody,
  RemoveObjectRequestBody,
  ResizeRequestBody,
  UpscaleFactor,
} from '../types/edit';
import { badRequest, notFound } from '../utils/errors';

const FORMAT_MIME_TYPES: Record<OutputFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
};

const VALID_FORMATS: OutputFormat[] = ['png', 'jpeg', 'webp', 'avif'];
const VALID_UPSCALE_FACTORS: UpscaleFactor[] = [2, 4, 8];

function loadSourceAsset(id: string): ImageAsset {
  const asset = imageStore.get(id);
  if (!asset) {
    throw notFound(`No image found with id "${id}"`);
  }
  return asset;
}

function loadSourceBuffer(asset: ImageAsset): Buffer {
  const filePath = imageStore.resolvePath(asset);
  if (!fs.existsSync(filePath)) {
    throw notFound('The source image file is no longer available on the server.');
  }
  return fs.readFileSync(filePath);
}

function deriveOutputName(originalName: string, operation: string, format: OutputFormat): string {
  const base = originalName.replace(/\.[^.]+$/, '');
  return `${base}-${operation}.${format}`;
}

function persistOutput(source: ImageAsset, encoded: EncodedImage, operation: string): ImageAsset {
  const filename = `${uuidv4()}.${encoded.format}`;
  const outputPath = path.join(config.outputsDir, filename);
  fs.writeFileSync(outputPath, encoded.buffer);

  const asset: ImageAsset = {
    id: uuidv4(),
    originalName: deriveOutputName(source.originalName, operation, encoded.format),
    storedFilename: filename,
    mimeType: FORMAT_MIME_TYPES[encoded.format],
    format: encoded.format,
    sizeBytes: encoded.sizeBytes,
    createdAt: new Date().toISOString(),
    directory: 'outputs',
    sourceAssetId: source.id,
    operation,
  };

  return imageStore.save(asset);
}

function resolveOutputFormat(requested: string | undefined, fallback: string): OutputFormat {
  const candidate = (requested ?? fallback).toLowerCase();
  const normalized = candidate === 'jpg' ? 'jpeg' : candidate;
  if (!VALID_FORMATS.includes(normalized as OutputFormat)) {
    throw badRequest(`Unsupported format "${requested}". Use one of: png, jpeg, webp, avif.`);
  }
  return normalized as OutputFormat;
}

export function listResizePresets(_req: Request, res: Response<ApiResponse<typeof RESIZE_PRESETS>>): void {
  res.status(200).json({ success: true, data: RESIZE_PRESETS });
}

export async function resize(
  req: Request<{ id: string }, unknown, ResizeRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    let width = req.body.width;
    let height = req.body.height;

    if (req.body.presetId) {
      const preset = findResizePreset(req.body.presetId);
      if (!preset) {
        throw badRequest(`Unknown resize preset "${req.body.presetId}"`);
      }
      width = preset.width;
      height = preset.height;
    }

    if (!width || !height) {
      throw badRequest('Provide either a "presetId" or both "width" and "height".');
    }

    const fit = req.body.fit ?? 'cover';
    const outputFormat = resolveOutputFormat(undefined, source.format);
    const encoded = await resizeImage(buffer, width, height, fit, outputFormat);
    const asset = persistOutput(source, encoded, 'resized');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function compress(
  req: Request<{ id: string }, unknown, CompressRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);
    const format = resolveOutputFormat(req.body.format, source.format);

    const encoded = await compressImage(buffer, { format, quality: req.body.quality });
    const asset = persistOutput(source, encoded, 'compressed');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function compressPreview(
  req: Request<{ id: string }, unknown, CompressRequestBody>,
  res: Response<ApiResponse<CompressPreviewResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);
    const format = resolveOutputFormat(req.body.format, source.format);

    const encoded = await compressImage(buffer, { format, quality: req.body.quality });

    res.status(200).json({
      success: true,
      data: { sizeBytes: encoded.sizeBytes, format, quality: req.body.quality },
    });
  } catch (error) {
    next(error);
  }
}

export async function convert(
  req: Request<{ id: string }, unknown, ConvertRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);
    const format = resolveOutputFormat(req.body.format, source.format);

    const encoded = await convertFormat(buffer, format);
    const asset = persistOutput(source, encoded, 'converted');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function upscale(
  req: Request<{ id: string }, unknown, { factor: number }>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    const factor = req.body.factor;
    if (!VALID_UPSCALE_FACTORS.includes(factor as UpscaleFactor)) {
      throw badRequest('Upscale "factor" must be one of: 2, 4, 8.');
    }

    const outputFormat = resolveOutputFormat(undefined, source.format);
    const encoded = await upscaleImage(buffer, factor as UpscaleFactor, outputFormat);
    const asset = persistOutput(source, encoded, `upscaled-${factor}x`);

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function enhance(
  req: Request<{ id: string }, unknown, EnhanceRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    const hasAnyOption = Object.values(req.body).some(Boolean);
    if (!hasAnyOption) {
      throw badRequest(
        'Select at least one enhancement (sharpen, denoise, colorCorrect, lighting, contrast, whiteBalance).',
      );
    }

    const outputFormat = resolveOutputFormat(undefined, source.format);
    const encoded = await enhanceImage(buffer, req.body, outputFormat);
    const asset = persistOutput(source, encoded, 'enhanced');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function removeBackgroundHandler(
  req: Request<{ id: string }, unknown, RemoveBackgroundRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    if (!req.body.mode) {
      throw badRequest('A background "mode" is required: transparent, white, color, or gradient.');
    }

    const result = await removeBackground(buffer, req.body);
    const encoded: EncodedImage = {
      buffer: result.buffer,
      format: result.format,
      sizeBytes: result.buffer.length,
    };
    const asset = persistOutput(source, encoded, 'background-removed');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function removeObjectHandler(
  req: Request<{ id: string }, unknown, RemoveObjectRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    if (!req.body.maskDataUrl) {
      throw badRequest('"maskDataUrl" is required. Paint over the object you want to remove first.');
    }

    const resultBuffer = await removeObject(buffer, req.body.maskDataUrl);
    const encoded: EncodedImage = { buffer: resultBuffer, format: 'png', sizeBytes: resultBuffer.length };
    const asset = persistOutput(source, encoded, 'object-removed');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function magicExpandHandler(
  req: Request<{ id: string }, unknown, MagicExpandRequestBody>,
  res: Response<ApiResponse<EditResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);

    const { top = 0, right = 0, bottom = 0, left = 0 } = req.body;
    const resultBuffer = await magicExpand(buffer, { top, right, bottom, left });
    const encoded: EncodedImage = { buffer: resultBuffer, format: 'png', sizeBytes: resultBuffer.length };
    const asset = persistOutput(source, encoded, 'expanded');

    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
}

export async function ocrHandler(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<OcrResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const filePath = imageStore.resolvePath(source);
    if (!fs.existsSync(filePath)) {
      throw notFound('The source image file is no longer available on the server.');
    }

    const result = await extractText(filePath);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function metadataHandler(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ImageMetadataResult>>,
  next: NextFunction,
): Promise<void> {
  try {
    const source = loadSourceAsset(req.params.id);
    const buffer = loadSourceBuffer(source);
    const metadata = await readImageMetadata(buffer);

    res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    next(error);
  }
}
