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

/**
 * The properties panel — one shell across every workspace state. Only its
 * header label and body content change between "no image yet", "analysing",
 * and "ready to edit"; the surrounding structure never moves.
 */
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
    <aside
      style={{ width: 296 }}
      className="flex shrink-0 flex-col overflow-hidden border-l border-border/50 bg-surface dark:border-border-dark/60 dark:bg-surface-dark"
    >
      {/* Panel header */}
      <div className="flex h-11 items-center gap-2 border-b border-border/50 px-4 dark:border-border-dark/40">
        {activeToolDef && <activeToolDef.icon className="h-[15px] w-[15px] shrink-0 text-accent" />}
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink dark:text-ink-dark">
          {headerLabel}
        </h3>
      </div>

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

      {/* Export section */}
      {showExport && props.state === 'ready' && props.exportAsset && (
        <div className="border-t border-border/50 px-4 py-4 dark:border-border-dark/40">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
            Export
          </p>
          <ResultCard asset={props.exportAsset} />
        </div>
      )}
    </aside>
  );
}
