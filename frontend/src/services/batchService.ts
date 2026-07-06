import { apiGet, apiUpload } from '@/services/apiClient';
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
  return `/api/batch/download?ids=${ids.join(',')}`;
}

export function listHistory(): Promise<HistoryEntry[]> {
  return apiGet<HistoryEntry[]>('/history');
}

export function deleteHistoryEntry(id: string): Promise<{ deleted: true }> {
  return fetch(`/api/history/${id}`, { method: 'DELETE' })
    .then((r) => r.json())
    .then((b) => b.data);
}

export function renameHistoryEntry(id: string, name: string): Promise<HistoryEntry> {
  return fetch(`/api/history/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
    .then((r) => r.json())
    .then((b) => b.data);
}
