import type { UploadImageResponse } from '@/types/image';
import type { ImageAsset } from '@/types/image';

export interface BatchUploadResponse {
  results: UploadImageResponse[];
}

export interface HistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  uploadedAsset: ImageAsset;
  editedAssets: ImageAsset[];
}
