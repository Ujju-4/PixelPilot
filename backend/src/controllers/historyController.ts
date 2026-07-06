import fs from 'fs';
import type { NextFunction, Request, Response } from 'express';
import { historyService, type HistoryEntry } from '../services/historyService';
import { imageStore } from '../services/imageStore';
import type { ApiResponse } from '../types/api';
import { badRequest, notFound } from '../utils/errors';

export function listHistory(
  _req: Request,
  res: Response<ApiResponse<HistoryEntry[]>>,
): void {
  res.status(200).json({ success: true, data: historyService.list() });
}

export function getHistoryEntry(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<HistoryEntry>>,
  next: NextFunction,
): void {
  try {
    const entry = historyService.get(req.params.id);
    if (!entry) throw notFound(`No history entry found with id "${req.params.id}"`);
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
}

export function renameHistoryEntry(
  req: Request<{ id: string }, unknown, { name: string }>,
  res: Response<ApiResponse<HistoryEntry>>,
  next: NextFunction,
): void {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('"name" must be a non-empty string.');
    }
    const updated = historyService.rename(req.params.id, name);
    if (!updated) throw notFound(`No history entry found with id "${req.params.id}"`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export function deleteHistoryEntry(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<{ deleted: true }>>,
  next: NextFunction,
): void {
  try {
    const entry = historyService.get(req.params.id);
    if (!entry) throw notFound(`No history entry found with id "${req.params.id}"`);

    // Delete stored image files linked to this session (uploaded + any outputs).
    const allAssets = [entry.uploadedAsset, ...entry.editedAssets];
    for (const asset of allAssets) {
      const filePath = imageStore.resolvePath(asset);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }

    historyService.delete(req.params.id);
    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
}
