import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { magicExpand } from '@/services/editsService';
import type { MagicExpandOptions, EditResult } from '@/types/edit';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ApiRequestError } from '@/services/apiClient';

const PRESETS: { label: string; options: MagicExpandOptions }[] = [
  { label: '+150 all sides', options: { top: 150, right: 150, bottom: 150, left: 150 } },
  { label: '+200 left & right', options: { top: 0, right: 200, bottom: 0, left: 200 } },
  { label: '+200 top & bottom', options: { top: 200, right: 0, bottom: 200, left: 0 } },
  { label: '+300 bottom only', options: { top: 0, right: 0, bottom: 300, left: 0 } },
];

const CUSTOM_VALUE = '__custom__';

// Scales a px amount (0–2000) down to a small preview offset so the preview
// box never overflows its container, regardless of the real input value.
function previewOffset(amount: number): number {
  return 6 + Math.min(1, amount / 2000) * 34;
}

export function MagicExpandTool({ imageId, onEditResult }: {
  imageId: string;
  onEditResult?: (result: EditResult) => void;
}) {
  const [options, setOptions] = useState<MagicExpandOptions>({ top: 150, right: 150, bottom: 150, left: 150 });

  const mutation = useMutation({
    mutationFn: () => magicExpand(imageId, options),
    onSuccess: (r) => onEditResult?.(r),
  });

  const hasAmount = options.top + options.right + options.bottom + options.left > 0;
  const set = (side: keyof MagicExpandOptions, v: number) =>
    setOptions((p) => ({ ...p, [side]: Math.max(0, Math.min(2000, v)) }));

  const matchedPreset = PRESETS.find(
    (p) =>
      p.options.top === options.top &&
      p.options.right === options.right &&
      p.options.bottom === options.bottom &&
      p.options.left === options.left,
  );

  const errorMessage = mutation.error instanceof ApiRequestError
    ? mutation.error.message
    : mutation.error ? 'Magic Expand failed.' : null;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] leading-snug text-ink-secondary dark:text-ink-dark-secondary">
        Extends the canvas outward and fills the new area using content-aware inpainting.
      </p>

      {/* Preset dropdown */}
      <Select
        label="Preset"
        value={matchedPreset ? matchedPreset.label : CUSTOM_VALUE}
        onChange={(e) => {
          const preset = PRESETS.find((p) => p.label === e.target.value);
          if (preset) {
            setOptions(preset.options);
            mutation.reset();
          }
        }}
      >
        {!matchedPreset && <option value={CUSTOM_VALUE}>Custom</option>}
        {PRESETS.map((p) => (
          <option key={p.label} value={p.label}>{p.label}</option>
        ))}
      </Select>

      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border/60 dark:bg-border-dark/50" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">or</span>
        <div className="h-px flex-1 bg-border/60 dark:bg-border-dark/50" />
      </div>

      {/* Custom values grid */}
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Custom values (px)
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="Top" type="number" min={0} max={2000} step={50} value={options.top} onChange={(e) => set('top', Number(e.target.value))} />
          <Input label="Right" type="number" min={0} max={2000} step={50} value={options.right} onChange={(e) => set('right', Number(e.target.value))} />
          <Input label="Bottom" type="number" min={0} max={2000} step={50} value={options.bottom} onChange={(e) => set('bottom', Number(e.target.value))} />
          <Input label="Left" type="number" min={0} max={2000} step={50} value={options.left} onChange={(e) => set('left', Number(e.target.value))} />
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Preview
        </p>
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-dashed border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark">
          <div
            className="absolute flex items-center justify-center rounded-md border border-border/70 bg-surface text-[10px] font-medium text-ink-tertiary dark:border-border-dark/70 dark:bg-surface-dark dark:text-ink-dark-tertiary"
            style={{
              top: previewOffset(options.top),
              right: previewOffset(options.right),
              bottom: previewOffset(options.bottom),
              left: previewOffset(options.left),
              transition: 'all 150ms ease-out',
            }}
          >
            Original
          </div>
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={mutation.isPending || !hasAmount}
        className="self-start"
      >
        {mutation.isPending ? 'Expanding…' : 'Expand canvas'}
      </Button>

      {!hasAmount && (
        <p className="text-xs text-ink-secondary/60 dark:text-ink-dark-secondary/60">At least one side must be greater than 0.</p>
      )}

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && (
        <p className="text-xs font-medium text-success">✓ Applied — see Export below to download</p>
      )}
    </div>
  );
}
