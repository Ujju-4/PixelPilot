import { FrameUploadIcon } from '@/components/icons/UploadIcons';

/** Shown in the properties panel before an image is loaded. */
export function WelcomePanel() {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle/60 ring-1 ring-black/[0.03] dark:bg-accent-subtle-dark/50 dark:ring-white/[0.04]">
        <FrameUploadIcon className="h-4 w-4 text-accent" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-semibold text-ink dark:text-ink-dark leading-snug tracking-[-0.01em]">
          Nothing loaded yet
        </h2>
        <p className="text-[13px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          Drop an image onto the canvas to unlock every tool in the sidebar.
        </p>
      </div>
    </div>
  );
}
