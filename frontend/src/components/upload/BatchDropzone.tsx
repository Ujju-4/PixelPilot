import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { batchUploadImages, buildBatchDownloadUrl } from '@/services/batchService';
import { validateImageFile } from '@/utils/fileValidation';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/types/image';
import type { UploadImageResponse } from '@/types/image';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { UploadCloudIcon, CheckCircleIcon, AlertTriangleIcon, SpinnerIcon } from '@/components/icons/UploadIcons';
import { DownloadIcon } from '@/components/icons/EditorIcons';
import { ApiRequestError } from '@/services/apiClient';
import { formatBytes } from '@/utils/fileValidation';

const ACCEPT_ATTR = ACCEPTED_IMAGE_MIME_TYPES.join(',');
const MAX_FILES = 20;

interface QueuedFile {
  file: File;
  validationError?: string;
}

function FileStatusRow({ result }: { result: UploadImageResponse }) {
  const { asset, recommendations } = result;
  const important = recommendations.filter((r) => r.severity === 'important');
  return (
    <div className="flex items-center gap-2 py-1.5">
      <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{asset.originalName}</p>
        <p className="font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
          {asset.format.toUpperCase()} · {formatBytes(asset.sizeBytes)}
          {important.length > 0 && ` · ${important.length} issue${important.length > 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}

export function BatchDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (validFiles: File[]) => batchUploadImages(validFiles, setProgress),
  });

  // Paste support for multiple images.
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files = items
        .filter((i) => i.type.startsWith('image/'))
        .map((i) => i.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) addFiles(files);
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((incoming: File[]) => {
    const next: QueuedFile[] = incoming.slice(0, MAX_FILES).map((file) => {
      const result = validateImageFile(file);
      return { file, validationError: result.valid ? undefined : result.reason };
    });
    setQueue((prev) => {
      const combined = [...prev, ...next];
      return combined.slice(0, MAX_FILES);
    });
    mutation.reset();
  }, [mutation]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const validFiles = queue.filter((q) => !q.validationError).map((q) => q.file);
  const hasInvalid = queue.some((q) => q.validationError);

  const handleStart = () => {
    if (validFiles.length === 0) return;
    setProgress(0);
    mutation.mutate(validFiles);
  };

  const handleReset = () => {
    setQueue([]);
    setProgress(0);
    mutation.reset();
  };

  const downloadUrl = mutation.isSuccess
    ? buildBatchDownloadUrl(mutation.data.results.map((r) => r.asset.id))
    : null;

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? mutation.error.message
      : mutation.error
        ? 'Batch upload failed.'
        : null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Dropzone */}
      {!mutation.isPending && !mutation.isSuccess && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload multiple images — drag, click, or paste"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          className={[
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors duration-150',
            isDragActive
              ? 'border-accent bg-accent-subtle dark:bg-accent-subtle-dark'
              : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-ink/30 dark:hover:border-ink-dark/30',
          ].join(' ')}
        >
          <UploadCloudIcon className={`h-8 w-8 ${isDragActive ? 'text-accent' : 'text-ink-secondary dark:text-ink-dark-secondary'}`} />
          <div>
            <p className="font-medium">{isDragActive ? 'Drop to add images' : 'Drag & drop multiple images'}</p>
            <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-dark-secondary">
              Up to {MAX_FILES} images · PNG, JPG, WEBP, AVIF, HEIC
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Queue */}
      <AnimatePresence>
        {queue.length > 0 && !mutation.isPending && !mutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {queue.length} file{queue.length !== 1 ? 's' : ''} queued
                {hasInvalid && <span className="ml-1.5 text-danger">(some invalid)</span>}
              </p>
              <button type="button" onClick={handleReset} className="text-xs text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark">
                Clear all
              </button>
            </div>
            {queue.map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-DEFAULT border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1.5">
                {item.validationError ? (
                  <AlertTriangleIcon className="h-4 w-4 shrink-0 text-danger" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.file.name}</p>
                  {item.validationError && (
                    <p className="text-xs text-danger">{item.validationError}</p>
                  )}
                </div>
                <p className="shrink-0 font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
                  {formatBytes(item.file.size)}
                </p>
                <button
                  type="button"
                  onClick={() => removeFromQueue(index)}
                  className="shrink-0 text-xs text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                  aria-label={`Remove ${item.file.name} from queue`}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleStart}
              disabled={validFiles.length === 0}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-DEFAULT bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Process {validFiles.length} image{validFiles.length !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {mutation.isPending && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <SpinnerIcon className="h-4 w-4" />
            <span>Uploading and analysing {validFiles.length} images…</span>
          </div>
          <ProgressBar percent={progress} />
        </div>
      )}

      {/* Error */}
      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={handleReset} />}

      {/* Results */}
      {mutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-success">
              {mutation.data.results.length} image{mutation.data.results.length !== 1 ? 's' : ''} processed
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`pixelpilot-batch-${Date.now()}.zip`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-1 text-sm font-medium transition-colors hover:border-ink/20 dark:hover:border-ink-dark/20"
              >
                <DownloadIcon className="h-4 w-4" />
                Download all as ZIP
              </a>
            )}
          </div>

          <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 divide-y divide-border dark:divide-border-dark">
            {mutation.data.results.map((result) => (
              <FileStatusRow key={result.asset.id} result={result} />
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-start rounded-DEFAULT border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink/20"
          >
            Process more images
          </button>
        </motion.div>
      )}
    </div>
  );
}
