import { AlertTriangleIcon } from '@/components/icons/UploadIcons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

// A left accent bar, not a filled/bordered box — same visual language as
// RecommendationCard, so "something needs attention" reads consistently
// everywhere in the app.
export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 border-l-2 border-danger bg-danger/[0.04] py-1.5 pl-2.5 pr-2 text-xs text-danger dark:bg-danger/[0.07]"
    >
      <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="flex-1 leading-snug break-words">{message}</p>
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
