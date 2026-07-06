import path from 'path';
import type { ImageAsset } from '../types/image';
import { config } from '../config/env';

const assets = new Map<string, ImageAsset>();

export const imageStore = {
  save(asset: ImageAsset): ImageAsset {
    assets.set(asset.id, asset);
    return asset;
  },

  get(id: string): ImageAsset | undefined {
    return assets.get(id);
  },

  resolvePath(asset: ImageAsset): string {
    const dir = asset.directory === 'outputs' ? config.outputsDir : config.uploadsDir;
    return path.join(dir, asset.storedFilename);
  },
};
