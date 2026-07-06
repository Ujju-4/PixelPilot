import { AlertTriangleIcon } from '@/components/icons/UploadIcons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-subtle px-3 py-2.5 text-sm text-danger"
    >
      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
