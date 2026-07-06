import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/types/image';
import { validateImageFile } from '@/utils/fileValidation';
import { UploadCloudIcon } from '@/components/icons/UploadIcons';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT_ATTR = ACCEPTED_IMAGE_MIME_TYPES.join(',');

export function Dropzone({ onFileSelected, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const result = validateImageFile(file);
      if (!result.valid) {
        setValidationError(result.reason ?? 'This file could not be used.');
        return;
      }
      setValidationError(null);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files?.[0]);
  };

  useEffect(() => {
    if (disabled) return;
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) { handleFile(file); event.preventDefault(); }
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, handleFile]);

  return (
    <div className="w-full">
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload an image by dragging it here, clicking to browse, or pasting from your clipboard"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled) inputRef.current?.click(); }
        }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        whileTap={disabled ? undefined : { scale: 0.998 }}
        className={[
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200',
          disabled ? 'cursor-not-allowed opacity-60' : '',
          isDragActive
            ? 'border-accent bg-accent-subtle dark:bg-accent-subtle-dark scale-[1.01]'
            : 'border-border/60 dark:border-border-dark/60 hover:border-accent/40 dark:hover:border-accent/30 hover:bg-canvas dark:hover:bg-canvas-dark',
        ].join(' ')}
      >
        <div className={[
          'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200',
          isDragActive ? 'bg-accent/15' : 'bg-border/30 dark:bg-border-dark/30',
        ].join(' ')}>
          <UploadCloudIcon className={`h-6 w-6 ${isDragActive ? 'text-accent' : 'text-ink-secondary dark:text-ink-dark-secondary'}`} />
        </div>

        <div>
          <p className="font-semibold text-base">
            {isDragActive ? 'Release to upload' : 'Drop an image here'}
          </p>
          <p className="mt-1 text-sm text-ink-secondary dark:text-ink-dark-secondary">
            or <span className="font-medium text-accent">browse files</span> · paste from clipboard
          </p>
          <p className="mt-2 text-xs text-ink-secondary/60 dark:text-ink-dark-secondary/60">
            PNG · JPG · WEBP · AVIF · HEIC — up to 25 MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
        />
      </motion.div>

      {validationError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {validationError}
        </p>
      )}
    </div>
  );
}
