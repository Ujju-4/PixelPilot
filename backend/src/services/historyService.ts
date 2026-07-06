import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import type { ImageAsset } from '../types/image';

export interface HistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  uploadedAsset: ImageAsset;
  editedAssets: ImageAsset[];
}

function entryPath(id: string): string {
  return path.join(config.historyDir, `${id}.json`);
}

export const historyService = {
  save(entry: HistoryEntry): HistoryEntry {
    fs.writeFileSync(entryPath(entry.id), JSON.stringify(entry, null, 2), 'utf-8');
    return entry;
  },

  get(id: string): HistoryEntry | null {
    const p = entryPath(id);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8')) as HistoryEntry;
    } catch {
      return null;
    }
  },

  list(): HistoryEntry[] {
    const files = fs.readdirSync(config.historyDir).filter((f) => f.endsWith('.json'));
    const entries: HistoryEntry[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(config.historyDir, file), 'utf-8');
        entries.push(JSON.parse(raw) as HistoryEntry);
      } catch {
        // skip corrupted entry
      }
    }
    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  rename(id: string, name: string): HistoryEntry | null {
    const entry = this.get(id);
    if (!entry) return null;
    entry.name = name.trim().slice(0, 200);
    return this.save(entry);
  },

  addEditedAsset(id: string, asset: ImageAsset): HistoryEntry | null {
    const entry = this.get(id);
    if (!entry) return null;
    entry.editedAssets.push(asset);
    return this.save(entry);
  },

  delete(id: string): boolean {
    const p = entryPath(id);
    if (!fs.existsSync(p)) return false;
    fs.unlinkSync(p);
    return true;
  },
};
