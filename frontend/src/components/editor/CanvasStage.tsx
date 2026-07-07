import { AnimatePresence, motion } from 'framer-motion';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';

interface CanvasStageProps {
  originalUrl: string;
  currentUrl: string;
  currentLabel: string;
  showComparison: boolean;
  onToggleComparison: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
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
}: CanvasStageProps) {
  // Strip UUID-style names — show clean label
  const displayLabel = (() => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(currentLabel)) return 'Image';
    return currentLabel;
  })();

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#111113] dark:bg-[#0A0A0C]">
      {/* Slim toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/80 truncate max-w-[180px]">{displayLabel}</span>
          {canUndo && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">
              edited
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {canUndo && (
            <button
              type="button"
              onClick={onToggleComparison}
              className={[
                'rounded px-2.5 py-1 text-xs font-medium transition-all duration-150',
                showComparison
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5',
              ].join(' ')}
            >
              {showComparison ? 'Close compare' : 'Compare'}
            </button>
          )}
          {canUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="rounded px-2.5 py-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors hover:bg-accent/10"
            >
              ↩ Undo
            </button>
          )}
          <div className="mx-1 h-3 w-px bg-white/10" />
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white/80 hover:border-white/20"
          >
            New image
          </button>
        </div>
      </div>

      {/* Canvas surface — dark with subtle dot grid */}
      <div className="canvas-grid flex flex-1 min-h-0 items-center justify-center p-8">
        <div className="w-full h-full max-w-4xl flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {showComparison ? (
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
                  className="w-full max-h-[calc(100vh-160px)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
