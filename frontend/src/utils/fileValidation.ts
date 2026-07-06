import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_MIME_TYPES } from '@/types/image';

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  const extensionOk = ACCEPTED_IMAGE_EXTENSIONS.includes(extension);
  const mimeOk = ACCEPTED_IMAGE_MIME_TYPES.includes(file.type);

  if (!extensionOk && !mimeOk) {
    return {
      valid: false,
      reason: 'Unsupported format. Use PNG, JPG, JPEG, WEBP, AVIF, or HEIC.',
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      reason: `File is too large (${formatBytes(file.size)}). Maximum size is ${formatBytes(MAX_UPLOAD_SIZE_BYTES)}.`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
