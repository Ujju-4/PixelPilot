import { apiUpload } from '@/services/apiClient';
import type { UploadImageResponse } from '@/types/image';

export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', file);
  return apiUpload<UploadImageResponse>('/images/upload', formData, onProgress);
}

export function getImageFileUrl(id: string): string {
  return `/api/images/${id}/file`;
}
