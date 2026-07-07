import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { removeObject } from '@/services/editsService';
import { getImageFileUrl } from '@/services/imagesService';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Button } from '@/components/ui/Button';
import { ApiRequestError } from '@/services/apiClient';
import type { EditResult } from '@/types/edit';

const BRUSH_RADIUS = 18;
const BRUSH_COLOR = 'rgba(239, 68, 68, 0.75)';

export function ObjectRemovalTool({ imageId, onEditResult }: {
  imageId: string;
  onEditResult?: (result: EditResult) => void;
}) {
  const imageUrl = getImageFileUrl(imageId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [hasPaint, setHasPaint] = useState(false);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      const mask = maskCanvasRef.current;
      if (!mask) return;
      mask.width = img.naturalWidth;
      mask.height = img.naturalHeight;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getPoint = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (dimensions.w / rect.width),
      y: (e.clientY - rect.top) * (dimensions.h / rect.height),
    };
  }, [dimensions]);

  const paint = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting) return;
    const pt = getPoint(e);
    if (!pt) return;
    const visCtx = canvasRef.current?.getContext('2d');
    if (visCtx) {
      visCtx.fillStyle = BRUSH_COLOR;
      visCtx.beginPath();
      visCtx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
      visCtx.fill();
    }
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = '#ffffff';
      maskCtx.beginPath();
      maskCtx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
      maskCtx.fill();
    }
    setHasPaint(true);
  }, [isPainting, getPoint]);

  const clearPaint = useCallback(() => {
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    if (!canvas || !mask || !dimensions) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, dimensions.w, dimensions.h);
      ctx?.drawImage(img, 0, 0);
      mask.getContext('2d')?.clearRect(0, 0, dimensions.w, dimensions.h);
      setHasPaint(false);
      mutation.reset();
    };
    img.src = imageUrl;
  }, [dimensions, imageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: () => {
      const mask = maskCanvasRef.current;
      if (!mask) throw new Error('No mask canvas');
      return removeObject(imageId, mask.toDataURL('image/png'));
    },
    onSuccess: (result) => onEditResult?.(result),
  });

  const errorMessage = mutation.error instanceof ApiRequestError
    ? mutation.error.message
    : mutation.error ? 'Object removal failed.' : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
        Paint over the object you want to remove, then click <strong className="text-ink dark:text-ink-dark font-medium">Remove object</strong>.
      </p>

      <div className="relative w-full overflow-hidden rounded-2xl border border-border/50 dark:border-border-dark/50">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          style={{ display: 'block' }}
          onPointerDown={(e) => { setIsPainting(true); paint(e); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={paint}
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
        />
        <canvas ref={maskCanvasRef} className="hidden" />
      </div>

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
              <Button variant="secondary" onClick={clearPaint}>Clear paint</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!hasPaint && (
        <p className="text-xs text-ink-secondary/60 dark:text-ink-dark-secondary/60">Paint over something first.</p>
      )}

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => { mutation.reset(); clearPaint(); }} />}
      {mutation.isSuccess && (
        <p className="text-xs font-medium text-success">✓ Applied — see Export below to download</p>
      )}
    </div>
  );
}
