import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropzone } from '@/components/upload/Dropzone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnalysisSkeleton } from '@/components/analysis/AnalysisSkeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ToolSidebar } from '@/components/editor/ToolSidebar';
import { ContextPanel } from '@/components/editor/ContextPanel';
import { CanvasStage } from '@/components/editor/CanvasStage';
import { UndoProvider, useUndo } from '@/contexts/UndoContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { getImageFileUrl } from '@/services/imagesService';
import { addEditedAssetLocal } from '@/services/localHistory';
import { ApiRequestError } from '@/services/apiClient';
import type { UploadImageResponse } from '@/types/image';
import type { EditResult, EditToolId } from '@/types/edit';

function EditorWorkspace({ uploadResult, originalPreviewUrl, onReset }: {
  uploadResult: UploadImageResponse;
  originalPreviewUrl: string;
  onReset: () => void;
}) {
  const { current, canUndo, undo, push } = useUndo();
  const { open: openPalette, registerActions, clearActions } = useCommandPalette();
  const [showComparison, setShowComparison] = useState(false);
  const [activeTool, setActiveTool] = useState<EditToolId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    addEditedAssetLocal(
      uploadResult.asset.id,
      result.asset,
    );

    setShowComparison(false);
  };

  return (
    <div className="flex w-full" style={{ height: 'calc(100vh - 44px)' }}>
      <ToolSidebar
        activeTool={activeTool}
        onSelect={setActiveTool}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />

      <CanvasStage
        originalUrl={originalPreviewUrl}
        currentUrl={currentPreviewUrl}
        currentLabel={current?.operation ?? uploadResult.asset.originalName}
        showComparison={showComparison}
        onToggleComparison={() => setShowComparison((v) => !v)}
        canUndo={canUndo}
        onUndo={undo}
        onReset={onReset}
      />

      <ContextPanel
        activeTool={activeTool}
        imageId={activeAssetId}
        onEditResult={handleEditResult}
        uploadResult={uploadResult}
        exportAsset={current}
      />
    </div>
  );
}

export function HomePage() {
  const { mutation, progress } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => { previewUrlRef.current = previewUrl; }, [previewUrl]);
  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, []);

  const handleFileSelected = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    mutation.mutate(file);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    mutation.reset();
  };

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? mutation.error.message
      : mutation.error ? 'Something went wrong. Please try again.' : null;

  // Post-upload: full-bleed 3-column editor workspace, no page padding/max-width.
  if (mutation.isSuccess && previewUrl) {
    return (
      <UndoProvider initial={mutation.data.asset}>
        <EditorWorkspace
          uploadResult={mutation.data}
          originalPreviewUrl={previewUrl}
          onReset={handleReset}
        />
      </UndoProvider>
    );
  }

  // Pre-upload: centered hero + dropzone.
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-8">
      {/* Hero — only shown before upload */}
      <AnimatePresence>
        {!mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 flex flex-col items-center text-center"
          >
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-[32px]">
              Transform any image
              <br />
              <span className="text-ink-secondary dark:text-ink-dark-secondary">in seconds with AI.</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-ink-secondary dark:text-ink-dark-secondary">
              Upload an image. PixelPilot AI analyses it and recommends
              the right edits — no guesswork, no wall of buttons.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      <div className="w-full max-w-lg">
        {!mutation.isPending && (
          <Dropzone onFileSelected={handleFileSelected} />
        )}

        {mutation.isPending && (
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark p-5">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="mx-auto max-h-40 rounded-xl border border-border/40 dark:border-border-dark/40 object-contain"
              />
            )}
            <ProgressBar
              percent={progress}
              label={progress < 100 ? 'Uploading…' : 'Analysing image…'}
            />
          </div>
        )}

        {errorMessage && (
          <ErrorBanner message={errorMessage} onDismiss={handleReset} />
        )}
      </div>

      {/* Skeleton while analysing */}
      {mutation.isPending && (
        <div className="mt-6 w-full max-w-4xl">
          <AnalysisSkeleton />
        </div>
      )}
    </div>
  );
}
