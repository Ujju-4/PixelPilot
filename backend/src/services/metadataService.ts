import exifr from 'exifr';
import sharp from 'sharp';
import type { ImageMetadataResult } from '../types/edit';

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export async function readImageMetadata(buffer: Buffer): Promise<ImageMetadataResult> {
  const sharpMetadata = await sharp(buffer).metadata();

  let exifData: Record<string, unknown> = {};
  try {
    const parsed = await exifr.parse(buffer, { gps: true, tiff: true, exif: true });
    if (parsed) exifData = parsed as Record<string, unknown>;
  } catch {
    // No EXIF block, or it's malformed -- both are normal for non-camera images.
    exifData = {};
  }

  const latitude = toNumberOrNull(exifData.latitude);
  const longitude = toNumberOrNull(exifData.longitude);

  const dateTaken = exifData.DateTimeOriginal ?? exifData.CreateDate ?? exifData.ModifyDate;

  const camera = { make: toStringOrNull(exifData.Make), model: toStringOrNull(exifData.Model) };
  const lens = { model: toStringOrNull(exifData.LensModel) };
  const iso = toNumberOrNull(exifData.ISO);
  const exposureTime = toNumberOrNull(exifData.ExposureTime);
  const fNumber = toNumberOrNull(exifData.FNumber);
  const focalLength = toNumberOrNull(exifData.FocalLength);
  const gps = latitude !== null && longitude !== null ? { latitude, longitude } : null;

  const hasExifData = Boolean(
    camera.make || camera.model || lens.model || iso !== null || exposureTime !== null || fNumber !== null || focalLength !== null || gps || dateTaken,
  );

  return {
    dimensions: {
      width: sharpMetadata.width ?? null,
      height: sharpMetadata.height ?? null,
    },
    camera,
    lens,
    iso,
    exposureTime,
    fNumber,
    focalLength,
    dateTaken: dateTaken instanceof Date ? dateTaken.toISOString() : toStringOrNull(dateTaken),
    gps,
    hasExifData,
    raw: exifData,
  };
}
