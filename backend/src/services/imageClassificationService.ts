import sharp from 'sharp';

export type ImageType =
  | 'text-document'
  | 'portrait'
  | 'product'
  | 'screenshot'
  | 'empty-space'
  | 'photograph';

export interface ClassificationSignals {
  /** Fraction of 10px-border pixels that are near-white (>220 on all channels). */
  whiteBorderRatio: number;
  /** Fraction of pixels in skin-tone HSV range (H 0-25°, S 20-75%, V 35-100%). */
  skinToneRatio: number;
  /** Number of unique 4-bit-quantised colours relative to total pixels.
   *  Low = uniform/synthetic; high = photographic. */
  normalisedColorDiversity: number;
  /** Overall greyscale standard deviation. Very low = nearly uniform / empty. */
  brightnessStdDev: number;
  /** Fraction of 16×16 pixel blocks whose greyscale variance is < 80.
   *  High = large flat UI regions (screenshot-like). */
  uniformBlockRatio: number;
}

export interface ImageClassificationResult {
  /** Most likely content types, ordered by confidence (highest first). */
  detectedTypes: ImageType[];
  /** Human-readable label for the primary detected type. */
  primaryLabel: string;
  signals: ClassificationSignals;
}

// ── Tuned thresholds ─────────────────────────────────────────────────────────
// Calibrated against synthetic and real-world images; documented so they can
// be adjusted if you observe mis-classifications on your image corpus.
const T = {
  /** whiteBorderRatio above which an image reads as "white-background" */
  WHITE_BG: 0.88,
  /** skinToneRatio above which a portrait is likely */
  SKIN_PORTRAIT: 0.05,
  /** brightnessStdDev below which we classify as empty / near-empty space */
  EMPTY_SPACE_STDDEV: 6,
  /** uniformBlockRatio above which we consider the image screenshot-like */
  SCREENSHOT_UNIFORM: 0.84,
  /** normalisedColorDiversity above which the image is considered photographic */
  PHOTO_DIVERSITY: 0.08,
};

const LABEL: Record<ImageType, string> = {
  'text-document': 'Text / document',
  portrait: 'Portrait',
  product: 'Product image',
  screenshot: 'Screenshot or UI',
  'empty-space': 'Mostly empty space',
  photograph: 'Photograph',
};

// ── Signal extraction ─────────────────────────────────────────────────────────

async function extractSignals(buffer: Buffer): Promise<ClassificationSignals> {
  const ANALYSIS_SIZE = 160;

  const { data: raw, info } = await sharp(buffer)
    .resize(ANALYSIS_SIZE, ANALYSIS_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const BORDER = 10;

  let whiteBorder = 0;
  let borderTotal = 0;
  let skinCount = 0;
  const palette = new Set<number>();
  let uniformBlockLow = 0;
  const BLOCK = 16;
  let blockTotal = 0;

  // Single pass: white-border and skin-tone counting + colour diversity.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 3;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];

      // Border check
      const isBorder = x < BORDER || x >= W - BORDER || y < BORDER || y >= H - BORDER;
      if (isBorder) {
        borderTotal++;
        if (r > 220 && g > 220 && b > 220) whiteBorder++;
      }

      // Skin-tone (HSV)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      if (max > 0) {
        const s = diff / max;
        const v = max / 255;
        let h = 0;
        if (diff > 0) {
          if (max === r) h = 60 * ((g - b) / diff);
          else if (max === g) h = 60 * (2 + (b - r) / diff);
          else h = 60 * (4 + (r - g) / diff);
          if (h < 0) h += 360;
        }
        const hueOk = (h >= 0 && h <= 25) || (h >= 340 && h <= 360);
        if (hueOk && s >= 0.18 && s <= 0.78 && v >= 0.32) skinCount++;
      }

      // Colour diversity (4-bit quantised)
      const qr = r >> 4;
      const qg = g >> 4;
      const qb = b >> 4;
      palette.add((qr << 8) | (qg << 4) | qb);
    }
  }

  // Block variance pass
  for (let by = 0; by + BLOCK <= H; by += BLOCK) {
    for (let bx = 0; bx + BLOCK <= W; bx += BLOCK) {
      let sum = 0;
      let sumSq = 0;
      const count = BLOCK * BLOCK;
      for (let y = by; y < by + BLOCK; y++) {
        for (let x = bx; x < bx + BLOCK; x++) {
          const idx = (y * W + x) * 3;
          const grey = Math.round(0.299 * raw[idx] + 0.587 * raw[idx + 1] + 0.114 * raw[idx + 2]);
          sum += grey;
          sumSq += grey * grey;
        }
      }
      const mean = sum / count;
      const variance = sumSq / count - mean * mean;
      if (variance < 80) uniformBlockLow++;
      blockTotal++;
    }
  }

  const total = W * H;
  const stats = await sharp(buffer).greyscale().stats();

  return {
    whiteBorderRatio: borderTotal > 0 ? whiteBorder / borderTotal : 0,
    skinToneRatio: skinCount / total,
    normalisedColorDiversity: palette.size / total,
    brightnessStdDev: stats.channels[0].stdev,
    uniformBlockRatio: blockTotal > 0 ? uniformBlockLow / blockTotal : 0,
  };
}

// ── Classification logic ───────────────────────────────────────────────────────

function classify(signals: ClassificationSignals): ImageType[] {
  const types: ImageType[] = [];

  if (signals.brightnessStdDev < T.EMPTY_SPACE_STDDEV) {
    types.push('empty-space');
    return types;
  }

  if (signals.whiteBorderRatio > T.WHITE_BG) {
    // White-background image — distinguish text/document vs product.
    if (signals.normalisedColorDiversity < 0.003) {
      // Very few colours + white border → text-heavy document or OCR target.
      types.push('text-document');
    } else {
      types.push('product');
    }
  }

  if (signals.skinToneRatio > T.SKIN_PORTRAIT) {
    types.push('portrait');
  }

  if (
    signals.uniformBlockRatio > T.SCREENSHOT_UNIFORM &&
    !types.includes('text-document') &&
    signals.normalisedColorDiversity < 0.01
  ) {
    types.push('screenshot');
  }

  if (types.length === 0 || signals.normalisedColorDiversity > T.PHOTO_DIVERSITY) {
    if (!types.includes('portrait')) {
      types.push('photograph');
    }
  }

  return types.length > 0 ? types : ['photograph'];
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function classifyImage(buffer: Buffer): Promise<ImageClassificationResult> {
  const signals = await extractSignals(buffer);
  const detectedTypes = classify(signals);
  const primaryLabel = LABEL[detectedTypes[0]];

  return { detectedTypes, primaryLabel, signals };
}
