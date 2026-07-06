import { apiGet, apiPost } from '@/services/apiClient';
import type {
  CompressPreviewResult,
  EditResult,
  EnhanceOptions,
  ImageMetadataResult,
  MagicExpandOptions,
  OcrResult,
  OutputFormat,
  RemoveBackgroundOptions,
  ResizeFit,
  ResizePreset,
  UpscaleFactor,
} from '@/types/edit';

export function fetchResizePresets(): Promise<ResizePreset[]> {
  return apiGet<ResizePreset[]>('/images/resize-presets');
}

export function resizeImage(
  imageId: string,
  options: { presetId?: string; width?: number; height?: number; fit?: ResizeFit },
): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/resize`, options);
}

export function compressImage(
  imageId: string,
  format: OutputFormat,
  quality: number,
): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/compress`, { format, quality });
}

export function previewCompression(
  imageId: string,
  format: OutputFormat,
  quality: number,
): Promise<CompressPreviewResult> {
  return apiPost<CompressPreviewResult>(`/images/${imageId}/compress/preview`, { format, quality });
}

export function convertImage(imageId: string, format: OutputFormat): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/convert`, { format });
}

export function upscaleImage(imageId: string, factor: UpscaleFactor): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/upscale`, { factor });
}

export function enhanceImage(imageId: string, options: EnhanceOptions): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/enhance`, options);
}

export function removeBackground(
  imageId: string,
  options: RemoveBackgroundOptions,
): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/remove-background`, options);
}

export function removeObject(imageId: string, maskDataUrl: string): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/remove-object`, { maskDataUrl });
}

export function magicExpand(imageId: string, options: MagicExpandOptions): Promise<EditResult> {
  return apiPost<EditResult>(`/images/${imageId}/expand`, options);
}

export function runOcr(imageId: string): Promise<OcrResult> {
  return apiPost<OcrResult>(`/images/${imageId}/ocr`, {});
}

export function fetchMetadata(imageId: string): Promise<ImageMetadataResult> {
  return apiGet<ImageMetadataResult>(`/images/${imageId}/metadata`);
}
