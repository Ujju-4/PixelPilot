import type { ResizePreset } from '../types/edit';

export const RESIZE_PRESETS: ResizePreset[] = [
  { id: 'instagram-square', label: 'Instagram · Square Post', width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'Instagram · Story / Reel', width: 1080, height: 1920 },
  { id: 'linkedin-post', label: 'LinkedIn · Post', width: 1200, height: 627 },
  { id: 'youtube-thumbnail', label: 'YouTube · Thumbnail', width: 1280, height: 720 },
  { id: 'facebook-post', label: 'Facebook · Post', width: 1200, height: 630 },
  { id: 'x-post', label: 'X (Twitter) · Post', width: 1600, height: 900 },
  { id: 'tiktok-cover', label: 'TikTok · Video Cover', width: 1080, height: 1920 },
  { id: 'pinterest-pin', label: 'Pinterest · Pin', width: 1000, height: 1500 },
];

export function findResizePreset(id: string): ResizePreset | undefined {
  return RESIZE_PRESETS.find((preset) => preset.id === id);
}
