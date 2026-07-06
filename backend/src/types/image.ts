export type SupportedImageFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'avif' | 'heic';
export type AssetDirectory = 'uploads' | 'outputs';

export interface ImageAsset {
  id: string;
  originalName: string;
  storedFilename: string;
  mimeType: string;
  format: string;
  sizeBytes: number;
  createdAt: string;
  directory: AssetDirectory;
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
  /** Variance of a Laplacian-filtered grayscale image. Lower = blurrier. */
  varianceScore: number;
  isBlurry: boolean;
}

export interface NoiseAnalysis {
  /** Mean absolute difference between the original and a denoised copy. Higher = noisier. */
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
