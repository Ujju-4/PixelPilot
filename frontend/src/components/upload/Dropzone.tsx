import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/types/image';
import { validateImageFile } from '@/utils/fileValidation';
import { FrameUploadIcon } from '@/components/icons/UploadIcons';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  /** 'canvas' renders on the workspace stage (adapts to light/dark).
   *  'light' is for use on a regular surface (e.g. batch page). */
  tone?: 'light' | 'canvas';
  className?: string;
}

const ACCEPT_ATTR = ACCEPTED_IMAGE_MIME_TYPES.join(',');

export function Dropzone({ onFileSelected, disabled = false, tone = 'light', className = '' }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const isCanvas = tone === 'canvas';

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

  // ─── Canvas-tone border/bg — adapts to light and dark mode ───────────────
  const canvasBorder = isDragActive
    ? 'border-accent bg-accent/[0.08]'
    : 'border-black/[0.12] hover:border-black/[0.22] hover:bg-black/[0.02] dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/[0.02]';

  // ─── Light-tone border/bg (batch page etc.) ───────────────────────────────
  const lightBorder = isDragActive
    ? 'border-accent bg-accent-subtle dark:bg-accent-subtle-dark'
    : 'border-border/60 dark:border-border-dark/60 hover:border-accent/40 dark:hover:border-accent/30 hover:bg-canvas dark:hover:bg-canvas-dark';

  // ─── Icon well — soft ambient glow behind a bracket-frame icon, not a flat filled circle ──
  const iconWellRing = isDragActive
    ? 'ring-accent/40'
    : isCanvas
      ? 'ring-black/[0.08] dark:ring-white/[0.08]'
      : 'ring-border dark:ring-border-dark';

  const iconColor = isDragActive
    ? 'text-accent'
    : isCanvas
      ? 'text-ink-secondary dark:text-white/45'
      : 'text-ink-secondary dark:text-ink-dark-secondary';

  // ─── Text colours ─────────────────────────────────────────────────────────
  const titleColor  = isCanvas ? 'text-ink dark:text-white/92'                          : 'text-ink dark:text-ink-dark';
  const subtitleColor = isCanvas ? 'text-ink-secondary dark:text-white/45'               : 'text-ink-secondary dark:text-ink-dark-secondary';
  const hintColor   = isCanvas ? 'text-ink-tertiary dark:text-white/25'                  : 'text-ink-secondary/60 dark:text-ink-dark-secondary/60';
  const errorColor  = isCanvas ? 'text-danger dark:text-red-400'                         : 'text-danger';

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
        whileHover={disabled ? undefined : { scale: 1.003 }}
        whileTap={disabled ? undefined : { scale: 0.997 }}
        className={[
          'relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-[1.5px] border-dashed px-8 text-center transition-all duration-200',
          isCanvas ? 'min-h-[340px]' : 'min-h-[260px] py-10',
          disabled ? 'cursor-not-allowed opacity-60' : '',
          isCanvas ? canvasBorder : lightBorder,
          isDragActive ? 'shadow-ambient' : '',
          className,
        ].join(' ')}
      >
        <div
          className={[
            'flex h-[52px] w-[52px] items-center justify-center rounded-full ring-1 transition-all duration-300',
            isDragActive ? 'animate-breathe bg-accent/10' : 'bg-black/[0.02] dark:bg-white/[0.03]',
            iconWellRing,
          ].join(' ')}
        >
          <FrameUploadIcon className={['h-[22px] w-[22px] transition-colors duration-200', iconColor].join(' ')} />
        </div>

        <div>
          <p className={`text-[16px] font-semibold tracking-[-0.01em] ${titleColor}`}>
            {isDragActive ? 'Release to upload' : 'Drop an image here'}
          </p>
          <p className={`mt-1.5 text-sm ${subtitleColor}`}>
            or <span className="font-medium text-accent">browse files</span> · paste from clipboard
          </p>
          <p className={`mt-3 text-[10.5px] font-medium uppercase tracking-[0.08em] ${hintColor}`}>
            PNG · JPG · WEBP · AVIF · HEIC — up to 25&nbsp;MB
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
        <p role="alert" className={`mt-2 text-sm ${errorColor}`}>
          {validationError}
        </p>
      )}
    </div>
  );
}
