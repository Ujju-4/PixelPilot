import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ImageAsset } from '@/types/image';
import { getImageFileUrl } from '@/services/imagesService';
import { formatBytes } from '@/utils/fileValidation';
import { DownloadIcon } from '@/components/icons/EditorIcons';

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

export function ResultCard({ asset }: ResultCardProps) {
  const previewUrl = getImageFileUrl(asset.id);
  const cleanName = cleanDisplayName(asset.originalName);
  const [filename, setFilename] = useState(cleanName);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadFilename = buildDownloadFilename(cleanName, filename);
  const downloadUrl = `${previewUrl}?download=true`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 rounded border border-success/20 bg-success-subtle dark:border-success/15 dark:bg-success/8 p-2.5"
    >
      {/* Status row */}
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-success">Ready to export</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-secondary dark:text-ink-dark-secondary">
        <span>{asset.format.toUpperCase()}</span>
        <span className="text-ink-tertiary dark:text-ink-dark-tertiary">·</span>
        <span>{formatBytes(asset.sizeBytes)}</span>
        {asset.operation && (
          <>
            <span className="text-ink-tertiary dark:text-ink-dark-tertiary">·</span>
            <span>{asset.operation}</span>
          </>
        )}
      </div>

      {/* Filename editor */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Filename
        </label>
        <input
          ref={inputRef}
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          onFocus={(e) => {
            const dotIdx = e.target.value.lastIndexOf('.');
            if (dotIdx > 0) e.target.setSelectionRange(0, dotIdx);
          }}
          aria-label="Download filename"
          className="w-full rounded border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark px-2 py-1 font-mono text-[11px] text-ink dark:text-ink-dark focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      {/* Download button */}
      <a
        href={downloadUrl}
        download={downloadFilename}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-ink dark:bg-ink-dark px-3 py-1.5 text-xs font-semibold text-canvas dark:text-canvas-dark shadow-sm transition-all hover:opacity-85"
        aria-label={`Download ${downloadFilename}`}
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        Download
      </a>
    </motion.div>
  );
}
