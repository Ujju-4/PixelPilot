import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { enhanceImage } from '@/services/editsService';
import type { EnhanceOptions, EditResult } from '@/types/edit';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { StatusLine } from '@/components/ui/StatusLine';
import { ApiRequestError } from '@/services/apiClient';

const DEFAULT_OPTIONS: EnhanceOptions = {
  sharpen: true, denoise: false, colorCorrect: false,
  lighting: true, contrast: true, whiteBalance: false,
};

const TOGGLES: { key: keyof EnhanceOptions; label: string; description: string }[] = [
  { key: 'sharpen', label: 'Sharpen', description: 'Recover edge detail on soft or blurry images.' },
  { key: 'denoise', label: 'Denoise', description: 'Smooth out grain and sensor noise.' },
  { key: 'lighting', label: 'Lighting correction', description: 'Brighten dark images, reduce blown-out highlights.' },
  { key: 'contrast', label: 'Contrast boost', description: 'Stretch tones across the full dynamic range.' },
  { key: 'colorCorrect', label: 'Color correction', description: 'Boost saturation for more vivid results.' },
  { key: 'whiteBalance', label: 'White balance', description: 'Neutralise a colour cast using gray-world correction.' },
];

export function EnhanceTool({ imageId, onEditResult }: { imageId: string; onEditResult?: (r: EditResult) => void }) {
  const [options, setOptions] = useState<EnhanceOptions>(DEFAULT_OPTIONS);
  const mutation = useMutation({
    mutationFn: () => enhanceImage(imageId, options),
    onSuccess: (r) => onEditResult?.(r),
  });
  const hasAny = Object.values(options).some(Boolean);
  const errorMessage = mutation.error instanceof ApiRequestError ? mutation.error.message : mutation.error ? 'Enhancement failed.' : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {TOGGLES.map((t) => (
          <ToggleRow
            key={t.key}
            label={t.label}
            description={t.description}
            checked={options[t.key]}
            onChange={(v) => setOptions((p) => ({ ...p, [t.key]: v }))}
          />
        ))}
      </div>
      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={mutation.isPending || !hasAny}
        className="self-start"
      >
        Apply enhancements
      </Button>
      {!hasAny && <p className="text-xs text-ink-secondary/60 dark:text-ink-dark-secondary/60">Select at least one enhancement.</p>}
      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && (
        <StatusLine tone="success">Applied — see Export below to download</StatusLine>
      )}
    </div>
  );
}
