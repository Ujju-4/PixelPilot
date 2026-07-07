import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { removeBackground } from '@/services/editsService';
import type { BackgroundMode, EditResult } from '@/types/edit';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ApiRequestError } from '@/services/apiClient';

const MODE_OPTIONS: { value: BackgroundMode; label: string }[] = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'white', label: 'White' },
  { value: 'color', label: 'Solid color' },
  { value: 'gradient', label: 'Gradient' },
];

export function BackgroundRemovalTool({ imageId, onEditResult }: {
  imageId: string;
  onEditResult?: (r: EditResult) => void;
}) {
  const [mode, setMode] = useState<BackgroundMode>('transparent');
  const [color, setColor] = useState('#6D5BD0');
  const [gradientFrom, setGradientFrom] = useState('#6D5BD0');
  const [gradientTo, setGradientTo] = useState('#FAFAF9');

  const mutation = useMutation({
    mutationFn: () => removeBackground(imageId, {
      mode,
      color: mode === 'color' ? color : undefined,
      gradientFrom: mode === 'gradient' ? gradientFrom : undefined,
      gradientTo: mode === 'gradient' ? gradientTo : undefined,
    }),
    onSuccess: (r) => onEditResult?.(r),
  });

  const errorMessage = mutation.error instanceof ApiRequestError
    ? mutation.error.message
    : mutation.error ? 'Background removal failed.' : null;

  return (
    <div className="flex flex-col gap-4">
      <OptionGroup label="New background" value={mode} onChange={setMode} options={MODE_OPTIONS} />

      {mode === 'color' && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-xl border border-border/60 dark:border-border-dark/60 bg-canvas dark:bg-canvas-dark p-1"
          />
          <span className="font-mono text-sm text-ink-secondary dark:text-ink-dark-secondary">{color}</span>
        </div>
      )}

      {mode === 'gradient' && (
        <div className="flex items-center gap-4">
          {[
            { label: 'From', val: gradientFrom, set: setGradientFrom },
            { label: 'To', val: gradientTo, set: setGradientTo },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary">{label}</span>
              <input
                type="color"
                value={val}
                onChange={(e) => set(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-border/60 dark:border-border-dark/60 bg-canvas dark:bg-canvas-dark p-0.5"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-secondary/70 dark:text-ink-dark-secondary/70">
        Uses GrabCut segmentation. Works best when the subject is roughly centred. This can take a few seconds.
      </p>

      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        className="self-start"
      >
        {mutation.isPending ? 'Removing background…' : 'Remove background'}
      </Button>

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && (
        <p className="text-xs font-medium text-success">✓ Applied — see Export below to download</p>
      )}
    </div>
  );
}
