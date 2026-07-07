import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { magicExpand } from '@/services/editsService';
import type { MagicExpandOptions, EditResult } from '@/types/edit';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ApiRequestError } from '@/services/apiClient';

const PRESETS: { label: string; options: MagicExpandOptions }[] = [
  { label: 'All sides +150', options: { top: 150, right: 150, bottom: 150, left: 150 } },
  { label: 'Left & Right +200', options: { top: 0, right: 200, bottom: 0, left: 200 } },
  { label: 'Top & Bottom +200', options: { top: 200, right: 0, bottom: 200, left: 0 } },
  { label: 'Bottom +300', options: { top: 0, right: 0, bottom: 300, left: 0 } },
];

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

  const errorMessage = mutation.error instanceof ApiRequestError
    ? mutation.error.message
    : mutation.error ? 'Magic Expand failed.' : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
        Extends the canvas outward and fills the new area using content-aware inpainting.
      </p>

      {/* Quick presets */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary dark:text-ink-dark-secondary">Quick presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setOptions(p.options); mutation.reset(); }}
              className="rounded-full border border-border/60 dark:border-border-dark/60 bg-canvas dark:bg-canvas-dark px-3 py-1 text-xs font-medium transition-colors hover:border-border dark:hover:border-border-dark"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cross layout */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary dark:text-ink-dark-secondary">Custom amounts (px)</p>
        <div className="flex flex-col items-center gap-2">
          <div className="w-24">
            <Input type="number" min={0} max={2000} step={50} value={options.top} onChange={(e) => set('top', Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <Input type="number" min={0} max={2000} step={50} value={options.left} onChange={(e) => set('left', Number(e.target.value))} />
            </div>
            <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-dashed border-border/50 dark:border-border-dark/50">
              <span className="text-xs text-ink-secondary dark:text-ink-dark-secondary">img</span>
            </div>
            <div className="w-24">
              <Input type="number" min={0} max={2000} step={50} value={options.right} onChange={(e) => set('right', Number(e.target.value))} />
            </div>
          </div>
          <div className="w-24">
            <Input type="number" min={0} max={2000} step={50} value={options.bottom} onChange={(e) => set('bottom', Number(e.target.value))} />
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
