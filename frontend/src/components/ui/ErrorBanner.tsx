import { AlertTriangleIcon } from '@/components/icons/UploadIcons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded border border-danger/15 bg-danger-subtle px-2.5 py-2 text-xs text-danger"
    >
      <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
