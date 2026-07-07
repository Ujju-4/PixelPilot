import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { compressImage, previewCompression } from '@/services/editsService';
import type { OutputFormat, EditResult } from '@/types/edit';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { formatBytes } from '@/utils/fileValidation';
import { ApiRequestError } from '@/services/apiClient';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WEBP' },
  { value: 'avif', label: 'AVIF' }, { value: 'png', label: 'PNG' },
];

export function CompressTool({ imageId, onEditResult }: { imageId: string; onEditResult?: (r: EditResult) => void }) {
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(75);
  const [previewBytes, setPreviewBytes] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setPreviewLoading(true);
    const t = setTimeout(() => {
      previewCompression(imageId, format, quality)
        .then((r) => setPreviewBytes(r.sizeBytes))
        .catch(() => setPreviewBytes(null))
        .finally(() => setPreviewLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [imageId, format, quality]);

  const mutation = useMutation({
    mutationFn: () => compressImage(imageId, format, quality),
    onSuccess: (r) => onEditResult?.(r),
  });

  const errorMessage = mutation.error instanceof ApiRequestError ? mutation.error.message : mutation.error ? 'Compression failed.' : null;

  return (
    <div className="flex flex-col gap-4">
      <OptionGroup label="Output format" value={format} onChange={setFormat} options={FORMAT_OPTIONS} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
            Quality — {quality}
          </span>
          <span className="font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
            {previewLoading ? '…' : previewBytes !== null ? `≈ ${formatBytes(previewBytes)}` : '—'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full bg-border/50 dark:bg-border-dark/50 accent-accent cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[10px] text-ink-secondary/50 dark:text-ink-dark-secondary/50">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={mutation.isPending} className="self-start">
        Apply compression
      </Button>

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && (
        <p className="text-xs font-medium text-success">✓ Applied — see Export below to download</p>
      )}
    </div>
  );
}
