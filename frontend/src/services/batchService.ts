import { apiUpload } from '@/services/apiClient';
import {
  getHistory,
  deleteHistoryEntryLocal,
  renameHistoryEntryLocal,
} from '@/services/localHistory';
import type { BatchUploadResponse, HistoryEntry } from '@/types/history';

export function batchUploadImages(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<BatchUploadResponse> {
  const formData = new FormData();
  for (const file of files) formData.append('images', file);
  return apiUpload<BatchUploadResponse>('/batch/upload', formData, onProgress);
}

export function buildBatchDownloadUrl(ids: string[]): string {
  const API_BASE_URL = import.meta.env.PROD
    ? 'https://backend-production-18f78.up.railway.app/api'
    : 'http://localhost:4000/api';

  return `${API_BASE_URL}/batch/download?ids=${ids.join(',')}`;
}

export async function listHistory(): Promise<HistoryEntry[]> {
  return getHistory();
}

export async function deleteHistoryEntry(
  id: string,
): Promise<{ deleted: true }> {
  deleteHistoryEntryLocal(id);
  return { deleted: true };
}

export async function renameHistoryEntry(
  id: string,
  name: string,
): Promise<HistoryEntry> {
  return renameHistoryEntryLocal(id, name);
}