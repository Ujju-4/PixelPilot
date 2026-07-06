import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ImageAsset } from '@/types/image';
import { getImageFileUrl } from '@/services/imagesService';
import { formatBytes } from '@/utils/fileValidation';
import { DownloadIcon } from '@/components/icons/EditorIcons';
import { ImageViewer } from '@/components/ui/ImageViewer';

interface ResultCardProps {
  asset: ImageAsset;
}

function buildDownloadFilename(original: string, editedName: string): string {
  const trimmed = editedName.trim();
  if (!trimmed) return original;
  // If the user didn't type an extension, carry one over from the stored asset format.
  if (!trimmed.includes('.')) {
    const ext = original.split('.').pop() ?? '';
    return ext ? `${trimmed}.${ext}` : trimmed;
  }
  return trimmed;
}

export function ResultCard({ asset }: ResultCardProps) {
  const previewUrl = getImageFileUrl(asset.id);
  const [filename, setFilename] = useState(asset.originalName);
  const [showViewer, setShowViewer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadFilename = buildDownloadFilename(asset.originalName, filename);
  const downloadUrl = `${previewUrl}?download=true`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 rounded-lg border border-success/30 bg-success-subtle dark:border-success/20 dark:bg-success/10 p-2"
    >
      {/* Preview toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowViewer((v) => !v)}
          className="shrink-0 overflow-hidden rounded-DEFAULT border border-border dark:border-border-dark"
          aria-label="Toggle image preview"
        >
          <img
            src={previewUrl}
            alt={`Result: ${asset.originalName}`}
            className="h-16 w-16 object-cover"
          />
        </button>

        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-success">Edit applied</p>
          <p className="font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
            {asset.format.toUpperCase()} · {formatBytes(asset.sizeBytes)}
            {asset.operation && ` · ${asset.operation}`}
          </p>

          {/* Filename editor */}
          <label className="flex items-center gap-1 text-xs">
            <span className="shrink-0 text-ink-secondary dark:text-ink-dark-secondary">Save as:</span>
            <input
              ref={inputRef}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onFocus={(e) => {
                // Select the name portion (before the extension) on focus.
                const dotIdx = e.target.value.lastIndexOf('.');
                if (dotIdx > 0) e.target.setSelectionRange(0, dotIdx);
              }}
              aria-label="Download filename"
              className="min-w-0 flex-1 rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-1.5 py-0.5 font-mono text-xs focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        {/* Download button */}
        <a
          href={downloadUrl}
          download={downloadFilename}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink dark:bg-ink-dark px-4 py-1.5 text-sm font-medium text-canvas dark:text-canvas-dark shadow-soft transition-all hover:opacity-90 hover:shadow-card"
          aria-label={`Download ${downloadFilename}`}
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>

      {/* Expandable image viewer with zoom/pan/fullscreen */}
      {showViewer && (
        <ImageViewer
          src={previewUrl}
          alt={`Result preview: ${downloadFilename}`}
          className="max-h-72"
        />
      )}
    </motion.div>
  );
}
