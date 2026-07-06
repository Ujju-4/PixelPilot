import sharp from 'sharp';
import type {
  CompressRequestBody,
  EnhanceRequestBody,
  OutputFormat,
  ResizeFit,
  UpscaleFactor,
} from '../types/edit';
import { badRequest } from '../utils/errors';

export interface EncodedImage {
  buffer: Buffer;
  format: OutputFormat;
  sizeBytes: number;
}

const DEFAULT_QUALITY: Record<OutputFormat, number> = {
  png: 90,
  jpeg: 85,
  webp: 85,
  avif: 60,
};

async function encode(pipeline: sharp.Sharp, format: OutputFormat, quality?: number): Promise<EncodedImage> {
  const q = quality ?? DEFAULT_QUALITY[format];

  let encoded: sharp.Sharp;
  switch (format) {
    case 'png':
      encoded = pipeline.png({ quality: q, compressionLevel: 9 });
      break;
    case 'jpeg':
      encoded = pipeline.jpeg({ quality: q, mozjpeg: true });
      break;
    case 'webp':
      encoded = pipeline.webp({ quality: q });
      break;
    case 'avif':
      encoded = pipeline.avif({ quality: q });
      break;
    default:
      throw badRequest(`Unsupported output format "${format}"`);
  }

  const buffer = await encoded.toBuffer();
  return { buffer, format, sizeBytes: buffer.length };
}

export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  fit: ResizeFit,
  outputFormat: OutputFormat,
): Promise<EncodedImage> {
  if (width <= 0 || height <= 0) {
    throw badRequest('Width and height must both be greater than zero.');
  }
  if (width > 8000 || height > 8000) {
    throw badRequest('Width and height must each be 8000px or smaller.');
  }

  const pipeline = sharp(buffer).resize(Math.round(width), Math.round(height), {
    fit,
    background: { r: 255, g: 255, b: 255, alpha: fit === 'contain' ? 0 : 1 },
  });

  return encode(pipeline, outputFormat);
}

export async function convertFormat(buffer: Buffer, format: OutputFormat): Promise<EncodedImage> {
  return encode(sharp(buffer), format);
}

export async function compressImage(buffer: Buffer, options: CompressRequestBody): Promise<EncodedImage> {
  if (options.quality < 1 || options.quality > 100) {
    throw badRequest('Quality must be between 1 and 100.');
  }
  return encode(sharp(buffer), options.format, options.quality);
}

const UPSCALE_MAX_OUTPUT_DIMENSION = 8000;

export async function upscaleImage(
  buffer: Buffer,
  factor: UpscaleFactor,
  outputFormat: OutputFormat,
): Promise<EncodedImage> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const targetWidth = width * factor;
  const targetHeight = height * factor;

  if (targetWidth > UPSCALE_MAX_OUTPUT_DIMENSION || targetHeight > UPSCALE_MAX_OUTPUT_DIMENSION) {
    throw badRequest(
      `Upscaling ${width}x${height} by ${factor}x would exceed the ${UPSCALE_MAX_OUTPUT_DIMENSION}px output limit. Try a smaller factor.`,
    );
  }

  // High-quality Lanczos3 resampling. This is the documented fallback path for
  // environments where a GPU-backed Real-ESRGAN model isn't available -- it sharpens
  // edges far better than bilinear/bicubic scaling, though it is not a generative
  // super-resolution network.
  const pipeline = sharp(buffer).resize(targetWidth, targetHeight, { kernel: 'lanczos3', fit: 'fill' });

  return encode(pipeline, outputFormat);
}

interface ChannelStats {
  r: number;
  g: number;
  b: number;
  overallMean: number;
}

async function readChannelStats(buffer: Buffer): Promise<ChannelStats> {
  const stats = await sharp(buffer).stats();
  const [r, g, b] = stats.channels;
  const overallMean = (r.mean + g.mean + b.mean) / 3;
  return { r: r.mean, g: g.mean, b: b.mean, overallMean };
}

export async function enhanceImage(
  buffer: Buffer,
  options: EnhanceRequestBody,
  outputFormat: OutputFormat,
): Promise<EncodedImage> {
  const stats = await readChannelStats(buffer);
  let pipeline = sharp(buffer);

  if (options.whiteBalance) {
    // Gray-world white balance: scale each channel so its mean matches the
    // overall (R+G+B)/3 mean, neutralizing a color cast.
    const safe = (mean: number) => Math.min(3, Math.max(0.3, stats.overallMean / Math.max(mean, 1)));
    pipeline = pipeline.linear([safe(stats.r), safe(stats.g), safe(stats.b)], [0, 0, 0]);
  }

  if (options.lighting) {
    // Linear brightness scale toward a mid-gray target. Sharp's gamma() only accepts
    // 1.0-3.0 and can only brighten, so a multiplicative scale is used instead --
    // it works symmetrically for both under- and over-exposed images.
    const targetMean = 128;
    const currentMean = Math.min(254, Math.max(1, stats.overallMean));
    const multiplier = Math.min(2.5, Math.max(0.4, targetMean / currentMean));
    pipeline = pipeline.linear(multiplier, 0);
  }

  if (options.contrast) {
    pipeline = pipeline.normalise();
  }

  if (options.colorCorrect) {
    pipeline = pipeline.modulate({ saturation: 1.15 });
  }

  if (options.denoise) {
    pipeline = pipeline.median(3);
  }

  if (options.sharpen) {
    pipeline = pipeline.sharpen({ sigma: 1.2 });
  }

  return encode(pipeline, outputFormat);
}
