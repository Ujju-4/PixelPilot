import { useEffect, useRef, useState } from 'react';
import { ToolSidebar } from '@/components/editor/ToolSidebar';
import { ContextPanel } from '@/components/editor/ContextPanel';
import { CanvasStage } from '@/components/editor/CanvasStage';
import { UploadStage } from '@/components/upload/UploadStage';
import { UndoProvider, useUndo } from '@/contexts/UndoContext';
import { ObjectRemovalProvider } from '@/contexts/ObjectRemovalContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { getImageFileUrl } from '@/services/imagesService';
import { addEditedAssetLocal } from '@/services/localHistory';
import { ApiRequestError } from '@/services/apiClient';
import type { UploadImageResponse } from '@/types/image';
import type { EditResult, EditToolId } from '@/types/edit';

/**
 * The canvas + properties panel for the "ready" state — mounted only once an
 * image exists, so it can own the undo stack. The sidebar lives one level up
 * in HomePage, shared across every workspace state.
 */
function ReadyWorkspace({
  uploadResult,
  originalPreviewUrl,
  onReset,
  activeTool,
  onEditResultCommitted,
}: {
  uploadResult: UploadImageResponse;
  originalPreviewUrl: string;
  onReset: () => void;
  activeTool: EditToolId | null;
  onEditResultCommitted?: () => void;
}) {
  const { current, canUndo, undo, push } = useUndo();
  const { open: openPalette, registerActions, clearActions } = useCommandPalette();
  const [showComparison, setShowComparison] = useState(false);

  const activeAssetId = current?.id ?? uploadResult.asset.id;
  const currentPreviewUrl = current ? getImageFileUrl(current.id) : originalPreviewUrl;

  useKeyboardShortcuts({
    'mod+z': canUndo ? undo : undefined,
    'mod+k': openPalette,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'c' || e.key === 'C') setShowComparison((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    registerActions([
      {
        id: 'toggle-comparison',
        label: 'Toggle before/after comparison',
        description: 'Compare original and edited side by side',
        shortcut: 'C',
        onSelect: () => setShowComparison((v) => !v),
      },
      {
        id: 'undo-edit',
        label: 'Undo last edit',
        description: canUndo ? 'Revert to the previous version' : 'Nothing to undo',
        shortcut: '⌘Z',
        onSelect: undo,
      },
      {
        id: 'upload-new',
        label: 'Upload a new image',
        description: 'Start over with a different image',
        onSelect: onReset,
      },
    ]);
    return () => clearActions();
  }, [registerActions, clearActions, canUndo, undo, onReset]);

  const handleEditResult = (result: EditResult) => {
    push(result.asset);
    addEditedAssetLocal(uploadResult.asset.id, result.asset);
    setShowComparison(false);
    onEditResultCommitted?.();
  };

  return (
    <ObjectRemovalProvider>
      <CanvasStage
        originalUrl={originalPreviewUrl}
        currentUrl={currentPreviewUrl}
        currentLabel={current?.operation ?? uploadResult.asset.originalName}
        showComparison={showComparison}
        onToggleComparison={() => setShowComparison((v) => !v)}
        canUndo={canUndo}
        onUndo={undo}
        onReset={onReset}
        activeTool={activeTool}
        imageId={activeAssetId}
      />
      <ContextPanel
        state="ready"
        activeTool={activeTool}
        imageId={activeAssetId}
        onEditResult={handleEditResult}
        uploadResult={uploadResult}
        exportAsset={current}
      />
    </ObjectRemovalProvider>
  );
}

export function HomePage() {
  const { mutation, progress } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditToolId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { previewUrlRef.current = previewUrl; }, [previewUrl]);
  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, []);

  const handleFileSelected = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveTool(null);
    mutation.mutate(file);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setActiveTool(null);
    mutation.reset();
  };

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? mutation.error.message
      : mutation.error ? 'Something went wrong. Please try again.' : null;

  const isReady = mutation.isSuccess && Boolean(previewUrl);

  // The workspace shell — sidebar, canvas, properties panel — is identical
  // whether or not an image has been loaded. Only what fills the canvas and
  // panel regions changes.
  return (
    <div className="flex w-full bg-stage dark:bg-stage-dark" style={{ height: 'calc(100vh - 56px)' }}>
      <ToolSidebar
        activeTool={activeTool}
        onSelect={setActiveTool}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        disabled={!isReady}
      />

      {isReady ? (
        <UndoProvider initial={mutation.data!.asset}>
          <ReadyWorkspace
            uploadResult={mutation.data!}
            originalPreviewUrl={previewUrl!}
            onReset={handleReset}
            activeTool={activeTool}
          />
        </UndoProvider>
      ) : (
        <>
          <UploadStage
            status={mutation.isPending ? 'uploading' : mutation.isError ? 'error' : 'idle'}
            previewUrl={previewUrl}
            progress={progress}
            errorMessage={errorMessage}
            onFileSelected={handleFileSelected}
            onDismissError={handleReset}
          />
          <ContextPanel state={mutation.isPending ? 'analyzing' : 'empty'} />
        </>
      )}
    </div>
  );
}
