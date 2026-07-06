import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { upscaleImage } from '@/services/editsService';
import type { UpscaleFactor, EditResult } from '@/types/edit';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Button } from '@/components/ui/Button';
import { ResultCard } from '@/components/editor/ResultCard';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ApiRequestError } from '@/services/apiClient';

const FACTOR_OPTIONS: { value: '2'|'4'|'8'; label: string }[] = [
  { value: '2', label: '2×' }, { value: '4', label: '4×' }, { value: '8', label: '8×' },
];

export function UpscaleTool({ imageId, onEditResult }: { imageId: string; onEditResult?: (r: EditResult) => void }) {
  const [factor, setFactor] = useState<'2'|'4'|'8'>('2');
  const mutation = useMutation({
    mutationFn: () => upscaleImage(imageId, Number(factor) as UpscaleFactor),
    onSuccess: (r) => onEditResult?.(r),
  });
  const errorMessage = mutation.error instanceof ApiRequestError ? mutation.error.message : mutation.error ? 'Upscaling failed.' : null;
  return (
    <div className="flex flex-col gap-4">
      <OptionGroup label="Scale factor" value={factor} onChange={setFactor} options={FACTOR_OPTIONS} />
      <p className="text-xs text-ink-secondary/70 dark:text-ink-dark-secondary/70">
        Uses Lanczos3 high-quality resampling. Large factors on big images may take a moment and produce large files.
      </p>
      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={mutation.isPending} className="self-start">
        Upscale {factor}×
      </Button>
      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && <ResultCard asset={mutation.data.asset} />}
    </div>
  );
}
