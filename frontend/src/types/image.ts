export interface ImageAsset {
  id: string;
  originalName: string;
  storedFilename: string;
  mimeType: string;
  format: string;
  sizeBytes: number;
  createdAt: string;
  directory: 'uploads' | 'outputs';
  sourceAssetId?: string;
  operation?: string;
}

export interface ResolutionAnalysis {
  width: number;
  height: number;
  megapixels: number;
  isLowResolution: boolean;
}

export interface BlurAnalysis {
  varianceScore: number;
  isBlurry: boolean;
}

export interface NoiseAnalysis {
  score: number;
  isNoisy: boolean;
}

export type ExposureClassification = 'underexposed' | 'normal' | 'overexposed';

export interface ExposureAnalysis {
  meanBrightness: number;
  classification: ExposureClassification;
}

export interface ContrastAnalysis {
  stdDev: number;
  isLowContrast: boolean;
}

export interface RotationAnalysis {
  exifOrientation: number;
  needsCorrection: boolean;
}

export interface ImageAnalysis {
  resolution: ResolutionAnalysis;
  blur: BlurAnalysis;
  noise: NoiseAnalysis;
  exposure: ExposureAnalysis;
  contrast: ContrastAnalysis;
  rotation: RotationAnalysis;
  hasAlphaChannel: boolean;
  classification: {
    detectedTypes: string[];
    primaryLabel: string;
  };
}

export type RecommendationSeverity = 'info' | 'suggested' | 'important';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: RecommendationSeverity;
}

export interface UploadImageResponse {
  asset: ImageAsset;
  analysis: ImageAnalysis;
  recommendations: Recommendation[];
}

export const ACCEPTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'];

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
];
