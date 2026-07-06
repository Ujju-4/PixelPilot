import sharp from 'sharp';
import { classifyImage } from './imageClassificationService';
import type {
  BlurAnalysis,
  ContrastAnalysis,
  ExposureAnalysis,
  ExposureClassification,
  ImageAnalysis,
  NoiseAnalysis,
  ResolutionAnalysis,
  RotationAnalysis,
} from '../types/image';

// Thresholds are heuristic but deterministic and documented, not arbitrary "fake" magic.
const LOW_RESOLUTION_MIN_SHORT_EDGE_PX = 600;
const BLUR_VARIANCE_THRESHOLD = 50; // Laplacian variance below this reads as visibly soft/blurry.
const NOISE_SCORE_THRESHOLD = 4; // Mean abs diff vs. denoised copy, in 0-255 luma units.
const CONTRAST_STDDEV_THRESHOLD = 35; // Below this the image reads visually flat.
const UNDEREXPOSED_MEAN_THRESHOLD = 70; // 0-255 scale.
const OVEREXPOSED_MEAN_THRESHOLD = 190;

// 3x3 discrete Laplacian kernel: highlights edges; its variance is a standard
// focus/sharpness proxy (higher variance = more high-frequency detail = sharper).
const LAPLACIAN_KERNEL = {
  width: 3,
  height: 3,
  kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

async function analyzeResolution(width: number, height: number): Promise<ResolutionAnalysis> {
  const megapixels = Math.round((width * height) / 1_000_000 * 100) / 100;
  const shortEdge = Math.min(width, height);
  return {
    width,
    height,
    megapixels,
    isLowResolution: shortEdge < LOW_RESOLUTION_MIN_SHORT_EDGE_PX,
  };
}

async function analyzeBlur(buffer: Buffer): Promise<BlurAnalysis> {
  // Two-step pipeline is required: chaining .convolve() directly after .greyscale()
  // on a decoded image produces an all-zero result in sharp/libvips (verified via
  // synthetic test images). Re-materializing the greyscale raw buffer as a fresh
  // sharp() input before convolving avoids the issue.
  const greyscale = await sharp(buffer)
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = await sharp(greyscale.data, {
    raw: { width: greyscale.info.width, height: greyscale.info.height, channels: 1 },
  })
    .toColourspace('b-w')
    .convolve({ ...LAPLACIAN_KERNEL, scale: 1, offset: 0 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const variance = computeVariance(data, info.width * info.height);

  return {
    varianceScore: Math.round(variance * 100) / 100,
    isBlurry: variance < BLUR_VARIANCE_THRESHOLD,
  };
}

async function analyzeNoise(buffer: Buffer): Promise<NoiseAnalysis> {
  const greyscale = sharp(buffer).greyscale();
  const original = await greyscale.clone().raw().toBuffer({ resolveWithObject: true });
  const denoised = await greyscale
    .clone()
    .median(3)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const length = Math.min(original.data.length, denoised.data.length);
  let sumAbsDiff = 0;
  for (let i = 0; i < length; i += 1) {
    sumAbsDiff += Math.abs(original.data[i] - denoised.data[i]);
  }
  const score = sumAbsDiff / length;

  return {
    score: Math.round(score * 100) / 100,
    isNoisy: score > NOISE_SCORE_THRESHOLD,
  };
}

async function analyzeExposureAndContrast(
  buffer: Buffer,
): Promise<{ exposure: ExposureAnalysis; contrast: ContrastAnalysis }> {
  const stats = await sharp(buffer).greyscale().stats();
  const channel = stats.channels[0];
  const meanBrightness = Math.round(channel.mean * 100) / 100;
  const stdDev = Math.round(channel.stdev * 100) / 100;

  let classification: ExposureClassification = 'normal';
  if (meanBrightness < UNDEREXPOSED_MEAN_THRESHOLD) classification = 'underexposed';
  else if (meanBrightness > OVEREXPOSED_MEAN_THRESHOLD) classification = 'overexposed';

  return {
    exposure: { meanBrightness, classification },
    contrast: { stdDev, isLowContrast: stdDev < CONTRAST_STDDEV_THRESHOLD },
  };
}

function analyzeRotation(exifOrientation: number | undefined): RotationAnalysis {
  const orientation = exifOrientation ?? 1;
  return {
    exifOrientation: orientation,
    needsCorrection: orientation !== 1,
  };
}

function computeVariance(data: Buffer, sampleCount: number): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) sum += data[i];
  const mean = sum / sampleCount;

  let sumSquaredDiff = 0;
  for (let i = 0; i < data.length; i += 1) {
    const diff = data[i] - mean;
    sumSquaredDiff += diff * diff;
  }
  return sumSquaredDiff / sampleCount;
}

export async function analyzeImage(buffer: Buffer): Promise<ImageAnalysis> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const [resolution, blur, noise, exposureAndContrast, classification] = await Promise.all([
    analyzeResolution(width, height),
    analyzeBlur(buffer),
    analyzeNoise(buffer),
    analyzeExposureAndContrast(buffer),
    classifyImage(buffer),
  ]);

  return {
    resolution,
    blur,
    noise,
    exposure: exposureAndContrast.exposure,
    contrast: exposureAndContrast.contrast,
    rotation: analyzeRotation(metadata.orientation),
    hasAlphaChannel: Boolean(metadata.hasAlpha),
    classification: {
      detectedTypes: classification.detectedTypes,
      primaryLabel: classification.primaryLabel,
    },
  };
}
