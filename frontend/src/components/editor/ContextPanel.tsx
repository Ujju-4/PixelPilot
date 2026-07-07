import type { EditToolId, EditResult } from '@/types/edit';
import type { ImageAsset, UploadImageResponse } from '@/types/image';
import { ToolContent, ASSET_TOOL_IDS, TOOLS } from '@/components/editor/EditorPanel';
import { OverviewPanel } from '@/components/analysis/OverviewPanel';
import { ResultCard } from '@/components/editor/ResultCard';

interface ContextPanelProps {
  activeTool: EditToolId | null;
  imageId: string;
  onEditResult: (result: EditResult) => void;
  uploadResult: UploadImageResponse;
  exportAsset: ImageAsset | null;
}

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

export function ContextPanel({ activeTool, imageId, onEditResult, uploadResult, exportAsset }: ContextPanelProps) {
  const showExport = activeTool !== null && ASSET_TOOL_IDS.includes(activeTool) && exportAsset !== null;
  const activeToolDef = activeTool ? TOOLS_BY_ID[activeTool] : null;

  return (
    <aside
      style={{ width: 296 }}
      className="flex shrink-0 flex-col border-l border-border/50 bg-surface dark:border-border-dark/60 dark:bg-surface-dark"
    >
      {/* Panel header */}
      <div className="flex h-12 items-center gap-2 border-b border-border/50 px-4 dark:border-border-dark/40">
        {activeToolDef ? (
          <>
            <activeToolDef.icon className="h-4 w-4 shrink-0 text-accent" />
            <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">{activeToolDef.label}</h3>
          </>
        ) : (
          <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Properties</h3>
        )}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTool === null ? (
          <OverviewPanel result={uploadResult} />
        ) : (
          <ToolContent activeTool={activeTool} imageId={imageId} onEditResult={onEditResult} />
        )}
      </div>

      {/* Export section */}
      {showExport && exportAsset && (
        <div className="border-t border-border/50 px-4 py-4 dark:border-border-dark/40">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
            Export
          </p>
          <ResultCard asset={exportAsset} />
        </div>
      )}
    </aside>
  );
}
