import { apiUpload } from '@/services/apiClient';
import type { UploadImageResponse } from '@/types/image';

const API_BASE_URL =
  'https://backend-production-18f78.up.railway.app/api';

export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', file);
  return apiUpload<UploadImageResponse>('/images/upload', formData, onProgress);
}

export function getImageFileUrl(id: string): string {
  return `${API_BASE_URL}/images/${id}/file`;
}