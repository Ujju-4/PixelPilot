import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchResizePresets, resizeImage } from '@/services/editsService';
import type { ResizeFit, EditResult } from '@/types/edit';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { StatusLine } from '@/components/ui/StatusLine';
import { ApiRequestError } from '@/services/apiClient';

const FIT_OPTIONS: { value: ResizeFit; label: string }[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Stretch' },
];

export function ResizeTool({ imageId, onEditResult }: { imageId: string; onEditResult?: (r: EditResult) => void }) {
  const { data: presets } = useQuery({ queryKey: ['resize-presets'], queryFn: fetchResizePresets });
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [presetId, setPresetId] = useState('instagram-square');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [fit, setFit] = useState<ResizeFit>('cover');

  const mutation = useMutation({
    mutationFn: () =>
      mode === 'preset'
        ? resizeImage(imageId, { presetId, fit })
        : resizeImage(imageId, { width: customWidth, height: customHeight, fit }),
    onSuccess: (result) => onEditResult?.(result),
  });

  const errorMessage =
    mutation.error instanceof ApiRequestError ? mutation.error.message : mutation.error ? 'Resize failed.' : null;

  return (
    <div className="flex flex-col gap-4">
      <OptionGroup
        label="Source"
        value={mode}
        onChange={setMode}
        options={[{ value: 'preset', label: 'Platform preset' }, { value: 'custom', label: 'Custom dimensions' }]}
      />

      {mode === 'preset' ? (
        <Select label="Preset" value={presetId} onChange={(e) => setPresetId(e.target.value)}>
          {presets?.map((p) => (
            <option key={p.id} value={p.id}>{p.label} — {p.width}×{p.height}</option>
          ))}
        </Select>
      ) : (
        <div className="flex gap-3">
          <Input
            label="Width (px)"
            type="number"
            min={1}
            max={8000}
            value={customWidth}
            onChange={(e) => setCustomWidth(Number(e.target.value))}
          />
          <Input
            label="Height (px)"
            type="number"
            min={1}
            max={8000}
            value={customHeight}
            onChange={(e) => setCustomHeight(Number(e.target.value))}
          />
        </div>
      )}

      <OptionGroup label="Fit mode" value={fit} onChange={setFit} options={FIT_OPTIONS} />

      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        className="self-start"
      >
        Apply resize
      </Button>

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && (
        <StatusLine tone="success">Applied — see Export below to download</StatusLine>
      )}
    </div>
  );
}
