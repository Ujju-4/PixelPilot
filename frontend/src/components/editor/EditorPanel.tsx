import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { EditToolId, EditResult } from '@/types/edit';
import {
  ResizeIcon, CompressIcon, ConvertIcon, UpscaleIcon, EnhanceIcon,
  ScissorsIcon, BrushIcon, ExpandIcon, TextIcon, InfoIcon,
} from '@/components/icons/EditorIcons';
import { ResizeTool } from '@/components/editor/tools/ResizeTool';
import { CompressTool } from '@/components/editor/tools/CompressTool';
import { ConvertTool } from '@/components/editor/tools/ConvertTool';
import { UpscaleTool } from '@/components/editor/tools/UpscaleTool';
import { EnhanceTool } from '@/components/editor/tools/EnhanceTool';
import { BackgroundRemovalTool } from '@/components/editor/tools/BackgroundRemovalTool';
import { ObjectRemovalTool } from '@/components/editor/tools/ObjectRemovalTool';
import { MagicExpandTool } from '@/components/editor/tools/MagicExpandTool';
import { OcrTool } from '@/components/editor/tools/OcrTool';
import { MetadataTool } from '@/components/editor/tools/MetadataTool';

interface EditorPanelProps {
  imageId: string;
  onEditResult?: (result: EditResult) => void;
}

const TOOLS: { id: EditToolId; label: string; icon: typeof ResizeIcon }[] = [
  { id: 'remove-background', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'remove-object', label: 'Remove object', icon: BrushIcon },
  { id: 'expand', label: 'Magic Expand', icon: ExpandIcon },
  { id: 'upscale', label: 'Upscale', icon: UpscaleIcon },
  { id: 'enhance', label: 'Enhance', icon: EnhanceIcon },
  { id: 'resize', label: 'Resize', icon: ResizeIcon },
  { id: 'compress', label: 'Compress', icon: CompressIcon },
  { id: 'convert', label: 'Convert', icon: ConvertIcon },
  { id: 'ocr', label: 'Extract text', icon: TextIcon },
  { id: 'metadata', label: 'Metadata', icon: InfoIcon },
];

export function EditorPanel({ imageId, onEditResult }: EditorPanelProps) {
  const [activeTool, setActiveTool] = useState<EditToolId>('remove-background');
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/60 dark:border-border-dark/60 bg-surface dark:bg-surface-dark shadow-soft">

      {/* Tab bar — pill tabs, hidden scrollbar, gradient edge fade */}
      <div className="relative border-b border-border/50 dark:border-border-dark/50">

        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10
            bg-gradient-to-r from-surface dark:from-surface-dark to-transparent"
          aria-hidden="true"
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10
            bg-gradient-to-l from-surface dark:from-surface-dark to-transparent"
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Editing tools"
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-2 py-2"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeTool;

            return (
              <button
                key={tool.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTool(tool.id)}
                className={[
                  'relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 select-none',
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-ink-secondary hover:text-ink hover:bg-canvas dark:text-ink-dark-secondary dark:hover:text-ink-dark dark:hover:bg-canvas-dark',
                ].join(' ')}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-active-bg"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool content area */}
      <div className="p-4">
        {activeTool === 'remove-background' && <BackgroundRemovalTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'remove-object' && <ObjectRemovalTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'expand' && <MagicExpandTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'upscale' && <UpscaleTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'enhance' && <EnhanceTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'resize' && <ResizeTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'compress' && <CompressTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'convert' && <ConvertTool imageId={imageId} onEditResult={onEditResult} />}
        {activeTool === 'ocr' && <OcrTool imageId={imageId} />}
        {activeTool === 'metadata' && <MetadataTool imageId={imageId} />}
      </div>
    </div>
  );
}
