import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropzone } from '@/components/upload/Dropzone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnalysisSkeleton } from '@/components/analysis/AnalysisSkeleton';
import { AnalysisResultsPanel } from '@/components/analysis/AnalysisResultsPanel';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { UndoProvider, useUndo } from '@/contexts/UndoContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { getImageFileUrl } from '@/services/imagesService';
import { ApiRequestError } from '@/services/apiClient';
import type { UploadImageResponse } from '@/types/image';
import type { EditResult } from '@/types/edit';

function EditorWorkspace({ uploadResult, originalPreviewUrl, onReset }: {
  uploadResult: UploadImageResponse;
  originalPreviewUrl: string;
  onReset: () => void;
}) {
  const { current, canUndo, undo, push } = useUndo();
  const { open: openPalette, registerActions, clearActions } = useCommandPalette();
  const [showComparison, setShowComparison] = useState(false);

  const activeAssetId = current?.id ?? uploadResult.asset.id;
  const editedPreviewUrl = current ? getImageFileUrl(current.id) : null;

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
    setShowComparison(false);
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <AnalysisResultsPanel result={uploadResult} previewUrl={originalPreviewUrl} />

      {/* Undo bar */}
      <AnimatePresence>
        {canUndo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-2xl border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark px-4 py-2.5">
              <p className="text-sm">
                <span className="font-semibold">{current?.operation ?? 'edit'}</span>
                <span className="ml-1 text-ink-secondary dark:text-ink-dark-secondary">applied</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowComparison((v) => !v)}
                  className="text-sm text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
                >
                  {showComparison ? 'Hide comparison' : 'Compare'}
                </button>
                <button
                  type="button"
                  onClick={undo}
                  className="text-sm font-medium text-accent hover:opacity-75 transition-opacity"
                >
                  ⌘Z Undo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before/After slider */}
      <AnimatePresence>
        {showComparison && editedPreviewUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BeforeAfterSlider
              beforeUrl={originalPreviewUrl}
              afterUrl={editedPreviewUrl}
              beforeLabel="Original"
              afterLabel={current?.operation ?? 'Edited'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <EditorPanel imageId={activeAssetId} onEditResult={handleEditResult} />

      <div className="flex items-center justify-end text-xs text-ink-secondary/60 dark:text-ink-dark-secondary/60">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-border/50 dark:border-border-dark/50 px-3 py-1 transition-colors hover:border-border dark:hover:border-border-dark"
        >
          Upload new image
        </button>
      </div>
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

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-12">
      {/* Hero — only shown before upload */}
      <AnimatePresence>
        {!mutation.isSuccess && !mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 flex flex-col items-center text-center"
          >
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Transform any image
              <br />
              <span className="text-ink-secondary dark:text-ink-dark-secondary">in seconds with AI.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-secondary dark:text-ink-dark-secondary">
              Upload an image. PixelPilot AI analyses it and recommends
              the right edits — no guesswork, no wall of buttons.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      <div className="w-full max-w-lg">
        {!mutation.isPending && !mutation.isSuccess && (
          <Dropzone onFileSelected={handleFileSelected} />
        )}

        {mutation.isPending && (
          <div className="flex flex-col gap-4 rounded-2xl border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark p-6">
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

      {/* Results + editor */}
      {mutation.isSuccess && previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6 flex w-full max-w-4xl flex-col items-center gap-4"
        >
          <UndoProvider initial={mutation.data.asset}>
            <EditorWorkspace
              uploadResult={mutation.data}
              originalPreviewUrl={previewUrl}
              onReset={handleReset}
            />
          </UndoProvider>
        </motion.div>
      )}
    </div>
  );
}
