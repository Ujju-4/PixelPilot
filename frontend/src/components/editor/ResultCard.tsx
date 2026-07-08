import { useState } from 'react';
import type { ImageAsset } from '@/types/image';
import { getImageFileUrl } from '@/services/imagesService';
import { formatBytes } from '@/utils/fileValidation';
import { DownloadIcon } from '@/components/icons/EditorIcons';
import { Button } from '@/components/ui/Button';
import { StatusLine } from '@/components/ui/StatusLine';

interface ResultCardProps {
  asset: ImageAsset;
}

function buildDownloadFilename(original: string, editedName: string): string {
  const trimmed = editedName.trim();
  if (!trimmed) return original;
  if (!trimmed.includes('.')) {
    const ext = original.split('.').pop() ?? '';
    return ext ? `${trimmed}.${ext}` : trimmed;
  }
  return trimmed;
}

function cleanDisplayName(name: string): string {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[._-]?/i;
  return uuidPattern.test(name) ? name.replace(uuidPattern, '') || 'result' : name;
}

// The export section, not an export widget: a status line, a meta row, an
// editable filename, and exactly one filled button — the single obvious
// primary action for the whole properties panel.
export function ResultCard({ asset }: ResultCardProps) {
  const previewUrl = getImageFileUrl(asset.id);
  const cleanName = cleanDisplayName(asset.originalName);
  const [filename, setFilename] = useState(cleanName);

  const downloadFilename = buildDownloadFilename(cleanName, filename);
  const downloadUrl = `${previewUrl}?download=true`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <StatusLine tone="success">Ready to export</StatusLine>
        <span className="font-mono text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
          {asset.format.toUpperCase()} · {formatBytes(asset.sizeBytes)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Filename
        </label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          onFocus={(e) => {
            const dotIdx = e.target.value.lastIndexOf('.');
            if (dotIdx > 0) e.target.setSelectionRange(0, dotIdx);
          }}
          aria-label="Download filename"
          className="w-full border-0 border-b border-border dark:border-border-dark bg-transparent px-0 py-1 font-mono text-[12px] text-ink dark:text-ink-dark focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      <Button
        href={downloadUrl}
        download={downloadFilename}
        variant="primary"
        className="w-full"
        icon={<DownloadIcon className="h-3.5 w-3.5" />}
        aria-label={`Download ${downloadFilename}`}
      >
        Download
      </Button>
    </div>
  );
}
