import { AnimatePresence, motion } from 'framer-motion';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { CanvasFrame } from '@/components/editor/CanvasFrame';
import { ObjectRemovalCanvas } from '@/components/editor/tools/ObjectRemovalCanvas';
import type { EditToolId } from '@/types/edit';

interface CanvasStageProps {
  originalUrl: string;
  currentUrl: string;
  currentLabel: string;
  showComparison: boolean;
  onToggleComparison: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  activeTool?: EditToolId | null;
  imageId?: string;
}

export function CanvasStage({
  originalUrl,
  currentUrl,
  currentLabel,
  showComparison,
  onToggleComparison,
  canUndo,
  onUndo,
  onReset,
  activeTool,
  imageId,
}: CanvasStageProps) {
  const displayLabel = (() => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(currentLabel)) return 'Image';
    return currentLabel;
  })();

  const isRemovingObject = activeTool === 'remove-object' && Boolean(imageId);

  return (
    <CanvasFrame
      topBar={
        <>
          <div className="flex items-center gap-2 min-w-0">
            {/* Filename label — ink on light canvas, white on dark canvas */}
            <span className="text-xs font-medium text-ink/70 dark:text-white/80 truncate max-w-[180px]">
              {displayLabel}
            </span>
            {canUndo && (
              <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-ink-secondary dark:text-white/40">
                edited
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canUndo && !isRemovingObject && (
              <button
                type="button"
                onClick={onToggleComparison}
                className={[
                  'rounded px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  showComparison
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-ink-secondary dark:text-white/50 hover:text-ink dark:hover:text-white/80 hover:bg-black/[0.04] dark:hover:bg-white/5',
                ].join(' ')}
              >
                {showComparison ? 'Close compare' : 'Compare'}
              </button>
            )}
            {canUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="rounded px-2.5 py-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors hover:bg-accent/10"
              >
                ↩ Undo
              </button>
            )}
            {/* Divider */}
            <div className="mx-1 h-3 w-px bg-black/10 dark:bg-white/10" />
            <button
              type="button"
              onClick={onReset}
              className="rounded border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-ink-secondary dark:text-white/50 transition-all hover:bg-black/[0.07] dark:hover:bg-white/10 hover:text-ink dark:hover:text-white/80 hover:border-black/20 dark:hover:border-white/20"
            >
              New image
            </button>
          </div>
        </>
      }
    >
      <div className="w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isRemovingObject ? (
            <motion.div
              key="remove-object"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center"
            >
              <ObjectRemovalCanvas imageId={imageId!} />
            </motion.div>
          ) : showComparison ? (
            <motion.div
              key="compare"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <BeforeAfterSlider
                beforeUrl={originalUrl}
                afterUrl={currentUrl}
                beforeLabel="Original"
                afterLabel={displayLabel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="single"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full h-full flex items-center justify-center"
            >
              <ImageViewer
                src={currentUrl}
                alt={displayLabel}
                className="w-full max-h-[calc(100vh-112px)]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CanvasFrame>
  );
}
