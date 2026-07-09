import { motion, AnimatePresence } from 'framer-motion';
import type { EditToolId, EditResult } from '@/types/edit';
import type { ImageAsset, UploadImageResponse } from '@/types/image';
import { ToolContent, ASSET_TOOL_IDS, TOOLS } from '@/components/editor/EditorPanel';
import { OverviewPanel } from '@/components/analysis/OverviewPanel';
import { ResultCard } from '@/components/editor/ResultCard';
import { WelcomePanel } from '@/components/analysis/WelcomePanel';
import { AnalysisSkeleton } from '@/components/analysis/AnalysisSkeleton';

type ContextPanelProps =
  | { state: 'empty' }
  | { state: 'analyzing' }
  | {
      state: 'ready';
      activeTool: EditToolId | null;
      imageId: string;
      onEditResult: (result: EditResult) => void;
      uploadResult: UploadImageResponse;
      exportAsset: ImageAsset | null;
    };

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

// Light: solid white + ambient shadow
// Dark: glass float — semi-transparent + blur + inner shimmer + deep drop
const PANEL_BASE = [
  'm-2 flex shrink-0 flex-col overflow-hidden rounded-2xl',
  'border border-border bg-surface shadow-ambient',
  'dark:border-white/[0.075] dark:bg-surface-dark/80 dark:backdrop-blur-glass dark:shadow-glass-panel',
].join(' ');

export function ContextPanel(props: ContextPanelProps) {
  const activeToolDef = props.state === 'ready' && props.activeTool ? TOOLS_BY_ID[props.activeTool] : null;

  const showExport =
    props.state === 'ready' &&
    props.activeTool !== null &&
    ASSET_TOOL_IDS.includes(props.activeTool) &&
    props.exportAsset !== null;

  const headerLabel =
    props.state === 'empty' ? 'Welcome'
    : props.state === 'analyzing' ? 'Analysing'
    : activeToolDef ? activeToolDef.label
    : 'Properties';

  return (
    <motion.aside
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
      style={{ width: 264 }}
      className={PANEL_BASE}
    >
      {/* Panel header — hidden in empty state */}
      {props.state !== 'empty' && (
        <div className="flex h-11 items-center gap-2 border-b border-border/50 px-4 dark:border-white/[0.06]">
          <AnimatePresence mode="wait" initial={false}>
            {activeToolDef && (
              <motion.span
                key={activeToolDef.id + '-icon'}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex shrink-0 items-center"
              >
                <activeToolDef.icon className="h-[15px] w-[15px] text-accent" />
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={headerLabel}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-[12px] font-semibold uppercase tracking-wide text-ink dark:text-ink-dark"
            >
              {headerLabel}
            </motion.h3>
          </AnimatePresence>
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5">
        {props.state === 'empty' && <WelcomePanel />}
        {props.state === 'analyzing' && <AnalysisSkeleton />}
        {props.state === 'ready' && props.activeTool === null && (
          <OverviewPanel result={props.uploadResult} />
        )}
        {props.state === 'ready' && props.activeTool !== null && (
          <ToolContent activeTool={props.activeTool} imageId={props.imageId} onEditResult={props.onEditResult} />
        )}
      </div>

      {/* Export section — animates height in/out */}
      <AnimatePresence initial={false}>
        {showExport && props.state === 'ready' && props.exportAsset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-border/50 dark:border-white/[0.06]"
          >
            <div className="px-4 py-4">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
                Export
              </p>
              <ResultCard asset={props.exportAsset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
