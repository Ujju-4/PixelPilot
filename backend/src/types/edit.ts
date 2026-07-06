import type { ImageAsset } from './image';

export type OutputFormat = 'png' | 'jpeg' | 'webp' | 'avif';
export type ResizeFit = 'cover' | 'contain' | 'fill';
export type UpscaleFactor = 2 | 4 | 8;
export type BackgroundMode = 'transparent' | 'white' | 'color' | 'gradient';

export interface ResizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface ResizeRequestBody {
  presetId?: string;
  width?: number;
  height?: number;
  fit?: ResizeFit;
}

export interface CompressRequestBody {
  format: OutputFormat;
  quality: number;
}

export interface ConvertRequestBody {
  format: OutputFormat;
}

export interface UpscaleRequestBody {
  factor: UpscaleFactor;
}

export interface EnhanceRequestBody {
  sharpen?: boolean;
  denoise?: boolean;
  colorCorrect?: boolean;
  lighting?: boolean;
  contrast?: boolean;
  whiteBalance?: boolean;
}

export interface RemoveBackgroundRequestBody {
  mode: BackgroundMode;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface RemoveObjectRequestBody {
  maskDataUrl: string;
}

export interface MagicExpandRequestBody {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface OcrResult {
  text: string;
  wordCount: number;
  averageConfidence: number | null;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface ImageMetadataResult {
  dimensions: { width: number | null; height: number | null };
  camera: { make: string | null; model: string | null };
  lens: { model: string | null };
  iso: number | null;
  exposureTime: number | null;
  fNumber: number | null;
  focalLength: number | null;
  dateTaken: string | null;
  gps: GpsCoordinates | null;
  hasExifData: boolean;
  raw: Record<string, unknown>;
}

export interface EditResult {
  asset: ImageAsset;
}

export interface CompressPreviewResult {
  sizeBytes: number;
  format: OutputFormat;
  quality: number;
}
