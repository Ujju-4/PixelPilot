import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { removeObject } from '@/services/editsService';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { StatusLine } from '@/components/ui/StatusLine';
import { Button } from '@/components/ui/Button';
import { ApiRequestError } from '@/services/apiClient';
import { useObjectRemoval } from '@/contexts/ObjectRemovalContext';
import type { EditResult } from '@/types/edit';

export function ObjectRemovalTool({
  imageId,
  onEditResult,
}: {
  imageId: string;
  onEditResult?: (result: EditResult) => void;
}) {
  const { maskCanvasRef, hasPaint, triggerClear } = useObjectRemoval();

  const mutation = useMutation({
    mutationFn: () => {
      const mask = maskCanvasRef.current;
      if (!mask) throw new Error('No mask canvas');
      return removeObject(imageId, mask.toDataURL('image/png'));
    },
    onSuccess: (result) => {
      triggerClear();
      onEditResult?.(result);
    },
  });

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? mutation.error.message
      : mutation.error
      ? 'Object removal failed.'
      : null;

  const handleClear = () => {
    triggerClear();
    mutation.reset();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
        Paint over the object on the canvas, then remove it.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={mutation.isPending || !hasPaint}
        >
          {mutation.isPending ? 'Removing…' : 'Remove object'}
        </Button>

        <AnimatePresence>
          {hasPaint && !mutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button variant="secondary" onClick={handleClear}>
                Clear paint
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!hasPaint && !mutation.isSuccess && (
        <p className="text-xs text-ink-secondary/50 dark:text-ink-dark-secondary/50">
          Paint over something on the canvas first.
        </p>
      )}

      {errorMessage && (
        <ErrorBanner message={errorMessage} onDismiss={() => { mutation.reset(); handleClear(); }} />
      )}
      {mutation.isSuccess && (
        <StatusLine tone="success">Applied — see Export below to download</StatusLine>
      )}
    </div>
  );
}
