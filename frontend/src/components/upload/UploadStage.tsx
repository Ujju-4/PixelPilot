import { CanvasFrame } from '@/components/editor/CanvasFrame';
import { Dropzone } from '@/components/upload/Dropzone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export type UploadStageStatus = 'idle' | 'uploading' | 'error';

interface UploadStageProps {
  status: UploadStageStatus;
  previewUrl: string | null;
  progress: number;
  errorMessage: string | null;
  onFileSelected: (file: File) => void;
  onDismissError: () => void;
}

/**
 * The canvas region before an image is ready. Same CanvasFrame shell as the
 * post-upload CanvasStage — only the toolbar label and center content differ
 * — so there's no layout jump the moment upload succeeds.
 */
export function UploadStage({ status, previewUrl, progress, errorMessage, onFileSelected, onDismissError }: UploadStageProps) {
  return (
    <CanvasFrame>
      <div className="flex w-full flex-col items-center gap-4" style={{ maxWidth: 620 }}>
        {status === 'uploading' ? (
          <div className="flex w-full flex-col items-center gap-5">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-56 rounded-lg object-contain opacity-60 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              />
            )}
            <div className="w-full max-w-xs">
              <ProgressBar
                percent={progress}
                label={progress < 100 ? 'Uploading…' : 'Analysing image…'}
              />
            </div>
          </div>
        ) : (
          <>
            <Dropzone onFileSelected={onFileSelected} tone="canvas" />
            {status === 'error' && errorMessage && (
              <div className="w-full">
                <ErrorBanner message={errorMessage} onDismiss={onDismissError} />
              </div>
            )}
          </>
        )}
      </div>
    </CanvasFrame>
  );
}
