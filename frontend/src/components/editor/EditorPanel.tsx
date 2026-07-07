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

export interface ToolDef {
  id: EditToolId;
  label: string;
  icon: typeof ResizeIcon;
}

export const TOOLS: ToolDef[] = [
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

// Groups tool ids for the sidebar. Purely presentational — doesn't affect the TOOLS list above.
export const TOOL_CATEGORIES: { label: string; ids: EditToolId[] }[] = [
  { label: 'AI Tools', ids: ['remove-background', 'remove-object', 'expand', 'upscale', 'enhance'] },
  { label: 'Adjust', ids: ['resize', 'compress', 'convert'] },
  { label: 'Info', ids: ['ocr', 'metadata'] },
];

// Tools that produce a new image asset (and therefore have a shared Export block after them).
// OCR and Metadata just display extracted info, so they're excluded.
export const ASSET_TOOL_IDS: EditToolId[] = [
  'remove-background', 'remove-object', 'expand', 'upscale', 'enhance', 'resize', 'compress', 'convert',
];

interface ToolContentProps {
  activeTool: EditToolId;
  imageId: string;
  onEditResult?: (result: EditResult) => void;
}

/** Renders the settings/controls for whichever tool is currently active. */
export function ToolContent({ activeTool, imageId, onEditResult }: ToolContentProps) {
  switch (activeTool) {
    case 'remove-background':
      return <BackgroundRemovalTool imageId={imageId} onEditResult={onEditResult} />;
    case 'remove-object':
      return <ObjectRemovalTool imageId={imageId} onEditResult={onEditResult} />;
    case 'expand':
      return <MagicExpandTool imageId={imageId} onEditResult={onEditResult} />;
    case 'upscale':
      return <UpscaleTool imageId={imageId} onEditResult={onEditResult} />;
    case 'enhance':
      return <EnhanceTool imageId={imageId} onEditResult={onEditResult} />;
    case 'resize':
      return <ResizeTool imageId={imageId} onEditResult={onEditResult} />;
    case 'compress':
      return <CompressTool imageId={imageId} onEditResult={onEditResult} />;
    case 'convert':
      return <ConvertTool imageId={imageId} onEditResult={onEditResult} />;
    case 'ocr':
      return <OcrTool imageId={imageId} />;
    case 'metadata':
      return <MetadataTool imageId={imageId} />;
    default:
      return null;
  }
}
