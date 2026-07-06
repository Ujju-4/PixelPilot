import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { convertImage } from '@/services/editsService';
import type { OutputFormat, EditResult } from '@/types/edit';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Button } from '@/components/ui/Button';
import { ResultCard } from '@/components/editor/ResultCard';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ApiRequestError } from '@/services/apiClient';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WEBP' }, { value: 'avif', label: 'AVIF' },
];

export function ConvertTool({ imageId, onEditResult }: { imageId: string; onEditResult?: (r: EditResult) => void }) {
  const [format, setFormat] = useState<OutputFormat>('webp');
  const mutation = useMutation({
    mutationFn: () => convertImage(imageId, format),
    onSuccess: (r) => onEditResult?.(r),
  });
  const errorMessage = mutation.error instanceof ApiRequestError ? mutation.error.message : mutation.error ? 'Conversion failed.' : null;
  return (
    <div className="flex flex-col gap-4">
      <OptionGroup label="Convert to" value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={mutation.isPending} className="self-start">
        Convert
      </Button>
      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}
      {mutation.isSuccess && <ResultCard asset={mutation.data.asset} />}
    </div>
  );
}
